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
  //   return clsx(inputs);
}

export function isBoolean(v: any): v is boolean {
  return typeof v === "boolean";
}
export function isString(v: any): v is string {
  return v instanceof String || typeof v === "string";
}

export function toGeoPointCoordinate(val: number | string): string {
  // 1. convert num to real Number if necessary,
  // 2. use up to 6 precision points (toFixed(6) - it return String
  return Number(val).toFixed(6);
}

// Mean Earth radius, in km — used by the haversine formula below.
const EARTH_RADIUS_KM = 6371;

/**
 * Great-circle distance between two coordinates via the haversine formula, in km.
 * Accurate enough for "nearby" filtering; not for navigation-grade math.
 */
export function distanceKm(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(toLat - fromLat);
  const dLng = toRad(toLng - fromLng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(fromLat)) * Math.cos(toRad(toLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

/**
 * Whether the coordinate is within `radiusKm` of the user's current position.
 * `userLocation` is the user's region (a `{latitude, longitude}` — a maps
 * `Region` satisfies it). While it is unknown — still resolving, or permission
 * denied — we can't filter, so everything counts as nearby (keeps the list
 * populated instead of flashing "No places nearby").
 */
export function isNearBy(
  userLocation: { latitude: number; longitude: number },
  placeLocation: { latitude: number; longitude: number },
  radiusKm: number,
): boolean {
  return (
    distanceKm(
      userLocation.latitude,
      userLocation.longitude,
      placeLocation.latitude,
      placeLocation.longitude,
    ) <= radiusKm
  );
}
