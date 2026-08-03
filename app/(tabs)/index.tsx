import { Link } from "expo-router";
import { Text, View } from "react-native";

import ScreenBase from "@/app/components/ScreenBase";

export default function Index() {
  return (
    <ScreenBase className="items-center justify-center">
      <Text className="text-xl font-bold text-success">Home!</Text>

      <View>
        <Link href="/sign-in">Go to SignIn</Link>
        <Link href="/sign-up">Go to SignUp</Link>
        <Link href="/settings">Go to Settings</Link>

        {/* Two ways to navigate to a dynamic route */}
        <Link href="/place/1">Go to Place 1</Link>
        <Link
          href={{
            pathname: "/place/[id]",
            params: {
              id: "2",
            },
          }}
        >
          Go to Place 2
        </Link>
      </View>
    </ScreenBase>
  );
}
