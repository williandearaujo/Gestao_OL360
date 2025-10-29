'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { BookOpen, Users } from 'lucide-react'

import VinculosList from '@/components/vinculos/VinculosList'
import { Vinculo } from '@/components/vinculos/types'
import { getKnowledgeById, getEmployeeKnowledge } from '@/lib/api'

interface KnowledgeItem {
  id: string;
  nome: string;
  descricao?: string | null;
}

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Erro inesperado.'

export default function KnowledgeDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [knowledge, setKnowledge] = useState<KnowledgeItem | null>(null)
  const [vinculos, setVinculos] = useState<Vinculo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [knowledgeData, vinculosData] = await Promise.all([
          getKnowledgeById(id), 
          getEmployeeKnowledge({ knowledge_id: id }),
        ])

        setKnowledge(knowledgeData)
        setVinculos(vinculosData)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-ol-bg dark:bg-darkOl-bg flex justify-center items-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-4 border-ol-primary"></div>
          <p className="text-ol-text dark:text-darkOl-text">Carregando detalhes do conhecimento...</p>
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
              Erro ao carregar detalhes
            </h2>
            <p className="mb-4 text-ol-text dark:text-darkOl-text">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!knowledge) {
    return (
        <div className="min-h-screen bg-ol-bg dark:bg-darkOl-bg p-6">
            <p>Conhecimento não encontrado.</p>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-ol-bg p-6 dark:bg-darkOl-bg">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-ol-primary dark:text-darkOl-primary">
          <BookOpen className="h-8 w-8 text-ol-primary dark:text-darkOl-primary" />
          {knowledge.nome}
        </h1>
        {knowledge.descricao && (
            <p className="mt-2 text-ol-grayMedium dark:text-darkOl-grayMedium">
                {knowledge.descricao}
            </p>
        )}
      </div>

      <h2 className="mb-4 flex items-center gap-3 text-2xl font-bold text-ol-primary dark:text-darkOl-primary">
        <Users className="h-7 w-7 text-ol-primary dark:text-darkOl-primary" />
        Colaboradores com este conhecimento
      </h2>
      <VinculosList vinculos={vinculos} onEditar={() => {}} onExcluir={() => {}} />
    </div>
  )
}
