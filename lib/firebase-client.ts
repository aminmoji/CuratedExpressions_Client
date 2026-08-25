"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
  type Auth,
} from "firebase/auth";

type PublicFirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  messagingSenderId?: string;
};

let authPromise: Promise<Auth> | null = null;

export function getFirebaseAuth() {
  if (!authPromise) {
    authPromise = fetch("/api/firebase-config")
      .then(async (response) => {
        const data = (await response.json()) as PublicFirebaseConfig & {
          error?: string;
        };
        if (!response.ok) {
          throw new Error(data.error ?? "Sign-in is temporarily unavailable.");
        }

        const app = getApps().length ? getApp() : initializeApp(data);
        const auth = getAuth(app);
        await setPersistence(auth, browserLocalPersistence);
        return auth;
      })
      .catch((error) => {
        authPromise = null;
        throw error;
      });
  }

  return authPromise;
}

export function firebaseErrorMessage(error: unknown) {
  const code =
    typeof error === "object" && error && "code" in error
      ? String(error.code)
      : "";

  const messages: Record<string, string> = {
    "auth/account-exists-with-different-credential":
      "That email already uses another sign-in method.",
    "auth/email-already-in-use": "An account already exists for that email.",
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/network-request-failed": "Check your connection and try again.",
    "auth/operation-not-allowed":
      "That sign-in method has not been enabled yet.",
    "auth/popup-blocked": "Allow the sign-in window, then try again.",
    "auth/popup-closed-by-user": "The sign-in window was closed before finishing.",
    "auth/too-many-requests": "Too many attempts. Wait a moment and try again.",
    "auth/unauthorized-domain":
      "This website has not been authorized in Firebase yet.",
    "auth/weak-password": "Use a stronger password with at least 8 characters.",
    "auth/wrong-password": "The email or password is incorrect.",
  };

  if (messages[code]) return messages[code];
  return error instanceof Error ? error.message : "Unable to continue with sign-in.";
}
