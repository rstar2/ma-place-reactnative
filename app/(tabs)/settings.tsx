import { useState } from "react";
import { View } from "react-native";

import ScreenBase from "@/components/ScreenBase";
import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import { useAuth } from "@/lib/auth";
import { posthog } from "@/lib/posthog";

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  // The root layout's auth gate redirects back to sign-in after sign-out.
  async function handleSignOut() {
    setSubmitting(true);
    try {
      posthog?.capture("sign_out_requested");
      await signOut();
    } catch {
      // ignore — staying signed in is harmless
      // TODO: show a toast or something to indicate failure
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenBase>
      <Text className="text-2xl font-sans-bold text-primary">Settings</Text>

      <View className="mt-6 rounded-2xl border border-border bg-card p-4">
        <Text className="text-sm font-sans-semibold text-muted-foreground">
          Signed in as
        </Text>
        <Text className="mt-1 text-base font-sans-bold text-primary">
          {user?.email ?? "Unknown"}
        </Text>
      </View>

      <Button
        label="Sign out"
        onPress={handleSignOut}
        loading={submitting}
        className="bg-destructive mt-6"
      />
    </ScreenBase>
  );
}
