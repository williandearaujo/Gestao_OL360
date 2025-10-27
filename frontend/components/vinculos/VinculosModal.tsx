// app/components/vinculos/VinculosModal.tsx
import React from 'react'
import { Users, BookOpen, Plus } from 'lucide-react'
import { Vinculo, Colaborador, Conhecimento } from './types'

interface Props {
  visible: boolean
  editando: Vinculo | null
  novoVinculo: any
  setNovoVinculo: React.Dispatch<React.SetStateAction<any>>
  onClose: () => void
  onSalvar: () => void
  colaboradores: Colaborador[]
  conhecimentos: Conhecimento[]
}

const nivelOptions = [
  { value: 'BASICO', label: 'Básico' },
  { value: 'INTERMEDIARIO', label: 'Intermediário' },
  { value: 'AVANCADO', label: 'Avançado' },
  { value: 'ESPECIALISTA', label: 'Especialista' }
]

const statusOptions = [
  { value: 'DESEJADO', label: 'Desejado' },
  { value: 'OBTIDO', label: 'Obtido' },
  { value: 'OBRIGATORIO', label: 'Obrigatório' }
]

export default function VinculosModal({
  visible, editando, novoVinculo, setNovoVinculo,
  onClose, onSalvar, colaboradores, conhecimentos
}: Props) {
  if (!visible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">
          {editando ? 'Editar Vínculo' : 'Novo Vínculo'}
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Colaborador *
              </label>
              <select
                value={novoVinculo.employee_id}
                onChange={(e) => setNovoVinculo({ ...novoVinculo, employee_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Selecione um colaborador</option>
                {colaboradores.map(colab => (
                  <option key={colab.id} value={colab.id}>
                    {colab.nome} - {colab.cargo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BookOpen className="w-4 h-4 inline mr-1" />
                Conhecimento *
              </label>
              <select
                value={novoVinculo.knowledge_id}
                onChange={(e) => setNovoVinculo({ ...novoVinculo, knowledge_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Selecione um conhecimento</option>
                {conhecimentos.map(conhec => (
                  <option key={conhec.id} value={conhec.id}>
                    {conhec.nome} ({conhec.tipo})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nível Obtido *</label>
            <select
              value={novoVinculo.nivel_obtido}
              onChange={(e) => setNovoVinculo({ ...novoVinculo, nivel_obtido: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              {nivelOptions.map(nivel => (
                <option key={nivel.value} value={nivel.value}>
                  {nivel.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={novoVinculo.status}
              onChange={(e) => setNovoVinculo({ ...novoVinculo, status: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Início</label>
              <input
                type="date"
                value={novoVinculo.data_inicio || ''}
                onChange={(e) => setNovoVinculo({ ...novoVinculo, data_inicio: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Meta</label>
              <input
                type="date"
                value={novoVinculo.data_limite || ''}
                onChange={(e) => setNovoVinculo({ ...novoVinculo, data_limite: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Obtenção</label>
              <input
                type="date"
                value={novoVinculo.data_obtencao || ''}
                onChange={(e) => setNovoVinculo({ ...novoVinculo, data_obtencao: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Progresso: {novoVinculo.progresso ?? 0}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={novoVinculo.progresso ?? 0}
              onChange={(e) => setNovoVinculo({ ...novoVinculo, progresso: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
            <textarea
              value={novoVinculo.observacoes}
              onChange={(e) => setNovoVinculo({ ...novoVinculo, observacoes: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              rows={3}
              placeholder="Anotações sobre o desenvolvimento..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={onSalvar}
            disabled={!novoVinculo.employee_id || !novoVinculo.knowledge_id || !novoVinculo.nivel_obtido}
            className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editando ? 'Salvar Alterações' : 'Criar Vínculo'}
          </button>
        </div>
      </div>
    </div>
  )
}
