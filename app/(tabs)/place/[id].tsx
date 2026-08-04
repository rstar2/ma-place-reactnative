import { useLocalSearchParams } from "expo-router";

import ScreenBase from "@/app/components/ScreenBase";
import Text from "@/app/components/Text";

export default function PlaceDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ScreenBase>
      <Text>Place Details: {id}</Text>
    </ScreenBase>
  );
}
