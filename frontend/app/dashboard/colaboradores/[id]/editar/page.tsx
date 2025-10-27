'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import EmployeeForm from "@/components/employees/EmployeeForm";
import { getEmployeeById } from '@/lib/api';

// A página de edição que busca os dados e passa para o formulário
export default function EditarColaboradorPage() {
  const params = useParams();
  const id = params.id as string;

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      getEmployeeById(id)
        .then(data => {
          setEmployee(data);
        })
        .catch(() => {
          setError("Não foi possível carregar os dados do colaborador para edição.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-ol-text dark:text-darkOl-text">
          Editar Colaborador
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Altere os dados necessários e salve as modificações.
        </p>
      </header>

      {loading && <p>Carregando formulário...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && employee && (
        <EmployeeForm employeeId={id} initialData={employee} />
      )}
    </div>
  );
}
