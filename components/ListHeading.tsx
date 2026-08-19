import { View, TouchableOpacity } from "react-native";

import Text from "@/components/ui/Text";

type ListHeadingProps = {
  title: string;
  onViewAll?: () => void;
};

export default function ListHeading({ title, onViewAll }: ListHeadingProps) {
  return (
    <View className="list-head">
      <Text className="list-title">{title}</Text>

      {onViewAll && (
        <TouchableOpacity className="list-action" onPress={onViewAll}>
          <Text className="list-action-text">View all</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
