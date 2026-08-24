import { Image, View, type ImageSourcePropType } from "react-native";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  type LatLng,
  type Region,
} from "react-native-maps";

/**
 * World-view fallback used while the user's position is unknown
 * or when location permission has been denied.
 */
export const DEFAULT_REGION: Region = {
  latitude: 42.7,
  longitude: 25.4,
  latitudeDelta: 30,
  longitudeDelta: 30,
};

/** Where to drop the pin plus the visuals it renders with. */
export type MiniMapLocation = LatLng & {
  icon: ImageSourcePropType;
  color: string;
};

/**
 * Small non-interactive map preview: all gestures off and `pointerEvents`
 * none, so taps fall through to a wrapping Pressable (e.g. the Home card).
 * Reusable for the place-details location card.
 */
export default function MiniMap({
  region = DEFAULT_REGION,
  location,
  showsUserLocation = false,
  className = "mini-map",
}: {
  region?: Region;
  /** Renders the same place pin as the big map — display only, no taps. */
  location?: MiniMapLocation;
  showsUserLocation?: boolean;
  className?: string;
}) {
  return (
    <View className={className}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        region={region}
        showsUserLocation={showsUserLocation}
        scrollEnabled
        zoomEnabled
        rotateEnabled
        pitchEnabled
        toolbarEnabled
        showsCompass
        // pointerEvents="none"
      >
        {location && (
          <Marker coordinate={location}>
            <View
              className="map-pin"
              style={{ backgroundColor: location.color }}
            >
              <Image source={location.icon} className="map-pin-icon" />
            </View>
          </Marker>
        )}
      </MapView>
    </View>
  );
}
