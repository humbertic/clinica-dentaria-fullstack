export interface Clinica {
  id: number;
  nome: string;
  email_envio: string;
  morada: string;
  clinica_pai_id: number | null;
  criado_por_id: number;
  partilha_dados: boolean;
}

export type ClinicaMinimal = Pick<Clinica, 'id' | 'nome'>;