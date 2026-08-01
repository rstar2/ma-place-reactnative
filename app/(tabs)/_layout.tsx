import { Tabs } from "expo-router";
import { Image } from "expo-image";
import { View } from "react-native";

import { icons, type IconKey } from "@/constants/icons";
import { cn } from "@/lib/utils";

type TabScreen = {
  name: string;
  title: string;
  icon: IconKey;
};

const tabs = [
  { name: "index", title: "Home", icon: icons.home },
  { name: "settings", title: "Settings", icon: icons.setting },
  { name: "place/index", title: "Places", icon: icons.activity },
] as const satisfies TabScreen[];

function TabIcon({ focused, icon }: { focused: boolean; icon: IconKey }) {
  return (
    <View className="tabs-icon">
      <View className={cn("tabs-pill", focused && "tabs-active")}>
        <Image source={icon} className="tabs-glyph" />
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
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
