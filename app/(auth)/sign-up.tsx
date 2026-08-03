import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function SignUp() {
  return (
    <View>
      <Text>SignIn</Text>
      {/* Note: both "/sign-up" and "/(auth)/sign-up" values are valid*/}
      <Link href="/sign-up">Go to SignUp</Link>
    </View>
  );
}
