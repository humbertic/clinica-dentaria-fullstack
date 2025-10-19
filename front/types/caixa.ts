export interface SessionResponse {
  session: CashierSession;
  payments: {
    count: number;
    total: number;
    by_method: Record<string, { count: number; total: number }>;
    history?: CashierPayment[];
  };
}

export interface CashierSession {
  id: number;
  data_inicio: string;
  valor_inicial: number;
  status: string;
  operador_id: number;
  operador_nome: string;
  valor_final?: number;
  data_fecho?: string;
}

export interface CashierPayment {
  id: number;
  valor: number;
  metodo_pagamento: string;
  data: string;
  paciente_nome: string | null;
  fatura_id: number | null;
  parcela_id: number | null;
}

export interface PendingInvoice {
  id: number;
  numero: string;
  data_emissao: string;
  paciente_nome: string;
  total: number;
  pendente: number;
  tipo: string;
}

export interface PendingParcel {
  parcela_id: number;
  fatura_id: number;
  numero: number;
  valor: number;
  pendente: number;
  data_vencimento: string;
  paciente_nome: string;
}

export interface CashierSummary {
  valorInicial: number;
  totalDinheiro: number;
  totalCartao: number;
  totalTransferencia: number;
  totalMBWay: number;
  totalMultibanco: number;
  totalCheque: number;
  totalRecebido: number;
  saldoEsperado: number;
  // Payment counts
  countDinheiro: number;
  countCartao: number;
  countTransferencia: number;
  countMBWay: number;
  countMultibanco: number;
  countCheque: number;
  totalCount: number;
}