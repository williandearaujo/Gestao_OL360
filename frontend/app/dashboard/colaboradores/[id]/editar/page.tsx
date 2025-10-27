"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, UserCog, Loader2 } from "lucide-react";
import { Tab } from "@headlessui/react";
import OLButton from "@/components/ui/OLButton";
import EmployeeFormPessoais from "@/components/employees/EmployeeFormPessoais";
import EmployeeFormProfissionais from "@/components/employees/EmployeeFormProfissionais";
import EmployeeFormEndereco from "@/components/employees/EmployeeFormEndereco";
import EmployeeFormFinanceiro from "@/components/employees/EmployeeFormFinanceiro";
import EmployeeFormEmergencia from "@/components/employees/EmployeeFormEmergencia";
import EmployeeFormHierarquia from "@/components/employees/EmployeeFormHierarquia";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function EmployeeEditPage() {
  const params = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    loadEmployee();
  }, [params.id]);

  async function loadEmployee() {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/employees/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erro ao carregar colaborador");
      const data = await res.json();
      const employee = data.data ?? data;

      console.log("Dados originais recebidos:", employee);

      // converte para nomes esperados pelos forms
      const mapped = {
        nome_completo: employee.nome || "",
        cpf: employee.cpf || "",
        rg: employee.rg || "",
        data_nascimento: employee.data_nascimento || "",
        estado_civil: employee.estado_civil || "",
        email_pessoal: employee.email_pessoal || employee.email || "",
        telefone_pessoal: employee.telefone_pessoal || employee.telefone || "",
        telefone_corporativo: employee.telefone_corporativo || "",
        data_admissao: employee.data_admissao || "",
        cargo: employee.cargo || "",
        departamento: employee.departamento || "",
        salario: employee.salario?.toString() || "",
        genero: employee.genero || "",
        status: employee.status || "",
        endereco: employee.endereco || "",
        manager_id: employee.manager_id || "",
        // inclua outros campos conforme necessário
      };

      setFormData(mapped);
      console.log("Dados mapeados para o form:", mapped);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar colaborador");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");

      // Limpa formatações antes de enviar
      const payload = {
        ...formData,
        cpf: formData.cpf?.replace(/\D/g, "") || "",
        rg: formData.rg?.replace(/\D/g, "") || "",
        telefone_pessoal: formData.telefone_pessoal?.replace(/\D/g, "") || "",
        telefone_corporativo: formData.telefone_corporativo?.replace(/\D/g, "") || "",
        // Adicione limpeza de outros campos com máscara conforme necessário
      };

      const res = await fetch(`${API_URL}/employees/${params.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao salvar alterações");

      router.push("/dashboard/colaboradores");
    } catch (err: any) {
      setError(err.message || "Erro ao salvar dados");
    } finally {
      setSaving(false);
    }
  }

  function handleChange(field: string, value: any) {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  }

  function formatCPF(value: string) {
    if (!value) return "";
    const digits = value.replace(/\D/g, "").slice(0, 11);
    return digits
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3}\.\d{3})(\d)/, "$1.$2")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  }

  const tabs = [
    { label: "Pessoais", Component: EmployeeFormPessoais },
    { label: "Profissionais", Component: EmployeeFormProfissionais },
    { label: "Endereço", Component: EmployeeFormEndereco },
    { label: "Financeiro", Component: EmployeeFormFinanceiro },
    { label: "Emergência", Component: EmployeeFormEmergencia },
    { label: "Hierarquia", Component: EmployeeFormHierarquia },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-ol-bg dark:bg-darkOl-bg flex flex-col justify-center items-center">
        <Loader2 className="w-10 h-10 text-ol-primary dark:text-darkOl-primary animate-spin mb-3" />
        <p className="text-ol-text dark:text-darkOl-text">Carregando colaborador...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ol-bg dark:bg-darkOl-bg p-6">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-ol-grayLight dark:hover:bg-darkOl-grayLight rounded-md transition"
            >
              <ArrowLeft className="w-5 h-5 text-ol-primary dark:text-darkOl-primary" />
            </button>
            <h1 className="text-3xl font-bold text-ol-primary dark:text-darkOl-primary flex items-center gap-2">
              <UserCog className="w-7 h-7" />
              Editar Colaborador
            </h1>
          </div>
          <OLButton
            variant="primary"
            iconLeft={<ArrowLeft className="w-5 h-5" />}
            onClick={() => router.push("/dashboard/colaboradores")}
          >
            Voltar à lista
          </OLButton>
        </div>

        {/* Abas de Formulários */}
        <div className="bg-white dark:bg-darkOl-cardBg border border-ol-border dark:border-darkOl-border rounded-lg shadow-lg">
          <Tab.Group>
            <Tab.List className="flex space-x-4 border-b border-ol-border dark:border-darkOl-border bg-ol-cardHeaderBg dark:bg-darkOl-cardHeaderBg p-3 rounded-t-lg">
              {tabs.map((tab) => (
                <Tab
                  key={tab.label}
                  className={({ selected }) =>
                    classNames(
                      "px-4 py-2 text-sm font-medium rounded-md focus:outline-none transition-colors",
                      selected
                        ? "bg-ol-primary text-white dark:bg-darkOl-primary"
                        : "text-ol-text dark:text-darkOl-text hover:bg-ol-grayLight dark:hover:bg-darkOl-grayLight"
                    )
                  }
                >
                  {tab.label}
                </Tab>
              ))}
            </Tab.List>

            <Tab.Panels className="p-6">
              {tabs.map(({ Component, label }) => (
                <Tab.Panel key={label}>
                  <Component
                    formData={formData}
                    errors={{}}
                    gerentes={[]}
                    handleChange={handleChange}
                    formatCPF={formatCPF}
                  />
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </div>

        {/* Erros */}
        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Botões */}
        <div className="flex justify-end gap-4 mt-8">
          <OLButton
            variant="secondary"
            onClick={() => router.back()}
            disabled={saving}
          >
            Cancelar
          </OLButton>
          <OLButton
            variant="primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Salvando..." : "Salvar Alterações"}
          </OLButton>
        </div>
      </div>
    </div>
  );
}
