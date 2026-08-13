import { useMemo, useState } from "react";
import { FlatList, TextInput, View } from "react-native";

import ScreenBase from "@/app/components/ScreenBase";
import Text from "@/app/components/Text";
import PlaceCard from "@/app/components/PlaceCard";
import { HOME_PLACES } from "@/constants/data";
import { Place } from "@/lib/types";
import { posthog } from "@/lib/posthog";

export default function PlacesScreen() {
  const [expandedPlaceId, setExpandedPlaceId] = useState<string>();
  const [filterText, setFilterText] = useState("");

  const filteredPlaces = useMemo(() => {
    const query = filterText.trim().toLowerCase();

    if (!query) return HOME_PLACES;

    return HOME_PLACES.filter((place) => {
      const searchableText = [
        place.name,
        place.category,
        place.plan,
        place.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
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
      <FlatList
        data={filteredPlaces}
        extraData={{ expandedPlaceId, filterText }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PlaceCard
            {...item}
            expanded={expandedPlaceId === item.id}
            onPress={() => handleExpandPlace(item)}
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
              className="auth-input mt-4"
            />
          </View>
        }
        ItemSeparatorComponent={() => <View className="h-4" />}
        ListEmptyComponent={
          <Text className="home-empty-state">No matching places found.</Text>
        }
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-30"
      />
    </ScreenBase>
  );
}
