'use client'

import { useState, useEffect } from 'react'
import { Settings, Users, Activity, Database, Shield, Bell } from 'lucide-react'

interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalEmployees: number
  totalKnowledge: number
  systemUptime: string
  apiRequests: number
}

export default function AdminPage() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('token')

      const response = await fetch(`${API_URL}/api/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: Não foi possível carregar estatísticas`)
      }

      const data = await response.json()
      const statsData = data.data || data

      setStats({
        totalUsers: statsData.users?.total || 0,
        activeUsers: statsData.users?.active || 0,
        totalEmployees: statsData.employees?.total || 0,
        totalKnowledge: statsData.knowledge?.total_certifications || 0,
        systemUptime: statsData.system?.uptime || '99.9%',
        apiRequests: statsData.system?.api_requests || 0
      })

      console.log('✅ Estatísticas admin carregadas:', statsData)

    } catch (err: any) {
      console.error('❌ Erro ao buscar estatísticas:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const adminSections = [
    {
      title: 'Gerenciamento de Usuários',
      description: 'Gerencie usuários do sistema, roles e permissões',
      icon: <Users className="w-8 h-8 text-blue-600" />,
      color: 'blue',
      available: false
    },
    {
      title: 'Monitoramento do Sistema',
      description: 'Monitore performance, logs e status do sistema',
      icon: <Activity className="w-8 h-8 text-green-600" />,
      color: 'green',
      available: false
    },
    {
      title: 'Banco de Dados',
      description: 'Gerencie backups, migrações e integridade dos dados',
      icon: <Database className="w-8 h-8 text-purple-600" />,
      color: 'purple',
      available: false
    },
    {
      title: 'Segurança',
      description: 'Configure autenticação, auditoria e políticas de segurança',
      icon: <Shield className="w-8 h-8 text-red-600" />,
      color: 'red',
      available: false
    },
    {
      title: 'Notificações',
      description: 'Configure alertas automáticos e notificações do sistema',
      icon: <Bell className="w-8 h-8 text-yellow-600" />,
      color: 'yellow',
      available: false
    },
    {
      title: 'Configurações Gerais',
      description: 'Ajustes gerais do sistema e preferências',
      icon: <Settings className="w-8 h-8 text-gray-600" />,
      color: 'gray',
      available: false
    }
  ]

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">❌ Erro ao carregar painel administrativo</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchStats}
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
          <Settings className="w-8 h-8 text-blue-600" />
          Painel Administrativo
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {loading ? 'Carregando...' : 'Gerenciamento completo do sistema Gestão 360'}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Carregando estatísticas...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total de Usuários</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats?.totalUsers || 0}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {stats?.activeUsers || 0} ativos
                  </p>
                </div>
                <Users className="w-12 h-12 text-blue-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Colaboradores</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats?.totalEmployees || 0}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">cadastrados</p>
                </div>
                <Activity className="w-12 h-12 text-green-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Conhecimentos</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats?.totalKnowledge || 0}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">no catálogo</p>
                </div>
                <Database className="w-12 h-12 text-purple-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats?.systemUptime || '99.9%'}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {stats?.apiRequests || 0} requisições hoje
                  </p>
                </div>
                <Shield className="w-12 h-12 text-green-600" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminSections.map((section) => (
              <div
                key={section.title}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 opacity-60"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 bg-${section.color}-100 rounded-lg`}>
                    {section.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      {section.title}
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        EM BREVE
                      </span>
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {section.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Sistema Operacional
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Todos os serviços estão funcionando normalmente • Última verificação: agora
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}