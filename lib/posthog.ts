import PostHog from "posthog-react-native";
import { POSTHOG } from "./env";

/**
 * Shared PostHog client for the Expo app. Values are embedded by Expo at build
 * time from EXPO_PUBLIC_* environment variables.
 */
export const posthog =
  POSTHOG.projectToken && POSTHOG.host
    ? new PostHog(POSTHOG.projectToken, {
        host: POSTHOG.host,
        captureAppLifecycleEvents: true,
      })
    : undefined;
