'use client';

import React, { useEffect, useState } from 'react';

import { getEmployeeVacations, updateEmployeeVacations } from '@/lib/api';

type VacationPeriod = {
  inicio: string;
  fim: string;
  dias: number;
};

type VacationData = {
  inicio?: string | null;
  fim?: string | null;
  dias: number;
  status: string;
  periodos: VacationPeriod[];
};

const STATUS_OPTIONS = [
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'AGENDADO', label: 'Agendado' },
  { value: 'EM_ANDAMENTO', label: 'Em andamento' },
  { value: 'CONCLUIDO', label: 'Concluido' },
];

interface EmployeeVacationPanelProps {
  employeeId: string;
}

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Erro inesperado.';

const EmployeeVacationPanel: React.FC<EmployeeVacationPanelProps> = ({ employeeId }) => {
  const [data, setData] = useState<VacationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    inicio: '',
    fim: '',
    dias: '',
    status: 'AGENDADO',
  });
  const [diasDisponiveis, setDiasDisponiveis] = useState<string>('0');
  const [statusAtual, setStatusAtual] = useState<string>('PENDENTE');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = (await getEmployeeVacations(employeeId)) as VacationData;
      const payload: VacationData = {
        inicio: response?.inicio ?? null,
        fim: response?.fim ?? null,
        dias: Number(response?.dias ?? 0),
        status: response?.status ?? 'PENDENTE',
        periodos: (response?.periodos ?? []).map((periodo: any) => ({
          inicio: periodo.inicio,
          fim: periodo.fim,
          dias: Number(periodo.dias ?? 0),
        })),
      };
      setData(payload);
      setDiasDisponiveis(String(payload.dias ?? 0));
      setStatusAtual(payload.status);
      setForm((prev) => ({ ...prev, status: payload.status || prev.status }));
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  const handleAddPeriod = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.inicio || !form.fim || !form.dias) {
      setError('Preencha inicio, fim e dias do periodo.');
      return;
    }
    const diasPeriodo = Number(form.dias);
    if (Number.isNaN(diasPeriodo) || diasPeriodo <= 0) {
      setError('Informe uma quantidade de dias valida.');
      return;
    }

    const payload = {
      inicio: form.inicio,
      fim: form.fim,
      dias: Number(diasDisponiveis || data?.dias || 0),
      status: form.status,
      periodos: [
        ...(data?.periodos ?? []),
        { inicio: form.inicio, fim: form.fim, dias: diasPeriodo },
      ],
    };

    try {
      setSaving(true);
      await updateEmployeeVacations(employeeId, payload);
      setForm((prev) => ({ ...prev, inicio: '', fim: '', dias: '' }));
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!data) return;
    const dias = Number(diasDisponiveis || 0);
    if (Number.isNaN(dias) || dias < 0) {
      setError('Informe uma quantidade de dias disponiveis valida.');
      return;
    }
    try {
      setSaving(true);
      await updateEmployeeVacations(employeeId, {
        inicio: data.inicio ?? null,
        fim: data.fim ?? null,
        dias,
        status: statusAtual,
        periodos: data.periodos ?? [],
      });
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePeriod = async (index: number) => {
    if (!data) return;
    const next = data.periodos.filter((_, i) => i !== index);
    try {
      setSaving(true);
      await updateEmployeeVacations(employeeId, {
        inicio: next[0]?.inicio ?? null,
        fim: next[0]?.fim ?? null,
        dias: Number(diasDisponiveis || 0),
        status: statusAtual,
        periodos: next,
      });
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-ol-border bg-white p-6 text-sm text-ol-grayMedium shadow-sm dark:border-darkOl-border dark:bg-darkOl-cardBg dark:text-darkOl-grayMedium">
        Carregando informacoes de ferias...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-400 bg-red-100 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-ol-border bg-white p-6 shadow-sm dark:border-darkOl-border dark:bg-darkOl-cardBg">
        <h3 className="text-lg font-semibold text-ol-text dark:text-darkOl-text">Resumo de ferias</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <span className="text-xs uppercase text-ol-grayMedium dark:text-darkOl-grayMedium">
              Proxima inicio
            </span>
            <p className="text-lg font-medium text-ol-text dark:text-darkOl-text">
              {data?.inicio ? new Date(data.inicio).toLocaleDateString('pt-BR') : 'Nao definido'}
            </p>
          </div>
          <div>
            <span className="text-xs uppercase text-ol-grayMedium dark:text-darkOl-grayMedium">
              Proximo fim
            </span>
            <p className="text-lg font-medium text-ol-text dark:text-darkOl-text">
              {data?.fim ? new Date(data.fim).toLocaleDateString('pt-BR') : 'Nao definido'}
            </p>
          </div>
          <div>
            <span className="text-xs uppercase text-ol-grayMedium dark:text-darkOl-grayMedium">
              Dias disponiveis
            </span>
            <p className="text-lg font-medium text-ol-text dark:text-darkOl-text">
              {data?.dias ?? 0}
            </p>
          </div>
        </div>
      </div>

      <form
        className="rounded-lg border border-ol-border bg-white p-6 shadow-sm dark:border-darkOl-border dark:bg-darkOl-cardBg"
        onSubmit={handleAddPeriod}
      >
        <h3 className="text-lg font-semibold text-ol-text dark:text-darkOl-text">
          Agendar periodo
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="text-xs font-medium text-ol-grayMedium dark:text-darkOl-grayMedium">
              Inicio
            </label>
            <input
              type="date"
              className="mt-1 w-full rounded-md border border-ol-border px-3 py-2 text-sm outline-none focus:border-ol-primary focus:ring-2 focus:ring-ol-primary/40 dark:border-darkOl-border dark:bg-darkOl-bg dark:text-darkOl-text"
              value={form.inicio}
              onChange={(e) => setForm((prev) => ({ ...prev, inicio: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ol-grayMedium dark:text-darkOl-grayMedium">
              Fim
            </label>
            <input
              type="date"
              className="mt-1 w-full rounded-md border border-ol-border px-3 py-2 text-sm outline-none focus:border-ol-primary focus:ring-2 focus:ring-ol-primary/40 dark:border-darkOl-border dark:bg-darkOl-bg dark:text-darkOl-text"
              value={form.fim}
              onChange={(e) => setForm((prev) => ({ ...prev, fim: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ol-grayMedium dark:text-darkOl-grayMedium">
              Dias do periodo
            </label>
            <input
              type="number"
              min={1}
              className="mt-1 w-full rounded-md border border-ol-border px-3 py-2 text-sm outline-none focus:border-ol-primary focus:ring-2 focus:ring-ol-primary/40 dark:border-darkOl-border dark:bg-darkOl-bg dark:text-darkOl-text"
              value={form.dias}
              onChange={(e) => setForm((prev) => ({ ...prev, dias: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ol-grayMedium dark:text-darkOl-grayMedium">
              Status
            </label>
            <select
              className="mt-1 w-full rounded-md border border-ol-border px-3 py-2 text-sm outline-none focus:border-ol-primary focus:ring-2 focus:ring-ol-primary/40 dark:border-darkOl-border dark:bg-darkOl-bg dark:text-darkOl-text"
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="inline-flex rounded-md bg-ol-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-ol-hover disabled:cursor-not-allowed disabled:opacity-60 dark:bg-darkOl-primary dark:text-darkOl-black dark:hover:bg-darkOl-hover"
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Adicionar periodo'}
          </button>
        </div>
      </form>

      <div className="rounded-lg border border-ol-border bg-white p-6 shadow-sm dark:border-darkOl-border dark:bg-darkOl-cardBg">
        <h3 className="text-lg font-semibold text-ol-text dark:text-darkOl-text">Periodo planejado</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="text-xs font-medium text-ol-grayMedium dark:text-darkOl-grayMedium">
              Dias disponiveis
            </label>
            <input
              type="number"
              min={0}
              className="mt-1 w-full rounded-md border border-ol-border px-3 py-2 text-sm outline-none focus:border-ol-primary focus:ring-2 focus:ring-ol-primary/40 dark:border-darkOl-border dark:bg-darkOl-bg dark:text-darkOl-text"
              value={diasDisponiveis}
              onChange={(e) => setDiasDisponiveis(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ol-grayMedium dark:text-darkOl-grayMedium">
              Status atual
            </label>
            <select
              className="mt-1 w-full rounded-md border border-ol-border px-3 py-2 text-sm outline-none focus:border-ol-primary focus:ring-2 focus:ring-ol-primary/40 dark:border-darkOl-border dark:bg-darkOl-bg dark:text-darkOl-text"
              value={statusAtual}
              onChange={(e) => setStatusAtual(e.target.value)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end justify-end">
            <button
              type="button"
              onClick={handleSaveSettings}
              className="inline-flex rounded-md border border-ol-border px-4 py-2 text-sm font-medium text-ol-text transition hover:bg-ol-cardBg dark:border-darkOl-border dark:text-darkOl-text dark:hover:bg-darkOl-cardBg"
              disabled={saving}
            >
              {saving ? 'Salvando...' : 'Salvar ajustes'}
            </button>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-semibold text-ol-text dark:text-darkOl-text">Historico</h4>
          {(data?.periodos?.length ?? 0) === 0 ? (
            <p className="mt-2 rounded-lg border border-dashed border-ol-border p-4 text-sm text-ol-grayMedium dark:border-darkOl-border dark:text-darkOl-grayMedium">
              Nenhum periodo registrado.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {data?.periodos.map((periodo, index) => (
                <li
                  key={`${periodo.inicio}-${periodo.fim}-${index}`}
                  className="flex items-center justify-between rounded-lg border border-ol-border p-3 text-sm dark:border-darkOl-border"
                >
                  <span>
                    {new Date(periodo.inicio).toLocaleDateString('pt-BR')} &rarr;{' '}
                    {new Date(periodo.fim).toLocaleDateString('pt-BR')} ({periodo.dias} dias)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemovePeriod(index)}
                    className="text-xs font-medium text-red-600 hover:underline"
                    disabled={saving}
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeVacationPanel;
