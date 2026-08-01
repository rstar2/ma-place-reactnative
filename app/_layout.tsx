import { Stack } from "expo-router"; 

import "@/assets/global.css";

export default function RootLayout() {
  return <Stack screenOptions={{headerShown: false}}/>;
}
