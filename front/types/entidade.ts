export interface EntidadeBase {
  slug: string;
  nome: string;
}

export interface EntidadeCreate extends EntidadeBase {
  // Mesmo que o base - para criação
}

export interface EntidadeUpdate extends EntidadeBase {
  // Mesmo que o base - para atualização
}

export interface EntidadeResponse extends EntidadeBase {
  id: number;
}

// Tipo principal para uso nos componentes
export type Entidade = EntidadeResponse;