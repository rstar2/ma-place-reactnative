import React from "react";
import { View, Image, Pressable } from "react-native";

import Text from "@/components/Text";
import { cn, formatDateTime } from "@/lib/utils";
import { Place } from "@/lib/types";

type PlaceCardProps = Place & {
  expanded: boolean;
  onPress: () => void;
  onEditPress?: () => void;
};

export default function PlaceCard({
  // place props
  title,
  description,
  tags,
  uid,
  createdAt,
  location,
  icon,
  color,

  // additional
  expanded,
  onPress,
  onEditPress,
}: PlaceCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn("sub-card", expanded ? "sub-card-expanded" : "bg-card")}
      style={!expanded && color ? { backgroundColor: color } : undefined}
    >
      <View className="sub-head">
        <View className="sub-main">
          <Image source={icon} className="sub-icon" />
          <View className="sub-copy">
            <Text numberOfLines={1} className="sub-title">
              {title}
            </Text>
            <Text numberOfLines={1} ellipsizeMode="tail" className="sub-meta">
              {tags?.join(", ")}
            </Text>
          </View>
        </View>

        <View className="sub-price-box">
          <Text className="sub-price">{description}</Text>
          {/* <Text className="sub-billing">By {uid}</Text> */}
        </View>
      </View>

      {expanded && (
        <View className="sub-bdy">
          <View className="sub-details">
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Location:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {`${location.latitude} | ${location.longitude}`}
                </Text>
              </View>
            </View>

            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Created:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {formatDateTime(createdAt)}
                </Text>
              </View>
            </View>

            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">By:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {uid}
                </Text>
              </View>
            </View>
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
