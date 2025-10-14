'use client'

import React, { useState, useEffect } from 'react'
import {
  Users, BookOpen, Award, TrendingUp, AlertCircle,
  Calendar, Clock, CheckCircle, XCircle
} from 'lucide-react'

interface DashboardStats {
  colaboradores: {
    total: number
    ativos: number
    ferias: number
    afastados: number
  }
  conhecimentos: {
    total: number
    ativos: number
    certificacoes: number
    cursos: number
  }
  alertas: {
    total: number
    criticos: number
    avisos: number
  }
  pdi: {
    total: number
    concluidos: number
    emAndamento: number
    atrasados: number
  }
}

interface StatCardProps {
  title: string
  value: number
  subtitle?: string
  icon: React.ReactNode
  color: string
  trend?: string
}

const StatCard: React.FC<StatCardProps> = ({
  title, value, subtitle, icon, color, trend
}) => (
  <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${color} hover:shadow-lg transition-shadow`}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
        {trend && (
          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color.replace('border-', 'bg-').replace('600', '100')}`}>
        {icon}
      </div>
    </div>
  </div>
)

interface ActivityItem {
  id: string
  type: 'pdi' | 'certificacao' | 'ferias' | '1x1'
  employee: string
  description: string
  time: string
  status: 'pending' | 'completed' | 'warning'
}

const ActivityFeed: React.FC<{ activities: ActivityItem[] }> = ({ activities }) => (
  <div className="bg-white rounded-xl shadow-md p-6">
    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
      <Clock className="w-5 h-5 text-blue-600" />
      Atividades Recentes
    </h3>
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
        >
          <div className={`p-2 rounded-full ${
            activity.status === 'completed' ? 'bg-green-100' :
            activity.status === 'warning' ? 'bg-yellow-100' :
            'bg-blue-100'
          }`}>
            {activity.status === 'completed' ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : activity.status === 'warning' ? (
              <AlertCircle className="w-4 h-4 text-yellow-600" />
            ) : (
              <Clock className="w-4 h-4 text-blue-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">{activity.employee}</p>
            <p className="text-sm text-gray-600">{activity.description}</p>
            <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    colaboradores: { total: 0, ativos: 0, ferias: 0, afastados: 0 },
    conhecimentos: { total: 0, ativos: 0, certificacoes: 0, cursos: 0 },
    alertas: { total: 0, criticos: 0, avisos: 0 },
    pdi: { total: 0, concluidos: 0, emAndamento: 0, atrasados: 0 }
  })

  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // TODO: Substituir por chamadas reais à API
      // Dados mockados por enquanto
      setStats({
        colaboradores: { total: 42, ativos: 38, ferias: 2, afastados: 2 },
        conhecimentos: { total: 156, ativos: 143, certificacoes: 45, cursos: 98 },
        alertas: { total: 12, criticos: 3, avisos: 9 },
        pdi: { total: 38, concluidos: 12, emAndamento: 20, atrasados: 6 }
      })

      setActivities([
        {
          id: '1',
          type: 'certificacao',
          employee: 'João Silva',
          description: 'Obteve certificação AWS Solutions Architect',
          time: 'Há 2 horas',
          status: 'completed'
        },
        {
          id: '2',
          type: 'pdi',
          employee: 'Maria Santos',
          description: 'PDI vencendo em 7 dias',
          time: 'Há 4 horas',
          status: 'warning'
        },
        {
          id: '3',
          type: '1x1',
          employee: 'Pedro Oliveira',
          description: 'Reunião 1:1 agendada para amanhã',
          time: 'Há 6 horas',
          status: 'pending'
        }
      ])

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Bem-vindo ao sistema de Gestão 360 - OL Tecnologia
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Colaboradores Ativos"
            value={stats.colaboradores.ativos}
            subtitle={`${stats.colaboradores.total} total`}
            icon={<Users className="w-6 h-6 text-blue-600" />}
            color="border-blue-600"
            trend="+5% este mês"
          />

          <StatCard
            title="Conhecimentos"
            value={stats.conhecimentos.total}
            subtitle={`${stats.conhecimentos.certificacoes} certificações`}
            icon={<BookOpen className="w-6 h-6 text-green-600" />}
            color="border-green-600"
            trend="+12 novos"
          />

          <StatCard
            title="PDI em Andamento"
            value={stats.pdi.emAndamento}
            subtitle={`${stats.pdi.concluidos} concluídos`}
            icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
            color="border-purple-600"
          />

          <StatCard
            title="Alertas Ativos"
            value={stats.alertas.total}
            subtitle={`${stats.alertas.criticos} críticos`}
            icon={<AlertCircle className="w-6 h-6 text-red-600" />}
            color="border-red-600"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Status dos Colaboradores */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Status dos Colaboradores</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Ativos</span>
                </div>
                <span className="text-sm font-semibold">{stats.colaboradores.ativos}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Férias</span>
                </div>
                <span className="text-sm font-semibold">{stats.colaboradores.ferias}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Afastados</span>
                </div>
                <span className="text-sm font-semibold">{stats.colaboradores.afastados}</span>
              </div>
            </div>
          </div>

          {/* Progresso do PDI */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Progresso do PDI</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Concluídos</span>
                  <span className="font-semibold">
                    {stats.pdi.concluidos}/{stats.pdi.total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${(stats.pdi.concluidos / stats.pdi.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Em Andamento</span>
                  <span className="font-semibold">
                    {stats.pdi.emAndamento}/{stats.pdi.total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${(stats.pdi.emAndamento / stats.pdi.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Atrasados</span>
                  <span className="font-semibold text-red-600">
                    {stats.pdi.atrasados}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all"
                    style={{ width: `${(stats.pdi.atrasados / stats.pdi.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Próximos Eventos */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Próximos Eventos
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm font-medium text-blue-900">Reunião 1:1</p>
                <p className="text-xs text-blue-700">Amanhã, 14:00</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                <p className="text-sm font-medium text-purple-900">Avaliação PDI</p>
                <p className="text-xs text-purple-700">Em 3 dias</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                <p className="text-sm font-medium text-green-900">Certificação</p>
                <p className="text-xs text-green-700">Em 7 dias</p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <ActivityFeed activities={activities} />
      </div>
    </div>
  )
}