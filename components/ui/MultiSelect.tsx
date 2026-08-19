import { useCallback, useMemo, useRef } from "react";
import { Pressable, View } from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";

import Text from "@/components/ui/Text";
import Checkbox from "@/components/ui/Checkbox";
import type { SelectOption } from "@/components/ui/Select";
import { theme } from "@/constants/theme";

type MultiSelectProps<T extends string | number> = {
  options: SelectOption<T>[];
  /** Currently selected values. */
  selected: T[];
  /** Receives the full new selection on every toggle. */
  onSelect: (values: T[]) => void;
  /** Label shown while nothing is selected. */
  placeholder?: string;
};

/**
 * Multi-value dropdown: a chips field that opens a bottom sheet
 * (@gorhom/bottom-sheet) with checkbox rows. Toggling an option keeps the
 * sheet open; a chip's ✕ removes the value directly from the field.
 */
export default function MultiSelect<T extends string | number>({
  options,
  selected,
  onSelect,
  placeholder = "Select...",
}: MultiSelectProps<T>) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const snapPoints = useMemo(
    () => [Math.min(options.length * 52 + 72, 420)],
    [options.length],
  );

  function handleCheck(value: T, checked: boolean) {
    onSelect(
      checked
        ? selectedSet.has(value)
          ? selected
          : [...selected, value]
        : selected.filter((v) => v !== value),
    );
  }

  function labelOf(value: T) {
    return (
      options.find((option) => option.value === value)?.label ?? String(value)
    );
  }

  // stable callback so the sheet does not re-render on every parent render
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <>
      <Pressable
        className="multi-select-trigger"
        onPress={() => sheetRef.current?.present()}
      >
        {selected.length === 0 ? (
          <Text className="select-trigger-placeholder">{placeholder}</Text>
        ) : (
          <View className="multi-select-chips">
            {selected.map((value) => (
              <Pressable
                key={value}
                className="multi-select-chip"
                onPress={() => handleCheck(value, false)}
              >
                <Text className="multi-select-chip-text">{labelOf(value)}</Text>
                {/* NOTE: the ✕ is not the latter x but the unicode entity U+2715 (HTML entity &#10005;) - "multiplication x" */}
                <Text className="multi-select-chip-remove">✕</Text>
              </Pressable>
            ))}
          </View>
        )}
        <Text className="select-chevron">▼</Text>
      </Pressable>

      {/* NOTE: using the @gorhom/bottom-sheet */}
      <BottomSheetModal
        ref={sheetRef}
        // "push": present on top of a parent modal sheet. The default "switch"
        // minimizes the parent sheet, which its onChange(-1) reads as a close.
        stackBehavior="push"
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: theme.colors.background }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.mutedForeground }}
      >
        <BottomSheetScrollView
          contentContainerStyle={{
            gap: 4,
            paddingHorizontal: 8,
            paddingBottom: 24,
          }}
        >
          {options.map((option) => {
            const isActive = selectedSet.has(option.value);
            return (
              <Checkbox
                key={option.value}
                checked={isActive}
                label={option.label}
                onCheck={(checked) => handleCheck(option.value, checked)}
                className="select-option"
              />
            );
          })}
        </BottomSheetScrollView>
      </BottomSheetModal>
    </>
  );
}
