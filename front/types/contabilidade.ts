// types/contabilidade.ts
// Tipos para o módulo de Contabilidade seguindo os padrões da aplicação

// ============================================================================
// User Activity Types
// ============================================================================

export interface UserActivitySummaryBase {
  utilizador_id: number
  utilizador_nome: string
  total_acoes: number
  ultima_atividade: string | null
}

export interface UserActivitySummary extends UserActivitySummaryBase {
  acoes_por_tipo: Record<string, number>
  objetos_modificados: Record<string, number>
}

export interface UserActivityDetailBase {
  utilizador_id: number
  utilizador_nome: string
  acao: string
  objeto: string
  data: string
  clinica_id: number
}

export interface UserActivityDetail extends UserActivityDetailBase {
  id: number
  objeto_id: number | null
  detalhes: string | null
}

// ============================================================================
// Operations Summary Types
// ============================================================================

export interface OperationsSummaryBase {
  periodo_inicio: string
  periodo_fim: string
  total_operacoes: number
}

export interface TopUser {
  id: number
  nome: string
  count: number
}

export interface OperationsSummary extends OperationsSummaryBase {
  por_acao: Record<string, number>
  por_objeto: Record<string, number>
  top_utilizadores: TopUser[]
  operacoes_financeiras: Record<string, number>
  atividades_recentes: UserActivityDetail[]
}

// ============================================================================
// Module Summary Types
// ============================================================================

export interface ModuleSummaryBase {
  modulo: string
  total_operacoes: number
  criacoes: number
  atualizacoes: number
  remocoes: number
}

export interface ModuleSummary extends ModuleSummaryBase {
  top_utilizadores: TopUser[]
  operacoes_recentes: UserActivityDetail[]
}

// ============================================================================
// Financial Operations Types
// ============================================================================

export interface FinancialOperationsSummaryBase {
  periodo_inicio: string
  periodo_fim: string
}

export interface FinancialOperationsSummary extends FinancialOperationsSummaryBase {
  faturas_criadas: number
  faturas_atualizadas: number
  pagamentos_registrados: number
  parcelas_pagas: number
  orcamentos_criados: number
  orcamentos_aprovados: number
  orcamentos_rejeitados: number
  sessoes_caixa_abertas: number
  sessoes_caixa_fechadas: number
  pagamentos_caixa: number
  operacoes_por_utilizador: TopUser[]
}

// ============================================================================
// Timeline Types
// ============================================================================

export interface TimelineEntry {
  data_hora: string
  utilizador_id: number
  utilizador_nome: string
  acao: string
  objeto: string
  descricao: string
}

// ============================================================================
// Daily Activity Types
// ============================================================================

export interface DailyActivitySummary {
  data: string
  total_operacoes: number
  por_modulo: Record<string, number>
  por_utilizador: Record<string, number>
}

// ============================================================================
// Filter Types
// ============================================================================

export interface ContabilidadeFilters {
  data_inicio?: string
  data_fim?: string
  clinica_id?: number
  utilizador_id?: number
  modulo?: string
  acao?: string
  limit?: number
}

// ============================================================================
// Helper Types
// ============================================================================

export type AcaoType = 'Criação' | 'Atualização' | 'Remoção' | 'Login' | 'Logout'

export interface QuickStats {
  data: string
  total_operacoes: number
  por_modulo: Record<string, number>
  top_utilizadores: TopUser[]
  operacoes_financeiras?: Record<string, number>
}

export interface WeekStats extends QuickStats {
  periodo: string
  media_diaria: number
}

export interface MonthStats extends WeekStats {
  // Same as WeekStats
}
