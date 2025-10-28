// app/components/vinculos/types.ts
export interface Vinculo {
  id: string
  employee_id: string
  employee_nome?: string
  knowledge_id: string
  knowledge_nome?: string
  knowledge_tipo?: string
  status: string
  progresso?: number
  data_inicio?: string
  data_limite?: string
  data_obtencao?: string
  data_expiracao?: string
  observacoes?: string
  certificado_url?: string
  dias_para_expirar?: number | null
  vencido?: boolean
}

export interface Colaborador {
  id: string
  nome?: string
  nome_completo?: string
  cargo?: string
}

export interface Conhecimento {
  id: string
  nome: string
  tipo: string
}

export interface VinculoFormState {
  employee_id: string
  knowledge_id: string
  status: 'DESEJADO' | 'OBTIDO' | 'OBRIGATORIO'
  progresso: number
  observacoes: string
  data_inicio: string
  data_limite: string
  data_obtencao: string
  data_expiracao: string
  certificado_url: string
}
