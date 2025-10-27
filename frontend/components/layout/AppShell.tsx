"use client"

import { ReactNode } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface AppShellProps {
  children: ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-ol-bg text-ol-text dark:bg-darkOl-bg dark:text-darkOl-text">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      <Footer />
    </div>
  )
}
