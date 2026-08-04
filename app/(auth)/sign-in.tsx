import { Link } from "expo-router";
import { View } from "react-native";

import Text from "@/app/components/Text";

export default function SignIn() {
  return (
    <View>
      <Text>SignIn</Text>
      <Link href="/sign-up">Go to SignUp</Link>
      <Link href="/">Home</Link>
    </View>
  );
}
