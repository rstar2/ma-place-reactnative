import { View, TouchableOpacity } from "react-native";

import Text from "@/app/components/Text";

type ListHeadingProps = {
  title: string;
};

export default function ListHeading({ title }: ListHeadingProps) {
  return (
    <View className="list-head">
      <Text className="list-title">{title}</Text>

      <TouchableOpacity className="list-action">
        <Text className="list-action-text">View all</Text>
      </TouchableOpacity>
    </View>
  );
}
