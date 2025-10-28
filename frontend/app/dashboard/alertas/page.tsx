'use client';

import React, { useEffect, useState } from 'react';
import { OLButton } from '@/components/ui/OLButton';
import { getAlerts, refreshAlerts } from '@/lib/api';
import { formatStatus } from '@/lib/format';

interface AlertItem {
  id: number;
  type: string;
  priority: string;
  title: string;
  message: string;
  employee_name?: string | null;
  created_at: string;
  metadata?: Record<string, any>;
  is_read: boolean;
}

const priorityColor: Record<string, string> = {
  critical: 'bg-red-600/10 text-red-700',
  high: 'bg-red-500/10 text-red-600',
  medium: 'bg-amber-500/10 text-amber-600',
  low: 'bg-emerald-500/10 text-emerald-600',
  info: 'bg-blue-500/10 text-blue-600',
};

const AlertDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      await refreshAlerts();
      const response = await getAlerts();
      setAlerts(response ?? []);
    } catch (err: any) {
      setError(err.message || 'Não foi possível carregar os alertas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">
        Carregando alertas...
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-sm text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ol-text dark:text-darkOl-text">
            Painel de alertas
          </h1>
          <p className="text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">
            Acompanhamento de riscos, prazos e lembretes automáticos do sistema.
          </p>
        </div>
        <OLButton onClick={loadAlerts}>Atualizar</OLButton>
      </header>

      {alerts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-ol-border p-6 text-sm text-ol-grayMedium dark:border-darkOl-border dark:text-darkOl-grayMedium">
          Nenhum alerta pendente no momento.
        </div>
      ) : (
        <ul className="space-y-3">
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className="rounded-lg border border-ol-border bg-white p-4 shadow-sm transition hover:shadow-md dark:border-darkOl-border dark:bg-darkOl-cardBg"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-ol-text dark:text-darkOl-text">
                    {alert.title}
                  </p>
                  <p className="mt-1 text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">
                    {alert.message}
                  </p>
                  {alert.employee_name && (
                    <p className="mt-1 text-xs text-ol-grayMedium dark:text-darkOl-grayMedium">
                      Relacionado a: {alert.employee_name}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${
                      priorityColor[alert.priority] ?? 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {formatStatus(alert.priority)}
                  </span>
                  <span className="text-xs text-ol-grayMedium dark:text-darkOl-grayMedium">
                    {new Date(alert.created_at).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AlertDashboard;

