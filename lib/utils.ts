import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function isArabic(text: string): boolean {
  if (!text) return false;
  // Count Arabic characters (including extended ranges)
  const arabicChars = text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g) || [];
  // Count all alphanumeric characters to get a base for the percentage
  // We use \p{L} for any letter and \p{N} for any number
  const totalLetters = text.match(/[\p{L}\p{N}]/gu) || [];
  
  if (totalLetters.length === 0) {
    // Fallback: if there are no alphanumeric characters but we have Arabic ones, it's Arabic
    return arabicChars.length > 0;
  }
  
  return (arabicChars.length / totalLetters.length) > 0.3;
}
export function capitalize(str: string): string {
  if (!str) return str;
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
