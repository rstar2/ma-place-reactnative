import { Link } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import TextInput from "@/components/ui/TextInput";
import { friendlyAuthError, useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default function SignUpScreen() {
  const { signUp } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    !submitting &&
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length > 0 &&
    confirmPassword.length > 0;

  function validate(): string | null {
    if (name.trim().length < 2) return "Enter your name.";
    if (!email.trim().includes("@")) return "Enter a valid email address.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirmPassword) return "Passwords don't match.";
    return null;
  }

  // The root layout's auth gate redirects on success, so no manual navigation here.
  async function handleSignUp() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await signUp(name.trim(), email.trim(), password);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
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
          <Text className="auth-title">Create account</Text>
          <Text className="auth-subtitle">Start tracking your places.</Text>
        </View>

        <View className="card">
          <View className="form">
            <View className="input-field">
              <Text className="input-label">Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                autoCapitalize="words"
                textContentType="name"
                className={cn(error && "input-error")}
              />
            </View>

            <View className="input-field">
              <Text className="input-label">Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
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
                textContentType="newPassword"
                className={cn(error && "input-error")}
              />
            </View>

            <View className="input-field">
              <Text className="input-label">Confirm password</Text>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                secureTextEntry
                textContentType="newPassword"
                className={cn(error && "input-error")}
              />
            </View>

            {error ? <Text className="auth-error">{error}</Text> : null}

            <Button
              label="Sign up"
              onPress={handleSignUp}
              disabled={!canSubmit}
              loading={submitting}
              className="py-3 mt-6"
            />
          </View>
        </View>

        <View className="auth-link-row">
          <Text className="auth-link-copy">Already have an account?</Text>
          <Link href="/sign-in" asChild>
            <Text className="auth-link">Sign in</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
