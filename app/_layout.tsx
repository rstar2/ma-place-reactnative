import { useEffect } from "react";
import { Text, View } from "react-native";
import { useFonts } from "expo-font";
import {
  SplashScreen,
  Stack,
  useRootNavigationState,
  useRouter,
  useSegments,
} from "expo-router";

import "@/assets/global.css";
import { AuthProvider, useAuth } from "@/lib/auth";
import { posthog } from "@/lib/posthog";
import { PostHogErrorBoundary, PostHogProvider } from "posthog-react-native";

// do not auto-hide the splash screen while we fetch resources, hide it when the app is ready to render
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // NOTE: The `expo-router` already wraps the root-layout in <SafeAreaProvider>,
  // so no need to wrap it again. Thus `useSafeAreaInsets` can be used directly even here

  const app = (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );

  return posthog ? (
    <PostHogProvider client={posthog}>
      <PostHogErrorBoundary fallback={PostHogErrorFallback}>
        {app}
      </PostHogErrorBoundary>
    </PostHogProvider>
  ) : (
    app
  );
}

function PostHogErrorFallback() {
  return (
    <View>
      <Text>Something went wrong. Please restart the app.</Text>
    </View>
  );
}

function RootNavigator() {
  const [fontsLoaded, fontError] = useFonts({
    "sans-regular": require("@/assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-light": require("@/assets/fonts/PlusJakartaSans-Light.ttf"),
    "sans-medium": require("@/assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("@/assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-bold": require("@/assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-extrabold": require("@/assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
  });

  const { user, initializing } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  const fontsReady = fontsLoaded || fontError;

  // Keep the splash screen up until both fonts and the persisted auth session are
  // resolved, so we render the correct group first (no auth flash).
  useEffect(() => {
    if (fontsReady && !initializing) {
      SplashScreen.hideAsync();
    }
  }, [fontsReady, initializing]);

  // Redirect based on auth state once the router is ready.
  useEffect(() => {
    if (initializing || !navigationState?.key) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      // Signed out and trying to view app content → send to sign-in.
      router.replace("/(auth)/sign-in");
    } else if (user && inAuthGroup) {
      // Signed in but still on an auth screen → send into the app.
      router.replace("/(tabs)");
    }
  }, [user, segments, initializing, navigationState?.key, router]);

  if (!fontsReady || initializing) {
    return null;
  }

  // NOTE: Boot into the (tabs) group, not (auth)/sign-in. Without this, expo-router
  // uses the first group in file order — (auth) — so sign-in shows first.
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="(tabs)" />
  );
}
