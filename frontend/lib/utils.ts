import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Função 'cn' (class names) para mesclar classes do Tailwind CSS.
 * Ela combina as classes de forma inteligente, resolvendo conflitos.
 * Ex: cn("p-4", "p-2") resulta em "p-2" (o último prevalece).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
