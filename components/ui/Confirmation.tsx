import { ReactNode } from "react";
import { Pressable, Modal as RNModal, View } from "react-native";

import { isString } from "@/lib/utils";
import Text from "./Text";
import Button from "./Button";

type ConfirmationProps = {
  /** Controlled visibility of the modal. */
  visible: boolean;
  /**
   * Called with false on no/cancel button, backdrop tap, ✕ button, drag-to-close or Android back button.
   * Called with true on yes/ok button.
   * */
  onClose: (confirmed: boolean) => void;
  /** Optional header row with title and a close (✕) button. */
  title?: string;
  message: ReactNode;
  yesButton?: string;
  noButton?: string;
};
export default function Confirmation({
  visible,
  onClose,
  title = "Confirmation",
  message,
  yesButton = "Yes",
  noButton = "No",
}: ConfirmationProps) {
  const cancel = () => onClose(false);
  const confirm = () => onClose(true);

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={cancel}
    >
      <Pressable className="confirm-overlay" onPress={cancel}>
        <View className="confirm-container">
          {title !== undefined && (
            <View className="modal-header">
              <Text className="modal-title">{title}</Text>
              {/* <Pressable className="modal-close" onPress={cancel}>
                <Text className="modal-close-text">✕</Text>
              </Pressable> */}
            </View>
          )}

          <View className="confirm-body">
            {isString(message) ? <Text>{message}</Text> : message}
          </View>
          <View className="confirm-buttons">
            <Button
              label={noButton}
              onPress={cancel}
              className="button-secondary"
              classNameLabel="button-secondary-text"
            />
            <Button label={yesButton} onPress={confirm} />
          </View>
        </View>
      </Pressable>
    </RNModal>
  );
}
