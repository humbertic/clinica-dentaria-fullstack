import type { Categoria } from './categoria';

// Estrutura mínima de artigo
export interface ArtigoMinimal {
  id: number;
  codigo: string;
  descricao: string;
}

// Estrutura básica de artigo
export interface ArtigoBase {
  codigo: string;
  descricao: string;
  categoria_id: number;
  requer_dente: boolean;
  requer_face: boolean;
  face_count: number | null;
}

// Preço relacionado ao artigo
export interface PrecoArtigo {
  valor_entidade: string;
  valor_paciente: string;
  artigo: ArtigoMinimal;
  entidade: {
    id: number;
    nome: string;
  };
}

// Artigo completo (resposta da API)
export interface Artigo {
  id: number;
  codigo: string;
  descricao: string;
  categoria: {
    slug: string;
    nome: string;
    ordem: number;
    id: number;
  };
  precos: PrecoArtigo[];
  requer_dente: boolean;
  requer_face: boolean;
  face_count: number | null;
}

// DTOs para criação e atualização
export interface ArtigoCreate extends ArtigoBase {}

export interface ArtigoUpdate {
  codigo?: string;
  descricao?: string;
  categoria_id?: number;
  requer_dente?: boolean;
  requer_face?: boolean;
  face_count?: number | null;
}