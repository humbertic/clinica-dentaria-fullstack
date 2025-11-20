# src/contabilidade/router.py
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import date, timedelta

from src.database import SessionLocal
from src.utilizadores.dependencies import get_current_user
from src.utilizadores.models import Utilizador
from src.contabilidade import service, schemas


router = APIRouter(
    prefix="/contabilidade",
    tags=["Contabilidade"],
    responses={404: {"description": "Não encontrado"}},
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============================================================================
# Overall Dashboard Endpoints
# ============================================================================

@router.get("/dashboard", response_model=schemas.OperationsSummary, summary="Dashboard geral de operações")
def get_dashboard(
    data_inicio: Optional[date] = Query(None, description="Data inicial (default: últimos 30 dias)"),
    data_fim: Optional[date] = Query(None, description="Data final (default: hoje)"),
    clinica_id: Optional[int] = Query(None, description="ID da clínica"),
    db: Session = Depends(get_db),
    user: Utilizador = Depends(get_current_user)
):
    """
    Retorna dashboard geral com resumo de todas as operações no período especificado.

    **Inclui:**
    - Total de operações
    - Breakdown por tipo de ação (Criação/Atualização/Remoção)
    - Breakdown por módulo (Fatura/Marcação/etc)
    - Top utilizadores mais ativos
    - Operações financeiras
    - Atividades recentes
    """
    return service.get_operations_summary(db, data_inicio, data_fim, clinica_id)


@router.get("/modulo/{modulo}", response_model=schemas.ModuleSummary, summary="Resumo por módulo")
def get_modulo_summary(
    modulo: str,
    data_inicio: Optional[date] = Query(None, description="Data inicial (default: últimos 30 dias)"),
    data_fim: Optional[date] = Query(None, description="Data final (default: hoje)"),
    clinica_id: Optional[int] = Query(None, description="ID da clínica"),
    db: Session = Depends(get_db),
    user: Utilizador = Depends(get_current_user)
):
    """
    Retorna resumo detalhado de um módulo específico.

    **Módulos disponíveis:**
    - Fatura (faturação)
    - Marcação (marcações/agendamentos)
    - Orçamento (orçamentos)
    - CaixaSession (caixa)
    - Paciente (pacientes)
    - Utilizador (utilizadores)
    - Perfil (perfis de segurança)
    - Mensagem (mensagens)

    **Inclui:**
    - Total de operações
    - Criações/Atualizações/Remoções
    - Top utilizadores no módulo
    - Operações recentes
    """
    return service.get_module_summary(db, modulo, data_inicio, data_fim, clinica_id)


# ============================================================================
# User Activity Endpoints
# ============================================================================

@router.get("/utilizador/{utilizador_id}/resumo", response_model=schemas.UserActivitySummary, summary="Resumo de atividade do utilizador")
def get_user_summary(
    utilizador_id: int,
    data_inicio: Optional[date] = Query(None, description="Data inicial"),
    data_fim: Optional[date] = Query(None, description="Data final"),
    clinica_id: Optional[int] = Query(None, description="ID da clínica"),
    db: Session = Depends(get_db),
    user: Utilizador = Depends(get_current_user)
):
    """
    Retorna resumo de atividade de um utilizador específico.

    **Inclui:**
    - Total de ações
    - Breakdown por tipo de ação
    - Objetos modificados
    - Última atividade
    """
    try:
        return service.get_user_activity_summary(db, utilizador_id, data_inicio, data_fim, clinica_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/utilizador/{utilizador_id}/detalhes", response_model=List[schemas.UserActivityDetail], summary="Detalhes de atividade do utilizador")
def get_user_details(
    utilizador_id: int,
    data_inicio: Optional[date] = Query(None, description="Data inicial"),
    data_fim: Optional[date] = Query(None, description="Data final"),
    modulo: Optional[str] = Query(None, description="Filtrar por módulo"),
    limit: int = Query(50, ge=1, le=500, description="Limite de registros"),
    clinica_id: Optional[int] = Query(None, description="ID da clínica"),
    db: Session = Depends(get_db),
    user: Utilizador = Depends(get_current_user)
):
    """
    Retorna lista detalhada de todas as atividades de um utilizador.

    Útil para auditoria e rastreamento detalhado.
    """
    return service.get_user_activity_detail(db, utilizador_id, data_inicio, data_fim, modulo, limit, clinica_id)


# ============================================================================
# Financial Analytics Endpoints
# ============================================================================

@router.get("/financeiro/resumo", response_model=schemas.FinancialOperationsSummary, summary="Resumo de operações financeiras")
def get_financial_summary(
    data_inicio: Optional[date] = Query(None, description="Data inicial"),
    data_fim: Optional[date] = Query(None, description="Data final"),
    clinica_id: Optional[int] = Query(None, description="ID da clínica"),
    db: Session = Depends(get_db),
    user: Utilizador = Depends(get_current_user)
):
    """
    Retorna resumo de todas as operações financeiras.

    **Inclui:**
    - Faturas criadas e atualizadas
    - Pagamentos e parcelas
    - Orçamentos (criados/aprovados/rejeitados)
    - Sessões de caixa
    - Operações por utilizador
    """
    return service.get_financial_summary(db, data_inicio, data_fim, clinica_id)


# ============================================================================
# Timeline and Daily Activity Endpoints
# ============================================================================

@router.get("/timeline", response_model=List[schemas.TimelineEntry], summary="Timeline de atividades")
def get_timeline(
    data_inicio: Optional[date] = Query(None, description="Data inicial (default: últimos 7 dias)"),
    data_fim: Optional[date] = Query(None, description="Data final (default: hoje)"),
    modulo: Optional[str] = Query(None, description="Filtrar por módulo"),
    utilizador_id: Optional[int] = Query(None, description="Filtrar por utilizador"),
    limit: int = Query(100, ge=1, le=500, description="Limite de registros"),
    clinica_id: Optional[int] = Query(None, description="ID da clínica"),
    db: Session = Depends(get_db),
    user: Utilizador = Depends(get_current_user)
):
    """
    Retorna timeline cronológica de atividades para visualização.

    Ideal para gráficos de timeline e visualizações temporais.
    """
    return service.get_timeline(db, data_inicio, data_fim, modulo, utilizador_id, limit, clinica_id)


@router.get("/atividade-diaria", response_model=List[schemas.DailyActivitySummary], summary="Atividade diária")
def get_daily_activity(
    data_inicio: Optional[date] = Query(None, description="Data inicial"),
    data_fim: Optional[date] = Query(None, description="Data final"),
    clinica_id: Optional[int] = Query(None, description="ID da clínica"),
    db: Session = Depends(get_db),
    user: Utilizador = Depends(get_current_user)
):
    """
    Retorna breakdown diário de atividades.

    **Útil para:**
    - Gráficos de barras/linhas mostrando atividade ao longo do tempo
    - Identificar picos de atividade
    - Comparar períodos

    **Inclui por dia:**
    - Total de operações
    - Breakdown por módulo
    - Breakdown por utilizador
    """
    return service.get_daily_activity(db, data_inicio, data_fim, clinica_id)


# ============================================================================
# Quick Stats Endpoints (for widgets/cards)
# ============================================================================

@router.get("/stats/hoje", summary="Estatísticas de hoje")
def get_today_stats(
    clinica_id: Optional[int] = Query(None, description="ID da clínica"),
    db: Session = Depends(get_db),
    user: Utilizador = Depends(get_current_user)
):
    """
    Retorna estatísticas rápidas do dia atual.

    Ideal para widgets/cards no dashboard.
    """
    hoje = date.today()
    summary = service.get_operations_summary(db, hoje, hoje, clinica_id)

    return {
        "data": hoje,
        "total_operacoes": summary.total_operacoes,
        "por_modulo": summary.por_objeto,
        "top_utilizadores": summary.top_utilizadores[:5],
        "operacoes_financeiras": summary.operacoes_financeiras
    }


@router.get("/stats/semana", summary="Estatísticas da semana")
def get_week_stats(
    clinica_id: Optional[int] = Query(None, description="ID da clínica"),
    db: Session = Depends(get_db),
    user: Utilizador = Depends(get_current_user)
):
    """
    Retorna estatísticas dos últimos 7 dias.

    Ideal para widgets/cards no dashboard.
    """
    hoje = date.today()
    semana_atras = hoje - timedelta(days=7)
    summary = service.get_operations_summary(db, semana_atras, hoje, clinica_id)

    return {
        "periodo": "últimos 7 dias",
        "data_inicio": semana_atras,
        "data_fim": hoje,
        "total_operacoes": summary.total_operacoes,
        "media_diaria": summary.total_operacoes / 7,
        "por_modulo": summary.por_objeto,
        "top_utilizadores": summary.top_utilizadores[:5]
    }


@router.get("/stats/mes", summary="Estatísticas do mês")
def get_month_stats(
    clinica_id: Optional[int] = Query(None, description="ID da clínica"),
    db: Session = Depends(get_db),
    user: Utilizador = Depends(get_current_user)
):
    """
    Retorna estatísticas dos últimos 30 dias.

    Ideal para widgets/cards no dashboard.
    """
    hoje = date.today()
    mes_atras = hoje - timedelta(days=30)
    summary = service.get_operations_summary(db, mes_atras, hoje, clinica_id)

    return {
        "periodo": "últimos 30 dias",
        "data_inicio": mes_atras,
        "data_fim": hoje,
        "total_operacoes": summary.total_operacoes,
        "media_diaria": summary.total_operacoes / 30,
        "por_modulo": summary.por_objeto,
        "top_utilizadores": summary.top_utilizadores[:10],
        "operacoes_financeiras": summary.operacoes_financeiras
    }
