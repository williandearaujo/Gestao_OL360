'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Calendar, Target, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface PDIAction {
  id: string
  titulo: string
  descricao: string
  categoria: string
  prioridade: string
  data_inicio: string
  data_limite: string
  status: string
  responsavel: string
  progresso: number
}

export default function PDIPage() {
  const [acoes, setAcoes] = useState<PDIAction[]>([])
  const [showModal, setShowModal] = useState(false)
  const [novaAcao, setNovaAcao] = useState<Partial<PDIAction>>({
    titulo: '',
    descricao: '',
    categoria: 'HABILIDADE_TECNICA',
    prioridade: 'MEDIA',
    status: 'PENDENTE',
    progresso: 0
  })

  const categorias = [
    { value: 'HABILIDADE_TECNICA', label: 'Habilidade Técnica' },
    { value: 'SOFT_SKILL', label: 'Soft Skill' },
    { value: 'LIDERANCA', label: 'Liderança' },
    { value: 'CERTIFICACAO', label: 'Certificação' },
    { value: 'IDIOMA', label: 'Idioma' }
  ]

  const prioridades = [
    { value: 'BAIXA', label: 'Baixa', color: 'text-green-600 bg-green-100' },
    { value: 'MEDIA', label: 'Média', color: 'text-yellow-600 bg-yellow-100' },
    { value: 'ALTA', label: 'Alta', color: 'text-red-600 bg-red-100' }
  ]

  const statusOptions = [
    { value: 'PENDENTE', label: 'Pendente', icon: Clock, color: 'text-gray-600 bg-gray-100' },
    { value: 'EM_ANDAMENTO', label: 'Em Andamento', icon: Target, color: 'text-blue-600 bg-blue-100' },
    { value: 'CONCLUIDO', label: 'Concluído', icon: CheckCircle, color: 'text-green-600 bg-green-100' },
    { value: 'ATRASADO', label: 'Atrasado', icon: AlertCircle, color: 'text-red-600 bg-red-100' }
  ]

  const handleAddAction = () => {
    const acao: PDIAction = {
      id: Date.now().toString(),
      titulo: novaAcao.titulo || '',
      descricao: novaAcao.descricao || '',
      categoria: novaAcao.categoria || 'HABILIDADE_TECNICA',
      prioridade: novaAcao.prioridade || 'MEDIA',
      data_inicio: novaAcao.data_inicio || new Date().toISOString().split('T')[0],
      data_limite: novaAcao.data_limite || '',
      status: novaAcao.status || 'PENDENTE',
      responsavel: novaAcao.responsavel || 'Sistema',
      progresso: 0
    }

    setAcoes([...acoes, acao])
    setShowModal(false)
    setNovaAcao({
      titulo: '',
      descricao: '',
      categoria: 'HABILIDADE_TECNICA',
      prioridade: 'MEDIA',
      status: 'PENDENTE',
      progresso: 0
    })
  }

  const updateProgress = (id: string, progresso: number) => {
    setAcoes(acoes.map(acao =>
      acao.id === id
        ? {
            ...acao,
            progresso,
            status: progresso === 100 ? 'CONCLUIDO' : progresso > 0 ? 'EM_ANDAMENTO' : 'PENDENTE'
          }
        : acao
    ))
  }

  const getStatusConfig = (status: string) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0]
  }

  const getPrioridadeColor = (prioridade: string) => {
    return prioridades.find(p => p.value === prioridade)?.color || 'text-gray-600 bg-gray-100'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Plano de Desenvolvimento Individual</h1>
              <p className="text-gray-600 mt-2">Gerencie suas metas e ações de desenvolvimento</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nova Ação
            </button>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            {statusOptions.map(status => {
              const count = acoes.filter(a => a.status === status.value).length
              const Icon = status.icon
              return (
                <div key={status.value} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${status.color.split(' ')[0]}`} />
                    <span className="text-sm text-gray-600">{status.label}</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">{count}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Lista de Ações */}
        <div className="space-y-4">
          {acoes.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhuma ação cadastrada</h3>
              <p className="text-gray-500 mb-6">Comece criando sua primeira ação de desenvolvimento</p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Criar Primeira Ação
              </button>
            </div>
          ) : (
            acoes.map(acao => {
              const statusConfig = getStatusConfig(acao.status)
              const StatusIcon = statusConfig.icon
              return (
                <div key={acao.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">{acao.titulo}</h3>
                      <p className="text-gray-600 mt-1">{acao.descricao}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        <StatusIcon className="w-3 h-3 inline mr-1" />
                        {statusConfig.label}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPrioridadeColor(acao.prioridade)}`}>
                        {prioridades.find(p => p.value === acao.prioridade)?.label}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Categoria:</span>
                      <p className="font-medium">{categorias.find(c => c.value === acao.categoria)?.label}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Data Limite:</span>
                      <p className="font-medium">{acao.data_limite ? new Date(acao.data_limite).toLocaleDateString('pt-BR') : 'Não definida'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Responsável:</span>
                      <p className="font-medium">{acao.responsavel}</p>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progresso</span>
                      <span className="font-semibold">{acao.progresso}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${acao.progresso}%` }}
                      />
                    </div>
                  </div>

                  {/* Controle de Progresso */}
                  <div className="flex gap-2 mt-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={acao.progresso}
                      onChange={(e) => updateProgress(acao.id, parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={acao.progresso}
                      onChange={(e) => updateProgress(acao.id, parseInt(e.target.value))}
                      className="w-16 px-2 py-1 border rounded text-center"
                    />
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Nova Ação de PDI</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
                <input
                  type="text"
                  value={novaAcao.titulo}
                  onChange={(e) => setNovaAcao({...novaAcao, titulo: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Aprender React avançado"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                <textarea
                  value={novaAcao.descricao}
                  onChange={(e) => setNovaAcao({...novaAcao, descricao: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Descreva os detalhes da ação..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                  <select
                    value={novaAcao.categoria}
                    onChange={(e) => setNovaAcao({...novaAcao, categoria: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {categorias.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prioridade</label>
                  <select
                    value={novaAcao.prioridade}
                    onChange={(e) => setNovaAcao({...novaAcao, prioridade: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {prioridades.map(pri => (
                      <option key={pri.value} value={pri.value}>{pri.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data Início</label>
                  <input
                    type="date"
                    value={novaAcao.data_inicio}
                    onChange={(e) => setNovaAcao({...novaAcao, data_inicio: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data Limite</label>
                  <input
                    type="date"
                    value={novaAcao.data_limite}
                    onChange={(e) => setNovaAcao({...novaAcao, data_limite: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Responsável</label>
                <input
                  type="text"
                  value={novaAcao.responsavel}
                  onChange={(e) => setNovaAcao({...novaAcao, responsavel: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome do responsável"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddAction}
                disabled={!novaAcao.titulo}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adicionar Ação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}