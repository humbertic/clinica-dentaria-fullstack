import { ref } from 'vue';
import type { Artigo, ArtigoCreate, ArtigoUpdate } from '~/types/artigo';
import { useApiService } from './apiService';

export function useArtigos() {
  const { get, post, put, delete: del } = useApiService();
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
      const data = await get('artigos');

      if (data) {
        artigos.value = data as Artigo[];
      } else {
        throw new Error('Dados de artigos não retornados pela API');
      }
      return artigos.value;
    } catch (err) {
      console.error('Erro ao buscar artigos:', err);
      error.value = err instanceof Error ? err.message : 'Erro desconhecido';
      return [];
    } finally {
      loading.value = false;
    }
  }

  /**
   * Busca um artigo específico por ID
   */
  async function fetchArtigoById(id: number): Promise<Artigo | null> {
    loading.value = true;
    error.value = null;

    try {
      const data = await get(`artigos/${id}`);
      return data as Artigo;
    } catch (err) {
      console.error(`Erro ao buscar artigo ${id}:`, err);
      error.value = err instanceof Error ? err.message : 'Erro desconhecido';
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Cria um novo artigo
   */
  async function createArtigo(data: ArtigoCreate): Promise<Artigo | null> {
    loading.value = true;
    error.value = null;

    try {
      const resultado = await post('artigos', data);

      // Atualiza a lista local
      artigos.value.push(resultado);

      return resultado;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error('Erro ao criar artigo:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Atualiza um artigo existente
   */
  async function updateArtigo(id: number, data: ArtigoUpdate): Promise<Artigo | null> {
    loading.value = true;
    error.value = null;

    try {
      const resultado = await put(`artigos/${id}`, data);

      // Atualiza a lista local
      const index = artigos.value.findIndex((a: Artigo) => a.id === id);
      if (index !== -1) {
        artigos.value[index] = resultado;
      }

      return resultado;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao atualizar artigo ${id}:`, err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Remove um artigo
   */
  async function deleteArtigo(id: number): Promise<boolean> {
    loading.value = true;
    error.value = null;

    try {
      await del(`artigos/${id}`);

      // Remove da lista local
      artigos.value = artigos.value.filter((a: Artigo) => a.id !== id);

      return true;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao remover artigo ${id}:`, err);
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    // Estado
    artigos,
    loading,
    error,

    // Métodos
    fetchArtigos,
    fetchArtigoById,
    createArtigo,
    updateArtigo,
    deleteArtigo,

    // Alias para compatibilidade
    loadingArtigos: loading
  };
}