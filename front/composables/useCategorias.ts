import type { Categoria, CategoriaCreate, CategoriaUpdate } from '~/types/categoria';

export function useCategorias() {
  const { get, post, put, delete: del } = useApiService();

  const categorias = ref<Categoria[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Fetch all categories
  async function fetchCategorias() {
    loading.value = true;
    error.value = null;

    try {
      categorias.value = await get('categorias');
      return categorias.value;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error('Erro ao buscar categorias:', err);
      return [];
    } finally {
      loading.value = false;
    }
  }

  // Get a category by ID
  async function getCategoriaById(id: number): Promise<Categoria | null> {
    loading.value = true;
    error.value = null;

    try {
      const categoria = await get(`categorias/${id}`);
      return categoria;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao buscar categoria ${id}:`, err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  // Create a new category
  async function createCategoria(data: CategoriaCreate): Promise<Categoria | null> {
    loading.value = true;
    error.value = null;

    try {
      const resultado = await post('categorias', data);
      await fetchCategorias(); // Refresh the list
      return resultado;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error('Erro ao criar categoria:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  // Update an existing category
  async function updateCategoria(id: number, data: CategoriaUpdate): Promise<Categoria | null> {
    loading.value = true;
    error.value = null;

    try {
      const resultado = await put(`categorias/${id}`, data);
      
      // Update local list
      const index = categorias.value.findIndex(c => c.id === id);
      if (index !== -1) {
        categorias.value[index] = resultado;
      }
      
      return resultado;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao atualizar categoria ${id}:`, err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  // Delete a category
  async function deleteCategoria(id: number): Promise<boolean> {
    loading.value = true;
    error.value = null;

    try {
      await del(`categorias/${id}`);
      
      // Remove from local list
      categorias.value = categorias.value.filter(c => c.id !== id);
      
      return true;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao remover categoria ${id}:`, err);
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    categorias,
    loading,
    error,
    fetchCategorias,
    getCategoriaById,
    createCategoria,
    updateCategoria,
    deleteCategoria
  };
}