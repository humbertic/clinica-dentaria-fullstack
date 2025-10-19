import { ref } from "vue";
import type {
  Orcamento,
  CreateOrcamentoDTO,
  UpdateOrcamentoDTO,
  UpdateOrcamentoStatusDTO,
  AddItemOrcamentoDTO,
} from "~/types/orcamento";

export function useOrcamentos() {
  const { get, post, put, delete: del } = useApiService();

  const orcamentos = ref<Orcamento[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

async function fetchOrcamentos(
    clinica_id?: number,
    medico_id?:  number
  ): Promise<Orcamento[]|null> {
    loading.value = true
    error.value   = null

    try {
      const params = new URLSearchParams()
      if (clinica_id) params.append('clinica_id', String(clinica_id))
      if (medico_id)  params.append('medico_id',  String(medico_id))
      const qs = params.toString() ? `?${params}` : ''

      orcamentos.value = await get(`orcamentos${qs}`)
      return orcamentos.value
    } catch (err: any) {
      error.value = err.message ?? String(err)
      console.error('Erro ao buscar orçamentos:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  async function fetchOrcamentoById(id: number) {
    loading.value = true;
    error.value = null;

    try {
      const orcamento = await get(`orcamentos/${id}`);
      return orcamento;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao buscar orçamento ${id}:`, err);
      return null;
    } finally {
      loading.value = false;
    }
  }


  async function fetchOrcamentosByPaciente(pacienteId: number) {
    loading.value = true
    error.value = null
    try {
      orcamentos.value = await get(`orcamentos?paciente_id=${pacienteId}`)
    } catch (err: any) {
      error.value = err.message || String(err)
      console.error(`Erro ao buscar orçamentos do paciente ${pacienteId}:`, err)
    } finally {
      loading.value = false
    }
  }

  async function createOrcamento(pacienteId: number, entidadeId: number) {
    loading.value = true;
    error.value = null;

    try {
      const data: CreateOrcamentoDTO = {
        paciente_id: pacienteId,
        entidade_id: entidadeId,
        data: new Date().toISOString().split("T")[0],
      };

      const resultado = await post("orcamentos", data);

      await fetchOrcamentos();

      return resultado.id;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error("Erro ao criar orçamento:", err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function updateOrcamento(id: number, data: UpdateOrcamentoDTO) {
    loading.value = true;
    error.value = null;

    try {
      const resultado = await put(`orcamentos/${id}`, data);

      const index = orcamentos.value.findIndex((o) => o.id === id);
      if (index !== -1) {
        orcamentos.value[index] = resultado;
      }

      return resultado;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao atualizar orçamento ${id}:`, err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function deleteOrcamento(id: number) {
    loading.value = true;
    error.value = null;

    try {
      await del(`orcamentos/${id}`);

      orcamentos.value = orcamentos.value.filter((o) => o.id !== id);

      return true;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao remover orçamento ${id}:`, err);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function updateOrcamentoStatus(
    id: number,
    estado: "rascunho" | "aprovado" | "rejeitado"
  ) {
    loading.value = true;
    error.value = null;

    try {
      const resultado = await put(`orcamentos/${id}/estado`, { estado });

      const index = orcamentos.value.findIndex((o) => o.id === id);
      if (index !== -1) {
        orcamentos.value[index].estado = estado;
      }

      return resultado;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao atualizar estado do orçamento ${id}:`, err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function addItemToOrcamento(
    orcamentoId: number,
    item: AddItemOrcamentoDTO
  ) {
    loading.value = true;
    error.value = null;

    try {
      const resultado = await post(`orcamentos/${orcamentoId}/itens`, item);
      return resultado;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao adicionar item ao orçamento ${orcamentoId}:`, err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function deleteItemFromOrcamento(orcamentoId: number, itemId: number) {
    loading.value = true;
    error.value = null;

    try {
      await del(`orcamentos/${orcamentoId}/itens/${itemId}`);
      return true;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(
        `Erro ao remover item ${itemId} do orçamento ${orcamentoId}:`,
        err
      );
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    // Estado
    orcamentos,
    loading,
    error,

    // Métodos
    fetchOrcamentos,
    fetchOrcamentoById,
    fetchOrcamentosByPaciente,
    createOrcamento,
    updateOrcamento,
    deleteOrcamento,
    updateOrcamentoStatus,
    addItemToOrcamento,
    deleteItemFromOrcamento,
  };
}
