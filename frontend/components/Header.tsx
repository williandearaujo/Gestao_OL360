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
      href: '/dashboard/trabalhando', // Link para página em construção
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
      href: '/dashboard/trabalhando', // Link para página em construção
      icon: <BookOpen className="w-6 h-6" />,
      enabled: true,
    },
    {
      name: 'Vínculos',
      href: '/dashboard/trabalhando', // Link para página em construção
      icon: <LucideLink className="w-6 h-6" />,
      enabled: true,
    },
    {
      name: 'Admin',
      href: '/dashboard/trabalhando', // Link para página em construção
      icon: <Settings className="w-6 h-6 text-[#821314]" />,
      enabled: true,
    },
  ]

  const pageTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/dashboard/colaboradores': 'Colaboradores',
    '/dashboard/trabalhando': 'Módulo em Construção',
  }
  const getPageTitle = () => pageTitles[pathname] || 'Sistema'

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light')

  return (
    <header className="bg-ol-bg dark:bg-darkOl-bg border-b border-ol-border dark:border-darkOl-border sticky top-0 z-50 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 max-w-[95%]">
        {/* Linha 1 */}
        <div className="flex items-center justify-between h-20 border-b border-gray-200">
          <div className="flex items-center space-x-6 min-w-[28rem]">
            <Logo theme={theme} />
            <h1
              className="text-2xl font-bold text-ol-text dark:text-darkOl-text whitespace-nowrap overflow-hidden text-ellipsis max-w-[18rem]"
              title={getPageTitle()}
            >
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex-1 text-center">
            <p className="text-lg font-semibold text-ol-primary dark:text-darkOl-primary select-none truncate">
              {companyName}
            </p>
          </div>

          <div className="flex items-center space-x-3 min-w-[14rem] justify-end">
            <button
              onClick={toggleTheme}
              aria-label="Alternar tema claro/escuro"
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              title={theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}
            >
              {theme === 'light' ? (
                <Moon className="w-6 h-6 text-gray-800" />
              ) : (
                <Sun className="w-6 h-6 text-yellow-400" />
              )}
            </button>

            <div className="hidden md:flex items-center space-x-2 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-1.5 text-gray-700 dark:text-gray-200 font-semibold max-w-[180px] truncate">
              <User className="w-6 h-6 flex-shrink-0" />
              <span title={user?.full_name}>{firstName}</span>
            </div>
            <button
              onClick={logout}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ol-primary dark:focus:ring-darkOl-primary rounded px-3 py-1 text-sm font-semibold"
              title="Sair"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Linha 2 Navegação desktop */}
        <nav className="bg-ol-bg dark:bg-darkOl-bg border-t border-ol-border dark:border-darkOl-border hidden md:block">
          <div className="flex space-x-10 py-3 max-w-[95%] mx-auto">
            {navigation.map(({ name, href, icon, enabled, tooltip }) =>
              enabled ? (
                name === 'Alertas' ? (
                  <Link
                    key={name}
                    href={href}
                    title={tooltip}
                    className="flex items-center px-6 py-2 rounded-md font-semibold text-lg text-ol-text dark:text-darkOl-text hover:text-ol-primary dark:hover:text-darkOl-primary hover:bg-ol-bg light:hover:bg-ol-bg/50 dark:hover:bg-darkOl-bg/50 transition-colors"
                  >
                    {icon}
                  </Link>
                ) : (
                  <Link
                    key={name}
                    href={href}
                    className="flex items-center px-6 py-2 rounded-md font-semibold text-lg text-ol-text dark:text-darkOl-text hover:text-ol-primary dark:hover:text-darkOl-primary hover:bg-ol-bg light:hover:bg-ol-bg/50 dark:hover:bg-darkOl-bg/50 transition-colors"
                  >
                    {icon}
                    {name}
                  </Link>
                )
              ) : (
                <div
                  key={name}
                  className="flex items-center px-6 py-2 rounded-md font-semibold text-lg text-gray-400 cursor-not-allowed opacity-50 select-none"
                >
                  {icon}
                  {name}
                </div>
              )
            )}
          </div>
        </nav>

        {/* Navegação mobile */}
        <nav className="bg-ol-bg dark:bg-darkOl-bg border-t border-ol-border dark:border-darkOl-border md:hidden">
          <div className="flex flex-wrap justify-center space-x-6 py-3 max-w-[95%] mx-auto">
            {navigation.map(({ name, href, icon, enabled }) =>
              enabled ? (
                <Link
                  key={name}
                  href={href}
                  className="flex items-center px-3 py-2 rounded-md font-semibold text-base text-ol-text dark:text-darkOl-text hover:text-ol-primary dark:hover:text-darkOl-primary hover:bg-ol-bg light:hover:bg-ol-bg/50 dark:hover:bg-darkOl-bg/50 transition-colors"
                >
                  {icon}
                  {name}
                </Link>
              ) : (
                <div
                  key={name}
                  className="flex items-center px-3 py-2 rounded-md font-semibold text-base text-gray-400 cursor-not-allowed opacity-50 select-none"
                >
                  {icon}
                  {name}
                </div>
              )
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
