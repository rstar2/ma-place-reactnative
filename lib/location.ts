import { useEffect, useState } from "react";
import * as Location from "expo-location";
import { Linking, Platform } from "react-native";
import { type Region } from "react-native-maps";

// The permission+position request lives OUTSIDE the hook state (same pattern
// as `placesRequest` in store/places-store.ts): mounting/unmounting the Home
// screen must not re-trigger it. Released on denial/failure so a later mount
// can retry (e.g. after the user grants location in system settings).
let userRegionRequest: Promise<Region | null> | null = null;

function requestUserRegion(): Promise<Region | null> {
  if (userRegionRequest) return userRegionRequest;

  userRegionRequest = (async () => {
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) {
        userRegionRequest = null; // allow a retry on the next mount
        return null;
      }

      const { coords } = await Location.getCurrentPositionAsync();
      return {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    } catch {
      userRegionRequest = null;
      return null;
    }
  })();

  return userRegionRequest;
}

/**
 * Resolves the current user's region once (deduped across consumers).
 * `region` is null while resolving or when location is unavailable/denied.
 */
export function useUserLocation() {
  const [region, setRegion] = useState<Region | undefined>(undefined);
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void requestUserRegion().then((resolved) => {
      if (cancelled || !resolved) return;
      setRegion(resolved);
      setGranted(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { region, granted };
}

/**
 * Opens turn-by-turn navigation to the coordinate in the platform's maps
 * app (Google Maps / Apple Maps); falls back to the universal Google Maps
 * URL when no app handles the deep link.
 */
export function openNavigation(latitude: number, longitude: number) {
  const appUrl =
    Platform.OS === "ios"
      ? `maps://?daddr=${latitude},${longitude}`
      : `google.navigation:q=${latitude},${longitude}`;
  const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return Linking.openURL(appUrl).catch(() => Linking.openURL(webUrl));
}
