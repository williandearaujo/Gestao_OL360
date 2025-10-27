"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { navigationItems } from '@/components/layout/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 border-r border-ol-border dark:border-darkOl-border bg-white dark:bg-darkOl-bg">
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-1 px-4">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-ol-primary text-white dark:bg-darkOl-primary'
                    : 'text-ol-text dark:text-darkOl-text hover:bg-ol-bg dark:hover:bg-darkOl-cardBg'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
