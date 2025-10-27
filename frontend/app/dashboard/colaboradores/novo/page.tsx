import EmployeeForm from "@/components/employees/EmployeeForm"; // MUDANÇA: Importa o formulário unificado
import React from "react";

export default function NovoColaboradorPage() {
  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Adicionar Novo Colaborador
        </h1>
        <p className="mt-2 text-gray-600">
          Preencha os dados abaixo para cadastrar um novo colaborador no sistema.
        </p>
      </header>

      {/* MUDANÇA: Usa o formulário unificado em modo de criação */}
      <EmployeeForm />
    </div>
  );
}
