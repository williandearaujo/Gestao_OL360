'use client'

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle, Edit, Eye, Trash2, Users, Loader2 } from "lucide-react"
import clsx from "clsx"
import { getEmployees, deleteEmployee } from "@/lib/api"
import { OLButton } from "@/components/ui/OLButton"
import OLModal from "@/components/ui/OLModal"

type EmployeeListItem = {
  id: string
  nome_completo: string
  cargo?: string | null
  senioridade?: string | null
  email_corporativo?: string | null
  status?: string | null
  area?: { nome?: string | null } | null
}

interface ModalState {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  onConfirm?: () => Promise<void> | void
}

export default function ColaboradoresPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<EmployeeListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalState>({
    open: false,
    title: "",
    description: "",
  })

  const loadEmployees = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getEmployees()
      setEmployees(data ?? [])
    } catch (err) {
      console.error(err)
      setError("Nao foi possivel carregar os colaboradores. Tente novamente mais tarde.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEmployees()
  }, [])

  const activeCount = useMemo(
    () => employees.filter((employee) => employee.status?.toUpperCase() === "ATIVO").length,
    [employees]
  )

  const confirmDelete = (employeeId: string, employeeName: string) => {
    setModal({
      open: true,
      title: "Remover colaborador",
      description: `Deseja realmente remover ${employeeName}? Esta acao nao pode ser desfeita.`,
      confirmLabel: "Remover",
      onConfirm: async () => {
        try {
          await deleteEmployee(employeeId)
          setModal({
            open: true,
            title: "Colaborador removido",
            description: `${employeeName} foi removido com sucesso.`,
          })
          setEmployees((prev) => prev.filter((employee) => employee.id !== employeeId))
        } catch (err) {
          console.error(err)
          setModal({
            open: true,
            title: "Erro ao remover",
            description: "Nao foi possivel remover o colaborador. Tente novamente.",
          })
        }
      },
    })
  }

  const closeModal = () =>
    setModal({
      open: false,
      title: "",
      description: "",
    })

  return (
    <div className="space-y-6">
      <OLModal
        isOpen={modal.open}
        title={modal.title}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
        confirmText={modal.confirmLabel}
      >
        <p className="text-sm text-ol-text dark:text-darkOl-text">{modal.description}</p>
      </OLModal>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-ol-text dark:text-darkOl-text">
            Equipe OL Tecnologia
          </h1>
          <p className="text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">
            Gerencie colaboradores, cargos e status de forma centralizada.
          </p>
        </div>
        <OLButton onClick={() => router.push("/dashboard/colaboradores/novo")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo colaborador
        </OLButton>
      </header>

      <section className="rounded-xl border border-ol-border bg-white p-4 shadow-sm dark:border-darkOl-border dark:bg-darkOl-cardBg">
        <div className="flex items-center gap-3 text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">
          <Users className="h-4 w-4" />
          <span>
            {employees.length} colaborador(es) cadastrados - {activeCount} ativos
          </span>
        </div>
      </section>

      <div className="overflow-hidden rounded-xl border border-ol-border bg-white shadow-sm dark:border-darkOl-border dark:bg-darkOl-cardBg">
        <table className="min-w-full divide-y divide-ol-border dark:divide-darkOl-border">
          <thead className="bg-ol-bg dark:bg-darkOl-bg">
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-ol-grayMedium dark:text-darkOl-grayMedium">
              <th className="px-6 py-3">Colaborador</th>
              <th className="px-6 py-3">Cargo</th>
              <th className="px-6 py-3">E-mail</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ol-border bg-white text-sm dark:divide-darkOl-border dark:bg-darkOl-cardBg">
            {loading && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-ol-grayMedium dark:text-darkOl-grayMedium">
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Carregando colaboradores...
                  </span>
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-red-600 dark:text-red-300">
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && employees.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-ol-grayMedium dark:text-darkOl-grayMedium">
                  Nenhum colaborador cadastrado ate o momento.
                </td>
              </tr>
            )}
            {!loading &&
              !error &&
              employees.map((employee) => (
                <tr key={employee.id}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-ol-text dark:text-darkOl-text">
                      {employee.nome_completo}
                    </div>
                    <div className="text-xs text-ol-grayMedium dark:text-darkOl-grayMedium">
                      {employee.area?.nome ?? "Sem area definida"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-ol-text dark:text-darkOl-text">
                    <div>{employee.cargo ?? "Nao informado"}</div>
                    <div className="text-xs text-ol-grayMedium dark:text-darkOl-grayMedium">
                      {employee.senioridade ?? "Nao informado"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-ol-text dark:text-darkOl-text">
                    {employee.email_corporativo ?? "Nao informado"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={clsx(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold uppercase",
                        employee.status?.toUpperCase() === "ATIVO"
                          ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-200"
                          : employee.status?.toUpperCase() === "FERIAS"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-200"
                      )}
                    >
                      {employee.status ?? "Indefinido"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className="rounded-md px-2 py-1 text-ol-primary transition hover:bg-ol-bg dark:text-darkOl-primary dark:hover:bg-darkOl-cardBg"
                      onClick={() => router.push(`/dashboard/colaboradores/${employee.id}`)}
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      className="ml-2 rounded-md px-2 py-1 text-ol-primary transition hover:bg-ol-bg dark:text-darkOl-primary dark:hover:bg-darkOl-cardBg"
                      onClick={() => router.push(`/dashboard/colaboradores/${employee.id}/editar`)}
                      title="Editar colaborador"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      className="ml-2 rounded-md px-2 py-1 text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
                      onClick={() => confirmDelete(employee.id, employee.nome_completo)}
                      title="Excluir colaborador"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}