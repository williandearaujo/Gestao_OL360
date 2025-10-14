"use client";

import React, { useState, useEffect } from "react";

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length > 11) return value;
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3")
      .replace(/-$/, "");
  }
  return digits
    .replace(/^(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3")
    .replace(/-$/, "");
}

function formatRG(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 9);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2}\.\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{2}\.\d{3}\.\d{3})(\d)/, "$1-$2");
}

function validarEmail(value: string) {
  return value ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) : true;
}

function validarCPF(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 11;
}

function validarRG(value: string) {
  if (!value) return true;
  const digits = value.replace(/\D/g, "");
  return digits.length === 8 || digits.length === 9;
}

function validarTelefone(value: string) {
  if (!value) return true;
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 || digits.length === 11;
}

interface Props {
  formData: any;
  errors: Record<string, string>;
  gerentes: any[];
  handleChange: (field: string, value: any) => void;
  formatCPF: (value: string) => string;
}

export default function EmployeeFormPessoais({
  formData,
  errors,
  gerentes,
  handleChange,
  formatCPF,
}: Props) {
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
          Estado Civil
        </label>
        <select
          value={safe(formData.estado_civil)}
          onChange={(e) => handleChange("estado_civil", e.target.value)}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue"
        >
          <option value="SOLTEIRO">Solteiro</option>
          <option value="CASADO">Casado</option>
          <option value="DIVORCIADO">Divorciado</option>
          <option value="VIUVO">Viúvo</option>
        </select>
      </div>

      <div>
        <label className="block font-medium mb-1 text-ol-black dark:text-ol-white">
          Gênero
        </label>
        <select
          value={safe(formData.genero)}
          onChange={(e) => handleChange("genero", e.target.value)}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue"
        >
          <option value="MASCULINO">Masculino</option>
          <option value="FEMININO">Feminino</option>
          <option value="NAO_INFORMADO">Não Informado</option>
        </select>
      </div>

      <div>
        <label className="block font-medium mb-1 text-ol-black dark:text-ol-white">
          Email Pessoal
        </label>
        <input
          type="email"
          value={safe(formData.email_pessoal)}
          onChange={(e) => handleChange("email_pessoal", e.target.value)}
          placeholder="email@exemplo.com"
          className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue ${
            errors.email_pessoal ? "border-red-500" : "border-ol-gray"
          }`}
        />
        {errors.email_pessoal && (
          <p className="text-red-600 text-sm mt-1">{errors.email_pessoal}</p>
        )}
      </div>

      <div>
        <label className="block font-medium mb-1 text-ol-black dark:text-ol-white">
          Telefone Pessoal
        </label>
        <input
          type="tel"
          value={safe(formData.telefone_pessoal)}
          onChange={(e) => handleChange("telefone_pessoal", e.target.value)}
          placeholder="(00) 00000-0000"
          className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue ${
            errors.telefone_pessoal ? "border-red-500" : "border-ol-gray"
          }`}
        />
        {errors.telefone_pessoal && (
          <p className="text-red-600 text-sm mt-1">{errors.telefone_pessoal}</p>
        )}
      </div>

      <div>
        <label className="block font-medium mb-1 text-ol-black dark:text-ol-white">
          Telefone Corporativo
        </label>
        <input
          type="tel"
          value={safe(formData.telefone_corporativo)}
          onChange={(e) => handleChange("telefone_corporativo", e.target.value)}
          placeholder="(00) 00000-0000"
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
    </div>
  );
}
