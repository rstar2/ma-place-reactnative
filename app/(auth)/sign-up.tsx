import { Link } from "expo-router";
import { View } from "react-native";

import Text from "@/app/components/Text";

export default function SignUp() {
  return (
    <View>
      <Text>SignIn</Text>
      {/* Note: both "/sign-up" and "/(auth)/sign-up" values are valid*/}
      <Link href="/sign-up">Go to SignUp</Link>
    </View>
  );
}
