import React from "react";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

import { cn } from "@/lib/utils";

// NOTE: the "react-native-safe-area-context" SafeAreaView doesn't support className,
// so we wrap it in a styled component to allow className usage
const SafeAreaView = styled(RNSafeAreaView);

export default function ScreenBase({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <SafeAreaView className={cn("flex-1 p-5 bg-background", className)}>
      {children}
    </SafeAreaView>
  );
}
