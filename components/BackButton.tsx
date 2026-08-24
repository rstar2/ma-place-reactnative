import { Pressable, Image } from "react-native";
import { useRouter } from "expo-router";

import { icons } from "@/constants/icons";
import Text from "@/components/ui/Text";

export default function BackButton() {
  const router = useRouter();

  return (
    <Pressable
      className="map-title-chip"
      hitSlop={8}
      onPress={() => router.back()}
    >
      <Image source={icons.back} className="size-6" />
      <Text className="map-title">Back</Text>
    </Pressable>
  );
}
