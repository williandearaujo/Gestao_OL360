"use client";

import React from "react";

interface Props {
  formData: any;
  handleChange: (field: string, value: any) => void;
}

export default function EmployeeFormEmergencia({ formData, handleChange }: Props) {
  const safe = (v: any) => (v === undefined || v === null ? "" : v);

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-medium mb-1 text-ol-black dark:text-ol-white">
          Nome do Contato de Emergência
        </label>
        <input
          type="text"
          name="contato_emergencia_nome"
          value={safe(formData.contato_emergencia_nome)}
          onChange={(e) => handleChange("contato_emergencia_nome", e.target.value)}
          placeholder="Nome do contato"
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue"
          maxLength={80}
        />
      </div>

      <div>
        <label className="block font-medium mb-1 text-ol-black dark:text-ol-white">
          Telefone de Emergência
        </label>
        <input
          type="tel"
          name="contato_emergencia_telefone"
          value={safe(formData.contato_emergencia_telefone)}
          onChange={(e) => handleChange("contato_emergencia_telefone", e.target.value)}
          placeholder="(00) 00000-0000"
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue"
          maxLength={15}
        />
      </div>

      <div>
        <label className="block font-medium mb-1 text-ol-black dark:text-ol-white">
          Parentesco
        </label>
        <input
          type="text"
          name="contato_emergencia_parentesco"
          value={safe(formData.contato_emergencia_parentesco)}
          onChange={(e) => handleChange("contato_emergencia_parentesco", e.target.value)}
          placeholder="Parentesco"
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue"
          maxLength={50}
        />
      </div>
    </div>
  );
}
