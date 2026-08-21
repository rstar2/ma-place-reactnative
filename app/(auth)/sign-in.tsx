import { Link } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import TextInput from "@/components/ui/TextInput";
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
    email.trim().length > 0 &&
    password.length > 0 &&
    !submitting &&
    !googleSubmitting;

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
    if (!canSubmit) return;
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
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="auth-screen"
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
              <Text className="auth-wordmark-sub">places</Text>
            </View>
          </View>
          <Text className="auth-title">Welcome back</Text>
          <Text className="auth-subtitle">Sign in to manage your places.</Text>
        </View>

        <View className="card">
          <View className="form">
            <View className="input-field">
              <Text className="input-label">Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
                className={cn(error && "input-error")}
              />
            </View>

            <View className="input-field">
              <Text className="input-label">Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                autoComplete="password"
                textContentType="password"
                className={cn(error && "input-error")}
              />
            </View>

            {error ? <Text className="auth-error">{error}</Text> : null}

            <Button
              label="Sign in"
              onPress={handleSignIn}
              disabled={!canSubmit}
              loading={submitting}
              className="py-3 mt-6"
            />
          </View>
        </View>

        <View className="auth-divider-row">
          <View className="auth-divider-line" />
          <Text className="auth-divider-text">or</Text>
          <View className="auth-divider-line" />
        </View>

        <Button
          label="Continue with Google"
          onPress={handleGoogle}
          disabled={googleSubmitting}
          loading={googleSubmitting}
          className="button-secondary py-3"
          classNameLabel="button-secondary-text"
        />

        <View className="auth-link-row">
          <Text className="auth-link-copy">Don&apos;t have an account?</Text>
          <Link href="/sign-up" asChild>
            <Text className="auth-link">Create account</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
