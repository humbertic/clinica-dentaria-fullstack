import { ref, computed } from "vue";
import type {
  FaturaCreate,
  FaturaRead,
  ParcelaCreate,
  FaturaEstado,
  PagamentoRequest
} from "~/types/fatura";

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("cv-CV", {
    style: "currency",
    currency: "CVE",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) {
    return "Data não disponível";
  }

  const date = new Date(dateString);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return "Data inválida";
  }

  try {
    return date.toLocaleDateString("pt-PT");
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return "Erro ao formatar data";
  }
};
export const getValorPago = (fatura: FaturaRead): number => {
  // Case 1: Invoice with direct payments
  if (fatura.pagamentos && Array.isArray(fatura.pagamentos)) {
    return fatura.pagamentos.reduce((sum, p) => sum + (p.valor || 0), 0);
  }
  
  // Case 2: Invoice with parcelas
  else if (fatura.parcelas && Array.isArray(fatura.parcelas)) {
    return fatura.parcelas.reduce((sum, p) => sum + (p.valor_pago || 0), 0);
  }
  
  // Case 3: Simple invoice with estado="paga"
  else if (fatura.estado === "paga") {
    return fatura.total;
  }
  
  // Case 4: No payment information available
  return 0;
};

export const getValorPendente = (fatura: FaturaRead): number => {
  return fatura.total - getValorPago(fatura);
};

export function useFaturacao() {
  const { get, post, put, delete: del } = useApiService();

  const faturas = ref<FaturaRead[]>([]);
  const currentFatura = ref<FaturaRead | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed properties for filtering
  const faturasPendentes = computed(() =>
    faturas.value.filter((f) => f.estado === "pendente")
  );

  const faturasParciaisPagas = computed(() =>
    faturas.value.filter((f) => f.estado === "parcial" || f.estado === "paga")
  );

  /**
   * Fetches all invoices for a patient
   */
  async function fetchFaturasPaciente(
    pacienteId: number
  ): Promise<FaturaRead[]> {
    loading.value = true;
    error.value = null;

    try {
      const data = await get(`faturas?paciente_id=${pacienteId}`);
      faturas.value = data;
      return data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao buscar faturas para paciente ${pacienteId}:`, err);
      return [];
    } finally {
      loading.value = false;
    }
  }

  /**
   * Fetches a specific invoice by ID
   */
  async function getFatura(faturaId: number): Promise<FaturaRead | null> {
    loading.value = true;
    error.value = null;

    try {
      const data = await get(`faturas/${faturaId}`);
      currentFatura.value = data;
      return data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao buscar fatura ${faturaId}:`, err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Creates a new invoice
   */
  async function createFatura(
    fatura: FaturaCreate
  ): Promise<FaturaRead | null> {
    loading.value = true;
    error.value = null;

    try {
      const data = await post("faturas", fatura);
      // Update the faturas list if it's loaded
      if (faturas.value.length > 0) {
        faturas.value.push(data);
      }
      currentFatura.value = data;
      return data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error("Erro ao criar fatura:", err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Creates a new invoice from a consultation
   */
  async function createFaturaFromConsulta(
    consultaId: number
  ): Promise<FaturaRead | null> {
    loading.value = true;
    error.value = null;

    try {
      // Get the consultation to extract patient ID
      const consulta = await get(`consultas/${consultaId}`);

      if (!consulta || !consulta.paciente_id) {
        throw new Error("Consulta não encontrada ou sem paciente associado");
      }

      // Create invoice payload
      const faturaPayload: FaturaCreate = {
        paciente_id: consulta.paciente_id,
        tipo: "consulta",
        consulta_id: consultaId,
        plano_id: null,
      };

      // Use the standard createFatura method
      return await createFatura(faturaPayload);
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao criar fatura para consulta ${consultaId}:`, err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Creates a new invoice from a treatment plan
   */
  async function createFaturaFromPlano(
    planoId: number
  ): Promise<FaturaRead | null> {
    loading.value = true;
    error.value = null;

    try {
      // Get the plan to extract patient ID
      const plano = await get(`planos/${planoId}`);

      if (!plano || !plano.paciente_id) {
        throw new Error("Plano não encontrado ou sem paciente associado");
      }

      // Create invoice payload
      const faturaPayload: FaturaCreate = {
        paciente_id: plano.paciente_id,
        tipo: "plano",
        consulta_id: null,
        plano_id: planoId,
      };

      // Use the standard createFatura method
      return await createFatura(faturaPayload);
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao criar fatura para plano ${planoId}:`, err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Adds a payment to an invoice
   */
  async function addPagamento(
    faturaId: number,
    parcela: ParcelaCreate
  ): Promise<boolean> {
    loading.value = true;
    error.value = null;

    try {
      await post(`faturas/${faturaId}/pagamentos`, parcela);
      // Refresh the invoice to get updated payment status
      await getFatura(faturaId);
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao adicionar pagamento à fatura ${faturaId}:`, err);
      return false;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Cancels an invoice
   */
  async function cancelarFatura(faturaId: number): Promise<boolean> {
    loading.value = true;
    error.value = null;

    try {
      await post(`faturas/${faturaId}/cancelar`, {});
      // Update local state
      if (currentFatura.value && currentFatura.value.id === faturaId) {
        currentFatura.value.estado = "cancelada";
      }
      const index = faturas.value.findIndex((f) => f.id === faturaId);
      if (index >= 0) {
        faturas.value[index].estado = "cancelada";
      }
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao cancelar fatura ${faturaId}:`, err);
      return false;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Processes payment of an installment
   */

    /**
   * Processes payment of an installment or direct payment to an invoice
   */
  async function pagarParcela(pagamento: PagamentoRequest): Promise<boolean> {
    loading.value = true;
    error.value = null;
  
    try {
      // Check if this is a direct payment to the invoice or payment to a parcela
      if (pagamento.parcela_id) {
        // Payment to a specific installment
        const parcelaId = pagamento.parcela_id;
        
        // Create payload with required fields
        const payload = {
          valor_pago: pagamento.valor_pago,
          metodo_pagamento: pagamento.metodo_pagamento,
          data_pagamento: pagamento.data_pagamento,
          observacoes: pagamento.observacoes
        };
  
        // Send payment request to API
        await post(`faturas/parcelas/${parcelaId}/pagamento`, payload);
      } else if (pagamento.fatura_id) {
        // Direct payment to invoice (no parcela)
        const payload = {
          valor_pago: pagamento.valor_pago,
          metodo_pagamento: pagamento.metodo_pagamento,
          data_pagamento: pagamento.data_pagamento,
          observacoes: pagamento.observacoes
        };
  
        // Send direct payment request to API
        await post(`faturas/${pagamento.fatura_id}/pagamento-direto`, payload);
      } else {
        throw new Error("Nem ID da parcela nem ID da fatura fornecidos");
      }
      
      // Refresh the invoice to get updated status
      if (pagamento.fatura_id) {
        await getFatura(pagamento.fatura_id);
      }
      
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao processar pagamento:`, err);
      return false;
    } finally {
      loading.value = false;
    }
  }

   const estatisticas = computed(() => {
    // Filter out canceled invoices first
    const activeFaturas = faturas.value.filter(f => f.estado !== "cancelada");
    
    // Total value of all active invoices
    const total = activeFaturas.reduce((sum, f) => sum + f.total, 0);
    
    // Total amount paid across all invoices
    const pago = activeFaturas.reduce((sum, f) => sum + getValorPago(f), 0);
    
    // Total amount still pending payment
    const pendente = activeFaturas.reduce((sum, f) => sum + getValorPendente(f), 0);
    
    // Count of invoices by status
    const countsByStatus = activeFaturas.reduce((counts, f) => {
      counts[f.estado] = (counts[f.estado] || 0) + 1;
      return counts;
    }, {} as Record<FaturaEstado, number>);
    
    // Count of invoices with parcelas
    const comParcelas = activeFaturas.filter(f => 
      f.parcelas && f.parcelas.length > 0
    ).length;
    
    // Count of invoices with direct payments
    const comPagamentosDiretos = activeFaturas.filter(f => 
      f.pagamentos && f.pagamentos.length > 0
    ).length;
  
    return {
      total,
      pago,
      pendente,
      quantidade: activeFaturas.length,
      pendentes: countsByStatus.pendente || 0,
      parciais: countsByStatus.parcial || 0,
      pagas: countsByStatus.paga || 0,
      comParcelas,
      comPagamentosDiretos
    };
  });

  async function generateParcelas(
    faturaId: number,
    numeroParcelas: number,
    datasVencimento: string[]
  ): Promise<boolean> {
    loading.value = true;
    error.value = null;
  
    try {
      const fatura = await getFatura(faturaId);
      if (!fatura) {
        throw new Error(`Fatura ${faturaId} não encontrada`);
      }
  
      if (!Array.isArray(datasVencimento) || datasVencimento.length === 0) {
        throw new Error("Nenhuma data de vencimento fornecida");
      }
  
      // Calculate installment values
      const valorTotal = fatura.total;
      const valorBase = Math.floor((valorTotal / numeroParcelas) * 100) / 100;
      let resto = Math.round((valorTotal - valorBase * numeroParcelas) * 100) / 100;
      
      const parcelas = datasVencimento.map((data_vencimento, idx) => {
        const acrescimo = resto > 0 ? 0.01 : 0;
        if (resto > 0) resto = Math.round((resto - 0.01) * 100) / 100;
        
        return {
          numero: idx + 1,
          valor_planejado: Math.round((valorBase + acrescimo) * 100) / 100,
          data_vencimento
        };
      });
  
      await post(`faturas/${faturaId}/parcelas`, parcelas);
      
      await getFatura(faturaId);
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao gerar parcelas para fatura ${faturaId}:`, err);
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    faturas,
    currentFatura,
    loading,
    error,
    faturasPendentes,
    faturasParciaisPagas,
    fetchFaturasPaciente,
    getFatura,
    createFatura,
    createFaturaFromConsulta,
    createFaturaFromPlano,
    addPagamento,
    cancelarFatura,
    pagarParcela,
    generateParcelas,
    estatisticas,
  };
}
