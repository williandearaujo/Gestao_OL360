'use client'

import { useState, useEffect } from 'react'
import { getColaborador, updateColaborador } from '@/lib/api'
import { useParams, useRouter } from 'next/navigation'

export default function EditarColaboradorPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

  useEffect(() => {
    loadColaborador()
  }, [])

  const loadColaborador = async () => {
    try {
      const data = await getColaborador(params.id as string)
      setFormData({
        nome_completo: data.nome_completo || '',
        cpf: data.cpf || '',
        rg: data.rg || '',
        data_nascimento: data.data_nascimento || '',
        estado_civil: data.estado_civil || 'SOLTEIRO',
        email_pessoal: data.email_pessoal || '',
        email_corporativo: data.email_corporativo || '',
        telefone_pessoal: data.telefone_pessoal || '',
        telefone_corporativo: data.telefone_corporativo || '',
        endereco: data.endereco || '',
        cargo: data.cargo || '',
        departamento: data.departamento || '',
        data_admissao: data.data_admissao || '',
        salario: data.salario?.toString() || '',
        status: data.status || 'ATIVO',
      })
    } catch (error: any) {
      alert(error.message)
      router.push('/dashboard/colaboradores')
    } finally {
      setLoading(false)
    }
  }

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
    setSaving(true)

    try {
      await updateColaborador(params.id as string, {
        ...formData,
        salario: formData.salario ? parseFloat(formData.salario) : undefined,
      } as any)

      alert('Colaborador atualizado com sucesso!')
      router.push(`/dashboard/colaboradores/${params.id}`)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ol-primary"></div>
      </div>
    )
  }

  return (
    <div className="bg-ol-bg dark:bg-darkOl-bg min-h-screen p-6 text-ol-black dark:text-darkOl-white max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Editar Colaborador</h1>
        <p className="text-ol-grayMedium dark:text-darkOl-grayMedium mt-1">Atualize os dados do colaborador</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-ol-white dark:bg-darkOl-grayLight rounded-lg shadow p-6 space-y-6">
        {/* Dados Pessoais */}
        <div>
          <h2 className="text-xl font-semibold text-ol-black dark:text-darkOl-white mb-4 border-b pb-2">Dados Pessoais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ol-black dark:text-darkOl-white mb-1">Nome Completo *</label>
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
              <label className="block text-sm font-medium text-ol-black dark:text-darkOl-white mb-1">CPF *</label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkOl-border rounded-lg focus:ring-2 focus:ring-ol-primary focus:border-transparent bg-white dark:bg-darkOl-bg text-ol-black dark:text-darkOl-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ol-black dark:text-darkOl-white mb-1">RG</label>
              <input
                type="text"
                name="rg"
                value={formData.rg}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkOl-border rounded-lg focus:ring-2 focus:ring-ol-primary focus:border-transparent bg-white dark:bg-darkOl-bg text-ol-black dark:text-darkOl-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ol-black dark:text-darkOl-white mb-1">Data de Nascimento *</label>
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
              <label className="block text-sm font-medium text-ol-black dark:text-darkOl-white mb-1">Estado Civil</label>
              <select
                name="estado_civil"
                value={formData.estado_civil}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ol-primary focus:border-transparent bg-white dark:bg-darkOl-bg text-ol-black dark:text-darkOl-white"
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
          <h2 className="text-xl font-semibold text-ol-black dark:text-darkOl-white mb-4 border-b pb-2">Contato</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ol-black dark:text-darkOl-white mb-1">Email Corporativo *</label>
              <input
                type="email"
                name="email_corporativo"
                value={formData.email_corporativo}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ol-primary focus:border-transparent bg-white dark:bg-darkOl-bg text-ol-black dark:text-darkOl-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ol-black dark:text-darkOl-white mb-1">Email Pessoal</label>
              <input
                type="email"
                name="email_pessoal"
                value={formData.email_pessoal}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ol-primary focus:border-transparent bg-white dark:bg-darkOl-bg text-ol-black dark:text-darkOl-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ol-black dark:text-darkOl-white mb-1">Telefone Corporativo</label>
              <input
                type="tel"
                name="telefone_corporativo"
                value={formData.telefone_corporativo}
                onChange={handleChange}
                placeholder="(00) 0000-0000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ol-primary focus:border-transparent bg-white dark:bg-darkOl-bg text-ol-black dark:text-darkOl-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ol-black dark:text-darkOl-white mb-1">Telefone Pessoal</label>
              <input
                type="tel"
                name="telefone_pessoal"
                value={formData.telefone_pessoal}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ol-primary focus:border-transparent bg-white dark:bg-darkOl-bg text-ol-black dark:text-darkOl-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-ol-black dark:text-darkOl-white mb-1">Endereço</label>
              <textarea
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ol-primary focus:border-transparent bg-white dark:bg-darkOl-bg text-ol-black dark:text-darkOl-white"
              />
            </div>
          </div>
        </div>

        {/* Dados Profissionais */}
        <div>
          <h2 className="text-xl font-semibold text-ol-black dark:text-darkOl-white mb-4 border-b pb-2">Dados Profissionais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ol-black dark:text-darkOl-white mb-1">Cargo *</label>
              <input
                type="text"
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ol-primary focus:border-transparent bg-white dark:bg-darkOl-bg text-ol-black dark:text-darkOl-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ol-black dark:text-darkOl-white mb-1">Departamento *</label>
              <input
                type="text"
                name="departamento"
                value={formData.departamento}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ol-primary focus:border-transparent bg-white dark:bg-darkOl-bg text-ol-black dark:text-darkOl-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ol-black dark:text-darkOl-white mb-1">Data de Admissão *</label>
              <input
                type="date"
                name="data_admissao"
                value={formData.data_admissao}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ol-primary focus:border-transparent bg-white dark:bg-darkOl-bg text-ol-black dark:text-darkOl-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ol-black dark:text-darkOl-white mb-1">Salário (R$)</label>
              <input
                type="number"
                name="salario"
                value={formData.salario}
                onChange={handleChange}
                step="0.01"
                placeholder="0,00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ol-primary focus:border-transparent bg-white dark:bg-darkOl-bg text-ol-black dark:text-darkOl-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ol-black dark:text-darkOl-white mb-1">Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ol-primary focus:border-transparent bg-white dark:bg-darkOl-bg text-ol-black dark:text-darkOl-white"
              >
                <option value="ATIVO">Ativo</option>
                <option value="FERIAS">Férias</option>
                <option value="AFASTADO">Afastado</option>
                <option value="DESLIGADO">Desligado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Botões */}
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
            disabled={saving}
            className="px-6 py-2 bg-ol-primary text-white rounded-lg hover:bg-ol-primary-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  )
}
