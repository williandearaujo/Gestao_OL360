import NewEmployeeForm from "@/components/employees/NewEmployeeForm";
import React from "react";

export default function NovoColaboradorPage() {
  return (
    <div className="space-y-8 p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-ol-text dark:text-darkOl-text">
          Adicionar Novo Colaborador
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Preencha os dados básicos para o cadastro rápido.
        </p>
      </header>

      <NewEmployeeForm />
    </div>
  );
}