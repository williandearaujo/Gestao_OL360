'use client'

import React, { useMemo } from 'react'
import { BookOpen, BarChart3, Users, Star, MessageCircle } from 'lucide-react'
import Header from './Header'
import Footer from './Footer'
import { useAuth } from '@/contexts/AuthContext'
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
    className="bg-ol-white dark:bg-darkOl-grayLight rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow border-l-4"
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

const AlertCard = ({ alerts }: { alerts: { message: string }[] }) => (
  <div className="bg-ol-white dark:bg-darkOl-grayLight p-8 rounded-xl shadow-lg border border-ol-grayMedium dark:border-darkOl-grayMedium hover:shadow-xl transition-all duration-200">
    <h3 className="text-xl font-semibold text-ol-black dark:text-darkOl-white mb-6">Alertas do Sistema</h3>
    {alerts && alerts.length > 0 ? (
      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className="p-4 bg-amber-50 border border-amber-200 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors"
          >
            <p className="text-sm text-amber-800">{alert.message}</p>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center text-green-500 py-6">
        <BookOpen className="mx-auto mb-2 w-8 h-8" />
        <p>Sistema funcionando perfeitamente!</p>
      </div>
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
  const stats = useMemo(
    () => [
      { name: 'Total de Colaboradores', value: 60, icon: <Users />, color: '#3b82f6' },
      { name: 'PDIs Ativos', value: 60, icon: <BarChart3 />, color: '#22c55e' },
      { name: 'One-to-Ones Agendados', value: 45, icon: <MessageCircle />, color: '#a855f7' },
      { name: 'Avaliações Pendentes', value: 20, icon: <Star />, color: '#eab308' },
    ],
    []
  )

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
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 ">
        {stats.map((stat) => (
          <StatCard key={stat.name} name={stat.name} value={stat.value} icon={stat.icon} color={stat.color} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Atividades Recentes */}
        <div className="bg-ol-white dark:bg-darkOl-grayLight p-8 rounded-xl shadow-lg border border-ol-grayMedium dark:border-darkOl-grayMedium hover:shadow-xl transition-all duration-200">
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
                  <p className="text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">{activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas */}
        <AlertCard alerts={alerts} />
      </div>

      {/* Ações rápidas */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 ">
        <div className="bg-ol-white dark:bg-darkOl-grayLight rounded-xl shadow-lg p-8 border border-ol-grayMedium dark:border-darkOl-grayMedium hover:shadow-xl transition-all">
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
