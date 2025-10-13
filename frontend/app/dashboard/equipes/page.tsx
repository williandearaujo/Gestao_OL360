'use client'

import React, { useState } from 'react'
import { Users, Plus, Edit, Trash2, UserCheck, Settings, Target } from 'lucide-react'

interface Equipe {
  id: string
  nome: string
  departamento: string
  gerente_id?: string
  gerente_nome?: string
  descricao: string
  ativo: boolean
  criado_em: string
  membros_count: number
  metas?: string[]
}

interface Gerente {
  id: string
  nome: string
  cargo: string
}

interface TeamsManagementProps {
  gerentes: Gerente[]
}

export default function TeamsManagementPage({ gerentes }: TeamsManagementProps) {
  const [equipes, setEquipes] = useState<Equipe[]>([
    {
      id: '1',
      nome: 'Desenvolvimento Frontend',
      departamento: 'TECNOLOGIA',
      gerente_id: '1',
      gerente_nome: 'João Silva',
      descricao: 'Equipe responsável pelo desenvolvimento de interfaces',
      ativo: true,
      criado_em: '2024-01-15',
      membros_count: 8,
      metas: ['Melhorar performance', 'Implementar design system']
    },
    {
      id: '2',
      nome: 'Desenvolvimento Backend',
      departamento: 'TECNOLOGIA',
      gerente_id: '1',
      gerente_nome: 'João Silva',
      descricao: 'Equipe responsável pelas APIs e integrações',
      ativo: true,
      criado_em: '2024-01-15',
      membros_count: 6,
      metas: ['Otimizar queries', 'Migrar para microserviços']
    }
  ])

  const [showModal, setShowModal] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Equipe | null>(null)
  const [novaEquipe, setNovaEquipe] = useState({
    nome: '',
    departamento: 'TECNOLOGIA',
    gerente_id: '',
    descricao: '',
    ativo: true,
    metas: [] as string[]
  })
  const [metaTemp, setMetaTemp] = useState('')

  const departamentos = [
    { value: 'TECNOLOGIA', label: 'Tecnologia', color: 'bg-blue-100 text-blue-800' },
    { value: 'VENDAS', label: 'Vendas', color: 'bg-green-100 text-green-800' },
    { value: 'MARKETING', label: 'Marketing', color: 'bg-purple-100 text-purple-800' },
    { value: 'FINANCEIRO', label: 'Financeiro', color: 'bg-amber-100 text-amber-800' },
    { value: 'RH', label: 'RH', color: 'bg-pink-100 text-pink-800' },
    { value: 'OPERACOES', label: 'Operações', color: 'bg-teal-100 text-teal-800' },
    { value: 'JURIDICO', label: 'Jurídico', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'ADMINISTRATIVO', label: 'Administrativo', color: 'bg-gray-100 text-gray-800' }
  ]

  const handleAddMeta = () => {
    if (metaTemp.trim() && !novaEquipe.metas.includes(metaTemp.trim())) {
      setNovaEquipe({
        ...novaEquipe,
        metas: [...novaEquipe.metas, metaTemp.trim()]
      })
      setMetaTemp('')
    }
  }

  const handleRemoveMeta = (index: number) => {
    setNovaEquipe({
      ...novaEquipe,
      metas: novaEquipe.metas.filter((_, i) => i !== index)
    })
  }

  const handleSave = () => {
    const gerente = gerentes.find(g => g.id === novaEquipe.gerente_id)
    
    if (editingTeam) {
      setEquipes(equipes.map(e => 
        e.id === editingTeam.id 
          ? {
              ...e,
              ...novaEquipe,
              gerente_nome: gerente?.nome
            }
          : e
      ))
    } else {
      const equipe: Equipe = {
        id: Date.now().toString(),
        nome: novaEquipe.nome,
        departamento: novaEquipe.departamento,
        gerente_id: novaEquipe.gerente_id,
        gerente_nome: gerente?.nome,
        descricao: novaEquipe.descricao,
        ativo: novaEquipe.ativo,
        criado_em: new Date().toISOString().split('T')[0],
        membros_count: 0,
        metas: novaEquipe.metas
      }
      setEquipes([...equipes, equipe])
    }
    
    setShowModal(false)
    setEditingTeam(null)
    setNovaEquipe({
      nome: '',
      departamento: 'TECNOLOGIA',
      gerente_id: '',
      descricao: '',
      ativo: true,
      metas: []
    })
  }

  const handleEdit = (equipe: Equipe) => {
    setEditingTeam(equipe)
    setNovaEquipe({
      nome: equipe.nome,
      departamento: equipe.departamento,
      gerente_id: equipe.gerente_id || '',
      descricao: equipe.descricao,
      ativo: equipe.ativo,
      metas: equipe.metas || []
    })
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta equipe?')) {
      setEquipes(equipes.filter(e => e.id !== id))
    }
  }

  const handleToggleStatus = (id: string) => {
    setEquipes(equipes.map(e => 
      e.id === id ? { ...e, ativo: !e.ativo } : e
    ))
  }

  const getDepartamentoColor = (dept: string) => {
    return departamentos.find(d => d.value === dept)?.color || 'bg-gray-100 text-gray-800'
  }

  const equipesPorDepartamento = departamentos.map(dept => ({
    ...dept,
    equipes: equipes.filter(e => e.departamento === dept.value)
  })).filter(d => d.equipes.length > 0)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestão de Equipes</h1>
              <p className="text-gray-600 mt-2">Organize e gerencie as equipes da empresa</p>
            </div>
            <button
              onClick={() => {
                setEditingTeam(null)
                setNovaEquipe({
                  nome: '',
                  departamento: 'TECNOLOGIA',
                  gerente_id: '',
                  descricao: '',
                  ativo: true,
                  metas: []
                })
                setShowModal(true)
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nova Equipe
            </button>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-900 font-medium">Total de Equipes</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">{equipes.length}</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-900 font-medium">Equipes Ativas</span>
              </div>
              <p className="text-2xl font-bold text-green-700">
                {equipes.filter(e => e.ativo).length}
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-purple-900 font-medium">Departamentos</span>
              </div>
              <p className="text-2xl font-bold text-purple-700">
                {new Set(equipes.map(e => e.departamento)).size}
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-amber-600" />
                <span className="text-sm text-amber-900 font-medium">Total Membros</span>
              </div>
              <p className="text-2xl font-bold text-amber-700">
                {equipes.reduce((sum, e) => sum + e.membros_count, 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Equipes por Departamento */}
        <div className="space-y-6">
          {equipesPorDepartamento.map(dept => (
            <div key={dept.value} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${dept.color}`}>
                  {dept.label}
                </span>
                <span className="text-sm text-gray-600">
                  {dept.equipes.length} equipe(s)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dept.equipes.map(equipe => (
                  <div
                    key={equipe.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{equipe.nome}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{equipe.descricao}</p>
                      </div>
                      <button
                        onClick={() => handleToggleStatus(equipe.id)}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          equipe.ativo 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {equipe.ativo ? 'Ativa' : 'Inativa'}
                      </button>
                    </div>

                    <div className="space-y-2 text-sm mb-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <UserCheck className="w-4 h-4" />
                        <span>{equipe.gerente_nome || 'Sem gerente'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{equipe.membros_count} membro(s)</span>
                      </div>
                    </div>

                    {equipe.metas && equipe.metas.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          Metas:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {equipe.metas.map((meta, index) => (
                            <span key={index} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                              {meta}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-3 border-t">
                      <button
                        onClick={() => handleEdit(equipe)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded transition-colors text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(equipe.id)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded transition-colors text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {equipes.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhuma equipe cadastrada</h3>
            <p className="text-gray-500 mb-6">Comece criando a primeira equipe da empresa</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Criar Primeira Equipe
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-600 text-white p-6 rounded-t-lg flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">
                  {editingTeam ? 'Editar Equipe' : 'Nova Equipe'}
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  Preencha as informações da equipe
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-blue-700 p-2 rounded"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Equipe *
                </label>
                <input
                  type="text"
                  value={novaEquipe.nome}
                  onChange={(e) => setNovaEquipe({ ...novaEquipe, nome: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Desenvolvimento Frontend"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gerente
                  </label>
                  <select
                    value={novaEquipe.gerente_id}
                    onChange={(e) => setNovaEquipe({ ...novaEquipe, gerente_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione um gerente</option>
                    {gerentes.map(gerente => (
                      <option key={gerente.id} value={gerente.id}>
                        {gerente.nome} - {gerente.cargo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={novaEquipe.descricao}
                  onChange={(e) => setNovaEquipe({ ...novaEquipe, descricao: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Descreva o objetivo e responsabilidades da equipe..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metas da Equipe
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={metaTemp}
                    onChange={(e) => setMetaTemp(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMeta())}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Digite uma meta e pressione Enter"
                  />
                  <button
                    type="button"
                    onClick={handleAddMeta}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Adicionar
                  </button>
                </div>
                {novaEquipe.metas.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {novaEquipe.metas.map((meta, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2">
                        <Target className="w-3 h-3" />
                        {meta}
                        <button
                          type="button"
                          onClick={() => handleRemoveMeta(index)}
                          className="text-blue-900 hover:text-blue-700 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={novaEquipe.ativo}
                  onChange={(e) => setNovaEquipe({ ...novaEquipe, ativo: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="ativo" className="text-sm font-medium text-gray-700">
                  Equipe ativa
                </label>
              </div>
            </div>

            <div className="border-t p-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!novaEquipe.nome || !novaEquipe.departamento}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingTeam ? 'Salvar Alterações' : 'Criar Equipe'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
                    Departamento *
                  </label>
                  <select
                    value={novaEquipe.departamento}
                    onChange={(e) => setNovaEquipe({ ...novaEquipe, departamento: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {departamentos.map(dept => (
                      <option key={dept.value} value={dept.value}>{dept.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">