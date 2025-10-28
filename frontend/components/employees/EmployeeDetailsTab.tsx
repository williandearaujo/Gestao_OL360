'use client';

import React from 'react';

import { formatCurrency, formatStatus } from '@/lib/format';

interface EmployeeData {
  nome_completo: string;
  email_corporativo: string;
  email_pessoal?: string | null;
  telefone_corporativo?: string | null;
  telefone_pessoal?: string | null;
  contato_emergencia_nome?: string | null;
  contato_emergencia_telefone?: string | null;
  data_nascimento?: string | null;
  data_admissao: string;
  cpf?: string | null;
  rg?: string | null;
  endereco_completo?: string | null;
  cargo?: string | null;
  senioridade?: string | null;
  status?: string | null;
  tipo_cadastro?: string | null;
  salario_atual?: number | null;
  ultima_alteracao_salarial?: string | null;
  observacoes_internas?: string | null;
}

interface EmployeeDetailsTabProps {
  employee: EmployeeData;
}

const DetailField: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
    <dd className="mt-1 text-sm text-ol-text dark:text-darkOl-text sm:col-span-2 sm:mt-0">
      {value ?? 'Nao informado'}
    </dd>
  </div>
);

const EmployeeDetailsTab: React.FC<EmployeeDetailsTabProps> = ({ employee }) => {
  const formatDate = (value?: string | null) => {
    if (!value) return null;
    return new Date(value).toLocaleDateString('pt-BR');
  };

  const tipoCadastroLabel = employee.tipo_cadastro
    ? formatStatus(employee.tipo_cadastro)
    : null;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-ol-border bg-ol-cardBg shadow-sm dark:border-darkOl-border dark:bg-darkOl-cardBg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-ol-text dark:text-darkOl-text">Informacoes pessoais</h3>
        </div>
        <div className="border-t border-ol-border px-4 py-5 dark:border-darkOl-border sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-700">
            <div className="sm:px-6">
              <DetailField label="Nome completo" value={employee.nome_completo} />
              <DetailField label="E-mail pessoal" value={employee.email_pessoal} />
              <DetailField label="Telefone pessoal" value={employee.telefone_pessoal} />
              <DetailField label="Telefone corporativo" value={employee.telefone_corporativo} />
              <DetailField label="Contato de emergencia" value={employee.contato_emergencia_nome} />
              <DetailField
                label="Telefone de emergencia"
                value={employee.contato_emergencia_telefone}
              />
              <DetailField label="Data de nascimento" value={formatDate(employee.data_nascimento)} />
              <DetailField label="Endereco" value={employee.endereco_completo} />
            </div>
          </dl>
        </div>
      </div>

      <div className="rounded-lg border border-ol-border bg-ol-cardBg shadow-sm dark:border-darkOl-border dark:bg-darkOl-cardBg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-ol-text dark:text-darkOl-text">Dados corporativos</h3>
        </div>
        <div className="border-t border-ol-border px-4 py-5 dark:border-darkOl-border sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-700">
            <div className="sm:px-6">
              <DetailField label="E-mail corporativo" value={employee.email_corporativo} />
              <DetailField label="Cargo" value={employee.cargo} />
              <DetailField label="Senioridade" value={employee.senioridade} />
              <DetailField label="Tipo de cadastro" value={tipoCadastroLabel} />
              <DetailField label="Data de admissao" value={formatDate(employee.data_admissao)} />
              <DetailField label="Status" value={formatStatus(employee.status || '')} />
              <DetailField
                label="Salario atual"
                value={
                  employee.salario_atual != null ? formatCurrency(employee.salario_atual) : null
                }
              />
              <DetailField
                label="Ultimo reajuste"
                value={formatDate(employee.ultima_alteracao_salarial)}
              />
            </div>
          </dl>
        </div>
      </div>

      <div className="rounded-lg border border-ol-border bg-ol-cardBg shadow-sm dark:border-darkOl-border dark:bg-darkOl-cardBg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-ol-text dark:text-darkOl-text">Documentos</h3>
        </div>
        <div className="border-t border-ol-border px-4 py-5 dark:border-darkOl-border sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-700">
            <div className="sm:px-6">
              <DetailField label="CPF" value={employee.cpf} />
              <DetailField label="RG" value={employee.rg} />
            </div>
          </dl>
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-ol-border bg-white p-6 shadow-sm dark:border-darkOl-border dark:bg-darkOl-cardBg">
        <h3 className="text-lg font-medium text-ol-text dark:text-darkOl-text">Observacoes internas</h3>
        <p className="mt-3 text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">
          {employee.observacoes_internas?.trim() || 'Nenhuma observacao cadastrada.'}
        </p>
      </div>
    </div>
  );
};

export default EmployeeDetailsTab;
