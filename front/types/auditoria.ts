export interface AuditoriaRecord {
  id: number;
  utilizador_id: number;
  utilizador_nome: string | null;
  clinica_id: number;
  clinica_nome: string | null;
  acao: string;
  objeto: string;
  objeto_id: number | null;
  objeto_nome: string | null;
  detalhes: string | null;
  data: string;
}

export interface AuditoriaFilters {
  skip?: number;
  limit?: number;
  utilizador_id?: number;
  acao?: string;
  objeto?: string;
  data_inicio?: string;
  data_fim?: string;
  search?: string;
  clinica_id?: number;
}

export interface AuditoriaPaginatedResponse {
  items: AuditoriaRecord[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface UtilizadorFilter {
  id: number;
  nome: string;
}

export interface AuditoriaFilterOptions {
  acoes: string[];
  objetos: string[];
}

export interface AuditoriaMetadata {
  acoes: string[];
  objetos: string[];
  utilizadores: UtilizadorFilter[];
}

export enum ExportFormat {
  EXCEL = "excel",
  PDF = "pdf"
}

export interface ExportRequest {
  format: ExportFormat;
  filters?: AuditoriaFilters;
  selected_ids?: number[];
  export_all?: boolean;
}

export interface ExportResponse {
  filename: string;
  content_type: string;
  message?: string;
}