import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const TH_CLASS = "text-left px-3 py-2.5 text-xs font-medium text-tertiary uppercase tracking-wide whitespace-nowrap";
