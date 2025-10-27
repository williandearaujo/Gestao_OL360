"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

interface OLButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "danger" | "success" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

/**
 * Botão padrão OL Tecnologia
 * Compatível com tema claro/escuro, ícones e estado de carregamento.
 */
export default function OLButton({
  variant = "primary",
  size = "md",
  loading = false,
  iconLeft,
  iconRight,
  className,
  children,
  disabled,
  ...props
}: OLButtonProps) {
  const base = `
    inline-flex items-center justify-center font-medium rounded-lg transition-all
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed gap-2
  `;

  const variants: Record<string, string> = {
    primary:
      "bg-ol-primary text-white hover:bg-ol-hover focus:ring-ol-light dark:bg-darkOl-primary dark:hover:bg-darkOl-hover",
    outline:
      "border border-ol-border text-ol-text hover:bg-ol-hover/10 dark:border-darkOl-border dark:text-darkOl-text dark:hover:bg-darkOl-hover/20",
    danger:
      "bg-ol-error text-white hover:bg-darkOl-error focus:ring-darkOl-error",
    success:
      "bg-green-600 text-white hover:bg-green-700 focus:ring-green-400",
    ghost:
      "text-ol-primary hover:bg-ol-hover/10 dark:text-darkOl-primary dark:hover:bg-darkOl-hover/20",
  };

  const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="animate-spin w-4 h-4" />}
      {!loading && iconLeft && <span className="flex-shrink-0">{iconLeft}</span>}
      <span>{children}</span>
      {!loading && iconRight && <span className="flex-shrink-0">{iconRight}</span>}
    </button>
  );
}
