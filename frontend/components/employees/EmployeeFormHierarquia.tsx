"use client";

import React from "react";

interface Gerente {
  id: string;
  nome: string;
  cargo: string;
}

interface Equipe {
  id: string;
  nome: string;
  departamento: string;
}

interface Props {
  formData: any;
  gerentes: Gerente[];
  equipes: Equipe[];
  handleChange: (field: string, value: any) => void;
}

export default function EmployeeFormHierarquia({
  formData,
  gerentes,
  equipes,
  handleChange,
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block font-medium mb-1 text-ol-black dark:text-ol-white">
          Gerente Direto (em breve)
        </label>
        <select
          name="manager_id"
          value={formData.manager_id || ""}
          onChange={(e) => handleChange("manager_id", e.target.value)}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue cursor-not-allowed bg-ol-grayLight"
          disabled
        >
          <option value="">Nenhum</option>
          {Array.isArray(gerentes) &&
            gerentes.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nome} - {g.cargo}
              </option>
            ))}
        </select>
      </div>

      <div>
        <label className="block font-medium mb-1 text-ol-black dark:text-ol-white">
          Equipe
        </label>
        <select
          name="team_id"
          value={formData.team_id || ""}
          onChange={(e) => handleChange("team_id", e.target.value)}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ol-blue"
        >
          <option value="">Nenhuma</option>
          {Array.isArray(equipes) &&
            equipes.map((equipe) => (
              <option key={equipe.id} value={equipe.id}>
                {equipe.nome}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
}
