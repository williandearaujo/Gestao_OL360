'use client'

import { useState, useEffect } from 'react'
import { Calendar, Plus, CheckCircle, Clock, AlertCircle, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface VacationPeriod {
  id: number
  employee_id: number
  employee_name?: string
  data_inicio: string
  data_fim: string
  dias: number
  status: 'PENDENTE' | 'APROVADA' | 'REJEITADA' | 'CANCELADA' | 'EM_GOZO'
  tipo: 'FERIAS' | 'VENDA' | 'ABONO'
  observacoes?: string
  aprovado_por?: string
  data_aprovacao?: string
}

export default function FeriasPage() {
  const router = useRouter()
  const [vacations, setVacations] = useState<VacationPeriod[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchVacations()
  }, [])

  const fetchVacations = async () => {
    try {
      setLoading(true)
      setError(null)

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('token')

      const response = await fetch(`${API_URL}/employees`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar férias')
      }

      const data = await response.json()
      const employees = data.data || data

      // Extrair períodos de férias de todos os colaboradores
      const allVacations: VacationPeriod[] = []
      employees.forEach((emp: any) => {
        if (emp.ferias && emp.ferias.historico) {
          emp.ferias.historico.forEach((period: any) => {
            if (period.tipo === 'AGENDAMENTO' || period.tipo === 'GOZO') {
              allVacations.push({
                id: period.id,
                employee_id: emp.id,
                employee_name: emp.nome,
                data_inicio: period.inicio,
                data_fim: period.fim,
                dias: period.dias,
                status: period.status || 'PENDENTE',
                tipo: 'FERIAS',
                observacoes: period.observacao
              })
            }
          })
        }
      })

      setVacations(allVacations)
      console.log('✅ Férias carregadas:', allVacations.length)

    } catch (err: any) {
      console.error('❌ Erro ao buscar férias:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      APROVADA: 'bg-green-100 text-green-800',
      PENDENTE: 'bg-yellow-100 text-yellow-800',
      REJEITADA: 'bg-red-100 text-red-800',
      CANCELADA: 'bg-gray-100 text-gray-800',
      EM_GOZO: 'bg-blue-100 text-blue-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const stats = {
    total: vacations.length,
    aprovadas: vacations.filter(v => v.status === 'APROVADA').length,
    pendentes: vacations.filter(v => v.status === 'PENDENTE').length,
    em_gozo: vacations.filter(v => v.status === 'EM_GOZO').length,
    canceladas: vacations.filter(v => v.status === 'CANCELADA').length
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">❌ Erro ao carregar férias</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchVacations}
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Calendar className="w-8 h-8 text-blue-600" />
          Gestão de Férias
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {loading ? 'Carregando...' : `Controle de férias dos colaboradores • ${stats.total} períodos registrados`}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Aprovadas</p>
          <p className="text-3xl font-bold text-green-600">{stats.aprovadas}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pendentes</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pendentes}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Em Gozo</p>
          <p className="text-3xl font-bold text-blue-600">{stats.em_gozo}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Canceladas</p>
          <p className="text-3xl font-bold text-gray-600">{stats.canceladas}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Carregando férias...</p>
        </div>
      ) : vacations.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Nenhum período de férias encontrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Vá para a página de colaboradores para agendar férias
          </p>
          <button
            onClick={() => router.push('/dashboard/colaboradores')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Ir para Colaboradores
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {vacations.map(vacation => (
            <div
              key={vacation.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {vacation.employee_name}
                    </h3>

                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(vacation.status)}`}>
                      {vacation.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Início</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {new Date(vacation.data_inicio).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Fim</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {new Date(vacation.data_fim).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Dias</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {vacation.dias} dias
                      </p>
                    </div>
                  </div>

                  {vacation.observacoes && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Obs:</strong> {vacation.observacoes}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => router.push(`/dashboard/colaboradores/${vacation.employee_id}`)}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
                >
                  Ver Colaborador
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}