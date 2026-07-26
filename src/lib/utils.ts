import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getJoinedName(
  value: { name: string } | { name: string }[] | null | undefined,
  fallback = "—"
): string {
  if (!value) return fallback
  if (Array.isArray(value)) return value[0]?.name ?? fallback
  return value.name
}
