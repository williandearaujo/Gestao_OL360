"use client"
import { useEffect, useMemo, useState } from "react"
import { Tab } from "@headlessui/react"
import clsx from "clsx"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { Info, Loader2 } from "lucide-react"
import {
  createEmployee,
  updateEmployee,
  getAreas,
  getTeams,
  getManagers,
  getEmployees,
} from "@/lib/api"
import OLButton from "@/components/ui/OLButton"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
type Option = {
  value: string
  label: string
}
export interface EmployeeSummary {
  id?: string
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
  area_id?: string | null
  area?: { id: string; nome: string } | null
  team_id?: string | null
  manager_id?: string | null
  data_proximo_pdi?: string | null
  data_ultimo_pdi?: string | null
  data_proxima_1x1?: string | null
  data_ultima_1x1?: string | null
  ferias_dados?: Record<string, any> | null
}
type FormValues = {
  nome_completo: string
  email_corporativo: string
  email_pessoal: string
  telefone_pessoal: string
  telefone_corporativo: string
  data_nascimento: string
  cpf: string
  rg: string
  endereco_completo: string
  contato_emergencia_nome: string
  contato_emergencia_telefone: string
  data_admissao: string
  cargo: string
  senioridade: string
  status: string
  area_id: string
  team_id: string
  manager_id: string
  data_proximo_pdi: string
  data_ultimo_pdi: string
  data_proxima_1x1: string
  data_ultima_1x1: string
  ferias_dias_disponiveis: string
  ferias_status: string
  ferias_inicio: string
  ferias_fim: string
}
interface EmployeeFormProps {
  employee?: EmployeeSummary | null
}
const TABS = [
  { key: "personal", label: "Dados pessoais" },
  { key: "contact", label: "Contato" },
  { key: "professional", label: "Profissional" },
  { key: "development", label: "Agenda e desenvolvimento" },
  { key: "vacation", label: "Ferias e day off" },
]
const textareaClass =
  "min-h-[120px] w-full rounded-lg border border-ol-border bg-white px-3 py-2 text-sm text-ol-text outline-none transition focus:border-ol-primary focus:ring-2 focus:ring-ol-primary/40 dark:border-darkOl-border dark:bg-darkOl-bg dark:text-darkOl-text dark:focus:border-darkOl-primary dark:focus:ring-darkOl-primary/40"
export default function EmployeeForm({ employee }: EmployeeFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [optionsError, setOptionsError] = useState<string | null>(null)
  const [areas, setAreas] = useState<Option[]>([])
  const [teams, setTeams] = useState<Option[]>([])
  const [managers, setManagers] = useState<Option[]>([])
  const [optionsLoading, setOptionsLoading] = useState(true)
  const defaultStatus = useMemo(() => (employee?.status ? employee.status.toUpperCase() : "ATIVO"), [employee?.status])
  const defaultDate = useMemo(() => {
    if (employee?.data_admissao) {
      return employee.data_admissao.slice(0, 10)
    }
    return new Date().toISOString().slice(0, 10)
  }, [employee?.data_admissao])
  const defaultDateValue = (value?: string | null) => {
    if (!value) return ""
    return value.slice(0, 10)
  }
  const defaultFerias = employee?.ferias_dados ?? {}
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      nome_completo: employee?.nome_completo ?? "",
      email_corporativo: employee?.email_corporativo ?? "",
      email_pessoal: employee?.email_pessoal ?? "",
      telefone_pessoal: employee?.telefone_pessoal ?? "",
      telefone_corporativo: employee?.telefone_corporativo ?? "",
      data_nascimento: defaultDateValue(employee?.data_nascimento),
      cpf: employee?.cpf ?? "",
      rg: employee?.rg ?? "",
      endereco_completo: employee?.endereco_completo ?? "",
      contato_emergencia_nome: employee?.contato_emergencia_nome ?? "",
      contato_emergencia_telefone: employee?.contato_emergencia_telefone ?? "",
      data_admissao: defaultDate,
      cargo: employee?.cargo ?? "",
      senioridade: employee?.senioridade ?? "",
      status: defaultStatus,
      area_id: employee?.area?.id ?? "",
      team_id: employee?.team_id ?? "",
      manager_id: employee?.manager_id ?? "",
      data_proximo_pdi: defaultDateValue(employee?.data_proximo_pdi),
      data_ultimo_pdi: defaultDateValue(employee?.data_ultimo_pdi),
      data_proxima_1x1: defaultDateValue(employee?.data_proxima_1x1),
      data_ultima_1x1: defaultDateValue(employee?.data_ultima_1x1),
      ferias_dias_disponiveis: defaultFerias.dias_disponiveis ? String(defaultFerias.dias_disponiveis) : "",
      ferias_status: defaultFerias.status ?? "",
      ferias_inicio: defaultDateValue(defaultFerias.inicio),
      ferias_fim: defaultDateValue(defaultFerias.fim),
    },
  })
  useEffect(() => {
    reset({
      nome_completo: employee?.nome_completo ?? "",
      email_corporativo: employee?.email_corporativo ?? "",
      email_pessoal: employee?.email_pessoal ?? "",
      telefone_pessoal: employee?.telefone_pessoal ?? "",
      telefone_corporativo: employee?.telefone_corporativo ?? "",
      data_nascimento: defaultDateValue(employee?.data_nascimento),
      cpf: employee?.cpf ?? "",
      rg: employee?.rg ?? "",
      endereco_completo: employee?.endereco_completo ?? "",
      contato_emergencia_nome: employee?.contato_emergencia_nome ?? "",
      contato_emergencia_telefone: employee?.contato_emergencia_telefone ?? "",
      data_admissao: defaultDate,
      cargo: employee?.cargo ?? "",
      senioridade: employee?.senioridade ?? "",
      status: defaultStatus,
      area_id: employee?.area?.id ?? "",
      team_id: employee?.team_id ?? "",
      manager_id: employee?.manager_id ?? "",
      data_proximo_pdi: defaultDateValue(employee?.data_proximo_pdi),
      data_ultimo_pdi: defaultDateValue(employee?.data_ultimo_pdi),
      data_proxima_1x1: defaultDateValue(employee?.data_proxima_1x1),
      data_ultima_1x1: defaultDateValue(employee?.data_ultima_1x1),
      ferias_dias_disponiveis: defaultFerias.dias_disponiveis ? String(defaultFerias.dias_disponiveis) : "",
      ferias_status: defaultFerias.status ?? "",
      ferias_inicio: defaultDateValue(defaultFerias.inicio),
      ferias_fim: defaultDateValue(defaultFerias.fim),
    })
  }, [employee, reset, defaultStatus, defaultDate, defaultFerias])
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setOptionsLoading(true)
        setOptionsError(null)
        const [areasData, teamsData, managersData, employeesData] = await Promise.all([
          getAreas().catch(() => []),
          getTeams().catch(() => []),
          getManagers().catch(() => []),
          getEmployees().catch(() => []),
        ])
        const employeeNameMap = new Map<string, string>()
        if (Array.isArray(employeesData)) {
          for (const item of employeesData) {
            if (item?.id && item?.nome_completo) {
              employeeNameMap.set(item.id, item.nome_completo)
            }
          }
        }
        setAreas(
          Array.isArray(areasData)
            ? areasData.map((area: any) => ({
                value: area.id,
                label: area.nome,
              }))
            : []
        )
        setTeams(
          Array.isArray(teamsData)
            ? teamsData.map((team: any) => ({
                value: team.id,
                label: team.nome,
              }))
            : []
        )
        setManagers(
          Array.isArray(managersData)
            ? managersData.map((manager: any) => ({
                value: manager.id,
                label: employeeNameMap.get(manager.employee_id) ?? manager.employee_id,
              }))
            : []
        )
      } catch (error) {
        console.error(error)
        setOptionsError("Nao foi possivel carregar listas auxiliares. Tente novamente.")
      } finally {
        setOptionsLoading(false)
      }
    }
    loadOptions()
  }, [])
  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)
    setErrorMessage(null)
    const normalizeEmpty = (value: string) => (value && value.trim().length > 0 ? value.trim() : null)
    const payload: Record<string, any> = {
      nome_completo: values.nome_completo.trim(),
      email_corporativo: values.email_corporativo.trim(),
      email_pessoal: normalizeEmpty(values.email_pessoal),
      telefone_pessoal: normalizeEmpty(values.telefone_pessoal),
      telefone_corporativo: normalizeEmpty(values.telefone_corporativo),
      cargo: normalizeEmpty(values.cargo),
      senioridade: normalizeEmpty(values.senioridade),
      status: values.status ? values.status.toUpperCase() : "ATIVO",
      data_admissao: values.data_admissao || new Date().toISOString().slice(0, 10),
      data_nascimento: normalizeEmpty(values.data_nascimento),
      cpf: normalizeEmpty(values.cpf),
      rg: normalizeEmpty(values.rg),
      endereco_completo: normalizeEmpty(values.endereco_completo),
      contato_emergencia_nome: normalizeEmpty(values.contato_emergencia_nome),
      contato_emergencia_telefone: normalizeEmpty(values.contato_emergencia_telefone),
      area_id: normalizeEmpty(values.area_id),
      team_id: normalizeEmpty(values.team_id),
      manager_id: normalizeEmpty(values.manager_id),
      data_proximo_pdi: normalizeEmpty(values.data_proximo_pdi),
      data_ultimo_pdi: normalizeEmpty(values.data_ultimo_pdi),
      data_proxima_1x1: normalizeEmpty(values.data_proxima_1x1),
      data_ultima_1x1: normalizeEmpty(values.data_ultima_1x1),
    }
    const feriasBase = (employee?.ferias_dados && typeof employee.ferias_dados === "object" ? employee.ferias_dados : {}) as Record<
      string,
      any
    >
    const feriasUpdates: Record<string, any> = {}
    if (values.ferias_dias_disponiveis) {
      feriasUpdates.dias_disponiveis = Number(values.ferias_dias_disponiveis)
    }
    if (values.ferias_status) {
      feriasUpdates.status = values.ferias_status.toUpperCase()
    }
    if (values.ferias_inicio) {
      feriasUpdates.inicio = values.ferias_inicio
    }
    if (values.ferias_fim) {
      feriasUpdates.fim = values.ferias_fim
    }
    const feriasPayload = { ...feriasBase, ...feriasUpdates }
    const hasFeriasContent = Object.keys(feriasPayload).length > 0
    if (hasFeriasContent) {
      payload.ferias_dados = feriasPayload
    }
    try {
      if (employee && employee.id) {
        await updateEmployee(employee.id, payload)
      } else {
        await createEmployee(payload)
      }
      router.push("/dashboard/colaboradores")
    } catch (error: any) {
      const detail =
        error?.response?.data?.detail ??
        error?.message ??
        "Nao foi possivel salvar o colaborador."
      setErrorMessage(detail)
    } finally {
      setSubmitting(false)
    }
  }
  const OptionSelect = ({
    id,
    label,
    placeholder,
    options,
    disabled,
    registerField,
  }: {
    id: keyof FormValues
    label: string
    placeholder?: string
    options: Option[]
    disabled?: boolean
    registerField: ReturnType<typeof register>
  }) => (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        {...registerField}
        disabled={disabled}
        className="w-full rounded-lg border border-ol-border bg-white px-3 py-2 text-sm text-ol-text outline-none transition focus:border-ol-primary focus:ring-2 focus:ring-ol-primary/40 disabled:cursor-not-allowed disabled:opacity-60 dark:border-darkOl-border dark:bg-darkOl-bg dark:text-darkOl-text dark:focus:border-darkOl-primary dark:focus:ring-darkOl-primary/40"
      >
        <option value="">{placeholder ?? "Selecionar"}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                <div>
                  <Label htmlFor="nome_completo">Nome completo</Label>
                  <Input
                    id="nome_completo"
                    {...register("nome_completo", { required: "Informe o nome completo" })}
                    className={errors.nome_completo ? "border-red-500" : undefined}
                  />
                  {errors.nome_completo && (
                    <p className="mt-1 text-xs text-red-500">{errors.nome_completo.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="data_nascimento">Data de nascimento</Label>
                  <Input id="data_nascimento" type="date" {...register("data_nascimento")} />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input id="cpf" {...register("cpf")} />
                </div>
                <div>
                  <Label htmlFor="rg">RG</Label>
                  <Input id="rg" {...register("rg")} />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="endereco_completo">Endereco completo</Label>
                  <textarea
                    id="endereco_completo"
                    {...register("endereco_completo")}
                    className={textareaClass}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="contato_emergencia_nome">Contato de emergencia</Label>
                  <Input id="contato_emergencia_nome" {...register("contato_emergencia_nome")} />
                </div>
                <div>
                  <Label htmlFor="contato_emergencia_telefone">Telefone do contato</Label>
                  <Input id="contato_emergencia_telefone" {...register("contato_emergencia_telefone")} />
                </div>
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="email_corporativo">E-mail corporativo</Label>
                  <Input
                    id="email_corporativo"
                    type="email"
                    {...register("email_corporativo", { required: "Informe o e-mail corporativo" })}
                    className={errors.email_corporativo ? "border-red-500" : undefined}
                  />
                  {errors.email_corporativo && (
                    <p className="mt-1 text-xs text-red-500">{errors.email_corporativo.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email_pessoal">E-mail pessoal</Label>
                  <Input id="email_pessoal" type="email" {...register("email_pessoal")} />
                </div>
                <div>
                  <Label htmlFor="telefone_pessoal">Telefone pessoal</Label>
                  <Input id="telefone_pessoal" {...register("telefone_pessoal")} />
                </div>
                <div>
                  <Label htmlFor="telefone_corporativo">Telefone corporativo</Label>
                  <Input id="telefone_corporativo" {...register("telefone_corporativo")} />
                </div>
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input id="cargo" {...register("cargo")} />
                </div>
                <div>
                  <Label htmlFor="senioridade">Senioridade</Label>
                  <Input id="senioridade" {...register("senioridade")} />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    {...register("status")}
                    className="w-full rounded-lg border border-ol-border bg-white px-3 py-2 text-sm text-ol-text outline-none transition focus:border-ol-primary focus:ring-2 focus:ring-ol-primary/40 dark:border-darkOl-border dark:bg-darkOl-bg dark:text-darkOl-text dark:focus:border-darkOl-primary dark:focus:ring-darkOl-primary/40"
                  >
                    <option value="ATIVO">Ativo</option>
                    <option value="FERIAS">Ferias</option>
                    <option value="DAYOFF">Day off</option>
                    <option value="INATIVO">Inativo</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="data_admissao">Data de admissao</Label>
                  <Input id="data_admissao" type="date" {...register("data_admissao")} />
                </div>
                <OptionSelect
                  id="area_id"
                  label="Area"
                  placeholder="Selecione a area"
                  options={areas}
                  disabled={optionsLoading}
                  registerField={register("area_id")}
                />
                <OptionSelect
                  id="team_id"
                  label="Equipe"
                  placeholder="Selecione a equipe"
                  options={teams}
                  disabled={optionsLoading}
                  registerField={register("team_id")}
                />
                <OptionSelect
                  id="manager_id"
                  label="Gestor responsavel"
                  placeholder="Selecione o gestor"
                  options={managers}
                  disabled={optionsLoading}
                  registerField={register("manager_id")}
                />
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="data_proximo_pdi">Proximo PDI</Label>
                  <Input id="data_proximo_pdi" type="date" {...register("data_proximo_pdi")} />
                </div>
                <div>
                  <Label htmlFor="data_ultimo_pdi">Ultimo PDI</Label>
                  <Input id="data_ultimo_pdi" type="date" {...register("data_ultimo_pdi")} />
                </div>
                <div>
                  <Label htmlFor="data_proxima_1x1">Proxima 1x1</Label>
                  <Input id="data_proxima_1x1" type="date" {...register("data_proxima_1x1")} />
                </div>
                <div>
                  <Label htmlFor="data_ultima_1x1">Ultima 1x1</Label>
                  <Input id="data_ultima_1x1" type="date" {...register("data_ultima_1x1")} />
                </div>
              </div>
              <p className="mt-4 flex items-center gap-2 rounded-lg border border-ol-border bg-ol-bg/40 px-3 py-2 text-xs text-ol-grayMedium dark:border-darkOl-border dark:bg-darkOl-cardBg/60 dark:text-darkOl-grayMedium">
                <Info className="h-4 w-4" />
                Utilize datas para manter alertas de PDI e 1x1 em dia conforme o PRD. Acoes adicionais serao exibidas no dashboard.
              </p>
            </Tab.Panel>
            <Tab.Panel>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="ferias_dias_disponiveis">Dias de ferias disponiveis</Label>
                  <Input id="ferias_dias_disponiveis" type="number" min="0" {...register("ferias_dias_disponiveis")} />
                </div>
                <div>
                  <Label htmlFor="ferias_status">Status das ferias</Label>
                  <Input id="ferias_status" {...register("ferias_status")} placeholder="Ex: PENDENTE, AGENDADO" />
                </div>
                <div>
                  <Label htmlFor="ferias_inicio">Inicio do ultimo periodo</Label>
                  <Input id="ferias_inicio" type="date" {...register("ferias_inicio")} />
                </div>
                <div>
                  <Label htmlFor="ferias_fim">Fim do ultimo periodo</Label>
                  <Input id="ferias_fim" type="date" {...register("ferias_fim")} />
                </div>
              </div>
              <p className="mt-4 flex items-center gap-2 rounded-lg border border-ol-border bg-ol-bg/40 px-3 py-2 text-xs text-ol-grayMedium dark:border-darkOl-border dark:bg-darkOl-cardBg/60 dark:text-darkOl-grayMedium">
                <Info className="h-4 w-4" />
                O controle detalhado de ferias, day off e historico de periodos sera expandido conforme os modulos especificos forem disponiveis. Por ora, mantenha aqui os dados resumidos para alimentar os alertas.
              </p>
            </Tab.Panel>
          </Tab.Panels>
        </div>
      </Tab.Group>
      {optionsError && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-500/40 dark:bg-yellow-500/10 dark:text-yellow-200">
          {optionsError}
        </div>
      )}
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          {errorMessage}
        </div>
      )}
      <div className="flex justify-end gap-3">
        <OLButton type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
          Cancelar
        </OLButton>
        <OLButton type="submit" disabled={submitting}>
          {submitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </span>
          ) : employee && employee.id ? (
            "Salvar alteracoes"
          ) : (
            "Cadastrar colaborador"
          )}
        </OLButton>
      </div>
    </form>
  )
}