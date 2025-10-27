'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Users, BookOpen } from 'lucide-react'
import OLCardStats from '@/components/ui/OLCardStats'
import { OLButton } from '@/components/ui/OLButton'
import OLModal from '@/components/ui/OLModal'
import { Vinculo, Colaborador, Conhecimento } from '@/components/vinculos/types'
import VinculosList from '@/components/vinculos/VinculosList'
import VinculosModal from '@/components/vinculos/VinculosModal'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function VinculosPage() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [conhecimentos, setConhecimentos] = useState<Conhecimento[]>([])
  const [vinculos, setVinculos] = useState<Vinculo[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState<Vinculo | null>(null)
  const [novoVinculo, setNovoVinculo] = useState<any>({
    employee_id: '',
    knowledge_id: '',
    nivel_obtido: 'BASICO',
    status: 'DESEJADO',
    progresso: 0,
    observacoes: '',
    data_inicio: '',
    data_limite: '',
    data_obtencao: ''
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadVinculos()
  }, [])

  const loadVinculos = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token') || ''
      const [colabRes, conhecRes, vincRes] = await Promise.all([
        fetch(`${API_URL}/employees`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/knowledge`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/employee-knowledge`, { headers: { Authorization: `Bearer ${token}` } })
      ])
      const colaboradoresReal = await colabRes.json()
      const conhecimentosReal = await conhecRes.json()
      const vinculosReal = await vincRes.json()
      setColaboradores(colaboradoresReal)
      setConhecimentos(conhecimentosReal)
      setVinculos(
        (vinculosReal as Vinculo[]).map(v => ({
          ...v,
          employee_nome: v.employee_nome || colaboradoresReal.find(c => c.id === v.employee_id)?.nome,
          knowledge_nome: v.knowledge_nome || conhecimentosReal.find(k => k.id === v.knowledge_id)?.nome
        }))
      )
    } catch (e: any) {
      setError(e.message || 'Falha ao carregar vínculos')
    } finally {
      setLoading(false)
    }
  }

  const handleSalvar = async () => {
    const token = localStorage.getItem('token') || ''
    if (!novoVinculo.employee_id || !novoVinculo.knowledge_id || !novoVinculo.nivel_obtido) return
    const payload = {
      employee_id: novoVinculo.employee_id,
      knowledge_id: novoVinculo.knowledge_id,
      nivel_obtido: novoVinculo.nivel_obtido,
      status: novoVinculo.status,
      progresso: novoVinculo.progresso ?? 0,
      observacoes: novoVinculo.observacoes || '',
      data_inicio: novoVinculo.data_inicio || null,
      data_limite: novoVinculo.data_limite || null,
      data_obtencao: novoVinculo.data_obtencao || null
    }
    try {
      if (editando) {
        await fetch(`${API_URL}/employee-knowledge/${editando.id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
      } else {
        await fetch(`${API_URL}/employee-knowledge`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
      }
      setShowModal(false)
      setEditando(null)
      setNovoVinculo({
        employee_id: '',
        knowledge_id: '',
        nivel_obtido: 'BASICO',
        status: 'DESEJADO',
        progresso: 0,
        observacoes: '',
        data_inicio: '',
        data_limite: '',
        data_obtencao: ''
      })
      loadVinculos()
    } catch {
      alert('Falha ao salvar vínculo')
    }
  }

  const handleEditar = (vinculo: Vinculo) => {
    setEditando(vinculo)
    setNovoVinculo({
      employee_id: vinculo.employee_id,
      knowledge_id: vinculo.knowledge_id,
      nivel_obtido: vinculo.nivel_obtido || 'BASICO',
      status: vinculo.status,
      progresso: vinculo.progresso ?? 0,
      data_inicio: vinculo.data_inicio || '',
      data_limite: vinculo.data_limite || '',
      data_obtencao: vinculo.data_obtencao || '',
      observacoes: vinculo.observacoes || ''
    })
    setShowModal(true)
  }

  const handleExcluir = async (id: string) => {
    const token = localStorage.getItem('token') || ''
    if (confirm('Tem certeza que deseja excluir este vínculo?')) {
      await fetch(`${API_URL}/employee-knowledge/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      loadVinculos()
    }
  }

  const updateProgresso = async (id: string, progresso: number) => {
    const token = localStorage.getItem('token') || ''
    await fetch(`${API_URL}/employee-knowledge/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        progresso,
        status: progresso === 100 ? 'OBTIDO' : progresso > 0 ? 'OBRIGATORIO' : 'DESEJADO'
      })
    })
    loadVinculos()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ol-bg dark:bg-darkOl-bg flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-ol-primary mx-auto mb-4"></div>
          <p className="text-ol-text dark:text-darkOl-text">Carregando vínculos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ol-bg dark:bg-darkOl-bg p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-ol-cardBg dark:bg-darkOl-cardBg border border-ol-border dark:border-darkOl-border rounded-lg p-6">
            <h2 className="text-xl font-bold text-ol-error dark:text-darkOl-error mb-2">
              ❌ Erro ao carregar vínculos
            </h2>
            <p className="text-ol-text dark:text-darkOl-text mb-4">{error}</p>
            <div className="flex gap-3">
              <OLButton variant="danger" onClick={loadVinculos}>
                Tentar Novamente
              </OLButton>
              <OLButton variant="outline" onClick={() => window.location.href = "/dashboard"}>
                Voltar ao Dashboard
              </OLButton>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const stats = {
    desejado: vinculos.filter(v => v.status === 'DESEJADO').length,
    obtido: vinculos.filter(v => v.status === 'OBTIDO').length,
    obrigatorio: vinculos.filter(v => v.status === 'OBRIGATORIO').length,
  }

  return (
    <div className="min-h-screen bg-ol-bg dark:bg-darkOl-bg p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ol-primary dark:text-darkOl-primary flex items-center gap-3">
            <Users className="w-8 h-8 text-ol-primary dark:text-darkOl-primary" />
            Vínculos Colaborador-Conhecimento
          </h1>
          <p className="text-ol-grayMedium dark:text-darkOl-grayMedium mt-2">
            Gestão completa de vínculos • {vinculos.length} cadastrados
          </p>
        </div>
        <OLButton
          variant="primary"
          iconLeft={<Plus className="w-5 h-5" />}
          onClick={() => setShowModal(true)}
        >
          Novo Vínculo
        </OLButton>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <OLCardStats label="Desejado" value={stats.desejado} icon={<Users />} color="info" />
        <OLCardStats label="Obtido" value={stats.obtido} icon={<BookOpen />} color="success" />
        <OLCardStats label="Obrigatório" value={stats.obrigatorio} icon={<Users />} color="warning" />
      </div>

      {/* Lista de Vínculos */}
      <VinculosList
        vinculos={vinculos}
        onEditar={handleEditar}
        onExcluir={handleExcluir}
        onUpdateProgresso={updateProgresso}
      />

      {/* Modal */}
      {showModal && (
        <VinculosModal
          visible={showModal}
          editando={editando}
          novoVinculo={novoVinculo}
          setNovoVinculo={setNovoVinculo}
          onClose={() => setShowModal(false)}
          onSalvar={handleSalvar}
          colaboradores={colaboradores}
          conhecimentos={conhecimentos}
        />
      )}
    </div>
  )
}
