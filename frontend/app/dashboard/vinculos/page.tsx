'use client'

import React, { useState } from 'react'
import { Link as LinkIcon, Plus, Edit, Trash2, Users, BookOpen, Target, Calendar } from 'lucide-react'

interface Vinculo {
  id: string
  colaborador_id: string
  colaborador_nome: string
  conhecimento_id: string
  conhecimento_nome: string
  status: string
  data_inicio?: string
  data_alvo?: string
  data_obtencao?: string
  progresso: number
  observacoes: string
}

interface Colaborador {
  id: string
  nome: string
  cargo: string
}

interface Conhecimento {
  id: string
  nome: string
  tipo: string
}

export default function EmployeeKnowledgeLinksPage() {
  // Mock de dados
  const [colaboradores] = useState<Colaborador[]>([
    { id: '1', nome: 'João Silva', cargo: 'Desenvolvedor' },
    { id: '2', nome: 'Maria Santos', cargo: 'Designer' },
    { id: '3', nome: 'Pedro Costa', cargo: 'Analista' }
  ])

  const [conhecimentos] = useState<Conhecimento[]>([
    { id: '1', nome: 'React Avançado', tipo: 'HABILIDADE' },
    { id: '2', nome: 'Certificação AWS', tipo: 'CERTIFICACAO' },
    { id: '3', nome: 'Inglês Intermediário', tipo: 'IDIOMA' }
  ])

  const [vinculos, setVinculos] = useState<Vinculo[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState<Vinculo | null>(null)
  const [novoVinculo, setNovoVinculo] = useState<Partial<Vinculo>>({
    colaborador_id: '',
    conhecimento_id: '',
    status: 'EM_DESENVOLVIMENTO',
    progresso: 0,
    observacoes: ''
  })

  const statusOptions = [
    { value: 'PLANEJADO', label: 'Planejado', color: 'bg-gray-100 text-gray-800' },
    { value: 'EM_DESENVOLVIMENTO', label: 'Em Desenvolvimento', color: 'bg-blue-100 text-blue-800' },
    { value: 'OBTIDO', label: 'Obtido', color: 'bg-green-100 text-green-800' },
    { value: 'EXPIRADO', label: 'Expirado', color: 'bg-red-100 text-red-800' }
  ]

  const handleSalvar = () => {
    const colaborador = colaboradores.find(c => c.id === novoVinculo.colaborador_id)
    const conhecimento = conhecimentos.find(c => c.id === novoVinculo.conhecimento_id)

    if (!colaborador || !conhecimento) return

    if (editando) {
      setVinculos(vinculos.map(v =>
        v.id === editando.id
          ? {
              ...v,
              ...novoVinculo,
              colaborador_nome: colaborador.nome,
              conhecimento_nome: conhecimento.nome
            } as Vinculo
          : v
      ))
    } else {
      const vinculo: Vinculo = {
        id: Date.now().toString(),
        colaborador_id: novoVinculo.colaborador_id || '',
        colaborador_nome: colaborador.nome,
        conhecimento_id: novoVinculo.conhecimento_id || '',
        conhecimento_nome: conhecimento.nome,
        status: novoVinculo.status || 'EM_DESENVOLVIMENTO',
        data_inicio: novoVinculo.data_inicio,
        data_alvo: novoVinculo.data_alvo,
        data_obtencao: novoVinculo.data_obtencao,
        progresso: novoVinculo.progresso || 0,
        observacoes: novoVinculo.observacoes || ''
      }
      setVinculos([...vinculos, vinculo])
    }

    setShowModal(false)
    setEditando(null)
    setNovoVinculo({
      colaborador_id: '',
      conhecimento_id: '',
      status: 'EM_DESENVOLVIMENTO',
      progresso: 0,
      observacoes: ''
    })
  }

  const handleEditar = (vinculo: Vinculo) => {
    setEditando(vinculo)
    setNovoVinculo(vinculo)
    setShowModal(true)
  }

  const handleExcluir = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este vínculo?')) {
      setVinculos(vinculos.filter(v => v.id !== id))
    }
  }

  const getStatusConfig = (status: string) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0]
  }

  const updateProgresso = (id: string, progresso: number) => {
    setVinculos(vinculos.map(v =>
      v.id === id
        ? {
            ...v,
            progresso,
            status: progresso === 100 ? 'OBTIDO' : progresso > 0 ? 'EM_DESENVOLVIMENTO' : 'PLANEJADO'
          }
        : v
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vínculos Colaborador-Conhecimento</h1>
              <p className="text-gray-600 mt-2">Gerencie o desenvolvimento de conhecimentos dos colaboradores</p>
            </div>
            <button
              onClick={() => {
                setEditando(null)
                setNovoVinculo({
                  colaborador_id: '',
                  conhecimento_id: '',
                  status: 'EM_DESENVOLVIMENTO',
                  progresso: 0,
                  observacoes: ''
                })
                setShowModal(true)
              }}
              className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Novo Vínculo
            </button>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            {statusOptions.map(status => {
              const count = vinculos.filter(v => v.status === status.value).length
              return (
                <div key={status.value} className="bg-gray-50 rounded-lg p-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                    {status.label}
                  </span>
                  <p className="text-2xl font-bold mt-2">{count}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Lista de Vínculos */}
        <div className="space-y-4">
          {vinculos.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <LinkIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum vínculo cadastrado</h3>
              <p className="text-gray-500 mb-6">Comece vinculando colaboradores aos conhecimentos que precisam desenvolver</p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
              >
                Criar Primeiro Vínculo
              </button>
            </div>
          ) : (
            vinculos.map(vinculo => {
              const statusConfig = getStatusConfig(vinculo.status)
              return (
                <div key={vinculo.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="bg-teal-100 rounded-full p-3">
                        <Users className="w-6 h-6 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{vinculo.colaborador_nome}</h3>
                          <span className="text-gray-400">→</span>
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-gray-600" />
                            <span className="text-gray-700 font-medium">{vinculo.conhecimento_nome}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {vinculo.data_inicio && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Início: {new Date(vinculo.data_inicio).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                          {vinculo.data_alvo && (
                            <span className="flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              Meta: {new Date(vinculo.data_alvo).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                          {vinculo.data_obtencao && (
                            <span className="text-green-600 font-medium">
                              ✓ Obtido em {new Date(vinculo.data_obtencao).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                      <button
                        onClick={() => handleEditar(vinculo)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleExcluir(vinculo.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progresso</span>
                      <span className="font-semibold">{vinculo.progresso}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${vinculo.progresso}%` }}
                      />
                    </div>
                  </div>

                  {/* Controle de Progresso */}
                  <div className="flex gap-2 mb-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={vinculo.progresso}
                      onChange={(e) => updateProgresso(vinculo.id, parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={vinculo.progresso}
                      onChange={(e) => updateProgresso(vinculo.id, parseInt(e.target.value))}
                      className="w-16 px-2 py-1 border rounded text-center"
                    />
                  </div>

                  {vinculo.observacoes && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700"><strong>Observações:</strong> {vinculo.observacoes}</p>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editando ? 'Editar Vínculo' : 'Novo Vínculo'}
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Colaborador *
                  </label>
                  <select
                    value={novoVinculo.colaborador_id}
                    onChange={(e) => setNovoVinculo({...novoVinculo, colaborador_id: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Selecione um colaborador</option>
                    {colaboradores.map(colab => (
                      <option key={colab.id} value={colab.id}>
                        {colab.nome} - {colab.cargo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <BookOpen className="w-4 h-4 inline mr-1" />
                    Conhecimento *
                  </label>
                  <select
                    value={novoVinculo.conhecimento_id}
                    onChange={(e) => setNovoVinculo({...novoVinculo, conhecimento_id: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Selecione um conhecimento</option>
                    {conhecimentos.map(conhec => (
                      <option key={conhec.id} value={conhec.id}>
                        {conhec.nome} ({conhec.tipo})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={novoVinculo.status}
                  onChange={(e) => setNovoVinculo({...novoVinculo, status: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data Início</label>
                  <input
                    type="date"
                    value={novoVinculo.data_inicio || ''}
                    onChange={(e) => setNovoVinculo({...novoVinculo, data_inicio: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data Meta</label>
                  <input
                    type="date"
                    value={novoVinculo.data_alvo || ''}
                    onChange={(e) => setNovoVinculo({...novoVinculo, data_alvo: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data Obtenção</label>
                  <input
                    type="date"
                    value={novoVinculo.data_obtencao || ''}
                    onChange={(e) => setNovoVinculo({...novoVinculo, data_obtencao: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Progresso: {novoVinculo.progresso}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={novoVinculo.progresso || 0}
                  onChange={(e) => setNovoVinculo({...novoVinculo, progresso: parseInt(e.target.value)})}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                <textarea
                  value={novoVinculo.observacoes}
                  onChange={(e) => setNovoVinculo({...novoVinculo, observacoes: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  rows={3}
                  placeholder="Anotações sobre o desenvolvimento..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditando(null)
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvar}
                disabled={!novoVinculo.colaborador_id || !novoVinculo.conhecimento_id}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editando ? 'Salvar Alterações' : 'Criar Vínculo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}