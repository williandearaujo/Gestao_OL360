'use client'

import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Clock, UserX, Calendar, FileText, TrendingUp, Award } from 'lucide-react'

interface Alert {
  id: string
  type: 'error' | 'warning' | 'info' | 'success'
  category: string
  title: string
  message: string
  priority: 'high' | 'medium' | 'low'
  timestamp: Date
  link?: string
  actionable: boolean
}

interface Colaborador {
  id: string
  nome: string
  status: string
  data_admissao: string
  proximo_pdi?: string
  proxima_1x1?: string
  avaliacoes_pendentes?: number
}

interface AlertsSystemProps {
  colaboradores: Colaborador[]
  avaliacoes: any[]
  pdis: any[]
  oneToOnes: any[]
}

export default function DynamicAlertsSystem({ colaboradores, avaliacoes, pdis, oneToOnes }: AlertsSystemProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    generateAlerts()
  }, [colaboradores, avaliacoes, pdis, oneToOnes])

  const generateAlerts = () => {
    const newAlerts: Alert[] = []
    const hoje = new Date()
    const em7Dias = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000)
    const em15Dias = new Date(hoje.getTime() + 15 * 24 * 60 * 60 * 1000)
    const em30Dias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000)

    // ALERTAS: Colaboradores sem gerente
    const semGerente = colaboradores.filter(c => !c.manager_id && c.status === 'ATIVO')
    if (semGerente.length > 0) {
      newAlerts.push({
        id: 'sem-gerente',
        type: 'warning',
        category: 'HIERARQUIA',
        title: `${semGerente.length} colaborador(es) sem gerente`,
        message: `Existem ${semGerente.length} colaboradores ativos sem gerente atribuído. Isso pode impactar avaliações e 1:1s.`,
        priority: 'high',
        timestamp: hoje,
        link: '/dashboard/colaboradores',
        actionable: true
      })
    }

    // ALERTAS: Colaboradores novos (menos de 7 dias)
    const novosColaboradores = colaboradores.filter(c => {
      const dataAdmissao = new Date(c.data_admissao)
      const diffDias = Math.floor((hoje.getTime() - dataAdmissao.getTime()) / (1000 * 60 * 60 * 24))
      return diffDias <= 7 && diffDias >= 0 && c.status === 'ATIVO'
    })
    if (novosColaboradores.length > 0) {
      newAlerts.push({
        id: 'novos-colaboradores',
        type: 'info',
        category: 'ONBOARDING',
        title: `${novosColaboradores.length} novo(s) colaborador(es)`,
        message: `${novosColaboradores.map(c => c.nome).join(', ')} iniciou(aram) recentemente. Agende 1:1 de boas-vindas!`,
        priority: 'medium',
        timestamp: hoje,
        link: '/dashboard/one-to-one',
        actionable: true
      })
    }

    // ALERTAS: PDIs vencendo
    colaboradores.forEach(colab => {
      if (colab.proximo_pdi) {
        const dataPDI = new Date(colab.proximo_pdi)
        if (dataPDI <= em7Dias && dataPDI >= hoje) {
          newAlerts.push({
            id: `pdi-vencendo-${colab.id}`,
            type: 'warning',
            category: 'PDI',
            title: `PDI de ${colab.nome} vencendo`,
            message: `O PDI vence em ${Math.ceil((dataPDI.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))} dias. Revise as ações e progresso.`,
            priority: 'medium',
            timestamp: hoje,
            link: `/dashboard/pdi?colaborador=${colab.id}`,
            actionable: true
          })
        } else if (dataPDI < hoje) {
          newAlerts.push({
            id: `pdi-vencido-${colab.id}`,
            type: 'error',
            category: 'PDI',
            title: `PDI de ${colab.nome} vencido`,
            message: `O PDI está vencido há ${Math.ceil((hoje.getTime() - dataPDI.getTime()) / (1000 * 60 * 60 * 24))} dias. Atualize urgentemente!`,
            priority: 'high',
            timestamp: hoje,
            link: `/dashboard/pdi?colaborador=${colab.id}`,
            actionable: true
          })
        }
      }
    })

    // ALERTAS: 1:1s vencendo
    colaboradores.forEach(colab => {
      if (colab.proxima_1x1) {
        const data1x1 = new Date(colab.proxima_1x1)
        if (data1x1 <= em7Dias && data1x1 >= hoje) {
          newAlerts.push({
            id: `1x1-vencendo-${colab.id}`,
            type: 'info',
            category: 'ONE_TO_ONE',
            title: `1:1 com ${colab.nome} em breve`,
            message: `Reunião agendada para ${data1x1.toLocaleDateString('pt-BR')}. Prepare os tópicos!`,
            priority: 'medium',
            timestamp: hoje,
            link: '/dashboard/one-to-one',
            actionable: true
          })
        } else if (data1x1 < hoje) {
          newAlerts.push({
            id: `1x1-vencido-${colab.id}`,
            type: 'warning',
            category: 'ONE_TO_ONE',
            title: `1:1 com ${colab.nome} atrasado`,
            message: `A última reunião deveria ter ocorrido em ${data1x1.toLocaleDateString('pt-BR')}. Reagende!`,
            priority: 'high',
            timestamp: hoje,
            link: '/dashboard/one-to-one',
            actionable: true
          })
        }
      }
    })

    // ALERTAS: Avaliações pendentes
    const avaliacoesPendentes = avaliacoes?.filter(a => a.status === 'PENDENTE') || []
    if (avaliacoesPendentes.length > 0) {
      newAlerts.push({
        id: 'avaliacoes-pendentes',
        type: 'warning',
        category: 'AVALIACAO',
        title: `${avaliacoesPendentes.length} avaliação(ões) pendente(s)`,
        message: `Existem avaliações aguardando conclusão. Finalize para dar feedback aos colaboradores.`,
        priority: 'high',
        timestamp: hoje,
        link: '/dashboard/avaliacoes',
        actionable: true
      })
    }

    // ALERTAS: Colaboradores sem PDI
    const semPDI = colaboradores.filter(c => !c.proximo_pdi && c.status === 'ATIVO')
    if (semPDI.length > 0) {
      newAlerts.push({
        id: 'sem-pdi',
        type: 'warning',
        category: 'PDI',
        title: `${semPDI.length} colaborador(es) sem PDI`,
        message: `Colaboradores ativos precisam ter um Plano de Desenvolvimento Individual. Crie PDIs para acompanhar evolução.`,
        priority: 'medium',
        timestamp: hoje,
        link: '/dashboard/pdi',
        actionable: true
      })
    }

    // ALERTAS: Colaboradores de férias
    const emFerias = colaboradores.filter(c => c.status === 'FERIAS')
    if (emFerias.length > 0) {
      newAlerts.push({
        id: 'em-ferias',
        type: 'info',
        category: 'RH',
        title: `${emFerias.length} colaborador(es) de férias`,
        message: `${emFerias.map(c => c.nome).join(', ')} está(ão) de férias atualmente.`,
        priority: 'low',
        timestamp: hoje,
        actionable: false
      })
    }

    // ALERTAS: Colaboradores afastados
    const afastados = colaboradores.filter(c => c.status === 'AFASTADO')
    if (afastados.length > 0) {
      newAlerts.push({
        id: 'afastados',
        type: 'warning',
        category: 'RH',
        title: `${afastados.length} colaborador(es) afastado(s)`,
        message: `${afastados.map(c => c.nome).join(', ')} está(ão) afastado(s). Verifique o status e previsão de retorno.`,
        priority: 'medium',
        timestamp: hoje,
        link: '/dashboard/colaboradores',
        actionable: true
      })
    }

    // ALERTAS: Experiência terminando (90 dias)
    colaboradores.forEach(colab => {
      const dataAdmissao = new Date(colab.data_admissao)
      const fimExperiencia = new Date(dataAdmissao.getTime() + 90 * 24 * 60 * 60 * 1000)
      const diffDias = Math.ceil((fimExperiencia.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDias <= 15 && diffDias > 0 && colab.status === 'ATIVO') {
        newAlerts.push({
          id: `experiencia-terminando-${colab.id}`,
          type: 'warning',
          category: 'RH',
          title: `Período de experiência de ${colab.nome} terminando`,
          message: `Faltam ${diffDias} dias para o fim do período de experiência. Realize avaliação e defina efetivação.`,
          priority: 'high',
          timestamp: hoje,
          link: `/dashboard/avaliacoes`,
          actionable: true
        })
      }
    })

    // ALERTAS: Sistema funcionando bem
    if (newAlerts.length === 0) {
      newAlerts.push({
        id: 'sistema-ok',
        type: 'success',
        category: 'SISTEMA',
        title: 'Sistema funcionando perfeitamente! ✨',
        message: 'Não há pendências ou alertas no momento. Continue o ótimo trabalho!',
        priority: 'low',
        timestamp: hoje,
        actionable: false
      })
    }

    // Ordenar por prioridade e data
    newAlerts.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })

    setAlerts(newAlerts)
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return AlertCircle
      case 'warning': return Clock
      case 'success': return CheckCircle
      default: return FileText
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-50 border-red-200 text-red-800'
      case 'warning': return 'bg-amber-50 border-amber-200 text-amber-800'
      case 'success': return 'bg-green-50 border-green-200 text-green-800'
      default: return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-300'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    if (filter !== 'all' && alert.priority !== filter) return false
    if (categoryFilter !== 'all' && alert.category !== categoryFilter) return false
    return true
  })

  const categories = Array.from(new Set(alerts.map(a => a.category)))

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todas Prioridades</option>
          <option value="high">Alta Prioridade</option>
          <option value="medium">Média Prioridade</option>
          <option value="low">Baixa Prioridade</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todas Categorias</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <div className="ml-auto text-sm text-gray-600 flex items-center gap-2">
          <span className="font-semibold">{filteredAlerts.length}</span>
          alerta(s) encontrado(s)
        </div>
      </div>

      {/* Lista de Alertas */}
      <div className="space-y-3">
        {filteredAlerts.map(alert => {
          const Icon = getAlertIcon(alert.type)
          return (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border ${getAlertColor(alert.type)} hover:shadow-md transition-all cursor-pointer`}
              onClick={() => alert.link && window.location.href = alert.link}
            >
              <div className="flex items-start gap-3">
                <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{alert.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityBadge(alert.priority)}`}>
                      {alert.priority === 'high' ? 'Alta' : alert.priority === 'medium' ? 'Média' : 'Baixa'}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                      {alert.category}
                    </span>
                  </div>
                  <p className="text-sm">{alert.message}</p>
                  {alert.actionable && alert.link && (
                    <button className="text-sm font-medium mt-2 hover:underline">
                      Tomar ação →
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Nenhum alerta encontrado com estes filtros</p>
        </div>
      )}
    </div>
  )
}