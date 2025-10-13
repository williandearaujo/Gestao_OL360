'use client'

import React, { useState, useEffect } from 'react'
import { Save, X, User, Briefcase, Calendar, DollarSign, MapPin, Phone, Mail, Shield, Users } from 'lucide-react'

interface Colaborador {
  id?: string
  nome_completo: string
  cpf: string
  rg?: string
  data_nascimento: string
  estado_civil: string
  genero: string
  email_pessoal?: string
  email_corporativo: string
  telefone_pessoal?: string
  telefone_corporativo?: string

  // Endereço
  endereco_logradouro?: string
  endereco_numero?: string
  endereco_complemento?: string
  endereco_bairro?: string
  endereco_cidade?: string
  endereco_estado?: string
  endereco_cep?: string

  // Profissional
  cargo: string
  departamento: string
  data_admissao: string
  data_demissao?: string
  salario?: number
  tipo_contrato: string
  nivel: string
  status: string

  // Hierarquia
  manager_id?: string
  team_id?: string

  // Banco e emergência
  banco?: string
  agencia?: string
  conta?: string
  pix?: string
  contato_emergencia_nome?: string
  contato_emergencia_telefone?: string
  contato_emergencia_parentesco?: string
}

interface Gerente {
  id: string
  nome: string
  cargo: string
}

interface Equipe {
  id: string
  nome: string
  departamento: string
}

interface EmployeeFormProps {
  employee?: Colaborador
  onSave: (employee: Colaborador) => Promise<void>
  onCancel: () => void
  gerentes: Gerente[]
  equipes: Equipe[]
}

export default function EmployeeFormComplete({ employee, onSave, onCancel, gerentes, equipes }: EmployeeFormProps) {
  const [formData, setFormData] = useState<Colaborador>({
    nome_completo: '',
    cpf: '',
    rg: '',
    data_nascimento: '',
    estado_civil: 'SOLTEIRO',
    genero: 'NAO_INFORMADO',
    email_corporativo: '',
    cargo: '',
    departamento: '',
    data_admissao: '',
    tipo_contrato: 'CLT',
    nivel: 'JUNIOR',
    status: 'ATIVO',
    ...employee
  })

  const [activeTab, setActiveTab] = useState('pessoais')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const tabs = [
    { id: 'pessoais', label: 'Dados Pessoais', icon: User },
    { id: 'profissionais', label: 'Dados Profissionais', icon: Briefcase },
    { id: 'endereco', label: 'Endereço', icon: MapPin },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'hierarquia', label: 'Hierarquia', icon: Users },
    { id: 'emergencia', label: 'Emergência', icon: Shield }
  ]

  const estadosCivis = [
    { value: 'SOLTEIRO', label: 'Solteiro(a)' },
    { value: 'CASADO', label: 'Casado(a)' },
    { value: 'DIVORCIADO', label: 'Divorciado(a)' },
    { value: 'VIUVO', label: 'Viúvo(a)' },
    { value: 'UNIAO_ESTAVEL', label: 'União Estável' }
  ]

  const generos = [
    { value: 'MASCULINO', label: 'Masculino' },
    { value: 'FEMININO', label: 'Feminino' },
    { value: 'NAO_BINARIO', label: 'Não-binário' },
    { value: 'NAO_INFORMADO', label: 'Prefiro não informar' }
  ]

  const tiposContrato = [
    { value: 'CLT', label: 'CLT' },
    { value: 'PJ', label: 'PJ' },
    { value: 'ESTAGIO', label: 'Estágio' },
    { value: 'TEMPORARIO', label: 'Temporário' },
    { value: 'TERCEIRIZADO', label: 'Terceirizado' }
  ]

  const niveis = [
    { value: 'ESTAGIARIO', label: 'Estagiário' },
    { value: 'JUNIOR', label: 'Júnior' },
    { value: 'PLENO', label: 'Pleno' },
    { value: 'SENIOR', label: 'Sênior' },
    { value: 'ESPECIALISTA', label: 'Especialista' },
    { value: 'COORDENADOR', label: 'Coordenador' },
    { value: 'GERENTE', label: 'Gerente' },
    { value: 'DIRETOR', label: 'Diretor' }
  ]

  const statusOptions = [
    { value: 'ATIVO', label: 'Ativo', color: 'text-green-600' },
    { value: 'FERIAS', label: 'Férias', color: 'text-blue-600' },
    { value: 'AFASTADO', label: 'Afastado', color: 'text-yellow-600' },
    { value: 'DESLIGADO', label: 'Desligado', color: 'text-red-600' }
  ]

  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ]

  const departamentos = [
    'TECNOLOGIA',
    'VENDAS',
    'MARKETING',
    'FINANCEIRO',
    'RH',
    'OPERACOES',
    'JURIDICO',
    'ADMINISTRATIVO'
  ]

  const handleChange = (field: keyof Colaborador, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1')
  }

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1')
  }

  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1')
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nome_completo) newErrors.nome_completo = 'Nome obrigatório'
    if (!formData.cpf) newErrors.cpf = 'CPF obrigatório'
    if (!formData.email_corporativo) newErrors.email_corporativo = 'Email corporativo obrigatório'
    if (!formData.cargo) newErrors.cargo = 'Cargo obrigatório'
    if (!formData.departamento) newErrors.departamento = 'Departamento obrigatório'
    if (!formData.data_admissao) newErrors.data_admissao = 'Data de admissão obrigatória'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      alert('Por favor, preencha todos os campos obrigatórios')
      return
    }

    setSaving(true)
    try {
      await onSave(formData)
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar colaborador')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">
              {employee ? 'Editar Colaborador' : 'Novo Colaborador'}
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              Preencha todos os dados do colaborador
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-white hover:bg-blue-800 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b bg-gray-50 overflow-x-auto">
          <div className="flex">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-white'
                      : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">

          {/* TAB: Dados Pessoais */}
          {activeTab === 'pessoais' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nome_completo}
                    onChange={(e) => handleChange('nome_completo', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.nome_completo ? 'border-red-500' : ''
                    }`}
                    placeholder="Digite o nome completo"
                  />
                  {errors.nome_completo && (
                    <p className="text-red-500 text-xs mt-1">{errors.nome_completo}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CPF *
                  </label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => handleChange('cpf', formatCPF(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.cpf ? 'border-red-500' : ''
                    }`}
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RG
                  </label>
                  <input
                    type="text"
                    value={formData.rg || ''}
                    onChange={(e) => handleChange('rg', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="00.000.000-0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={formData.data_nascimento}
                    onChange={(e) => handleChange('data_nascimento', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado Civil
                  </label>
                  <select
                    value={formData.manager_id || ''}
                    onChange={(e) => handleChange('manager_id', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Nenhum</option>
                    {gerentes.map(gerente => (
                      <option key={gerente.id} value={gerente.id}>
                        {gerente.nome} - {gerente.cargo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Equipe
                  </label>
                  <select
                    value={formData.team_id || ''}
                    onChange={(e) => handleChange('team_id', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Nenhuma</option>
                    {equipes.map(equipe => (
                      <option key={equipe.id} value={equipe.id}>
                        {equipe.nome} ({equipe.departamento})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Sobre Hierarquia</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• O gerente direto terá acesso aos dados e avaliações deste colaborador</li>
                  <li>• A equipe determina o agrupamento organizacional</li>
                  <li>• Gerentes podem ter subordinados diretos e indiretos</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB: Emergência */}
          {activeTab === 'emergencia' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Contato de Emergência
                  </label>
                  <input
                    type="text"
                    value={formData.contato_emergencia_nome || ''}
                    onChange={(e) => handleChange('contato_emergencia_nome', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone de Emergência
                  </label>
                  <input
                    type="tel"
                    value={formData.contato_emergencia_telefone || ''}
                    onChange={(e) => handleChange('contato_emergencia_telefone', formatPhone(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parentesco
                  </label>
                  <input
                    type="text"
                    value={formData.contato_emergencia_parentesco || ''}
                    onChange={(e) => handleChange('contato_emergencia_parentesco', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Mãe, Pai, Cônjuge, Irmão(ã)"
                  />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-amber-900 mb-2">⚠️ Importante</h4>
                <p className="text-sm text-amber-800">
                  Este contato será acionado em caso de emergências médicas ou situações críticas.
                  Certifique-se de que as informações estão corretas e atualizadas.
                </p>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            * Campos obrigatórios
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Salvando...' : employee ? 'Salvar Alterações' : 'Cadastrar Colaborador'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}formData.estado_civil}
                    onChange={(e) => handleChange('estado_civil', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {estadosCivis.map(ec => (
                      <option key={ec.value} value={ec.value}>{ec.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gênero
                  </label>
                  <select
                    value={formData.genero}
                    onChange={(e) => handleChange('genero', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {generos.map(g => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Pessoal
                  </label>
                  <input
                    type="email"
                    value={formData.email_pessoal || ''}
                    onChange={(e) => handleChange('email_pessoal', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="email@pessoal.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone Pessoal
                  </label>
                  <input
                    type="tel"
                    value={formData.telefone_pessoal || ''}
                    onChange={(e) => handleChange('telefone_pessoal', formatPhone(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone Corporativo
                  </label>
                  <input
                    type="tel"
                    value={formData.telefone_corporativo || ''}
                    onChange={(e) => handleChange('telefone_corporativo', formatPhone(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: Dados Profissionais */}
          {activeTab === 'profissionais' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Corporativo *
                  </label>
                  <input
                    type="email"
                    value={formData.email_corporativo}
                    onChange={(e) => handleChange('email_corporativo', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.email_corporativo ? 'border-red-500' : ''
                    }`}
                    placeholder="email@empresa.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo *
                  </label>
                  <input
                    type="text"
                    value={formData.cargo}
                    onChange={(e) => handleChange('cargo', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.cargo ? 'border-red-500' : ''
                    }`}
                    placeholder="Ex: Desenvolvedor Full Stack"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departamento *
                  </label>
                  <select
                    value={formData.departamento}
                    onChange={(e) => handleChange('departamento', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.departamento ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">Selecione...</option>
                    {departamentos.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nível
                  </label>
                  <select
                    value={formData.nivel}
                    onChange={(e) => handleChange('nivel', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {niveis.map(n => (
                      <option key={n.value} value={n.value}>{n.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Contrato
                  </label>
                  <select
                    value={formData.tipo_contrato}
                    onChange={(e) => handleChange('tipo_contrato', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {tiposContrato.map(tc => (
                      <option key={tc.value} value={tc.value}>{tc.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {statusOptions.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Admissão *
                  </label>
                  <input
                    type="date"
                    value={formData.data_admissao}
                    onChange={(e) => handleChange('data_admissao', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.data_admissao ? 'border-red-500' : ''
                    }`}
                  />
                </div>

                {formData.status === 'DESLIGADO' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Demissão
                    </label>
                    <input
                      type="date"
                      value={formData.data_demissao || ''}
                      onChange={(e) => handleChange('data_demissao', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salário
                  </label>
                  <input
                    type="number"
                    value={formData.salario || ''}
                    onChange={(e) => handleChange('salario', parseFloat(e.target.value) || undefined)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: Endereço */}
          {activeTab === 'endereco' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CEP
                  </label>
                  <input
                    type="text"
                    value={formData.endereco_cep || ''}
                    onChange={(e) => handleChange('endereco_cep', formatCEP(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="00000-000"
                    maxLength={9}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logradouro
                  </label>
                  <input
                    type="text"
                    value={formData.endereco_logradouro || ''}
                    onChange={(e) => handleChange('endereco_logradouro', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Rua, Avenida, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número
                  </label>
                  <input
                    type="text"
                    value={formData.endereco_numero || ''}
                    onChange={(e) => handleChange('endereco_numero', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complemento
                  </label>
                  <input
                    type="text"
                    value={formData.endereco_complemento || ''}
                    onChange={(e) => handleChange('endereco_complemento', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Apto, Bloco, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bairro
                  </label>
                  <input
                    type="text"
                    value={formData.endereco_bairro || ''}
                    onChange={(e) => handleChange('endereco_bairro', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome do bairro"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formData.endereco_cidade || ''}
                    onChange={(e) => handleChange('endereco_cidade', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome da cidade"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={formData.endereco_estado || ''}
                    onChange={(e) => handleChange('endereco_estado', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione...</option>
                    {estados.map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Financeiro */}
          {activeTab === 'financeiro' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banco
                  </label>
                  <input
                    type="text"
                    value={formData.banco || ''}
                    onChange={(e) => handleChange('banco', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome do banco"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agência
                  </label>
                  <input
                    type="text"
                    value={formData.agencia || ''}
                    onChange={(e) => handleChange('agencia', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conta
                  </label>
                  <input
                    type="text"
                    value={formData.conta || ''}
                    onChange={(e) => handleChange('conta', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="00000-0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PIX
                  </label>
                  <input
                    type="text"
                    value={formData.pix || ''}
                    onChange={(e) => handleChange('pix', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="CPF, email, telefone ou chave aleatória"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: Hierarquia */}
          {activeTab === 'hierarquia' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gerente Direto
                  </label>
                  <select
                    value={