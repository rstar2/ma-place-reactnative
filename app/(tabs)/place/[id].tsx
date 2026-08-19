import { useLocalSearchParams } from "expo-router";

import ScreenBase from "@/components/ScreenBase";
import Text from "@/components/ui/Text";

export default function PlaceDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ScreenBase>
      <Text>Place Details: {id}</Text>
    </ScreenBase>
  );
}
