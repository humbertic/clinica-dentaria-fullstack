export const useReports = () => {
  const service = useApiService();
  
  /**
   * Obter dados de receita por período
   * @param start Data de início (YYYY-MM-DD)
   * @param end Data de fim (YYYY-MM-DD)
   */
  const getRevenue = async (start: string, end: string) => {
    const response = await service.get('reports/revenue', {
      params: { start, end }
    });
    return response || [];
  };

  /**
   * Obter top serviços mais utilizados
   * @param limit Número máximo de serviços a retornar
   */
  const getTopServices = async (limit: number = 5) => {
    const response = await service.get('reports/top-services', {
      params: { limit }
    });
    return response || [];
  };

  /**
   * Obter dados de caixa por dia
   * @param day Data específica (YYYY-MM-DD)
   */
  const getCashShift = async (day: string) => {
    const response = await service.get('reports/cash-shift', {
      params: { day }
    });
    return response || [];
  };


/**
 * Obter total de entradas de caixa agregadas por dia
 * @param start Data de início (YYYY-MM-DD)
 * @param end   Data de fim   (YYYY-MM-DD)
 * @returns     Array [{ dia:'2025-06-20', entradas: 18270 }]
 */
const getCashShiftRange = async (start: string, end: string) => {
  const response = await service.get('reports/cash-shift-range', {
    params: { start, end }
  })

  // garante números
  return (response ?? []).map((r: any) => ({
    dia: r.dia,
    entradas: +r.entradas          // string → number
  }))
}


  /**
   * Obter faturas em atraso
   * @param maxAge Idade máxima em dias para considerar
   */
  const getOverdue = async (maxAge: number = 90) => {
    const response = await service.get('reports/overdue', {
      params: { max_age: maxAge }
    });
    return response || [];
  };

  /**
   * Obter produtos com stock crítico
   */
  const getStockCritical = async () => {
    const response = await service.get('reports/stock-critical');
    return response || [];
  };

  /**
   * Obter dados de produtividade por mês
   * @param month Mês no formato YYYY-MM
   */
  const getProductivity = async (month: string) => {
    const response = await service.get('reports/productivity', {
      params: { month }
    });
    return response || [];
  };

  /**
   * Obter dados de receita filtrados por clínica
   * @param clinicaId ID da clínica
   * @param start Data de início (YYYY-MM-DD)
   * @param end Data de fim (YYYY-MM-DD)
   */
  const getRevenueByClinica = async (start: string, end: string) => {
    const response = await service.get(`reports/revenue`, {
      params: { start, end }
    });
    console.log(response.data);
    return response || [];
  };

  return {
    getRevenue,
    getTopServices,
    getCashShift,
    getCashShiftRange,
    getOverdue,
    getStockCritical,
    getProductivity,
    getRevenueByClinica
  };
};