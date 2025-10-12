'use client'

import { useState, useEffect } from 'react'
import { Link as LinkIcon, Plus, Search, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react'

type LinkStatus = 'valido' | 'expirando' | 'vencido' | 'em_andamento'

interface EmployeeKnowledgeLink {
  id: number
  employee_id: number
  employee_name: string
  employee_cargo: string
  knowledge_id: number
  knowledge_name: string
  knowledge_type: string
  knowledge_vendor: string
  status: LinkStatus
  data_obtencao?: string
  data_validade?: string
  data_inicio?: string
  data_conclusao?: string
  progresso: number
  certificado_url?: string
  observacoes?: string
  dias_restantes?: number
  criado_por: string
  created_at: string
}

export default function VinculosPage() {
  const [links, setLinks] = useState<EmployeeKnowledgeLink[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<LinkStatus | 'all'>('all')

  useEffect(() => {
    fetchLinks()
  }, [])

  const fetchLinks = async () => {
    try {
      setLoading(true)

      // Mock de dados
      const mockLinks: EmployeeKnowledgeLink[] = [
        {
          id: 1,
          employee_id: 1,
          employee_name: 'João Silva',
          employee_cargo: 'Desenvolvedor Senior',
          knowledge_id: 1,
          knowledge_name: 'AWS Solutions Architect',
          knowledge_type: 'Certificação',
          knowledge_vendor: 'Amazon Web Services',
          status: 'expirando',
          data_obtencao: '2022-11-15',
          data_validade: '2025-11-15',
          progresso: 100,
          dias_restantes: 35,
          criado_por: 'Admin',
          created_at: '2022-11-15T10:00:00'
        },
        {
          id: 2,
          employee_id: 2,
          employee_name: 'Maria Santos',
          employee_cargo: 'Tech Lead',
          knowledge_id: 2,
          knowledge_name: 'ITIL Foundation',
          knowledge_type: 'Certificação',
          knowledge_vendor: 'Axelos',
          status: 'valido',
          data_obtencao: '2024-03-20',
          data_validade: '2027-03-20',
          progresso: 100,
          dias_restantes: 850,
          criado_por: 'Admin',
          created_at: '2024-03-20T10:00:00'
        },
        {
          id: 3,
          employee_id: 3,
          employee_name: 'Carlos Oliveira',
          employee_cargo: 'Desenvolvedor Pleno',
          knowledge_id: 3,
          knowledge_name: 'Python para Data Science',
          knowledge_type: 'Curso',
          knowledge_vendor: 'Coursera',
          status: 'em_andamento',
          data_inicio: '2025-09-01',
          progresso: 65,
          criado_por: 'Carlos Oliveira',
          created_at: '2025-09-01T10:00:00'
        },
        {
          id: 4,
          employee_id: 5,
          employee_name: 'Pedro Lima',
          employee_cargo: 'Analista de Infraestrutura',
          knowledge_id: 2,
          knowledge_name: 'ITIL Foundation',
          knowledge_type: 'Certificação',
          knowledge_vendor: 'Axelos',
          status: 'vencido',
          data_obtencao: '2021-10-05',
          data_validade: '2024-10-05',
          progresso: 100,
          dias_restantes: -7,
          criado_por: 'Admin',
          created_at: '2021-10-05T10:00:00'
        },
        {
          id: 5,
          employee_id: 4,
          employee_name: 'Ana Costa',
          employee_cargo: 'Scrum Master',
          knowledge_id: 4,
          knowledge_name: 'Scrum Master Certified',
          knowledge_type: 'Certificação',
          knowledge_vendor: 'Scrum Alliance',
          status: 'valido',
          data_obtencao: '2024-06-10',
          data_validade: '2026-06-10',
          progresso: 100,
          dias_restantes: 610,
          criado_por: 'Admin',
          created_at: '2024-06-10T10:00:00'
        }
      ]

      setLinks(mockLinks)
    } catch (error) {
      console.error('Erro ao buscar vínculos:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLinks = links.filter(link => {
    const matchesSearch =
      link.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.knowledge_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.knowledge_vendor.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || link.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const stats = {
    total: links.length,
    validos: links.filter(l => l.status === 'valido').length,
    expirando: links.filter(l => l.status === 'expirando').length,
    vencidos: links.filter(l => l.status === 'vencido').length,
    em_andamento: links.filter(l => l.status === 'em_andamento').length
  }

  const getStatusBadge = (status: LinkStatus) => {
    const badges = {
      valido: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="w-4 h-4" />, label: 'Válido' },
      expirando: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="w-4 h-4" />, label: 'Expirando' },
      vencido: { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="w-4 h-4" />, label: 'Vencido' },
      em_andamento: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <Clock className="w-4 h-4" />, label: 'Em Andamento' }
    }
    return badges[status]
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <LinkIcon className="w-8 h-8 text-blue-600" />
              Vínculos de Conhecimento
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gestão de certificações e conhecimentos dos colaboradores
            </p>
          </div>

          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-semibold">
            <Plus className="w-5 h-5" />
            Novo Vínculo
          </button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Válidos</p>
          <p className="text-3xl font-bold text-green-600">{stats.validos}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Expirando</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.expirando}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Vencidos</p>
          <p className="text-3xl font-bold text-red-600">{stats.vencidos}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Em Andamento</p>
          <p className="text-3xl font-bold text-blue-600">{stats.em_andamento}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por colaborador ou conhecimento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Filtro de Status */}
          <div className="flex gap-2">
            {(['all', 'valido', 'expirando', 'vencido', 'em_andamento'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {status === 'all' ? 'Todos' :
                 status === 'valido' ? 'Válidos' :
                 status === 'expirando' ? 'Expirando' :
                 status === 'vencido' ? 'Vencidos' : 'Em Andamento'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabela de Vínculos */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Carregando vínculos...</p>
        </div>
      ) : filteredLinks.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
          <LinkIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Nenhum vínculo encontrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Tente ajustar os filtros ou adicione um novo vínculo
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Colaborador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Conhecimento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Progresso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Datas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredLinks.map(link => {
                  const statusBadge = getStatusBadge(link.status)

                  return (
                    <tr key={link.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {link.employee_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {link.employee_cargo}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {link.knowledge_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {link.knowledge_type} • {link.knowledge_vendor}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
                          {statusBadge.icon}
                          {statusBadge.label}
                        </span>
                        {link.dias_restantes !== undefined && link.dias_restantes > 0 && link.dias_restantes < 60 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {link.dias_restantes} dias restantes
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${link.progresso}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {link.progresso}%
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {link.data_obtencao && (
                          <div>Obtido: {formatDate(link.data_obtencao)}</div>
                        )}
                        {link.data_validade && (
                          <div>Validade: {formatDate(link.data_validade)}</div>
                        )}
                        {link.data_inicio && !link.data_obtencao && (
                          <div>Início: {formatDate(link.data_inicio)}</div>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            Ver
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}