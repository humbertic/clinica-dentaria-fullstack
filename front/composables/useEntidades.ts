import { ref } from 'vue';
import type { Entidade, EntidadeCreate, EntidadeUpdate } from '~/types/entidade';

export function useEntidades() {
  const { get, post, put, delete: del } = useApiService();
  
  const entidades = ref<Entidade[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  async function fetchEntidades() {
    if (loading.value) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      entidades.value = await get('entidades');
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error('Erro ao buscar entidades:', err);
    } finally {
      loading.value = false;
    }
  }
  
  async function fetchEntidadeById(id: number): Promise<Entidade | null> {
    loading.value = true;
    error.value = null;
    
    try {
      const entidade = await get(`entidades/${id}`);
      return entidade;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao buscar entidade ${id}:`, err);
      return null;
    } finally {
      loading.value = false;
    }
  }
  
  async function createEntidade(data: EntidadeCreate): Promise<Entidade | null> {
    loading.value = true;
    error.value = null;
    
    try {
      const resultado = await post('entidades', data);
      
      // Atualiza a lista local
      await fetchEntidades();
      
      return resultado;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error('Erro ao criar entidade:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }
  
  async function updateEntidade(id: number, data: EntidadeUpdate): Promise<Entidade | null> {
    loading.value = true;
    error.value = null;
    
    try {
      const resultado = await put(`entidades/${id}`, data);
      
      // Atualiza a lista local
      const index = entidades.value.findIndex(e => e.id === id);
      if (index !== -1) {
        entidades.value[index] = resultado;
      }
      
      return resultado;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao atualizar entidade ${id}:`, err);
      return null;
    } finally {
      loading.value = false;
    }
  }
  
  async function deleteEntidade(id: number): Promise<boolean> {
    loading.value = true;
    error.value = null;
    
    try {
      await del(`/entidades/${id}`);
      
      // Remove da lista local
      entidades.value = entidades.value.filter(e => e.id !== id);
      
      return true;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao remover entidade ${id}:`, err);
      return false;
    } finally {
      loading.value = false;
    }
  }
  
  return {
    // Estado
    entidades,
    loading,
    error,
    
    // Métodos
    fetchEntidades,
    fetchEntidadeById,
    createEntidade,
    updateEntidade,
    deleteEntidade
  };
}