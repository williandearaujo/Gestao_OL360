"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import EmployeeForm, { EmployeeSummary } from "@/components/employees/EmployeeForm"
import { getEmployeeById } from "@/lib/api"
import OLButton from "@/components/ui/OLButton"

export default function EditarColaboradorPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [employee, setEmployee] = useState<EmployeeSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await getEmployeeById(params.id)
        setEmployee({
          id: data.id,
          nome_completo: data.nome_completo,
          email_corporativo: data.email_corporativo,
          email_pessoal: data.email_pessoal,
          telefone_pessoal: data.telefone_pessoal,
          telefone_corporativo: data.telefone_corporativo,
          cargo: data.cargo,
          senioridade: data.senioridade,
          status: data.status,
          data_admissao: data.data_admissao,
          data_nascimento: data.data_nascimento,
          cpf: data.cpf,
          rg: data.rg,
          endereco_completo: data.endereco_completo,
          contato_emergencia_nome: data.contato_emergencia_nome,
          contato_emergencia_telefone: data.contato_emergencia_telefone,
          area_id: data.area_id ?? data.area?.id ?? null,
          area: data.area ? { id: data.area.id, nome: data.area.nome } : null,
          team_id: data.team_id,
          manager_id: data.manager_id,
          data_proximo_pdi: data.data_proximo_pdi,
          data_ultimo_pdi: data.data_ultimo_pdi,
          data_proxima_1x1: data.data_proxima_1x1,
          data_ultima_1x1: data.data_ultima_1x1,
          ferias_dados: data.ferias_dados,
        })
      } catch (err) {
        console.error(err)
        setError("Nao foi possivel carregar o colaborador selecionado.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-lg border border-ol-border bg-white p-2 transition hover:bg-ol-bg dark:border-darkOl-border dark:bg-darkOl-cardBg dark:hover:bg-darkOl-bg"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-ol-text dark:text-darkOl-text">
              Editar colaborador
            </h1>
            <p className="text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">
              Atualize as informacoes do colaborador selecionado.
            </p>
          </div>
        </div>
        <OLButton variant="outline" onClick={() => router.push("/dashboard/colaboradores")}>
          Voltar para a lista
        </OLButton>
      </div>

      <EmployeeForm employee={employee} />
    </div>
  )
}
