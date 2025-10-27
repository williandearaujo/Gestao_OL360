// app/components/vinculos/types.ts
export interface Vinculo {
  id: string
  employee_id: string
  employee_nome?: string
  knowledge_id: string
  knowledge_nome?: string
  status: string
  data_inicio?: string
  data_limite?: string
  data_obtencao?: string
  progresso?: number
  observacoes: string
  nivel_obtido: string
}

export interface Colaborador {
  id: string
  nome: string
  cargo: string
}

export interface Conhecimento {
  id: string
  nome: string
  tipo: string
}
