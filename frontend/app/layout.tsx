'use client'

import './globals.css'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { AuthProvider } from '@/contexts/AuthContext'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname === '/login'

  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme && savedTheme !== theme) {
      setTheme(savedTheme)
    } else if (!savedTheme) {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(systemPrefersDark ? 'dark' : 'light')
    }
  }, []) // roda uma única vez no mount

  useEffect(() => {
    // Sincroniza localStorage ao alterar o tema
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <html lang="pt-BR" className={theme === 'dark' ? 'dark' : ''}>
      <body className="min-h-screen flex flex-col bg-ol-bg text-ol-text dark:bg-darkOl-bg dark:text-darkOl-text relative pb-16">
        <AuthProvider>
          {!isLogin && <Header theme={theme} setTheme={setTheme} />}
          <main
            className={`flex-grow ${
              isLogin ? 'flex items-center justify-center px-4 md:px-0' : 'p-6'
            }`}
          >
            {children}
          </main>
          <Footer theme={theme} className="fixed bottom-0 left-0 w-full z-50" />
        </AuthProvider>
      </body>
    </html>
  )
}
