import { ref } from "vue";
import type {
  OperationsSummary,
  ModuleSummary,
  UserActivitySummary,
  UserActivityDetail,
  FinancialOperationsSummary,
  TimelineEntry,
  DailyActivitySummary,
  QuickStats,
  WeekStats,
  MonthStats,
  ContabilidadeFilters,
} from "~/types/contabilidade";

export function useContabilidade() {
  const { get } = useApiService();

  const loading = ref(false);
  const error = ref<string | null>(null);

  // Dashboard data
  const dashboardSummary = ref<OperationsSummary | null>(null);
  const moduleSummary = ref<ModuleSummary | null>(null);
  const userSummary = ref<UserActivitySummary | null>(null);
  const financialSummary = ref<FinancialOperationsSummary | null>(null);

  /**
   * Get overall dashboard summary
   */
  async function getDashboard(
    filters?: ContabilidadeFilters
  ): Promise<OperationsSummary | null> {
    loading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams();
      if (filters?.data_inicio)
        params.append("data_inicio", filters.data_inicio);
      if (filters?.data_fim) params.append("data_fim", filters.data_fim);
      if (filters?.clinica_id)
        params.append("clinica_id", String(filters.clinica_id));

      const qs = params.toString() ? `?${params}` : "";

      dashboardSummary.value = await get(`contabilidade/dashboard${qs}`);
      return dashboardSummary.value;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error("Erro ao buscar dashboard de contabilidade:", err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Get module-specific summary
   */
  async function getModuleSummary(
    modulo: string,
    filters?: ContabilidadeFilters
  ): Promise<ModuleSummary | null> {
    loading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams();
      if (filters?.data_inicio)
        params.append("data_inicio", filters.data_inicio);
      if (filters?.data_fim) params.append("data_fim", filters.data_fim);
      if (filters?.clinica_id)
        params.append("clinica_id", String(filters.clinica_id));

      const qs = params.toString() ? `?${params}` : "";

      moduleSummary.value = await get(`contabilidade/modulo/${modulo}${qs}`);
      return moduleSummary.value;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao buscar resumo do módulo ${modulo}:`, err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Get user activity summary
   */
  async function getUserSummary(
    utilizador_id: number,
    filters?: ContabilidadeFilters
  ): Promise<UserActivitySummary | null> {
    loading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams();
      if (filters?.data_inicio)
        params.append("data_inicio", filters.data_inicio);
      if (filters?.data_fim) params.append("data_fim", filters.data_fim);
      if (filters?.clinica_id)
        params.append("clinica_id", String(filters.clinica_id));

      const qs = params.toString() ? `?${params}` : "";

      userSummary.value = await get(
        `contabilidade/utilizador/${utilizador_id}/resumo${qs}`
      );
      return userSummary.value;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(
        `Erro ao buscar resumo do utilizador ${utilizador_id}:`,
        err
      );
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Get detailed user activity
   */
  async function getUserDetails(
    utilizador_id: number,
    filters?: ContabilidadeFilters
  ): Promise<UserActivityDetail[] | null> {
    loading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams();
      if (filters?.data_inicio)
        params.append("data_inicio", filters.data_inicio);
      if (filters?.data_fim) params.append("data_fim", filters.data_fim);
      if (filters?.modulo) params.append("modulo", filters.modulo);
      if (filters?.limit) params.append("limit", String(filters.limit));
      if (filters?.clinica_id)
        params.append("clinica_id", String(filters.clinica_id));

      const qs = params.toString() ? `?${params}` : "";

      const data = await get(
        `contabilidade/utilizador/${utilizador_id}/detalhes${qs}`
      );
      return data;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(
        `Erro ao buscar detalhes do utilizador ${utilizador_id}:`,
        err
      );
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Get financial summary
   */
  async function getFinancialSummary(
    filters?: ContabilidadeFilters
  ): Promise<FinancialOperationsSummary | null> {
    loading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams();
      if (filters?.data_inicio)
        params.append("data_inicio", filters.data_inicio);
      if (filters?.data_fim) params.append("data_fim", filters.data_fim);
      if (filters?.clinica_id)
        params.append("clinica_id", String(filters.clinica_id));

      const qs = params.toString() ? `?${params}` : "";

      financialSummary.value = await get(
        `contabilidade/financeiro/resumo${qs}`
      );
      return financialSummary.value;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error("Erro ao buscar resumo financeiro:", err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Get timeline of activities
   */
  async function getTimeline(
    filters?: ContabilidadeFilters
  ): Promise<TimelineEntry[] | null> {
    loading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams();
      if (filters?.data_inicio)
        params.append("data_inicio", filters.data_inicio);
      if (filters?.data_fim) params.append("data_fim", filters.data_fim);
      if (filters?.modulo) params.append("modulo", filters.modulo);
      if (filters?.utilizador_id)
        params.append("utilizador_id", String(filters.utilizador_id));
      if (filters?.limit) params.append("limit", String(filters.limit));
      if (filters?.clinica_id)
        params.append("clinica_id", String(filters.clinica_id));

      const qs = params.toString() ? `?${params}` : "";

      const data = await get(`contabilidade/timeline${qs}`);
      return data;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error("Erro ao buscar timeline:", err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Get daily activity breakdown
   */
  async function getDailyActivity(
    filters?: ContabilidadeFilters
  ): Promise<DailyActivitySummary[] | null> {
    loading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams();
      if (filters?.data_inicio)
        params.append("data_inicio", filters.data_inicio);
      if (filters?.data_fim) params.append("data_fim", filters.data_fim);
      if (filters?.clinica_id)
        params.append("clinica_id", String(filters.clinica_id));

      const qs = params.toString() ? `?${params}` : "";

      const data = await get(`contabilidade/atividade-diaria${qs}`);
      return data;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error("Erro ao buscar atividade diária:", err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Get today's stats (quick widget)
   */
  async function getTodayStats(
    clinica_id?: number
  ): Promise<QuickStats | null> {
    loading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams();
      if (clinica_id) params.append("clinica_id", String(clinica_id));

      const qs = params.toString() ? `?${params}` : "";

      const data = await get(`contabilidade/stats/hoje${qs}`);
      return data;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error("Erro ao buscar estatísticas de hoje:", err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Get week stats (quick widget)
   */
  async function getWeekStats(clinica_id?: number): Promise<WeekStats | null> {
    loading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams();
      if (clinica_id) params.append("clinica_id", String(clinica_id));

      const qs = params.toString() ? `?${params}` : "";

      const data = await get(`contabilidade/stats/semana${qs}`);
      return data;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error("Erro ao buscar estatísticas da semana:", err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Get month stats (quick widget)
   */
  async function getMonthStats(clinica_id?: number): Promise<MonthStats | null> {
    loading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams();
      if (clinica_id) params.append("clinica_id", String(clinica_id));

      const qs = params.toString() ? `?${params}` : "";

      const data = await get(`contabilidade/stats/mes${qs}`);
      return data;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error("Erro ao buscar estatísticas do mês:", err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  return {
    // Estado
    loading,
    error,
    dashboardSummary,
    moduleSummary,
    userSummary,
    financialSummary,

    // Métodos
    getDashboard,
    getModuleSummary,
    getUserSummary,
    getUserDetails,
    getFinancialSummary,
    getTimeline,
    getDailyActivity,
    getTodayStats,
    getWeekStats,
    getMonthStats,
  };
}
