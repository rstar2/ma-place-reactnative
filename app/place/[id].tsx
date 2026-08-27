import { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import type { Region } from "react-native-maps";
import * as Clipboard from "expo-clipboard";

import ScreenBase from "@/components/ScreenBase";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import MiniMap from "@/components/MiniMap";
import PlaceImageCarousel, {
  placeImageUrls,
} from "@/components/PlaceImageCarousel";
import BackButton from "@/components/BackButton";
import PlaceDeleteButton from "@/components/PlaceDeleteButton";
import { usePlacesStore } from "@/store/places-store";
import { icons } from "@/constants/icons";
import { theme } from "@/constants/theme";
import type { Place } from "@/lib/types";
import { openNavigation } from "@/lib/location";

export default function PlaceDetails() {
  const router = useRouter();
  // Dynamic params can arrive as string[] at runtime despite the generic
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const places = usePlacesStore((state) => state.places);
  const isLoading = usePlacesStore((state) => state.isLoadingPlaces);
  const error = usePlacesStore((state) => state.error);
  const ensurePlacesLoaded = usePlacesStore(
    (state) => state.ensurePlacesLoaded,
  );
  const refreshPlaces = usePlacesStore((state) => state.refreshPlaces);

  const place: Place | undefined = useMemo(
    () => places.find((p) => p.id === id),
    [places, id],
  );

  // Repo pattern: load-on-focus; the store dedupes/caches
  useFocusEffect(
    useCallback(() => {
      void ensurePlacesLoaded();
    }, [ensurePlacesLoaded]),
  );

  // Memoized — a fresh object each render would re-fire MapView's camera
  const region = useMemo<Region | null>(
    () =>
      place
        ? {
            // same deltas map.tsx uses to focus a place
            latitude: place.location.latitude,
            longitude: place.location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }
        : null,
    [place],
  );

  const images = useMemo(() => (place ? placeImageUrls(place) : []), [place]);

  // places.length === 0 covers the frame before the focus effect kicks in,
  // so an initial load never flashes the not-found state
  const isResolving = isLoading || places.length === 0;

  return (
    <ScreenBase>
      {/* Pinned header — Back never scrolls away (mirrors the map chip) */}
      <View className="place-details-header">
        <BackButton />
      </View>

      {place ? (
        <>
          <ScrollView
            className="flex-1"
            contentContainerClassName="gap-5 pb-10"
            showsVerticalScrollIndicator={false}
          >
            <View className="input-field">
              <Text className="input-label font-sans-bold">Title</Text>
              <Text className="place-details-title">{place.title}</Text>
            </View>

            <View className="input-field">
              <Text className="input-label font-sans-bold">Description</Text>
              <Text className="place-details-text">{place.description}</Text>
            </View>

            <View className="input-field">
              <Text className="input-label font-sans-bold">Location</Text>
              <View className="place-details-coords">
                <Text className="place-details-text">
                  {`${place.location.latitude} ${place.location.longitude}`}
                </Text>
                <Pressable
                  hitSlop={8}
                  onPress={() =>
                    void Clipboard.setStringAsync(
                      `${place.location.latitude} ${place.location.longitude}`,
                    )
                  }
                >
                  <Image
                    source={icons.copy}
                    className="place-details-copy-icon"
                    tintColor={theme.colors.mutedForeground}
                  />
                </Pressable>
              </View>
              {region && (
                <MiniMap
                  region={region}
                  location={{
                    latitude: place.location.latitude,
                    longitude: place.location.longitude,
                    icon: place.icon,
                    color: place.color,
                  }}
                />
              )}
              <Button
                className="flex-1"
                onPress={() =>
                  openNavigation(
                    place.location.latitude,
                    place.location.longitude,
                  )
                }
                label="Go"
              ></Button>

              <Button
                label="Show on map"
                className="button-secondary"
                classNameLabel="button-secondary-text"
                onPress={() =>
                  router.push({ pathname: "/map", params: { place: place.id } })
                }
              />
            </View>

            {!!place.tags?.length && (
              <View className="input-field">
                <Text className="input-label font-sans-bold">Tags</Text>
                <View className="place-details-tags">
                  {place.tags.map((tag) => (
                    <View key={tag} className="multi-select-chip">
                      <Text className="multi-select-chip-text">{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {images.length > 0 && (
              <View className="input-field">
                <Text className="input-label font-sans-bold">Images</Text>
                <PlaceImageCarousel images={images} />
              </View>
            )}
          </ScrollView>

          <PlaceDeleteButton
            placeId={place.id}
            onDeleted={() => router.back()}
            className="mt-2"
          />
        </>
      ) : isResolving ? (
        <View className="place-details-state">
          <ActivityIndicator />
        </View>
      ) : error ? (
        <View className="place-details-state">
          <Text className="place-details-notfound">
            Couldn&apos;t load the place. {error}
          </Text>
          <Button label="Try again" onPress={() => void refreshPlaces()} />
        </View>
      ) : (
        <View className="place-details-state">
          <Text className="place-details-notfound">
            Place not found. It may have been deleted.
          </Text>
          <Button label="Go back" onPress={() => router.back()} />
        </View>
      )}
    </ScreenBase>
  );
}
