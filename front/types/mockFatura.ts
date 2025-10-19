import type { FaturaRead } from '@/types/fatura';

export const faturasMock: FaturaRead[] = [
  {
    id: 1,
    numero: 'FAT-2024-001',
    data_emissao: '2024-01-15',
    data_vencimento: '2024-02-15',
    tipo: 'consulta',
    valor_total: 150.00,
    valor_pago: 150.00,
    valor_pendente: 0.00,
    estado: 'pago',
    paciente_id: 1,
    itens: [
      {
        id: 1,
        descricao: 'Consulta de Avaliação',
        quantidade: 1,
        valor_unitario: 50.00,
        valor_total: 50.00
      },
      {
        id: 2,
        descricao: 'Radiografia Panorâmica',
        quantidade: 1,
        valor_unitario: 100.00,
        valor_total: 100.00
      }
    ],
    parcelas: [
      {
        id: 1,
        numero: 1,
        valor: 150.00,
        data_vencimento: '2024-02-15',
        data_pagamento: '2024-02-10',
        estado: 'pago'
      }
    ]
  },
  {
    id: 2,
    numero: 'FAT-2024-002',
    data_emissao: '2024-02-20',
    data_vencimento: '2024-03-20',
    tipo: 'tratamento',
    valor_total: 800.00,
    valor_pago: 400.00,
    valor_pendente: 400.00,
    estado: 'parcial',
    paciente_id: 1,
    itens: [
      {
        id: 3,
        descricao: 'Tratamento de Canal - Dente 16',
        quantidade: 1,
        valor_unitario: 600.00,
        valor_total: 600.00
      },
      {
        id: 4,
        descricao: 'Coroa Cerâmica - Dente 16',
        quantidade: 1,
        valor_unitario: 200.00,
        valor_total: 200.00
      }
    ],
    parcelas: [
      {
        id: 2,
        numero: 1,
        valor: 400.00,
        data_vencimento: '2024-03-20',
        data_pagamento: '2024-03-15',
        estado: 'pago'
      },
      {
        id: 3,
        numero: 2,
        valor: 400.00,
        data_vencimento: '2024-04-20',
        estado: 'pendente'
      }
    ]
  },
  {
    id: 3,
    numero: 'FAT-2024-003',
    data_emissao: '2024-03-10',
    data_vencimento: '2024-04-10',
    tipo: 'orcamento',
    valor_total: 1200.00,
    valor_pago: 0.00,
    valor_pendente: 1200.00,
    estado: 'pendente',
    paciente_id: 1,
    itens: [
      {
        id: 5,
        descricao: 'Implante Dentário - Dente 36',
        quantidade: 1,
        valor_unitario: 800.00,
        valor_total: 800.00
      },
      {
        id: 6,
        descricao: 'Coroa sobre Implante - Dente 36',
        quantidade: 1,
        valor_unitario: 400.00,
        valor_total: 400.00
      }
    ],
    parcelas: [
      {
        id: 4,
        numero: 1,
        valor: 600.00,
        data_vencimento: '2024-04-10',
        estado: 'pendente'
      },
      {
        id: 5,
        numero: 2,
        valor: 600.00,
        data_vencimento: '2024-05-10',
        estado: 'pendente'
      }
    ]
  }
];

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR'
  }).format(value);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-PT');
};