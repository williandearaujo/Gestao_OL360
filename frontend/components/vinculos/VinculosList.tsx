// app/components/vinculos/VinculosList.tsx
import React from 'react'
import { Vinculo } from './types'
import { Users, BookOpen, Calendar, Target, Edit, Trash2 } from 'lucide-react'

interface Props {
  vinculos: Vinculo[]
  onEditar: (vinculo: Vinculo) => void
  onExcluir: (id: string) => void
}

const statusConfigMap: Record<string, { label: string; color: string }> = {
  DESEJADO: { label: 'Desejado', color: 'bg-gray-100 text-gray-800' },
  OBTIDO: { label: 'Obtido', color: 'bg-green-100 text-green-800' },
  OBRIGATORIO: { label: 'Obrigatorio', color: 'bg-blue-100 text-blue-800' },
}

const VinculosList: React.FC<Props> = ({ vinculos, onEditar, onExcluir }) => {
  return vinculos.length === 0 ? (
    <div className="rounded-lg bg-white p-12 text-center shadow-md">
      <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-400" />
      <h3 className="mb-2 text-xl font-semibold text-gray-700">Nenhum vinculo cadastrado</h3>
      <p className="text-gray-500">
        Comece vinculando colaboradores aos conhecimentos que precisam desenvolver.
      </p>
    </div>
  ) : (
    <>
      {vinculos.map((vinculo) => {
        const statusConfig = statusConfigMap[vinculo.status] ?? statusConfigMap.DESEJADO
        const progresso = vinculo.progresso ?? 0

        return (
          <div key={vinculo.id} className="mb-4 rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex flex-1 items-center gap-4">
                <div className="rounded-full bg-teal-100 p-3">
                  <Users className="h-6 w-6 text-teal-600" />
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{vinculo.employee_nome}</h3>
                    <span className="text-gray-400">·</span>
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="h-4 w-4 text-gray-600" />
                      <span className="font-medium text-gray-700">{vinculo.knowledge_nome}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    {vinculo.data_inicio && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Inicio: {new Date(vinculo.data_inicio).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                    {vinculo.data_limite && (
                      <span className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        Meta: {new Date(vinculo.data_limite).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                    {vinculo.status === 'OBTIDO' && vinculo.data_obtencao && (
                      <span className="font-medium text-green-600">
                        Obtido em {new Date(vinculo.data_obtencao).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
                <button
                  onClick={() => onEditar(vinculo)}
                  className="rounded p-2 text-blue-600 transition-colors hover:bg-blue-50"
                  title="Editar"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onExcluir(vinculo.id)}
                  className="rounded p-2 text-red-600 transition-colors hover:bg-red-50"
                  title="Excluir"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-gray-600">Progresso</span>
                <span className="font-semibold">{progresso}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-teal-600 transition-all duration-300"
                  style={{ width: `${progresso}%` }}
                />
              </div>
            </div>

            {vinculo.observacoes && (
              <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                <strong>Observacoes:</strong> {vinculo.observacoes}
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}

export default VinculosList