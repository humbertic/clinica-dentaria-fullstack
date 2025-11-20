from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from src.perfis import models, schemas
from fastapi import HTTPException

from src.auditoria.utils import registrar_auditoria
from src.utilizadores.models import Utilizador

def criar_perfil(db: Session, dados: schemas.PerfilCreate, user: Utilizador) -> models.Perfil:
    perfil = models.Perfil(nome=dados.nome)
    db.add(perfil)
    try:
        db.commit()
        db.refresh(perfil)

        # Audit logging
        registrar_auditoria(
            db, user.id, "Criação", "Perfil", perfil.id,
            f"Perfil '{perfil.nome}' criado"
        )

        return perfil
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Já existe um perfil com esse nome.")

def atualizar_perfil(db: Session, perfil_id: int, dados: schemas.PerfilUpdate, user: Utilizador) -> models.Perfil:
    perfil = db.query(models.Perfil).filter_by(id=perfil_id).first()
    if not perfil:
        raise HTTPException(status_code=404, detail="Perfil não encontrado")
    nome_anterior = perfil.nome
    perfil.nome = dados.nome
    try:
        db.commit()
        db.refresh(perfil)

        # Audit logging
        registrar_auditoria(
            db, user.id, "Atualização", "Perfil", perfil.id,
            f"Perfil atualizado de '{nome_anterior}' para '{perfil.nome}'"
        )

        return perfil
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Já existe um perfil com esse nome.")

def listar_perfis(db: Session):
    return db.query(models.Perfil).all()


