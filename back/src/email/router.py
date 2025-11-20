from typing import Optional, List

from fastapi import APIRouter, Depends, Query, HTTPException, status, Body
from pydantic import EmailStr, BaseModel
from sqlalchemy.orm import Session

from src.database import SessionLocal
from src.utilizadores.dependencies import get_current_user
from src.utilizadores.models import Utilizador
from src.email.service import EmailManager
from src.email.util import get_email_config, test_email_config
from src.marcacoes.service import get_marcacao as obter_marcacao   # função helper no seu módulo
from src.stock.service import verificar_alertas_stock


# Schema para envio de email customizado
class CustomEmailRequest(BaseModel):
    assunto: str
    mensagem: str
    email_para: Optional[EmailStr] = None

router = APIRouter(prefix="/email", tags=["Email"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------- Teste de configuração ----------------------------------------
@router.post("/test")
async def testar_email(
    clinica_id: int = Query(..., description="ID da clínica"),
    db: Session = Depends(get_db),
    current_user: Utilizador = Depends(get_current_user),
):
    config = await get_email_config(clinica_id, db)
    await test_email_config(config)
    return {"detail": "Configuração OK"}

# ---------- Fatura --------------------------------------------------------
@router.post("/fatura/{fatura_id}")
async def enviar_fatura_email(
    fatura_id: int,
    clinica_id: int = Query(...),
    email_para: Optional[EmailStr] = None,
    db: Session = Depends(get_db),
    current_user: Utilizador = Depends(get_current_user),
):
    config = await get_email_config(clinica_id, db)
    svc = EmailManager(db, config)
    await svc.enviar_fatura(fatura_id, clinica_id, email_para)
    return {"detail": "Fatura enviada"}

# ---------- Orçamento -----------------------------------------------------
@router.post("/orcamento/{orcamento_id}")
async def enviar_orcamento_email(
    orcamento_id: int,
    clinica_id: int = Query(...),
    email_para: Optional[EmailStr] = None,
    db: Session = Depends(get_db),
    current_user: Utilizador = Depends(get_current_user),
):
    config = await get_email_config(clinica_id, db)
    svc = EmailManager(db, config)
    await svc.enviar_orcamento(orcamento_id, clinica_id, email_para)
    return {"detail": "Orçamento enviado"}

# ---------- Lembrete de consulta -----------------------------------------
@router.post("/marcacoes/{marc_id}/lembrete", status_code=status.HTTP_202_ACCEPTED)
async def enviar_lembrete_email(
    marc_id: int,
    db: Session = Depends(get_db),
    current_user: Utilizador = Depends(get_current_user),
):
    marc = obter_marcacao(db, marc_id)
    config = await get_email_config(marc.clinic_id, db)
    svc = EmailManager(db, config)
    await svc.enviar_lembrete(marc)
    return {"detail": "Lembrete enviado"}

# ---------- Cancelamento de consulta -------------------------------------
@router.post("/marcacoes/{marc_id}/cancelamento", status_code=status.HTTP_202_ACCEPTED)
async def enviar_cancelamento_email(
    marc_id: int,
    db: Session = Depends(get_db),
    current_user: Utilizador = Depends(get_current_user),
):
    marc = obter_marcacao(db, marc_id)
    if marc.estado != "cancelada":
        raise HTTPException(400, "Marcação não está cancelada")

    config = await get_email_config(marc.clinic_id, db)
    svc = EmailManager(db, config)
    await svc.enviar_cancelamento(marc)
    return {"detail": "Cancelamento enviado"}

# ---------- Plano de Tratamento -------------------------------------------
@router.post("/plano/{plano_id}")
async def enviar_plano_email(
    plano_id: int,
    clinica_id: int = Query(...),
    email_para: Optional[EmailStr] = None,
    db: Session = Depends(get_db),
    current_user: Utilizador = Depends(get_current_user),
):
    config = await get_email_config(clinica_id, db)
    svc = EmailManager(db, config)
    await svc.enviar_plano(plano_id, clinica_id, email_para)
    return {"detail": "Plano de Tratamento enviado"}

# ---------- Email para Utilizador -----------------------------------------
@router.post("/utilizador/{utilizador_id}")
async def enviar_email_utilizador(
    utilizador_id: int,
    clinica_id: int = Query(...),
    email_data: CustomEmailRequest = Body(...),
    db: Session = Depends(get_db),
    current_user: Utilizador = Depends(get_current_user),
):
    """
    Envia um email customizado para um utilizador específico.
    Pode usar o email do utilizador ou um email alternativo fornecido.
    """
    config = await get_email_config(clinica_id, db)
    svc = EmailManager(db, config)
    await svc.enviar_email_utilizador(
        utilizador_id=utilizador_id,
        clinica_id=clinica_id,
        assunto=email_data.assunto,
        mensagem=email_data.mensagem,
        email_para=email_data.email_para
    )
    return {"detail": "Email enviado com sucesso"}

# ---------- Alertas de Stock ----------------------------------------------
@router.post("/alertas-stock")
async def enviar_alertas_stock_email(
    clinica_id: int = Query(..., description="ID da clínica"),
    dias_expiracao: int = Query(30, description="Dias para alerta de expiração"),
    db: Session = Depends(get_db),
    current_user: Utilizador = Depends(get_current_user),
):
    """
    Verifica alertas de stock (baixo e a expirar) e envia email para assistentes.
    Este endpoint pode ser chamado manualmente ou por um scheduler automático.
    """
    # Verificar alertas
    alertas = verificar_alertas_stock(db, clinica_id, dias_expiracao)

    itens_baixo_stock = alertas["itens_baixo_stock"]
    itens_expirando = alertas["itens_expirando"]

    # Se não há alertas, retornar mensagem
    if not itens_baixo_stock and not itens_expirando:
        return {
            "detail": "Nenhum alerta de stock encontrado",
            "alertas": {
                "itens_baixo_stock": 0,
                "itens_expirando": 0,
                "total": 0
            }
        }

    # Enviar email para assistentes
    config = await get_email_config(clinica_id, db)
    svc = EmailManager(db, config)
    await svc.enviar_alertas_stock(
        clinica_id=clinica_id,
        itens_baixo_stock=itens_baixo_stock,
        itens_expirando=itens_expirando
    )

    return {
        "detail": "Alertas enviados com sucesso",
        "alertas": {
            "itens_baixo_stock": len(itens_baixo_stock),
            "itens_expirando": len(itens_expirando),
            "total": len(itens_baixo_stock) + len(itens_expirando)
        }
    }
