import { useEffect } from "react";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";

import "@/assets/global.css";

// do not auto-hide the splash screen while we fetch resources, hide it when the app is ready to render
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // NOTE: The `expo-router` already wraps the root-layout in <SafeAreaProvider>,
  // so no need to wrap it again. Thus `useSafeAreaInsets` can be used directly even here

  // NOTE: Boot into the (tabs) group, not (auth)/sign-in. Without this, expo-router
  // uses the first group in file order — (auth) — so sign-in shows first.

  const [loaded, error] = useFonts({
    "sans-regular": require("@/assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-light": require("@/assets/fonts/PlusJakartaSans-Light.ttf"),
    "sans-medium": require("@/assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("@/assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-bold": require("@/assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-extrabold": require("@/assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="(tabs)" />
  );
}
