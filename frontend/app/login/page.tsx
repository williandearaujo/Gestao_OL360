'use client'

import { FormEvent, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'

export default function LoginPage() {
  const router = useRouter()
  const { login, loading } = useAuth()
  const { theme } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    try {
      setSubmitting(true)
      await login(email, password)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível realizar o login. Tente novamente.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-ol-bg px-4 py-12 text-ol-text dark:bg-darkOl-bg dark:text-darkOl-text">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl transition dark:bg-darkOl-cardBg">
        <img
          src={theme === 'dark' ? '/images/lg_t_dark.png' : '/images/lg_t_white.png'}
          alt="OL Tecnologia"
          className="mx-auto mb-6 h-16 w-auto select-none"
          draggable={false}
        />

        <h1 className="mb-4 text-center text-2xl font-semibold text-ol-text dark:text-darkOl-text">
          Bem-vindo ao Gestão 360
        </h1>
        <p className="mb-6 text-center text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">
          Faça login para acessar o painel administrativo.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
          <div className="space-y-2">
            <label className="text-sm font-medium text-ol-text dark:text-darkOl-text" htmlFor="email">
              E-mail corporativo
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoFocus
              disabled={loading || submitting}
              placeholder="diretoria@ol360.com"
              className="w-full rounded-lg border border-ol-border bg-white px-4 py-2 text-sm text-ol-text outline-none transition focus:border-ol-primary focus:ring-2 focus:ring-ol-primary/40 dark:border-darkOl-border dark:bg-darkOl-bg dark:text-darkOl-text dark:focus:border-darkOl-primary dark:focus:ring-darkOl-primary/40"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-ol-text dark:text-darkOl-text" htmlFor="password">
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                disabled={loading || submitting}
                placeholder="••••••••"
                className="w-full rounded-lg border border-ol-border bg-white px-4 py-2 pr-12 text-sm text-ol-text outline-none transition focus:border-ol-primary focus:ring-2 focus:ring-ol-primary/40 dark:border-darkOl-border dark:bg-darkOl-bg dark:text-darkOl-text dark:focus:border-darkOl-primary dark:focus:ring-darkOl-primary/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ol-grayMedium transition hover:text-ol-text dark:text-darkOl-grayMedium dark:hover:text-darkOl-text"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || submitting}
            className="flex w-full items-center justify-center rounded-lg bg-ol-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-ol-hover focus:outline-none focus:ring-2 focus:ring-ol-primary/50 disabled:cursor-not-allowed disabled:bg-ol-grayMedium dark:bg-darkOl-primary dark:hover:bg-darkOl-hover"
          >
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 space-y-1 text-center text-xs text-ol-grayMedium dark:text-darkOl-grayMedium">
          <p className="font-semibold text-ol-text dark:text-darkOl-text">Acesso rápido para testes:</p>
          <p>diretoria@ol360.com / 123@mudar</p>
        </div>
      </div>
    </div>
  )
}
