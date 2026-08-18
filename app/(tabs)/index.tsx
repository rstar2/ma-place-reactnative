import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import ScreenBase from "@/components/ScreenBase";
import Text from "@/components/Text";
import ListHeading from "@/components/ListHeading";
import PlaceCard from "@/components/PlaceCard";
import { noop } from "@/lib/utils";
import { Place } from "@/lib/types";
import { images } from "@/constants/images";
import { posthog } from "@/lib/posthog";
import { icons } from "@/constants/icons";
import { useAddEditPlace } from "@/lib/places";
import { usePlacesStore } from "@/store/places-store";

const user = {
  displayName: "John Doe",
  imageUrl: null,
};

export default function Index() {
  const { onAddPlacePress } = useAddEditPlace();
  const [expandedPlaceId, setExpandedPlaceId] = useState<string>();
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
      <FlatList
        ListHeaderComponent={() => <Header onAddPlacePress={onAddPlacePress} />}
        data={places}
        extraData={expandedPlaceId}
        keyExtractor={(place) => place.id}
        renderItem={({ item: place }) => (
          <PlaceCard
            place={place}
            expanded={expandedPlaceId === place.id}
            onPress={() => handleExpandPlace(place)}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-4" />}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator className="mt-10" />
          ) : (
            <Text className="home-empty-state">No places yet.</Text>
          )
        }
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-30"
      />
    </ScreenBase>
  );
}

// Horizontal FlatList items can't be sized with percentage width/max-width:
// the content container's width is determined by the items themselves, so
// percentages resolve against nothing. Measure the list width and size in JS.
const HORIZONTAL_CARD_RATIO = 0.9;

// NOTE: Extract this to a separate component as otherwise it messes
// the rendering. When the "big" flat list is rerendered, like when expanding a place,le
// the ListHeaderComponent is rerendered and thus the horizontal FlatList and some layout logic breaks as the refs are not same, etc... (I couldn't understand it fully)
// This is a known issue with FlatList in React Native.
// BUT, just extracting it to a separate component fixes the issue, as the horizontal FlatList is not rerendered when the "big" FlatList is rerendered.
// Also note that the react-compiler is ON, so it does the memoization for use
// That is also why Header reads the store directly instead of receiving
// the places as a prop - a prop would rerender it on every Index render.
function Header({ onAddPlacePress }: { onAddPlacePress: () => void }) {
  const router = useRouter();
  const places = usePlacesStore((state) => state.places);
  const [listWidth, setListWidth] = useState(0);

  return (
    <>
      <View className="home-header">
        <View className="home-user">
          <Image
            source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar}
            className="home-avatar"
          />
          <Text className="home-user-name">{user.displayName}</Text>
        </View>

        <Pressable onPress={onAddPlacePress}>
          <Image source={icons.add} className="home-add-icon" />
        </Pressable>
      </View>

      <View className="home-map-card">
        <Text className="home-map-label">Map</Text>
      </View>

      <View
        className="mb-5"
        onLayout={(e) => setListWidth(e.nativeEvent.layout.width)}
      >
        <ListHeading title="Nearest Places" />

        <FlatList
          data={places}
          renderItem={({ item: place }) => (
            <PlaceCard
              place={place}
              onPress={noop}
              style={{ width: listWidth * HORIZONTAL_CARD_RATIO }}
            />
          )}
          keyExtractor={(place) => place.id}
          ItemSeparatorComponent={() => <View className="w-4" />}
          ListEmptyComponent={
            <Text className="home-empty-state">No upcoming renewals yet.</Text>
          }
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <ListHeading
        title="All Places"
        onViewAll={() => router.navigate("/(tabs)/place")}
      />
    </>
  );
}
