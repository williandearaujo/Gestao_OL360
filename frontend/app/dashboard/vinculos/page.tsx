'use client'

import React, { useEffect, useState } from 'react'
import { Plus, Users, BookOpen, AlertOctagon } from 'lucide-react'

import OLCardStats from '@/components/ui/OLCardStats'
import { OLButton } from '@/components/ui/OLButton'
import VinculosList from '@/components/vinculos/VinculosList'
import VinculosModal from '@/components/vinculos/VinculosModal'
import { Vinculo, Colaborador, Conhecimento, VinculoFormState } from '@/components/vinculos/types'

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '')

const createEmptyForm = (): VinculoFormState => ({
  employee_id: '',
  knowledge_id: '',
  status: 'DESEJADO',
  progresso: 25,
  observacoes: '',
  data_inicio: '',
  data_limite: '',
  data_obtencao: '',
  data_expiracao: '',
  certificado_url: '',
})

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Erro inesperado.'

const statusToProgress: Record<VinculoFormState['status'], number> = {
  DESEJADO: 25,
  OBRIGATORIO: 50,
  OBTIDO: 100,
}

export default function VinculosPage() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [conhecimentos, setConhecimentos] = useState<Conhecimento[]>([])
  const [vinculos, setVinculos] = useState<Vinculo[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState<Vinculo | null>(null)
  const [novoVinculo, setNovoVinculo] = useState<VinculoFormState>(createEmptyForm())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showExpiredOnly, setShowExpiredOnly] = useState(false)

  const authHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : ''
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const loadVinculos = async () => {
    setLoading(true)
    setError(null)

    try {
      const headers = authHeaders()
      const vinculosUrl = showExpiredOnly
        ? `${BASE_URL}/employee-knowledge/?vencido=true`
        : `${BASE_URL}/employee-knowledge/`

      const [colabRes, conhecRes, vincRes] = await Promise.all([
        fetch(`${BASE_URL}/employees`, { headers }),
        fetch(`${BASE_URL}/knowledge`, { headers }),
        fetch(vinculosUrl, { headers }),
      ])

      if (!colabRes.ok || !conhecRes.ok || !vincRes.ok) {
        throw new Error('Falha ao carregar informacoes de vinculos')
      }

      const colaboradoresReal = (await colabRes.json()) as Colaborador[]
      const conhecimentosReal = (await conhecRes.json()) as Conhecimento[]
      const vinculosReal = (await vincRes.json()) as Vinculo[]

      setColaboradores(colaboradoresReal)
      setConhecimentos(conhecimentosReal)
      setVinculos(
        vinculosReal.map((vinculo) => {
          const colaborador = colaboradoresReal.find((item) => item.id === vinculo.employee_id)
          const conhecimento = conhecimentosReal.find((item) => item.id === vinculo.knowledge_id)
          return {
            ...vinculo,
            employee_nome: vinculo.employee_nome || colaborador?.nome || colaborador?.nome_completo || 'Colaborador',
            knowledge_nome: vinculo.knowledge_nome || conhecimento?.nome || 'Conhecimento',
          }
        }),
      )
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVinculos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showExpiredOnly])

  const buildPayload = () => {
    const nullIfEmpty = (value: string) => (value ? value : null)
    return {
      employee_id: novoVinculo.employee_id,
      knowledge_id: novoVinculo.knowledge_id,
      status: novoVinculo.status,
      progresso: statusToProgress[novoVinculo.status],
      observacoes: novoVinculo.observacoes.trim() ? novoVinculo.observacoes.trim() : null,
      data_inicio: nullIfEmpty(novoVinculo.data_inicio),
      data_limite: novoVinculo.status === 'OBTIDO' ? null : nullIfEmpty(novoVinculo.data_limite),
      data_obtencao: novoVinculo.status === 'OBTIDO' ? nullIfEmpty(novoVinculo.data_obtencao) : null,
      data_expiracao: novoVinculo.status === 'OBTIDO' ? nullIfEmpty(novoVinculo.data_expiracao) : null,
      certificado_url:
        novoVinculo.status === 'OBTIDO' && novoVinculo.certificado_url.trim()
          ? novoVinculo.certificado_url.trim()
          : null,
    }
  }

  const handleStatusChange = (status: VinculoFormState['status']) => {
    setNovoVinculo((prev) => {
      const next: VinculoFormState = {
        ...prev,
        status,
        progresso: statusToProgress[status],
      }
      if (status === 'OBTIDO') {
        next.data_limite = ''
      } else {
        next.data_obtencao = ''
        next.data_expiracao = ''
        next.certificado_url = ''
      }
      return next
    })
  }

  const handleSalvar = async () => {
    if (!novoVinculo.employee_id || !novoVinculo.knowledge_id) {
      return
    }

    try {
      const headers = {
        ...authHeaders(),
        'Content-Type': 'application/json',
      }
      const payload = buildPayload()

      const endpoint = editando
        ? `${BASE_URL}/employee-knowledge/${editando.id}`
        : `${BASE_URL}/employee-knowledge/`
      const method = editando ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers,
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json();
          if (errorData.detail === 'Este vinculo ja esta cadastrado.') {
            throw new Error('Este vínculo já está cadastrado. Não é possível adicionar duplicatas.');
          }
        }
        throw new Error('Falha ao salvar vinculo');
      }

      setShowModal(false)
      setEditando(null)
      setNovoVinculo(createEmptyForm())
      await loadVinculos()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleEditar = (vinculo: Vinculo) => {
    setEditando(vinculo)
    const statusValue = (vinculo.status as VinculoFormState['status']) || 'DESEJADO'
    const progressValue = vinculo.progresso ?? statusToProgress[statusValue] ?? 0
    setNovoVinculo({
      employee_id: vinculo.employee_id,
      knowledge_id: vinculo.knowledge_id,
      status: statusValue,
      progresso: progressValue,
      observacoes: vinculo.observacoes || '',
      data_inicio: vinculo.data_inicio || '',
      data_limite: statusValue === 'OBTIDO' ? '' : vinculo.data_limite || '',
      data_obtencao: statusValue === 'OBTIDO' ? vinculo.data_obtencao || '' : '',
      data_expiracao: statusValue === 'OBTIDO' ? vinculo.data_expiracao || '' : '',
      certificado_url: statusValue === 'OBTIDO' ? vinculo.certificado_url || '' : '',
    })
    setShowModal(true)
  }

  const handleExcluir = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este vinculo?')) return
    try {
      const response = await fetch(`${BASE_URL}/employee-knowledge/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (!response.ok) {
        throw new Error('Falha ao excluir vinculo')
      }
      await loadVinculos()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ol-bg dark:bg-darkOl-bg flex justify-center items-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-4 border-ol-primary"></div>
          <p className="text-ol-text dark:text-darkOl-text">Carregando vinculos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ol-bg dark:bg-darkOl-bg p-6">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border border-ol-border bg-ol-cardBg p-6 dark:border-darkOl-border dark:bg-darkOl-cardBg">
            <h2 className="mb-2 text-xl font-bold text-ol-error dark:text-darkOl-error">
              Erro ao carregar vinculos
            </h2>
            <p className="mb-4 text-ol-text dark:text-darkOl-text">{error}</p>
            <div className="flex gap-3">
              <OLButton variant="danger" onClick={loadVinculos}>
                Tentar novamente
              </OLButton>
              <OLButton variant="outline" onClick={() => (window.location.href = '/dashboard')}>
                Voltar ao dashboard
              </OLButton>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const stats = {
    desejado: vinculos.filter((v) => v.status === 'DESEJADO').length,
    obtido: vinculos.filter((v) => v.status === 'OBTIDO').length,
    obrigatorio: vinculos.filter((v) => v.status === 'OBRIGATORIO').length,
    vencidos: vinculos.filter((v) => v.vencido).length,
  }

  return (
    <div className="min-h-screen bg-ol-bg p-6 dark:bg-darkOl-bg">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-ol-primary dark:text-darkOl-primary">
            <Users className="h-8 w-8 text-ol-primary dark:text-darkOl-primary" />
            Vinculos colaborador x conhecimento
          </h1>
          <p className="mt-2 text-ol-grayMedium dark:text-darkOl-grayMedium">
            Gestao completa de vinculos — {vinculos.length} registros
          </p>
        </div>
        <OLButton
          variant="primary"
          iconLeft={<Plus className="h-5 w-5" />}
          onClick={() => setShowModal(true)}
        >
          Novo vinculo
        </OLButton>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <OLCardStats label="Desejado" value={stats.desejado} icon={<Users />} color="info" />
        <OLCardStats label="Obtido" value={stats.obtido} icon={<BookOpen />} color="success" />
        <OLCardStats label="Obrigatorio" value={stats.obrigatorio} icon={<Users />} color="warning" />
        <OLCardStats label="Vencidos" value={stats.vencidos} icon={<AlertOctagon />} color="danger" />
      </div>

      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          id="expired-filter"
          checked={showExpiredOnly}
          onChange={(e) => setShowExpiredOnly(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
        />
        <label htmlFor="expired-filter" className="ml-2 block text-sm font-medium text-gray-700">
          Mostrar apenas vencidos
        </label>
      </div>

      <VinculosList vinculos={vinculos} onEditar={handleEditar} onExcluir={handleExcluir} />

      {showModal && (
        <VinculosModal
          visible={showModal}
          editando={editando}
          novoVinculo={novoVinculo}
          setNovoVinculo={setNovoVinculo}
          onStatusChange={handleStatusChange}
          onClose={() => {
            setShowModal(false)
            setEditando(null)
            setNovoVinculo(createEmptyForm())
          }}
          onSalvar={handleSalvar}
          colaboradores={colaboradores}
          conhecimentos={conhecimentos}
        />
      )}
    </div>
  )
}