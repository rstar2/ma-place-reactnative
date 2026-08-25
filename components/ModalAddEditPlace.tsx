import { useEffect, useState } from "react";
import { Pressable, View, Image } from "react-native";
// import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import type { ImagePickerAsset } from "expo-image-picker";

import Text from "@/components/ui/Text";
import { TextInputForModal as TextInput } from "@/components/ui/TextInput";
// import TextInput  from "@/components/ui/TextInput";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import MultiSelect from "@/components/ui/MultiSelect";
import { Toast } from "@/components/ui/Toast";
import { isBoolean, toGeoPointCoordinate } from "@/lib/utils";
import type { NewPlaceInput, Place, Tag } from "@/lib/types";
import { usePlacesStore } from "@/store/places-store";

type ModalAddEditPlaceProps = {
  /* Controls visibility of the modal: `true` = add, a `Place` = edit, `null`/`false` = hidden */
  place: Place | boolean | null;
  /** Prefills the location field in ADD mode (e.g. a coordinate picked on the map). */
  initialLocation?: { latitude: number; longitude: number };
  onClose: () => void;
  /** Carries the values collected by the modal's inputs. */
  onSubmit: (values: NewPlaceInput) => void;
};

/** Parses the location text field: "latitude longitude", e.g. "42.6333 23.3833". */
function parseLocation(text: string): NewPlaceInput["location"] | null {
  const match = text.trim().match(/^(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)$/);
  if (!match) return null;
  return {
    // the field is "latitude longitude" (lat first) — keep the mapping in
    // sync with the placeholder and the edit-mode seeding below
    latitude: toGeoPointCoordinate(match[1]),
    longitude: toGeoPointCoordinate(match[2]),
  };
}

export default function ModalAddEditPlace({
  place,
  initialLocation,
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
  // Locally picked image (camera or gallery)
  const [pickedImage, setPickedImage] = useState<ImagePickerAsset | null>(null);

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
      isEdit
        ? `${place.location.latitude} ${place.location.longitude}`
        : initialLocation
          ? `${toGeoPointCoordinate(initialLocation.latitude)} ${toGeoPointCoordinate(initialLocation.longitude)}`
          : "",
    );
    setSelectedTags(isEdit ? (place.tags ?? []) : []);
    setPickedImage(null);
  }, [place, isEdit, ensureTagsLoaded, initialLocation]);

  async function handleTakePhoto() {
    // launchCameraAsync rejects unless the CAMERA permission is already granted
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Toast.error("Camera unavailable", "Allow camera access to take a photo.");
      return;
    }
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"], // array form — MediaTypeOptions is deprecated in SDK 54
        quality: 1,
      });
      if (!result.canceled && result.assets[0])
        setPickedImage(result.assets[0]);
    } catch (err) {
      console.error("Failed to take a photo", err);
      Toast.error("Failure", "Could not take a photo. Try again.");
    }
  }

  async function handlePickFromGallery() {
    // The system photo picker (Android Photo Picker / iOS PHPicker) needs no
    // permission, so no request step here
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 1,
        allowsMultipleSelection: false,
      });
      if (!result.canceled && result.assets[0])
        setPickedImage(result.assets[0]);
    } catch (err) {
      console.error("Failed to pick an image", err);
      Toast.error("Failure", "Could not pick an image. Try again.");
    }
  }

  function handleSubmit() {
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      location: location!,
      tags: selectedTags,

      imageUploadData: pickedImage
        ? {
            uri: pickedImage.uri,
            // asset.type is the coarse kind ("image"), not a MIME type — an
            // invalid part content-type makes Android abort the request
            type: pickedImage.mimeType ?? "image/jpeg",
            name: pickedImage.fileName ?? undefined,
          }
        : undefined,
    });
  }

  return (
    <Modal
      visible={!!place}
      onClose={onClose}
      title={isEdit ? "Edit Place" : "Add Place"}
    >
      <View className="input-field">
        <Text className="input-label">Title *</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="OldTown Church"
        />
      </View>

      <View className="input-field">
        <Text className="input-label">Description *</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="A nice place for sleeping with water"
          multiline
          textAlignVertical="top"
        />
      </View>

      <View className="input-field">
        <Text className="input-label">Location *</Text>
        <TextInput
          value={locationText}
          onChangeText={setLocationText}
          placeholder="42.6333 23.3833 (latitude longitude)"
          keyboardType="numbers-and-punctuation"
        />
      </View>

      <View className="input-field">
        <Text className="input-label">Tags</Text>
        <MultiSelect
          options={tags.map((t) => ({ label: t, value: t }))}
          selected={selectedTags}
          onSelect={setSelectedTags}
          placeholder="Select tags..."
        />
      </View>

      <View className="input-field">
        <Text className="input-label">Image</Text>
        <View className="flex-row gap-3">
          <Button
            label="Camera"
            className="button-secondary flex-1"
            classNameLabel="button-secondary-text"
            onPress={handleTakePhoto}
          />
          <Button
            label="Gallery"
            className="button-secondary flex-1"
            classNameLabel="button-secondary-text"
            onPress={handlePickFromGallery}
          />
        </View>

        {pickedImage && (
          <View className="place-image-preview-wrap">
            <Image
              source={{ uri: pickedImage.uri }}
              // contentFit="cover"
              resizeMethod="scale"
              className="place-image-preview"
            />
            <Pressable
              className="place-image-remove"
              onPress={() => setPickedImage(null)}
            >
              {/* NOTE: U+2715 "multiplication x", same as the Modal close glyph */}
              <Text className="modal-close-text">✕</Text>
            </Pressable>
          </View>
        )}
      </View>

      <View className="flex-row gap-3">
        {/* NOTE: No need for a cancel/close button */}
        {/* <Button
          className="button-secondary flex-1 w-1/2"
          onPress={onClose}
          label="Cancel"
        /> */}
        <Button
          onPress={handleSubmit}
          disabled={!canSubmit}
          label={isEdit ? "Edit" : "Add"}
          className="flex-1 w-1/2"
        />
      </View>
    </Modal>
  );
}
