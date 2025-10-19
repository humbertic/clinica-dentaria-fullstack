export interface UtilizadorCreate {
  username: string
  nome: string
  email: string
  telefone: string
  password: string
}

export interface UtilizadorAdminUpdate {
  nome: string
  telefone: string
  ativo?: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface UtilizadorUpdate {
  nome: string
  telefone: string
}

export interface AtribuirPerfilRequest {
  perfil_id: number
}

export interface AtribuirClinicaRequest {
  clinica_ids: number[]
}

// export interface UtilizadorClinicaResponse {
//   clinica: ClinicaMinimalResponse | null
// }

export interface UtilizadorResponse {
  id: number
  username: string
  nome: string
  email: string
  telefone?: string
  ativo: boolean
  bloqueado: boolean
//   perfil?: PerfilResponse | null
//   clinicas: UtilizadorClinicaResponse[]
}

export interface TokenResponse {
  access_token: string
  token_type: 'bearer'
}

export interface AlterarSenhaRequest {
  senha_atual: string
  nova_senha: string
}