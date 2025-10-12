'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Award, Plus, Search, Calendar, AlertCircle } from 'lucide-react'

type KnowledgeType = 'certificacao' | 'curso' | 'formacao' | 'treinamento'

interface Knowledge {
  id: number
  nome: string
  tipo: KnowledgeType
  fornecedor: string
  area: string
  descricao: string
  carga_horaria?: number
  validade_meses?: number
  dificuldade: 'basico' | 'medio' | 'avancado'
  obrigatorio: boolean
  custo_estimado?: number
  url_referencia?: string
  total_vinculos?: number
  vinculos_ativos?: number
  vinculos_vencidos?: number
}

export default function ConhecimentosPage() {
  const [knowledge, setKnowledge] = useState<Knowledge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<KnowledgeType | 'all'>('all')
  const [areaFilter, setAreaFilter] = useState('all')

  useEffect(() => {
    fetchKnowledge()
  }, [])

  const fetchKnowledge = async () => {
    try {
      setLoading(true)
      setError(null)

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('token')

      const response = await fetch(`${API_URL}/api/knowledge`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: Não foi possível carregar conhecimentos`)
      }

      const data = await response.json()
      const knowledgeData = data.data || data

      setKnowledge(Array.isArray(knowledgeData) ? knowledgeData : [])
      console.log('✅ Conhecimentos carregados:', knowledgeData.length)

    } catch (err: any) {
      console.error('❌ Erro ao buscar conhecimentos:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredKnowledge = knowledge.filter(item => {
    const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.fornecedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.area.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || item.tipo === typeFilter
    const matchesArea = areaFilter === 'all' || item.area === areaFilter

    return matchesSearch && matchesType && matchesArea
  })

  const areas = Array.from(new Set(knowledge.map(k => k.area)))

  const stats = {
    total: knowledge.length,
    certificacoes: knowledge.filter(k => k.tipo === 'certificacao').length,
    cursos: knowledge.filter(k => k.tipo === 'curso').length,
    treinamentos: knowledge.filter(k => k.tipo === 'treinamento').length,
    totalVinculos: knowledge.reduce((sum, k) => sum + (k.total_vinculos || 0), 0),
    vinculosVencidos: knowledge.reduce((sum, k) => sum + (k.vinculos_vencidos || 0), 0)
  }

  const getTypeIcon = (type: KnowledgeType) => {
    const icons = {
      certificacao: '📜',
      curso: '📚',
      formacao: '🎓',
      treinamento: '💼'
    }
    return icons[type]
  }

  const getTypeLabel = (type: KnowledgeType) => {
    const labels = {
      certificacao: 'Certificação',
      curso: 'Curso',
      formacao: 'Formação',
      treinamento: 'Treinamento'
    }
    return labels[type]
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      basico: 'bg-green-100 text-green-800',
      medio: 'bg-yellow-100 text-yellow-800',
      avancado: 'bg-red-100 text-red-800'
    }
    return colors[difficulty as keyof typeof colors]
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">❌ Erro ao carregar conhecimentos</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchKnowledge}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              Gestão de Conhecimentos
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {loading ? 'Carregando...' : `Catálogo completo de certificações, cursos e treinamentos • ${stats.total} itens`}
            </p>
          </div>

          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-semibold">
            <Plus className="w-5 h-5" />
            Novo Conhecimento
          </button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de Conhecimentos</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <BookOpen className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Certificações</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.certificacoes}</p>
            </div>
            <Award className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de Vínculos</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalVinculos}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
              🔗
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Vínculos Vencidos</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.vinculosVencidos}</p>
            </div>
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar conhecimentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Filtro de Tipo */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as KnowledgeType | 'all')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Todos os Tipos</option>
            <option value="certificacao">Certificações</option>
            <option value="curso">Cursos</option>
            <option value="formacao">Formações</option>
            <option value="treinamento">Treinamentos</option>
          </select>

          {/* Filtro de Área */}
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Todas as Áreas</option>
            {areas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Conhecimentos */}
      {filteredKnowledge.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Nenhum conhecimento encontrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Tente ajustar os filtros ou adicione um novo conhecimento
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredKnowledge.map(item => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              {/* Header do Card */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{getTypeIcon(item.tipo)}</span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {item.nome}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">{item.fornecedor}</span>
                      <span>•</span>
                      <span>{item.area}</span>
                    </div>
                  </div>
                </div>

                {item.obrigatorio && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                    OBRIGATÓRIO
                  </span>
                )}
              </div>

              {/* Descrição */}
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm line-clamp-2">
                {item.descricao}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(item.dificuldade)}`}>
                  {item.dificuldade.charAt(0).toUpperCase() + item.dificuldade.slice(1)}
                </span>

                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                  {getTypeLabel(item.tipo)}
                </span>

                {item.carga_horaria && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {item.carga_horaria}h
                  </span>
                )}

                {item.validade_meses && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                    Validade: {item.validade_meses} meses
                  </span>
                )}
              </div>

              {/* Estatísticas de Vínculos */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {item.total_vinculos}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {item.vinculos_ativos || 0}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Ativos</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">
                      {item.vinculos_vencidos || 0}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Vencidos</p>
                  </div>
                </div>
              </div>

              {/* Informações Adicionais */}
              <div className="flex items-center justify-between text-sm">
                {item.custo_estimado && (
                  <span className="text-gray-600 dark:text-gray-400">
                    💰 R$ {item.custo_estimado.toFixed(2)}
                  </span>
                )}

                <div className="flex gap-2">
                  <button className="px-3 py-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-medium">
                    Ver Detalhes
                  </button>
                  <button className="px-3 py-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    Editar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
