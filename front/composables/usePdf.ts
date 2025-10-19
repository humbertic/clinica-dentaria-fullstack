import { ref } from 'vue';
import { useToast } from '@/components/ui/toast';

export function usePdf() {
  const { toast } = useToast();
  const { get, post } = useApiService();
  const loading = ref(false);

  /**
   * View a PDF in a new browser tab
   * @param endpoint The API endpoint path (e.g., 'pdf/fatura/123')
   * @param title Optional title for the document
   */
  async function viewPdf(endpoint: string, title?: string) {
    loading.value = true;
    try {
      toast({
        title: "Gerando PDF...",
        description: "Por favor, aguarde enquanto geramos o documento."
      });
      
      // Fetch the PDF as a blob using the API service
      // Pass responseType as an option to get, not as a URL parameter
      const pdfData = await get(endpoint, { responseType: 'blob' });
      
      // Create object URL from the blob
      const pdfUrl = URL.createObjectURL(pdfData);
      
      // Open in a new tab
      const pdfWindow = window.open(pdfUrl, '_blank');
      
      // Optional: Set document title if browser supports it
      if (pdfWindow && title) {
        pdfWindow.document.title = title;
      }
      
      // Clean up the object URL when the window is closed
      if (pdfWindow) {
        pdfWindow.onunload = () => {
          URL.revokeObjectURL(pdfUrl);
        };
      }
      
      toast({
        title: "PDF gerado com sucesso",
        description: "O documento foi aberto em uma nova aba."
      });
      
      return true;
    } catch (error: any) { // Type error as 'any' to allow property access
      console.error("Error viewing PDF:", error);
      
      toast({
        title: "Erro ao visualizar PDF",
        description: "Não foi possível gerar o documento. Tente novamente.",
        variant: "destructive"
      });
      
      return false;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Download a PDF file
   * @param endpoint The API endpoint path (e.g., 'pdf/fatura/123')
   * @param filename The filename to save as
   */
  async function downloadPdf(endpoint: string, filename: string) {
    loading.value = true;
    try {
      toast({
        title: "Gerando PDF...",
        description: "Preparando o documento para download."
      });
      
      // Add download parameter to the endpoint
      const downloadEndpoint = endpoint.includes('?') 
        ? `${endpoint}&download=true` 
        : `${endpoint}?download=true`;
      
      // Fetch the PDF as a blob - pass responseType as an option
      const pdfData = await get(downloadEndpoint, { responseType: 'blob' });
      
      // Create object URL and trigger download
      const pdfUrl = URL.createObjectURL(pdfData);
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = filename || 'document.pdf';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(pdfUrl);
      }, 100);
      
      toast({
        title: "Download iniciado",
        description: "O download do documento foi iniciado."
      });
      
      return true;
    } catch (error: any) { // Type error as 'any'
      console.error("Error downloading PDF:", error);
      
      toast({
        title: "Erro ao baixar PDF",
        description: "Não foi possível baixar o documento. Tente novamente.",
        variant: "destructive"
      });
      
      return false;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Send a document via email
   * @param endpoint The API endpoint to trigger email sending
   * @param recipientEmail Optional recipient email (if supported by endpoint)
   */
  async function sendPdfByEmail(endpoint: string, recipientEmail?: string) {
    loading.value = true;
    try {
      toast({
        title: "Enviando email...",
        description: "Enviando documento por email."
      });
      
      // Create payload with optional recipient email
      const payload = recipientEmail ? { recipient_email: recipientEmail } : {};
      
      // Send the email request
      await post(endpoint, payload);
      
      toast({
        title: "Email enviado",
        description: "O documento foi enviado por email com sucesso."
      });
      
      return true;
    } catch (error: any) { // Type error as 'any'
      console.error("Error sending PDF by email:", error);
      
      // Get detailed error message if available
      let errorMessage = "Não foi possível enviar o email. Tente novamente.";
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      toast({
        title: "Erro ao enviar email",
        description: errorMessage,
        variant: "destructive"
      });
      
      return false;
    } finally {
      loading.value = false;
    }
  }

  // For invoices specifically
  const fatura = {
    view: (id: number) => viewPdf(`pdf/fatura/${id}`, `Fatura ${id}`),
    download: (id: number) => downloadPdf(`pdf/fatura/${id}`, `fatura_${id}.pdf`),
    email: (id: number, email?: string) => sendPdfByEmail(`faturas/${id}/email`, email)
  };

  // For orçamentos specifically
  const orcamento = {
    view: (id: number) => viewPdf(`pdf/orcamento/${id}`, `Orçamento ${id}`),
    download: (id: number) => downloadPdf(`pdf/orcamento/${id}`, `orcamento_${id}.pdf`),
    email: (id: number, email?: string) => sendPdfByEmail(`orcamentos/${id}/email`, email)
  };

  return {
    loading,
    viewPdf,
    downloadPdf,
    sendPdfByEmail,
    fatura,
    orcamento
  };
}