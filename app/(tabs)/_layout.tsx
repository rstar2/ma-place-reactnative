import { Tabs } from "expo-router";
import { Image } from "expo-image";
import { View, type ImageSourcePropType } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { icons } from "@/constants/icons";
import { colors, components } from "@/constants/theme";
import { cn } from "@/lib/utils";

const tabBar = components.tabBar;

type TabScreen = {
  name: string;
  title: string;
  icon: ImageSourcePropType;
};

const tabs = [
  { name: "index", title: "Home", icon: icons.home },
  { name: "settings", title: "Settings", icon: icons.setting },
  { name: "place/index", title: "Places", icon: icons.activity },
] as const satisfies TabScreen[];

function TabIcon({
  focused,
  icon,
}: {
  focused: boolean;
  icon: ImageSourcePropType;
}) {
  return (
    <View className="tabs-icon">
      <View className={cn("tabs-pill", focused && "tabs-active")}>
        <Image
          source={icon}
          className="tabs-glyph"
          style={{
            // the Image from expo-image requires width and height to be set, otherwise it will not render
            width: tabBar.iconSize,
            // height: tabBar.iconSize,
            aspectRatio: 1,

            // tintColor: "yellow",
          }}
        />
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarLabelVisibilityMode: "unlabeled",
        tabBarStyle: {
          position: "absolute",
          bottom: Math.max(insets.bottom, tabBar.horizontalInset),
          height: tabBar.height,
          marginHorizontal: tabBar.horizontalInset,
          borderRadius: tabBar.radius,
          backgroundColor: colors.primary,
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarItemStyle: {
          paddingVertical: tabBar.height / 2 - tabBar.iconFrame / 1.6,
        },
        tabBarIconStyle: {
          width: tabBar.iconFrame,
          height: tabBar.iconFrame,
          alignItems: "center",
        },
      }}
    >
      {tabs.map(({ name, title, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={icon} />
            ),
          }}
        />
      ))}

      {/* Note: don't show this dynamic route in the Tabs */}
      <Tabs.Screen name="place/[id]" options={{ href: null }} />
    </Tabs>
  );
}
