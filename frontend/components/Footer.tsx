'use client'

type HeaderProps = {
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
}


const Footer = ({ className = '' }: { className?: string }) => (
  <footer className={`${className} bg-white border-t border-[#cccccc] p-4 shadow-inner text-center text-sm text-gray-500`}>
    © {new Date().getFullYear()} OL Gestão 360 - Sistema Online
  </footer>
)

export default Footer
