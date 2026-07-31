import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function PlaceDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View>
      <Text>Place Details: {id}</Text>
    </View>
  );
}
