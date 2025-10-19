// Main categoria type
export interface Categoria {
  id: number;
  slug: string;
  nome: string;
  ordem: number;
}

// For creating a new categoria
export interface CategoriaCreate {
  slug: string;
  nome: string;
  ordem: number;
}

// For updating an existing categoria
export interface CategoriaUpdate {
  slug?: string;
  nome?: string;
  ordem?: number;
}