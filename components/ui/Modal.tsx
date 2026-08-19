import { useCallback, useEffect, useMemo, useRef, type ReactNode } from "react";
import { View } from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";

import Text from "@/components/ui/Text";
import { theme } from "@/constants/theme";

type ModalProps = {
  /** Controlled visibility of the modal. */
  visible: boolean;
  /** Called on backdrop tap, ✕ button, drag-to-close or Android back button. */
  onClose: () => void;
  /** Optional header row with title and a close (✕) button. */
  title?: string;
  children: ReactNode;
};

/**
 * Generic bottom-anchored modal, re-implemented with @gorhom/bottom-sheet.
 * Draggable between 50% and 90% of the screen height.
 *
 * NOTE: the content MUST be wrapped in a @gorhom view/scrollable
 * (`BottomSheetView` here) - with plain RN Views inside the sheet mounts
 * but never animates in.
 */
export default function Modal({
  visible,
  onClose,
  title,
  children,
}: ModalProps) {
  const sheetRef = useRef<BottomSheetModal>(null);

  // `visible` is the controlled source of truth: present/dismiss on change
  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.close();
    }
  }, [visible]);

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

  useEffect(() => {
    // dismiss the modal when unmount
    const modal = sheetRef.current;
    return () => {
        modal?.dismiss();
    };
  }, []);


  return (
    <BottomSheetModal
      ref={sheetRef}
    //   enableDynamicSizing={false}
    //   snapPoints={["50%", "90%"]}
      onChange={(index) => {
        // sheet closed by the user (gesture/backdrop/back button) → sync `visible`
        if (index === -1) onClose();
      }}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.colors.background }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.mutedForeground }}
    >
      <BottomSheetView>
        {title !== undefined && (
          <View className="modal-header">
            <Text className="modal-title">{title}</Text>

            {/* No need as this modal has its own gesture handle */}
            {/* <Pressable className="modal-close" onPress={onClose}> */}
            {/* NOTE: the ✕ is not the latter x but the unicode entity U+2715 (HTML entity &#10005;) - "multiplication x" */}
            {/* <Text className="modal-close-text">✕</Text> */}
            {/* </Pressable> */}
          </View>
        )}

        <View className="modal-body">{children}</View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

/* Old implementation with the built-in RN Modal (kept for reference):

import { KeyboardAvoidingView, Modal as RNModal } from "react-native";
import { noop } from "@/lib/utils";

export default function Modal({ visible, onClose, title, children }: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        // NOTE: "padding" for Android too - https://github.com/react-native-modal/react-native-modal/issues/816
        behavior="padding"
        className="flex-1"
      >
        <Pressable className="modal-overlay" onPress={onClose}>
          // noop absorbs taps on the sheet so they don't bubble to the backdrop
          <Pressable className="modal-container" onPress={noop}>
            {title !== undefined && (
              <View className="modal-header">
                <Text className="modal-title">{title}</Text>
                <Pressable className="modal-close" onPress={onClose}>
                  <Text className="modal-close-text">✕</Text>
                </Pressable>
              </View>
            )}

            <View className="modal-body">{children}</View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

*/
