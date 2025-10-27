'use client'

import React, { useState, useEffect } from 'react'
import { BookOpen, Plus, Edit, Trash2, Search } from 'lucide-react'
import OLCardStats from '@/components/ui/OLCardStats'
import OLButton from '@/components/ui/OLButton'
import OLModal from '@/components/ui/OLModal'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('TODOS')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    async function fetchConhecimentos() {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('Token não encontrado')

        const res = await fetch(`${API_URL}/knowledge`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!res.ok) throw new Error('Erro ao buscar conhecimentos')
        const data = await res.json()
        setConhecimentos(data)
      } catch (error: any) {
        setError(error.message || 'Erro ao buscar conhecimentos')
      } finally {
        setLoading(false)
      }
    }
    fetchConhecimentos()
  }, [])

  const conhecimentosFiltrados = conhecimentos.filter((c) => {
    const matchBusca =
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      c.tags.some((tag) => tag.toLowerCase().includes(busca.toLowerCase()))
    const matchTipo = filtroTipo === 'TODOS' || c.tipo === filtroTipo
    return matchBusca && matchTipo
  })

  const stats = {
    total: conhecimentos.length,
    tecnico: conhecimentos.filter(c => c.categoria === 'TECNICA').length,
    comportamental: conhecimentos.filter(c => c.categoria === 'COMPORTAMENTAL').length,
    lideranca: conhecimentos.filter(c => c.categoria === 'LIDERANCA').length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ol-bg dark:bg-darkOl-bg flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-ol-primary mx-auto mb-4"></div>
          <p className="text-ol-text dark:text-darkOl-text">Carregando conhecimentos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ol-bg dark:bg-darkOl-bg p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-ol-cardBg dark:bg-darkOl-cardBg border border-ol-border dark:border-darkOl-border rounded-lg p-6">
            <h2 className="text-xl font-bold text-ol-error dark:text-darkOl-error mb-2">
              ❌ Erro ao carregar conhecimentos
            </h2>
            <p className="text-ol-text dark:text-darkOl-text mb-4">{error}</p>
            <div className="flex gap-3">
              <OLButton variant="danger" onClick={() => setModalOpen(true)}>
                Tentar Novamente
              </OLButton>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ol-bg dark:bg-darkOl-bg p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ol-primary dark:text-darkOl-primary flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-ol-primary dark:text-darkOl-primary" />
            Gestão de Conhecimentos
          </h1>
          <p className="text-ol-grayMedium dark:text-darkOl-grayMedium mt-2">
            Cadastre e organize habilidades, certificações e treinamentos • {conhecimentos.length} cadastrados
          </p>
        </div>

        <OLButton variant="primary" iconLeft={<Plus className="w-5 h-5" />} onClick={() => setModalOpen(true)}>
          Novo Conhecimento
        </OLButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <OLCardStats label="Total" value={stats.total} icon={<BookOpen />} color="info" />
        <OLCardStats label="Técnica" value={stats.tecnico} icon={<BookOpen />} color="success" />
        <OLCardStats label="Comportamental" value={stats.comportamental} icon={<BookOpen />} color="warning" />
        <OLCardStats label="Liderança" value={stats.lideranca} icon={<BookOpen />} color="danger" />
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ol-grayMedium dark:text-darkOl-grayMedium w-5 h-5" />
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
            {tipos.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        ) : (
          conhecimentosFiltrados.map(conhecimento => {
            const tipoConfig = tipos.find(t => t.value === conhecimento.tipo) || tipos[0]
            const nivelConfig = niveis.find(n => n.value === conhecimento.nivel) || niveis[0]
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
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" title="Excluir">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${tipoConfig.color}`}>
                    {tipoConfig.label}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    {categorias.find(c => c.value === conhecimento.categoria)?.label}
                  </span>
                  <span className={`px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium ${nivelConfig.color}`}>
                    {nivelConfig.label}
                  </span>
                </div>
                {conhecimento.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {conhecimento.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs">#{tag}</span>
                    ))}
                  </div>
                )}
                {conhecimento.validade_meses && (
                  <div className="mt-2 text-xs text-gray-500">📅 Validade: {conhecimento.validade_meses} meses</div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Modal */}
      <OLModal
        open={modalOpen}
        title="Novo Conhecimento"
        onClose={() => setModalOpen(false)}
        onConfirm={() => {
          setModalOpen(false)
          // Aqui você pode redirecionar para o formulário completo
          // Exemplo: router.push('/dashboard/conhecimentos/novo')
        }}
        confirmText="Ir para Formulário"
      >
        <p>Você será redirecionado para o formulário de cadastro de conhecimento.</p>
      </OLModal>
    </div>
  )
}
