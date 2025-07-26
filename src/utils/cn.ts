import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Función utilitaria para formatear coordenadas de manera segura
export function formatCoordinate(value: number | string | null | undefined, decimals: number = 4): string {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  
  const numValue = Number(value);
  if (isNaN(numValue)) {
    return 'N/A';
  }
  
  return numValue.toFixed(decimals);
} 