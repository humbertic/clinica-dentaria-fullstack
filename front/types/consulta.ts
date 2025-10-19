import type { PacienteListItem } from '~/types/pacientes'
import type { Clinica } from '~/types/clinica'
import type { UtilizadorResponse } from '~/types/utilizador'
import type { Entidade } from '~/types/entidade'
// import type { ArtigoMedico } from '~/types/artigos'

export interface ConsultaBase {
  paciente_id: number
  clinica_id: number
  medico_id?: number | null
  entidade_id: number
  observacoes?: string | null
}

export interface ConsultaCreate extends ConsultaBase {}

export interface ConsultaRead extends ConsultaBase {
  id: number
  data_inicio: string // ISO datetime string
  data_fim?: string | null
  estado: string
  created_at: string
  updated_at: string
}

export interface ConsultaItemBase {
  artigo_id: number
  quantidade?: number
  preco_unitario: number
  numero_dente?: number | null
  face?: string[] | null
}

export interface ConsultaItemCreate extends ConsultaItemBase {}

export interface ConsultaItemRead extends ConsultaItemBase {
  id: number
  total: number
}

export interface ConsultaFull extends ConsultaRead {
  itens: ConsultaItemRead[]
  // Expand relationships
  paciente?: PacienteListItem
  clinica?: Clinica
  medico?: UtilizadorResponse
  entidade?: Entidade
}

export interface ConsultaUpdate {
  paciente_id?: number
  clinica_id?: number
  medico_id?: number | null
  entidade_id?: number
  observacoes?: string | null
  data_inicio?: string // ISO datetime
  data_fim?: string | null
  estado?: string
}

export interface ConsultaItemUpdate {
  artigo_id?: number
  quantidade?: number
  preco_unitario?: number
  numero_dente?: number | null
  face?: string[] | null
}