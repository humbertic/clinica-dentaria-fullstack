import { ref, computed, onMounted } from "vue";
import { useApiService } from "~/composables/apiService";
import type {
  MarcacaoRead,
  MarcacaoCreate,
  MarcacaoUpdate,
  VueCalEvent,
} from "~/types/marcacao";

export function useMarcacoes() {
  const { get, post, put, delete: del } = useApiService();
  const raw = ref<MarcacaoRead[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const events = computed<VueCalEvent[]>(() =>
    raw.value.map((m) => ({
      id: m.id,
      start: new Date(m.data_hora_inicio),
      end: new Date(m.data_hora_fim),
      title: m.titulo,
      allDay: false,
      draggable: false,
      resizable: false,
      deletable: m.estado === "agendada",
      paciente_id: m.paciente_id,
      medico_id: m.medico_id,
      clinic_id: m.clinic_id,
      agendada_por: m.agendada_por,
      entidade_id: m.entidade_id,
      observacoes: m.observacoes,
      estado: m.estado,
      paciente: m.paciente,
      entidade: m.entidade,
      class: `entidade-${m.entidade.slug.toLowerCase()}`,
    }))
  );

  async function fetchMarcacoes(clinicId?: number, medicoId?: number) {
    loading.value = true;
    error.value = null;

    try {
      // Monta query string dinamicamente
      const params = new URLSearchParams();
      if (clinicId !== undefined)
        params.append("clinica_id", clinicId.toString());
      if (medicoId !== undefined)
        params.append("medico_id", medicoId.toString());

      const url = params.toString()
        ? `marcacoes?${params.toString()}`
        : "marcacoes";
      const data = await get(url);
      raw.value = Array.isArray(data) ? (data as MarcacaoRead[]) : [];
    } catch (err: any) {
      error.value = err.message || String(err);
    } finally {
      loading.value = false;
    }
  }
  async function createMarcacao(payload: MarcacaoCreate) {
    loading.value = true;
    error.value = null;
    try {
      const m = (await post("marcacoes", payload)) as MarcacaoRead;
      raw.value.push(m);
      return m;
    } catch (e: any) {
      error.value = e.message || String(e);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function updateMarcacao(id: number, payload: MarcacaoUpdate) {
    loading.value = true;
    error.value = null;
    try {
      const m = (await put(`marcacoes/${id}`, payload)) as MarcacaoRead;
      const i = raw.value.findIndex((r) => r.id === id);
      if (i > -1) raw.value[i] = m;
      return m;
    } catch (e: any) {
      error.value = e.message || String(e);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function deleteMarcacao(id: number) {
    loading.value = true;
    error.value = null;
    try {
      await del(`marcacoes/${id}`);
      raw.value = raw.value.filter((r) => r.id !== id);
      return true;
    } catch (e: any) {
      error.value = e.message || String(e);
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    events,
    fetchMarcacoes,
    createMarcacao,
    updateMarcacao,
    deleteMarcacao,
    loading,
    error,
  };
}
