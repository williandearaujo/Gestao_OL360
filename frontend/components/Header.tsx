'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  User,
  BarChart3,
  Users,
  BookOpen,
  Link as LucideLink,
  Settings,
  Bell,
  Sun,
  Moon,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

type HeaderProps = {
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
}

function Logo({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <img
      src={theme === 'dark' ? '/images/lg_t_dark.png' : '/images/lg_t_white.png'}
      alt="Logo OL"
      className="w-28 h-auto select-none"
      draggable={false}
    />
  )
}

export default function Header({ theme, setTheme }: HeaderProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const companyName = 'OL Gestão 360'

  const firstName = user?.full_name ? user.full_name.split(' ')[0] : 'Usuário'

  const navigation = [
    {
      name: 'Alertas',
      href: '/dashboard/alertas',
      icon: <Bell className="w-6 h-6" />,
      enabled: true,
      tooltip: 'Veja seus alertas',
    },
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <BarChart3 className="w-6 h-6" />,
      enabled: true,
    },
    {
      name: 'Colaboradores',
      href: '/dashboard/colaboradores',
      icon: <Users className="w-6 h-6" />,
      enabled: true,
    },
    {
      name: 'Conhecimentos',
      href: '/dashboard/conhecimentos',
      icon: <BookOpen className="w-6 h-6" />,
      enabled: true,
    },
    {
      name: 'Vínculos',
      href: '/dashboard/vinculos',
      icon: <LucideLink className="w-6 h-6" />,
      enabled: true,
    },
    {
      name: 'Admin',
      href: '/dashboard/admin',
      icon: <Settings className="w-6 h-6 text-[#821314]" />,
      enabled: true,
    },
  ]

  const pageTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/dashboard/colaboradores': 'Colaboradores',
    '/dashboard/alertas': 'Alertas',
    '/dashboard/conhecimentos': 'Conhecimentos',
    '/dashboard/vinculos': 'Vínculos',
    '/dashboard/admin': 'Administração',
  }

  const getPageTitle = () => pageTitles[pathname] || 'Sistema'

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light')

  return (
    <header className="bg-ol-primary dark:bg-darkOl-primary text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo e Nome da Empresa */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Logo theme={theme} />
            </Link>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold">{companyName}</h1>
              <p className="text-xs text-ol-grayLight dark:text-darkOl-grayLight">
                {getPageTitle()}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-white/20 text-white font-semibold'
                      : 'text-ol-grayLight hover:bg-white/10 hover:text-white'
                  }`}
                  title={item.tooltip}
                >
                  {item.icon}
                  <span className="text-sm">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Menu e Actions */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title={theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{firstName}</p>
                <p className="text-xs text-ol-grayLight dark:text-darkOl-grayLight">
                  {user?.role || 'Usuário'}
                </p>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Sair"
              >
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden pb-4">
          <nav className="flex items-center gap-2 overflow-x-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-white/20 text-white font-semibold'
                      : 'text-ol-grayLight hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span className="text-sm">{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}