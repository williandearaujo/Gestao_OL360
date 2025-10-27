'use client';

import React from 'react';

// Define a interface para os dados do colaborador que o componente espera
interface EmployeeData {
  nome_completo: string;
  email_corporativo: string;
  email_pessoal?: string | null;
  telefone_pessoal?: string | null;
  data_nascimento?: string | null;
  data_admissao: string;
  cpf?: string | null;
  rg?: string | null;
  endereco_completo?: string | null;
  cargo?: string | null;
  senioridade?: string | null;
  status?: string | null;
}

interface EmployeeDetailsTabProps {
  employee: EmployeeData;
}

// Componente para renderizar um campo de detalhe, agora com melhor espaçamento
const DetailField: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
    <dd className="mt-1 text-sm text-ol-text dark:text-darkOl-text sm:mt-0 sm:col-span-2">{value || 'Não informado'}</dd>
  </div>
);

// Componente principal da aba de detalhes, agora com layout de cartões
const EmployeeDetailsTab: React.FC<EmployeeDetailsTabProps> = ({ employee }) => {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  return (
    <div className="animate-fadeIn space-y-6">
      
      {/* Card: Informações Pessoais */}
      <div className="bg-ol-cardBg dark:bg-darkOl-cardBg border border-ol-border dark:border-darkOl-border rounded-lg shadow-sm">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-ol-text dark:text-darkOl-text">
            Informações Pessoais
          </h3>
        </div>
        <div className="border-t border-ol-border dark:border-darkOl-border px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-700">
            <div className="sm:px-6">
              <DetailField label="Nome Completo" value={employee.nome_completo} />
              <DetailField label="E-mail Pessoal" value={employee.email_pessoal} />
              <DetailField label="Telefone Pessoal" value={employee.telefone_pessoal} />
              <DetailField label="Data de Nascimento" value={formatDate(employee.data_nascimento)} />
            </div>
          </dl>
        </div>
      </div>

      {/* Card: Dados Corporativos */}
      <div className="bg-ol-cardBg dark:bg-darkOl-cardBg border border-ol-border dark:border-darkOl-border rounded-lg shadow-sm">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-ol-text dark:text-darkOl-text">
            Dados Corporativos
          </h3>
        </div>
        <div className="border-t border-ol-border dark:border-darkOl-border px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-700">
            <div className="sm:px-6">
              <DetailField label="E-mail Corporativo" value={employee.email_corporativo} />
              <DetailField label="Cargo" value={employee.cargo} />
              <DetailField label="Senioridade" value={employee.senioridade} />
              <DetailField label="Data de Admissão" value={formatDate(employee.data_admissao)} />
              <DetailField label="Status" value={employee.status} />
            </div>
          </dl>
        </div>
      </div>

      {/* Card: Documentos */}
      <div className="bg-ol-cardBg dark:bg-darkOl-cardBg border border-ol-border dark:border-darkOl-border rounded-lg shadow-sm">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-ol-text dark:text-darkOl-text">
            Documentos
          </h3>
        </div>
        <div className="border-t border-ol-border dark:border-darkOl-border px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-700">
            <div className="sm:px-6">
              <DetailField label="CPF" value={employee.cpf} />
              <DetailField label="RG" value={employee.rg} />
            </div>
          </dl>
        </div>
      </div>

    </div>
  );
};

export default EmployeeDetailsTab;