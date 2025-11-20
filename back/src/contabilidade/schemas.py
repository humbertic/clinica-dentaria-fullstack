# src/contabilidade/schemas.py
from datetime import datetime, date
from typing import List, Optional, Dict, Any
from pydantic import BaseModel


# ============================================================================
# User Activity Schemas
# ============================================================================

class UserActivitySummary(BaseModel):
    """Summary of a user's activity"""
    utilizador_id: int
    utilizador_nome: str
    total_acoes: int
    acoes_por_tipo: Dict[str, int]  # {"Criação": 10, "Atualização": 5, ...}
    objetos_modificados: Dict[str, int]  # {"Fatura": 5, "Marcação": 3, ...}
    ultima_atividade: Optional[datetime]


class UserActivityDetail(BaseModel):
    """Detailed activity record for a user"""
    id: int
    utilizador_id: int
    utilizador_nome: str
    acao: str
    objeto: str
    objeto_id: Optional[int]
    detalhes: Optional[str]
    data: datetime
    clinica_id: int


# ============================================================================
# Operations Dashboard Schemas
# ============================================================================

class OperationsSummary(BaseModel):
    """Overall operations summary"""
    total_operacoes: int
    periodo_inicio: date
    periodo_fim: date

    # By operation type
    por_acao: Dict[str, int]  # {"Criação": 100, "Atualização": 50, ...}

    # By object type
    por_objeto: Dict[str, int]  # {"Fatura": 45, "Marcação": 30, ...}

    # By user (top users)
    top_utilizadores: List[Dict[str, Any]]  # [{id, nome, count}, ...]

    # Financial operations
    operacoes_financeiras: Dict[str, int]  # {"Fatura": 45, "Parcela": 20, ...}

    # Recent activity
    atividades_recentes: List[UserActivityDetail]


class ModuleSummary(BaseModel):
    """Summary of operations for a specific module"""
    modulo: str  # e.g., "Faturação", "Marcações", "Orçamentos"
    total_operacoes: int

    # Breakdown by action
    criacoes: int
    atualizacoes: int
    remocoes: int

    # Top users in this module
    top_utilizadores: List[Dict[str, Any]]

    # Recent operations
    operacoes_recentes: List[UserActivityDetail]


# ============================================================================
# Financial Analytics Schemas
# ============================================================================

class FinancialOperationsSummary(BaseModel):
    """Financial operations summary"""
    periodo_inicio: date
    periodo_fim: date

    # Invoice operations
    faturas_criadas: int
    faturas_atualizadas: int
    pagamentos_registrados: int
    parcelas_pagas: int

    # Budget operations
    orcamentos_criados: int
    orcamentos_aprovados: int
    orcamentos_rejeitados: int

    # Cash operations
    sessoes_caixa_abertas: int
    sessoes_caixa_fechadas: int
    pagamentos_caixa: int

    # By user
    operacoes_por_utilizador: List[Dict[str, Any]]


class DailyActivitySummary(BaseModel):
    """Daily activity breakdown"""
    data: date
    total_operacoes: int
    por_modulo: Dict[str, int]  # {"Faturação": 10, "Marcações": 5, ...}
    por_utilizador: Dict[str, int]  # {utilizador_id: count, ...}


# ============================================================================
# Time-based Analytics Schemas
# ============================================================================

class TimelineEntry(BaseModel):
    """Timeline entry for activity visualization"""
    data_hora: datetime
    utilizador_id: int
    utilizador_nome: str
    acao: str
    objeto: str
    descricao: str


class PeriodComparison(BaseModel):
    """Compare activity between two periods"""
    periodo_atual: Dict[str, Any]
    periodo_anterior: Dict[str, Any]
    variacao_percentual: Dict[str, float]


# ============================================================================
# Request Schemas
# ============================================================================

class DashboardFilterRequest(BaseModel):
    """Filter parameters for dashboard queries"""
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    utilizador_id: Optional[int] = None
    modulo: Optional[str] = None  # "Faturação", "Marcações", etc.
    acao: Optional[str] = None  # "Criação", "Atualização", "Remoção"
    clinica_id: Optional[int] = None
    limit: Optional[int] = 100


# ============================================================================
# Module-specific Reports
# ============================================================================

class FaturacaoReport(BaseModel):
    """Faturação module specific report"""
    periodo_inicio: date
    periodo_fim: date

    faturas_criadas: int
    faturas_atualizadas: int
    itens_adicionados: int
    parcelas_geradas: int
    pagamentos_efetuados: int

    por_utilizador: List[Dict[str, Any]]
    por_tipo_fatura: Dict[str, int]  # {"consulta": 10, "plano": 5}

    timeline: List[TimelineEntry]


class MarcacoesReport(BaseModel):
    """Marcações module specific report"""
    periodo_inicio: date
    periodo_fim: date

    marcacoes_criadas: int
    marcacoes_atualizadas: int
    marcacoes_canceladas: int
    mudancas_estado: int

    por_utilizador: List[Dict[str, Any]]
    por_estado: Dict[str, int]

    timeline: List[TimelineEntry]


class OrcamentosReport(BaseModel):
    """Orçamentos module specific report"""
    periodo_inicio: date
    periodo_fim: date

    orcamentos_criados: int
    orcamentos_aprovados: int
    orcamentos_rejeitados: int
    itens_adicionados: int
    itens_removidos: int

    por_utilizador: List[Dict[str, Any]]
    taxa_aprovacao: float  # Percentage

    timeline: List[TimelineEntry]
