import { useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  View,
} from "react-native";

import ScreenBase from "@/components/ScreenBase";
import Text from "@/components/Text";
import PlaceCard from "@/components/PlaceCard";
import { HOME_PLACES } from "@/constants/data";
import { Place } from "@/lib/types";
import { posthog } from "@/lib/posthog";
import { useAddEditPlace } from "@/lib/places";

export default function PlacesScreen() {
  const { onEditPlacePress } = useAddEditPlace();
  const [expandedPlaceId, setExpandedPlaceId] = useState<string>();
  const [filterText, setFilterText] = useState("");

  const filteredPlaces = useMemo(() => {
    const query = filterText.trim().toLowerCase();

    if (!query) return HOME_PLACES;

    return HOME_PLACES.filter((place) => {
      return [place.name, place.category, place.plan, place.status]
        .filter(Boolean)
        .some((val) => val!.toLowerCase().includes(query));
    });
  }, [filterText]);

  const handleExpandPlace = (item: Place) => {
    const isExpanding = expandedPlaceId !== item.id;
    posthog?.capture(isExpanding ? "place_expanded" : "place_collapsed", {
      place_id: item.id,
      place_category: item.category ?? "unknown",
      place_status: item.status ?? "unknown",
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
              {...place}
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
            <Text className="home-empty-state">No matching places found.</Text>
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
