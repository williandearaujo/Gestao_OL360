'use client'

import { useState, useEffect } from 'react'
import { Bell, AlertCircle, CheckCircle, Clock, AlertTriangle, Info, X } from 'lucide-react'

type AlertType =
  | 'certification_expiring'
  | 'certification_expired'
  | 'vacation_pending'
  | 'birthday'
  | 'pdi_deadline'
  | 'one_on_one_scheduled'
  | 'document_missing'
  | 'system'

type AlertPriority = 'critical' | 'high' | 'medium' | 'low' | 'info'

interface Alert {
  id: number
  type: AlertType
  priority: AlertPriority
  title: string
  message: string
  employee_id?: number
  employee_name?: string
  is_read: boolean
  created_at: string
  action_url?: string
  metadata?: Record<string, any>
}

export default function AlertasPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [priorityFilter, setPriorityFilter] = useState<AlertPriority | 'all'>('all')

  useEffect(() => {
    fetchAlerts()
  }, [filter, priorityFilter])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      setError(null)

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('token')

      let url = `${API_URL}/alerts?`
      if (filter === 'unread') url += 'is_read=false&'
      if (priorityFilter !== 'all') url += `priority=${priorityFilter}&`

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: Não foi possível carregar alertas`)
      }

      const data = await response.json()
      const alertsData = data.data || data

      setAlerts(Array.isArray(alertsData) ? alertsData : [])
      console.log('✅ Alertas carregados:', alertsData.length)

    } catch (err: any) {
      console.error('❌ Erro ao buscar alertas:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (alertId: number) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('token')

      const response = await fetch(`${API_URL}/alerts/${alertId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setAlerts(alerts.map(alert =>
          alert.id === alertId ? { ...alert, is_read: true } : alert
        ))
      }
    } catch (err) {
      console.error('Erro ao marcar como lido:', err)
    }
  }

  const deleteAlert = async (alertId: number) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('token')

      const response = await fetch(`${API_URL}/alerts/${alertId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setAlerts(alerts.filter(alert => alert.id !== alertId))
      }
    } catch (err) {
      console.error('Erro ao deletar alerta:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('token')

      const response = await fetch(`${API_URL}/alerts/read-all`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setAlerts(alerts.map(alert => ({ ...alert, is_read: true })))
      }
    } catch (err) {
      console.error('Erro ao marcar todos como lidos:', err)
    }
  }

  const getPriorityColor = (priority: AlertPriority) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300',
      info: 'bg-gray-100 text-gray-800 border-gray-300'
    }
    return colors[priority]
  }

  const getPriorityIcon = (priority: AlertPriority) => {
    const icons = {
      critical: <AlertCircle className="w-5 h-5" />,
      high: <AlertTriangle className="w-5 h-5" />,
      medium: <Clock className="w-5 h-5" />,
      low: <Info className="w-5 h-5" />,
      info: <Bell className="w-5 h-5" />
    }
    return icons[priority]
  }

  const getTypeLabel = (type: AlertType) => {
    const labels = {
      certification_expiring: '📜 Certificação Vencendo',
      certification_expired: '❌ Certificação Vencida',
      vacation_pending: '🏖️ Férias Pendentes',
      birthday: '🎂 Aniversário',
      pdi_deadline: '📋 PDI',
      one_on_one_scheduled: '💬 Reunião 1:1',
      document_missing: '📄 Documento',
      system: '⚙️ Sistema'
    }
    return labels[type]
  }

  const unreadCount = alerts.filter(a => !a.is_read).length

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">❌ Erro ao carregar alertas</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchAlerts}
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
              <Bell className="w-8 h-8 text-blue-600" />
              Central de Alertas
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {loading ? 'Carregando...' : `${unreadCount} alerta${unreadCount !== 1 ? 's' : ''} não lido${unreadCount !== 1 ? 's' : ''}`}
            </p>
          </div>

          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0 || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Marcar Todos como Lidos
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Não Lidos ({unreadCount})
            </button>
          </div>

          <div className="flex gap-2">
            {(['all', 'critical', 'high', 'medium', 'low'] as const).map(priority => (
              <button
                key={priority}
                onClick={() => setPriorityFilter(priority)}
                className={`px-3 py-2 rounded-lg text-sm ${
                  priorityFilter === priority
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {priority === 'all' ? 'Todas' : priority === 'critical' ? 'Crítico' :
                 priority === 'high' ? 'Alto' : priority === 'medium' ? 'Médio' : 'Baixo'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Alertas */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Carregando alertas...</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Nenhum alerta encontrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Você está em dia com todas as suas notificações!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map(alert => {
            const statusBadge = getPriorityColor(alert.priority)
            const icon = getPriorityIcon(alert.priority)

            return (
              <div
                key={alert.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 ${
                  !alert.is_read ? 'border-l-blue-600 bg-blue-50 dark:bg-blue-900/10' : 'border-l-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border ${statusBadge}`}>
                        {icon}
                        {alert.priority.toUpperCase()}
                      </span>

                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {getTypeLabel(alert.type)}
                      </span>

                      {!alert.is_read && (
                        <span className="px-2 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold">
                          NOVO
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {alert.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {alert.message}
                    </p>

                    {alert.employee_name && (
                      <p className="text-sm text-gray-500">
                        👤 {alert.employee_name}
                      </p>
                    )}

                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(alert.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>

                  <div className="flex items-start gap-2 ml-4">
                    {!alert.is_read && (
                      <button
                        onClick={() => markAsRead(alert.id)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                        title="Marcar como lido"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}

                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                      title="Excluir alerta"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {alert.action_url && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <a
                      href={alert.action_url}
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Ver detalhes →
                    </a>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}