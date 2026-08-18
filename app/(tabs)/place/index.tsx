import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";

import ScreenBase from "@/components/ScreenBase";
import Text from "@/components/Text";
import PlaceCard from "@/components/PlaceCard";
import { Place } from "@/lib/types";
import { posthog } from "@/lib/posthog";
import { useAddEditPlace } from "@/lib/places";
import { usePlacesStore } from "@/store/places-store";

export default function PlacesScreen() {
  const { onEditPlacePress } = useAddEditPlace();
  const [expandedPlaceId, setExpandedPlaceId] = useState<string>();
  const [filterText, setFilterText] = useState("");
  const places = usePlacesStore((state) => state.places);
  const isLoading = usePlacesStore((state) => state.isLoadingPlaces);
  const ensurePlacesLoaded = usePlacesStore(
    (state) => state.ensurePlacesLoaded,
  );

  // Load on demand when this screen is shown; the store dedupes concurrent
  // calls and caches the result, so screens never duplicate the DB call.
  useFocusEffect(
    useCallback(() => {
      void ensurePlacesLoaded();
    }, [ensurePlacesLoaded]),
  );

  const filteredPlaces = useMemo(() => {
    const query = filterText.trim().toLowerCase();

    if (!query) return places;

    return places.filter((place) => {
      return [place.title, place.description /* , place.tags?.join() */]
        .filter(Boolean)
        .some((val) => val!.toLowerCase().includes(query));
    });
  }, [filterText, places]);

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
          extraData={{ expandedPlaceId, filterText }}
          keyExtractor={(place) => place.id}
          renderItem={({ item: place }) => (
            <PlaceCard
              place={place}
              expanded={expandedPlaceId === place.id}
              onPress={() => handleExpandPlace(place)}
              onEditPress={() => onEditPlacePress(place)}
            />
          )}
          ListHeaderComponent={
            <View className="mb-4">
              <Text className="list-title">All Places</Text>
              <TextInput
                value={filterText}
                onChangeText={setFilterText}
                placeholder="Filter places..."
                placeholderTextColor="rgba(0,0,0,0.35)"
                autoCapitalize="none"
                autoCorrect={false}
                className="text-input mt-4"
              />
            </View>
          }
          ItemSeparatorComponent={() => <View className="h-4" />}
          ListEmptyComponent={
            isLoading ? (
              <ActivityIndicator className="mt-10" />
            ) : (
              <Text className="home-empty-state">
                No matching places found.
              </Text>
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
