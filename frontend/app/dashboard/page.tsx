'use client'

import { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Loader2,
  Users,
  BookOpen,
  Info,
} from 'lucide-react'
import {
  getEmployees,
  getKnowledge,
  getAlerts,
} from '@/lib/api'

type Employee = {
  id: string
  nome_completo: string
  status?: string
  cargo?: string
  area?: { nome?: string }
}

type Knowledge = {
  id: string
  nome: string
  tipo?: string
  status?: string
}

type Alert = {
  id: number
  title: string
  message: string
  priority?: string
  is_read?: boolean
  created_at?: string
}

interface DashboardState {
  employees: Employee[]
  knowledge: Knowledge[]
  alerts: Alert[]
}

function StatCard({
  title,
  value,
  icon,
  description,
}: {
  title: string
  value: number
  icon: React.ReactNode
  description: string
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-ol-border bg-white p-4 shadow-sm dark:border-darkOl-border dark:bg-darkOl-cardBg">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ol-grayMedium dark:text-darkOl-grayMedium">{title}</p>
        <span className="text-ol-primary dark:text-darkOl-primary">{icon}</span>
      </div>
      <p className="text-3xl font-semibold text-ol-text dark:text-darkOl-text">{value}</p>
      <span className="text-xs text-ol-grayMedium dark:text-darkOl-grayMedium">{description}</span>
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-ol-border bg-white p-4 shadow-sm dark:border-darkOl-border dark:bg-darkOl-cardBg">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-ol-text dark:text-darkOl-text">
        {title}
      </h2>
      {children}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-dashed border-ol-border px-4 py-6 text-sm text-ol-grayMedium dark:border-darkOl-border dark:text-darkOl-grayMedium">
      <Info className="h-4 w-4" />
      {message}
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardState>({
    employees: [],
    knowledge: [],
    alerts: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const [employees, knowledge, alerts] = await Promise.all([
          getEmployees().catch(() => []),
          getKnowledge().catch(() => []),
          getAlerts().catch(() => []),
        ])
        setData({
          employees,
          knowledge,
          alerts,
        })
      } catch (err) {
        console.error(err)
        setError('Não foi possível carregar os dados do dashboard no momento.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const employeeStats = useMemo(() => {
    const total = data.employees.length
    const statusCount = (status: string) =>
      data.employees.filter((employee) => employee.status?.toUpperCase() === status).length

    return {
      total,
      ativos: statusCount('ATIVO'),
      ferias: statusCount('FERIAS'),
      afastados: statusCount('AFASTADO'),
    }
  }, [data.employees])

  const knowledgeStats = useMemo(() => {
    const total = data.knowledge.length
    const byType = (type: string) =>
      data.knowledge.filter((item) => item.tipo?.toUpperCase() === type).length

    return {
      total,
      certificacoes: byType('CERTIFICACAO'),
      cursos: byType('CURSO'),
      ativos: data.knowledge.filter((item) => item.status?.toUpperCase() === 'ATIVO').length,
    }
  }, [data.knowledge])

  const unreadAlerts = useMemo(
    () => data.alerts.filter((alert) => !alert.is_read),
    [data.alerts]
  )

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ol-text dark:text-darkOl-text">Overview geral</h1>
          <p className="text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">
            Acompanhe os principais indicadores da OL Tecnologia.
          </p>
        </div>
      </header>

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-ol-border py-12 dark:border-darkOl-border">
          <Loader2 className="h-6 w-6 animate-spin text-ol-primary dark:text-darkOl-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Colaboradores ativos"
              value={employeeStats.ativos}
              description={`${employeeStats.total} cadastrados`}
              icon={<Users className="h-5 w-5" />}
            />
            <StatCard
              title="Conhecimentos catalogados"
              value={knowledgeStats.total}
              description={`${knowledgeStats.certificacoes} certificações • ${knowledgeStats.cursos} cursos`}
              icon={<BookOpen className="h-5 w-5" />}
            />
            <StatCard
              title="Alertas pendentes"
              value={unreadAlerts.length}
              description={`${data.alerts.length} alertas no total`}
              icon={<Bell className="h-5 w-5" />}
            />
            <StatCard
              title="Processos concluídos"
              value={knowledgeStats.ativos}
              description="Conhecimentos ativos registrados"
              icon={<CheckCircle2 className="h-5 w-5" />}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard title="Alertas recentes">
              {data.alerts.length === 0 ? (
                <EmptyState message="Nenhum alerta registrado até o momento." />
              ) : (
                <ul className="space-y-3">
              {data.alerts.slice(0, 5).map((alert) => {
                const priority = (alert.priority ?? '').toUpperCase()
                const badgeClass =
                  priority === 'CRITICAL' || priority === 'HIGH'
                    ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-200'
                    : priority === 'MEDIUM'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-200'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200'
                return (
                <li
                  key={alert.id}
                  className="rounded-lg border border-ol-border px-4 py-3 text-sm dark:border-darkOl-border"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-ol-text dark:text-darkOl-text">
                      {alert.title}
                    </p>
                    <span
                      className={clsx('rounded-full px-2 py-0.5 text-xs font-semibold', badgeClass)}
                    >
                      {priority || 'SEM PRIORIDADE'}
                    </span>
                  </div>
                  {alert.message && (
                    <p className="mt-2 text-xs text-ol-grayMedium dark:text-darkOl-grayMedium">
                      {alert.message}
                    </p>
                  )}
                </li>
              )})}
            </ul>
          )}
        </SectionCard>

            <SectionCard title="Distribuição de colaboradores">
              {data.employees.length === 0 ? (
                <EmptyState message="Cadastre colaboradores para visualizar esta seção." />
              ) : (
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center justify-between rounded-lg border border-ol-border px-4 py-3 dark:border-darkOl-border">
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-green-500" />
                      Ativos
                    </span>
                    <strong>{employeeStats.ativos}</strong>
                  </li>
                  <li className="flex items-center justify-between rounded-lg border border-ol-border px-4 py-3 dark:border-darkOl-border">
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-blue-500" />
                      Em férias
                    </span>
                    <strong>{employeeStats.ferias}</strong>
                  </li>
                  <li className="flex items-center justify-between rounded-lg border border-ol-border px-4 py-3 dark:border-darkOl-border">
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-yellow-500" />
                      Afastados
                    </span>
                    <strong>{employeeStats.afastados}</strong>
                  </li>
                </ul>
              )}
            </SectionCard>
          </div>
        </>
      )}
    </div>
  )
}
