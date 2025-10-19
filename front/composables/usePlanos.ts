import { ref } from "vue";
import type { PlanoTratamento } from "~/types/plano";
import type { ConsultaItemBase } from "~/types/consulta";

export function usePlanos() {
  const { get, post, put, delete: del } = useApiService();

  const planos = ref<PlanoTratamento[]>([]);
  const currentPlano = ref<PlanoTratamento | null>(null);
  const planoAtivo = ref<PlanoTratamento | null>(null);
  const loadingPlano = ref(false);
  const error = ref<string | null>(null);

  /**
   * Fetch active treatment plan for a patient
   */
  async function fetchPlanoAtivo(
    pacienteId: number
  ): Promise<PlanoTratamento | null> {
    loadingPlano.value = true;
    error.value = null;

    try {
      const data = await get(`pacientes/planos/${pacienteId}/plano-ativo`);
      planoAtivo.value = data;
      return data;
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("404")) {
        // Not found is an expected case - patient might not have an active plan
        console.info(`Paciente ${pacienteId} não possui plano ativo.`);
        planoAtivo.value = null;
        return null;
      }

      error.value = err instanceof Error ? err.message : String(err);
      console.error(
        `Erro ao buscar plano ativo para paciente ${pacienteId}:`,
        err
      );
      return null;
    } finally {
      loadingPlano.value = false;
    }
  }

  /**
   * Get all treatment plans for a patient
   */
  async function fetchPlanosPaciente(
    pacienteId: number
  ): Promise<PlanoTratamento[]> {
    loadingPlano.value = true;
    error.value = null;

    try {
      const data = await get(`pacientes/planos/${pacienteId}/planos`);
      planos.value = data;
      return data;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao buscar planos para paciente ${pacienteId}:`, err);
      return [];
    } finally {
      loadingPlano.value = false;
    }
  }

  /**
   * Get a specific treatment plan by ID
   */
  async function getPlano(planoId: number): Promise<PlanoTratamento | null> {
    loadingPlano.value = true;
    error.value = null;

    try {
      const data = await get(`planos/${planoId}`);
      currentPlano.value = data;
      return data;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao buscar plano ${planoId}:`, err);
      return null;
    } finally {
      loadingPlano.value = false;
    }
  }
  async function startProcedimento(
    planoItemId: number,
    consultaId: number
  ): Promise<ConsultaItemBase | null> {
    loadingPlano.value = true;
    error.value = null;

    try {
      // Send consulta_id as query parameter instead of in the request body
      const data = await post(
        `pacientes/planos/itens/${planoItemId}/start?consulta_id=${consultaId}`,
        {}
      );

      if (planoAtivo.value) {
        const updatedItem = planoAtivo.value.itens?.find(
          (item) => item.id === planoItemId
        );
        if (updatedItem) {
          updatedItem.estado = "concluido";
          updatedItem.quantidade_executada += 1;
        }
      }

      return data;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(
        `Erro ao iniciar procedimento do plano (item ${planoItemId}):`,
        err
      );
      return null;
    } finally {
      loadingPlano.value = false;
    }
  }
  async function getRecentlyCompletedPlans(
    pacienteId: number,
    hours: number = 1
  ): Promise<PlanoTratamento[]> {
    loadingPlano.value = true;
    error.value = null;

    try {
      const response = await get(
        `pacientes/planos/completed?paciente_id=${pacienteId}&hours=${hours}`
      );
      return response || [];
    } catch (err) {
      console.error("Erro ao buscar planos recentemente concluídos:", err);
      error.value = err instanceof Error ? err.message : String(err);
      return [];
    } finally {
      loadingPlano.value = false;
    }
  }

  async function getRecentCompletedPlan(
    pacienteId: number
  ): Promise<PlanoTratamento | null> {
    try {
      const recentPlans = await getRecentlyCompletedPlans(pacienteId, 1);
      return recentPlans.length > 0 ? recentPlans[0] : null;
    } catch (err) {
      console.error("Erro ao verificar plano recentemente concluído:", err);
      return null;
    }
  }

  return {
    planos,
    currentPlano,
    planoAtivo,
    loadingPlano,
    error,
    fetchPlanoAtivo,
    fetchPlanosPaciente,
    getPlano,
    startProcedimento,
    getRecentlyCompletedPlans,
    getRecentCompletedPlan,
  };
}
