import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Генерирует уникальный идентификатор
 */
export function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}
