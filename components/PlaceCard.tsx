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

type PlaceCardProps = {
  place: Place;
  style?: StyleProp<ViewStyle>;
  expanded?: boolean;
  onExpand: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showOnMap?: boolean;
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
  },

  style,
  expanded = false,
  onExpand,
  onEdit,
  onDelete,
  showOnMap,
}: PlaceCardProps) {
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
            <PlaceShowOnMap placeId={id} />
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
              {uid}
            </Text>
          </View>

          {(onEdit || onDelete) && (
            <View className="flex-row gap-3">
              {onEdit && (
                <Button
                  className="flex-1 w-1/2"
                  onPress={onEdit}
                  label="Edit"
                ></Button>
              )}

              <Button
                onPress={onDelete}
                className="bg-destructive flex-1 w-1/2"
                label="Delete"
              />
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}

export function PlaceShowOnMap({ placeId }: { placeId: string }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/map", params: { place: placeId } })
      }
    >
      <Image
        source={icons.map}
        className="place-card-show_in_map-icon"
        tintColor={theme.colors.primary}
      />
    </Pressable>
  );
}
