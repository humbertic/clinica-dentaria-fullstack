// types/prices.ts
export interface Categoria {
  id: number;
  nome: string;
}

export interface Entidade {
  id: number;
  nome: string;
}

// Backend (API) models
export interface PrecoBackend {
  entidade_id: number;
  valor_entidade: number;
  valor_paciente: number;
}

export interface ArtigoBackend {
  id: number;
  codigo: string;
  descricao: string;
  categoria: Categoria;
  precos: PrecoBackend[];
}

// UI models (com estrutura aninhada)
export interface PrecoUI {
  valor_entidade: string | number;
  valor_paciente: string | number;
  entidade: {
    id: number;
    nome: string;
  };
  artigo: {
    id: number;
    descricao: string;
  };
}

export interface ArtigoUI {
  id: number;
  codigo: string;
  descricao: string;
  categoria: Categoria;
  precos: PrecoUI[];
}

export interface PriceFormModel {
  entidade_id: number
  valor_entidade: number
  valor_paciente: number
  artigo?: {
    id: number
    descricao: string
  }
  entidade?: {
    id: number
    nome: string
  }
}