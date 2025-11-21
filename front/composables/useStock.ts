import { ref } from 'vue';
import { useToast } from '@/components/ui/toast';
import type {
  StockItem,
  StockItemCreate,
  StockItemUpdate,
  StockMovimento,
  StockMovimentoCreate,
} from '@/types/stock';

export function useStock() {
  const { toast } = useToast();
  const { get, post, put } = useApiService();

  const items = ref<StockItem[]>([]);
  const loading = ref(false);
  const loadingMovimentos = ref(false);

  // ========== Items ==========

  /**
   * Buscar todos os itens de stock de uma clínica
   * @param clinicaId ID da clínica
   */
  async function fetchItems(clinicaId: number): Promise<StockItem[]> {
    loading.value = true;
    try {
      const data = await get(`stock/items/${clinicaId}`) as StockItem[];
      items.value = data;
      return data;
    } catch (error: any) {
      console.error("Erro ao buscar itens:", error);
      toast({
        title: "Erro ao buscar itens",
        description: error.message || "Não foi possível carregar os itens de stock.",
        variant: "destructive",
      });
      items.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  }

  /**
   * Buscar um item específico por ID
   * @param itemId ID do item
   */
  async function fetchItem(itemId: number): Promise<StockItem | null> {
    loading.value = true;
    try {
      const data = await get(`stock/item/${itemId}`) as StockItem;
      return data;
    } catch (error: any) {
      console.error("Erro ao buscar item:", error);
      toast({
        title: "Erro ao buscar item",
        description: error.message || "Não foi possível carregar o item.",
        variant: "destructive",
      });
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Criar um novo item de stock
   * @param item Dados do item
   */
  async function createItem(item: StockItemCreate): Promise<StockItem | null> {
    loading.value = true;
    try {
      const data = await post('stock/items', item) as StockItem;
      toast({
        title: "Item criado",
        description: `O item "${data.nome}" foi criado com sucesso.`,
      });
      return data;
    } catch (error: any) {
      console.error("Erro ao criar item:", error);
      toast({
        title: "Erro ao criar item",
        description: error.message || "Não foi possível criar o item.",
        variant: "destructive",
      });
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Atualizar um item de stock
   * @param itemId ID do item
   * @param item Dados atualizados
   */
  async function updateItem(
    itemId: number,
    item: StockItemUpdate
  ): Promise<StockItem | null> {
    loading.value = true;
    try {
      const data = await put(`stock/item/${itemId}`, item) as StockItem;
      toast({
        title: "Item atualizado",
        description: `O item "${data.nome}" foi atualizado com sucesso.`,
      });
      return data;
    } catch (error: any) {
      console.error("Erro ao atualizar item:", error);
      toast({
        title: "Erro ao atualizar item",
        description: error.message || "Não foi possível atualizar o item.",
        variant: "destructive",
      });
      return null;
    } finally {
      loading.value = false;
    }
  }

  // ========== Movimentos ==========

  /**
   * Buscar movimentos de um item
   * @param itemId ID do item
   */
  async function fetchMovimentos(itemId: number): Promise<StockMovimento[]> {
    loadingMovimentos.value = true;
    try {
      const data = await get(`stock/movimentos/${itemId}`) as StockMovimento[];
      return data;
    } catch (error: any) {
      console.error("Erro ao buscar movimentos:", error);
      toast({
        title: "Erro ao buscar movimentos",
        description: error.message || "Não foi possível carregar os movimentos.",
        variant: "destructive",
      });
      return [];
    } finally {
      loadingMovimentos.value = false;
    }
  }

  /**
   * Criar um movimento de stock
   * @param movimento Dados do movimento
   */
  async function createMovimento(
    movimento: StockMovimentoCreate
  ): Promise<StockMovimento | null> {
    loading.value = true;
    try {
      const data = await post('stock/movimentos', movimento) as StockMovimento;

      const tipoLabel = {
        entrada: 'Entrada',
        saida: 'Saída',
        ajuste: 'Ajuste',
        transferencia: 'Transferência',
      }[movimento.tipo_movimento] || movimento.tipo_movimento;

      toast({
        title: `${tipoLabel} registada`,
        description: `Movimento de ${movimento.quantidade} unidade(s) registado com sucesso.`,
      });
      return data;
    } catch (error: any) {
      console.error("Erro ao criar movimento:", error);
      toast({
        title: "Erro ao criar movimento",
        description: error.message || "Não foi possível criar o movimento.",
        variant: "destructive",
      });
      return null;
    } finally {
      loading.value = false;
    }
  }

  // ========== Helpers ==========

  /**
   * Verificar se um item tem stock baixo
   * @param item Item de stock
   */
  function isStockBaixo(item: StockItem): boolean {
    return item.quantidade_atual < item.quantidade_minima;
  }

  /**
   * Verificar se um item tem lotes próximos do vencimento
   * @param item Item de stock
   * @param diasLimite Dias limite para considerar "próximo" (default: 30)
   */
  function temLotesExpirando(item: StockItem, diasLimite: number = 30): boolean {
    if (!item.validade_proxima) return false;

    const validade = new Date(item.validade_proxima);
    const hoje = new Date();
    const diffTime = validade.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays >= 0 && diffDays <= diasLimite;
  }

  /**
   * Calcular dias até o vencimento do lote mais próximo
   * @param item Item de stock
   */
  function diasAteVencimento(item: StockItem): number | null {
    if (!item.validade_proxima) return null;

    const validade = new Date(item.validade_proxima);
    const hoje = new Date();
    const diffTime = validade.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  /**
   * Filtrar itens com stock baixo
   * @param itens Lista de itens
   */
  function filterStockBaixo(itens: StockItem[]): StockItem[] {
    return itens.filter(isStockBaixo);
  }

  /**
   * Filtrar itens com lotes expirando
   * @param itens Lista de itens
   * @param diasLimite Dias limite (default: 30)
   */
  function filterExpirando(itens: StockItem[], diasLimite: number = 30): StockItem[] {
    return itens.filter(item => temLotesExpirando(item, diasLimite));
  }

  return {
    // State
    items,
    loading,
    loadingMovimentos,

    // Item operations
    fetchItems,
    fetchItem,
    createItem,
    updateItem,

    // Movimento operations
    fetchMovimentos,
    createMovimento,

    // Helpers
    isStockBaixo,
    temLotesExpirando,
    diasAteVencimento,
    filterStockBaixo,
    filterExpirando,
  };
}
