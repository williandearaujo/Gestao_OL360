// app/components/vinculos/VinculosList.tsx
import React from 'react'
import { Vinculo } from './types'
import { Users, BookOpen, Calendar, Target, Edit, Trash2 } from 'lucide-react'

interface Props {
  vinculos: Vinculo[]
  onEditar: (vinculo: Vinculo) => void
  onExcluir: (id: string) => void
  onUpdateProgresso: (id: string, progresso: number) => void
}

export default function VinculosList({ vinculos, onEditar, onExcluir, onUpdateProgresso }: Props) {
  const getStatusConfig = (status: string) => {
    const options = [
      { value: 'DESEJADO', label: 'Desejado', color: 'bg-gray-100 text-gray-800' },
      { value: 'OBTIDO', label: 'Obtido', color: 'bg-green-100 text-green-800' },
      { value: 'OBRIGATORIO', label: 'Obrigatório', color: 'bg-blue-100 text-blue-800' }
    ]
    return options.find(s => s.value === status) || options[0]
  }

  return (
    <>
      {vinculos.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum vínculo cadastrado</h3>
          <p className="text-gray-500 mb-6">Comece vinculando colaboradores aos conhecimentos que precisam desenvolver</p>
        </div>
      ) : (
        vinculos.map(vinculo => {
          const statusConfig = getStatusConfig(vinculo.status)
          return (
            <div key={vinculo.id} className="bg-white rounded-lg shadow-md p-6 mb-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="bg-teal-100 rounded-full p-3">
                    <Users className="w-6 h-6 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{vinculo.employee_nome}</h3>
                      <span className="text-gray-400">→</span>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700 font-medium">{vinculo.knowledge_nome}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {vinculo.data_inicio && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Início: {new Date(vinculo.data_inicio).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                      {vinculo.data_limite && (
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          Meta: {new Date(vinculo.data_limite).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                      {vinculo.status === 'OBTIDO' && vinculo.data_obtencao && (
                        <span className="text-green-600 font-medium">
                          ✓ Obtido em {new Date(vinculo.data_obtencao).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                  <button
                    onClick={() => onEditar(vinculo)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onExcluir(vinculo.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Progresso</span>
                  <span className="font-semibold">{vinculo.progresso ?? 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${vinculo.progresso ?? 0}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-2 mb-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={vinculo.progresso ?? 0}
                  onChange={(e) => onUpdateProgresso(vinculo.id, parseInt(e.target.value))}
                  className="flex-1"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={vinculo.progresso ?? 0}
                  onChange={(e) => onUpdateProgresso(vinculo.id, parseInt(e.target.value))}
                  className="w-16 px-2 py-1 border rounded text-center"
                />
              </div>

              {vinculo.observacoes && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    <strong>Observações:</strong> {vinculo.observacoes}
                  </p>
                </div>
              )}
            </div>
          )
        })
      )}
    </>
  )
}
