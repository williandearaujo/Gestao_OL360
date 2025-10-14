"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import EmployeeFormBasic from "@/components/employees/EmployeeFormBasic";

interface ColaboradorBasic {
  nome_completo: string;
  cpf: string;
  rg?: string;
  manager_id?: string;
  data_nascimento: string;
  cargo: string;
  data_admissao: string;
  email_corporativo: string;
  telefone_corporativo?: string;
  user_id?: string;
  telefone_pessoal?: string;
  pix?: string;
  estado_civil: string;
  email_pessoal?: string;
  endereco?: string;
  departamento: string;
  salario?: number;
  status: string;
}

interface Gerente {
  id: string;
  nome: string;
  cargo: string;
}

const cleanString = (value: string | undefined) => {
  if (!value) return "";
  return value.replace(/\D/g, "");
};

export default function NovoColaboradorPage() {
  const router = useRouter();

  const [gerentes, setGerentes] = useState<Gerente[]>([]);
  const [departamentos, setDepartamentos] = useState<string[]>([]);

  const [formData, setFormData] = useState<ColaboradorBasic>({
    nome_completo: "",
    cpf: "",
    rg: "",
    manager_id: "",
    data_nascimento: "",
    cargo: "",
    data_admissao: "",
    email_corporativo: "",
    telefone_corporativo: "",
    user_id: "",
    telefone_pessoal: "",
    pix: "",
    estado_civil: "SOLTEIRO",
    email_pessoal: "",
    endereco: "",
    departamento: "",
    salario: 0,
    status: "ATIVO",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadGerentes() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/managers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setGerentes(data.data || data);
      } catch {
        alert("Erro ao carregar gerentes");
      }
    }

     function loadDepartamentos() {
    // lista fixa temporária até API ficar pronta
    setDepartamentos([
      "TI",
      "Financeiro",
      "Recursos Humanos",
      "Administrativo",
      "Comercial",
    ]);
  }

    loadGerentes();
    loadDepartamentos();
  }, []);

  const formatCPF = (value: string) =>
    value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");

  const handleChange = (field: keyof ColaboradorBasic, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateCPF = (cpf: string) => {
    const cleaned = cleanString(cpf);
    return cleaned.length === 11;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nome_completo) newErrors.nome_completo = "Nome obrigatório";
    if (!formData.cpf) newErrors.cpf = "CPF obrigatório";
    else if (!validateCPF(formData.cpf)) newErrors.cpf = "CPF inválido";
    if (!formData.data_nascimento) newErrors.data_nascimento = "Data de nascimento obrigatória";
    if (!formData.cargo) newErrors.cargo = "Cargo obrigatório";
    if (!formData.data_admissao) newErrors.data_admissao = "Data de admissão obrigatória";
    if (!formData.email_corporativo) newErrors.email_corporativo = "Email corporativo obrigatório";
    if (!formData.departamento) newErrors.departamento = "Departamento obrigatório";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = localStorage.getItem("token");
      const payload = {
        nome_completo: formData.nome_completo,
        cpf: cleanString(formData.cpf),
        data_nascimento: formData.data_nascimento,
        cargo: formData.cargo,
        data_admissao: formData.data_admissao,
        email_corporativo: formData.email_corporativo,
        estado_civil: formData.estado_civil,
        email_pessoal: formData.email_pessoal,
        endereco: formData.endereco,
        departamento: formData.departamento,
        salario: formData.salario,
        status: formData.status,
        ...(formData.rg ? { rg: cleanString(formData.rg) } : {}),
        ...(formData.manager_id ? { manager_id: formData.manager_id } : {}),
        ...(formData.telefone_corporativo ? { telefone_corporativo: cleanString(formData.telefone_corporativo) } : {}),
        ...(formData.user_id ? { user_id: formData.user_id } : {}),
        ...(formData.telefone_pessoal ? { telefone_pessoal: cleanString(formData.telefone_pessoal) } : {}),
        ...(formData.pix ? { pix: cleanString(formData.pix) } : {}),
      };

      const response = await fetch(`${API_URL}/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro na API:", errorData);
        throw new Error(
          errorData.detail ? JSON.stringify(errorData.detail) : "Erro ao criar colaborador"
        );
      }
      router.back();

    } catch (error: any) {
      alert(error.message || "Erro ao criar colaborador");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }}
      className="space-y-4"
    >
      <EmployeeFormBasic
        formData={formData}
        errors={errors}
        gerentes={gerentes}
        departamentos={departamentos}
        handleChange={handleChange}
        formatCPF={formatCPF}
      />
      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={handleCancel}
          className="px-5 py-2 border border-ol-grayLight rounded-lg hover:bg-ol-grayLight hover:text-ol-white transition-colors"
          disabled={saving}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-5 py-2 bg-ol-primary rounded-lg text-white hover:bg-ol-primary-dark transition-colors"
          disabled={saving}
        >
          {saving ? "Salvando..." : "Cadastrar"}
        </button>
      </div>
    </form>
  );
}
