import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold text-success">Home!</Text>

      <View>
        <Link href="/(auth)/sign-in">Go to SignIn</Link>
        <Link href="/(auth)/sign-up">Go to SignUp</Link>
        <Link href="/(tabs)/settings">Go to Settings</Link>

        {/* Two ways to navigate to a dynamic route */}
        <Link href="/(tabs)/place/1">Go to Place 1</Link>
        <Link
          href={{
            pathname: "/(tabs)/place/[id]",
            params: {
              id: "2",
            },
          }}
        >
          Go to Place 2
        </Link>
      </View>
    </View>
  );
}
