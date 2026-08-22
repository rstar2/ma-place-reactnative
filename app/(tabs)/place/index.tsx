import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";

import ScreenBase from "@/components/ScreenBase";
import Text from "@/components/ui/Text";
import TextInput from "@/components/ui/TextInput";
import Select, { type SelectOption } from "@/components/ui/Select";
import { ListItemSeparator } from "@/components/ListItemSeparator";
import PlaceCard from "@/components/PlaceCard";
import type { Place, Tag } from "@/lib/types";
import { posthog } from "@/lib/posthog";
import { useManagePlace } from "@/lib/places";
import { usePlacesStore } from "@/store/places-store";

export default function PlacesScreen() {
  const { onEditPlace: handleEditPlace, onDeletePlace: handleDeletePlace } =
    useManagePlace();
  const places = usePlacesStore((state) => state.places);
  const tags = usePlacesStore((state) => state.tags);
  const isLoading = usePlacesStore((state) => state.isLoadingPlaces);
  const ensurePlacesLoaded = usePlacesStore(
    (state) => state.ensurePlacesLoaded,
  );
  const ensureTagsLoaded = usePlacesStore((state) => state.ensureTagsLoaded);

  const [expandedPlaceId, setExpandedPlaceId] = useState<string>();
  const [filterText, setFilterText] = useState("");
  const [filterTag, setFilterTag] = useState<Tag | undefined>(undefined);

  const filterTagOptions: SelectOption<Tag>[] = tags.map((t) => ({
    label: t,
    value: t,
  }));

  // Load on demand when this screen is shown; the store dedupes concurrent
  // calls and caches the result, so screens never duplicate the DB call.
  useFocusEffect(
    useCallback(() => {
      void ensurePlacesLoaded();
      void ensureTagsLoaded();
    }, [ensurePlacesLoaded, ensureTagsLoaded]),
  );

  const filteredPlaces = useMemo(() => {
    const query = filterText.trim().toLowerCase();

    return places.filter((place) => {
      const matchesTag = !filterTag || place.tags?.includes(filterTag);
      if (!matchesTag) return false;

      const matchesText =
        !query ||
        [place.title, place.description]
          .filter(Boolean)
          .some((val) => val!.toLowerCase().includes(query));

      return matchesText;
    });
  }, [filterText, filterTag, places]);

  const handleExpandPlace = (item: Place) => {
    const isExpanding = expandedPlaceId !== item.id;
    posthog?.capture(isExpanding ? "place_expanded" : "place_collapsed", {
      place_id: item.id,
      place_uid: item.uid,
    });
    setExpandedPlaceId(isExpanding ? item.id : undefined);
  };

  return (
    <ScreenBase>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FlatList
          data={filteredPlaces}
          extraData={{ expandedPlaceId, filterText, filterTag }}
          keyExtractor={(place) => place.id}
          renderItem={({ item: place }) => (
            <PlaceCard
              place={place}
              expanded={expandedPlaceId === place.id}
              onExpand={() => handleExpandPlace(place)}
              onEdit={() => handleEditPlace(place)}
              onDelete={() => handleDeletePlace(place)}
              showOnMap
            />
          )}
          ListHeaderComponent={
            <View className="mb-4">
              <Text className="list-title mb-4">All Places</Text>
              <TextInput
                value={filterText}
                onChangeText={setFilterText}
                placeholder="Filter by name ..."
              />

              <View className="tag-filter">
                <Select
                  placeholder="Filter by tag ..."
                  options={filterTagOptions}
                  selected={filterTag}
                  onSelect={(v) =>
                    setFilterTag(v === filterTag ? undefined : (v as Tag))
                  }
                />
              </View>
            </View>
          }
          ItemSeparatorComponent={ListItemSeparator}
          ListEmptyComponent={
            isLoading ? (
              <ActivityIndicator className="mt-10" />
            ) : (
              <Text className="empty-state">No matching places found.</Text>
            )
          }
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-30"
          // this will make sure the keyboard is closed/dismissed when tapped inside the FlatList
          // BUT the tab is NOT handled by some children (like from the expandable PlaceCard)
          keyboardShouldPersistTaps="handled"
        />
      </KeyboardAvoidingView>
    </ScreenBase>
  );
}
