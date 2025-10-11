const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type ResponseType = 'json' | 'none'

async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
  responseType: ResponseType = 'json'
) {
  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(options.headers || {}),
  }

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
    throw new Error(error.detail || 'Erro na requisição')
  }

  if (responseType === 'none' || response.status === 204) return
  return response.json()
}

// AUTH
export async function login(email: string, password: string) {
  return fetchWithAuth('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

// COLABORADORES
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

export async function getColaboradores(): Promise<Colaborador[]> {
  return fetchWithAuth('/api/employees')
}

export async function getColaborador(id: string): Promise<Colaborador> {
  return fetchWithAuth(`/api/employees/${id}`)
}

export async function createColaborador(data: Colaborador): Promise<Colaborador> {
  return fetchWithAuth('/api/employees', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateColaborador(id: string, data: Partial<Colaborador>): Promise<Colaborador> {
  return fetchWithAuth(`/api/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteColaborador(id: string): Promise<void> {
  await fetchWithAuth(`/api/employees/${id}`, {
    method: 'DELETE',
  }, 'none') // <- define que não espera retorno JSON
}

// EQUIPES
export async function getEquipes() {
  return fetchWithAuth('/api/teams')
}

// PDI
export async function getPDIs() {
  return fetchWithAuth('/api/pdis')
}

export async function getPDI(id: string) {
  return fetchWithAuth(`/api/pdis/${id}`)
}

// ONE-TO-ONE
export async function getOneToOnes() {
  return fetchWithAuth('/api/one-to-ones')
}

export async function getOneToOne(id: string) {
  return fetchWithAuth(`/api/one-to-ones/${id}`)
}
