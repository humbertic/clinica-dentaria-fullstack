// Stock Item
export interface StockItem {
  id: number;
  clinica_id: number;
  nome: string;
  descricao?: string;
  quantidade_minima: number;
  quantidade_atual: number;
  tipo_medida: string;
  fornecedor?: string;
  ativo: boolean;
  lote_proximo?: string;
  validade_proxima?: string;
  lotes?: StockLote[];
}

// Stock Lote (Batch)
export interface StockLote {
  id: number;
  item_id: number;
  lote: string;
  validade: string;
  quantidade: number;
}

// Stock Movement
export interface StockMovimento {
  id: number;
  item_id: number;
  tipo_movimento: 'entrada' | 'saida' | 'ajuste' | 'transferencia';
  quantidade: number;
  data: string;
  justificacao?: string;
  utilizador?: {
    id: number;
    nome: string;
  };
  lote?: string;
  validade?: string;
  destino_id?: number;
}

// Create/Update DTOs
export interface StockItemCreate {
  clinica_id: number;
  nome: string;
  descricao?: string;
  quantidade_minima: number;
  tipo_medida: string;
  fornecedor?: string;
  ativo?: boolean;
}

export interface StockItemUpdate {
  nome?: string;
  descricao?: string;
  quantidade_minima?: number;
  tipo_medida?: string;
  fornecedor?: string;
  ativo?: boolean;
}

export interface StockMovimentoCreate {
  item_id: number;
  tipo_movimento: 'entrada' | 'saida' | 'ajuste' | 'transferencia';
  quantidade: number;
  justificacao?: string;
  utilizador_id: number;
  lote?: string;
  validade?: string;
  destino_id?: number;
}

// Stock Alerts
export interface StockAlertaItem {
  id: number;
  nome: string;
  quantidade_atual: number;
  quantidade_minima: number;
  tipo_medida: string;
}

export interface StockAlertaExpirando {
  id: number;
  nome: string;
  lote: string;
  quantidade: number;
  validade: string;
  dias_restantes: number;
  tipo_medida: string;
}

export interface StockAlertasResponse {
  detail: string;
  alertas: {
    itens_baixo_stock: number;
    itens_expirando: number;
    total: number;
  };
}
