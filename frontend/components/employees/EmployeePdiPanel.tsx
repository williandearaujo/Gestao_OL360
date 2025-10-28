'use client';

import React, { useEffect, useState } from 'react';

import { createPdiLog, deletePdiLog, getPdiLogs, updatePdiLog } from '@/lib/api';
import { formatStatus } from '@/lib/format';

type PdiStatus = 'EM_ANDAMENTO' | 'CONCLUIDO' | 'ATRASADO' | 'CANCELADO';

interface EmployeePdiRecord {
  id: string;
  employee_id: string;
  titulo: string;
  descricao?: string | null;
  status: PdiStatus;
  data_planejada: string;
  data_realizada?: string | null;
  created_at: string;
  updated_at: string;
}

interface EmployeePdiPanelProps {
  employeeId: string;
}

const STATUS_OPTIONS: { value: PdiStatus; label: string }[] = [
  { value: 'EM_ANDAMENTO', label: 'Em andamento' },
  { value: 'CONCLUIDO', label: 'Concluido' },
  { value: 'ATRASADO', label: 'Atrasado' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Erro inesperado.';

const EmployeePdiPanel: React.FC<EmployeePdiPanelProps> = ({ employeeId }) => {
  const [records, setRecords] = useState<EmployeePdiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    data_planejada: '',
    status: 'EM_ANDAMENTO' as PdiStatus,
  });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = (await getPdiLogs(employeeId)) as EmployeePdiRecord[];
      setRecords(response ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.titulo || !form.data_planejada) {
      setError('Informe titulo e data planejada.');
      return;
    }
    try {
      setSaving(true);
      await createPdiLog({
        employee_id: employeeId,
        titulo: form.titulo.trim(),
        descricao: form.descricao.trim() || null,
        status: form.status,
        data_planejada: form.data_planejada,
      });
      setForm({ titulo: '', descricao: '', data_planejada: '', status: 'EM_ANDAMENTO' });
      await fetchRecords();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAsDone = async (record: EmployeePdiRecord) => {
    try {
      setSaving(true);
      await updatePdiLog(record.id, {
        status: 'CONCLUIDO',
        data_realizada: new Date().toISOString().split('T')[0],
      });
      await fetchRecords();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Confirma remover este PDI?')) return;
    try {
      setSaving(true);
      await deletePdiLog(id);
      await fetchRecords();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-ol-border bg-white p-6 text-sm text-ol-grayMedium shadow-sm dark:border-darkOl-border dark:bg-darkOl-cardBg dark:text-darkOl-grayMedium">
        Carregando PDIs...
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

      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-ol-border bg-white p-6 shadow-sm dark:border-darkOl-border dark:bg-darkOl-cardBg"
      >
        <h3 className="text-lg font-semibold text-ol-text dark:text-darkOl-text">Registrar novo PDI</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-ol-grayMedium dark:text-darkOl-grayMedium">
              Titulo
            </label>
            <input
              className="mt-1 w-full rounded-md border border-ol-border px-3 py-2 text-sm outline-none focus:border-ol-primary focus:ring-2 focus:ring-ol-primary/40 dark:border-darkOl-border dark:bg-darkOl-bg dark:text-darkOl-text"
              value={form.titulo}
              onChange={(event) => setForm((prev) => ({ ...prev, titulo: event.target.value }))}
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ol-grayMedium dark:text-darkOl-grayMedium">
              Data planejada
            </label>
            <input
              type="date"
              className="mt-1 w-full rounded-md border border-ol-border px-3 py-2 text-sm outline-none focus:border-ol-primary focus:ring-2 focus:ring-ol-primary/40 dark:border-darkOl-border dark:bg-darkOl-bg dark:text-darkOl-text"
              value={form.data_planejada}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, data_planejada: event.target.value }))
              }
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ol-grayMedium dark:text-darkOl-grayMedium">
              Status inicial
            </label>
            <select
              className="mt-1 w-full rounded-md border border-ol-border px-3 py-2 text-sm outline-none focus:border-ol-primary focus:ring-2 focus:ring-ol-primary/40 dark:border-darkOl-border dark:bg-darkOl-bg dark:text-darkOl-text"
              value={form.status}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, status: event.target.value as PdiStatus }))
              }
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-ol-grayMedium dark:text-darkOl-grayMedium">
              Descricao
            </label>
            <textarea
              className="mt-1 w-full rounded-md border border-ol-border px-3 py-2 text-sm outline-none focus:border-ol-primary focus:ring-2 focus:ring-ol-primary/40 dark:border-darkOl-border dark:bg-darkOl-bg dark:text-darkOl-text"
              rows={3}
              value={form.descricao}
              onChange={(event) => setForm((prev) => ({ ...prev, descricao: event.target.value }))}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="inline-flex rounded-md bg-ol-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-ol-hover disabled:cursor-not-allowed disabled:opacity-60 dark:bg-darkOl-primary dark:text-darkOl-black dark:hover:bg-darkOl-hover"
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Criar PDI'}
          </button>
        </div>
      </form>

      <div className="rounded-lg border border-ol-border bg-white p-6 shadow-sm dark:border-darkOl-border dark:bg-darkOl-cardBg">
        <h3 className="text-lg font-semibold text-ol-text dark:text-darkOl-text">Historico</h3>
        {records.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-ol-border p-4 text-sm text-ol-grayMedium dark:border-darkOl-border dark:text-darkOl-grayMedium">
            Nenhum PDI registrado.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {records.map((record) => (
              <li
                key={record.id}
                className="rounded-lg border border-ol-border p-4 text-sm dark:border-darkOl-border"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-ol-text dark:text-darkOl-text">
                      {record.titulo}
                    </p>
                    <p className="text-xs uppercase text-ol-grayMedium dark:text-darkOl-grayMedium">
                      Planejado para {new Date(record.data_planejada).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {record.status !== 'CONCLUIDO' && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsDone(record)}
                        className="text-xs font-medium text-emerald-600 hover:underline disabled:opacity-60"
                        disabled={saving}
                      >
                        Marcar como concluido
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(record.id)}
                      className="text-xs font-medium text-red-600 hover:underline disabled:opacity-60"
                      disabled={saving}
                    >
                      Remover
                    </button>
                  </div>
                </div>
                {record.descricao && (
                  <p className="mt-2 text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">
                    {record.descricao}
                  </p>
                )}
                <div className="mt-2 text-xs text-ol-grayMedium dark:text-darkOl-grayMedium">
                  Status: <span className="font-semibold">{formatStatus(record.status)}</span>
                  {record.data_realizada && (
                    <span className="ml-2">
                      Finalizado em {new Date(record.data_realizada).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EmployeePdiPanel;
