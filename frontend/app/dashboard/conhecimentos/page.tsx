'use client'

import React, { useState } from 'react'
import { BookOpen, Plus, Edit, Trash2, Search, Filter } from 'lucide-react'

interface Conhecimento {
  id: string
  nome: string
  tipo: string
  categoria: string
  nivel: string
  descricao: string
  obrigatorio: boolean
  validade_meses?: number
  tags: string[]
}

export default function KnowledgePage() {
  const [conhecimentos, setConhecimentos] = useState<Conhecimento[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState<Conhecimento | null>(null)
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('TODOS')
  const [novoConhecimento, setNovoConhecimento] = useState<Partial<Conhecimento>>({
    nome: '',
    tipo: 'HABILIDADE',
    categoria: 'TECNICA',
    nivel: 'BASICO',
    descricao: '',
    obrigatorio: false,
    tags: []
  })
  const [tagTemp, setTagTemp] = useState('')

  const tipos = [
    { value: 'HABILIDADE', label: 'Habilidade', color: 'bg-blue-100 text-blue-800' },
    { value: 'CERTIFICACAO', label: 'Certificação', color: 'bg-green-100 text-green-800' },
    { value: 'CURSO', label: 'Curso', color: 'bg-purple-100 text-purple-800' },
    { value: 'TREINAMENTO', label: 'Treinamento', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'IDIOMA', label: 'Idioma', color: 'bg-pink-100 text-pink-800' }
  ]

  const categorias = [
    { value: 'TECNICA', label: 'Técnica' },
    { value: 'COMPORTAMENTAL', label: 'Comportamental' },
    { value: 'LIDERANCA', label: 'Liderança' },
    { value: 'GESTAO', label: 'Gestão' },
    { value: 'VENDAS', label: 'Vendas' },
    { value: 'ATENDIMENTO', label: 'Atendimento' }
  ]

  const niveis = [
    { value: 'BASICO', label: 'Básico', color: 'text-green-600' },
    { value: 'INTERMEDIARIO', label: 'Intermediário', color: 'text-yellow-600' },
    { value: 'AVANCADO', label: 'Avançado', color: 'text-orange-600' },
    { value: 'ESPECIALISTA', label: 'Especialista', color: 'text-red-600' }
  ]

  const handleAddTag = () => {
    if (tagTemp.trim() && !novoConhecimento.tags?.includes(tagTemp.trim())) {
      setNovoConhecimento({
        ...novoConhecimento,
        tags: [...(novoConhecimento.tags || []), tagTemp.trim()]
      })
      setTagTemp('')
    }
  }

  const handleRemoveTag = (index: number) => {
    setNovoConhecimento({
      ...novoConhecimento,
      tags: novoConhecimento.tags?.filter((_, i) => i !== index)
    })
  }

  const handleSalvar = () => {
    if (editando) {
      setConhecimentos(conhecimentos.map(c =>
        c.id === editando.id ? { ...novoConhecimento, id: editando.id } as Conhecimento : c
      ))
    } else {
      const conhecimento: Conhecimento = {
        id: Date.now().toString(),
        nome: novoConhecimento.nome || '',
        tipo: novoConhecimento.tipo || 'HABILIDADE',
        categoria: novoConhecimento.categoria || 'TECNICA',
        nivel: novoConhecimento.nivel || 'BASICO',
        descricao: novoConhecimento.descricao || '',
        obrigatorio: novoConhecimento.obrigatorio || false,
        validade_meses: novoConhecimento.validade_meses,
        tags: novoConhecimento.tags || []
      }
      setConhecimentos([...conhecimentos, conhecimento])
    }

    setShowModal(false)
    setEditando(null)
    setNovoConhecimento({
      nome: '',
      tipo: 'HABILIDADE',
      categoria: 'TECNICA',
      nivel: 'BASICO',
      descricao: '',
      obrigatorio: false,
      tags: []
    })
  }

  const handleEditar = (conhecimento: Conhecimento) => {
    setEditando(conhecimento)
    setNovoConhecimento(conhecimento)
    setShowModal(true)
  }

  const handleExcluir = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este conhecimento?')) {
      setConhecimentos(conhecimentos.filter(c => c.id !== id))
    }
  }

  const getTipoConfig = (tipo: string) => {
    return tipos.find(t => t.value === tipo) || tipos[0]
  }

  const getNivelConfig = (nivel: string) => {
    return niveis.find(n => n.value === nivel) || niveis[0]
  }

  const conhecimentosFiltrados = conhecimentos.filter(c => {
    const matchBusca = c.nome.toLowerCase().includes(busca.toLowerCase()) ||
                       c.descricao.toLowerCase().includes(busca.toLowerCase()) ||
                       c.tags.some(tag => tag.toLowerCase().includes(busca.toLowerCase()))
    const matchTipo = filtroTipo === 'TODOS' || c.tipo === filtroTipo
    return matchBusca && matchTipo
  })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestão de Conhecimentos</h1>
              <p className="text-gray-600 mt-2">Cadastre e organize habilidades, certificações e treinamentos</p>
            </div>
            <button
              onClick={() => {
                setEditando(null)
                setNovoConhecimento({
                  nome: '',
                  tipo: 'HABILIDADE',
                  categoria: 'TECNICA',
                  nivel: 'BASICO',
                  descricao: '',
                  obrigatorio: false,
                  tags: []
                })
                setShowModal(true)
              }}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Novo Conhecimento
            </button>
          </div>

          {/* Filtros */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar conhecimentos..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="w-48">
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="TODOS">Todos os tipos</option>
                {tipos.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-5 gap-4 mt-6">
            {tipos.map(tipo => {
              const count = conhecimentos.filter(c => c.tipo === tipo.value).length
              return (
                <div key={tipo.value} className="bg-gray-50 rounded-lg p-3">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${tipo.color}`}>
                    {tipo.label}
                  </span>
                  <p className="text-xl font-bold mt-2">{count}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Lista de Conhecimentos */}
        <div className="space-y-4">
          {conhecimentosFiltrados.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {conhecimentos.length === 0 ? 'Nenhum conhecimento cadastrado' : 'Nenhum resultado encontrado'}
              </h3>
              <p className="text-gray-500 mb-6">
                {conhecimentos.length === 0
                  ? 'Comece cadastrando conhecimentos que sua equipe precisa desenvolver'
                  : 'Tente ajustar os filtros de busca'}
              </p>
              {conhecimentos.length === 0 && (
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Cadastrar Primeiro Conhecimento
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {conhecimentosFiltrados.map(conhecimento => {
                const tipoConfig = getTipoConfig(conhecimento.tipo)
                const nivelConfig = getNivelConfig(conhecimento.nivel)
                return (
                  <div key={conhecimento.id} className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{conhecimento.nome}</h3>
                          {conhecimento.obrigatorio && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                              Obrigatório
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{conhecimento.descricao}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditar(conhecimento)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExcluir(conhecimento.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${tipoConfig.color}`}>
                        {tipoConfig.label}
                      </span>
                      <span className={`px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium ${nivelConfig.color}`}>
                        {nivelConfig.label}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {categorias.find(c => c.value === conhecimento.categoria)?.label}
                      </span>
                    </div>

                    {conhecimento.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {conhecimento.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {conhecimento.validade_meses && (
                      <div className="mt-2 text-xs text-gray-500">
                        📅 Validade: {conhecimento.validade_meses} meses
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editando ? 'Editar Conhecimento' : 'Novo Conhecimento'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
                <input
                  type="text"
                  value={novoConhecimento.nome}
                  onChange={(e) => setNovoConhecimento({...novoConhecimento, nome: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: React Avançado, Certificação AWS, Inglês Intermediário"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                <textarea
                  value={novoConhecimento.descricao}
                  onChange={(e) => setNovoConhecimento({...novoConhecimento, descricao: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Descreva o conhecimento..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo *</label>
                  <select
                    value={novoConhecimento.tipo}
                    onChange={(e) => setNovoConhecimento({...novoConhecimento, tipo: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    {tipos.map(tipo => (
                      <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoria *</label>
                  <select
                    value={novoConhecimento.categoria}
                    onChange={(e) => setNovoConhecimento({...novoConhecimento, categoria: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    {categorias.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nível *</label>
                  <select
                    value={novoConhecimento.nivel}
                    onChange={(e) => setNovoConhecimento({...novoConhecimento, nivel: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    {niveis.map(nivel => (
                      <option key={nivel.value} value={nivel.value}>{nivel.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Validade (meses)</label>
                  <input
                    type="number"
                    value={novoConhecimento.validade_meses || ''}
                    onChange={(e) => setNovoConhecimento({...novoConhecimento, validade_meses: parseInt(e.target.value) || undefined})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ex: 12, 24, 36"
                    min="1"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="obrigatorio"
                  checked={novoConhecimento.obrigatorio}
                  onChange={(e) => setNovoConhecimento({...novoConhecimento, obrigatorio: e.target.checked})}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="obrigatorio" className="text-sm font-medium text-gray-700">
                  Conhecimento obrigatório
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagTemp}
                    onChange={(e) => setTagTemp(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Digite uma tag e pressione Enter"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Adicionar
                  </button>
                </div>
                {novoConhecimento.tags && novoConhecimento.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {novoConhecimento.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm flex items-center gap-2">
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(index)}
                          className="text-indigo-900 hover:text-indigo-700 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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
                disabled={!novoConhecimento.nome}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editando ? 'Salvar Alterações' : 'Cadastrar Conhecimento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}