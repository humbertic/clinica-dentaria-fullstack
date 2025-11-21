// Email response types
export interface EmailSentResponse {
  detail: string;
}

// Stock alerts email response
export interface StockAlertasEmailResponse {
  detail: string;
  alertas: {
    itens_baixo_stock: number;
    itens_expirando: number;
    total: number;
  };
}

// Custom email request
export interface CustomEmailRequest {
  assunto: string;
  mensagem: string;
  email_para?: string;
}

// Email test response
export interface EmailTestResponse {
  detail: string;
}
