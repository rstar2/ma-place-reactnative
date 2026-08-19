import { useCallback, useMemo, useRef } from "react";
import { Pressable } from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";

// Old Modal-based sheet (kept commented for reference):
// import { Modal, ScrollView, View } from "react-native";
// import { noop } from "@/lib/utils";

import Text from "@/components/ui/Text";
import { cn } from "@/lib/utils";
import { theme } from "@/constants/theme";

export type SelectOption<T extends string | number> = {
  label: string;
  value: T;
};

type SelectProps<T extends string | number> = {
  options: SelectOption<T>[];
  /** Currently selected value; `undefined` = placeholder is shown. */
  selected?: T;
  onSelect: (value: T) => void;
  /** Label shown while nothing is selected. */
  placeholder?: string;
};

/**
 * Generic dropdown: a text trigger that opens a bottom sheet
 * (@gorhom/bottom-sheet) with the options.
 */
export default function Select<T extends string | number>({
  options,
  selected,
  onSelect,
  placeholder = "Select...",
}: SelectProps<T>) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const selectedOption = options.find((option) => option.value === selected);

  const snapPoints = useMemo(
    () => [Math.min(options.length * 52 + 72, 420)],
    [options.length],
  );

  function handleSelect(value: T) {
    sheetRef.current?.dismiss();
    onSelect(value);
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
        className="select-trigger"
        onPress={() => sheetRef.current?.present()}
      >
        <Text
          className={cn(
            selectedOption
              ? "select-trigger-label"
              : "select-trigger-placeholder",
          )}
        >
          {selectedOption?.label ?? placeholder}
        </Text>
        <Text className="select-chevron">▼</Text>
      </Pressable>

      {/* Old Modal implementation (replaced by BottomSheetModal below)
      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable className="modal-overlay" onPress={() => setOpen(false)}>
          {/* noop absorbs taps on the sheet so they don't bubble to the backdrop *​/}
          <Pressable className="select-sheet" onPress={noop}>
            <View className="select-sheet-handle" />
            <ScrollView contentContainerClassName="gap-1 px-2">
              {options.map((option) => {
                const isActive = option.value === selected;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => handleSelect(option.value)}
                    className={cn("select-option", isActive && "select-option-active")}
                  >
                    <Text
                      className={cn(
                        "select-option-text",
                        isActive && "select-option-text-active",
                      )}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
      */}

      {/* NOTE: using the @gorhom/bottom-sheet */}
      <BottomSheetModal
        ref={sheetRef}
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
            const isActive = option.value === selected;
            return (
              <Pressable
                key={option.value}
                onPress={() => handleSelect(option.value)}
                className={cn(
                  "select-option",
                  isActive && "select-option-active",
                )}
              >
                <Text
                  className={cn(
                    "select-option-text",
                    isActive && "select-option-text-active",
                  )}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </BottomSheetScrollView>
      </BottomSheetModal>
    </>
  );
}
