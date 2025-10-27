'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, Moon, Sun, User } from 'lucide-react'
import { navigationItems } from '@/components/layout/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'

export default function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)

  const firstName = useMemo(
    () => (user?.full_name ? user.full_name.split(' ')[0] : 'Usuário'),
    [user?.full_name]
  )

  const currentTitle = useMemo(() => {
    const map: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/dashboard/alertas': 'Alertas',
      '/dashboard/colaboradores': 'Colaboradores',
      '/dashboard/conhecimentos': 'Conhecimentos',
      '/dashboard/vinculos': 'Vínculos',
      '/dashboard/admin': 'Administração',
    }
    return map[pathname] ?? 'Gestão 360'
  }, [pathname])

  return (
    <header className="sticky top-0 z-40 border-b border-ol-border bg-white/90 backdrop-blur-md dark:border-darkOl-border dark:bg-darkOl-cardBg/80">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-ol-text hover:bg-ol-bg focus:outline-none focus:ring-2 focus:ring-ol-primary dark:text-darkOl-text dark:hover:bg-darkOl-cardBg lg:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2">
            <img
              src={theme === 'dark' ? '/images/lg_t_dark.png' : '/images/lg_t_white.png'}
              alt="OL Tecnologia"
              className="h-10 w-auto select-none"
              draggable={false}
            />
            <span className="hidden text-base font-semibold text-ol-text dark:text-darkOl-text sm:block">
              OL Gestão 360
            </span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end gap-4">
          <div className="hidden flex-col sm:flex">
            <span className="text-xs text-ol-grayMedium dark:text-darkOl-grayMedium">
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
              })}
            </span>
            <strong className="text-sm text-ol-text dark:text-darkOl-text">{currentTitle}</strong>
          </div>

          <button
            onClick={toggleTheme}
            className="rounded-full bg-ol-bg p-2 text-ol-text transition-colors hover:bg-ol-cardBg dark:bg-darkOl-bg dark:text-darkOl-text dark:hover:bg-darkOl-cardBg"
            title={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <div className="flex items-center gap-3 rounded-full bg-ol-cardBg px-3 py-2 text-sm dark:bg-darkOl-cardBg">
            <div className="hidden sm:block text-right">
              <p className="font-semibold text-ol-text dark:text-darkOl-text">{firstName}</p>
              <p className="text-xs text-ol-grayMedium dark:text-darkOl-grayMedium">
                {user?.role?.toUpperCase() ?? 'USUÁRIO'}
              </p>
            </div>
            <button
              onClick={logout}
              className="rounded-full bg-ol-primary p-2 text-white transition-colors hover:bg-ol-hover dark:bg-darkOl-primary dark:hover:bg-darkOl-hover"
              title="Sair"
            >
              <User className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="hidden border-t border-ol-border bg-white px-4 py-3 dark:border-darkOl-border dark:bg-darkOl-cardBg md:block">
        <nav className="flex items-center gap-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-ol-primary text-white dark:bg-darkOl-primary'
                    : 'text-ol-text hover:bg-ol-bg dark:text-darkOl-text dark:hover:bg-darkOl-cardBg'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {mobileOpen && (
        <nav className="border-t border-ol-border bg-white px-4 py-3 dark:border-darkOl-border dark:bg-darkOl-cardBg lg:hidden">
          <ul className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={clsx(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium',
                      isActive
                        ? 'bg-ol-primary text-white dark:bg-darkOl-primary'
                        : 'text-ol-text hover:bg-ol-bg dark:text-darkOl-text dark:hover:bg-darkOl-cardBg'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      )}
    </header>
  )
}
