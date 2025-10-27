"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import OLButton from "./OLButton";

interface OLModalProps {
  open?: boolean;
  isOpen?: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

/**
 * Modal padrão OL Tecnologia
 * Suporta tema claro/escuro, overlay e botões de ação.
 */
export default function OLModal({
  open,
  isOpen,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = "Salvar",
  cancelText = "Cancelar",
  loading = false,
}: OLModalProps) {
  const visible = open ?? isOpen ?? false;

  useEffect(() => {
    if (visible) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fundo escuro */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Conteúdo */}
      <div className="relative bg-ol-cardBg dark:bg-darkOl-cardBg border border-ol-border dark:border-darkOl-border rounded-xl shadow-xl max-w-lg w-full mx-4 p-6 z-10 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="text-xl font-semibold text-ol-text dark:text-darkOl-text">{title}</h2>}
          <button
            onClick={onClose}
            className="text-ol-grayMedium dark:text-darkOl-grayMedium hover:text-ol-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo */}
        <div className="mb-6 text-ol-text dark:text-darkOl-text">{children}</div>

        {/* Rodapé */}
        <div className="flex justify-end gap-3">
          <OLButton variant="outline" onClick={onClose}>
            {cancelText}
          </OLButton>
          {onConfirm && (
            <OLButton variant="primary" onClick={onConfirm} loading={loading}>
              {confirmText}
            </OLButton>
          )}
        </div>
      </div>
    </div>
  );
}
