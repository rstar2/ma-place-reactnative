import { Image } from "expo-image";
import { Tabs } from "expo-router";
import { Pressable, View, type ImageSourcePropType } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { icons } from "@/constants/icons";
import { theme } from "@/constants/theme";
import { ManagePlaceProvider, useManagePlace } from "@/lib/places";
import { cn } from "@/lib/utils";

const tabBar = theme.components.tabBar;

type TabScreen = {
  name: string;
  title: string;
  icon: ImageSourcePropType;
};

const tabs = [
  { name: "index", title: "Home", icon: icons.home },
  { name: "place/index", title: "Places", icon: icons.activity },
  { name: "add", title: "Add Place", icon: icons.plus },
  { name: "settings", title: "Settings", icon: icons.setting },
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
          //   className="tabs-glyph"
          style={{
            // the Image from expo-image requires width and height to be set, otherwise it will not render
            width: tabBar.iconSize,
            // // height: tabBar.iconSize,
            aspectRatio: 1,

            tintColor: theme.colors.background,
          }}
        />
      </View>
    </View>
  );
}

function TabsNavigator() {
  const insets = useSafeAreaInsets();
  const { onAddPlace } = useManagePlace();

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
          backgroundColor: theme.colors.primary,
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

            // Tab-bar action button, not a screen: press opens the add-place modal
            // Intercept the press so it never navigates to /add.
            tabBarButton:
              name !== "add"
                ? undefined
                : (props) => (
                    <Pressable
                      {...props}
                      ref={undefined}
                      onPress={onAddPlace}
                    />
                  ),
          }}
        />
      ))}

      {/* Note: don't show this dynamic route in the Tabs,
        but still describe it so it can be accessed */}
      <Tabs.Screen name="place/[id]" options={{ href: null }} />
    </Tabs>
  );
}

export default function TabsLayout() {
  return (
    <ManagePlaceProvider>
      <TabsNavigator />
    </ManagePlaceProvider>
  );
}
