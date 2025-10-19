import { ref } from 'vue';
import type { Artigo } from '~/types/artigo';
import { useApiService } from './apiService';

export function useArtigos() {
  const apiService = useApiService();
  const artigos = ref<Artigo[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  /**
   * Busca todos os artigos da API
   */
  async function fetchArtigos() {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await apiService.get('artigos');
      
      if (data) {
        artigos.value = data as Artigo[];
      } else {
        throw new Error('Dados de artigos não retornados pela API');
      }
    } catch (err) {
      console.error('Erro ao buscar artigos:', err);
      error.value = err instanceof Error ? err.message : 'Erro desconhecido';
      throw err;
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * Busca um artigo específico por ID
   */
  async function fetchArtigoById(id: number) {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await apiService.get(`artigos/${id}`);
      
      if (data) {
        return data as Artigo;
      } else {
        throw new Error(`Artigo com ID ${id} não encontrado`);
      }
    } catch (err) {
      console.error(`Erro ao buscar artigo ${id}:`, err);
      error.value = err instanceof Error ? err.message : 'Erro desconhecido';
      throw err;
    } finally {
      loading.value = false;
    }
  }
  
  return {
    artigos,
    loading,
    error,
    fetchArtigos,
    fetchArtigoById,
    loadingArtigos: loading // alias para compatibilidade
  };
}