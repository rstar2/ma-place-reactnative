import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  router,
  Tabs,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { Image, Pressable, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  type LatLng,
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
import { useAuth } from "@/lib/auth";
import { useManagePlace } from "@/lib/places";
import { toGeoPointCoordinate } from "@/lib/utils";
import { posthog } from "@/lib/posthog";
import type { Place } from "@/lib/types";
import { usePlacesStore } from "@/store/places-store";
import { icons } from "@/constants/icons";

type PlaceFeature = Supercluster.PointFeature<{ place: Place }>;

/** What the callout overlay is attached to: an existing place's marker or
 * the "create here?" pending pin dropped by an empty-map tap. */
type MapSelection =
  | { kind: "place"; place: Place }
  | { kind: "pending"; coordinate: LatLng };

/** .map-pin is size-8 → 32px; the coordinate anchors its center. */
const PIN_RADIUS = 16;
/** .map-callout is w-72 → 288px. */
const CALLOUT_WIDTH = 288;
const CALLOUT_GAP = 10;

const coordOf = (sel: MapSelection): LatLng =>
  sel.kind === "place"
    ? {
        latitude: sel.place.location.latitude,
        longitude: sel.place.location.longitude,
      }
    : sel.coordinate;

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { user } = useAuth();
  const { onAddPlace, onEditPlace } = useManagePlace();

  const places = usePlacesStore((state) => state.places);
  const isLoading = usePlacesStore((state) => state.isLoadingPlaces);
  const ensurePlacesLoaded = usePlacesStore(
    (state) => state.ensurePlacesLoaded,
  );

  const mapRef = useRef<MapView>(null);
  /** Fits the camera to the markers only on the first non-empty load. */
  const didFitRef = useRef(false);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [mapReady, setMapReady] = useState(false);

  // /map?place=<id> — pushed by PlaceCard's map button. Camera commands are
  // dropped by the native map before onMapReady, so gate on mapReady.
  const { place: focusPlaceId } = useLocalSearchParams<{ place?: string }>();

  // The native <Callout> can't auto-measure custom content on Android (it
  // clips to a sliver), so marker taps open this custom overlay instead.
  // It is glued to the pin via pointForCoordinate while the camera moves.
  const [selection, setSelection] = useState<MapSelection | null>(null);
  const [anchor, setAnchor] = useState<Point | null>(null);
  const [calloutHeight, setCalloutHeight] = useState(0);
  const selectionRef = useRef<MapSelection | null>(null);
  // Android fires MapView.onPress again right after a marker press; the
  // timestamp lets handleMapPress skip that echo.
  const lastMarkerPressAtRef = useRef(0);

  const selectOnMap = useCallback(async (sel: MapSelection) => {
    selectionRef.current = sel;
    setSelection(sel);
    if (sel.kind === "place") {
      posthog?.capture("map_marker_tapped", {
        place_id: sel.place.id,
        place_uid: sel.place.uid,
      });
    }
    const point = await mapRef.current?.pointForCoordinate(coordOf(sel));
    // guard against a newer selection winning the pointForCoordinate race
    if (point && selectionRef.current === sel) setAnchor(point);
  }, []);

  const clearSelection = useCallback(() => {
    selectionRef.current = null;
    setSelection(null);
    setAnchor(null);
  }, []);

  const updateAnchor = useCallback(async () => {
    const sel = selectionRef.current;
    if (!sel) return;
    const point = await mapRef.current?.pointForCoordinate(coordOf(sel));
    if (point && selectionRef.current === sel) setAnchor(point);
  }, []);

  const handleMapPress = useCallback(
    (e: { nativeEvent: { coordinate: LatLng } }) => {
      if (Date.now() - lastMarkerPressAtRef.current < 300) return;
      // with a place callout open, the first tap just dismisses it
      if (selectionRef.current?.kind === "place") {
        clearSelection();
        return;
      }
      posthog?.capture("map_background_tapped", {
        action: selectionRef.current?.kind === "pending" ? "move" : "create",
      });
      // a tap with the tooltip already open moves the pending pin
      void selectOnMap({
        kind: "pending",
        coordinate: e.nativeEvent.coordinate,
      });
    },
    [clearSelection, selectOnMap],
  );

  const confirmPendingPlace = useCallback(() => {
    const sel = selectionRef.current;
    if (!sel || sel.kind !== "pending") return;
    posthog?.capture("map_create_place_here_tapped");
    clearSelection();
    onAddPlace(sel.coordinate);
  }, [clearSelection, onAddPlace]);

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

  // A param-targeted camera replaces the initial fit-to-markers move, then
  // the param is cleared so a later tab-bar visit doesn't re-center.
  // Runs before the fit effect below so didFitRef is set first.
  useEffect(() => {
    if (!focusPlaceId) return;
    didFitRef.current = true;
    const place = places.find((p) => p.id === focusPlaceId);
    if (!place || !mapReady) return;
    router.setParams({ place: undefined });
    mapRef.current?.animateToRegion(
      {
        latitude: place.location.latitude,
        longitude: place.location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      400,
    );
  }, [focusPlaceId, places, mapReady]);

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
      {/* Self-configures this tab: no tab bar while the map is on screen.
          The bar is position:absolute in the layout, so hiding it does not
          resize the map. */}
      <Tabs.Screen options={{ tabBarStyle: { display: "none" } }} />
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        // NativeWind v5 does not reliably convert className to style on
        // third-party native components like MapView — without an explicit
        // style the map gets zero size and renders as an empty screen.
        style={{ flex: 1 }}
        initialRegion={DEFAULT_REGION}
        onMapReady={() => setMapReady(true)}
        onPress={handleMapPress}
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
        mapPadding={{ top: 50, right: 0, bottom: 20, left: 10 }}
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
                  clearSelection();
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
              onPress={() => {
                lastMarkerPressAtRef.current = Date.now();
                void selectOnMap({ kind: "place", place });
              }}
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

        {/* Pending "create here?" pin dropped by an empty-map tap. Tapping
            it is a no-op (the tooltip is already open) — it only stamps the
            marker-press guard so the echoed map press can't move it. */}
        {selection?.kind === "pending" && (
          <Marker
            coordinate={selection.coordinate}
            onPress={() => {
              lastMarkerPressAtRef.current = Date.now();
            }}
          >
            <View className="map-pin map-pin-pending">
              <Image
                source={icons.plus}
                className="map-pin-icon"
                tintColor="#fff"
              />
            </View>
          </Marker>
        )}
      </MapView>

      {selection && anchor && (
        // box-none → taps outside the card fall through to the map, where
        // MapView's onPress dismisses the place callout / moves the pending
        // pin.
        <View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            left: Math.min(
              Math.max(anchor.x - CALLOUT_WIDTH / 2, 8),
              width - CALLOUT_WIDTH - 8,
            ),
            // clamp so a pin near the top edge can't push the callout
            // under the Back chip / off screen
            top: Math.max(
              anchor.y - PIN_RADIUS - CALLOUT_GAP - calloutHeight,
              insets.top + 8,
            ),
            width: CALLOUT_WIDTH,
            // avoid a first frame at the wrong position before onLayout
            opacity: calloutHeight ? 1 : 0,
          }}
        >
          <View
            className="map-callout"
            onLayout={(e) => setCalloutHeight(e.nativeEvent.layout.height)}
          >
            {selection.kind === "place" ? (
              <>
                <PlaceCard
                  place={selection.place}
                  onExpand={clearSelection}
                  currentUid={user?.uid}
                />

                <View className="map-callout-actions">
                  <Button
                    className="p-1 flex-1"
                    label="View"
                    onPress={() => {
                      clearSelection();
                      router.push(`/place/${selection.place.id}`);
                    }}
                  />
                  {selection.place.uid === user?.uid && (
                    <Button
                      className="p-1 flex-1"
                      label="Edit"
                      onPress={() => {
                        posthog?.capture("map_marker_edit_tapped", {
                          place_id: selection.place.id,
                        });
                        clearSelection();
                        onEditPlace(selection.place);
                      }}
                    />
                  )}
                  <Button
                    className="p-1 flex-1"
                    label="Go"
                    onPress={() => {
                      clearSelection();
                      void openNavigation(
                        selection.place.location.latitude,
                        selection.place.location.longitude,
                      );
                    }}
                  />
                </View>
              </>
            ) : (
              <>
                <Text className="map-callout-pending-title">
                  Add a place here?
                </Text>
                <Text className="map-callout-pending-coords" numberOfLines={1}>
                  {toGeoPointCoordinate(selection.coordinate.latitude)}{" "}
                  {toGeoPointCoordinate(selection.coordinate.longitude)}
                </Text>

                <View className="map-callout-actions">
                  <Button
                    className="button-secondary p-1 flex-1"
                    classNameLabel="button-secondary-text"
                    label="Cancel"
                    onPress={clearSelection}
                  />
                  <Button
                    className="p-1 flex-1"
                    label="Create Place"
                    onPress={confirmPendingPlace}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      )}

      <View className="map-overlay-top" style={{ top: insets.top + 8 }}>
        <Pressable className="map-title-chip" onPress={() => router.back()}>
          <Image source={icons.back} className="size-6" />
          <Text className="map-title">Back</Text>
        </Pressable>
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
