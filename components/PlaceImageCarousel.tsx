import { useCallback, useState } from "react";
import { View, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { Carousel } from "react-native-reanimated-carousel";

import { cn } from "@/lib/utils";
import type { Place } from "@/lib/types";

/** ScreenBase is p-5 → 20px horizontal padding on each side. */
const SCREEN_H_PADDING = 40;
/** Same ratio as .place-image-preview (aspect-4/3). */
const HEIGHT_RATIO = 3 / 4;

/** http(s) only — drops missing values and the literal "todo" placeholder. */
const isRemoteImage = (uri: string) => /^https?:\/\//i.test(uri);

//  demo images so the carousel shows without backend data
const PLACEHOLDER_IMAGE_URLS: string[] = [
  //   "https://picsum.photos/id/1015/800/600",
  //   "https://picsum.photos/id/1016/800/600",
  //   "https://picsum.photos/id/1018/800/600",
];

/**
 * Derives the displayable images for a place. Today that is the single
 * `url`; when the backend grows an `images: string[]` field this is the
 * ONLY place to change: `place.images ?? [place.url]`.
 */
export function placeImageUrls(place: Pick<Place, "url">): string[] {
  const urls = (place.url ? [place.url] : []).filter(isRemoteImage);
  return urls.length > 0 ? urls : PLACEHOLDER_IMAGE_URLS;
}

export default function PlaceImageCarousel({ images }: { images: string[] }) {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  const count = images.length;

  // Fires every frame during a swipe — round the fractional progress and
  // bail out via the state updater to avoid re-render storms
  const handleProgressChange = useCallback(
    (progress: number) => {
      const next = Math.min(Math.max(Math.round(progress), 0), count - 1);
      setActiveIndex((prev) => (prev === next ? prev : next));
    },
    [count],
  );

  // After all hooks — keeps hook order stable when images changes length
  if (count === 0) return null;

  const carouselWidth = Math.max(width - SCREEN_H_PADDING, 0);
  const carouselHeight = Math.round(carouselWidth * HEIGHT_RATIO);

  return (
    <View>
      <View className="place-details-carousel">
        <Carousel
          // remount on width change so rotation gets a clean layout
          key={carouselWidth}
          style={{ width: carouselWidth, height: carouselHeight }}
          data={images}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={{ flex: 1 }}
              contentFit="cover"
              transition={200}
              recyclingKey={item}
            />
          )}
          onProgressChange={handleProgressChange}
          defaultIndex={0}
          loop={false}
        />
      </View>

      {count > 1 && (
        <View className="place-details-dots">
          {images.map((uri, i) => (
            <View
              key={`${uri}-${i}`}
              className={cn(
                "place-details-dot",
                i === activeIndex && "place-details-dot-active",
              )}
            />
          ))}
        </View>
      )}
    </View>
  );
}
