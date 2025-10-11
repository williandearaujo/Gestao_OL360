import React from "react";

export default function AvaliacoesPage() {
  return (
    <div>
  <h1 className="text-3xl font-bold mb-6">Avaliações de Performance</h1>
  <div className="bg-gray-50 rounded-lg shadow p-8 text-center font-semibold mb-8">
    <p className="text-gray-600 mb-6">
      Módulo em desenvolvimento – registre a avaliação do colaborador na plataforma externa abaixo.
    </p>
    <a
      href="https://okr.coblue.com.br/v2/login"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block p-6 border-4 border-dashed border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all duration-300 text-gray-700 text-center select-none"
    >
      <div className="text-5xl mb-4">⭐</div>
      <span className="block text-lg font-semibold">Registrar feedback no CoClue</span>
      <small className="block mt-2 text-gray-400">Abrir em nova aba</small>
    </a>
  </div>
</div>
  )
}
