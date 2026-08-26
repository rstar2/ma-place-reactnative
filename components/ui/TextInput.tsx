import { TextInput as RNTextInput, type TextInputProps } from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";

import { cn } from "@/lib/utils";
import { theme } from "@/constants/theme";

const defaultProps: TextInputProps = {
  autoCapitalize: "none",
  autoCorrect: false,
  placeholderTextColor: theme.colors.mutedForeground,
};

function createProps({
  className,
  multiline,
  ...props
}: TextInputProps): TextInputProps {
  return {
    className: cn("input", multiline && "input-multiline"),
    multiline,
    ...defaultProps,
    ...props,
  };
}

export default function TextInput(props: TextInputProps) {
  return <RNTextInput {...createProps(props)} />;
}

export function TextInputForModal(props: TextInputProps) {
  return <BottomSheetTextInput {...createProps(props)} />;
}
