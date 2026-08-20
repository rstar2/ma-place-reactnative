import tailwindColors from "tailwindcss/colors";
import { rgb, formatRgb } from "culori";
/**
 * This file contains the theme constants for the application, including colors, spacing, and component-specific styles
 * These constants are used throughout the app to maintain a consistent look and feel.
 *
 * It's actually "same" values as in the globals.css, but in TypeScript for type safety and intellisense.
 */

export function withAlpha(color: string, alpha: number): string {
  const c = rgb(color);
  // parses   hex / rgb / oklch / named → rgb
  return c ? formatRgb({ ...c, alpha }) : color; // "rgba(220, 38,  38, 0.1)"
}

const colors = {
  background: "#fff9e3",
  foreground: "#081126",
  card: "#fff8e7",
  muted: "#f6eecf",
  mutedForeground: "rgba(0, 0, 0, 0.6)",
  primary: "#081126",
  accent: "#ea7a53",
  border: "rgba(0, 0, 0, 0.1)",
  success: "#16a34a",
  destructive: "#dc2626",
  place: "#8fd1bd",

  tag: {
    parking: "#f5c542",
    crag: "#b8e8d0",
    sleep: "#e8def8",
    water: "#b8d4e3",
    oil: "#f8c8b8",
    playground: "#c8d9f8",
    place: "#c8d9f8",
  },

  toast: {
    // success: formatRgb(tailwindColors.green[900]),
    success: withAlpha(tailwindColors.green[400], 0.3), // adds some transparency
    error: withAlpha(tailwindColors.red[300], 0.5),
  },
} as const;

const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  18: 72,
  20: 80,
  24: 96,
  30: 120,
} as const;

const components = {
  tabBar: {
    height: spacing[18],
    horizontalInset: spacing[5],
    radius: spacing[8],
    iconFrame: spacing[12],
    iconSize: spacing[8],
    itemPaddingVertical: spacing[2],
  },
} as const;

export const theme = {
  colors,
  spacing,
  components,
} as const;
