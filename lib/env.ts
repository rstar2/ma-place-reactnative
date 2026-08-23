// Env vars are injected by Expo at build time — only `EXPO_PUBLIC_*` keys are bundled.
const env = process.env as Record<string, string | undefined>;

/**
 * OAuth Web Client ID for Google Sign-in (see .env → EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID).
 * Must be valid!!!
 */
export const GOOGLE_WEB_CLIENT_ID =
  env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!.trim() ?? "";

export const EXPO_PUBLIC_NEARBY_RADIUS_KM =
  Number(env.EXPO_PUBLIC_NEARBY_RADIUS_KM) || 50;

export const POSTHOG = {
  projectToken: env.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN,
  host: env.EXPO_PUBLIC_POSTHOG_HOST,
};

if (__DEV__) {
  if (!POSTHOG.projectToken) {
    console.error(
      "EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN is configured",
    );
  }

  if (!POSTHOG.host) {
    console.error(
      "EXPO_PUBLIC_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once EXPO_PUBLIC_POSTHOG_HOST is configured",
    );
  }
}
