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

// Configure Google Sign-in once. No-op until you set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.
if (GOOGLE_WEB_CLIENT_ID) {
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
}

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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(auth.getAuth(), (nextUser) => {
      setUser(nextUser);
      if (!initialized.current) {
        initialized.current = true;
        setInitializing(false);
      }
    });
    return unsubscribe;
  }, []);

  const value: AuthContextValue = {
    user,
    initializing,
    async signIn(email, password) {
      await auth.signInWithEmailAndPassword(auth.getAuth(), email, password);
    },
    async signUp(email, password) {
      await auth.createUserWithEmailAndPassword(
        auth.getAuth(),
        email,
        password,
      );
    },
    async signInWithGoogle() {
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
