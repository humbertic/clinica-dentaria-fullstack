from fastapi import APIRouter, Depends, HTTPException, Response, status, Query
from sqlalchemy.orm import Session, selectinload
from typing import List, Optional
from datetime import date

from src.database import SessionLocal
from src.utilizadores.dependencies import get_current_user
from src.utilizadores.models import Utilizador
from src.email.service import EmailManager
from src.email.util import get_email_config

from . import service, schemas
from .models import Marcacao

router = APIRouter(
    prefix="/marcacoes",
    tags=["Marcações"],
    responses={404: {"description": "Não encontrado"}},
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post(
    "",
    response_model=schemas.MarcacaoRead,
    status_code=status.HTTP_201_CREATED,
    summary="Agendar nova consulta",
)
def criar_marcacao(
    payload: schemas.MarcacaoCreate,
    db: Session = Depends(get_db),
    utilizador_atual: Utilizador = Depends(get_current_user),
):
    """
    Cria uma nova marcação com estado 'agendada'.
    Valida Paciente, Médico, Clínica, Entidade e utilizador que agendou.
    """
    return service.create_marcacao(db, payload, utilizador_atual.id)


@router.get(
    "",
    response_model=List[schemas.MarcacaoRead],
    summary="Listar marcações",
)
def listar_marcacoes_endpoint(
    clinica_id: int               = Query(..., description="ID da clínica (obrigatório)"),
    medico_id: Optional[int]      = Query(None, description="ID do médico"),
    paciente_id: Optional[int]    = Query(None, description="ID do paciente"),
    entidade_id: Optional[int]    = Query(None, description="ID da entidade"),
    data_inicio: Optional[date]   = Query(None, description="Data mínima"),
    data_fim: Optional[date]      = Query(None, description="Data máxima"),
    estado: Optional[str]         = Query(None, description="Estado da marcação"),
    db: Session                   = Depends(get_db),
):
    """
    Lista todas as marcações filtrando por clínica (obrigatório) e demais filtros opcionais.
    """
    return service.list_marcacoes(
        db,
        clinica_id=clinica_id,
        medico_id=medico_id,
        paciente_id=paciente_id,
        entidade_id=entidade_id,
        data_inicio=data_inicio,
        data_fim=data_fim,
        estado=estado,
    )


@router.get(
    "/{marc_id}",
    response_model=schemas.MarcacaoRead,
    summary="Obter marcação por ID",
)
def obter_marcacao(
    marc_id: int,
    db: Session                   = Depends(get_db),
    utilizador_atual: Utilizador  = Depends(get_current_user),
):
    """
    Retorna detalhes de uma marcação específica.
    """
    return service.get_marcacao(db, marc_id)


@router.put(
    "/{marc_id}",
    response_model=schemas.MarcacaoRead,
    summary="Atualizar marcação",
)
def atualizar_marcacao(
    marc_id: int,
    payload: schemas.MarcacaoUpdate,
    db: Session                   = Depends(get_db),
    utilizador_atual: Utilizador  = Depends(get_current_user),
):
    """
    Atualiza campos de uma marcação (paciente, médico, clínica, entidade,
    data_hora, observações e/ou estado).
    """
    return service.update_marcacao(db, marc_id, payload, utilizador_atual)


@router.put(
    "/{marc_id}/estado",
    response_model=schemas.MarcacaoRead,
    summary="Alterar estado da marcação",
)
def mudar_estado(
    marc_id: int,
    payload: schemas.MarcacaoUpdate,  # neste caso usamos apenas o campo `estado`
    db: Session                   = Depends(get_db),
    utilizador_atual: Utilizador  = Depends(get_current_user),
):
    """
    Atualiza apenas o estado da marcação para um dos valores:
    'rascunho', 'agendada', 'checada', 'concluída', 'cancelada'.
    """
    if not payload.estado:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail="Deve especificar um novo estado."
        )
    return service.set_estado(db, marc_id, payload.estado, utilizador_atual)



@router.delete(
    "/{marc_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remover marcação",
)
def remover_marcacao(
    marc_id: int,
    db: Session                    = Depends(get_db),
    utilizador_atual: Utilizador   = Depends(get_current_user),
):
    """
    Exclui permanentemente a marcação especificada.
    """
    service.delete_marcacao(db, marc_id, utilizador_atual)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# -------- LEMBRETES E CANCELAMENTOS --------
def _get_marcacao_with_relations(db: Session, marc_id: int) -> Marcacao:
    """Helper to get marcacao with all relations loaded."""
    marc = (
        db.query(Marcacao)
        .options(
            selectinload(Marcacao.paciente),
            selectinload(Marcacao.medico),
            selectinload(Marcacao.clinic),
        )
        .filter(Marcacao.id == marc_id)
        .first()
    )
    if not marc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Marcação não encontrada")
    return marc


@router.post(
    "/{marc_id}/lembrete",
    summary="Enviar lembrete de consulta",
    status_code=status.HTTP_200_OK,
)
async def enviar_lembrete(
    marc_id: int,
    db: Session = Depends(get_db),
    utilizador_atual: Utilizador = Depends(get_current_user),
):
    """
    Envia um email de lembrete para o paciente sobre a consulta agendada.
    """
    marc = _get_marcacao_with_relations(db, marc_id)

    if not marc.paciente.email:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Paciente não possui email cadastrado"
        )

    config = await get_email_config(marc.clinic_id, db)
    email_manager = EmailManager(db, config)
    await email_manager.enviar_lembrete(marc)

    return {"detail": f"Lembrete enviado para {marc.paciente.email}"}


@router.post(
    "/{marc_id}/cancelamento",
    summary="Enviar notificação de cancelamento",
    status_code=status.HTTP_200_OK,
)
async def enviar_cancelamento(
    marc_id: int,
    db: Session = Depends(get_db),
    utilizador_atual: Utilizador = Depends(get_current_user),
):
    """
    Envia um email notificando o paciente sobre o cancelamento da consulta.
    """
    marc = _get_marcacao_with_relations(db, marc_id)

    if not marc.paciente.email:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Paciente não possui email cadastrado"
        )

    config = await get_email_config(marc.clinic_id, db)
    email_manager = EmailManager(db, config)
    await email_manager.enviar_cancelamento(marc)

    return {"detail": f"Notificação de cancelamento enviada para {marc.paciente.email}"}


@router.post(
    "/lembretes/enviar-em-massa",
    summary="Enviar lembretes em massa",
    status_code=status.HTTP_200_OK,
)
async def enviar_lembretes_em_massa(
    marcacao_ids: List[int],
    db: Session = Depends(get_db),
    utilizador_atual: Utilizador = Depends(get_current_user),
):
    """
    Envia lembretes de consulta para múltiplos pacientes.
    """
    enviados = []
    erros = []

    for marc_id in marcacao_ids:
        try:
            marc = _get_marcacao_with_relations(db, marc_id)

            if not marc.paciente.email:
                erros.append({
                    "marcacao_id": marc_id,
                    "erro": "Paciente sem email"
                })
                continue

            config = await get_email_config(marc.clinic_id, db)
            email_manager = EmailManager(db, config)
            await email_manager.enviar_lembrete(marc)

            enviados.append({
                "marcacao_id": marc_id,
                "paciente": marc.paciente.nome,
                "email": marc.paciente.email
            })
        except Exception as e:
            erros.append({
                "marcacao_id": marc_id,
                "erro": str(e)
            })

    return {
        "total_enviados": len(enviados),
        "total_erros": len(erros),
        "enviados": enviados,
        "erros": erros
    }


@router.post(
    "/cancelamentos/enviar-em-massa",
    summary="Enviar cancelamentos em massa",
    status_code=status.HTTP_200_OK,
)
async def enviar_cancelamentos_em_massa(
    marcacao_ids: List[int],
    db: Session = Depends(get_db),
    utilizador_atual: Utilizador = Depends(get_current_user),
):
    """
    Envia notificações de cancelamento para múltiplos pacientes.
    """
    enviados = []
    erros = []

    for marc_id in marcacao_ids:
        try:
            marc = _get_marcacao_with_relations(db, marc_id)

            if not marc.paciente.email:
                erros.append({
                    "marcacao_id": marc_id,
                    "erro": "Paciente sem email"
                })
                continue

            config = await get_email_config(marc.clinic_id, db)
            email_manager = EmailManager(db, config)
            await email_manager.enviar_cancelamento(marc)

            enviados.append({
                "marcacao_id": marc_id,
                "paciente": marc.paciente.nome,
                "email": marc.paciente.email
            })
        except Exception as e:
            erros.append({
                "marcacao_id": marc_id,
                "erro": str(e)
            })

    return {
        "total_enviados": len(enviados),
        "total_erros": len(erros),
        "enviados": enviados,
        "erros": erros
    }