'use client';

import React, { useState } from 'react';
import { OLButton } from '../ui/OLButton';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { createDayOff } from '@/lib/api';

interface DayOffScheduleModalProps {
  employeeId: string;
  employeeBirthDate: string;
  isOpen: boolean;
  onClose: () => void;
  onScheduled: (newDayOff: any) => void;
}

const DayOffScheduleModal: React.FC<DayOffScheduleModalProps> = ({ 
    employeeId,
    employeeBirthDate,
    isOpen, 
    onClose, 
    onScheduled 
}) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const newDayOff = await createDayOff({
        employee_id: employeeId, 
        date: selectedDate 
      });

      onScheduled(newDayOff);
      onClose();

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao agendar.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fadeIn">
      <div className="bg-ol-cardBg dark:bg-darkOl-cardBg p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold text-ol-text dark:text-darkOl-text mb-4">Agendar Day Off</h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          Lembre-se: o Day Off deve ser agendado no mês de seu aniversário: 
          <span className="font-semibold">{new Date(employeeBirthDate).toLocaleDateString('pt-BR', { month: 'long' })}</span>.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="day-off-date">Selecione a Data</Label>
            <Input
              id="day-off-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              Cancelar
            </button>
            <OLButton type="submit" disabled={isLoading}>
              {isLoading ? 'Agendando...' : 'Confirmar Agendamento'}
            </OLButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DayOffScheduleModal;