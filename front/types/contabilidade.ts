// types/contabilidade.ts

export interface UserActivitySummary {
  utilizador_id: number
  utilizador_nome: string
  total_acoes: number
  acoes_por_tipo: Record<string, number>
  objetos_modificados: Record<string, number>
  ultima_atividade: string | null
}

export interface UserActivityDetail {
  id: number
  utilizador_id: number
  utilizador_nome: string
  acao: string
  objeto: string
  objeto_id: number | null
  detalhes: string | null
  data: string
  clinica_id: number
}

export interface OperationsSummary {
  total_operacoes: number
  periodo_inicio: string
  periodo_fim: string
  por_acao: Record<string, number>
  por_objeto: Record<string, number>
  top_utilizadores: Array<{
    id: number
    nome: string
    count: number
  }>
  operacoes_financeiras: Record<string, number>
  atividades_recentes: UserActivityDetail[]
}

export interface ModuleSummary {
  modulo: string
  total_operacoes: number
  criacoes: number
  atualizacoes: number
  remocoes: number
  top_utilizadores: Array<{
    id: number
    nome: string
    count: number
  }>
  operacoes_recentes: UserActivityDetail[]
}

export interface FinancialOperationsSummary {
  periodo_inicio: string
  periodo_fim: string
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
  operacoes_por_utilizador: Array<{
    id: number
    nome: string
    count: number
  }>
}

export interface TimelineEntry {
  data_hora: string
  utilizador_id: number
  utilizador_nome: string
  acao: string
  objeto: string
  descricao: string
}

export interface DailyActivitySummary {
  data: string
  total_operacoes: number
  por_modulo: Record<string, number>
  por_utilizador: Record<string, number>
}
