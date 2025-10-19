import { ref, computed } from "vue";
import { useToast } from "@/components/ui/toast";
import type {
  CashierSession,
  CashierPayment,
  PendingInvoice,
  PendingParcel,
  CashierSummary,
  SessionResponse,
} from "@/types/caixa";

export function useCashier() {
  const { get, post } = useApiService();
  const { toast } = useToast();

  const session = ref<CashierSession | null>(null);
  const pendingInvoices = ref<PendingInvoice[]>([]);
  const pendingParcels = ref<PendingParcel[]>([]);
  const payments = ref<CashierPayment[]>([]);
  const initialized = ref(false); 
  const paymentSummary = ref<{
    count: number;
    total: number;
    by_method: Record<string, { count: number; total: number }>;
  }>({
    count: 0,
    total: 0,
    by_method: {},
  });
  const loading = ref(false);

function extractStatus(err: any): number | undefined {
  // ①  Axios / ofetch / FetchError
  if (err?.statusCode) return err.statusCode;
  if (err?.status)     return err.status;
  if (err?.response?.status) return err.response.status;

  // ②  Erro simples criado pelo apiService: "Erro na API: 404"
  if (typeof err?.message === "string") {
    const m = err.message.match(/(\d{3})$/);   // procura número no fim
    if (m) return Number(m[1]);
  }
  return undefined;
}



  // Busca sessão de caixa aberta
  async function fetchOpenSession(): Promise<CashierSession | null> {
  loading.value = true;
  initialized.value = false;

  try {
    const response = await get("caixa/sessions");   // apiService inalterado

    /* ---- sessão encontrada ---- */
    session.value        = response.session;
    paymentSummary.value = response.payments;
    payments.value       = response.payments?.history ?? [];
    return response.session;

  } catch (err: any) {

    /* ---- 404 = não há sessão → limpa estado, NÃO mostra toast ---- */
    if (extractStatus(err) === 404) {
      console.log("No open cashier session (404).");

      session.value = null;
      payments.value = [];
      paymentSummary.value = { count: 0, total: 0, by_method: {} };
      return null;
    }

    /* ---- outros erros → toast ---- */
    console.error("fetchOpenSession (unexpected):", err);

    toast({
      title: "Erro",
      description: "Erro ao verificar sessão de caixa",
      variant: "destructive",
    });

    session.value = null;
    payments.value = [];
    paymentSummary.value = { count: 0, total: 0, by_method: {} };
    return null;

  } finally {
    initialized.value = true;
    loading.value = false;
  }
}




  // Abre uma nova sessão de caixa
  async function openSession(valorInicial: number): Promise<CashierSession> {
    loading.value = true;
    try {
      const payload = { valor_inicial: valorInicial };
      const data = await post("caixa/sessions", payload);
      session.value = data;
      payments.value = [];
      paymentSummary.value = {
        count: 0,
        total: 0,
        by_method: {},
      };
      toast({
        title: "Caixa Aberto",
        description: `Sessão iniciada com valor inicial de ${valorInicial.toFixed(
          2
        )}`,
      });
      return data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: "Erro ao abrir sessão de caixa",
        variant: "destructive",
      });
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Carrega faturas e parcelas pendentes
  async function fetchPending(sessionId: number): Promise<void> {
    loading.value = true;
    try {
      const result = await get(`caixa/sessions/${sessionId}/pending`);
      pendingInvoices.value = result.invoices;
      pendingParcels.value = result.parcelas;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar pendências",
        variant: "destructive",
      });
    } finally {
      loading.value = false;
    }
  }

  // Registra um pagamento de fatura ou parcela
  async function pay(
    sessionId: number,
    paymentData: {
      targetType: "fatura" | "parcela";
      targetId: number;
      valorPago: number;
      metodo:
        | "dinheiro"
        | "cartao"
        | "transferencia"
        | "mbway"
        | "multibanco"
        | "cheque";
      observacoes?: string;
    }
  ): Promise<void> {
    loading.value = true;
    try {
      const payload: any = {
        valor_pago: paymentData.valorPago,
        metodo_pagamento: paymentData.metodo,
      };
      if (paymentData.observacoes)
        payload.observacoes = paymentData.observacoes;
      if (paymentData.targetType === "fatura") {
        payload.fatura_id = paymentData.targetId;
      } else {
        payload.parcela_id = paymentData.targetId;
      }
      const data = await post(`caixa/sessions/${sessionId}/payments`, payload);

      // Refresh the entire session to get updated payment data
      await fetchOpenSession();

      // Also refresh pending items
      await fetchPending(sessionId);

      toast({
        title: "Pagamento Registrado",
        description: `Pagamento de ${paymentData.valorPago.toFixed(
          2
        )} registrado com sucesso`,
      });
    } catch (err: any) {
      toast({
        title: "Erro",
        description: "Erro ao registrar pagamento",
        variant: "destructive",
      });
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Fecha a sessão de caixa
  async function closeSession(
    sessionId: number,
    valorFinal: number
  ): Promise<void> {
    loading.value = true;
    try {
      const payload = { valor_final: valorFinal };
      const data = await post(`caixa/sessions/${sessionId}/close`, payload);
      session.value = data;
      toast({
        title: "Caixa Fechado",
        description: `Sessão encerrada com valor final de ${valorFinal.toFixed(
          2
        )}`,
      });
    } catch (err: any) {
      toast({
        title: "Erro",
        description: "Erro ao fechar sessão de caixa",
        variant: "destructive",
      });
      throw err;
    } finally {
      loading.value = false;
    }
  }

  const hasOpenSession = computed(() => {
    return !!session.value;
  });

  const openSessionId = computed(() => {
    return session.value?.id || null;
  });
  // Use server-provided payment summary data
  const summary = computed<CashierSummary>(() => {
    // If we have server-provided payment summary data, use it
    const methodTotals = paymentSummary.value.by_method || {};

    const valorInicial = session.value?.valor_inicial || 0;
    const totalDinheiro = methodTotals["dinheiro"]?.total || 0;
    const totalCartao = methodTotals["cartao"]?.total || 0;
    const totalTransferencia = methodTotals["transferencia"]?.total || 0;
    const totalMBWay = methodTotals["mbway"]?.total || 0;
    const totalMultibanco = methodTotals["multibanco"]?.total || 0;
    const totalCheque = methodTotals["cheque"]?.total || 0;

    const totalRecebido = paymentSummary.value.total || 0;
    const saldoEsperado = valorInicial + totalRecebido;

    return {
      valorInicial,
      totalDinheiro,
      totalCartao,
      totalTransferencia,
      totalMBWay,
      totalMultibanco,
      totalCheque,
      totalRecebido,
      saldoEsperado,
      // Include payment method counts
      countDinheiro: methodTotals["dinheiro"]?.count || 0,
      countCartao: methodTotals["cartao"]?.count || 0,
      countTransferencia: methodTotals["transferencia"]?.count || 0,
      countMBWay: methodTotals["mbway"]?.count || 0,
      countMultibanco: methodTotals["multibanco"]?.count || 0,
      countCheque: methodTotals["cheque"]?.count || 0,
      totalCount: paymentSummary.value.count || 0,
    };
  });

  return {
    session,
    pendingInvoices,
    pendingParcels,
    payments,
    loading,
    summary,
    paymentSummary,
    hasOpenSession,
    openSessionId,
    fetchOpenSession,
    openSession,
    fetchPending,
    pay,
    closeSession,
  };
}
