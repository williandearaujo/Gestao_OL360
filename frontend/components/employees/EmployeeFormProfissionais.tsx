"use client";

import React from "react";

interface Props {
  formData: any;
  errors: Record<string, string>;
  departamentos?: string[];
  niveis?: { value: string; label: string }[];
  tiposContrato?: { value: string; label: string }[];
  statusOptions?: { value: string; label: string }[];
  handleChange: (field: string, value: any) => void;
}

export default function EmployeeFormProfissionais({
  formData,
  errors,
  departamentos = [],
  niveis = [],
  tiposContrato = [],
  statusOptions = [],
  handleChange,
}: Props) {
  const safe = (v: any) => (v === undefined || v === null ? "" : v);

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-medium mb-1 text-ol-black dark:text-ol-white">
          E-mail Corporativo *
        </label>
        <input
          type="email"
          name="email_corporativo"
          value={safe(formData.email_corporativo)}
          onChange={(e) => handleChange("email_corporativo", e.target.value)}
          className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue ${
            errors.email_corporativo ? "border-red-500" : "border-ol-gray"
          }`}
          placeholder="email@empresa.com"
          required
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
          name="cargo"
          value={safe(formData.cargo)}
          onChange={(e) => handleChange("cargo", e.target.value)}
          className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue ${
            errors.cargo ? "border-red-500" : "border-ol-gray"
          }`}
          placeholder="Cargo"
          required
          maxLength={50}
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
          name="departamento"
          value={safe(formData.departamento)}
          onChange={(e) => handleChange("departamento", e.target.value)}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue"
          required
        >
          <option value="">Selecione um departamento</option>
          {departamentos.map((d) => (
            <option key={d} value={d}>
              {d}
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
          name="data_admissao"
          value={safe(formData.data_admissao)}
          onChange={(e) => handleChange("data_admissao", e.target.value)}
          className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue ${
            errors.data_admissao ? "border-red-500" : "border-ol-gray"
          }`}
          required
        />
        {errors.data_admissao && (
          <p className="text-red-600 text-sm mt-1">{errors.data_admissao}</p>
        )}
      </div>

      <div>
        <label className="block font-medium mb-1 text-ol-black dark:text-ol-white">
          Data de Demissão
        </label>
        <input
          type="date"
          name="data_demissao"
          value={safe(formData.data_demissao)}
          onChange={(e) => handleChange("data_demissao", e.target.value)}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue"
        />
      </div>

      <div>
        <label className="block font-medium mb-1 text-ol-black dark:text-ol-white">
          Tipo de Contrato
        </label>
        <select
          name="tipo_contrato"
          value={safe(formData.tipo_contrato)}
          onChange={(e) => handleChange("tipo_contrato", e.target.value)}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue"
        >
          {tiposContrato.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-medium mb-1 text-ol-black dark:text-ol-white">
          Nível
        </label>
        <select
          name="nivel"
          value={safe(formData.nivel)}
          onChange={(e) => handleChange("nivel", e.target.value)}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue"
        >
          {niveis.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-medium mb-1 text-ol-black dark:text-ol-white">
          Status
        </label>
        <select
          name="status"
          value={safe(formData.status)}
          onChange={(e) => handleChange("status", e.target.value)}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue"
        >
          {statusOptions.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-medium mb-1 text-ol-black dark:text-ol-white">
          Salário
        </label>
        <input
          type="number"
          name="salario"
          value={safe(formData.salario) || ""}
          onChange={(e) => handleChange("salario", parseFloat(e.target.value))}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue"
          min={0}
          step={0.01}
          placeholder="Salário"
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
          {/* Data dos gerentes pode ser passada via props se quiser */}
        </select>
      </div>
    </div>
  );
}
