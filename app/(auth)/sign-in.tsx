import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function SignIn() {
  return (
    <View>
      <Text>SignIn</Text>
      <Link href="/(auth)/sign-up">Go to SignUp</Link>
    </View>
  );
}
