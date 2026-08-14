import { version } from "./../node_modules/.pnpm/@react-native-firebase+auth@26.1.0_@react-native-firebase+app@26.1.0_expo@54.0.36_react_9ebce5fda289fb3e347644c05619b7ed/node_modules/@react-native-firebase/auth/lib/version";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";
import { clsx, ClassValue } from "clsx";

export function noop() {}

export function formatCurrency(value: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return value.toFixed(2);
  }
}

export function formatDateTime(value?: string, format = "MM/DD/YYYY"): string {
  if (!value) return "Not provided";

  const parsedDate = dayjs(value);
  return parsedDate.isValid() ? parsedDate.format(format) : "Not provided";
}

export function formatStatusLabel(value?: string): string {
  if (!value) return "Unknown";

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isBoolean(v: any): v is boolean {
  return typeof v === "boolean";
}
