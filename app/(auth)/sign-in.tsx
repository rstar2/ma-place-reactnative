import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { Link } from "expo-router";

import Text from "@/app/components/Text";
import { friendlyAuthError, useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default function SignInScreen() {
  const { signIn, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const canSubmit =
    email.trim().length > 0 && password.length > 0 && !submitting;

  // The root layout's auth gate redirects on success, so no manual navigation here.
  async function handleSignIn() {
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setGoogleSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setGoogleSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="auth-screen"
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <ScrollView
        className="auth-scroll"
        contentContainerClassName="auth-content"
        keyboardShouldPersistTaps="handled"
      >
        <View className="auth-brand-block">
          <View className="auth-logo-wrap">
            <View className="auth-logo-mark">
              <Text className="auth-logo-mark-text">M</Text>
            </View>
            <View>
              <Text className="auth-wordmark">ma-place</Text>
              <Text className="auth-wordmark-sub">subscriptions</Text>
            </View>
          </View>
          <Text className="auth-title">Welcome back</Text>
          <Text className="auth-subtitle">
            Sign in to manage your places and subscriptions.
          </Text>
        </View>

        <View className="auth-card">
          <View className="auth-form">
            <View className="auth-field">
              <Text className="auth-label">Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="rgba(0,0,0,0.35)"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                className={cn("auth-input", error && "auth-input-error")}
              />
            </View>

            <View className="auth-field">
              <Text className="auth-label">Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="rgba(0,0,0,0.35)"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                className={cn("auth-input", error && "auth-input-error")}
              />
            </View>

            {error ? <Text className="auth-error">{error}</Text> : null}

            <Pressable
              onPress={handleSignIn}
              disabled={!canSubmit}
              className={cn("auth-button", !canSubmit && "auth-button-disabled")}
            >
              {submitting ? (
                <ActivityIndicator color="#081126" />
              ) : (
                <Text className="auth-button-text">Sign in</Text>
              )}
            </Pressable>
          </View>
        </View>

        <View className="auth-divider-row">
          <View className="auth-divider-line" />
          <Text className="auth-divider-text">or</Text>
          <View className="auth-divider-line" />
        </View>

        <Pressable
          onPress={handleGoogle}
          disabled={googleSubmitting}
          className={cn(
            "auth-secondary-button",
            googleSubmitting && "opacity-50",
          )}
        >
          {googleSubmitting ? (
            <ActivityIndicator color="#ea7a53" />
          ) : (
            <Text className="auth-secondary-button-text">
              Continue with Google
            </Text>
          )}
        </Pressable>

        <View className="auth-link-row">
          <Text className="auth-link-copy">Don&apos;t have an account?</Text>
          <Link href="/sign-up">
            <Text className="auth-link">Sign up</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
