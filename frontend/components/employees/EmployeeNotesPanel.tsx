'use client';

import React, { useState } from 'react';
import { OLButton } from '@/components/ui/OLButton';
import { createEmployeeNote } from '@/lib/api';

export interface EmployeeNote {
  id: string;
  author_id: string;
  author_name?: string | null;
  note: string;
  created_at: string;
}

interface EmployeeNotesPanelProps {
  employeeId: string;
  notes: EmployeeNote[];
  onNoteAdded: (note: EmployeeNote) => void;
}

const EmployeeNotesPanel: React.FC<EmployeeNotesPanelProps> = ({ employeeId, notes, onNoteAdded }) => {
  const [noteText, setNoteText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!noteText.trim()) return;
    try {
      setSubmitting(true);
      setError(null);
      const payload = await createEmployeeNote(employeeId, { note: noteText.trim() });
      onNoteAdded(payload);
      setNoteText('');
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar observação.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2 rounded-lg border border-ol-border p-4 dark:border-darkOl-border">
        <label className="text-sm font-medium text-ol-text dark:text-darkOl-text" htmlFor="nova-observacao">
          Nova observação
        </label>
        <textarea
          id="nova-observacao"
          value={noteText}
          onChange={(event) => setNoteText(event.target.value)}
          rows={3}
          className="w-full rounded-md border border-ol-border bg-white p-3 text-sm text-ol-text outline-none transition focus:border-ol-primary focus:ring-2 focus:ring-ol-primary/40 dark:border-darkOl-border dark:bg-darkOl-bg dark:text-darkOl-text dark:focus:border-darkOl-primary dark:focus:ring-darkOl-primary/40"
          placeholder="Registre informações importantes sobre o colaborador."
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end">
          <OLButton type="submit" loading={submitting} disabled={submitting || !noteText.trim()}>
            Adicionar observação
          </OLButton>
        </div>
      </form>

      <div className="space-y-3">
        {notes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-ol-border p-4 text-sm text-ol-grayMedium dark:border-darkOl-border dark:text-darkOl-grayMedium">
            Nenhuma observação cadastrada até o momento.
          </div>
        ) : (
          notes.map((note) => (
            <article
              key={note.id}
              className="rounded-lg border border-ol-border bg-white p-4 shadow-sm dark:border-darkOl-border dark:bg-darkOl-cardBg"
            >
              <header className="mb-2 flex items-center justify-between text-xs text-ol-grayMedium dark:text-darkOl-grayMedium">
                <span>{note.author_name ?? 'Sistema'}</span>
                <time dateTime={note.created_at}>
                  {new Date(note.created_at).toLocaleString('pt-BR')}
                </time>
              </header>
              <p className="text-sm text-ol-text dark:text-darkOl-text whitespace-pre-line">{note.note}</p>
            </article>
          ))
        )}
      </div>
    </div>
  );
};

export default EmployeeNotesPanel;

