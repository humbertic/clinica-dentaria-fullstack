import { ref } from 'vue';
import type PrecoInfo from '~/types/preco'; // Ajuste o caminho conforme necessário



export function useTabelas() {
  const apiService = useApiService();
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  /**
   * Busca o preço de um artigo para uma entidade específica
   */
   async function getPrecoArtigo(artigoId: number, entidadeId: number): Promise<PrecoInfo | null> {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await apiService.get(`precos/${artigoId}/${entidadeId}`);
      
      if (data && typeof data === 'object') {
        return {
          preco_entidade: parseFloat(data.valor_entidade || 0),
          preco_paciente: parseFloat(data.valor_paciente || 0)
        };
      }
      
      console.warn(`Preço não encontrado para artigo ${artigoId} e entidade ${entidadeId}`);
      return null; // Return null instead of throwing an error
    } catch (err) {
      console.error('Erro ao buscar preço:', err);
      error.value = err instanceof Error ? err.message : 'Erro desconhecido';
      return null; // Return null on error too
    } finally {
      loading.value = false;
    }
  }
  
  return {
    loading,
    error,
    getPrecoArtigo
  };
}