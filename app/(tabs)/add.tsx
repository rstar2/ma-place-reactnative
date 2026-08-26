import { Redirect } from "expo-router";

// Dummy route: only gives the tab-bar "+" button a screen entry.
// The press is intercepted in (tabs)/_layout.tsx (tabBarButton), so this
// never mounts — the Redirect just guards against direct/deep-link access.
export default function Add() {
  return <Redirect href="/" />;
}
