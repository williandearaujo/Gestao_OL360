// app/components/vinculos/VinculosModal.tsx
import React from 'react'
import { Users, BookOpen } from 'lucide-react'

import { Vinculo, Colaborador, Conhecimento, VinculoFormState } from './types'

interface Props {
  visible: boolean
  editando: Vinculo | null
  novoVinculo: VinculoFormState
  setNovoVinculo: React.Dispatch<React.SetStateAction<VinculoFormState>>
  onStatusChange: (status: VinculoFormState['status']) => void
  onClose: () => void
  onSalvar: () => void
  colaboradores: Colaborador[]
  conhecimentos: Conhecimento[]
}

const statusOptions: { value: VinculoFormState['status']; label: string }[] = [
  { value: 'DESEJADO', label: 'Desejado' },
  { value: 'OBRIGATORIO', label: 'Obrigatorio' },
  { value: 'OBTIDO', label: 'Obtido' },
]

const VinculosModal: React.FC<Props> = ({
  visible,
  editando,
  novoVinculo,
  setNovoVinculo,
  onStatusChange,
  onClose,
  onSalvar,
  colaboradores,
  conhecimentos,
}) => {
  if (!visible) return null

  const isObtido = novoVinculo.status === 'OBTIDO'

  const colaboradorLabel = (item: Colaborador) =>
    item.nome || item.nome_completo || 'Colaborador'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-6 text-2xl font-bold">{editando ? 'Editar vinculo' : 'Novo vinculo'}</h2>

        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                <Users className="mr-1 inline h-4 w-4" />
                Colaborador *
              </label>
              <select
                value={novoVinculo.employee_id}
                onChange={(event) =>
                  setNovoVinculo({ ...novoVinculo, employee_id: event.target.value })
                }
                className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Selecione um colaborador</option>
                {colaboradores.map((colaborador) => (
                  <option key={colaborador.id} value={colaborador.id}>
                    {colaboradorLabel(colaborador)}
                    {colaborador.cargo ? ` - ${colaborador.cargo}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                <BookOpen className="mr-1 inline h-4 w-4" />
                Conhecimento *
              </label>
              <select
                value={novoVinculo.knowledge_id}
                onChange={(event) =>
                  setNovoVinculo({ ...novoVinculo, knowledge_id: event.target.value })
                }
                className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Selecione um conhecimento</option>
                {conhecimentos.map((conhecimento) => (
                  <option key={conhecimento.id} value={conhecimento.id}>
                    {conhecimento.nome} ({conhecimento.tipo})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Status *</label>
              <select
                value={novoVinculo.status}
                onChange={(event) => onStatusChange(event.target.value as VinculoFormState['status'])}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Data inicio</label>
              <input
                type="date"
                value={novoVinculo.data_inicio}
                onChange={(event) =>
                  setNovoVinculo({ ...novoVinculo, data_inicio: event.target.value })
                }
                className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {!isObtido && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Data meta</label>
                <input
                  type="date"
                  value={novoVinculo.data_limite}
                  onChange={(event) =>
                    setNovoVinculo({ ...novoVinculo, data_limite: event.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>
            )}
          </div>

          {isObtido && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Data obtencao *</label>
                <input
                  type="date"
                  value={novoVinculo.data_obtencao}
                  onChange={(event) =>
                    setNovoVinculo({ ...novoVinculo, data_obtencao: event.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Data expiracao</label>
                <input
                  type="date"
                  value={novoVinculo.data_expiracao}
                  onChange={(event) =>
                    setNovoVinculo({ ...novoVinculo, data_expiracao: event.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Link certificado</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={novoVinculo.certificado_url}
                  onChange={(event) =>
                    setNovoVinculo({ ...novoVinculo, certificado_url: event.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Progresso: {novoVinculo.progresso}%
            </label>
            <input type="range" min="0" max="100" value={novoVinculo.progresso} readOnly disabled className="w-full" />
            <p className="mt-1 text-xs text-gray-500">
              O progresso é definido automaticamente conforme o status.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Observacoes</label>
            <textarea
              value={novoVinculo.observacoes}
              onChange={(event) =>
                setNovoVinculo({ ...novoVinculo, observacoes: event.target.value })
              }
              className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
              rows={3}
              placeholder="Anotacoes sobre o desenvolvimento..."
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={onSalvar}
            disabled={!novoVinculo.employee_id || !novoVinculo.knowledge_id}
            className="flex-1 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {editando ? 'Salvar alteracoes' : 'Criar vinculo'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default VinculosModal
