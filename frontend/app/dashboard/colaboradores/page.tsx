'use client'

import { useState, useEffect } from 'react'
import { Users, CheckCircle, Search, Plus, Clock, Award, Link as LinkIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Colaborador {
  id: number
  nome: string
  email: string
  cargo: string
  departamento?: string
  area?: string
  status: string
  data_admissao: string
  team_id?: number
  manager_id?: number
}

export default function ColaboradoresPage() {
  const router = useRouter()
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadColaboradores()
  }, [])

  const loadColaboradores = async () => {
    try {
      setLoading(true)
      setError(null)

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('token')

      const response = await fetch(`${API_URL}/api/employees`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // A API pode retornar { data: [...] } ou diretamente [...]
      const colaboradoresData = data.data || data

      console.log('✅ Colaboradores carregados:', colaboradoresData)
      setColaboradores(Array.isArray(colaboradoresData) ? colaboradoresData : [])

    } catch (err: any) {
      console.error('❌ Erro ao carregar colaboradores:', err)
      setError(err.message || 'Erro ao carregar colaboradores')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este colaborador?')) return

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('token')

      const response = await fetch(`${API_URL}/api/employees/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir colaborador')
      }

      alert('Colaborador excluído com sucesso!')
      loadColaboradores()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const filteredColaboradores = colaboradores.filter(col =>
    col.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    col.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    col.cargo?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: colaboradores.length,
    ativos: colaboradores.filter(c => c.status === 'ativo').length,
    ferias: colaboradores.filter(c => c.status === 'ferias').length,
    afastados: colaboradores.filter(c => c.status === 'afastado').length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando colaboradores...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">
              ❌ Erro ao carregar colaboradores
            </h2>
            <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={loadColaboradores}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Tentar Novamente
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Voltar ao Dashboard
              </button>
            </div>
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
              <Users className="w-8 h-8 text-blue-600" />
              Colaboradores
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gestão completa de colaboradores • {stats.total} cadastrados
            </p>
          </div>

          <button
            onClick={() => router.push('/dashboard/colaboradores/novo')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Novo Colaborador
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <Users className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ativos</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.ativos}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Em Férias</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{stats.ferias}</p>
            </div>
            <Clock className="w-12 h-12 text-orange-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Afastados</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.afastados}</p>
            </div>
            <Award className="w-12 h-12 text-red-600" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {filteredColaboradores.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Nenhum colaborador encontrado
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'Tente outro termo de busca' : 'Adicione o primeiro colaborador'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Colaborador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Cargo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Área
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredColaboradores.map((col) => (
                  <tr key={col.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {col.nome}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {col.email}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {col.cargo}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {col.departamento || col.area || 'N/A'}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        col.status === 'ativo' ? 'bg-green-100 text-green-800' :
                        col.status === 'ferias' ? 'bg-orange-100 text-orange-800' :
                        col.status === 'afastado' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {col.status?.toUpperCase() || 'INATIVO'}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/dashboard/colaboradores/${col.id}`)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => router.push(`/dashboard/colaboradores/${col.id}/editar`)}
                          className="text-gray-600 hover:text-gray-900 font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(col.id)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}