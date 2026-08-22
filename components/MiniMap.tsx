import { View } from "react-native";
import MapView, { PROVIDER_GOOGLE, type Region } from "react-native-maps";

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

/**
 * Small non-interactive map preview: all gestures off and `pointerEvents`
 * none, so taps fall through to a wrapping Pressable (e.g. the Home card).
 * Reusable for the place-details location card.
 */
export default function MiniMap({
  region = DEFAULT_REGION,
  showsUserLocation = false,
  className = "mini-map",
}: {
  region?: Region;
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
      />
    </View>
  );
}
