import React from "react";
import {
  View,
  Image,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useRouter } from "expo-router";

import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import { cn, formatDateTime } from "@/lib/utils";
import { Place } from "@/lib/types";
import { theme } from "@/constants/theme";
import { icons } from "@/constants/icons";
import PlaceDeleteButton from "./PlaceDeleteButton";

type PlaceCardProps = {
  place: Place;
  style?: StyleProp<ViewStyle>;
  expanded?: boolean;
  onExpand: () => void;
  onEdit?: () => void;
  showView?: boolean;
  showDelete?: boolean;
  showOnMap?: boolean;
  /** Auth uid of the currently signed-in user - shows "Me" for own places. */
  currentUid?: string;
};

export default function PlaceCard({
  // place
  place: {
    id,
    title,
    description,
    tags,
    uid,
    createdAt,
    location,
    icon,
    color,
    creatorName,
  },

  style,
  expanded = false,
  onExpand,
  onEdit,
  showView = false,
  showDelete = false,
  showOnMap,
  currentUid,
}: PlaceCardProps) {
  const router = useRouter();

  const onShowOnMap = () =>
    router.push({ pathname: "/map", params: { place: id } });
  const onView = () => router.push(`/place/${id}`);

  return (
    <Pressable
      onPress={onExpand}
      className={cn("place-card", expanded && "place-card-expanded")}
      style={[style, color ? { backgroundColor: color } : undefined]}
    >
      <View className="place-head">
        <View className="place-head-icon-box">
          <Image
            source={icon}
            className="place-head-icon"
            tintColor={theme.colors.foreground}
          />
        </View>

        <View className="place-head-main">
          <Text numberOfLines={1} className="place-head-main-title">
            {title}
          </Text>
          <View className="place-head-main-meta">
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              className="place-head-main-desc"
            >
              {tags?.join(", ")}
            </Text>
            <Text className="place-head-main-date">
              {formatDateTime(createdAt)}
            </Text>
          </View>
        </View>

        {showOnMap && (
          <View className="absolute -right-2 -top-2">
            <PlaceShowOnMap onShowOnMap={onShowOnMap} />
          </View>
        )}
      </View>

      {expanded && (
        <View className="place-body">
          <View className="place-body-row">
            <Text className="place-body-row-value">{description}</Text>
          </View>

          <View className="place-body-row">
            <Text className="place-body-row-label">Location:</Text>
            <Text
              className="place-body-row-value"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {`${location.latitude} | ${location.longitude}`}
            </Text>
          </View>

          <View className="place-body-row">
            <Text className="place-body-row-label">Created:</Text>
            <Text
              className="place-body-row-value"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {formatDateTime(createdAt)}
            </Text>
          </View>

          <View className="place-body-row">
            <Text className="place-body-row-label">By:</Text>
            <Text
              className="place-body-row-value"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {uid === currentUid ? "Me" : (creatorName ?? "Unknown")}
            </Text>
          </View>

          {(showView || onEdit || showDelete) && (
            <View className="flex-row gap-3">
              {showView && (
                <Button
                  className="flex-1 w-1/3"
                  onPress={onView}
                  label="View"
                ></Button>
              )}
              {onEdit && (
                <Button
                  className="flex-1 w-1/3"
                  onPress={onEdit}
                  label="Edit"
                ></Button>
              )}

              <PlaceDeleteButton placeId={id} className="flex-1 w-1/3" />
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}

export function PlaceShowOnMap({ onShowOnMap }: { onShowOnMap: () => void }) {
  return (
    <Pressable onPress={onShowOnMap}>
      <Image
        source={icons.place}
        className="place-card-show_in_map-icon"
        tintColor={theme.colors.primary}
      />
    </Pressable>
  );
}
