"use client";

import React from "react";

interface Props {
  formData: any;
  estados: string[];
  handleChange: (field: string, value: any) => void;
  formatCEP: (value: string) => string;
}

export default function EmployeeFormEndereco({
  formData,
  estados,
  handleChange,
  formatCEP,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>
          <label className="block font-medium mb-1 text-ol-black dark:text-ol-white">
            CEP
          </label>
          <input
            type="text"
            name="endereco_cep"
            value={formData.endereco_cep || ""}
            onChange={(e) => handleChange("endereco_cep", formatCEP(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue"
            placeholder="00000-000"
            maxLength={9}
          />
        </div>

        <div>
          <label className="block font-medium mb-1 text-ol-black dark:text-ol-white">
            Logradouro
          </label>
          <input
            type="text"
            name="endereco_logradouro"
            value={formData.endereco_logradouro || ""}
            onChange={(e) => handleChange("endereco_logradouro", e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue"
            placeholder="Rua, Avenida, etc."
            maxLength={100}
          />
        </div>

        <div>
          <label className="block font-medium mb-1 text-ol-black dark:text-ol-white">
            Número
          </label>
          <input
            type="text"
            name="endereco_numero"
            value={formData.endereco_numero || ""}
            onChange={(e) => handleChange("endereco_numero", e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue"
            placeholder="123"
            maxLength={10}
          />
        </div>

        <div>
          <label className="block font-medium mb-1 text-ol-black dark:text-ol-white">
            Complemento
          </label>
          <input
            type="text"
            name="endereco_complemento"
            value={formData.endereco_complemento || ""}
            onChange={(e) => handleChange("endereco_complemento", e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue"
            placeholder="Apto, Bloco, etc."
            maxLength={50}
          />
        </div>

        <div>
          <label className="block font-medium mb-1 text-ol-black dark:text-ol-white">
            Bairro
          </label>
          <input
            type="text"
            name="endereco_bairro"
            value={formData.endereco_bairro || ""}
            onChange={(e) => handleChange("endereco_bairro", e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue"
            placeholder="Nome do bairro"
            maxLength={50}
          />
        </div>

        <div>
          <label className="block font-medium mb-1 text-ol-black dark:text-ol-white">
            Cidade
          </label>
          <input
            type="text"
            name="endereco_cidade"
            value={formData.endereco_cidade || ""}
            onChange={(e) => handleChange("endereco_cidade", e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue"
            placeholder="Nome da cidade"
            maxLength={50}
          />
        </div>

        <div>
          <label className="block font-medium mb-1 text-ol-black dark:text-ol-white">
            Estado
          </label>
          <select
            name="endereco_estado"
            value={formData.endereco_estado || ""}
            onChange={(e) => handleChange("endereco_estado", e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue"
          >
            <option value="">Selecione...</option>
            {estados.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
