'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { login } from '@/lib/api'
import Footer from '@/components/Footer'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) setTheme(savedTheme)
    else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
    }
    // Debug: show API url env variable
    console.log('API URL:', process.env.NEXTPUBLICAPIURL)
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    console.log("Tentando login com:", email, password)  // Log de entrada

    try {
      const data = await login(email, password)
      console.log("Resposta login:", data)  // Log da resposta

      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))

      console.log("Token armazenado:", localStorage.getItem('token'))  // Verifica token
      console.log("Usuário armazenado:", localStorage.getItem('user'))  // Verifica usuário

      console.log("Redirecionando para dashboard")
      router.push('/dashboard')

    } catch (err: any) {
      console.error("Erro no login:", err)  // Log detalhado do erro
      setError(err.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ol-bg dark:bg-darkOl-bg flex flex-col justify-center p-4">
      <div className="flex-grow flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 animate-fadeIn">
          <img
            src={theme === 'dark' ? '/images/lg_t_dark.png' : '/images/lg_t_white.png'}
            alt="Logo OL Tema"
            className="mx-auto mb-6 w-40 h-auto select-none"
            draggable={false}
          />

          <h1 className="text-3xl font-bold text-center mb-8 text-ol-primary dark:text-darkOl-primary">
            Gestão 360 OL
          </h1>

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded transition animate-shake"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@ol360.com"
                required
                disabled={loading}
                autoFocus
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ol-primary focus:border-transparent text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="admin123"
                  required
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ol-primary focus:border-transparent text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(x => !x)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  disabled={loading}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full bg-ol-primary dark:bg-darkOl-primary text-white py-2 px-4 rounded-lg hover:bg-ol-hover dark:hover:bg-darkOl-hover transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>🔐 Credenciais padrão:</p>
            <p className="font-mono">admin@ol360.com / Admin@123456</p>
            <p className="font-mono">diretoria@ol360.com / Diretoria@123</p>
            <p className="font-mono">gerente1@ol360.com / Gerente@123</p>
            <p className="font-mono">colaborador1@ol360.com / Colab@123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
