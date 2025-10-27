'use client'

import React, { useState, useEffect } from 'react'
import { Bell, CheckCircle, AlertCircle, AlertTriangle, Clock, Info, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

import OLCardStats from '@/components/ui/OLCardStats'
import OLButton from '@/components/ui/OLButton'
import OLModal from '@/components/ui/OLModal'

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
  employee_name?: string
  is_read: boolean
  created_at: string
  action_url?: string
  metadata?: Record<string, any>
}

function getPriorityColor(priority: AlertPriority) {
  const colors = {
    critical: 'border-red-600 bg-red-100 text-red-700',
    high: 'border-orange-600 bg-orange-100 text-orange-700',
    medium: 'border-yellow-600 bg-yellow-100 text-yellow-700',
    low: 'border-blue-600 bg-blue-100 text-blue-700',
    info: 'border-gray-600 bg-gray-100 text-gray-700'
  }
  return colors[priority]
}

function getPriorityIcon(priority: AlertPriority) {
  const icons = {
    critical: <AlertCircle className="w-5 h-5" />,
    high: <AlertTriangle className="w-5 h-5" />,
    medium: <Clock className="w-5 h-5" />,
    low: <Info className="w-5 h-5" />,
    info: <Bell className="w-5 h-5" />
  }
  return icons[priority]
}

function getTypeLabel(type: AlertType) {
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

export default function AlertasPage() {
  const router = useRouter()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [priorityFilter, setPriorityFilter] = useState<AlertPriority | 'all'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  useEffect(() => {
    fetchAlerts()
  }, [filter, priorityFilter])

  async function fetchAlerts() {
    try {
      setLoading(true)
      setError(null)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('token')

      let url = `${API_URL}/alerts?`
      if (filter === 'unread') url += 'is_read=false&'
      if (priorityFilter !== 'all') url += `priority=${priorityFilter}&`

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      })

      if (!response.ok) throw new Error('Erro ao carregar alertas')

      const data = await response.json()
      const alertsData = data.data || data

      setAlerts(Array.isArray(alertsData) ? alertsData : [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function confirmDelete(id: number) {
    setDeleteId(id)
    setModalOpen(true)
  }

  async function handleDelete() {
    if (!deleteId) return

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('token')

      const response = await fetch(`${API_URL}/alerts/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Falha ao excluir alerta')

      setDeleteId(null)
      setModalOpen(false)
      await fetchAlerts()
    } catch (err: any) {
      alert(err.message)
    }
  }

  async function markAsRead(alertId: number) {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('token')

      const response = await fetch(`${API_URL}/alerts/${alertId}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        setAlerts(alerts.map(alert =>
          alert.id === alertId ? { ...alert, is_read: true } : alert
        ))
      }
    } catch (err) {
      alert('Erro ao marcar alerta como lido')
    }
  }

  async function markAllAsRead() {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('token')

      const response = await fetch(`${API_URL}/alerts/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        await fetchAlerts()
      }
    } catch (err) {
      alert('Erro ao marcar todos alertas como lidos')
    }
  }

  const unreadCount = alerts.filter(a => !a.is_read).length

  if (error) {
    return (
      <div className="min-h-screen bg-ol-bg dark:bg-darkOl-bg p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-ol-cardBg dark:bg-darkOl-cardBg border border-ol-border dark:border-darkOl-border rounded-lg p-6">
            <h2 className="text-xl font-bold text-ol-error dark:text-darkOl-error mb-2">❌ Erro ao carregar alertas</h2>
            <p className="text-ol-text dark:text-darkOl-text mb-4">{error}</p>
            <div className="flex gap-3">
              <OLButton variant="danger" onClick={fetchAlerts}>Tentar Novamente</OLButton>
              <OLButton variant="outline" onClick={() => router.push("/dashboard")}>Voltar ao Dashboard</OLButton>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ol-bg dark:bg-darkOl-bg flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-ol-primary mx-auto mb-4"></div>
          <p className="text-ol-text dark:text-darkOl-text">Carregando alertas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ol-bg dark:bg-darkOl-bg p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ol-primary dark:text-darkOl-primary flex items-center gap-3">
            <Bell className="w-8 h-8 text-ol-primary dark:text-darkOl-primary" />
            Central de Alertas
          </h1>
          <p className="text-ol-grayMedium dark:text-darkOl-grayMedium mt-2">
            {unreadCount} alerta{unreadCount !== 1 ? 's' : ''} não lido{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>

        <OLButton variant="primary" onClick={markAllAsRead} disabled={unreadCount === 0}>
          <CheckCircle className="w-5 h-5 mr-2" />
          Marcar Todos como Lidos
        </OLButton>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <OLCardStats label="Total" value={alerts.length} icon={<Bell />} color="info" />
        <OLCardStats label="Não Lidos" value={unreadCount} icon={<Bell />} color="warning" />
        <OLCardStats label="Críticos" value={alerts.filter(a => a.priority === 'critical').length} icon={<AlertCircle />} color="danger" />
        <OLCardStats label="Altos" value={alerts.filter(a => a.priority === 'high').length} icon={<AlertTriangle />} color="warning" />
      </div>

      {/* Lista de Alertas */}
      <div className="bg-ol-cardBg dark:bg-darkOl-cardBg rounded-lg shadow-sm overflow-hidden border border-ol-border dark:border-darkOl-border">
        {alerts.length === 0 ? (
          <div className="p-12 text-center text-ol-text dark:text-darkOl-text text-lg font-semibold">Nenhum alerta encontrado</div>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className={`p-4 border-b last:border-b-0 cursor-pointer hover:bg-ol-grayLight dark:hover:bg-darkOl-grayLight flex justify-between items-center ${!alert.is_read ? 'bg-ol-bg dark:bg-darkOl-bg font-semibold' : ''}`}>
              <div>
                <h4 className="text-ol-primary dark:text-darkOl-primary">{alert.title}</h4>
                <p className="text-ol-grayMedium dark:text-darkOl-grayMedium text-sm">{alert.message}</p>
                {alert.employee_name && <p className="text-ol-grayMedium dark:text-darkOl-grayMedium text-xs mt-1">👤 {alert.employee_name}</p>}
              </div>
              <div className="flex items-center gap-2">
                {!alert.is_read && (
                  <button onClick={() => markAsRead(alert.id)} className="text-teal-600 hover:underline" title="Marcar como lido">
                    <CheckCircle className="w-5 h-5" />
                  </button>
                )}
                <button onClick={() => confirmDelete(alert.id)} className="text-red-600 hover:underline" title="Excluir alerta">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal confirmação */}
      <OLModal
        open={deleteId !== null}
        title="Confirmar exclusão"
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        confirmText="Excluir"
        cancelText="Cancelar"
        variantConfirm="danger"
      >
        <p>Tem certeza que deseja excluir este alerta?</p>
      </OLModal>
    </div>
  )
}
