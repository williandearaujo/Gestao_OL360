"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import EmployeeFormComplete from "@/components/employees/EmployeeFormComplete";

import type { Colaborador, Gerente, Equipe } from "@/components/employees/EmployeeFormComplete";

export default function EditarColaboradorPage() {
  const router = useRouter();
  const params = useParams();
  const [gerentes, setGerentes] = useState<Gerente[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [colaborador, setColaborador] = useState<Colaborador | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const token = localStorage.getItem("token");
        const [resColab, resGerentes, resEquipes] = await Promise.all([
          fetch(`${API_URL}/employees/${params.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/managers`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/teams`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const colabData = await resColab.json();
        const gerentesData = await resGerentes.json();
        const equipesData = await resEquipes.json();
        setColaborador(colabData.data || colabData);
        setGerentes(gerentesData.data || gerentesData);
        setEquipes(equipesData.data || equipesData);
      } catch (error) {
        alert("Erro ao carregar dados para edição");
      }
    }
    loadData();
  }, [params.id]);

  const handleSave = async (updatedColaborador: Colaborador) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/employees/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedColaborador),
    });
    if (!response.ok) {
      throw new Error("Erro ao atualizar colaborador");
    }
  };

  if (!colaborador) {
    return <p>Carregando dados do colaborador...</p>;
  }

  return (
    <EmployeeFormComplete
      employee={colaborador}
      onSave={handleSave}
      onCancel={() => router.back()}
      gerentes={gerentes}
      equipes={equipes}
    />
  );
}
