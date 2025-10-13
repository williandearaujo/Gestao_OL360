'use client'

import React, { useState } from 'react'
import { Calendar, Clock, Users, Plus, Video, MapPin, FileText } from 'lucide-react'

interface OneToOne {
  id: string
  colaborador: string
  data: string
  hora: string
  duracao: number
  tipo: string
  local: string
  status: string
  topicos: string[]
  observacoes: string
}

export default function OneToOnePage() {
  const [reunioes, setReunioes] = useState<OneToOne[]>([])
  const [showModal, setShowModal] = useState(false)
  const [novaReuniao, setNovaReuniao] = useState<Partial<OneToOne>>({
    colaborador: '',
    data: '',
    hora: '',
    duracao: 60,
    tipo: 'PRESENCIAL',
    local: '',
    status: 'AGENDADA',
    topicos: [],
    observacoes: ''
  })
  const [topicoTemp, setTopicoTemp] = useState('')

  const tiposReuniao = [
    { value: 'PRESENCIAL', label: 'Presencial', icon: MapPin },
    { value: 'ONLINE', label: 'Online', icon: Video },
    { value: 'HIBRIDA', label: 'Híbrida', icon: Users }
  ]

  const statusOptions = [
    { value: 'AGENDADA', label: 'Agendada', color: 'bg-blue-100 text-blue-800' },
    { value: 'REALIZADA', label: 'Realizada', color: 'bg-green-100 text-green-800' },
    { value: 'CANCELADA', label: 'Cancelada', color: 'bg-red-100 text-red-800' },
    { value: 'REAGENDADA', label: 'Reagendada', color: 'bg-yellow-100 text-yellow-800' }
  ]

  const duracoes = [
    { value: 30, label: '30 minutos' },
    { value: 45, label: '45 minutos' },
    { value: 60, label: '1 hora' },
    { value: 90, label: '1h 30min' },
    { value: 120, label: '2 horas' }
  ]

  const handleAddTopico = () => {
    if (topicoTemp.trim()) {
      setNovaReuniao({
        ...novaReuniao,
        topicos: [...(novaReuniao.topicos || []), topicoTemp.trim()]
      })
      setTopicoTemp('')
    }
  }

  const handleRemoveTopico = (index: number) => {
    setNovaReuniao({
      ...novaReuniao,
      topicos: novaReuniao.topicos?.filter((_, i) => i !== index)
    })
  }

  const handleAgendar = () => {
    const reuniao: OneToOne = {
      id: Date.now().toString(),
      colaborador: novaReuniao.colaborador || '',
      data: novaReuniao.data || '',
      hora: novaReuniao.hora || '',
      duracao: novaReuniao.duracao || 60,
      tipo: novaReuniao.tipo || 'PRESENCIAL',
      local: novaReuniao.local || '',
      status: 'AGENDADA',
      topicos: novaReuniao.topicos || [],
      observacoes: novaReuniao.observacoes || ''
    }

    setReunioes([...reunioes, reuniao])
    setShowModal(false)
    setNovaReuniao({
      colaborador: '',
      data: '',
      hora: '',
      duracao: 60,
      tipo: 'PRESENCIAL',
      local: '',
      status: 'AGENDADA',
      topicos: [],
      observacoes: ''
    })
  }

  const getStatusConfig = (status: string) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0]
  }

  const getTipoIcon = (tipo: string) => {
    const tipoConfig = tiposReuniao.find(t => t.value === tipo)
    return tipoConfig ? tipoConfig.icon : MapPin
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reuniões One-to-One</h1>
              <p className="text-gray-600 mt-2">Agende e gerencie reuniões individuais com colaboradores</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Agendar 1:1
            </button>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            {statusOptions.map(status => {
              const count = reunioes.filter(r => r.status === status.value).length
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
        </div>

        {/* Lista de Reuniões */}
        <div className="space-y-4">
          {reunioes.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhuma reunião agendada</h3>
              <p className="text-gray-500 mb-6">Comece agendando sua primeira reunião 1:1</p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Agendar Primeira Reunião
              </button>
            </div>
          ) : (
            reunioes.map(reuniao => {
              const statusConfig = getStatusConfig(reuniao.status)
              const TipoIcon = getTipoIcon(reuniao.tipo)
              return (
                <div key={reuniao.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-purple-100 rounded-full p-3">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{reuniao.colaborador}</h3>
                        <div className="flex items-center gap-3 mt-1 text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(reuniao.data).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {reuniao.hora} ({reuniao.duracao}min)
                          </span>
                          <span className="flex items-center gap-1">
                            <TipoIcon className="w-4 h-4" />
                            {tiposReuniao.find(t => t.value === reuniao.tipo)?.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>

                  {reuniao.local && (
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{reuniao.local}</span>
                    </div>
                  )}

                  {reuniao.topicos.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Tópicos:</h4>
                      <div className="flex flex-wrap gap-2">
                        {reuniao.topicos.map((topico, index) => (
                          <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {topico}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {reuniao.observacoes && (
                    <div className="bg-gray-50 rounded-lg p-3 mt-3">
                      <h4 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        Observações:
                      </h4>
                      <p className="text-gray-600 text-sm">{reuniao.observacoes}</p>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Agendar Reunião 1:1</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Colaborador *</label>
                <input
                  type="text"
                  value={novaReuniao.colaborador}
                  onChange={(e) => setNovaReuniao({...novaReuniao, colaborador: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Nome do colaborador"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data *</label>
                  <input
                    type="date"
                    value={novaReuniao.data}
                    onChange={(e) => setNovaReuniao({...novaReuniao, data: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hora *</label>
                  <input
                    type="time"
                    value={novaReuniao.hora}
                    onChange={(e) => setNovaReuniao({...novaReuniao, hora: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duração</label>
                  <select
                    value={novaReuniao.duracao}
                    onChange={(e) => setNovaReuniao({...novaReuniao, duracao: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {duracoes.map(dur => (
                      <option key={dur.value} value={dur.value}>{dur.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                  <select
                    value={novaReuniao.tipo}
                    onChange={(e) => setNovaReuniao({...novaReuniao, tipo: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {tiposReuniao.map(tipo => (
                      <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Local</label>
                <input
                  type="text"
                  value={novaReuniao.local}
                  onChange={(e) => setNovaReuniao({...novaReuniao, local: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: Sala de reuniões 3, Link do Meet, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tópicos da Reunião</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={topicoTemp}
                    onChange={(e) => setTopicoTemp(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTopico())}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Digite um tópico e pressione Enter"
                  />
                  <button
                    type="button"
                    onClick={handleAddTopico}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Adicionar
                  </button>
                </div>
                {novaReuniao.topicos && novaReuniao.topicos.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {novaReuniao.topicos.map((topico, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-2">
                        {topico}
                        <button
                          type="button"
                          onClick={() => handleRemoveTopico(index)}
                          className="text-purple-900 hover:text-purple-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                <textarea
                  value={novaReuniao.observacoes}
                  onChange={(e) => setNovaReuniao({...novaReuniao, observacoes: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Anotações adicionais sobre a reunião..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAgendar}
                disabled={!novaReuniao.colaborador || !novaReuniao.data || !novaReuniao.hora}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Agendar Reunião
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}