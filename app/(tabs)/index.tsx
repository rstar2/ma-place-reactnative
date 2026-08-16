import { useState } from "react";
import { FlatList, Image, Pressable, View } from "react-native";

import ScreenBase from "@/components/ScreenBase";
import Text from "@/components/Text";
import ListHeading from "@/components/ListHeading";
import PlaceCard from "@/components/PlaceCard";
import { formatCurrency, formatDateTime, noop } from "@/lib/utils";
import { HOME_BALANCE, HOME_PLACES } from "@/constants/data";
import { Place } from "@/lib/types";
import images from "@/constants/images";
import { posthog } from "@/lib/posthog";
import { icons } from "@/constants/icons";
import { useAddEditPlace } from "@/lib/places";

const user = {
  displayName: "John Doe",
  imageUrl: null,
};

export default function Index() {
  const { onAddPlacePress } = useAddEditPlace();
  const [expandedPlaceId, setExpandedPlaceId] = useState<string>();

  const handleExpandPlace = (item: Place) => {
    const isExpanding = expandedPlaceId !== item.id;
    posthog?.capture(isExpanding ? "place_expanded" : "place_collapsed", {
      place_id: item.id,
      place_uid: item.uid,
    });
    setExpandedPlaceId(isExpanding ? item.id : undefined);
  };

  return (
    <ScreenBase>
      <FlatList
        ListHeaderComponent={() => <Header onAddPlacePress={onAddPlacePress} />}
        data={HOME_PLACES}
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

// NOTE: Extract this to a separate component as otherwise it messes
// the rendering. When the "big" flat list is rerendered, like when expanding a place,
// the ListHeaderComponent is rerendered and thus the horizontal FlatList and some layout logic breaks as the refs are not same, etc... (I couldn't understand it fully)
// This is a known issue with FlatList in React Native.
// BUT, just extracting it to a separate component fixes the issue, as the horizontal FlatList is not rerendered when the "big" FlatList is rerendered.
// Also note that the react-compiler is ON, so it does the memoization for use
function Header({ onAddPlacePress }: { onAddPlacePress: () => void }) {
  return (
    <>
      <View className="home-header">
        <View className="home-user">
          <Image
            source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar}
            className="home-avatar"
          />
          <Text className="home-user-name">{user.displayName}</Text>
        </View>

        <Pressable onPress={onAddPlacePress}>
          <Image source={icons.add} className="home-add-icon" />
        </Pressable>
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
          data={HOME_PLACES}
          renderItem={({ item }) => (
            <PlaceCard {...item} expanded={false} onPress={noop} />
          )}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View className="w-4" />}
          ListEmptyComponent={
            <Text className="home-empty-state">No upcoming renewals yet.</Text>
          }
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <ListHeading title="All Places" />
    </>
  );
}
