'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import DayOffScheduleModal from '@/components/employees/DayOffScheduleModal';
import EmployeeDetailsTab from '@/components/employees/EmployeeDetailsTab';
import EmployeeNotesPanel, { EmployeeNote } from '@/components/employees/EmployeeNotesPanel';
import EmployeeOneOnOnePanel from '@/components/employees/EmployeeOneOnOnePanel';
import EmployeePdiPanel from '@/components/employees/EmployeePdiPanel';
import EmployeeSalaryHistoryPanel, {
  EmployeeSalaryHistoryEntry,
} from '@/components/employees/EmployeeSalaryHistoryPanel';
import EmployeeVacationPanel from '@/components/employees/EmployeeVacationPanel';
import { getDayOffs, getEmployeeById } from '@/lib/api';

interface EmployeeData {
  id: string;
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
  notes?: EmployeeNote[];
  salary_history?: EmployeeSalaryHistoryEntry[];
}

interface DayOffData {
  id: string | number;
  date: string;
  status: string;
}

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Erro inesperado.';

const DayOffTab: React.FC<{
  employee: EmployeeData;
  initialDayOffs: DayOffData[];
}> = ({ employee, initialDayOffs }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dayOffs, setDayOffs] = useState(initialDayOffs);

  const birthLabel = employee.data_nascimento
    ? new Date(employee.data_nascimento).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
      })
    : 'Data de nascimento nao informada';

  const handleSuccess = (newDayOff: DayOffData) => {
    setDayOffs((prev) =>
      [...prev, newDayOff].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-ol-border bg-white p-6 shadow-sm dark:border-darkOl-border dark:bg-darkOl-cardBg">
        <h3 className="text-lg font-semibold text-ol-text dark:text-darkOl-text">Gestao de Day Off</h3>
        <p className="mt-2 text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">
          Aniversario do colaborador: {birthLabel}
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-4 inline-flex rounded-md bg-ol-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-ol-hover dark:bg-darkOl-primary dark:text-darkOl-black dark:hover:bg-darkOl-hover"
        >
          Agendar Day Off
        </button>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-ol-text dark:text-darkOl-text">
          Historico de agendamentos
        </h4>
        {dayOffs.length === 0 ? (
          <p className="rounded-lg border border-dashed border-ol-border p-4 text-sm text-ol-grayMedium dark:border-darkOl-border dark:text-darkOl-grayMedium">
            Nenhum registro encontrado.
          </p>
        ) : (
          <ul className="space-y-2 rounded-lg border border-ol-border p-4 text-sm dark:border-darkOl-border">
            {dayOffs.map((item) => (
              <li key={item.id} className="flex items-center justify-between">
                <span>{new Date(item.date).toLocaleDateString('pt-BR')}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${
                    item.status === 'AGENDADO'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200'
                  }`}
                >
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {employee.data_nascimento && (
        <DayOffScheduleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onScheduled={handleSuccess}
          employeeId={employee.id}
          employeeBirthDate={employee.data_nascimento}
        />
      )}
    </div>
  );
};

const EmployeeDetailPage = () => {
  const params = useParams();
  const employeeId = params.id as string;

  const [activeTab, setActiveTab] = useState('details');
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [dayOffs, setDayOffs] = useState<DayOffData[]>([]);
  const [notes, setNotes] = useState<EmployeeNote[]>([]);
  const [salaryHistory, setSalaryHistory] = useState<EmployeeSalaryHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!employeeId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [employeeData, dayOffsData] = await Promise.all([
          getEmployeeById(employeeId),
          getDayOffs(employeeId),
        ]);
        setEmployee(employeeData);
        setDayOffs(dayOffsData ?? []);
        setNotes(employeeData.notes ?? []);
        setSalaryHistory(employeeData.salary_history ?? []);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [employeeId]);

  if (loading) {
    return <div className="p-8 text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">Carregando...</div>;
  }

  if (error) {
    return <div className="p-8 text-sm text-red-500">{error}</div>;
  }

  if (!employee) {
    return (
      <div className="p-8 text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">
        Colaborador nao encontrado.
      </div>
    );
  }

  const tabs = [
    { id: 'details', label: 'Visao geral' },
    { id: 'notes', label: 'Observacoes' },
    { id: 'salary', label: 'Historico salarial' },
    { id: 'day-off', label: 'Day Off' },
    { id: 'vacation', label: 'Ferias' },
    { id: 'pdi', label: 'PDI' },
    { id: 'one-on-one', label: '1x1' },
  ];

  return (
    <div className="p-4 md:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-ol-text dark:text-darkOl-text">
          {employee.nome_completo}
        </h1>
        <p className="text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">
          {employee.cargo || 'Cargo nao informado'}
        </p>
      </header>

      <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-2 py-4 text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'border-ol-primary text-ol-text dark:border-darkOl-primary dark:text-darkOl-text'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'details' && <EmployeeDetailsTab employee={employee} />}

        {activeTab === 'notes' && (
          <EmployeeNotesPanel
            employeeId={employeeId}
            notes={notes}
            onNoteAdded={(note) => setNotes((prev) => [note, ...prev])}
          />
        )}

        {activeTab === 'salary' && (
          <EmployeeSalaryHistoryPanel
            employeeId={employeeId}
            history={salaryHistory}
            onEntryAdded={(entry) => setSalaryHistory((prev) => [entry, ...prev])}
          />
        )}

        {activeTab === 'day-off' && <DayOffTab employee={employee} initialDayOffs={dayOffs} />}

        {activeTab === 'vacation' && <EmployeeVacationPanel employeeId={employeeId} />}

        {activeTab === 'pdi' && <EmployeePdiPanel employeeId={employeeId} />}

        {activeTab === 'one-on-one' && <EmployeeOneOnOnePanel employeeId={employeeId} />}
      </div>
    </div>
  );
};

export default EmployeeDetailPage;
