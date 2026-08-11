// Env vars are injected by Expo at build time — only `EXPO_PUBLIC_*` keys are bundled.
const env = process.env as Record<string, string | undefined>;

/** OAuth Web Client ID for Google Sign-in (see .env → EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID). */
export const GOOGLE_WEB_CLIENT_ID = env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ?? "";
