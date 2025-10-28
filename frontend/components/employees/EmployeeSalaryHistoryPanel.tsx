'use client';

import React, { useState } from 'react';
import { OLButton } from '@/components/ui/OLButton';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { addSalaryHistory } from '@/lib/api';
import { formatCurrency } from '@/lib/format';

export interface EmployeeSalaryHistoryEntry {
  id: string;
  amount: number;
  effective_date: string;
  reason?: string | null;
  created_by_name?: string | null;
  created_at: string;
}

interface EmployeeSalaryHistoryPanelProps {
  employeeId: string;
  history: EmployeeSalaryHistoryEntry[];
  onEntryAdded: (entry: EmployeeSalaryHistoryEntry) => void;
}

const EmployeeSalaryHistoryPanel: React.FC<EmployeeSalaryHistoryPanelProps> = ({
  employeeId,
  history,
  onEntryAdded,
}) => {
  const [amount, setAmount] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!amount || !effectiveDate) return;
    try {
      setSubmitting(true);
      setError(null);

      const payload = await addSalaryHistory(employeeId, {
        amount,
        effective_date: effectiveDate,
        reason: reason.trim() || undefined,
      });

      onEntryAdded(payload);
      setAmount('');
      setEffectiveDate('');
      setReason('');
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar histórico salarial.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg border border-ol-border p-4 md:grid-cols-4 dark:border-darkOl-border">
        <div>
          <Label htmlFor="salario">Salário</Label>
          <Input
            id="salario"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0,00"
            required
          />
        </div>
        <div>
          <Label htmlFor="vigencia">Data de vigência</Label>
          <Input
            id="vigencia"
            type="date"
            value={effectiveDate}
            onChange={(event) => setEffectiveDate(event.target.value)}
            required
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="motivo">Motivo (opcional)</Label>
          <Input
            id="motivo"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Promoção, reajuste coletivo, etc."
          />
        </div>
        {error && <p className="md:col-span-4 text-sm text-red-600">{error}</p>}
        <div className="md:col-span-4 flex justify-end">
          <OLButton type="submit" loading={submitting} disabled={submitting}>
            Registrar reajuste
          </OLButton>
        </div>
      </form>

      <div className="rounded-lg border border-ol-border dark:border-darkOl-border">
        <table className="min-w-full divide-y divide-ol-border dark:divide-darkOl-border">
          <thead className="bg-ol-bg dark:bg-darkOl-bg">
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-ol-grayMedium dark:text-darkOl-grayMedium">
              <th className="px-4 py-3">Vigência</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Motivo</th>
              <th className="px-4 py-3">Registrado por</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ol-border bg-white text-sm dark:divide-darkOl-border dark:bg-darkOl-cardBg">
            {history.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-ol-grayMedium dark:text-darkOl-grayMedium">
                  Nenhum histórico cadastrado.
                </td>
              </tr>
            ) : (
              history.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-4 py-3">{new Date(entry.effective_date).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3">{formatCurrency(entry.amount)}</td>
                  <td className="px-4 py-3">{entry.reason || '—'}</td>
                  <td className="px-4 py-3">{entry.created_by_name ?? 'Sistema'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeSalaryHistoryPanel;

