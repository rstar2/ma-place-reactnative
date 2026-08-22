import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { Image, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  type Point,
  type Region,
} from "react-native-maps";
import {
  isClusterFeature,
  useClusterer,
  type Supercluster,
} from "react-native-clusterer";

import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import PlaceCard from "@/components/PlaceCard";
import { DEFAULT_REGION } from "@/components/MiniMap";
import { openNavigation } from "@/lib/location";
import { posthog } from "@/lib/posthog";
import type { Place } from "@/lib/types";
import { usePlacesStore } from "@/store/places-store";

type PlaceFeature = Supercluster.PointFeature<{ place: Place }>;

/** .map-pin is size-8 → 32px; the coordinate anchors its center. */
const PIN_RADIUS = 16;
/** .map-callout is w-72 → 288px. */
const CALLOUT_WIDTH = 288;
const CALLOUT_GAP = 10;

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const places = usePlacesStore((state) => state.places);
  const isLoading = usePlacesStore((state) => state.isLoadingPlaces);
  const ensurePlacesLoaded = usePlacesStore(
    (state) => state.ensurePlacesLoaded,
  );

  const mapRef = useRef<MapView>(null);
  /** Fits the camera to the markers only on the first non-empty load. */
  const didFitRef = useRef(false);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);

  // The native <Callout> can't auto-measure custom content on Android (it
  // clips to a sliver), so marker taps open this custom overlay instead.
  // It is glued to the pin via pointForCoordinate while the camera moves.
  const [selected, setSelected] = useState<Place | null>(null);
  const [anchor, setAnchor] = useState<Point | null>(null);
  const [calloutHeight, setCalloutHeight] = useState(0);
  const selectedRef = useRef<Place | null>(null);

  const selectPlace = useCallback(
    async (place: Place) => {
      selectedRef.current = place;
      setSelected(place);
      posthog?.capture("map_marker_tapped", {
        place_id: place.id,
        place_uid: place.uid,
      });
      const point = await mapRef.current?.pointForCoordinate({
        latitude: place.location.latitude,
        longitude: place.location.longitude,
      });
      if (point && selectedRef.current?.id === place.id) setAnchor(point);
    },
    [],
  );

  const dismissCallout = useCallback(() => {
    selectedRef.current = null;
    setSelected(null);
    setAnchor(null);
  }, []);

  const updateAnchor = useCallback(async () => {
    const place = selectedRef.current;
    if (!place) return;
    const point = await mapRef.current?.pointForCoordinate({
      latitude: place.location.latitude,
      longitude: place.location.longitude,
    });
    if (point && selectedRef.current?.id === place.id) setAnchor(point);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void ensurePlacesLoaded();
      posthog?.capture("map_opened");
    }, [ensurePlacesLoaded]),
  );

  const points = useMemo<PlaceFeature[]>(
    () =>
      places
        // The clusterer's native load() throws on non-numeric coordinates,
        // so skip docs with a missing/corrupt location instead of crashing
        // the whole clusterer rebuild on one bad place.
        .filter(
          (place) =>
            Number.isFinite(place.location?.longitude) &&
            Number.isFinite(place.location?.latitude),
        )
        .map((place) => ({
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: [
              place.location.longitude,
              place.location.latitude,
            ] as [number, number],
          },
          properties: { place },
        })),
    [places],
  );

  const [clustered] = useClusterer(points, { width, height }, region);

  useEffect(() => {
    if (didFitRef.current || places.length === 0) return;
    didFitRef.current = true;

    mapRef.current?.fitToCoordinates(
      places.map((place) => ({
        latitude: place.location.latitude,
        longitude: place.location.longitude,
      })),
      {
        edgePadding: { top: 100, right: 40, bottom: 140, left: 40 },
        animated: true,
      },
    );
  }, [places]);

  // Android fires onRegionChangeComplete again after animateToRegion; the
  // epsilon guard skips those no-op updates so the clusterer doesn't re-run.
  const handleRegionChangeComplete = (next: Region) => {
    void updateAnchor();
    setRegion((prev) =>
      Math.abs(prev.latitude - next.latitude) < 1e-4 &&
      Math.abs(prev.longitude - next.longitude) < 1e-4 &&
      Math.abs(prev.latitudeDelta - next.latitudeDelta) < 1e-4
        ? prev
        : next,
    );
  };

  const status =
    isLoading && places.length === 0
      ? "Loading places…"
      : !isLoading && places.length === 0
        ? "No places yet"
        : null;

  return (
    <View className="map-screen">
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        // NativeWind v5 does not reliably convert className to style on
        // third-party native components like MapView — without an explicit
        // style the map gets zero size and renders as an empty screen.
        style={{ flex: 1 }}
        initialRegion={DEFAULT_REGION}
        onPress={dismissCallout}
        onRegionChange={() => void updateAnchor()}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsMyLocationButton
        showsUserLocation
        scrollEnabled
        zoomEnabled
        rotateEnabled
        pitchEnabled
        toolbarEnabled
        showsCompass
      >
        {clustered.map((point) => {
          const [longitude, latitude] = point.geometry.coordinates;

          if (isClusterFeature(point)) {
            const { cluster_id, point_count_abbreviated, getExpansionRegion } =
              point.properties;

            return (
              <Marker
                key={`cluster-${cluster_id}`}
                coordinate={{ latitude, longitude }}
                onPress={() => {
                  dismissCallout();
                  mapRef.current?.animateToRegion(getExpansionRegion(), 300);
                }}
              >
                <View className="map-cluster">
                  <Text className="map-cluster-text">
                    {point_count_abbreviated}
                  </Text>
                </View>
              </Marker>
            );
          }

          const { place } = point.properties;

          return (
            <Marker
              key={place.id}
              coordinate={{ latitude, longitude }}
              onPress={() => void selectPlace(place)}
            >
              <View
                className="map-pin"
                style={{ backgroundColor: place.color }}
              >
                <Image source={place.icon} className="map-pin-icon" />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {selected && anchor && (
        // box-none → taps outside the card fall through to the map, where
        // MapView's onPress dismisses the overlay.
        <View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            left: Math.min(
              Math.max(anchor.x - CALLOUT_WIDTH / 2, 8),
              width - CALLOUT_WIDTH - 8,
            ),
            top: anchor.y - PIN_RADIUS - CALLOUT_GAP - calloutHeight,
            width: CALLOUT_WIDTH,
            // avoid a first frame at the wrong position before onLayout
            opacity: calloutHeight ? 1 : 0,
          }}
        >
          <View
            className="map-callout"
            onLayout={(e) => setCalloutHeight(e.nativeEvent.layout.height)}
          >
            <PlaceCard place={selected} onExpand={dismissCallout} />

            <View className="map-callout-actions">
              <Button
                className="flex-1"
                label="View"
                onPress={() => {
                  dismissCallout();
                  router.push(`/place/${selected.id}`);
                }}
              />
              <Button
                className="flex-1"
                label="Go"
                onPress={() => {
                  dismissCallout();
                  void openNavigation(
                    selected.location.latitude,
                    selected.location.longitude,
                  );
                }}
              />
            </View>
          </View>
        </View>
      )}

      <View className="map-overlay-top" style={{ top: insets.top + 8 }}>
        <View className="map-title-chip">
          <Text className="map-title">Map</Text>
        </View>
      </View>

      {status && (
        <View className="map-status-wrap" pointerEvents="none">
          <View className="map-status">
            <Text className="map-status-text">{status}</Text>
          </View>
        </View>
      )}
    </View>
  );
}
