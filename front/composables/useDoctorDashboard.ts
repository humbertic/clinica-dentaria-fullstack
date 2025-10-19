import { ref, computed, watch } from "vue";
import { useMarcacoes } from "~/composables/useMarcacao";
import { usePacientes } from "~/composables/usePacientes";
import { useConsultas } from "~/composables/useConsultas";
import type { UtilizadorResponse } from "~/types/utilizador";
import type { Clinica } from "~/types/clinica";

export function useDoctorDashboard(
  loggedUser: UtilizadorResponse | null,
  clinic: Clinica | null
) {
  const { events, fetchMarcacoes } = useMarcacoes();
  const { pacientes, fetchPacientes } = usePacientes();
  const activeConsultation = ref<any>(null);
  const { fetchConsultas } = useConsultas();

  async function fetchActiveConsultation(): Promise<any> {
    if (!loggedUser?.id || !clinic?.id) return null;

    try {
      // Get all consultations for this doctor in this clinic
      const consultas = await fetchConsultas(clinic.id, loggedUser.id);

      // Find any consultation with estado="iniciada" or "em_andamento"
      const active = consultas.find(
        (c: { estado: string }) =>
          c.estado === "iniciada" || c.estado === "em_andamento"
      );
      activeConsultation.value = active || null;

      return active;
    } catch (error) {
      console.error("Error fetching active consultation:", error);
      return null;
    }
  }

  const proximasConsultas = computed(() =>
    events.value
      .filter((e) => 
        // Filter by doctor
        e.medico_id === loggedUser?.id && 
        // Only include consultations that are pending or scheduled
        (e.estado === "agendada" || e.estado === "iniciada") &&
        // Only include future consultations
        e.start.getTime() > Date.now()
      )
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, 1)
  );

  const estatisticas = computed(() => ({
    consultasHoje: events.value.filter(
      (e) =>
        e.medico_id === loggedUser?.id &&
        new Date(e.start).toDateString() === new Date().toDateString()
    ).length,
    pendentes: events.value.filter((e) => e.estado === "rascunho").length,
    faltas: events.value.filter((e) => e.estado === "falta").length,
  }));

  function loadAll() {
    if (clinic?.id && loggedUser?.id) {
      fetchMarcacoes(clinic.id, loggedUser.id);
      fetchPacientes(clinic.id);
    }
  }

  // Carrega sempre que mudar utilizador ou clínica
  watch([() => clinic?.id, () => loggedUser?.id], loadAll, { immediate: true });

  return {
    proximasConsultas,
    estatisticas,
    pacientes,
    fetchActiveConsultation,
    activeConsultation,
  };
}
