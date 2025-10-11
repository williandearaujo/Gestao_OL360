'use client'

import { useState } from 'react'
import { createColaborador } from '@/lib/api'
import { useRouter } from 'next/navigation'

export default function NovoColaboradorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome_completo: '',
    cpf: '',
    rg: '',
    data_nascimento: '',
    estado_civil: 'SOLTEIRO',
    email_pessoal: '',
    email_corporativo: '',
    telefone_pessoal: '',
    telefone_corporativo: '',
    endereco: '',
    cargo: '',
    departamento: '',
    data_admissao: '',
    salario: '',
    status: 'ATIVO',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createColaborador({
        ...formData,
        salario: formData.salario ? parseFloat(formData.salario) : undefined,
      } as any)

      alert('Colaborador criado com sucesso!')
      router.push('/dashboard/colaboradores')
    } catch (error: any) {
      alert(error.response?.data?.detail || error.message || 'Erro desconhecido no cadastro.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-ol-bg dark:bg-darkOl-bg min-h-screen p-6 text-ol-black dark:text-darkOl-white max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Novo Colaborador</h1>
        <p className="text-ol-grayMedium dark:text-darkOl-grayMedium mt-1">Preencha os dados do novo colaborador</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-ol-white dark:bg-darkOl-grayLight rounded-lg shadow p-6 space-y-6">
        {/* Dados Pessoais */}
        <div>
          <h2 className="text-xl font-semibold text-ol-black dark:text-darkOl-white mb-4 border-b pb-2">
            Dados Pessoais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-ol-black dark:text-darkOl-white">
                Nome Completo *
              </label>
              <input
                type="text"
                name="nome_completo"
                value={formData.nome_completo}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkOl-border rounded-lg focus:ring-2 focus:ring-ol-primary focus:border-transparent bg-white dark:bg-darkOl-bg text-ol-black dark:text-darkOl-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-ol-black dark:text-darkOl-white">
                CPF *
              </label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                required
                placeholder="000.000.000-00"
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkOl-border rounded-lg focus:ring-2 focus:ring-ol-primary focus:border-transparent bg-white dark:bg-darkOl-bg text-ol-black dark:text-darkOl-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-ol-black dark:text-darkOl-white">RG</label>
              <input
                type="text"
                name="rg"
                value={formData.rg}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkOl-border rounded-lg focus:ring-2 focus:ring-ol-primary focus:border-transparent bg-white dark:bg-darkOl-bg text-ol-black dark:text-darkOl-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-ol-black dark:text-darkOl-white">Data de Nascimento *</label>
              <input
                type="date"
                name="data_nascimento"
                value={formData.data_nascimento}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkOl-border rounded-lg focus:ring-2 focus:ring-ol-primary focus:border-transparent bg-white dark:bg-darkOl-bg text-ol-black dark:text-darkOl-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-ol-black dark:text-darkOl-white">Estado Civil</label>
              <select
                name="estado_civil"
                value={formData.estado_civil}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkOl-border rounded-lg focus:ring-2 focus:ring-ol-primary focus:border-transparent bg-white dark:bg-darkOl-bg text-ol-black dark:text-darkOl-white"
              >
                <option value="SOLTEIRO">Solteiro</option>
                <option value="CASADO">Casado</option>
                <option value="DIVORCIADO">Divorciado</option>
                <option value="VIUVO">Viúvo</option>
                <option value="UNIAO_ESTAVEL">União Estável</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contato */}
        <div>
          <h2 className="text-xl font-semibold text-ol-black dark:text-darkOl-white mb-4 border-b pb-2">
            Contato
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-ol-black dark:text-darkOl-white">Email Corporativo *</label>
              <input
                type="email"
                name="email_corporativo"
                value={formData.email_corporativo}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkOl-border rounded-lg focus:ring-2 focus:ring-ol-primary focus:border-transparent bg-white dark:bg-darkOl-bg text-ol-black dark:text-darkOl-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-ol-black dark:text-darkOl-white">Email Pessoal</label>
              <input
                type="email"
                name="email_pessoal"
                value={formData.email_pessoal}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkOl-border rounded-lg focus:ring-2 focus:ring-ol-primary focus:border-transparent bg-white dark:bg-darkOl-bg text-ol-black dark:text-darkOl-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-ol-black dark:text-darkOl-white">Telefone Corporativo</label>
              <input
                type="tel"
                name="telefone_corporativo"
                value={formData.telefone_corporativo}
                onChange={handleChange}
                placeholder="(00) 0000-0000"
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkOl-border rounded-lg focus:ring-2 focus:ring-ol-primary focus:border-transparent bg-white dark:bg-darkOl-bg text-ol-black dark:text-darkOl-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-ol-black dark:text-darkOl-white">Telefone Pessoal</label>
              <input
                type="tel"
                name="telefone_pessoal"
                value={formData.telefone_pessoal}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkOl-border rounded-lg focus:ring-2 focus:ring-ol-primary focus:border-transparent bg-white dark:bg-darkOl-bg text-ol-black dark:text-darkOl-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-ol-black dark:text-darkOl-white">Endereço</label>
              <textarea
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkOl-border rounded-lg focus:ring-2 focus:ring-ol-primary focus:border-transparent bg-white dark:bg-darkOl-bg text-ol-black dark:text-darkOl-white"
              />
            </div>
          </div>
        </div>

        {/* Dados Profissionais */}
        <div>
          <h2 className="text-xl font-semibold text-ol-black dark:text-darkOl-white mb-4 border-b pb-2">
            Dados Profissionais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-ol-black dark:text-darkOl-white">Cargo *</label>
              <input
                type="text"
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkOl-border rounded-lg focus:ring-2 focus:ring-ol-primary focus:border-transparent bg-white dark:bg-darkOl-bg text-ol-black dark:text-darkOl-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-ol-black dark:text-darkOl-white">Departamento *</label>
              <input
                type="text"
                name="departamento"
                value={formData.departamento}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkOl-border rounded-lg focus:ring-2 focus:ring-ol-primary focus:border-transparent bg-white dark:bg-darkOl-bg text-ol-black dark:text-darkOl-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-ol-black dark:text-darkOl-white">Data de Admissão *</label>
              <input
                type="date"
                name="data_admissao"
                value={formData.data_admissao}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkOl-border rounded-lg focus:ring-2 focus:ring-ol-primary focus:border-transparent bg-white dark:bg-darkOl-bg text-ol-black dark:text-darkOl-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-ol-black dark:text-darkOl-white">Salário (R$)</label>
              <input
                type="number"
                name="salario"
                value={formData.salario}
                onChange={handleChange}
                step="0.01"
                placeholder="0,00"
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkOl-border rounded-lg focus:ring-2 focus:ring-ol-primary focus:border-transparent bg-white dark:bg-darkOl-bg text-ol-black dark:text-darkOl-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-ol-black dark:text-darkOl-white">Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkOl-border rounded-lg focus:ring-2 focus:ring-ol-primary focus:border-transparent bg-white dark:bg-darkOl-bg text-ol-black dark:text-darkOl-white"
              >
                <option value="ATIVO">Ativo</option>
                <option value="FERIAS">Férias</option>
                <option value="AFASTADO">Afastado</option>
                <option value="DESLIGADO">Desligado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-ol-primary text-white rounded-lg hover:bg-ol-primary-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Salvando...' : 'Salvar Colaborador'}
          </button>
        </div>
      </form>
    </div>
  )
}
