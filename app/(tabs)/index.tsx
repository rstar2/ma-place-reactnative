import { useState } from "react";
import { FlatList, View, Image } from "react-native";

import ScreenBase from "@/app/components/ScreenBase";
import Text from "@/app/components/Text";
import ListHeading from "@/app/components/ListHeading";
import PlaceCard from "@/app/components/PlaceCard";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { HOME_BALANCE, HOME_SUBSCRIPTIONS } from "@/constants/data";
import { Subscription } from "@/lib/types";
import images from "@/constants/images";

export default function Index() {
  const [expandedPlaceId, setExpandedPlaceId] = useState<string>();

  const handleExpandPlace = (item: Subscription) => {
    setExpandedPlaceId((currentId) =>
      currentId === item.id ? undefined : item.id,
    );

    // const isExpanding = expandedPlaceId !== item.id;
    // posthog.capture(
    //   isExpanding ? "subscription_expanded" : "subscription_collapsed",
    //   {
    //     subscription_name: item.name,
    //     subscription_id: item.id,
    //   },
    // );
  };

  const user = {
    displayName: "John Doe",
    imageUrl: null,
  };
  return (
    <ScreenBase>
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                <Image
                  source={
                    user?.imageUrl ? { uri: user.imageUrl } : images.avatar
                  }
                  className="home-avatar"
                />
                <Text className="home-user-name">{user.displayName}</Text>
              </View>

              {/* <Pressable onPress={() => setIsModalVisible(true)}>
                <Image source={icons.add} className="home-add-icon" />
              </Pressable> */}
            </View>

            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>

              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                  {formatDateTime(HOME_BALANCE.nextRenewalDate, "MM/DD")}
                </Text>
              </View>
            </View>

            <View className="mb-5">
              <ListHeading title="Upcoming" />

              <FlatList
                data={HOME_SUBSCRIPTIONS}
                renderItem={({ item }) => <PlaceCard {...item} />}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={() => <View className="w-4" />}
                ListEmptyComponent={
                  <Text className="home-empty-state">
                    No upcoming renewals yet.
                  </Text>
                }
                horizontal
                showsHorizontalScrollIndicator={false}
              />
            </View>

            <ListHeading title="All Places" />
          </>
        )}
        data={HOME_SUBSCRIPTIONS}
        extraData={expandedPlaceId}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PlaceCard
            {...item}
            expanded={expandedPlaceId === item.id}
            onPress={() => handleExpandPlace(item)}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-4" />}
        ListEmptyComponent={
          <Text className="home-empty-state">No places yet.</Text>
        }
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-30"
      />
    </ScreenBase>
  );
}
