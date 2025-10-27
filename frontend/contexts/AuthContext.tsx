'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { login as loginRequest, getMe } from '@/lib/api'

interface User {
  id: string
  email_corporativo?: string
  email: string
  full_name: string
  role: string
  is_active: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_KEY)
    if (!storedToken) {
      setLoading(false)
      return
    }

    const bootstrap = async () => {
      try {
        setToken(storedToken)
        const profile = await getMe()
        setUser(profile)
      } catch (error) {
        console.error('Falha ao validar sessão', error)
        window.localStorage.removeItem(TOKEN_KEY)
        window.localStorage.removeItem(USER_KEY)
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    bootstrap()
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const data = await loginRequest(email, password)
      setToken(data.access_token)
      setUser(data.user)
      window.localStorage.setItem(TOKEN_KEY, data.access_token)
      window.localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      router.push('/dashboard')
    } catch (error) {
      throw error instanceof Error ? error : new Error('Erro ao realizar login')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    window.localStorage.removeItem(TOKEN_KEY)
    window.localStorage.removeItem(USER_KEY)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}
