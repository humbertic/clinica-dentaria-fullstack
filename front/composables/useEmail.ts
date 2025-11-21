import { ref } from 'vue';
import { useToast } from '@/components/ui/toast';
import type {
  StockAlertasEmailResponse,
  CustomEmailRequest,
  EmailSentResponse
} from '@/types/email';

export function useEmail() {
  const { toast } = useToast();
  const { post } = useApiService();
  const loading = ref(false);

  // ========== Stock Alerts ==========

  /**
   * Enviar alertas de stock para assistentes de uma clínica
   * @param clinicaId ID da clínica
   * @param diasExpiracao Dias para considerar item como "a expirar" (default: 30)
   */
  async function enviarAlertasStock(
    clinicaId: number,
    diasExpiracao: number = 30
  ): Promise<StockAlertasEmailResponse | null> {
    loading.value = true;
    try {
      const response = await post(
        `email/alertas-stock?clinica_id=${clinicaId}&dias_expiracao=${diasExpiracao}`,
        {}
      ) as StockAlertasEmailResponse;

      if (response.alertas.total === 0) {
        toast({
          title: "Sem alertas",
          description: "Não há alertas de stock para enviar.",
        });
      } else {
        toast({
          title: "Alertas enviados",
          description: `${response.alertas.total} alerta(s) enviado(s) para os assistentes: ${response.alertas.itens_baixo_stock} stock baixo, ${response.alertas.itens_expirando} a expirar.`,
        });
      }

      return response;
    } catch (error: any) {
      console.error("Erro ao enviar alertas de stock:", error);
      toast({
        title: "Erro ao enviar alertas",
        description: error.message || "Não foi possível enviar os alertas. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Executar verificação de alertas para TODAS as clínicas (scheduler manual)
   */
  async function executarAlertasTodasClinicas(): Promise<boolean> {
    loading.value = true;
    try {
      await post('email/alertas-stock/executar-agora', {});

      toast({
        title: "Verificação iniciada",
        description: "A verificação de alertas foi iniciada para todas as clínicas.",
      });

      return true;
    } catch (error: any) {
      console.error("Erro ao executar verificação de alertas:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível iniciar a verificação.",
        variant: "destructive",
      });
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ========== Fatura Email ==========

  /**
   * Enviar fatura por email
   * @param faturaId ID da fatura
   * @param clinicaId ID da clínica
   * @param emailPara Email alternativo (opcional)
   */
  async function enviarFatura(
    faturaId: number,
    clinicaId: number,
    emailPara?: string
  ): Promise<boolean> {
    loading.value = true;
    try {
      toast({
        title: "Enviando fatura...",
        description: "A fatura está sendo enviada por email.",
      });

      let endpoint = `email/fatura/${faturaId}?clinica_id=${clinicaId}`;
      if (emailPara) {
        endpoint += `&email_para=${encodeURIComponent(emailPara)}`;
      }

      await post(endpoint, {});

      toast({
        title: "Fatura enviada",
        description: "A fatura foi enviada por email com sucesso.",
      });

      return true;
    } catch (error: any) {
      console.error("Erro ao enviar fatura:", error);
      toast({
        title: "Erro ao enviar fatura",
        description: error.message || "Não foi possível enviar a fatura.",
        variant: "destructive",
      });
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ========== Orçamento Email ==========

  /**
   * Enviar orçamento por email
   * @param orcamentoId ID do orçamento
   * @param clinicaId ID da clínica
   * @param emailPara Email alternativo (opcional)
   */
  async function enviarOrcamento(
    orcamentoId: number,
    clinicaId: number,
    emailPara?: string
  ): Promise<boolean> {
    loading.value = true;
    try {
      toast({
        title: "Enviando orçamento...",
        description: "O orçamento está sendo enviado por email.",
      });

      let endpoint = `email/orcamento/${orcamentoId}?clinica_id=${clinicaId}`;
      if (emailPara) {
        endpoint += `&email_para=${encodeURIComponent(emailPara)}`;
      }

      await post(endpoint, {});

      toast({
        title: "Orçamento enviado",
        description: "O orçamento foi enviado por email com sucesso.",
      });

      return true;
    } catch (error: any) {
      console.error("Erro ao enviar orçamento:", error);
      toast({
        title: "Erro ao enviar orçamento",
        description: error.message || "Não foi possível enviar o orçamento.",
        variant: "destructive",
      });
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ========== Plano de Tratamento Email ==========

  /**
   * Enviar plano de tratamento por email
   * @param planoId ID do plano
   * @param clinicaId ID da clínica
   * @param emailPara Email alternativo (opcional)
   */
  async function enviarPlano(
    planoId: number,
    clinicaId: number,
    emailPara?: string
  ): Promise<boolean> {
    loading.value = true;
    try {
      toast({
        title: "Enviando plano...",
        description: "O plano de tratamento está sendo enviado por email.",
      });

      let endpoint = `email/plano/${planoId}?clinica_id=${clinicaId}`;
      if (emailPara) {
        endpoint += `&email_para=${encodeURIComponent(emailPara)}`;
      }

      await post(endpoint, {});

      toast({
        title: "Plano enviado",
        description: "O plano de tratamento foi enviado por email com sucesso.",
      });

      return true;
    } catch (error: any) {
      console.error("Erro ao enviar plano:", error);
      toast({
        title: "Erro ao enviar plano",
        description: error.message || "Não foi possível enviar o plano.",
        variant: "destructive",
      });
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ========== Lembrete de Consulta ==========

  /**
   * Enviar lembrete de consulta por email
   * @param marcacaoId ID da marcação
   */
  async function enviarLembrete(marcacaoId: number): Promise<boolean> {
    loading.value = true;
    try {
      toast({
        title: "Enviando lembrete...",
        description: "O lembrete está sendo enviado por email.",
      });

      await post(`email/marcacoes/${marcacaoId}/lembrete`, {});

      toast({
        title: "Lembrete enviado",
        description: "O lembrete foi enviado por email com sucesso.",
      });

      return true;
    } catch (error: any) {
      console.error("Erro ao enviar lembrete:", error);
      toast({
        title: "Erro ao enviar lembrete",
        description: error.message || "Não foi possível enviar o lembrete.",
        variant: "destructive",
      });
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ========== Cancelamento de Consulta ==========

  /**
   * Enviar notificação de cancelamento por email
   * @param marcacaoId ID da marcação
   */
  async function enviarCancelamento(marcacaoId: number): Promise<boolean> {
    loading.value = true;
    try {
      toast({
        title: "Enviando notificação...",
        description: "A notificação de cancelamento está sendo enviada.",
      });

      await post(`email/marcacoes/${marcacaoId}/cancelamento`, {});

      toast({
        title: "Notificação enviada",
        description: "A notificação de cancelamento foi enviada com sucesso.",
      });

      return true;
    } catch (error: any) {
      console.error("Erro ao enviar cancelamento:", error);
      toast({
        title: "Erro ao enviar notificação",
        description: error.message || "Não foi possível enviar a notificação.",
        variant: "destructive",
      });
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ========== Email Customizado para Utilizador ==========

  /**
   * Enviar email customizado para um utilizador
   * @param utilizadorId ID do utilizador
   * @param clinicaId ID da clínica
   * @param emailData Dados do email (assunto, mensagem, email_para opcional)
   */
  async function enviarEmailUtilizador(
    utilizadorId: number,
    clinicaId: number,
    emailData: CustomEmailRequest
  ): Promise<boolean> {
    loading.value = true;
    try {
      toast({
        title: "Enviando email...",
        description: "O email está sendo enviado.",
      });

      await post(
        `email/utilizador/${utilizadorId}?clinica_id=${clinicaId}`,
        emailData
      );

      toast({
        title: "Email enviado",
        description: "O email foi enviado com sucesso.",
      });

      return true;
    } catch (error: any) {
      console.error("Erro ao enviar email:", error);
      toast({
        title: "Erro ao enviar email",
        description: error.message || "Não foi possível enviar o email.",
        variant: "destructive",
      });
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ========== Test Email Config ==========

  /**
   * Testar configuração de email da clínica
   * @param clinicaId ID da clínica
   */
  async function testarConfiguracao(clinicaId: number): Promise<boolean> {
    loading.value = true;
    try {
      toast({
        title: "Testando configuração...",
        description: "Verificando se o email está configurado corretamente.",
      });

      await post(`email/test?clinica_id=${clinicaId}`, {});

      toast({
        title: "Configuração OK",
        description: "O email está configurado corretamente.",
      });

      return true;
    } catch (error: any) {
      console.error("Erro ao testar configuração:", error);
      toast({
        title: "Erro na configuração",
        description: error.message || "A configuração de email não está correta.",
        variant: "destructive",
      });
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    // Stock Alerts
    enviarAlertasStock,
    executarAlertasTodasClinicas,
    // Documents
    enviarFatura,
    enviarOrcamento,
    enviarPlano,
    // Appointments
    enviarLembrete,
    enviarCancelamento,
    // Custom
    enviarEmailUtilizador,
    // Test
    testarConfiguracao,
  };
}
