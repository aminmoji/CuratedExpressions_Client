"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { firebaseErrorMessage, getFirebaseAuth } from "@/lib/firebase-client";

type ArtistProfile = {
  displayName: string;
  location: string;
  website: string;
  instagram: string;
  bio: string;
};

export default function SignupForm() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let active = true;

    getFirebaseAuth()
      .then((auth) => {
        if (!active) return;
        unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
          if (!active) return;
          setUser(nextUser);
          setProfile(null);
          if (!nextUser?.emailVerified) return;

          setLoadingProfile(true);
          try {
            const token = await nextUser.getIdToken();
            const response = await fetch("/api/profile", {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = (await response.json()) as {
              profile?: ArtistProfile | null;
              error?: string;
            };
            if (!response.ok) throw new Error(data.error ?? "Unable to load your profile.");
            if (active) setProfile(data.profile ?? null);
          } catch (cause) {
            if (active) setError(firebaseErrorMessage(cause));
          } finally {
            if (active) setLoadingProfile(false);
          }
        });
      })
      .catch((cause) => {
        if (active) {
          setError(firebaseErrorMessage(cause));
          setUser(null);
        }
      });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  async function createAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("passwordConfirmation") ?? "");

    if (password.length < 8) {
      setError("Use a password with at least 8 characters.");
      setSubmitting(false);
      return;
    }
    if (password !== confirmation) {
      setError("The passwords do not match.");
      setSubmitting(false);
      return;
    }

    try {
      const auth = await getFirebaseAuth();
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(credential.user);
      setMessage(`We sent a verification link to ${credential.user.email}.`);
    } catch (cause) {
      setError(firebaseErrorMessage(cause));
    } finally {
      setSubmitting(false);
    }
  }

  async function continueWithGoogle() {
    setSubmitting(true);
    setError("");
    try {
      const auth = await getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
    } catch (cause) {
      setError(firebaseErrorMessage(cause));
    } finally {
      setSubmitting(false);
    }
  }

  async function checkVerification() {
    if (!user) return;
    setSubmitting(true);
    setError("");
    await user.reload();
    if (user.emailVerified) {
      window.location.reload();
    } else {
      setError("That email is not verified yet. Open the link in your inbox, then try again.");
      setSubmitting(false);
    }
  }

  async function resendVerification() {
    if (!user) return;
    setSubmitting(true);
    setError("");
    try {
      await sendEmailVerification(user);
      setMessage(`A new verification link was sent to ${user.email}.`);
    } catch (cause) {
      setError(firebaseErrorMessage(cause));
    } finally {
      setSubmitting(false);
    }
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: form.get("displayName"),
          location: form.get("location"),
          website: form.get("website"),
          instagram: form.get("instagram"),
          bio: form.get("bio"),
          acceptedTerms: form.get("acceptedTerms") === "yes",
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to create your artist profile.");
      }
      setComplete(true);
    } catch (cause) {
      setError(firebaseErrorMessage(cause));
    } finally {
      setSubmitting(false);
    }
  }

  if (user === undefined || loadingProfile) {
    return <section className="auth-loading" aria-live="polite">Preparing your secure sign-up…</section>;
  }

  if (complete) {
    return (
      <section className="signup-success" aria-live="polite">
        <span className="success-mark" aria-hidden="true">✓</span>
        <p className="eyebrow">Profile ready</p>
        <h1>You&apos;re in.</h1>
        <p>Your artist profile is saved. Open the Studio to publish your first original work.</p>
        <Link className="studio-signin" href="/studio">Open artist studio <span aria-hidden="true">↗</span></Link>
        <Link className="text-link" href="/">Return to the collection</Link>
      </section>
    );
  }

  if (user && !user.emailVerified) {
    return (
      <section className="signup-success" aria-live="polite">
        <span className="success-mark email-mark" aria-hidden="true">@</span>
        <p className="eyebrow">Verify your email</p>
        <h1>Check your inbox.</h1>
        <p>Use the verification link sent to <strong>{user.email}</strong>, then return here.</p>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        <button className="studio-signin auth-action" type="button" disabled={submitting} onClick={checkVerification}>
          {submitting ? "Checking…" : "I verified my email"}<span aria-hidden="true">↗</span>
        </button>
        <button className="text-button" type="button" onClick={resendVerification}>Resend verification email</button>
        <button className="text-button" type="button" onClick={async () => signOut(await getFirebaseAuth())}>Use a different email</button>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="signup-entry">
        <div className="signup-art-panel">
          <img src="https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1500&q=90" alt="Colourful abstract artwork with layered organic forms" />
          <p>Independent work deserves a considered setting.</p>
        </div>
        <div className="signup-copy">
          <p className="eyebrow">For independent artists</p>
          <h1>Show your work.<br />Keep your voice.</h1>
          <p className="signup-lead">Create a free artist profile with any email address, or continue with Google.</p>
          <form className="auth-form" onSubmit={createAccount}>
            <label>Email address<input name="email" type="email" required autoComplete="email" /></label>
            <label>Password<input name="password" type="password" required minLength={8} autoComplete="new-password" /></label>
            <label>Confirm password<input name="passwordConfirmation" type="password" required minLength={8} autoComplete="new-password" /></label>
            <button type="submit" disabled={submitting}>{submitting ? "Creating account…" : "Create account"}<span aria-hidden="true">↗</span></button>
          </form>
          <div className="auth-divider"><span>or</span></div>
          <button className="google-button" type="button" disabled={submitting} onClick={continueWithGoogle}>
            <span className="google-mark" aria-hidden="true">G</span> Continue with Google
          </button>
          <div className="form-feedback" aria-live="polite">
            {error && <p className="error-message">{error}</p>}
            {message && <p className="success-message">{message}</p>}
          </div>
          <p className="signup-privacy">Already joined? <Link href="/login">Sign in to your studio.</Link></p>
        </div>
      </section>
    );
  }

  return (
    <form className="signup-form" onSubmit={saveProfile}>
      <div className="signup-form-heading">
        <div><p className="eyebrow">Step 02 · Artist profile</p><h1>{profile ? "Update your profile." : "Introduce your work."}</h1></div>
        <p>This information helps collectors understand the person and practice behind the work.</p>
      </div>
      <label>Verified email<input value={user.email ?? ""} readOnly /><small>Verified securely through Firebase</small></label>
      <label>Artist or studio name<input name="displayName" required minLength={2} maxLength={100} defaultValue={profile?.displayName ?? user.displayName ?? ""} autoComplete="name" /></label>
      <div className="form-pair">
        <label>Location<input name="location" maxLength={100} defaultValue={profile?.location ?? ""} placeholder="Toronto, Canada" autoComplete="address-level2" /></label>
        <label>Website<input name="website" inputMode="url" maxLength={240} defaultValue={profile?.website ?? ""} placeholder="yourstudio.com" autoComplete="url" /></label>
      </div>
      <label>Instagram<div className="prefixed-input"><span aria-hidden="true">@</span><input name="instagram" maxLength={30} defaultValue={profile?.instagram ?? ""} placeholder="yourhandle" /></div></label>
      <label>Short artist bio<textarea name="bio" required minLength={20} maxLength={800} rows={6} defaultValue={profile?.bio ?? ""} placeholder="Tell collectors about your practice, materials, and point of view." /><small>20–800 characters</small></label>
      <label className="terms-check"><input name="acceptedTerms" type="checkbox" value="yes" required /><span>I confirm that I own or represent the work I publish and agree to provide accurate listing information.</span></label>
      <button type="submit" disabled={submitting}>{submitting ? "Saving profile…" : profile ? "Save profile" : "Create artist profile"}<span aria-hidden="true">↗</span></button>
      <div className="form-feedback" aria-live="polite">{error && <p className="error-message">{error}</p>}</div>
    </form>
  );
}
