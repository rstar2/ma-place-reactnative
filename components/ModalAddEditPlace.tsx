import { useState } from "react";
import {
  Modal,
  Pressable,
  TextInput,
  View,
  KeyboardAvoidingView,
} from "react-native";

import Text from "@/components/Text";
import { cn, isBoolean, noop } from "@/lib/utils";
import { Place } from "@/lib/types";

type ModalAddEditPlaceProps = {
  /* Controls visibility of the modal */
  place: boolean | Place;
  onClose: () => void;
  /** Carries the values collected by the modal's inputs. */
  onSubmit: (place: { name: string }) => void;
};

export default function ModalAddEditPlace({
  place,
  onClose,
  onSubmit,
}: ModalAddEditPlaceProps) {
  const [placeName, setPlaceName] = useState(
    isBoolean(place) ? "" : place.name,
  );
  const canSubmit = placeName.trim().length > 0;

  function handleClose() {
    setPlaceName("");
    onClose();
  }

  function handleSubmit() {
    setPlaceName("");
    onSubmit({ name: placeName.trim() });
  }

  return (
    <Modal
      visible={!!place}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        // NOTE: "padding" for Android too - https://github.com/react-native-modal/react-native-modal/issues/816
        behavior="padding"
        className="flex-1"
      >
        <Pressable className="modal-overlay" onPress={handleClose}>
          {/* noop absorbs taps on the sheet so they don't bubble to the backdrop */}
          <Pressable className="modal-container" onPress={noop}>
            <View className="modal-header">
              <Text className="modal-title">Add Place</Text>
              <Pressable className="modal-close" onPress={handleClose}>
                {/* NOTE: the ✕ is not the latter x but the unicode entity U+2715 (HTML entity &#10005;) - "multiplication x" */}
                <Text className="modal-close-text">✕</Text>
              </Pressable>
            </View>

            <View className="modal-body">
              <View className="text-input-field">
                <Text className="text-input-label">Name</Text>
                <TextInput
                  value={placeName}
                  onChangeText={setPlaceName}
                  placeholder="e.g. Netflix"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  className="text-input"
                />
              </View>

              <View className="flex-row gap-3">
                <Pressable
                  className="button-secondary flex-1 py-4 w-1/2"
                  onPress={handleClose}
                >
                  <Text className="button-secondary-text">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleSubmit}
                  disabled={!canSubmit}
                  className={cn(
                    "button flex-1 py-4 w-1/2",
                    !canSubmit && "button-disabled",
                  )}
                >
                  <Text className="button-text">
                    {isBoolean(place) ? "Add" : "Edit"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
