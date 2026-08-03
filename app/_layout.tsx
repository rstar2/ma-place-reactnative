import { Stack } from "expo-router";

// import { SafeAreaProvider } from 'react-native-safe-area-context';

import "@/assets/global.css";

export default function RootLayout() {
  // NOTE: The `expo-router` already wraps the root-layout in <SafeAreaProvider>,
  // so no need to wrap it again. Thus `useSafeAreaInsets` can be used directly even here

  // NOTE: Boot into the (tabs) group, not (auth)/sign-in. Without this, expo-router
  // uses the first group in file order — (auth) — so sign-in shows first.
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="(tabs)" />
  );
}
