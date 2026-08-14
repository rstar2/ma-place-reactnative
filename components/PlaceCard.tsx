import React from "react";
import { View, Image, Pressable } from "react-native";

import Text from "@/components/Text";
import {
  cn,
  formatCurrency,
  formatStatusLabel,
  formatDateTime,
} from "@/lib/utils";
import { Place } from "@/lib/types";

type PlaceCardProps = Omit<Place, "id"> & {
  expanded: boolean;
  onPress: () => void;
  onEditPress?: () => void;
};

export default function PlaceCard({
  // place props
  color,
  category,
  plan,
  renewalDate,
  paymentMethod,
  startDate,
  status,
  icon,
  name,
  price,
  currency,
  billing,

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
              {name}
            </Text>
            <Text numberOfLines={1} ellipsizeMode="tail" className="sub-meta">
              {category?.trim() ||
                plan?.trim() ||
                (renewalDate ? formatDateTime(renewalDate) : "")}
            </Text>
          </View>
        </View>

        <View className="sub-price-box">
          <Text className="sub-price">{formatCurrency(price, currency)}</Text>
          <Text className="sub-billing">{billing}</Text>
        </View>
      </View>

      {expanded && (
        <View className="sub-bdy">
          <View className="sub-details">
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Payment:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {paymentMethod?.trim() ?? "Not provided"}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Category:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {(category?.trim() || plan?.trim()) ?? "Not provided"}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Started:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {startDate ? formatDateTime(startDate) : "Not provided"}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Renewal date:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {renewalDate ? formatDateTime(renewalDate) : "Not provided"}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Status:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {status ? formatStatusLabel(status) : "Not provided"}
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
