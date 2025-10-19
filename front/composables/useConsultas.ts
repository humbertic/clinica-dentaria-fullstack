import { ref, computed } from "vue";
import type {
  ConsultaCreate,
  ConsultaRead,
  ConsultaFull,
  ConsultaUpdate,
  ConsultaItemCreate,
  ConsultaItemRead,
  ConsultaItemUpdate,
} from "~/types/consulta";

export function useConsultas() {
  const { get, post, put, patch, delete: del } = useApiService();

  const consultas = ref<ConsultaFull[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const currentConsulta = ref<ConsultaFull | null>(null);

  // Get all consultas, optionally filtered by clinica_id or medico_id or paciente_id
  async function fetchConsultas(
    clinica_id?: number,
    medico_id?: number,
    paciente_id?: number
  ) {
    loading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams();
      if (clinica_id) params.append("clinica_id", clinica_id.toString());
      if (medico_id) params.append("medico_id", medico_id.toString());
      if (paciente_id) params.append("paciente_id", paciente_id.toString());

      const queryString = params.toString() ? `?${params.toString()}` : "";
      const data = await get(`consultas${queryString}`);

      // Se não estamos filtrando por paciente, atualizamos a lista global
      if (!paciente_id) {
        consultas.value = data;
      }

      return data;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error("Erro ao buscar consultas:", err);
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function getConsultasByPacienteEClinica(
    clinicaId: number,
    pacienteId: number
  ): Promise<ConsultaFull[]> {
    return fetchConsultas(clinicaId, undefined, pacienteId);
  }

  // Get a single consulta by ID
  async function getConsulta(id: number): Promise<ConsultaFull | null> {
    loading.value = true;
    error.value = null;

    try {
      const data = await get(`consultas/${id}`);
      currentConsulta.value = data;
      return data;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao buscar consulta ${id}:`, err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  // Create a new consulta
  async function createConsulta(
    consulta: ConsultaCreate
  ): Promise<ConsultaRead | null> {
    loading.value = true;
    error.value = null;

    try {
      const data = await post("consultas", consulta);
      return data;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error("Erro ao criar consulta:", err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  // Update an existing consulta
  async function updateConsulta(
    id: number,
    changes: ConsultaUpdate
  ): Promise<ConsultaRead | null> {
    loading.value = true;
    error.value = null;

    try {
      const data = await put(`consultas/${id}`, changes);
      return data;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao atualizar consulta ${id}:`, err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  // Add an item to a consulta
  async function addConsultaItem(
    consultaId: number,
    item: ConsultaItemCreate
  ): Promise<ConsultaItemRead | null> {
    loading.value = true;
    error.value = null;

    try {
      const data = await post(`consultas/${consultaId}/itens`, item);
      return data;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao adicionar item à consulta ${consultaId}:`, err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  // Update a consulta item
  async function updateConsultaItem(
    itemId: number,
    changes: ConsultaItemUpdate
  ): Promise<ConsultaItemRead | null> {
    loading.value = true;
    error.value = null;

    try {
      const data = await put(`consultas/itens/${itemId}`, changes);
      return data;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao atualizar item ${itemId}:`, err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  // Delete a consulta item
  async function deleteConsultaItem(itemId: number): Promise<boolean> {
    loading.value = true;
    error.value = null;

    try {
      await del(`consultas/itens/${itemId}`);
      return true;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao eliminar item ${itemId}:`, err);
      return false;
    } finally {
      loading.value = false;
    }
  }

  // Calculate total value of a consulta
  const totalConsulta = computed(() => {
    if (!currentConsulta.value?.itens?.length) return 0;
    return currentConsulta.value.itens.reduce(
      (sum, item) => sum + item.total,
      0
    );
  });

  // Get consultas by estado
  const consultasByEstado = computed(() => {
    const result: Record<string, ConsultaFull[]> = {
      iniciada: [],
      concluida: [],
      cancelada: [],
      // Add other estados as needed
    };

    consultas.value.forEach((consulta) => {
      const estado = consulta.estado;
      if (result[estado]) {
        result[estado].push(consulta);
      } else {
        result[estado] = [consulta];
      }
    });

    return result;
  });

  return {
    consultas,
    loading,
    error,
    currentConsulta,
    totalConsulta,
    consultasByEstado,
    fetchConsultas,
    getConsulta,
    createConsulta,
    updateConsulta,
    addConsultaItem,
    updateConsultaItem,
    deleteConsultaItem,
    getConsultasByPacienteEClinica,
  };
}
