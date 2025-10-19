// Enum para estado do orçamento (igual ao backend)
export type EstadoOrc = 'rascunho' | 'aprovado' | 'rejeitado';

// SCHEMAS DE ITENS

export interface OrcamentoItemBase {
  artigo_id: number;
  quantidade: number; // min: 1
  
  // Campos odontológicos específicos
  numero_dente?: number; // 11-48, 51-85
  face?: string[]; // M,D,V,L,O,I
  
  preco_entidade: number; // decimal
  preco_paciente: number; // decimal

  
  
  // Campo opcional que não está no backend mas útil na interface
  observacao?: string;
}

export interface OrcamentoItemCreate extends OrcamentoItemBase {
  // Mesmo que o base - usado para criação
}

export interface OrcamentoItemRead extends OrcamentoItemBase {
  id: number;
  subtotal_entidade: number; // calculado no backend
  subtotal_paciente: number; // calculado no backend
  
  // Campos expandidos para UI
  artigo?: {
    id: number;
    descricao: string;
    codigo?: string;
  };
}

// SCHEMAS DE ORÇAMENTO

export interface OrcamentoBase {
  paciente_id: number;
  entidade_id: number;
  data: string; // ISO date string
  observacoes?: string; // Renomeado para corresponder ao backend
}

export interface OrcamentoCreate extends OrcamentoBase {
  // Mesmo que o base - para criação
}

export interface OrcamentoRead extends OrcamentoBase {
  id: number;
  estado: EstadoOrc;
  total_entidade: number; // decimal
  total_paciente: number; // decimal
  itens: OrcamentoItemRead[];
  
  // Campos expandidos para UI
  paciente?: {
    id: number;
    nome: string;
  };
  entidade?: {
    id: number;
    nome: string;
  };
  data_aprovacao?: string; // ISO date string quando aprovado
}

// Tipo para atualização de orçamento (completo)
export interface OrcamentoUpdate {
  paciente_id?: number;
  entidade_id?: number;
  estado?: EstadoOrc;
  data?: string;
  data_aprovacao?: string;
  observacoes?: string;
}

// Tipo específico para atualizar apenas o estado (como no backend)
export interface OrcamentoUpdateEstado {
  estado: EstadoOrc;
}

// Tipo para o orçamento completo usado na UI
export type Orcamento = OrcamentoRead;

// Re-exports para compatibilidade com código existente
export type { 
  OrcamentoCreate as CreateOrcamentoDTO,
  OrcamentoUpdate as UpdateOrcamentoDTO,
  OrcamentoUpdateEstado as UpdateOrcamentoStatusDTO,
  OrcamentoItemCreate as AddItemOrcamentoDTO,
  OrcamentoItemBase as OrcamentoItem,
};