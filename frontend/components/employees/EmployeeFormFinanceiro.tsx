"use client";

import React from "react";

interface Props {
  formData: any;
  handleChange: (field: string, value: any) => void;
}

export default function EmployeeFormFinanceiro({ formData, handleChange }: Props) {
  const safe = (v: any) => (v === undefined || v === null ? "" : v);

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-medium mb-1 text-ol-black dark:text-ol-white">
          Banco
        </label>
        <input
          type="text"
          name="banco"
          value={safe(formData.banco)}
          onChange={(e) => handleChange("banco", e.target.value)}
          placeholder="Nome do banco"
          maxLength={50}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue"
        />
      </div>

      <div>
        <label className="block font-medium mb-1 text-ol-black dark:text-ol-white">
          Agência
        </label>
        <input
          type="text"
          name="agencia"
          value={safe(formData.agencia)}
          onChange={(e) => handleChange("agencia", e.target.value)}
          placeholder="0000"
          maxLength={10}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue"
        />
      </div>

      <div>
        <label className="block font-medium mb-1 text-ol-black dark:text-ol-white">
          Conta
        </label>
        <input
          type="text"
          name="conta"
          value={safe(formData.conta)}
          onChange={(e) => handleChange("conta", e.target.value)}
          placeholder="Número da conta"
          maxLength={20}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue"
        />
      </div>

      <div>
        <label className="block font-medium mb-1 text-ol-black dark:text-ol-white">
          Pix
        </label>
        <input
          type="text"
          name="pix"
          value={safe(formData.pix)}
          onChange={(e) => handleChange("pix", e.target.value)}
          placeholder="Chave Pix"
          maxLength={50}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue"
        />
      </div>
    </div>
  );
}
