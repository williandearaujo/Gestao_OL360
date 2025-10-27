// app/components/vinculos/VinculosStats.tsx
import React from 'react'
import { Vinculo } from './types'

const statusOptions = [
  { value: 'DESEJADO', label: 'Desejado', color: 'bg-gray-100 text-gray-800' },
  { value: 'OBTIDO', label: 'Obtido', color: 'bg-green-100 text-green-800' },
  { value: 'OBRIGATORIO', label: 'Obrigatório', color: 'bg-blue-100 text-blue-800' }
]

interface Props {
  vinculos: Vinculo[]
}

export default function VinculosStats({ vinculos }: Props) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {statusOptions.map(status => {
        const count = vinculos.filter(v => v.status === status.value).length
        return (
          <div key={status.value} className="bg-gray-50 rounded-lg p-4">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
              {status.label}
            </span>
            <p className="text-2xl font-bold mt-2">{count}</p>
          </div>
        )
      })}
    </div>
  )
}
