'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Calendar, Clock, Users } from 'lucide-react'

interface OneToOne {
  id: string
  employee_nome?: string
  data: string
  hora?: string
  duracao?: number
  tipo: string
  local?: string
  topicos?: string[]
  observacoes?: string
}

export default function OneToOnePage() {
  const [reunioes, setReunioes] = useState<OneToOne[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [novaReuniao, setNovaReuniao] = useState({
    data: '',
    hora: '',
    duracao: 60,
    tipo: 'PRESENCIAL',
    local: '',
    topicos: [] as string[],
    observacoes: ''
  })
  const [topicoTemp, setTopicoTemp] = useState('')

  useEffect(() => {
    loadReunioes()
  }, [])

  const loadReunioes = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/one-to-one', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setReunioes(data.data || [])
    } catch (error) {
      console.error('Erro ao carregar reuniões:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTopico = () => {
    if (topicoTemp.trim()) {
      setNovaReuniao({
        ...novaReuniao,
        topicos: [...novaReuniao.topicos, topicoTemp.trim()]
      })
      setTopicoTemp('')
    }
  }

  const handleAgendar = async () => {
    try {
      const token = localStorage.getItem('token')

      await fetch('/one-to-one', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          employee_id: 'USER_EMPLOYEE_ID', // Pegar do usuário logado
          ...novaReuniao
        })
      })

      await loadReunioes()
      setShowModal(false)
    } catch (error) {
      console.error('Erro ao agendar:', error)
      alert('Erro ao agendar reunião')
    }
  }

  if (loading) {
    return <div className="p-8">Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reuniões One-to-One</h1>
              <p className="text-gray-600 mt-2">{reunioes.length} reunião(ões) agendada(s)</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
            >
              <Plus className="w-5 h-5" />
              Agendar 1:1
            </button>
          </div>
        </div>

        {/* Lista de Reuniões */}
        <div className="space-y-4">
          {reunioes.map(reuniao => (
            <div key={reuniao.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-4 mb-4">
                <Users className="w-8 h-8 text-purple-600" />
                <div>
                  <h3 className="text-lg font-semibold">{reuniao.employee_nome || 'Reunião 1:1'}</h3>
                  <div className="flex items-center gap-4 text-gray-600 text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(reuniao.data).toLocaleDateString('pt-BR')}
                    </span>
                    {reuniao.hora && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {reuniao.hora} ({reuniao.duracao}min)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {reuniao.topicos && reuniao.topicos.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Tópicos:</h4>
                  <div className="flex flex-wrap gap-2">
                    {reuniao.topicos.map((topico, i) => (
                      <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        {topico}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Agendar Reunião 1:1</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    value={novaReuniao.data}
                    onChange={(e) => setNovaReuniao({...novaReuniao, data: e.target.value})}
                    className="px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="time"
                    value={novaReuniao.hora}
                    onChange={(e) => setNovaReuniao({...novaReuniao, hora: e.target.value})}
                    className="px-3 py-2 border rounded-lg"
                  />
                </div>

                <select
                  value={novaReuniao.tipo}
                  onChange={(e) => setNovaReuniao({...novaReuniao, tipo: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="PRESENCIAL">Presencial</option>
                  <option value="ONLINE">Online</option>
                  <option value="HIBRIDA">Híbrida</option>
                </select>

                <input
                  type="text"
                  value={novaReuniao.local}
                  onChange={(e) => setNovaReuniao({...novaReuniao, local: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Local"
                />

                <div>
                  <label className="block text-sm font-medium mb-2">Tópicos</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={topicoTemp}
                      onChange={(e) => setTopicoTemp(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTopico())}
                      className="flex-1 px-3 py-2 border rounded-lg"
                      placeholder="Digite um tópico e pressione Enter"
                    />
                    <button
                      type="button"
                      onClick={handleAddTopico}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg"
                    >
                      +
                    </button>
                  </div>
                  {novaReuniao.topicos.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {novaReuniao.topicos.map((topico, i) => (
                        <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          {topico}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAgendar}
                  disabled={!novaReuniao.data}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50"
                >
                  Agendar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}