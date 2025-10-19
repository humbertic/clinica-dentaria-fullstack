
export interface ArtigoMinimal {
  id: number;
  descricao: string;
  codigo: string;
}

export interface PlanoItem {
  id: number;
  plano_id: number;
  artigo_id: number;
  artigo?: ArtigoMinimal;
  quantidade_prevista: number;
  quantidade_executada: number;
  numero_dente?: number;
  face?: string[];
  estado: 'pendente' | 'em_curso' | 'concluido' | 'cancelado';
}

export interface PlanoTratamentoBase {
  id: number;
  paciente_id: number;
  descricao: string;
  estado?: 'em_curso' | 'concluido_parcial' | 'concluido_total';
}


export interface PlanoTratamento extends PlanoTratamentoBase {
  data_criacao: string;
  data_conclusao?: string;
  itens: PlanoItem[];
}

export interface PlanoTratamentoCreate {
  paciente_id: number;
  descricao: string;
}


export interface PlanoTratamentoUpdate {
  descricao?: string;
  estado?: 'em_curso' | 'concluido_parcial' | 'concluido_total';
}


export interface PlanoItemCreate {
  plano_id: number;
  artigo_id: number;
  quantidade_prevista: number;
  numero_dente?: number;
  face?: string[];
}


export interface PlanoItemUpdate {
  quantidade_prevista?: number;
  quantidade_executada?: number;
  numero_dente?: number;
  face?: string[];
  estado?: 'pendente' | 'em_curso' | 'concluido' | 'cancelado';
}