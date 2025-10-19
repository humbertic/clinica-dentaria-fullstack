import type { Paciente, PacienteCreate, PacienteUpdate } from '~/types/pacientes';

export function usePacientes() {
  const { get, post, put, delete: del } = useApiService();
  
  const pacientes = ref<Paciente[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  /**
   * Busca todos os pacientes da API
   */
  async function fetchPacientes(clinicaId?:number) {
    if (loading.value) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      const endpoint = clinicaId ? `pacientes?clinica_id=${clinicaId}` : 'pacientes';
      pacientes.value = await get(endpoint);
      return pacientes.value;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error('Erro ao buscar pacientes:', err);
      return [];
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * Busca um paciente específico pelo ID
   */
  async function fetchPacienteById(id: number): Promise<Paciente | null> {
    loading.value = true;
    error.value = null;
    
    try {
      const paciente = await get(`pacientes/${id}`);
      return paciente;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao buscar paciente ${id}:`, err);
      return null;
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * Busca pacientes por nome (para preenchimento de campo de busca)
   */
  async function searchPacientes(query: string): Promise<Paciente[]> {
    if (!query || query.length < 2) return [];
    
    try {
      const result = await get(`pacientes/search?q=${encodeURIComponent(query)}`);
      return result;
    } catch (err: unknown) {
      console.error('Erro ao buscar pacientes por nome:', err);
      return [];
    }
  }
  
  /**
   * Cria um novo paciente
   */
  async function createPaciente(data: PacienteCreate): Promise<Paciente | null> {
    loading.value = true;
    error.value = null;
    
    try {
      const resultado = await post('pacientes', data);
      
      // Atualiza a lista local
      await fetchPacientes();
      
      return resultado;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error('Erro ao criar paciente:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * Atualiza um paciente existente
   */
  async function updatePaciente(id: number, data: PacienteUpdate): Promise<Paciente | null> {
    loading.value = true;
    error.value = null;
    
    try {
      const resultado = await put(`pacientes/${id}`, data);
      
      // Atualiza a lista local
      const index = pacientes.value.findIndex((p:Paciente) => p.id === id);
      if (index !== -1) {
        pacientes.value[index] = resultado;
      }
      
      return resultado;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao atualizar paciente ${id}:`, err);
      return null;
    } finally {
      loading.value = false;
    }
  }
  
  return {
    // Estado
    pacientes,
    loading,
    error,
    
    // Métodos
    fetchPacientes,
    fetchPacienteById,
    searchPacientes,
    createPaciente,
    updatePaciente
  };
}