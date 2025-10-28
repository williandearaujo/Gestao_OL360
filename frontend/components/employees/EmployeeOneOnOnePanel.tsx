'use client';

import React, { useEffect, useState } from 'react';

import {
  createOneOnOne,
  deleteOneOnOne,
  getOneOnOnes,
  updateOneOnOne,
} from '@/lib/api';
import { formatStatus } from '@/lib/format';

type OneOnOneStatus = 'AGENDADO' | 'CONCLUIDO' | 'ATRASADO' | 'CANCELADO';

interface OneOnOneRecord {
  id: string;
  employee_id: string;
  data_agendada: string;
  data_realizada?: string | null;
  status: OneOnOneStatus;
  notas?: string | null;
  pdi_alinhado: boolean;
  created_at: string;
  updated_at: string;
}

interface EmployeeOneOnOnePanelProps {
  employeeId: string;
}

const STATUS_OPTIONS: { value: OneOnOneStatus; label: string }[] = [
  { value: 'AGENDADO', label: 'Agendado' },
  { value: 'CONCLUIDO', label: 'Concluido' },
  { value: 'ATRASADO', label: 'Atrasado' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Erro inesperado.';

const EmployeeOneOnOnePanel: React.FC<EmployeeOneOnOnePanelProps> = ({ employeeId }) => {
  const [records, setRecords] = useState<OneOnOneRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    data_agendada: '',
    status: 'AGENDADO' as OneOnOneStatus,
    notas: '',
    pdi_alinhado: false,
  });

  const loadRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = (await getOneOnOnes(employeeId)) as OneOnOneRecord[];
      setRecords(response ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.data_agendada) {
      setError('Informe a data agendada.');
      return;
    }
    try {
      setSaving(true);
      await createOneOnOne({
        employee_id: employeeId,
        data_agendada: form.data_agendada,
        status: form.status,
        notas: form.notas.trim() || null,
        pdi_alinhado: form.pdi_alinhado,
      });
      setForm({ data_agendada: '', status: 'AGENDADO', notas: '', pdi_alinhado: false });
      await loadRecords();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleConclude = async (record: OneOnOneRecord) => {
    try {
      setSaving(true);
      await updateOneOnOne(record.id, {
        status: 'CONCLUIDO',
        data_realizada: new Date().toISOString().split('T')[0],
      });
      await loadRecords();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Confirma remover esta reuniao 1x1?')) return;
    try {
      setSaving(true);
      await deleteOneOnOne(id);
      await loadRecords();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-ol-border bg-white p-6 text-sm text-ol-grayMedium shadow-sm dark:border-darkOl-border dark:bg-darkOl-cardBg dark:text-darkOl-grayMedium">
        Carregando reunioes 1x1...
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
        <h3 className="text-lg font-semibold text-ol-text dark:text-darkOl-text">Agendar nova 1x1</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-ol-grayMedium dark:text-darkOl-grayMedium">
              Data agendada
            </label>
            <input
              type="date"
              className="mt-1 w-full rounded-md border border-ol-border px-3 py-2 text-sm outline-none focus:border-ol-primary focus:ring-2 focus:ring-ol-primary/40 dark:border-darkOl-border dark:bg-darkOl-bg dark:text-darkOl-text"
              value={form.data_agendada}
              onChange={(event) => setForm((prev) => ({ ...prev, data_agendada: event.target.value }))}
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
                setForm((prev) => ({ ...prev, status: event.target.value as OneOnOneStatus }))
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
              Notas
            </label>
            <textarea
              className="mt-1 w-full rounded-md border border-ol-border px-3 py-2 text-sm outline-none focus:border-ol-primary focus:ring-2 focus:ring-ol-primary/40 dark:border-darkOl-border dark:bg-darkOl-bg dark:text-darkOl-text"
              rows={3}
              value={form.notas}
              onChange={(event) => setForm((prev) => ({ ...prev, notas: event.target.value }))}
            />
          </div>
          <label className="flex items-center gap-2 text-xs font-medium text-ol-grayMedium dark:text-darkOl-grayMedium">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-ol-border text-ol-primary focus:ring-ol-primary dark:border-darkOl-border"
              checked={form.pdi_alinhado}
              onChange={(event) => setForm((prev) => ({ ...prev, pdi_alinhado: event.target.checked }))}
            />
            PDI alinhado?
          </label>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="inline-flex rounded-md bg-ol-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-ol-hover disabled:cursor-not-allowed disabled:opacity-60 dark:bg-darkOl-primary dark:text-darkOl-black dark:hover:bg-darkOl-hover"
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Agendar 1x1'}
          </button>
        </div>
      </form>

      <div className="rounded-lg border border-ol-border bg-white p-6 shadow-sm dark:border-darkOl-border dark:bg-darkOl-cardBg">
        <h3 className="text-lg font-semibold text-ol-text dark:text-darkOl-text">Historico de 1x1</h3>
        {records.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-ol-border p-4 text-sm text-ol-grayMedium dark:border-darkOl-border dark:text-darkOl-grayMedium">
            Nenhuma reuniao registrada.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {records.map((record) => (
              <li
                key={record.id}
                className="rounded-lg border border-ol-border p-4 text-sm dark:border-darkOl-border"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-base font-semibold text-ol-text dark:text-darkOl-text">
                      {new Date(record.data_agendada).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs uppercase text-ol-grayMedium dark:text-darkOl-grayMedium">
                      Status: {formatStatus(record.status)}
                    </p>
                    {record.data_realizada && (
                      <p className="text-xs text-ol-grayMedium dark:text-darkOl-grayMedium">
                        Realizada em {new Date(record.data_realizada).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {record.status !== 'CONCLUIDO' && (
                      <button
                        type="button"
                        onClick={() => handleConclude(record)}
                        className="text-xs font-medium text-emerald-600 hover:underline disabled:opacity-60"
                        disabled={saving}
                      >
                        Marcar como concluida
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
                {record.notas && (
                  <p className="mt-2 text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">
                    {record.notas}
                  </p>
                )}
                {record.pdi_alinhado && (
                  <p className="mt-1 text-xs font-medium text-emerald-600">
                    Este encontro alinhou um PDI.
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EmployeeOneOnOnePanel;
