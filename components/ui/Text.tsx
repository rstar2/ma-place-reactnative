import { Text as RNText, type TextProps } from "react-native";

import { cn } from "@/lib/utils";

export default function Text({ className, ...props }: TextProps) {
  return (
    <RNText className={cn("text-foreground font-sans-regular", className)} {...props} />
  );
}
