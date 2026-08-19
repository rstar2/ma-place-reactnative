import { useEffect, useState } from "react";
import { Pressable, TextInput, View } from "react-native";

import Text from "@/components/ui/Text";
import Modal from "@/components/ui/Modal";
import { cn, isBoolean } from "@/lib/utils";
import { Place } from "@/lib/types";

type ModalAddEditPlaceProps = {
  /* Controls visibility of the modal: `true` = add, a `Place` = edit, `null`/`false` = hidden */
  place: Place | boolean | null;
  onClose: () => void;
  /** Carries the values collected by the modal's inputs. */
  onSubmit: (place: { name: string }) => void;
};

export default function ModalAddEditPlace({
  place,
  onClose,
  onSubmit,
}: ModalAddEditPlaceProps) {
  const isEdit = !!place && !isBoolean(place);
  const [placeName, setPlaceName] = useState(isEdit ? place.title : "");
  const canSubmit = placeName.trim().length > 0;

  // Reseed the input whenever the modal is (re)opened for a place
  useEffect(() => {
    setPlaceName(isEdit ? place.title : "");
  }, [place, isEdit]);

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
      onClose={handleClose}
      title={isEdit ? "Edit Place" : "Add Place"}
    >
      <View className="text-input-field">
        <Text className="text-input-label">Name</Text>
        <TextInput
          value={placeName}
          onChangeText={setPlaceName}
          placeholder="e.g. Vitosha Trail"
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
          <Text className="button-text">{isEdit ? "Edit" : "Add"}</Text>
        </Pressable>
      </View>
    </Modal>
  );
}
