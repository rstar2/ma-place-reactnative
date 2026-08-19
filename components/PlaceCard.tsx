import React from "react";
import {
  View,
  Image,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import Text from "@/components/ui/Text";
import { cn, formatDateTime } from "@/lib/utils";
import { Place } from "@/lib/types";
import { theme } from "@/constants/theme";

type PlaceCardProps = {
  place: Place;
  style?: StyleProp<ViewStyle>;
  expanded?: boolean;
  onPress: () => void;
  onEditPress?: () => void;
};

export default function PlaceCard({
  // place
  place: { title, description, tags, uid, createdAt, location, icon, color },

  // additional
  style,
  expanded = false,
  onPress,
  onEditPress,
}: PlaceCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn("place-card", expanded && "place-card-expanded")}
      style={[
        style,
        color ? { backgroundColor: color } : undefined,
      ]}
    >
      <View className="place-head">
        <View className="place-head-main">
          <View className="place-head-main-icon-box">
            <Image
              source={icon}
              className="place-head-main-icon"
              tintColor={theme.colors.foreground}
            />
          </View>
          <View className="place-head-main-copy">
            <Text numberOfLines={1} className="place-head-main-title">
              {title}
            </Text>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              className="place-head-main-desc"
            >
              {tags?.join(", ")}
            </Text>
          </View>
        </View>

        <View className="place-head-secondary">
          <Text className="place-head-secondary-line1"></Text>
          <Text className="place-head-secondary-line2">
            {formatDateTime(createdAt)}
          </Text>
        </View>
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

          {onEditPress && (
            <Pressable onPress={onEditPress} className="sub-edit">
              <Text className="sub-edit-text">Edit</Text>
            </Pressable>
          )}
        </View>
      )}
    </Pressable>
  );
}
