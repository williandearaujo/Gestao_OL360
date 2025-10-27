'use client'

import './globals.css'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import AppShell from '@/components/layout/AppShell'

function LayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isAuthRoute = pathname === '/login' || pathname === '/'

  if (isAuthRoute) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ol-bg text-ol-text dark:bg-darkOl-bg dark:text-darkOl-text">
        {children}
      </div>
    )
  }

  return <AppShell>{children}</AppShell>
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-ol-bg text-ol-text antialiased dark:bg-darkOl-bg dark:text-darkOl-text">
        <ThemeProvider>
          <AuthProvider>
            <LayoutContent>{children}</LayoutContent>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
