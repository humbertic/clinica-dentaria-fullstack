import type { ClinicaMinimal } from './clinica';

// Tipo mínimo usado para referências simples (ex: seleção em dropdown)
export interface PacienteMinimal {
  id: number;
  nome: string;
}

// Consulta type for a patient's consultation history
export interface Consulta {
  id: number;
  data_inicio?: string; // ISO date string
  data_fim?: string; // ISO date string
  estado: string; // "agendada" | "iniciada" | "concluida" | "cancelada" | "falta"
  observacoes?: string;
  medico_id: number;
  medico?: {
    id: number;
    nome: string;
  };
  clinica_id: number;
  paciente_id: number;
  entidade_id?: number;
  entidade?: {
    id: number;
    nome: string;
  };
}

// PlanoItem type for individual treatment plan items
export interface PlanoItem {
  id: number;
  plano_id: number;
  artigo_id: number;
  quantidade_prevista: number;
  quantidade_executada: number;
  numero_dente?: number;
  face?: string[];
  estado: string; // "pendente" | "em_curso" | "concluido" | "cancelado"
  artigo?: {
    id: number;
    nome: string;
    codigo: string;
    preco?: number;
  };
}

// Plano type for a patient's treatment plans
export interface PlanoTratamento {
  id: number;
  paciente_id: number;
  data_criacao: string; // ISO date string
  data_conclusao?: string; // ISO date string
  estado: string; // "em_curso" | "concluido" | "cancelado"
  itens?: PlanoItem[];
  // Calculated properties for UI
  progresso?: number;
  titulo?: string;
  descricao?: string;
}

// Anotacao type for clinical notes
export interface AnotacaoClinica {
  id: number;
  ficha_id: number;
  consulta_id?: number;
  texto: string;
  data: string; // ISO date string
  autor?: {
    id: number;
    nome: string;
  };
  anexos?: {
    id: number;
    nome: string;
    url: string;
    tipo: string;
  }[];
}

// FichaClinica type for the patient's clinical record
export interface FichaClinica {
  id: number;
  paciente_id: number;
  data_criacao: string; // ISO date string
  estado_civil?: string;
  profissao?: string;
  endereco?: string;
  telefone?: string;
  local_trabalho?: string;
  telefone_trabalho?: string;
  tipo_beneficiario?: string;
  numero_beneficiario?: string;
  recomendado_por?: string;
  data_questionario?: string; // ISO date string
  queixa_principal?: string;
  historia_medica?: Record<string, any>; // JSON object with medical history
  exame_clinico?: string;
  plano_geral?: Record<string, any>; // JSON object with treatment plan
  observacoes_finais?: string;
  anotacoes?: AnotacaoClinica[];
}

// Tipo para listagem de pacientes
export interface PacienteListItem {
  id: number;
  nome: string;
  nif?: string;
  data_nascimento?: string; // ISO date string
  sexo?: string;
  telefone?: string;
  email?: string;
  nacionalidade?: string;
  tipo_documento?: string;
  numero_documento?: string;
  validade_documento?: string; // ISO date string
  pais_residencia?: string;
  morada?: string;
  clinica: ClinicaMinimal;
  // Additional properties for the detail view
  consultas?: Consulta[];
  planos?: PlanoTratamento[];
  fichas?: FichaClinica[];
  temFichaClinica?: boolean;
}

// DTO para criação de paciente
export interface PacienteCreate {
  clinica_id: number;
  nome: string;
  nif?: string;
  data_nascimento?: string; // ISO date string
  sexo?: string;
  telefone?: string;
  email?: string;
  nacionalidade?: string;
  tipo_documento?: string;
  numero_documento?: string;
  validade_documento?: string; // ISO date string
  pais_residencia?: string;
  morada?: string;
}

// DTO para atualização de paciente
export interface PacienteUpdate {
  nome?: string;
  nif?: string;
  data_nascimento?: string; // ISO date string
  sexo?: string;
  telefone?: string;
  email?: string;
  nacionalidade?: string;
  tipo_documento?: string;
  numero_documento?: string;
  validade_documento?: string; // ISO date string
  pais_residencia?: string;
  morada?: string;
}

// Tipo principal para uso nos componentes
export type Paciente = PacienteListItem;

// Helper functions
export function calculateAge(birthDate?: string): number | undefined {
  if (!birthDate) return undefined;
  
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDifference = today.getMonth() - birth.getMonth();
  
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

export function formatPaciente(p: Paciente): Paciente & {
  dataNascimento: string;
  idade: number;
  temFichaClinica: boolean;
  totalConsultas: number;
  planosAtivos: number;
  proximaConsulta?: any;
} {
  // Create a function to calculate age
  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDifference = today.getMonth() - birth.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Find the next upcoming appointment
  const findNextAppointment = (consultas: any[]): any => {
    if (!consultas || !consultas.length) return null;
    
    const now = new Date();
    const upcomingConsultas = consultas
      .filter(c => c.estado === 'agendada' && new Date(c.data_inicio) > now)
      .sort((a, b) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime());
    
    return upcomingConsultas[0] || null;
  };

  // Count active treatment plans
  const countActivePlans = (planos: any[]): number => {
    if (!planos || !planos.length) return 0;
    return planos.filter(p => p.estado === 'em_curso').length;
  };

  return {
    ...p,
    dataNascimento: p.data_nascimento || '',
    idade: calculateAge(p.data_nascimento || ''),
    // Change from fichas to ficha
    temFichaClinica: !!p.fichas || p.temFichaClinica || false,
    totalConsultas: p.consultas ? p.consultas.length : 0,
    planosAtivos: countActivePlans(p.planos || []),
    proximaConsulta: findNextAppointment(p.consultas || [])
  };
}