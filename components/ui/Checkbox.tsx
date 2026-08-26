import { Pressable, View } from "react-native";

import Text from "@/components/ui/Text";
import { cn } from "@/lib/utils";

type CheckboxProps = {
  /** Filled with a ✓ when `true`, empty outline when `false`. */
  checked: boolean;
  /** Optional label text - renders the checkbox as a full pressable row. */
  label?: string;
  /** Called with the next checked state when pressed. */
  onCheck?: (checked: boolean) => void;
  /** Extra classes for the pressable root, e.g. `"select-option"`. */
  className?: string;
};

/** The whole component is the pressable checkbox: box + optional label. */
export default function Checkbox({
  checked,
  label,
  onCheck,
  className,
}: CheckboxProps) {
  return (
    <Pressable
      onPress={() => onCheck?.(!checked)}
      className={cn("checkbox-row", checked && "checkbox-row-active", className)}
    >
      <View className={cn("checkbox", checked && "checkbox-active")}>
        {checked && <Text className="checkbox-check">✓</Text>}
      </View>
      {label !== undefined && <Text className="checkbox-label">{label}</Text>}
    </Pressable>
  );
}
