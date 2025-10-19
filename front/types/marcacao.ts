export interface MarcacaoBase {
  paciente_id:     number;
  medico_id:       number;
  clinic_id:       number;
  entidade_id:     number;
  data_hora_inicio: string;    // ISO datetime
  data_hora_fim:    string;    // ISO datetime
  titulo:          string;
  observacoes?:    string;
  estado?:         string;
}

// create / update payloads
export type MarcacaoCreate = MarcacaoBase;
export type MarcacaoUpdate = Partial<MarcacaoBase>;



// Vue Cal event
export interface VueCalEvent {
  id:         number | string;
  start:      Date;
  end:        Date;
  title:      string;
  allDay?:    boolean;
  draggable?: boolean;
  resizable?: boolean;
  deletable?: boolean;
  // …any other custom VueCal props…
  // and your marcacao fields:
  paciente_id: number;
  medico_id:   number;
  clinic_id:   number;
  agendada_por:number;
  entidade_id: number;
  observacoes?: string;
  estado:      string;
}

export interface PacienteInfo {
  id:       number
  nome:     string
  telefone: string
}

export interface EntidadeInfo {
  id:   number
  slug: string
  nome: string
}

export interface MarcacaoRead
  extends VueCalEvent,
          MarcacaoBase
{
  id:          number             
  created_at:  string             
  updated_at:  string             

  paciente:    PacienteInfo
  entidade:    EntidadeInfo
}