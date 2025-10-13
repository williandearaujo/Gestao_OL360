'use client'

import React, { useState } from 'react'
import { Users, Shield, Settings, Database, Bell, Mail, Lock, Trash2, Edit, Plus, Search } from 'lucide-react'

interface Usuario {
  id: string
  nome: string
  email: string
  role: string
  ativo: boolean
  ultimo_acesso?: string
  criado_em: string
}

interface Configuracao {
  chave: string
  valor: string
  descricao: string
  categoria: string
}

export default function AdminPageComplete() {
  const [activeTab, setActiveTab] = useState('usuarios')
  const [usuarios, setUsuarios] = useState<Usuario[]>([
    {
      id: '1',
      nome: 'Admin Sistema',
      email: 'admin@ol360.com',
      role: 'ADMIN',
      ativo: true,
      ultimo_acesso: '2025-01-10',
      criado_em: '2024-01-01'
    }
  ])
  const [configuracoes, setConfiguracoes] = useState<Configuracao[]>([
    { chave: 'sistema.nome', valor: 'Gestão OL 360', descricao: 'Nome do sistema', categoria: 'SISTEMA' },
    { chave: 'email.remetente', valor: 'noreply@ol360.com', descricao: 'Email remetente', categoria: 'EMAIL' },
    { chave: 'notificacao.ativa', valor: 'true', descricao: 'Notificações ativas', categoria: 'NOTIFICACAO' },
    { chave: 'pdi.prazo_padrao', valor: '90', descricao: 'Prazo padrão PDI (dias)', categoria: 'PDI' },
    { chave: '1x1.frequencia_padrao', valor: '30', descricao: 'Frequência 1:1 (dias)', categoria: 'ONE_TO_ONE' },
    { chave: 'avaliacao.ciclo', valor: '180', descricao: 'Ciclo de avaliação (dias)', categoria: 'AVALIACAO' }
  ])

  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<Usuario | null>(null)
  const [newUser, setNewUser] = useState({
    nome: '',
    email: '',
    senha: '',
    role: 'COLABORADOR',
    ativo: true
  })

  const [busca, setBusca] = useState('')
  const [editingConfig, setEditingConfig] = useState<string | null>(null)
  const [configValues, setConfigValues] = useState<Record<string, string>>({})

  const tabs = [
    { id: 'usuarios', label: 'Usuários', icon: Users },
    { id: 'roles', label: 'Permissões', icon: Shield },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
    { id: 'sistema', label: 'Sistema', icon: Database },
    { id: 'notificacoes', label: 'Notificações', icon: Bell }
  ]

  const roles = [
    { value: 'ADMIN', label: 'Administrador', desc: 'Acesso total ao sistema', color: 'text-red-600 bg-red-100' },
    { value: 'DIRETORIA', label: 'Diretoria', desc: 'Visão completa da empresa', color: 'text-purple-600 bg-purple-100' },
    { value: 'GERENTE', label: 'Gerente', desc: 'Gerencia equipes', color: 'text-blue-600 bg-blue-100' },
    { value: 'COLABORADOR', label: 'Colaborador', desc: 'Usuário padrão', color: 'text-green-600 bg-green-100' }
  ]

  const handleSaveUser = () => {
    if (editingUser) {
      setUsuarios(usuarios.map(u =>
        u.id === editingUser.id
          ? { ...u, ...newUser, id: editingUser.id }
          : u
      ))
    } else {
      const usuario: Usuario = {
        id: Date.now().toString(),
        nome: newUser.nome,
        email: newUser.email,
        role: newUser.role,
        ativo: newUser.ativo,
        criado_em: new Date().toISOString().split('T')[0]
      }
      setUsuarios([...usuarios, usuario])
    }
    setShowUserModal(false)
    setEditingUser(null)
    setNewUser({ nome: '', email: '', senha: '', role: 'COLABORADOR', ativo: true })
  }

  const handleEditUser = (usuario: Usuario) => {
    setEditingUser(usuario)
    setNewUser({
      nome: usuario.nome,
      email: usuario.email,
      senha: '',
      role: usuario.role,
      ativo: usuario.ativo
    })
    setShowUserModal(true)
  }

  const handleDeleteUser = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      setUsuarios(usuarios.filter(u => u.id !== id))
    }
  }

  const handleToggleUserStatus = (id: string) => {
    setUsuarios(usuarios.map(u =>
      u.id === id ? { ...u, ativo: !u.ativo } : u
    ))
  }

  const handleEditConfig = (chave: string) => {
    const config = configuracoes.find(c => c.chave === chave)
    if (config) {
      setConfigValues({ ...configValues, [chave]: config.valor })
      setEditingConfig(chave)
    }
  }

  const handleSaveConfig = (chave: string) => {
    setConfiguracoes(configuracoes.map(c =>
      c.chave === chave ? { ...c, valor: configValues[chave] || c.valor } : c
    ))
    setEditingConfig(null)
  }

  const usuariosFiltrados = usuarios.filter(u =>
    u.nome.toLowerCase().includes(busca.toLowerCase()) ||
    u.email.toLowerCase().includes(busca.toLowerCase())
  )

  const configsPorCategoria = configuracoes.reduce((acc, config) => {
    if (!acc[config.categoria]) acc[config.categoria] = []
    acc[config.categoria].push(config)
    return acc
  }, {} as Record<string, Configuracao[]>)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Administração do Sistema</h1>
              <p className="text-gray-600 mt-2">Gerencie usuários, permissões e configurações</p>
            </div>
            <Shield className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b overflow-x-auto">
            <div className="flex">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="p-6">
            {/* TAB: Usuários */}
            {activeTab === 'usuarios' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex-1 max-w-md relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      placeholder="Buscar usuários..."
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setEditingUser(null)
                      setNewUser({ nome: '', email: '', senha: '', role: 'COLABORADOR', ativo: true })
                      setShowUserModal(true)
                    }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Novo Usuário
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nome</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Função</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Último Acesso</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {usuariosFiltrados.map(usuario => {
                        const roleInfo = roles.find(r => r.value === usuario.role)
                        return (
                          <tr key={usuario.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{usuario.nome}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{usuario.email}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleInfo?.color}`}>
                                {roleInfo?.label}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleToggleUserStatus(usuario.id)}
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  usuario.ativo 
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                }`}
                              >
                                {usuario.ativo ? 'Ativo' : 'Inativo'}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {usuario.ultimo_acesso
                                ? new Date(usuario.ultimo_acesso).toLocaleDateString('pt-BR')
                                : 'Nunca'
                              }
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleEditUser(usuario)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                  title="Editar"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(usuario.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: Permissões */}
            {activeTab === 'roles' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Funções e Permissões do Sistema</h3>
                {roles.map(role => (
                  <div key={role.value} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${role.color}`}>
                            {role.label}
                          </span>
                          <span className="text-sm text-gray-600">
                            {usuarios.filter(u => u.role === role.value).length} usuário(s)
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{role.desc}</p>

                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-gray-700">Permissões:</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {role.value === 'ADMIN' && (
                              <>
                                <span className="text-xs text-gray-600">✓ Gerenciar usuários</span>
                                <span className="text-xs text-gray-600">✓ Configurar sistema</span>
                                <span className="text-xs text-gray-600">✓ Acesso total aos dados</span>
                                <span className="text-xs text-gray-600">✓ Logs e auditoria</span>
                              </>
                            )}
                            {role.value === 'DIRETORIA' && (
                              <>
                                <span className="text-xs text-gray-600">✓ Ver todos colaboradores</span>
                                <span className="text-xs text-gray-600">✓ Relatórios completos</span>
                                <span className="text-xs text-gray-600">✓ Aprovar avaliações</span>
                                <span className="text-xs text-gray-600">✓ Dados financeiros</span>
                              </>
                            )}
                            {role.value === 'GERENTE' && (
                              <>
                                <span className="text-xs text-gray-600">✓ Ver equipe</span>
                                <span className="text-xs text-gray-600">✓ Criar PDIs</span>
                                <span className="text-xs text-gray-600">✓ Agendar 1:1s</span>
                                <span className="text-xs text-gray-600">✓ Avaliar subordinados</span>
                              </>
                            )}
                            {role.value === 'COLABORADOR' && (
                              <>
                                <span className="text-xs text-gray-600">✓ Ver próprios dados</span>
                                <span className="text-xs text-gray-600">✓ Acompanhar PDI</span>
                                <span className="text-xs text-gray-600">✓ Ver avaliações</span>
                                <span className="text-xs text-gray-600">✓ Solicitar férias</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: Configurações */}
            {activeTab === 'configuracoes' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Configurações do Sistema</h3>
                {Object.entries(configsPorCategoria).map(([categoria, configs]) => (
                  <div key={categoria}>
                    <h4 className="text-md font-semibold text-gray-700 mb-3 pb-2 border-b">
                      {categoria}
                    </h4>
                    <div className="space-y-3">
                      {configs.map(config => (
                        <div key={config.chave} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900">{config.chave}</div>
                            <div className="text-xs text-gray-500">{config.descricao}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {editingConfig === config.chave ? (
                              <>
                                <input
                                  type="text"
                                  value={configValues[config.chave] || config.valor}
                                  onChange={(e) => setConfigValues({ ...configValues, [config.chave]: e.target.value })}
                                  className="px-2 py-1 border rounded text-sm w-48"
                                />
                                <button
                                  onClick={() => handleSaveConfig(config.chave)}
                                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                >
                                  Salvar
                                </button>
                                <button
                                  onClick={() => setEditingConfig(null)}
                                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                                >
                                  Cancelar
                                </button>
                              </>
                            ) : (
                              <>
                                <span className="px-3 py-1 bg-white border rounded text-sm font-mono min-w-[200px]">
                                  {config.valor}
                                </span>
                                <button
                                  onClick={() => handleEditConfig(config.chave)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: Sistema */}
            {activeTab === 'sistema' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Informações do Sistema</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Versão</h4>
                    <p className="text-2xl font-bold text-blue-700">v1.0.0</p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Status</h4>
                    <p className="text-2xl font-bold text-green-700">✓ Operacional</p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-900 mb-2">Usuários Ativos</h4>
                    <p className="text-2xl font-bold text-purple-700">
                      {usuarios.filter(u => u.ativo).length}
                    </p>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-semibold text-amber-900 mb-2">Banco de Dados</h4>
                    <p className="text-2xl font-bold text-amber-700">PostgreSQL</p>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Ações de Sistema</h4>
                  <div className="space-y-2">
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-left">
                      🔄 Fazer Backup do Banco de Dados
                    </button>
                    <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-left">
                      📊 Gerar Relatório de Auditoria
                    </button>
                    <button className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-left">
                      🧹 Limpar Logs Antigos
                    </button>
                    <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-left">
                      🔒 Forçar Logout de Todos Usuários
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Notificações */}
            {activeTab === 'notificacoes' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Configurações de Notificações</h3>

                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">Notificações por Email</h4>
                        <p className="text-sm text-gray-600">Enviar notificações importantes por email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">Notificações de PDI</h4>
                        <p className="text-sm text-gray-600">Alertas sobre PDIs vencendo</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">Notificações de 1:1</h4>
                        <p className="text-sm text-gray-600">Lembretes de reuniões agendadas</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">Notificações de Avaliação</h4>
                        <p className="text-sm text-gray-600">Alertas sobre avaliações pendentes</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Usuário */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h3>
              <button onClick={() => setShowUserModal(false)} className="text-white hover:bg-blue-700 p-1 rounded">
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
                <input
                  type="text"
                  value={newUser.nome}
                  onChange={(e) => setNewUser({ ...newUser, nome: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {editingUser ? 'Nova Senha (deixe vazio para manter)' : 'Senha *'}
                </label>
                <input
                  type="password"
                  value={newUser.senha}
                  onChange={(e) => setNewUser({ ...newUser, senha: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Função *</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={newUser.ativo}
                  onChange={(e) => setNewUser({ ...newUser, ativo: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="ativo" className="text-sm font-medium text-gray-700">
                  Usuário ativo
                </label>
              </div>
            </div>

            <div className="border-t p-4 flex justify-end gap-2">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveUser}
                disabled={!newUser.nome || !newUser.email || (!editingUser && !newUser.senha)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingUser ? 'Salvar' : 'Criar Usuário'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}