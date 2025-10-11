'use client'

import Link from 'next/link'

export default function ComingSoon() {
  return (
    <div className="bg-ol-bg dark:bg-darkOl-bg text-ol-black dark:text-darkOl-white min-h-[60vh] flex flex-col items-center justify-center p-6 rounded-xl shadow-lg select-none transition-colors">
      <video
        src="/Under_Construction.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="w-48 sm:w-64 mb-8 rounded-lg drop-shadow-lg"
        aria-label="Módulo em construção - vídeo animado"
      />

      <h1 className="text-4xl font-extrabold mb-4 tracking-wide">Módulo em Construção</h1>

      <p className="text-lg text-ol-grayMedium dark:text-darkOl-grayMedium max-w-md mb-6">
        Estamos trabalhando para trazer essa funcionalidade em breve. Enquanto isso, aproveite para explorar outras áreas do sistema.
      </p>

      <Link
        href="/dashboard"
        className="inline-block px-8 py-3 rounded-full bg-ol-primary text-white font-semibold shadow-md hover:bg-ol-primary-dark dark:bg-darkOl-primary dark:hover:bg-darkOl-primary-dark transition-colors"
      >
        Voltar para Dashboard
      </Link>
    </div>
  )
}
