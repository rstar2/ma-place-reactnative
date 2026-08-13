import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as auth from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

import { GOOGLE_WEB_CLIENT_ID } from "@/lib/env";
import { posthog } from "@/lib/posthog";

// Configure Google Sign-in once
GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });

/** Completion event to capture once the new UID is identified. */
type AuthCompletion = {
  event: string;
  properties?: Record<string, string>;
};

type AuthContextValue = {
  user: auth.User | null;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<auth.User | null>(null);
  const [initializing, setInitializing] = useState(true);
  // onAuthStateChanged fires (possibly with null) while the persisted session is restored.
  const initialized = useRef(false);

  // null initially: the startup null callback is a no-op (null !== null is false),
  // so the anonymous PostHog identity is preserved instead of being reset.
  const identifiedUserId = useRef<string | null>(null);
  // Completion events deferred until the new UID is identified. A single slot
  // (replaced per call) avoids attributing stale events from a failed attempt.
  const authPendingCompletion = useRef<AuthCompletion | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(auth.getAuth(), (nextUser) => {
      setUser(nextUser);

      if (!initialized.current) {
        initialized.current = true;
        setInitializing(false);
      }

      // Posthog identify/reset must be called after the auth state is known/restored,
      // so we defer it until the first onAuthStateChanged callback.
      const nextUserId = nextUser?.uid ?? null;
      if (nextUserId !== identifiedUserId.current) {
        // Reset only on the identified → signed-out transition. The startup null
        // never enters this block (null === null), preserving anonymous identity.
        if (nextUserId === null) {
          posthog?.reset();
        } else {
          // PII (email/display name) intentionally not sent as person properties.
          posthog?.identify(nextUserId);

          // Flush the deferred completion event now that the new UID is
          // identified, so it attributes to the signed-in user.
          const authCompletion = authPendingCompletion.current;
          if (authCompletion) {
            authPendingCompletion.current = null;
            posthog?.capture(authCompletion.event, authCompletion.properties);
          }
        }

        identifiedUserId.current = nextUserId;
      } else {
        // Same UID (e.g. re-authenticating as the current user) or a duplicate
        // null: the UID-change guard skips capture, so drop any pending event to
        // keep it from being attributed to a later identity change.
        authPendingCompletion.current = null;
      }
    });
    return unsubscribe;
  }, []);

  const value: AuthContextValue = {
    user,
    initializing,
    async signIn(email, password) {
      authPendingCompletion.current = {
        event: "sign_in_completed",
        properties: { sign_in_method: "password" },
      };
      try {
        await auth.signInWithEmailAndPassword(auth.getAuth(), email, password);
      } catch (err) {
        // Rejected sign-in: the completion callback won't fire, so clear the
        // pending event to avoid stale attribution on a later success.
        authPendingCompletion.current = null;
        throw err;
      }
    },
    async signUp(email, password) {
      authPendingCompletion.current = {
        event: "account_created",
        properties: { sign_up_method: "password" },
      };
      try {
        await auth.createUserWithEmailAndPassword(
          auth.getAuth(),
          email,
          password,
        );
      } catch (err) {
        // Rejected sign-up: the completion callback won't fire, so clear the
        // pending event to avoid stale attribution on a later success.
        authPendingCompletion.current = null;
        throw err;
      }
    },
    async signInWithGoogle() {
      authPendingCompletion.current = {
        event: "sign_in_completed",
        properties: { sign_in_method: "google" },
      };
      try {
        // hasPlayServices is a no-op on iOS; on Android it prompts to update if required.
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });

        // Get the users ID token
        const signInResult = await GoogleSignin.signIn();
        // Try the new style of google-sign in result, from v13+ of that module
        const idToken = signInResult.data?.idToken;

        if (!idToken) {
          throw Object.assign(new Error("Google sign-in was cancelled."), {
            code: "auth/cancelled",
          });
        }
        const credential = auth.GoogleAuthProvider.credential(idToken);
        await auth.signInWithCredential(auth.getAuth(), credential);
      } catch (err) {
        // Cancellation or failure at any step aborts before the credential is
        // applied, so clear the pending event to avoid stale attribution.
        authPendingCompletion.current = null;
        throw err;
      }
    },
    async signOut() {
      try {
        if (GoogleSignin.getCurrentUser()) {
          await GoogleSignin.revokeAccess();
          await GoogleSignin.signOut();
        }
      } catch {
        // ignore — the user may not have signed in via Google
      }
      await auth.signOut(auth.getAuth());
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>.");
  }
  return ctx;
}

/** Map common Firebase Auth error codes to short, human-friendly messages. */
export function friendlyAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/cancelled":
      return "Sign-in was cancelled.";
    case "auth/invalid-email":
      return "That email address looks invalid.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Choose a stronger password (at least 6 characters).";
    case "auth/network-request-failed":
      return "Network error — check your connection.";
    case "auth/operation-not-allowed":
      return "This sign-in method isn't enabled in Firebase.";
    case "auth/too-many-requests":
      return "Too many attempts. Try again later.";
    default:
      return "Something went wrong. Please try again.";
  }
}
