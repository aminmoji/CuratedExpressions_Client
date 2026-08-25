"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { firebaseErrorMessage, getFirebaseAuth } from "@/lib/firebase-client";

export default function LoginForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  async function finish(user: { emailVerified: boolean }) {
    window.location.assign(user.emailVerified ? "/studio" : "/signup");
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const auth = await getFirebaseAuth();
      const credential = await signInWithEmailAndPassword(
        auth,
        String(form.get("email") ?? "").trim(),
        String(form.get("password") ?? ""),
      );
      await finish(credential.user);
    } catch (cause) {
      setError(firebaseErrorMessage(cause));
      setSubmitting(false);
    }
  }

  async function googleSignIn() {
    setSubmitting(true);
    setError("");
    try {
      const auth = await getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const credential = await signInWithPopup(auth, provider);
      await finish(credential.user);
    } catch (cause) {
      setError(firebaseErrorMessage(cause));
      setSubmitting(false);
    }
  }

  async function resetPassword() {
    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const auth = await getFirebaseAuth();
      await sendPasswordResetEmail(auth, email.trim());
      setMessage("Password reset email sent. Check your inbox.");
    } catch (cause) {
      setError(firebaseErrorMessage(cause));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-page-content">
      <div className="auth-heading">
        <p className="eyebrow">Artist studio</p>
        <h1>Welcome<br />back.</h1>
        <p>Sign in with your email and password, or continue with Google.</p>
      </div>
      <div className="auth-card">
        <form className="auth-form" onSubmit={signIn}>
          <label>Email address<input name="email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label>Password<input name="password" type="password" required autoComplete="current-password" /></label>
          <button type="submit" disabled={submitting}>{submitting ? "Signing in…" : "Sign in"}<span aria-hidden="true">↗</span></button>
        </form>
        <button className="text-button reset-button" type="button" onClick={resetPassword}>Forgot your password?</button>
        <div className="auth-divider"><span>or</span></div>
        <button className="google-button" type="button" disabled={submitting} onClick={googleSignIn}><span className="google-mark" aria-hidden="true">G</span> Continue with Google</button>
        <div className="form-feedback" aria-live="polite">
          {error && <p className="error-message">{error}</p>}
          {message && <p className="success-message">{message}</p>}
        </div>
        <p className="signup-privacy">New here? <Link href="/signup">Create an artist account.</Link></p>
      </div>
    </section>
  );
}
