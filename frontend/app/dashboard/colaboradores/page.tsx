'use client'

import { useState, useEffect } from 'react'
import { Users, CheckCircle, Search } from 'lucide-react'
import { getColaboradores, deleteColaborador, type Colaborador } from '@/lib/api'
import Link from 'next/link'

const StatCard = ({
  name,
  value,
  icon,
  color,
}: {
  name: string
  value: string | number
  icon: React.ReactNode
  color: string
}) => (
  <div
    className="bg-ol-cardBg dark:bg-darkOl-cardBg rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow border-l-4"
    style={{ borderColor: color }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-ol-grayMedium dark:text-darkOl-grayMedium mb-1">{name}</p>
        <p className="text-3xl font-bold text-ol-black dark:text-darkOl-white">{value}</p>
      </div>
      <div className="text-4xl text-ol-grayMedium dark:text-darkOl-grayMedium">{icon}</div>
    </div>
  </div>
)

export default function ColaboradoresPage() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadColaboradores()
  }, [])

  const loadColaboradores = async () => {
    try {
      const data = await getColaboradores()
      setColaboradores(data)
    } catch (error: any) {
      console.error('Erro ao carregar colaboradores:', error)
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este colaborador?')) return

    try {
      await deleteColaborador(id)
      alert('Colaborador excluído com sucesso!')
      loadColaboradores()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const filteredColaboradores = colaboradores.filter(
    (col) =>
      col.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      col.email_corporativo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      col.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ol-primary"></div>
      </div>
    )
  }

  return (
    <div className="bg-ol-bg dark:bg-darkOl-bg min-h-screen p-6 text-ol-black dark:text-darkOl-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{`Colaboradores`}</h1>
        <p className="text-ol-grayMedium dark:text-darkOl-grayMedium mt-2">Gerencie os colaboradores da empresa</p>
      </div>

      {/* Top Actions */}
      <div className="flex justify-end mb-6">
        <Link
          href="/dashboard/colaboradores/novo"
          className="bg-ol-primary text-white px-6 py-3 rounded-lg hover:bg-ol-hover hover:text-ol-hoverText transition-colors font-semibold shadow-lg flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Novo Colaborador</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Buscar por nome, email ou cargo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-darkOl-border rounded-lg focus:ring-2 focus:ring-ol-primary focus:border-transparent text-ol-black dark:text-darkOl-white bg-white dark:bg-darkOl-grayLight transition-colors"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard name="Total de Colaboradores" value={colaboradores.length} icon={<Users />} color="#3b82f6" />
        <StatCard
          name="Ativos"
          value={colaboradores.filter((c) => c.status === 'ATIVO').length}
          icon={<CheckCircle />}
          color="#22c55e"
        />
        <StatCard name="Resultados da Busca" value={filteredColaboradores.length} icon={<Search />} color="#3b82f6" />
      </div>

      {/* Table */}
      <div className="bg-ol-white dark:bg-darkOl-grayLight rounded-xl shadow-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-darkOl-border">
          <thead className="bg-gray-50 dark:bg-darkOl-grayMedium">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-darkOl-grayLight uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-darkOl-grayLight uppercase tracking-wider">Cargo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-darkOl-grayLight uppercase tracking-wider">Departamento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-darkOl-grayLight uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-darkOl-grayLight uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-ol-white dark:bg-darkOl-grayLight divide-y divide-gray-200 dark:divide-darkOl-border">
            {filteredColaboradores.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-darkOl-grayLight">
                  <div className="text-4xl mb-2">📭</div>
                  <p>Nenhum colaborador encontrado</p>
                  {searchTerm && <p className="text-sm mt-2">Tente outro termo de busca</p>}
                </td>
              </tr>
            ) : (
              filteredColaboradores.map((colaborador) => (
                <tr key={colaborador.id} className="hover:bg-gray-50 dark:hover:bg-darkOl-bg/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-ol-black dark:text-darkOl-white">{colaborador.nome_completo}</div>
                      <div className="text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">{colaborador.email_corporativo}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-ol-black dark:text-darkOl-white">{colaborador.cargo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-ol-black dark:text-darkOl-white">{colaborador.departamento}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        colaborador.status === 'ATIVO'
                          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200'
                          : colaborador.status === 'FERIAS'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                          : colaborador.status === 'AFASTADO'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200'
                      }`}
                    >
                      {colaborador.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                    <Link
                      href={`/dashboard/colaboradores/${colaborador.id}`}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-white transition-colors"
                      title="Ver detalhes"
                    >
                      Ver
                    </Link>
                    <Link
                      href={`/dashboard/colaboradores/${colaborador.id}/editar`}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-white transition-colors"
                      title="Editar colaborador"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(colaborador.id!)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-white transition-colors"
                      title="Excluir colaborador"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
