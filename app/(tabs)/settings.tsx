import { useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

import ScreenBase from "@/components/ScreenBase";
import Text from "@/components/ui/Text";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
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

      <Pressable
        onPress={handleSignOut}
        disabled={submitting}
        className={cn(
          "button bg-destructive py-3 mt-6",
          submitting && "button-disabled",
        )}
      >
        {submitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text className="button-text text-white">Sign out</Text>
        )}
      </Pressable>
    </ScreenBase>
  );
}
