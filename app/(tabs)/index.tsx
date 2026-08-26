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
import Text from "@/components/ui/Text";
import ListHeading from "@/components/ListHeading";
import PlaceCard from "@/components/PlaceCard";
import MiniMap from "@/components/MiniMap";
import {
  ListItemSeparator,
  ListItemSeparatorH,
} from "@/components/ListItemSeparator";
import { isNearBy, noop } from "@/lib/utils";
import { Place } from "@/lib/types";
import { posthog } from "@/lib/posthog";
import { icons } from "@/constants/icons";
import { useManagePlace } from "@/lib/places";
import { usePlacesStore } from "@/store/places-store";
import { useAuth } from "@/lib/auth";
import { theme } from "@/constants/theme";
import { useUserLocation } from "@/lib/location";
import { EXPO_PUBLIC_NEARBY_RADIUS_KM } from "@/lib/env";

// in kilometer
const nearByRadiusKm = EXPO_PUBLIC_NEARBY_RADIUS_KM;

export default function Index() {
  const { onAddPlace: onAddPlacePress } = useManagePlace();
  const { user } = useAuth();
  const [expandedPlaceId, setExpandedPlaceId] = useState<string>();
  const places = usePlacesStore((state) => state.places);
  const isLoading = usePlacesStore((state) => state.isLoadingPlaces);
  const ensurePlacesLoaded = usePlacesStore(
    (state) => state.ensurePlacesLoaded,
  );

  // Deduped with the Header's call (module-level request in lib/location.ts),
  // so no extra permission prompt or position fetch happens here.
  const { region } = useUserLocation();

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

  const { myPlaces, nearestPlaces } = places.reduce(
    (out, place) => {
      // check if this is "my" place (created by me)
      if (place.uid === user?.uid) out.myPlaces.push(place);

      if (region && isNearBy(region, place.location, nearByRadiusKm))
        out.nearestPlaces.push(place);

      return out;
    },
    {
      myPlaces: [] as Place[],
      nearestPlaces: [] as Place[],
    },
  );

  return (
    <ScreenBase>
      <FlatList
        // NOTE: must be an ELEMENT, not `() => <Header/>` — VirtualizedList
        // uses the prop as a component TYPE, so an inline arrow means a new
        // type on every render → the whole header REMOUNTS (listWidth resets
        // to 0 → horizontal cards collapse → flicker on modal open/close).
        ListHeaderComponent={
          <Header myPlaces={myPlaces} onAddPlacePress={onAddPlacePress} />
        }
        data={nearestPlaces}
        extraData={expandedPlaceId}
        keyExtractor={(place) => place.id}
        renderItem={({ item: place }) => (
          <PlaceCard
            place={place}
            currentUid={user?.uid}
            expanded={expandedPlaceId === place.id}
            onExpand={() => handleExpandPlace(place)}
            showOnMap
          />
        )}
        ItemSeparatorComponent={ListItemSeparator}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator className="mt-10" />
          ) : (
            <Text className="empty-state">{region ? "No places nearby" : "Checking your location"}</Text>
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

// NOTE: separators must be module-scope components — VirtualizedList uses the
// prop as a component TYPE, so an inline arrow = new type on every render
// → separators remount (same remount class as the ListHeaderComponent issue).

// NOTE: Extract this to a separate component as otherwise it messes
// the rendering. When the "big" flat list is rerendered, like when expanding a place,le
// the ListHeaderComponent is rerendered and thus the horizontal FlatList and some layout logic breaks as the refs are not same, etc... (I couldn't understand it fully)
// This is a known issue with FlatList in React Native.
// BUT, just extracting it to a separate component fixes the issue, as the horizontal FlatList is not rerendered when the "big" FlatList is rerendered.
// Also note that the react-compiler is ON, so it does the memoization for use
// That is also why Header reads the store directly instead of receiving
// the places as a prop - a prop would rerender it on every Index render.
function Header({
  myPlaces,
  onAddPlacePress,
}: {
  myPlaces: Place[];
  onAddPlacePress: () => void;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [listWidth, setListWidth] = useState(0);
  const { region, granted } = useUserLocation();
  // console.log("location", granted, region);

  return (
    <>
      <View className="home-header">
        {user && (
          <View className="home-user">
            <Image
              source={user.photoURL ? { uri: user.photoURL } : icons.avatar}
              className="home-avatar"
            />
            <Text className="home-user-name">{user.displayName}</Text>
          </View>
        )}

        <Pressable onPress={onAddPlacePress}>
          <Image source={icons.add} className="home-add-icon" />
        </Pressable>
      </View>

      <View className="home-map-card">
        <MiniMap
          region={region}
          showsUserLocation={granted}
          className="home-map-card-map"
        />
        <Pressable
          className="home-map-card-open"
          onPress={() => router.navigate("/(tabs)/map")}
        >
          <Image
            source={icons.map}
            className="home-map-card-open-icon"
            tintColor={theme.colors.primary}
          />
        </Pressable>
      </View>

      <View
        className="mb-5"
        onLayout={(e) => setListWidth(e.nativeEvent.layout.width)}
      >
        <ListHeading title="My Places" />

        <FlatList
          data={myPlaces}
          renderItem={({ item: place }) => (
            <PlaceCard
              place={place}
              currentUid={user?.uid}
              onExpand={noop}
              style={{ width: listWidth * HORIZONTAL_CARD_RATIO }}
              showOnMap
            />
          )}
          keyExtractor={(place) => place.id}
          ItemSeparatorComponent={ListItemSeparatorH}
          ListEmptyComponent={
            <Text className="empty-state">No places by me yet</Text>
          }
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <ListHeading
        title="Nearest Places"
        onViewAll={() => router.navigate("/(tabs)/place")}
      />
    </>
  );
}
