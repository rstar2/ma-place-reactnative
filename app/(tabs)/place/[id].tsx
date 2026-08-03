import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";

import ScreenBase from "@/app/components/ScreenBase";

export default function PlaceDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ScreenBase>
      <Text>Place Details: {id}</Text>
    </ScreenBase>
  );
}
