import { ActivityIndicator, Pressable } from "react-native";

import Text from "@/components/ui/Text";
import { cn } from "@/lib/utils";

type ButtonProps = {
  /** Button label text. */
  label: string;
  /** Called when pressed (not when `disabled`). */
  onPress?: () => void;
  /** Applies `button-disabled` styling and blocks presses. */
  disabled?: boolean;
  loading?: boolean;
  /** Extra classes for the pressable root. */
  className?: string;
  /** Extra classes for the label text. */
  classNameLabel?: string;
};

export default function Button({
  label,
  onPress,
  disabled,
  loading,
  className,
  classNameLabel,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={cn("button py-3 px-4", disabled && "button-disabled", className)}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Text className={cn("button-text", classNameLabel)}>{label}</Text>
      )}
    </Pressable>
  );
}
