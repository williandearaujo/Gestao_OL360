'use client'

import { useState, useEffect } from 'react'
import { getColaborador, type Colaborador } from '@/lib/api'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ColaboradorDetalhesPage() {
  const params = useParams()
  const router = useRouter()
  const [colaborador, setColaborador] = useState<Colaborador | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadColaborador()
  }, [])

  const loadColaborador = async () => {
    try {
      const data = await getColaborador(params.id as string)
      setColaborador(data)
    } catch (error: any) {
      alert(error.message)
      router.push('/dashboard/colaboradores')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ol-primary"></div>
      </div>
    )
  }

  if (!colaborador) return null

  return (
    <div className="bg-ol-bg dark:bg-darkOl-bg min-h-screen max-w-5xl mx-auto p-6 text-ol-black dark:text-darkOl-white">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">{colaborador.nome_completo}</h1>
          <p className="text-ol-grayMedium dark:text-darkOl-grayMedium mt-1">
            {colaborador.cargo} • {colaborador.departamento}
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/dashboard/colaboradores/${colaborador.id}/editar`}
            className="bg-ol-primary text-white px-4 py-2 rounded-lg hover:bg-ol-primary-dark transition-colors whitespace-nowrap"
          >
            ✏️ Editar
          </Link>
          <button
            onClick={() => router.back()}
            className="bg-ol-grayLight dark:bg-darkOl-grayMedium text-ol-grayMedium dark:text-darkOl-grayLight px-4 py-2 rounded-lg hover:bg-ol-grayHover dark:hover:bg-darkOl-grayHover transition-colors whitespace-nowrap"
          >
            ← Voltar
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <span
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
            colaborador.status === 'ATIVO'
              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200'
              : colaborador.status === 'FERIAS'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
              : colaborador.status === 'AFASTADO'
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200'
              : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200'
          }`}
        >
          {colaborador.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dados Pessoais */}
          <section className="bg-ol-white dark:bg-darkOl-grayLight rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-ol-black dark:text-darkOl-white mb-4 border-b pb-2">
              Dados Pessoais
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">CPF</p>
                <p className="font-semibold text-ol-black dark:text-darkOl-white">{colaborador.cpf || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">RG</p>
                <p className="font-semibold text-ol-black dark:text-darkOl-white">{colaborador.rg || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">Data de Nascimento</p>
                <p className="font-semibold text-ol-black dark:text-darkOl-white">
                  {colaborador.data_nascimento
                    ? new Date(colaborador.data_nascimento).toLocaleDateString('pt-BR')
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">Estado Civil</p>
                <p className="font-semibold text-ol-black dark:text-darkOl-white">{colaborador.estado_civil || '-'}</p>
              </div>
            </div>
          </section>

          {/* Contato */}
          <section className="bg-ol-white dark:bg-darkOl-grayLight rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-ol-black dark:text-darkOl-white mb-4 border-b pb-2">
              Contato
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">Email Corporativo</p>
                <p className="font-semibold text-ol-primary dark:text-darkOl-primary">{colaborador.email_corporativo}</p>
              </div>
              <div>
                <p className="text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">Email Pessoal</p>
                <p className="font-semibold text-ol-black dark:text-darkOl-white">{colaborador.email_pessoal || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">Telefone Corporativo</p>
                <p className="font-semibold text-ol-black dark:text-darkOl-white">{colaborador.telefone_corporativo || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">Telefone Pessoal</p>
                <p className="font-semibold text-ol-black dark:text-darkOl-white">{colaborador.telefone_pessoal || '-'}</p>
              </div>
              {colaborador.endereco && (
                <div>
                  <p className="text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">Endereço</p>
                  <p className="font-semibold text-ol-black dark:text-darkOl-white">{colaborador.endereco}</p>
                </div>
              )}
            </div>
          </section>

          {/* Dados Profissionais */}
          <section className="bg-ol-white dark:bg-darkOl-grayLight rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-ol-black dark:text-darkOl-white mb-4 border-b pb-2">
              Dados Profissionais
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">Cargo</p>
                <p className="font-semibold text-ol-black dark:text-darkOl-white">{colaborador.cargo}</p>
              </div>
              <div>
                <p className="text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">Departamento</p>
                <p className="font-semibold text-ol-black dark:text-darkOl-white">{colaborador.departamento}</p>
              </div>
              <div>
                <p className="text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">Data de Admissão</p>
                <p className="font-semibold text-ol-black dark:text-darkOl-white">
                  {new Date(colaborador.data_admissao).toLocaleDateString('pt-BR')}
                </p>
              </div>
              {colaborador.salario && (
                <div>
                  <p className="text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">Salário</p>
                  <p className="font-semibold text-ol-success dark:text-darkOl-success">
                    R$ {colaborador.salario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Ações Rápidas */}
          <section className="bg-ol-white dark:bg-darkOl-grayLight rounded-lg shadow p-6">
            <h3 className="font-semibold text-ol-black dark:text-darkOl-white mb-4">Ações Rápidas</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 bg-ol-primary-light dark:bg-darkOl-primary-light text-ol-primary dark:text-darkOl-primary rounded-lg hover:bg-ol-primary-light-hover dark:hover:bg-darkOl-primary-light-hover transition-colors">
                📈 Ver PDI
              </button>
              <button className="w-full text-left px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                💬 Agendar 1:1
              </button>
              <button className="w-full text-left px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors">
                ⭐ Nova Avaliação
              </button>
            </div>
          </section>

          {/* Estatísticas */}
          <section className="bg-ol-white dark:bg-darkOl-grayLight rounded-lg shadow p-6">
            <h3 className="font-semibold text-ol-black dark:text-darkOl-white mb-4">Estatísticas</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">PDIs Ativos</span>
                <span className="font-bold text-ol-primary dark:text-darkOl-primary">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">One-to-Ones</span>
                <span className="font-bold text-purple-600">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">Avaliações</span>
                <span className="font-bold text-yellow-600">5</span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
