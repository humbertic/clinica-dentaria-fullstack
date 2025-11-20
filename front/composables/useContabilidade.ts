// composables/useContabilidade.ts
import type {
  OperationsSummary,
  ModuleSummary,
  UserActivitySummary,
  UserActivityDetail,
  FinancialOperationsSummary,
  TimelineEntry,
  DailyActivitySummary
} from '~/types/contabilidade'

export const useContabilidade = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase || 'http://localhost:8000'

  /**
   * Get overall dashboard summary
   */
  const getDashboard = async (params?: {
    data_inicio?: string
    data_fim?: string
    clinica_id?: number
  }): Promise<OperationsSummary> => {
    return await $fetch('/contabilidade/dashboard', {
      baseURL,
      method: 'GET',
      params,
      headers: useRequestHeaders(['authorization'])
    })
  }

  /**
   * Get module-specific summary
   */
  const getModuleSummary = async (
    modulo: string,
    params?: {
      data_inicio?: string
      data_fim?: string
      clinica_id?: number
    }
  ): Promise<ModuleSummary> => {
    return await $fetch(`/contabilidade/modulo/${modulo}`, {
      baseURL,
      method: 'GET',
      params,
      headers: useRequestHeaders(['authorization'])
    })
  }

  /**
   * Get user activity summary
   */
  const getUserSummary = async (
    utilizador_id: number,
    params?: {
      data_inicio?: string
      data_fim?: string
      clinica_id?: number
    }
  ): Promise<UserActivitySummary> => {
    return await $fetch(`/contabilidade/utilizador/${utilizador_id}/resumo`, {
      baseURL,
      method: 'GET',
      params,
      headers: useRequestHeaders(['authorization'])
    })
  }

  /**
   * Get detailed user activity
   */
  const getUserDetails = async (
    utilizador_id: number,
    params?: {
      data_inicio?: string
      data_fim?: string
      modulo?: string
      limit?: number
      clinica_id?: number
    }
  ): Promise<UserActivityDetail[]> => {
    return await $fetch(`/contabilidade/utilizador/${utilizador_id}/detalhes`, {
      baseURL,
      method: 'GET',
      params,
      headers: useRequestHeaders(['authorization'])
    })
  }

  /**
   * Get financial summary
   */
  const getFinancialSummary = async (params?: {
    data_inicio?: string
    data_fim?: string
    clinica_id?: number
  }): Promise<FinancialOperationsSummary> => {
    return await $fetch('/contabilidade/financeiro/resumo', {
      baseURL,
      method: 'GET',
      params,
      headers: useRequestHeaders(['authorization'])
    })
  }

  /**
   * Get timeline of activities
   */
  const getTimeline = async (params?: {
    data_inicio?: string
    data_fim?: string
    modulo?: string
    utilizador_id?: number
    limit?: number
    clinica_id?: number
  }): Promise<TimelineEntry[]> => {
    return await $fetch('/contabilidade/timeline', {
      baseURL,
      method: 'GET',
      params,
      headers: useRequestHeaders(['authorization'])
    })
  }

  /**
   * Get daily activity breakdown
   */
  const getDailyActivity = async (params?: {
    data_inicio?: string
    data_fim?: string
    clinica_id?: number
  }): Promise<DailyActivitySummary[]> => {
    return await $fetch('/contabilidade/atividade-diaria', {
      baseURL,
      method: 'GET',
      params,
      headers: useRequestHeaders(['authorization'])
    })
  }

  /**
   * Get today's stats (quick widget)
   */
  const getTodayStats = async (clinica_id?: number) => {
    return await $fetch('/contabilidade/stats/hoje', {
      baseURL,
      method: 'GET',
      params: clinica_id ? { clinica_id } : undefined,
      headers: useRequestHeaders(['authorization'])
    })
  }

  /**
   * Get week stats (quick widget)
   */
  const getWeekStats = async (clinica_id?: number) => {
    return await $fetch('/contabilidade/stats/semana', {
      baseURL,
      method: 'GET',
      params: clinica_id ? { clinica_id } : undefined,
      headers: useRequestHeaders(['authorization'])
    })
  }

  /**
   * Get month stats (quick widget)
   */
  const getMonthStats = async (clinica_id?: number) => {
    return await $fetch('/contabilidade/stats/mes', {
      baseURL,
      method: 'GET',
      params: clinica_id ? { clinica_id } : undefined,
      headers: useRequestHeaders(['authorization'])
    })
  }

  return {
    getDashboard,
    getModuleSummary,
    getUserSummary,
    getUserDetails,
    getFinancialSummary,
    getTimeline,
    getDailyActivity,
    getTodayStats,
    getWeekStats,
    getMonthStats
  }
}
