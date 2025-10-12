'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, BarChart3, Users, Star, MessageCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

const StatCard = ({
  name,
  value,
  icon,
  color,
  className = '',
  onClick,
}: {
  name: string
  value: string | number
  icon: React.ReactNode
  color: string
  className?: string
  onClick?: () => void
}) => (
  <div
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onClick={onClick}
    onKeyDown={e => {
      if (onClick && (e.key === 'Enter' || e.key === ' ')) {
        onClick()
      }
    }}
    className={`bg-ol-white dark:bg-darkOl-grayLight rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow border-l-4 cursor-pointer ${className}`}
    style={{ borderColor: color }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-ol-grayMedium dark:text-darkOl-grayMedium mb-1">{name}</p>
        <p className="text-3xl font-bold text-ol-black dark:text-darkOl-white">{value}</p>
      </div>
      <div className="text-4xl text-ol-grayMedium">{icon}</div>
    </div>
  </div>
)

const AlertCard = ({ alerts }: { alerts: { message: string }[] }) => (
  <div className="bg-ol-white dark:bg-darkOl-grayLight rounded-xl shadow-lg p-6 border border-ol-grayMedium">
    <h3 className="text-xl font-semibold text-ol-black mb-5">Alertas do Sistema</h3>
    {alerts.length ? (
      alerts.map((alert, idx) => (
        <div key={idx} className="mb-3 p-3 border border-yellow-300 bg-yellow-50 rounded">{alert.message}</div>
      ))
    ) : (
      <div className="text-center text-green-600">Sistema está funcionando normalmente</div>
    )}
  </div>
)

const recentActivities = [
  { action: 'Nova avaliação criada', user: 'João Silva', time: 'Há 2 horas' },
  { action: 'PDI atualizado', user: 'Maria Santos', time: 'Há 3 horas' },
  { action: 'One-to-One realizado', user: 'Pedro Costa', time: 'Há 5 horas' },
  { action: 'Colaborador adicionado', user: 'Ana Lima', time: 'Há 1 dia' },
]

const alerts = [
  { message: 'Atenção: Avaliação performance em aberto!' },
  { message: 'Novo colaborador sem vínculo cadastrado.' },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [colaboradorCount, setColaboradorCount] = useState<number>(0)
  const [loadingColaboradores, setLoadingColaboradores] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchColaboradorCount() {
      try {
        setLoadingColaboradores(true)
        setError(null)
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_URL}/api/employees`, {
          headers: {
            Authorization: `Bearer ${token ?? ''}`,
            'Content-Type': 'application/json',
          },
        })
        if (!response.ok) throw new Error(`Erro ${response.status}: ${response.statusText}`)
        const data = await response.json()
        const colaboradores = Array.isArray(data) ? data : data.data
        setColaboradorCount(colaboradores.length)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoadingColaboradores(false)
      }
    }
    fetchColaboradorCount()
  }, [])

  const stats = useMemo(() => [
    {
      name: 'Total de Colaboradores',
      value: loadingColaboradores ? 'Carregando...' : colaboradorCount,
      icon: <Users />,
      color: '#3b82f6',
      onClick: () => router.push('/dashboard/colaboradores'),
    },
    { name: 'PDIs Ativos', value: 60, icon: <BarChart3 />, color: '#22c55e' },
    { name: 'One-to-Ones Agendados', value: 45, icon: <MessageCircle />, color: '#a855f7' },
    { name: 'Avaliações Pendentes', value: 20, icon: <Star />, color: '#eab308' },
  ], [colaboradorCount, loadingColaboradores, router])

  return (
    <div className="bg-ol-bg dark:bg-darkOl-bg min-h-screen p-6">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ol-black dark:text-darkOl-white">
          Bem-vindo, {user?.full_name ?? 'Colaborador'}! 👋
        </h1>
        <p className="text-ol-grayMedium dark:text-darkOl-grayMedium mt-2">
          Aqui está um resumo do que está acontecendo na sua organização
        </p>
        {error && <p className="text-red-600 mt-2">Erro ao carregar colaboradores: {error}</p>}
      </div>

      {/* Cards estatísticos */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <StatCard key={stat.name} {...stat} />
        ))}
      </div>

      {/* Parte baixa da dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Atividades Recentes */}
        <div className="bg-ol-white dark:bg-darkOl-grayLight rounded-xl shadow-lg p-8 border border-ol-grayMedium hover:shadow-xl transition-all">
          <h2 className="text-xl font-bold text-ol-black dark:text-darkOl-white mb-4">Atividades Recentes</h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 pb-4 border-b border-ol-grayMedium dark:border-darkOl-grayMedium last:border-b-0"
              >
                <div className="w-2 h-2 bg-ol-primary rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ol-black dark:text-darkOl-white">{activity.action}</p>
                  <p className="text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">
                    {activity.user} • {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas */}
        <AlertCard alerts={alerts} />
      </div>

      {/* Espaço para ações rápidas */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 ">
        <div className="bg-ol-white dark:bg-darkOl-grayLight rounded-xl shadow-lg p-8 border border-ol-grayMedium hover:shadow-xl transition-all">
          <h2 className="text-xl font-bold text-ol-black dark:text-darkOl-white mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/dashboard/colaboradores/novo"
              className="p-4 border-2 border-dashed border-ol-grayMedium dark:border-darkOl-grayMedium rounded-lg hover:border-ol-primary dark:hover:border-darkOl-primary hover:bg-ol-bg dark:hover:bg-darkOl-bg transition-all text-center flex flex-col items-center justify-center"
            >
              <div className="text-3xl mb-2">➕</div>
              <p className="text-sm font-semibold text-ol-grayMedium dark:text-darkOl-grayMedium">Novo Colaborador</p>
            </Link>
            <Link
              href="/dashboard/pdi"
              className="p-4 border-2 border-dashed border-ol-grayMedium dark:border-darkOl-grayMedium rounded-lg hover:border-ol-success dark:hover:border-darkOl-success hover:bg-ol-bg dark:hover:bg-darkOl-bg transition-all text-center"
            >
              <div className="text-3xl mb-2">📝</div>
              <p className="text-sm font-semibold text-ol-grayMedium dark:text-darkOl-grayMedium">Criar PDI</p>
            </Link>
            <Link
              href="/dashboard/one-to-one"
              className="p-4 border-2 border-dashed border-ol-grayMedium dark:border-darkOl-grayMedium rounded-lg hover:border-purple-500 hover:bg-ol-bg dark:hover:bg-darkOl-bg transition-all text-center"
            >
              <div className="text-3xl mb-2">📅</div>
              <p className="text-sm font-semibold text-ol-grayMedium dark:text-darkOl-grayMedium">Agendar 1:1</p>
            </Link>
            <Link
              href="/dashboard/avaliacoes"
              className="p-4 border-2 border-dashed border-ol-grayMedium dark:border-darkOl-grayMedium rounded-lg hover:border-yellow-500 hover:bg-ol-bg dark:hover:bg-darkOl-bg transition-all text-center"
            >
              <div className="text-3xl mb-2">⭐</div>
              <p className="text-sm font-semibold text-ol-grayMedium dark:text-darkOl-grayMedium">Nova Avaliação</p>
            </Link>
          </div>
        </div>
        <div>{/* Espaço para conteúdos extras */}</div>
      </div>
    </div>
  )
}
