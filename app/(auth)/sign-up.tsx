import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function SignUp() {
  return (
    <View>
      <Text>SignIn</Text>
      <Link href="/(auth)/sign-up">Go to SignUp</Link>
    </View>
  );
}
