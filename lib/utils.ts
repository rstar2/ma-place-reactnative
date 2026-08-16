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

export function formatDateTime(
  value?: Date | string | number,
  format = "MM/DD/YYYY",
): string {
  if (!value) return "Not provided";

  const parsedDate = dayjs(value);
  return parsedDate.isValid() ? parsedDate.format(format) : "Not provided";
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isBoolean(v: any): v is boolean {
  return typeof v === "boolean";
}
