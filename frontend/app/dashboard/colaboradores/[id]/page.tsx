"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Tab } from "@headlessui/react"
import { ArrowLeft, Calendar, Info, Loader2, MapPin, Phone, User, Users } from "lucide-react"
import clsx from "clsx"
import { getEmployeeById, getTeams, getManagers, getEmployees } from "@/lib/api"
import OLButton from "@/components/ui/OLButton"

type EmployeeDetails = {
  id: string
  nome_completo: string
  email_corporativo: string
  email_pessoal?: string | null
  telefone_pessoal?: string | null
  telefone_corporativo?: string | null
  cargo?: string | null
  senioridade?: string | null
  status?: string | null
  data_admissao?: string | null
  data_nascimento?: string | null
  cpf?: string | null
  rg?: string | null
  endereco_completo?: string | null
  contato_emergencia_nome?: string | null
  contato_emergencia_telefone?: string | null
  area?: { id: string; nome?: string | null } | null
  team_id?: string | null
  manager_id?: string | null
  data_proximo_pdi?: string | null
  data_ultimo_pdi?: string | null
  data_proxima_1x1?: string | null
  data_ultima_1x1?: string | null
  ferias_dados?: Record<string, any> | null
  created_at?: string | null
  updated_at?: string | null
}

const TABS = [
  { key: "personal", label: "Dados pessoais" },
  { key: "contact", label: "Contato" },
  { key: "professional", label: "Profissional" },
  { key: "development", label: "Agenda e desenvolvimento" },
  { key: "vacation", label: "Ferias e day off" },
]

const formatValue = (value?: string | null) => {
  if (!value) return "Nao informado"
  const trimmed = value.toString().trim()
  return trimmed.length > 0 ? trimmed : "Nao informado"
}

const formatDate = (value?: string | null) => {
  if (!value) return "Nao informado"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "Nao informado"
  return parsed.toLocaleDateString("pt-BR")
}

function DetailItem({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="space-y-1 rounded-lg border border-ol-border p-4 dark:border-darkOl-border">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ol-grayMedium dark:text-darkOl-grayMedium">
        {icon}
        {label}
      </p>
      <p className="text-sm text-ol-text dark:text-darkOl-text">{value}</p>
    </div>
  )
}

export default function DetalhesColaboradorPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [employee, setEmployee] = useState<EmployeeDetails | null>(null)
  const [teamName, setTeamName] = useState<string | null>(null)
  const [managerName, setManagerName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const [employeeData, teamsData, managersData, employeesData] = await Promise.all([
          getEmployeeById(params.id),
          getTeams().catch(() => []),
          getManagers().catch(() => []),
          getEmployees().catch(() => []),
        ])

        setEmployee(employeeData)

        if (employeeData?.team_id && Array.isArray(teamsData)) {
          const team = teamsData.find((item: any) => item.id === employeeData.team_id)
          setTeamName(team?.nome ?? null)
        } else {
          setTeamName(null)
        }

        if (employeeData?.manager_id && Array.isArray(managersData) && Array.isArray(employeesData)) {
          const managerRecord = managersData.find((item: any) => item.id === employeeData.manager_id)
          if (managerRecord) {
            const managerEmployee = employeesData.find((item: any) => item.id === managerRecord.employee_id)
            setManagerName(managerEmployee?.nome_completo ?? managerRecord.employee_id)
          } else {
            setManagerName(null)
          }
        } else {
          setManagerName(null)
        }
      } catch (err) {
        console.error(err)
        setError("Nao foi possivel carregar o colaborador selecionado.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  const statusClassName = useMemo(
    () =>
      clsx(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase",
        employee?.status?.toUpperCase() === "ATIVO"
          ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-200"
          : employee?.status?.toUpperCase() === "FERIAS"
          ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200"
          : employee?.status?.toUpperCase() === "DAYOFF"
          ? "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-200"
          : employee?.status?.toUpperCase() === "INATIVO"
          ? "bg-gray-200 text-gray-700 dark:bg-gray-500/10 dark:text-gray-200"
          : "bg-ol-bg text-ol-text dark:bg-darkOl-bg dark:text-darkOl-text"
      ),
    [employee?.status]
  )

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-ol-grayMedium dark:text-darkOl-grayMedium">
        <Loader2 className="h-6 w-6 animate-spin" />
        Carregando colaborador...
      </div>
    )
  }

  if (error || !employee) {
    return (
      <div className="space-y-4">
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          {error ?? "Colaborador nao encontrado."}
        </p>
        <OLButton variant="outline" onClick={() => router.push("/dashboard/colaboradores")}>
          Voltar para a lista
        </OLButton>
      </div>
    )
  }

  const feriasDetalhes = employee.ferias_dados ?? {}
  const feriasPeriodos: Array<Record<string, any>> = Array.isArray(feriasDetalhes.periodos) ? feriasDetalhes.periodos : []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-lg border border-ol-border bg-white p-2 transition hover:bg-ol-bg dark:border-darkOl-border dark:bg-darkOl-cardBg dark:hover:bg-darkOl-bg"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-ol-text dark:text-darkOl-text">{employee.nome_completo}</h1>
            <p className="flex items-center gap-2 text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">
              <span>Colaborador OL 360</span>
              <span className={statusClassName}>{employee.status ?? "Nao informado"}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <OLButton variant="outline" onClick={() => router.push("/dashboard/colaboradores")}>
            Voltar para a lista
          </OLButton>
          <OLButton onClick={() => router.push(`/dashboard/colaboradores/${employee.id}/editar`)}>
            Editar colaborador
          </OLButton>
        </div>
      </div>

      <Tab.Group>
        <div className="rounded-xl border border-ol-border bg-white shadow-sm dark:border-darkOl-border dark:bg-darkOl-cardBg">
          <div className="border-b border-ol-border dark:border-darkOl-border">
            <Tab.List className="flex flex-wrap gap-1 px-4 py-3 text-sm font-medium">
              {TABS.map((tab) => (
                <Tab
                  key={tab.key}
                  className={({ selected }) =>
                    clsx(
                      "rounded-lg px-3 py-2 transition",
                      selected
                        ? "bg-ol-primary text-white shadow-sm dark:bg-darkOl-primary dark:text-darkOl-hoverText"
                        : "text-ol-grayMedium hover:bg-ol-bg dark:text-darkOl-grayMedium dark:hover:bg-darkOl-bg"
                    )
                  }
                >
                  {tab.label}
                </Tab>
              ))}
            </Tab.List>
          </div>

          <Tab.Panels className="space-y-6 p-6">
            <Tab.Panel>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <DetailItem label="CPF" value={formatValue(employee.cpf)} icon={<User className="h-4 w-4" />} />
                <DetailItem label="RG" value={formatValue(employee.rg)} />
                <DetailItem label="Data de nascimento" value={formatDate(employee.data_nascimento)} icon={<Calendar className="h-4 w-4" />} />
                <DetailItem label="Data de admissao" value={formatDate(employee.data_admissao)} icon={<Calendar className="h-4 w-4" />} />
                <DetailItem label="Endereco" value={formatValue(employee.endereco_completo)} icon={<MapPin className="h-4 w-4" />} />
                <DetailItem
                  label="Contato de emergencia"
                  value={formatValue(employee.contato_emergencia_nome)}
                  icon={<Phone className="h-4 w-4" />}
                />
                <DetailItem label="Telefone do contato" value={formatValue(employee.contato_emergencia_telefone)} />
              </div>
            </Tab.Panel>

            <Tab.Panel>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <DetailItem label="E-mail corporativo" value={formatValue(employee.email_corporativo)} />
                <DetailItem label="E-mail pessoal" value={formatValue(employee.email_pessoal)} />
                <DetailItem label="Telefone pessoal" value={formatValue(employee.telefone_pessoal)} />
                <DetailItem label="Telefone corporativo" value={formatValue(employee.telefone_corporativo)} />
              </div>
            </Tab.Panel>

            <Tab.Panel>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <DetailItem label="Cargo" value={formatValue(employee.cargo)} />
                <DetailItem label="Senioridade" value={formatValue(employee.senioridade)} />
                <DetailItem label="Area" value={formatValue(employee.area?.nome ?? null)} icon={<Users className="h-4 w-4" />} />
                <DetailItem label="Equipe" value={formatValue(teamName)} />
                <DetailItem label="Gestor" value={formatValue(managerName)} />
                <DetailItem
                  label="Registro criado"
                  value={
                    employee.created_at
                      ? `${formatDate(employee.created_at)}`
                      : "Nao informado"
                  }
                />
                <DetailItem
                  label="Ultima atualizacao"
                  value={
                    employee.updated_at
                      ? `${formatDate(employee.updated_at)}`
                      : "Nao informado"
                  }
                />
              </div>
            </Tab.Panel>

            <Tab.Panel>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <DetailItem label="Proximo PDI" value={formatDate(employee.data_proximo_pdi)} />
                <DetailItem label="Ultimo PDI" value={formatDate(employee.data_ultimo_pdi)} />
                <DetailItem label="Proxima 1x1" value={formatDate(employee.data_proxima_1x1)} />
                <DetailItem label="Ultima 1x1" value={formatDate(employee.data_ultima_1x1)} />
              </div>
              <p className="mt-4 flex items-center gap-2 rounded-lg border border-ol-border bg-ol-bg/40 px-3 py-2 text-xs text-ol-grayMedium dark:border-darkOl-border dark:bg-darkOl-cardBg/60 dark:text-darkOl-grayMedium">
                <Info className="h-4 w-4" />
                Utilize as datas para acompanhar alertas de alinhamentos e planos de desenvolvimento conforme definido no PRD.
              </p>
            </Tab.Panel>

            <Tab.Panel>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <DetailItem
                  label="Dias de ferias disponiveis"
                  value={feriasDetalhes.dias_disponiveis !== undefined ? String(feriasDetalhes.dias_disponiveis) : "Nao informado"}
                />
                <DetailItem label="Status das ferias" value={formatValue(feriasDetalhes.status)} />
                <DetailItem label="Inicio do ultimo periodo" value={formatDate(feriasDetalhes.inicio)} />
                <DetailItem label="Fim do ultimo periodo" value={formatDate(feriasDetalhes.fim)} />
                <DetailItem label="Ultimo status geral" value={formatValue(employee.status)} />
              </div>
              {feriasPeriodos.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h3 className="text-sm font-semibold text-ol-text dark:text-darkOl-text">Historico de periodos</h3>
                  <div className="space-y-2">
                    {feriasPeriodos.map((periodo, index) => (
                      <div
                        key={`${periodo.inicio ?? index}-${periodo.fim ?? index}`}
                        className="rounded-lg border border-ol-border bg-ol-bg/40 p-3 text-xs text-ol-text dark:border-darkOl-border dark:bg-darkOl-cardBg/50 dark:text-darkOl-text"
                      >
                        <p>
                          Periodo {index + 1}: {formatDate(periodo.inicio)} - {formatDate(periodo.fim)}
                        </p>
                        <p>Dias: {periodo.dias ?? "Nao informado"}</p>
                        <p>Status: {periodo.status ?? "Nao informado"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <p className="mt-4 flex items-center gap-2 rounded-lg border border-ol-border bg-ol-bg/40 px-3 py-2 text-xs text-ol-grayMedium dark:border-darkOl-border dark:bg-darkOl-cardBg/60 dark:text-darkOl-grayMedium">
                <Info className="h-4 w-4" />
                O agendamento detalhado de day off e ferias seguira as regras do PRD (vencimentos, alertas e vendas). Enquanto os modulos especificos nao sao liberados, utilize estes dados resumidos para acompanhar a situacao do colaborador.
              </p>
            </Tab.Panel>
          </Tab.Panels>
        </div>
      </Tab.Group>
    </div>
  )
}
