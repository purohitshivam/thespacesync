import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatInr(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function getInitials(firstName: string | null | undefined): string {
  if (!firstName) return "SS";
  const cleaned = firstName.trim();
  if (!cleaned) return "SS";
  return cleaned.slice(0, 2).toUpperCase();
}
