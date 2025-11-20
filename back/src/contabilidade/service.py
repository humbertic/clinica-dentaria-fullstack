# src/contabilidade/service.py
from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_

from src.auditoria.models import Auditoria
from src.utilizadores.models import Utilizador
from src.contabilidade import schemas


# ============================================================================
# Overall Dashboard
# ============================================================================

def get_operations_summary(
    db: Session,
    data_inicio: Optional[date] = None,
    data_fim: Optional[date] = None,
    clinica_id: Optional[int] = None
) -> schemas.OperationsSummary:
    """
    Get overall operations summary for the dashboard.
    """
    # Default to last 30 days if no date range provided
    if not data_fim:
        data_fim = date.today()
    if not data_inicio:
        data_inicio = data_fim - timedelta(days=30)

    # Base query
    query = db.query(Auditoria).filter(
        and_(
            func.date(Auditoria.data) >= data_inicio,
            func.date(Auditoria.data) <= data_fim
        )
    )

    if clinica_id:
        query = query.filter(Auditoria.clinica_id == clinica_id)

    total_ops = query.count()

    # By action type
    por_acao = {}
    action_counts = db.query(
        Auditoria.acao,
        func.count(Auditoria.id)
    ).filter(
        and_(
            func.date(Auditoria.data) >= data_inicio,
            func.date(Auditoria.data) <= data_fim
        )
    )
    if clinica_id:
        action_counts = action_counts.filter(Auditoria.clinica_id == clinica_id)

    for acao, count in action_counts.group_by(Auditoria.acao).all():
        por_acao[acao] = count

    # By object type
    por_objeto = {}
    object_counts = db.query(
        Auditoria.objeto,
        func.count(Auditoria.id)
    ).filter(
        and_(
            func.date(Auditoria.data) >= data_inicio,
            func.date(Auditoria.data) <= data_fim
        )
    )
    if clinica_id:
        object_counts = object_counts.filter(Auditoria.clinica_id == clinica_id)

    for objeto, count in object_counts.group_by(Auditoria.objeto).all():
        por_objeto[objeto] = count

    # Top users
    top_users_query = db.query(
        Auditoria.utilizador_id,
        Utilizador.nome,
        func.count(Auditoria.id).label('count')
    ).join(
        Utilizador, Auditoria.utilizador_id == Utilizador.id
    ).filter(
        and_(
            func.date(Auditoria.data) >= data_inicio,
            func.date(Auditoria.data) <= data_fim
        )
    )
    if clinica_id:
        top_users_query = top_users_query.filter(Auditoria.clinica_id == clinica_id)

    top_utilizadores = [
        {"id": uid, "nome": nome, "count": count}
        for uid, nome, count in top_users_query.group_by(
            Auditoria.utilizador_id, Utilizador.nome
        ).order_by(func.count(Auditoria.id).desc()).limit(10).all()
    ]

    # Financial operations
    financial_objects = ["Fatura", "Parcela", "CashierPayment", "CaixaSession", "Orçamento"]
    operacoes_financeiras = {
        obj: count for obj, count in por_objeto.items()
        if obj in financial_objects
    }

    # Recent activity (last 20)
    recent_query = db.query(Auditoria).join(
        Utilizador, Auditoria.utilizador_id == Utilizador.id
    ).filter(
        and_(
            func.date(Auditoria.data) >= data_inicio,
            func.date(Auditoria.data) <= data_fim
        )
    )
    if clinica_id:
        recent_query = recent_query.filter(Auditoria.clinica_id == clinica_id)

    recent_activities = []
    for audit in recent_query.order_by(Auditoria.data.desc()).limit(20).all():
        user = db.query(Utilizador).filter(Utilizador.id == audit.utilizador_id).first()
        recent_activities.append(schemas.UserActivityDetail(
            id=audit.id,
            utilizador_id=audit.utilizador_id,
            utilizador_nome=user.nome if user else "Desconhecido",
            acao=audit.acao,
            objeto=audit.objeto,
            objeto_id=audit.objeto_id,
            detalhes=audit.detalhes,
            data=audit.data,
            clinica_id=audit.clinica_id
        ))

    return schemas.OperationsSummary(
        total_operacoes=total_ops,
        periodo_inicio=data_inicio,
        periodo_fim=data_fim,
        por_acao=por_acao,
        por_objeto=por_objeto,
        top_utilizadores=top_utilizadores,
        operacoes_financeiras=operacoes_financeiras,
        atividades_recentes=recent_activities
    )


# ============================================================================
# Module-specific Summaries
# ============================================================================

def get_module_summary(
    db: Session,
    modulo: str,
    data_inicio: Optional[date] = None,
    data_fim: Optional[date] = None,
    clinica_id: Optional[int] = None
) -> schemas.ModuleSummary:
    """
    Get summary for a specific module (Fatura, Marcação, Orçamento, etc.).
    """
    # Default to last 30 days
    if not data_fim:
        data_fim = date.today()
    if not data_inicio:
        data_inicio = data_fim - timedelta(days=30)

    # Base query for this module
    query = db.query(Auditoria).filter(
        and_(
            Auditoria.objeto == modulo,
            func.date(Auditoria.data) >= data_inicio,
            func.date(Auditoria.data) <= data_fim
        )
    )
    if clinica_id:
        query = query.filter(Auditoria.clinica_id == clinica_id)

    total_ops = query.count()

    # Count by action
    criacoes = query.filter(Auditoria.acao == "Criação").count()
    atualizacoes = query.filter(Auditoria.acao == "Atualização").count()
    remocoes = query.filter(Auditoria.acao == "Remoção").count()

    # Top users for this module
    top_users_query = db.query(
        Auditoria.utilizador_id,
        Utilizador.nome,
        func.count(Auditoria.id).label('count')
    ).join(
        Utilizador, Auditoria.utilizador_id == Utilizador.id
    ).filter(
        and_(
            Auditoria.objeto == modulo,
            func.date(Auditoria.data) >= data_inicio,
            func.date(Auditoria.data) <= data_fim
        )
    )
    if clinica_id:
        top_users_query = top_users_query.filter(Auditoria.clinica_id == clinica_id)

    top_utilizadores = [
        {"id": uid, "nome": nome, "count": count}
        for uid, nome, count in top_users_query.group_by(
            Auditoria.utilizador_id, Utilizador.nome
        ).order_by(func.count(Auditoria.id).desc()).limit(5).all()
    ]

    # Recent operations in this module
    recent_ops = []
    for audit in query.order_by(Auditoria.data.desc()).limit(10).all():
        user = db.query(Utilizador).filter(Utilizador.id == audit.utilizador_id).first()
        recent_ops.append(schemas.UserActivityDetail(
            id=audit.id,
            utilizador_id=audit.utilizador_id,
            utilizador_nome=user.nome if user else "Desconhecido",
            acao=audit.acao,
            objeto=audit.objeto,
            objeto_id=audit.objeto_id,
            detalhes=audit.detalhes,
            data=audit.data,
            clinica_id=audit.clinica_id
        ))

    return schemas.ModuleSummary(
        modulo=modulo,
        total_operacoes=total_ops,
        criacoes=criacoes,
        atualizacoes=atualizacoes,
        remocoes=remocoes,
        top_utilizadores=top_utilizadores,
        operacoes_recentes=recent_ops
    )


# ============================================================================
# User Activity Reports
# ============================================================================

def get_user_activity_summary(
    db: Session,
    utilizador_id: int,
    data_inicio: Optional[date] = None,
    data_fim: Optional[date] = None,
    clinica_id: Optional[int] = None
) -> schemas.UserActivitySummary:
    """
    Get activity summary for a specific user.
    """
    # Default to last 30 days
    if not data_fim:
        data_fim = date.today()
    if not data_inicio:
        data_inicio = data_fim - timedelta(days=30)

    # Get user info
    user = db.query(Utilizador).filter(Utilizador.id == utilizador_id).first()
    if not user:
        raise ValueError(f"Utilizador {utilizador_id} não encontrado")

    # Base query
    query = db.query(Auditoria).filter(
        and_(
            Auditoria.utilizador_id == utilizador_id,
            func.date(Auditoria.data) >= data_inicio,
            func.date(Auditoria.data) <= data_fim
        )
    )
    if clinica_id:
        query = query.filter(Auditoria.clinica_id == clinica_id)

    total_acoes = query.count()

    # By action type
    acoes_por_tipo = {}
    for acao, count in db.query(
        Auditoria.acao,
        func.count(Auditoria.id)
    ).filter(
        and_(
            Auditoria.utilizador_id == utilizador_id,
            func.date(Auditoria.data) >= data_inicio,
            func.date(Auditoria.data) <= data_fim
        )
    ).group_by(Auditoria.acao).all():
        acoes_por_tipo[acao] = count

    # By object type
    objetos_modificados = {}
    obj_query = db.query(
        Auditoria.objeto,
        func.count(Auditoria.id)
    ).filter(
        and_(
            Auditoria.utilizador_id == utilizador_id,
            func.date(Auditoria.data) >= data_inicio,
            func.date(Auditoria.data) <= data_fim
        )
    )
    if clinica_id:
        obj_query = obj_query.filter(Auditoria.clinica_id == clinica_id)

    for objeto, count in obj_query.group_by(Auditoria.objeto).all():
        objetos_modificados[objeto] = count

    # Last activity
    ultima = query.order_by(Auditoria.data.desc()).first()
    ultima_atividade = ultima.data if ultima else None

    return schemas.UserActivitySummary(
        utilizador_id=utilizador_id,
        utilizador_nome=user.nome,
        total_acoes=total_acoes,
        acoes_por_tipo=acoes_por_tipo,
        objetos_modificados=objetos_modificados,
        ultima_atividade=ultima_atividade
    )


def get_user_activity_detail(
    db: Session,
    utilizador_id: int,
    data_inicio: Optional[date] = None,
    data_fim: Optional[date] = None,
    modulo: Optional[str] = None,
    limit: int = 50,
    clinica_id: Optional[int] = None
) -> List[schemas.UserActivityDetail]:
    """
    Get detailed activity list for a specific user.
    """
    # Default to last 30 days
    if not data_fim:
        data_fim = date.today()
    if not data_inicio:
        data_inicio = data_fim - timedelta(days=30)

    query = db.query(Auditoria).filter(
        and_(
            Auditoria.utilizador_id == utilizador_id,
            func.date(Auditoria.data) >= data_inicio,
            func.date(Auditoria.data) <= data_fim
        )
    )

    if modulo:
        query = query.filter(Auditoria.objeto == modulo)

    if clinica_id:
        query = query.filter(Auditoria.clinica_id == clinica_id)

    activities = []
    user = db.query(Utilizador).filter(Utilizador.id == utilizador_id).first()
    user_name = user.nome if user else "Desconhecido"

    for audit in query.order_by(Auditoria.data.desc()).limit(limit).all():
        activities.append(schemas.UserActivityDetail(
            id=audit.id,
            utilizador_id=audit.utilizador_id,
            utilizador_nome=user_name,
            acao=audit.acao,
            objeto=audit.objeto,
            objeto_id=audit.objeto_id,
            detalhes=audit.detalhes,
            data=audit.data,
            clinica_id=audit.clinica_id
        ))

    return activities


# ============================================================================
# Financial Analytics
# ============================================================================

def get_financial_summary(
    db: Session,
    data_inicio: Optional[date] = None,
    data_fim: Optional[date] = None,
    clinica_id: Optional[int] = None
) -> schemas.FinancialOperationsSummary:
    """
    Get financial operations summary.
    """
    # Default to last 30 days
    if not data_fim:
        data_fim = date.today()
    if not data_inicio:
        data_inicio = data_fim - timedelta(days=30)

    # Base query for date range
    def count_ops(objeto: str, acao: Optional[str] = None):
        q = db.query(Auditoria).filter(
            and_(
                Auditoria.objeto == objeto,
                func.date(Auditoria.data) >= data_inicio,
                func.date(Auditoria.data) <= data_fim
            )
        )
        if acao:
            q = q.filter(Auditoria.acao == acao)
        if clinica_id:
            q = q.filter(Auditoria.clinica_id == clinica_id)
        return q.count()

    # Count specific financial operations
    faturas_criadas = count_ops("Fatura", "Criação")
    faturas_atualizadas = count_ops("Fatura", "Atualização")
    pagamentos_registrados = count_ops("CashierPayment", "Criação")
    parcelas_pagas = count_ops("Parcela", "Atualização")

    orcamentos_criados = count_ops("Orçamento", "Criação")
    orcamentos_aprovados = db.query(Auditoria).filter(
        and_(
            Auditoria.objeto == "Orçamento",
            Auditoria.acao == "Atualização",
            Auditoria.detalhes.like("%aprovado%"),
            func.date(Auditoria.data) >= data_inicio,
            func.date(Auditoria.data) <= data_fim
        )
    ).count() if clinica_id is None else db.query(Auditoria).filter(
        and_(
            Auditoria.objeto == "Orçamento",
            Auditoria.acao == "Atualização",
            Auditoria.detalhes.like("%aprovado%"),
            Auditoria.clinica_id == clinica_id,
            func.date(Auditoria.data) >= data_inicio,
            func.date(Auditoria.data) <= data_fim
        )
    ).count()

    orcamentos_rejeitados = db.query(Auditoria).filter(
        and_(
            Auditoria.objeto == "Orçamento",
            Auditoria.acao == "Atualização",
            Auditoria.detalhes.like("%rejeitado%"),
            func.date(Auditoria.data) >= data_inicio,
            func.date(Auditoria.data) <= data_fim
        )
    ).count() if clinica_id is None else db.query(Auditoria).filter(
        and_(
            Auditoria.objeto == "Orçamento",
            Auditoria.acao == "Atualização",
            Auditoria.detalhes.like("%rejeitado%"),
            Auditoria.clinica_id == clinica_id,
            func.date(Auditoria.data) >= data_inicio,
            func.date(Auditoria.data) <= data_fim
        )
    ).count()

    sessoes_caixa_abertas = count_ops("CaixaSession", "Criação")
    sessoes_caixa_fechadas = db.query(Auditoria).filter(
        and_(
            Auditoria.objeto == "CaixaSession",
            Auditoria.acao == "Atualização",
            Auditoria.detalhes.like("%fechada%"),
            func.date(Auditoria.data) >= data_inicio,
            func.date(Auditoria.data) <= data_fim
        )
    ).count() if clinica_id is None else db.query(Auditoria).filter(
        and_(
            Auditoria.objeto == "CaixaSession",
            Auditoria.acao == "Atualização",
            Auditoria.detalhes.like("%fechada%"),
            Auditoria.clinica_id == clinica_id,
            func.date(Auditoria.data) >= data_inicio,
            func.date(Auditoria.data) <= data_fim
        )
    ).count()

    pagamentos_caixa = count_ops("CashierPayment", "Criação")

    # Operations by user (financial only)
    financial_objects = ["Fatura", "Parcela", "CashierPayment", "CaixaSession", "Orçamento"]
    user_ops_query = db.query(
        Auditoria.utilizador_id,
        Utilizador.nome,
        func.count(Auditoria.id).label('count')
    ).join(
        Utilizador, Auditoria.utilizador_id == Utilizador.id
    ).filter(
        and_(
            Auditoria.objeto.in_(financial_objects),
            func.date(Auditoria.data) >= data_inicio,
            func.date(Auditoria.data) <= data_fim
        )
    )
    if clinica_id:
        user_ops_query = user_ops_query.filter(Auditoria.clinica_id == clinica_id)

    operacoes_por_utilizador = [
        {"id": uid, "nome": nome, "count": count}
        for uid, nome, count in user_ops_query.group_by(
            Auditoria.utilizador_id, Utilizador.nome
        ).order_by(func.count(Auditoria.id).desc()).limit(10).all()
    ]

    return schemas.FinancialOperationsSummary(
        periodo_inicio=data_inicio,
        periodo_fim=data_fim,
        faturas_criadas=faturas_criadas,
        faturas_atualizadas=faturas_atualizadas,
        pagamentos_registrados=pagamentos_registrados,
        parcelas_pagas=parcelas_pagas,
        orcamentos_criados=orcamentos_criados,
        orcamentos_aprovados=orcamentos_aprovados,
        orcamentos_rejeitados=orcamentos_rejeitados,
        sessoes_caixa_abertas=sessoes_caixa_abertas,
        sessoes_caixa_fechadas=sessoes_caixa_fechadas,
        pagamentos_caixa=pagamentos_caixa,
        operacoes_por_utilizador=operacoes_por_utilizador
    )


# ============================================================================
# Timeline and Daily Activity
# ============================================================================

def get_timeline(
    db: Session,
    data_inicio: Optional[date] = None,
    data_fim: Optional[date] = None,
    modulo: Optional[str] = None,
    utilizador_id: Optional[int] = None,
    limit: int = 100,
    clinica_id: Optional[int] = None
) -> List[schemas.TimelineEntry]:
    """
    Get timeline of activities for visualization.
    """
    # Default to last 7 days
    if not data_fim:
        data_fim = date.today()
    if not data_inicio:
        data_inicio = data_fim - timedelta(days=7)

    query = db.query(Auditoria).join(
        Utilizador, Auditoria.utilizador_id == Utilizador.id
    ).filter(
        and_(
            func.date(Auditoria.data) >= data_inicio,
            func.date(Auditoria.data) <= data_fim
        )
    )

    if modulo:
        query = query.filter(Auditoria.objeto == modulo)

    if utilizador_id:
        query = query.filter(Auditoria.utilizador_id == utilizador_id)

    if clinica_id:
        query = query.filter(Auditoria.clinica_id == clinica_id)

    timeline = []
    for audit in query.order_by(Auditoria.data.desc()).limit(limit).all():
        user = db.query(Utilizador).filter(Utilizador.id == audit.utilizador_id).first()
        timeline.append(schemas.TimelineEntry(
            data_hora=audit.data,
            utilizador_id=audit.utilizador_id,
            utilizador_nome=user.nome if user else "Desconhecido",
            acao=audit.acao,
            objeto=audit.objeto,
            descricao=audit.detalhes or f"{audit.acao} de {audit.objeto}"
        ))

    return timeline


def get_daily_activity(
    db: Session,
    data_inicio: Optional[date] = None,
    data_fim: Optional[date] = None,
    clinica_id: Optional[int] = None
) -> List[schemas.DailyActivitySummary]:
    """
    Get daily breakdown of activity.
    """
    # Default to last 30 days
    if not data_fim:
        data_fim = date.today()
    if not data_inicio:
        data_inicio = data_fim - timedelta(days=30)

    # Query grouped by date
    query = db.query(
        func.date(Auditoria.data).label('data'),
        func.count(Auditoria.id).label('total')
    ).filter(
        and_(
            func.date(Auditoria.data) >= data_inicio,
            func.date(Auditoria.data) <= data_fim
        )
    )

    if clinica_id:
        query = query.filter(Auditoria.clinica_id == clinica_id)

    daily_totals = {data: total for data, total in query.group_by(func.date(Auditoria.data)).all()}

    # Build response for each day
    daily_activities = []
    current_date = data_inicio
    while current_date <= data_fim:
        # Get breakdown by module for this day
        module_query = db.query(
            Auditoria.objeto,
            func.count(Auditoria.id)
        ).filter(func.date(Auditoria.data) == current_date)

        if clinica_id:
            module_query = module_query.filter(Auditoria.clinica_id == clinica_id)

        por_modulo = {
            obj: count
            for obj, count in module_query.group_by(Auditoria.objeto).all()
        }

        # Get breakdown by user for this day
        user_query = db.query(
            Auditoria.utilizador_id,
            func.count(Auditoria.id)
        ).filter(func.date(Auditoria.data) == current_date)

        if clinica_id:
            user_query = user_query.filter(Auditoria.clinica_id == clinica_id)

        por_utilizador = {
            str(uid): count
            for uid, count in user_query.group_by(Auditoria.utilizador_id).all()
        }

        daily_activities.append(schemas.DailyActivitySummary(
            data=current_date,
            total_operacoes=daily_totals.get(current_date, 0),
            por_modulo=por_modulo,
            por_utilizador=por_utilizador
        ))

        current_date += timedelta(days=1)

    return daily_activities
