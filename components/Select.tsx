import { useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";

import Text from "@/components/Text";
import { cn, noop } from "@/lib/utils";

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
 * Generic dropdown: a text trigger that opens a bottom-sheet modal with the
 * options. Fully app-styled (no native picker dialog involved).
 */
export default function Select<T extends string | number>({
  options,
  selected,
  onSelect,
  placeholder = "Select...",
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === selected);

  function handleSelect(value: T) {
    setOpen(false);
    onSelect(value);
  }

  return (
    <>
      <Pressable className="select-trigger" onPress={() => setOpen(true)}>
        <Text
          className={cn(
            selectedOption ? "select-trigger-label" : "select-trigger-placeholder",
          )}
        >
          {selectedOption?.label ?? placeholder}
        </Text>
        <Text className="select-chevron">▼</Text>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable className="modal-overlay" onPress={() => setOpen(false)}>
          {/* noop absorbs taps on the sheet so they don't bubble to the backdrop */}
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
    </>
  );
}
