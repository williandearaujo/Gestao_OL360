'use client'

import clsx from 'clsx'

export default function Footer({ className = '' }: { className?: string }) {
  return (
    <footer
      className={clsx(
        'border-t border-ol-border bg-white p-4 text-center text-xs text-ol-grayMedium dark:border-darkOl-border dark:bg-darkOl-cardBg dark:text-darkOl-grayMedium',
        className
      )}
    >
      &copy; {new Date().getFullYear()} OL Gestao 360
    </footer>
  )
}
