'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DayOffScheduleModal from '@/components/employees/DayOffScheduleModal';
import { getEmployeeById, getDayOffs } from '@/lib/api';
import EmployeeDetailsTab from '@/components/employees/EmployeeDetailsTab'; // Importado

// Interfaces para os dados da API
interface EmployeeData {
  id: string;
  nome_completo: string;
  data_nascimento: string; 
  email_corporativo: string;
  email_pessoal?: string | null;
  telefone_pessoal?: string | null;
  data_admissao: string;
  cpf?: string | null;
  rg?: string | null;
  endereco_completo?: string | null;
  cargo?: string | null;
  senioridade?: string | null;
  status?: string | null;
}

interface DayOffData {
  id: number;
  date: string;
  status: string;
}

// --- Componente da Aba de Day Off ---
const DayOffTab: React.FC<{ employee: EmployeeData; initialDayOffs: DayOffData[] }> = ({ employee, initialDayOffs }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dayOffs, setDayOffs] = useState(initialDayOffs);

    const handleSuccess = (newDayOff: DayOffData) => {
        setDayOffs(prev => [...prev, newDayOff].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }

    return (
        <div className="animate-fadeIn">
            <h3 className="text-lg font-semibold text-ol-text dark:text-darkOl-text mb-4">Gestão de Day Off</h3>
            <div className="bg-ol-cardBg dark:bg-darkOl-cardBg p-4 rounded-lg shadow-sm">
                <p>Aniversário do colaborador: {new Date(employee.data_nascimento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</p>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 bg-ol-primary text-white dark:bg-darkOl-primary dark:text-black py-2 px-4 rounded-md hover:bg-ol-hover dark:hover:bg-darkOl-hover transition-colors"
                >
                    Agendar Day Off
                </button>
            </div>
            <div className="mt-6">
                <h4 className="font-semibold">Histórico de Day Offs</h4>
                {dayOffs.length > 0 ? (
                    <ul className="mt-2 list-disc list-inside">
                        {dayOffs.map(d => (
                            <li key={d.id}>{new Date(d.date).toLocaleDateString('pt-BR')} - <span className={`font-semibold ${d.status === 'AGENDADO' ? 'text-yellow-500' : 'text-green-500'}`}>{d.status}</span></li>
                        ))}
                    </ul>
                ) : (
                    <p className="mt-2">Nenhum Day Off no histórico.</p>
                )}
            </div>

            <DayOffScheduleModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onScheduled={handleSuccess}
                employeeId={employee.id}
                employeeBirthDate={employee.data_nascimento}
            />
        </div>
    )
}

// --- Página Principal de Detalhes ---
const EmployeeDetailPage = () => {
  const [activeTab, setActiveTab] = useState('details'); // Mudei para começar na aba de detalhes
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [dayOffs, setDayOffs] = useState<DayOffData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (id) {
      const fetchEmployeeData = async () => {
        try {
          setLoading(true);
          
          const [employeeData, dayOffsData] = await Promise.all([
            getEmployeeById(id),
            getDayOffs(id)
          ]);

          setEmployee(employeeData);
          setDayOffs(dayOffsData);

        } catch (err: any) {
          setError(err.message || 'Ocorreu um erro ao buscar os dados.');
        } finally {
          setLoading(false);
        }
      };

      fetchEmployeeData();
    }
  }, [id]);

  if (loading) {
    return <div className="p-8">Carregando...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Erro: {error}</div>;
  }

  if (!employee) {
    return <div className="p-8">Colaborador não encontrado.</div>;
  }

  const TABS = [
    { id: 'details', label: 'Detalhes Pessoais' },
    { id: 'day-off', label: 'Day Off' },
    { id: 'vacation', label: 'Férias' },
    { id: 'pdi', label: 'PDI' },
    { id: 'one-on-one', label: '1x1' },
  ];

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold text-ol-text dark:text-darkOl-text mb-6">{employee.nome_completo}</h1>

      {/* Navegação por Abas */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
        <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-ol-primary dark:border-darkOl-primary text-ol-text dark:text-darkOl-text'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-2 border-b-2 font-medium text-sm transition-colors`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Conteúdo da Aba */}
      <div className="mt-6">
        {activeTab === 'details' && <EmployeeDetailsTab employee={employee} />}
        {activeTab === 'day-off' && <DayOffTab employee={employee} initialDayOffs={dayOffs} />}
        {activeTab === 'vacation' && <div>Conteúdo da aba Férias.</div>}
        {activeTab === 'pdi' && <div>Conteúdo da aba PDI.</div>}
        {activeTab === 'one-on-one' && <div>Conteúdo da aba 1x1.</div>}
      </div>
    </div>
  );
};

export default EmployeeDetailPage;
