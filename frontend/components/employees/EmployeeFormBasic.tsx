"use client";

import React from "react";

interface Props {
  formData: any;
  errors: Record<string, string>;
  gerentes: any[];
  departamentos: string[];
  handleChange: (field: string, value: any) => void;
  formatCPF: (value: string) => string;
}

function formatRG(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 9);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2}\.\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{2}\.\d{3}\.\d{3})(\d)/, "$1-$2");
}

export default function EmployeeFormBasic({
  formData,
  errors,
  gerentes,
  departamentos,
  handleChange,
  formatCPF,
}: Props) {
  if (!formData) return <div>Carregando...</div>;

  const safe = (v: any) => (v === undefined || v === null ? "" : v);

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-medium mb-1 text-ol-black dark:text-ol-white">
          Nome Completo *
        </label>
        <input
          type="text"
          value={safe(formData.nome_completo)}
          onChange={(e) => handleChange("nome_completo", e.target.value)}
          placeholder="Nome completo"
          maxLength={80}
          className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue ${
            errors.nome_completo ? "border-red-500" : "border-ol-gray"
          }`}
        />
        {errors.nome_completo && (
          <p className="text-red-600 text-sm mt-1">{errors.nome_completo}</p>
        )}
      </div>

      <div>
        <label className="block font-medium mb-1 text-ol-black dark:text-ol-white">
          CPF *
        </label>
        <input
          type="text"
          value={formatCPF(safe(formData.cpf))}
          onChange={(e) => handleChange("cpf", e.target.value)}
          maxLength={14}
          placeholder="000.000.000-00"
          className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue ${
            errors.cpf ? "border-red-500" : "border-ol-gray"
          }`}
        />
        {errors.cpf && (
          <p className="text-red-600 text-sm mt-1">{errors.cpf}</p>
        )}
      </div>

      <div>
        <label className="block font-medium mb-1 text-ol-black dark:text-ol-white">
          Data de Nascimento *
        </label>
        <input
          type="date"
          value={safe(formData.data_nascimento)}
          onChange={(e) => handleChange("data_nascimento", e.target.value)}
          className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue ${
            errors.data_nascimento ? "border-red-500" : "border-ol-gray"
          }`}
        />
        {errors.data_nascimento && (
          <p className="text-red-600 text-sm mt-1">{errors.data_nascimento}</p>
        )}
      </div>

      <div>
        <label className="block font-medium mb-1 text-ol-black dark:text-ol-white">
          Email Corporativo *
        </label>
        <input
          type="email"
          value={safe(formData.email_corporativo)}
          onChange={(e) => handleChange("email_corporativo", e.target.value)}
          placeholder="email@empresa.com"
          className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue ${
            errors.email_corporativo ? "border-red-500" : "border-ol-gray"
          }`}
        />
        {errors.email_corporativo && (
          <p className="text-red-600 text-sm mt-1">{errors.email_corporativo}</p>
        )}
      </div>

      <div>
        <label className="block font-medium mb-1 text-ol-black dark:text-ol-white">
          Cargo *
        </label>
        <input
          type="text"
          value={safe(formData.cargo)}
          onChange={(e) => handleChange("cargo", e.target.value)}
          maxLength={50}
          placeholder="Cargo"
          className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue ${
            errors.cargo ? "border-red-500" : "border-ol-gray"
          }`}
        />
        {errors.cargo && (
          <p className="text-red-600 text-sm mt-1">{errors.cargo}</p>
        )}
      </div>

      <div>
        <label className="block font-medium mb-1 text-ol-black dark:text-ol-white">
          Departamento *
        </label>
        <select
          value={safe(formData.departamento)}
          onChange={(e) => handleChange("departamento", e.target.value)}
          className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue ${
            errors.departamento ? "border-red-500" : "border-ol-gray"
          }`}
        >
          <option value="">Selecione um departamento</option>
          {Array.isArray(departamentos) ? departamentos.map((dep) => (
            <option key={dep} value={dep}>{dep}</option>
          )) : null}
        </select>
        {errors.departamento && (
          <p className="text-red-600 text-sm mt-1">{errors.departamento}</p>
        )}
      </div>

      <div>
        <label className="block font-medium mb-1 text-ol-black dark:text-ol-white">
          RG
        </label>
        <input
          type="text"
          value={formatRG(safe(formData.rg))}
          onChange={(e) => handleChange("rg", e.target.value)}
          maxLength={12}
          placeholder="00.000.000-0"
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue"
        />
      </div>

      <div>
        <label className="block font-medium mb-1 text-ol-black dark:text-ol-white">
          Gerente (em breve)
        </label>
        <select
          value={safe(formData.manager_id)}
          onChange={(e) => handleChange("manager_id", e.target.value)}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue cursor-not-allowed bg-ol-grayLight"
          disabled
        >
          <option value="">Selecione um gerente</option>
          {gerentes.map((g) => (
            <option key={g.id} value={g.id}>
              {g.nome} - {g.cargo}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-medium mb-1 text-ol-black dark:text-ol-white">
          Data de Admissão *
        </label>
        <input
          type="date"
          value={safe(formData.data_admissao)}
          onChange={(e) => handleChange("data_admissao", e.target.value)}
          className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue ${
            errors.data_admissao ? "border-red-500" : "border-ol-gray"
          }`}
        />
        {errors.data_admissao && (
          <p className="text-red-600 text-sm mt-1">{errors.data_admissao}</p>
        )}
      </div>
    </div>
  );
}
