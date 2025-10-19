// Tipos de dados
export interface Paciente {
  id: number;
  nome: string;
  dataNascimento: string;
}

export interface Entidade {
  id: number;
  nome: string;
}

export interface Artigo {
  id: number;
  codigo: string;
  descricao: string;
  requer_dente: boolean;
  requer_face: boolean;
}

export interface Preco {
  artigo_id: number;
  entidade_id: number;
  valor_entidade: number;
  valor_paciente: number;
}

export interface OrcamentoItem {
  id: number;
  orcamento_id: number;
  artigo_id: number;
  dente?: number;
  faces?: string[];
  quantidade: number;
  valor_entidade: number;
  valor_paciente: number;
  subtotal_entidade: number;
  subtotal_paciente: number;
}

export interface Orcamento {
  id: number;
  data: string;
  paciente_id: number;
  entidade_id: number;
  estado: 'rascunho' | 'aprovado' | 'rejeitado';
  itens: OrcamentoItem[];
  total_entidade: number;
  total_paciente: number;
}

// Dados mock
export const pacientes: Paciente[] = [
  { id: 1, nome: 'Ana Silva', dataNascimento: '1985-05-12' },
  { id: 2, nome: 'João Pereira', dataNascimento: '1990-10-23' },
  { id: 3, nome: 'Maria Santos', dataNascimento: '1978-03-15' },
  { id: 4, nome: 'Carlos Oliveira', dataNascimento: '2000-12-07' }
];

export const entidades: Entidade[] = [
  { id: 1, nome: 'Seguradora A' },
  { id: 2, nome: 'Seguradora B' },
  { id: 3, nome: 'Particular' }
];

export const artigos: Artigo[] = [
  { id: 1, codigo: 'C001', descricao: 'Consulta de Avaliação', requer_dente: false, requer_face: false },
  { id: 2, codigo: 'R001', descricao: 'Restauração Simples', requer_dente: true, requer_face: true },
  { id: 3, codigo: 'R002', descricao: 'Restauração Complexa', requer_dente: true, requer_face: true },
  { id: 4, codigo: 'E001', descricao: 'Extração Simples', requer_dente: true, requer_face: false },
  { id: 5, codigo: 'E002', descricao: 'Extração Complexa', requer_dente: true, requer_face: false },
  { id: 6, codigo: 'T001', descricao: 'Tratamento Endodôntico', requer_dente: true, requer_face: false },
  { id: 7, codigo: 'P001', descricao: 'Prótese Removível', requer_dente: false, requer_face: false },
  { id: 8, codigo: 'P002', descricao: 'Coroa', requer_dente: true, requer_face: false },
  { id: 9, codigo: 'H001', descricao: 'Higienização', requer_dente: false, requer_face: false },
  { id: 10, codigo: 'O001', descricao: 'Ortodontia', requer_dente: false, requer_face: false }
];

export const precos: Preco[] = [
  { artigo_id: 1, entidade_id: 1, valor_entidade: 30, valor_paciente: 10 },
  { artigo_id: 1, entidade_id: 2, valor_entidade: 25, valor_paciente: 15 },
  { artigo_id: 1, entidade_id: 3, valor_entidade: 0, valor_paciente: 50 },
  
  { artigo_id: 2, entidade_id: 1, valor_entidade: 40, valor_paciente: 20 },
  { artigo_id: 2, entidade_id: 2, valor_entidade: 35, valor_paciente: 25 },
  { artigo_id: 2, entidade_id: 3, valor_entidade: 0, valor_paciente: 70 },
  
  { artigo_id: 3, entidade_id: 1, valor_entidade: 60, valor_paciente: 30 },
  { artigo_id: 3, entidade_id: 2, valor_entidade: 55, valor_paciente: 35 },
  { artigo_id: 3, entidade_id: 3, valor_entidade: 0, valor_paciente: 100 },
  
  { artigo_id: 4, entidade_id: 1, valor_entidade: 50, valor_paciente: 20 },
  { artigo_id: 4, entidade_id: 2, valor_entidade: 45, valor_paciente: 25 },
  { artigo_id: 4, entidade_id: 3, valor_entidade: 0, valor_paciente: 80 },
  
  { artigo_id: 5, entidade_id: 1, valor_entidade: 80, valor_paciente: 40 },
  { artigo_id: 5, entidade_id: 2, valor_entidade: 75, valor_paciente: 45 },
  { artigo_id: 5, entidade_id: 3, valor_entidade: 0, valor_paciente: 130 },
  
  { artigo_id: 6, entidade_id: 1, valor_entidade: 120, valor_paciente: 60 },
  { artigo_id: 6, entidade_id: 2, valor_entidade: 110, valor_paciente: 70 },
  { artigo_id: 6, entidade_id: 3, valor_entidade: 0, valor_paciente: 200 },
  
  { artigo_id: 7, entidade_id: 1, valor_entidade: 200, valor_paciente: 100 },
  { artigo_id: 7, entidade_id: 2, valor_entidade: 180, valor_paciente: 120 },
  { artigo_id: 7, entidade_id: 3, valor_entidade: 0, valor_paciente: 350 },
  
  { artigo_id: 8, entidade_id: 1, valor_entidade: 150, valor_paciente: 75 },
  { artigo_id: 8, entidade_id: 2, valor_entidade: 140, valor_paciente: 85 },
  { artigo_id: 8, entidade_id: 3, valor_entidade: 0, valor_paciente: 250 },
  
  { artigo_id: 9, entidade_id: 1, valor_entidade: 45, valor_paciente: 15 },
  { artigo_id: 9, entidade_id: 2, valor_entidade: 40, valor_paciente: 20 },
  { artigo_id: 9, entidade_id: 3, valor_entidade: 0, valor_paciente: 70 },
  
  { artigo_id: 10, entidade_id: 1, valor_entidade: 300, valor_paciente: 150 },
  { artigo_id: 10, entidade_id: 2, valor_entidade: 280, valor_paciente: 170 },
  { artigo_id: 10, entidade_id: 3, valor_entidade: 0, valor_paciente: 500 }
];

// Dados de dentes (FDI notation)
export interface Dente {
  id: number;
  nome: string;
  tipo: 'permanente' | 'deciduo';
  posicao: number;
  quadrante: number;
}

export const dentes: Dente[] = [
  // Permanentes - Quadrante 1 (superior direito)
  { id: 11, nome: '11', tipo: 'permanente', posicao: 1, quadrante: 1 },
  { id: 12, nome: '12', tipo: 'permanente', posicao: 2, quadrante: 1 },
  { id: 13, nome: '13', tipo: 'permanente', posicao: 3, quadrante: 1 },
  { id: 14, nome: '14', tipo: 'permanente', posicao: 4, quadrante: 1 },
  { id: 15, nome: '15', tipo: 'permanente', posicao: 5, quadrante: 1 },
  { id: 16, nome: '16', tipo: 'permanente', posicao: 6, quadrante: 1 },
  { id: 17, nome: '17', tipo: 'permanente', posicao: 7, quadrante: 1 },
  { id: 18, nome: '18', tipo: 'permanente', posicao: 8, quadrante: 1 },
  
  // Permanentes - Quadrante 2 (superior esquerdo)
  { id: 21, nome: '21', tipo: 'permanente', posicao: 1, quadrante: 2 },
  { id: 22, nome: '22', tipo: 'permanente', posicao: 2, quadrante: 2 },
  { id: 23, nome: '23', tipo: 'permanente', posicao: 3, quadrante: 2 },
  { id: 24, nome: '24', tipo: 'permanente', posicao: 4, quadrante: 2 },
  { id: 25, nome: '25', tipo: 'permanente', posicao: 5, quadrante: 2 },
  { id: 26, nome: '26', tipo: 'permanente', posicao: 6, quadrante: 2 },
  { id: 27, nome: '27', tipo: 'permanente', posicao: 7, quadrante: 2 },
  { id: 28, nome: '28', tipo: 'permanente', posicao: 8, quadrante: 2 },
  
  // Permanentes - Quadrante 3 (inferior esquerdo)
  { id: 31, nome: '31', tipo: 'permanente', posicao: 1, quadrante: 3 },
  { id: 32, nome: '32', tipo: 'permanente', posicao: 2, quadrante: 3 },
  { id: 33, nome: '33', tipo: 'permanente', posicao: 3, quadrante: 3 },
  { id: 34, nome: '34', tipo: 'permanente', posicao: 4, quadrante: 3 },
  { id: 35, nome: '35', tipo: 'permanente', posicao: 5, quadrante: 3 },
  { id: 36, nome: '36', tipo: 'permanente', posicao: 6, quadrante: 3 },
  { id: 37, nome: '37', tipo: 'permanente', posicao: 7, quadrante: 3 },
  { id: 38, nome: '38', tipo: 'permanente', posicao: 8, quadrante: 3 },
  
  // Permanentes - Quadrante 4 (inferior direito)
  { id: 41, nome: '41', tipo: 'permanente', posicao: 1, quadrante: 4 },
  { id: 42, nome: '42', tipo: 'permanente', posicao: 2, quadrante: 4 },
  { id: 43, nome: '43', tipo: 'permanente', posicao: 3, quadrante: 4 },
  { id: 44, nome: '44', tipo: 'permanente', posicao: 4, quadrante: 4 },
  { id: 45, nome: '45', tipo: 'permanente', posicao: 5, quadrante: 4 },
  { id: 46, nome: '46', tipo: 'permanente', posicao: 6, quadrante: 4 },
  { id: 47, nome: '47', tipo: 'permanente', posicao: 7, quadrante: 4 },
  { id: 48, nome: '48', tipo: 'permanente', posicao: 8, quadrante: 4 },
  
  // Decíduos - Quadrante 5 (superior direito)
  { id: 51, nome: '51', tipo: 'deciduo', posicao: 1, quadrante: 5 },
  { id: 52, nome: '52', tipo: 'deciduo', posicao: 2, quadrante: 5 },
  { id: 53, nome: '53', tipo: 'deciduo', posicao: 3, quadrante: 5 },
  { id: 54, nome: '54', tipo: 'deciduo', posicao: 4, quadrante: 5 },
  { id: 55, nome: '55', tipo: 'deciduo', posicao: 5, quadrante: 5 },
  
  // Decíduos - Quadrante 6 (superior esquerdo)
  { id: 61, nome: '61', tipo: 'deciduo', posicao: 1, quadrante: 6 },
  { id: 62, nome: '62', tipo: 'deciduo', posicao: 2, quadrante: 6 },
  { id: 63, nome: '63', tipo: 'deciduo', posicao: 3, quadrante: 6 },
  { id: 64, nome: '64', tipo: 'deciduo', posicao: 4, quadrante: 6 },
  { id: 65, nome: '65', tipo: 'deciduo', posicao: 5, quadrante: 6 },
  
  // Decíduos - Quadrante 7 (inferior esquerdo)
  { id: 71, nome: '71', tipo: 'deciduo', posicao: 1, quadrante: 7 },
  { id: 72, nome: '72', tipo: 'deciduo', posicao: 2, quadrante: 7 },
  { id: 73, nome: '73', tipo: 'deciduo', posicao: 3, quadrante: 7 },
  { id: 74, nome: '74', tipo: 'deciduo', posicao: 4, quadrante: 7 },
  { id: 75, nome: '75', tipo: 'deciduo', posicao: 5, quadrante: 7 },
  
  // Decíduos - Quadrante 8 (inferior direito)
  { id: 81, nome: '81', tipo: 'deciduo', posicao: 1, quadrante: 8 },
  { id: 82, nome: '82', tipo: 'deciduo', posicao: 2, quadrante: 8 },
  { id: 83, nome: '83', tipo: 'deciduo', posicao: 3, quadrante: 8 },
  { id: 84, nome: '84', tipo: 'deciduo', posicao: 4, quadrante: 8 },
  { id: 85, nome: '85', tipo: 'deciduo', posicao: 5, quadrante: 8 }
];

// Tipos de faces dentárias
export type FaceDentaria = 'M' | 'D' | 'V' | 'L' | 'O' | 'I';

export const faces: { id: FaceDentaria; nome: string }[] = [
  { id: 'M', nome: 'Mesial' },
  { id: 'D', nome: 'Distal' },
  { id: 'V', nome: 'Vestibular' },
  { id: 'L', nome: 'Lingual/Palatina' },
  { id: 'O', nome: 'Oclusal' },
  { id: 'I', nome: 'Incisal' }
];

// Formatador de moeda
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-PT', { 
    style: 'currency', 
    currency: 'CVE' 
  }).format(value);
};

// Orçamentos iniciais para demonstração
export const orcamentosIniciais: Orcamento[] = [
  {
    id: 1,
    data: '2025-05-10',
    paciente_id: 1,
    entidade_id: 1,
    estado: 'aprovado',
    itens: [
      {
        id: 1,
        orcamento_id: 1,
        artigo_id: 1,
        quantidade: 1,
        valor_entidade: 30,
        valor_paciente: 10,
        subtotal_entidade: 30,
        subtotal_paciente: 10
      },
      {
        id: 2,
        orcamento_id: 1,
        artigo_id: 2,
        dente: 16,
        faces: ['O', 'M'],
        quantidade: 1,
        valor_entidade: 40,
        valor_paciente: 20,
        subtotal_entidade: 40,
        subtotal_paciente: 20
      }
    ],
    total_entidade: 70,
    total_paciente: 30
  },
  {
    id: 2,
    data: '2025-05-12',
    paciente_id: 2,
    entidade_id: 2,
    estado: 'rascunho',
    itens: [
      {
        id: 3,
        orcamento_id: 2,
        artigo_id: 9,
        quantidade: 1,
        valor_entidade: 40,
        valor_paciente: 20,
        subtotal_entidade: 40,
        subtotal_paciente: 20
      }
    ],
    total_entidade: 40,
    total_paciente: 20
  },
  {
    id: 3,
    data: '2025-05-15',
    paciente_id: 3,
    entidade_id: 3,
    estado: 'rejeitado',
    itens: [
      {
        id: 4,
        orcamento_id: 3,
        artigo_id: 6,
        dente: 36,
        quantidade: 1,
        valor_entidade: 0,
        valor_paciente: 200,
        subtotal_entidade: 0,
        subtotal_paciente: 200
      }
    ],
    total_entidade: 0,
    total_paciente: 200
  }
];