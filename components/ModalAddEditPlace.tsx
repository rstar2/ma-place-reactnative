import { useEffect, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { GeoPoint } from "@react-native-firebase/firestore";

import Text from "@/components/ui/Text";
import Modal from "@/components/ui/Modal";
import MultiSelect from "@/components/ui/MultiSelect";
import { cn, isBoolean } from "@/lib/utils";
import type { NewPlaceInput, Place, Tag } from "@/lib/types";
import { usePlacesStore } from "@/store/places-store";

type ModalAddEditPlaceProps = {
  /* Controls visibility of the modal: `true` = add, a `Place` = edit, `null`/`false` = hidden */
  place: Place | boolean | null;
  onClose: () => void;
  /** Carries the values collected by the modal's inputs. */
  onSubmit: (values: Omit<NewPlaceInput, "uid">) => void;
};

/** Parses the location text field: "latitude longitude", e.g. "42.6333 23.3833". */
function parseLocation(text: string): NewPlaceInput["location"] | null {
  const match = text.trim().match(/^(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)$/);
  if (!match) return null;
  return new GeoPoint(Number(match[1]), Number(match[2]));
}

export default function ModalAddEditPlace({
  place,
  onClose,
  onSubmit,
}: ModalAddEditPlaceProps) {
  const isEdit = !!place && !isBoolean(place);
  const tags = usePlacesStore((state) => state.tags);
  const ensureTagsLoaded = usePlacesStore((state) => state.ensureTagsLoaded);

  const [title, setTitle] = useState(isEdit ? place.title : "");
  const [description, setDescription] = useState(
    isEdit ? place.description : "",
  );
  const [locationText, setLocationText] = useState(
    isEdit ? `${place.location.latitude} ${place.location.longitude}` : "",
  );
  const [selectedTags, setSelectedTags] = useState<Tag[]>(
    isEdit ? (place.tags ?? []) : [],
  );

  const location = parseLocation(locationText);
  const canSubmit =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    location !== null;

  // Reseed the inputs whenever the modal is (re)opened for a place
  useEffect(() => {
    if (place) void ensureTagsLoaded();
    setTitle(isEdit ? place.title : "");
    setDescription(isEdit ? place.description : "");
    setLocationText(
      isEdit ? `${place.location.latitude} ${place.location.longitude}` : "",
    );
    setSelectedTags(isEdit ? (place.tags ?? []) : []);
  }, [place, isEdit, ensureTagsLoaded]);

  function handleSubmit() {
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      location: location!,
      tags: selectedTags,

      // TODO
      imageUrl: "todo",
      meta: {
        cloudinaryId: "todo",
      },
    });
  }

  return (
    <Modal
      visible={!!place}
      onClose={onClose}
      title={isEdit ? "Edit Place" : "Add Place"}
    >
      <View className="text-input-field">
        <Text className="text-input-label">Title *</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="OldTown Church"
          placeholderTextColor="rgba(0,0,0,0.35)"
          className="text-input"
        />
      </View>

      <View className="text-input-field">
        <Text className="text-input-label">Description *</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="A nice place for sleeping with water"
          placeholderTextColor="rgba(0,0,0,0.35)"
          className="text-input text-input-multiline"
          multiline
          textAlignVertical="top"
        />
      </View>

      <View className="text-input-field">
        <Text className="text-input-label">Location *</Text>
        <TextInput
          value={locationText}
          onChangeText={setLocationText}
          placeholder="42.6333 23.3833 (latitude longitude)"
          placeholderTextColor="rgba(0,0,0,0.35)"
          className="text-input"
          keyboardType="numbers-and-punctuation"
          autoCorrect={false}
        />
      </View>

      <View className="text-input-field">
        <Text className="text-input-label">Tags</Text>
        <MultiSelect
          options={tags.map((t) => ({ label: t, value: t }))}
          selected={selectedTags}
          onSelect={setSelectedTags}
          placeholder="Select tags..."
        />
      </View>

      <View className="flex-row gap-3">
        {/* NOTE: No need for a cancel/close button */}
        {/* <Pressable
          className="button-secondary flex-1 py-4 w-1/2"
          onPress={onClose}
        >
          <Text className="button-secondary-text">Cancel</Text>
        </Pressable> */}
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
