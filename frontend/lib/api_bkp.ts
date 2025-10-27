/**
 * API Client - Sistema Gestão 360 OL
 * Cliente HTTP para comunicação com backend FastAPI
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type ResponseType = 'json' | 'none'

/**
 * Função auxiliar para fazer requisições autenticadas
 */
async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
  responseType: ResponseType = 'json'
) {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(options.headers || {}),
  }

  try {
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      let error
      try {
        error = await response.json()
      } catch {
        error = { detail: 'Erro desconhecido' }
      }
      throw new Error(error.detail || `Erro na requisição: ${response.status}`)
    }

    if (responseType === 'none' || response.status === 204) return
    return response.json()
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// ============================================================================
// AUTH - AUTENTICAÇÃO
// ============================================================================

export interface LoginResponse {
  access_token: string
  token_type: string
  user: {
    id: string
    email: string
    full_name: string
    role: string
    is_active: boolean
  }
}

/**
 * Login do usuário
 * Endpoint: POST /auth/login
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  console.log('=== LOGIN DEBUG ===')
  console.log('Email recebido:', email)
  console.log('Password recebido:', password)

  const payload = { email, password }
  console.log('Payload a ser enviado:', payload)
  console.log('Payload stringified:', JSON.stringify(payload))

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Backend espera 'username', não 'email'
      body: JSON.stringify(payload),
    })

    console.log('Response status:', response.status)
    console.log('Response ok:', response.ok)

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
        console.error('API Error Response:', errorData)
      } catch {
        errorData = { detail: 'Erro desconhecido' }
      }

      // Se for erro de validação (422), mostrar detalhes
      if (response.status === 422 && errorData.detail) {
        const validationErrors = Array.isArray(errorData.detail)
          ? errorData.detail.map((err: any) => `${err.loc.join('.')}: ${err.msg}`).join(', ')
          : errorData.detail
        throw new Error(validationErrors)
      }

      throw new Error(errorData.detail || 'Email ou senha incorretos')
    }

    const data = await response.json()
    console.log('Login successful:', data)
    return data
  } catch (error) {
    console.error('Login Error:', error)
    throw error
  }
}

/**
 * Obter informações do usuário logado
 * Endpoint: GET /auth/me
 */
export async function getCurrentUser() {
  return fetchWithAuth('/auth/me')
}

// ============================================================================
// COLABORADORES - EMPLOYEES
// ============================================================================

export interface Colaborador {
  id?: string
  nome_completo: string
  cpf: string
  rg?: string
  data_nascimento: string
  estado_civil?: string
  email_pessoal?: string
  email_corporativo: string
  telefone_pessoal?: string
  telefone_corporativo?: string
  endereco?: string
  cargo: string
  departamento: string
  data_admissao: string
  salario?: number
  status: string
  manager_id?: string
  team_id?: string
}

/**
 * Listar todos os colaboradores
 * Endpoint: GET /employees
 */
export async function getColaboradores(): Promise<Colaborador[]> {
  return fetchWithAuth('/employees')
}

/**
 * Buscar colaborador por ID
 * Endpoint: GET /employees/{id}
 */
export async function getColaborador(id: string): Promise<Colaborador> {
  return fetchWithAuth(`/employees/${id}`)
}

/**
 * Criar novo colaborador
 * Endpoint: POST /employees
 */
export async function createColaborador(data: Colaborador): Promise<Colaborador> {
  return fetchWithAuth('/employees', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Atualizar colaborador
 * Endpoint: PUT /employees/{id}
 */
export async function updateColaborador(id: string, data: Partial<Colaborador>): Promise<Colaborador> {
  return fetchWithAuth(`/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * Deletar colaborador
 * Endpoint: DELETE /employees/{id}
 */
export async function deleteColaborador(id: string): Promise<void> {
  await fetchWithAuth(`/employees/${id}`, {
    method: 'DELETE',
  }, 'none')
}

// ============================================================================
// EQUIPES - TEAMS
// ============================================================================

export interface Equipe {
  id: string
  nome: string
  descricao?: string
  area_id: string
  manager_id?: string
  status: string
}

/**
 * Listar todas as equipes
 * Endpoint: GET /teams
 */
export async function getEquipes(): Promise<Equipe[]> {
  return fetchWithAuth('/teams')
}

/**
 * Buscar equipe por ID
 * Endpoint: GET /teams/{id}
 */
export async function getEquipe(id: string): Promise<Equipe> {
  return fetchWithAuth(`/teams/${id}`)
}

// ============================================================================
// ÁREAS - AREAS
// ============================================================================

export interface Area {
  id: string
  nome: string
  descricao?: string
  responsavel_id?: string
  status: string
}

/**
 * Listar todas as áreas
 * Endpoint: GET /areas
 */
export async function getAreas(): Promise<Area[]> {
  return fetchWithAuth('/areas')
}

// ============================================================================
// CONHECIMENTOS - KNOWLEDGE
// ============================================================================

export interface Conhecimento {
  id: string
  nome: string
  descricao?: string
  tipo: string
  nivel_minimo: string
  categoria?: string
}

/**
 * Listar todos os conhecimentos
 * Endpoint: GET /knowledge
 */
export async function getConhecimentos(): Promise<Conhecimento[]> {
  return fetchWithAuth('/knowledge')
}

/**
 * Buscar conhecimento por ID
 * Endpoint: GET /knowledge/{id}
 */
export async function getConhecimento(id: string): Promise<Conhecimento> {
  return fetchWithAuth(`/knowledge/${id}`)
}

// ============================================================================
// PDI - PLANOS DE DESENVOLVIMENTO INDIVIDUAL
// ============================================================================

export interface PDI {
  id: string
  employee_id: string
  goal: string
  description?: string
  deadline: string
  status: string
}

/**
 * Listar todos os PDIs
 * Endpoint: GET /pdis
 */
export async function getPDIs(): Promise<PDI[]> {
  return fetchWithAuth('/pdis')
}

/**
 * Buscar PDI por ID
 * Endpoint: GET /pdis/{id}
 */
export async function getPDI(id: string): Promise<PDI> {
  return fetchWithAuth(`/pdis/${id}`)
}

// ============================================================================
// ONE-TO-ONE - REUNIÕES 1:1
// ============================================================================

export interface OneToOne {
  id: string
  manager_id: string
  employee_id: string
  scheduled_date: string
  status: string
  notes?: string
}

/**
 * Listar todos os one-to-ones
 * Endpoint: GET /one-to-ones
 */
export async function getOneToOnes(): Promise<OneToOne[]> {
  return fetchWithAuth('/one-to-ones')
}

/**
 * Buscar one-to-one por ID
 * Endpoint: GET /one-to-ones/{id}
 */
export async function getOneToOne(id: string): Promise<OneToOne> {
  return fetchWithAuth(`/one-to-ones/${id}`)
}

// ============================================================================
// ADMIN - ADMINISTRAÇÃO
// ============================================================================

/**
 * Obter dashboard do admin
 * Endpoint: GET /admin/dashboard
 */
export async function getAdminDashboard() {
  return fetchWithAuth('/admin/dashboard')
}

/**
 * Listar todos os usuários
 * Endpoint: GET /admin/users
 */
export async function getUsers() {
  return fetchWithAuth('/admin/users')
}

// Export default com todas as funções
export default {
  // Auth
  login,
  getCurrentUser,

  // Colaboradores
  getColaboradores,
  getColaborador,
  createColaborador,
  updateColaborador,
  deleteColaborador,

  // Equipes
  getEquipes,
  getEquipe,

  // Áreas
  getAreas,

  // Conhecimentos
  getConhecimentos,
  getConhecimento,

  // PDI
  getPDIs,
  getPDI,

  // One-to-One
  getOneToOnes,
  getOneToOne,

  // Admin
  getAdminDashboard,
  getUsers,
}