"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Briefcase,
  MapPin,
  DollarSign,
  Users,
  Shield,
} from "lucide-react";

import EmployeeFormPessoais from "./EmployeeFormPessoais";
import EmployeeFormProfissionais from "./EmployeeFormProfissionais";
import EmployeeFormEndereco from "./EmployeeFormEndereco";
import EmployeeFormFinanceiro from "./EmployeeFormFinanceiro";
import EmployeeFormHierarquia from "./EmployeeFormHierarquia";
import EmployeeFormEmergencia from "./EmployeeFormEmergencia";

interface Colaborador {
  nome_completo: string;
  cpf: string;
  rg?: string;
  data_nascimento: string;
  estado_civil: string;
  genero: string;
  email_pessoal?: string;
  telefone_pessoal?: string;
  telefone_corporativo?: string;

  email_corporativo: string;
  cargo: string;
  departamento: string;
  data_admissao: string;
  data_demissao?: string;
  salario?: number;
  tipo_contrato: string;
  nivel: string;
  status: string;

  endereco_cep?: string;
  endereco_logradouro?: string;
  endereco_numero?: string;
  endereco_complemento?: string;
  endereco_bairro?: string;
  endereco_cidade?: string;
  endereco_estado?: string;

  banco?: string;
  agencia?: string;
  conta?: string;
  pix?: string;

  // Removido manager_id para não usar temporariamente
  // manager_id?: string;
  team_id?: string;

  contato_emergencia_nome?: string;
  contato_emergencia_telefone?: string;
  contato_emergencia_parentesco?: string;
}

interface EmployeeFormProps {
  employee?: Colaborador;
  onSave: (employee: Colaborador) => Promise<void>;
  onCancel: () => void;
  gerentes: any[];
  equipes: any[];
  departamentos: string[];
  niveis: { value: string; label: string }[];
  tiposContrato: { value: string; label: string }[];
  statusOptions: { value: string; label: string }[];
}

export default function EmployeeFormComplete({
  employee,
  onSave,
  onCancel,
  gerentes,
  equipes,
  departamentos,
  niveis,
  tiposContrato,
  statusOptions,
}: EmployeeFormProps) {
  const camposIniciais: Colaborador = {
    nome_completo: "",
    cpf: "",
    rg: "",
    data_nascimento: "",
    estado_civil: "SOLTEIRO",
    genero: "NAO_INFORMADO",
    email_pessoal: "",
    telefone_pessoal: "",
    telefone_corporativo: "",

    email_corporativo: "",
    cargo: "",
    departamento: "",
    data_admissao: "",
    data_demissao: "",
    salario: undefined,
    tipo_contrato: "CLT",
    nivel: "JUNIOR",
    status: "ATIVO",

    endereco_cep: "",
    endereco_logradouro: "",
    endereco_numero: "",
    endereco_complemento: "",
    endereco_bairro: "",
    endereco_cidade: "",
    endereco_estado: "",

    banco: "",
    agencia: "",
    conta: "",
    pix: "",

    // Não inclui manager_id aqui
    team_id: "",

    contato_emergencia_nome: "",
    contato_emergencia_telefone: "",
    contato_emergencia_parentesco: "",
  };

  const [formData, setFormData] = useState<Colaborador>(camposIniciais);
  const [activeTab, setActiveTab] = useState<string>("pessoais");
  const [saving, setSaving] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (employee) {
      // Se existir manager_id, não inclui
      const { manager_id, ...rest } = employee;
      setFormData({
        ...camposIniciais,
        ...rest,
        salario: employee.salario === null ? undefined : employee.salario,
      });
    }
  }, [employee]);

  const handleChange = (field: keyof Colaborador, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const formatCPF = (value: string) =>
    value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nome_completo) newErrors.nome_completo = "Nome obrigatório";
    if (!formData.cpf || formData.cpf.replace(/\D/g, "").length !== 11)
      newErrors.cpf = "CPF inválido";
    if (
      formData.email_pessoal &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_pessoal)
    )
      newErrors.email_pessoal = "Email inválido";
    if (
      formData.telefone_pessoal &&
      !/^(\d{10}|\d{11})$/.test(formData.telefone_pessoal.replace(/\D/g, ""))
    )
      newErrors.telefone_pessoal = "Telefone inválido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      alert("Corrija os campos obrigatórios");
      return;
    }
    setSaving(true);
    try {
      // Remove manager_id se estiver no formData por segurança
      const { manager_id, ...payload } = formData as any;

      await onSave(payload);
    } catch {
      alert("Erro ao salvar colaborador");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-ol-white dark:bg-darkOl-bg rounded-2xl border border-ol-border shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* HEADER DO MODAL */}
        <div className="bg-gradient-to-r from-ol-primary to-ol-light text-white p-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold">
              {employee ? "Editar Colaborador" : "Novo Colaborador"}
            </h2>
            <p className="text-sm text-white/80 mt-1">
              Preencha os dados nas abas abaixo
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-ol-hover transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TABS */}
        <nav className="flex border-b border-ol-grayLight bg-ol-bg text-ol-black dark:text-darkOl-white">
          {[
            { id: "pessoais", label: "Dados Pessoais", icon: User },
            { id: "profissionais", label: "Dados Profissionais", icon: Briefcase },
            { id: "endereco", label: "Endereço", icon: MapPin },
            { id: "financeiro", label: "Financeiro", icon: DollarSign },
            { id: "hierarquia", label: "Hierarquia", icon: Users },
            { id: "emergencia", label: "Emergência", icon: Shield },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1 px-4 py-2 border-b-4 -mb-px transition-colors text-sm font-medium ${
                activeTab === id
                  ? "border-ol-primary text-ol-primary bg-ol-bg"
                  : "border-transparent hover:border-ol-primary/60 hover:text-ol-primary/90"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>

        {/* CONTEÚDO DA ABA ATIVA */}
        <form
          id="form-colaborador"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto bg-ol-bg p-4 sm:p-6"
        >
          {activeTab === "pessoais" && (
            <EmployeeFormPessoais
              formData={formData}
              errors={errors}
              gerentes={gerentes}
              equipes={equipes}
              handleChange={handleChange}
              formatCPF={formatCPF}
              onCancel={onCancel} // Opcional, pode retirar se não usar
            />
          )}
          {activeTab === "profissionais" && (
            <EmployeeFormProfissionais
              formData={formData}
              errors={errors}
              departamentos={departamentos}
              niveis={niveis}
              tiposContrato={tiposContrato}
              statusOptions={statusOptions}
              handleChange={handleChange}
            />
          )}
          {activeTab === "endereco" && (
            <EmployeeFormEndereco
              formData={formData}
              estados={[]} // passe seus estados aqui
              handleChange={handleChange}
              formatCEP={(value) => value} // implemente se necessário
            />
          )}
          {activeTab === "financeiro" && (
            <EmployeeFormFinanceiro formData={formData} handleChange={handleChange} />
          )}
          {activeTab === "hierarquia" && (
            <EmployeeFormHierarquia
              formData={formData}
              gerentes={gerentes}
              equipes={equipes}
              handleChange={handleChange}
              // Opcional: se quiser, pode ocultar visualmente o gerente no EmployeeFormHierarquia
            />
          )}
          {activeTab === "emergencia" && (
            <EmployeeFormEmergencia formData={formData} handleChange={handleChange} />
          )}

          {/* FOOTER DE AÇÕES */}
          <div className="flex justify-end gap-3 pt-4 border-t border-ol-grayLight dark:border-darkOl-grayLight">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-ol-grayLight rounded-lg hover:bg-ol-grayLight hover:text-ol-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-ol-primary rounded-lg text-white hover:bg-ol-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Salvar"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
