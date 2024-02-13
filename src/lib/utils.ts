import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatNumber = (value: number) => {
  return new Intl.NumberFormat(navigator.language, { maximumSignificantDigits: 8 }).format(value);
}
