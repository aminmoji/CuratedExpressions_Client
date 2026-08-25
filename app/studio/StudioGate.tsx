"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { firebaseErrorMessage, getFirebaseAuth } from "@/lib/firebase-client";
import StudioManager from "./StudioManager";

type ArtistProfile = { displayName: string };

export default function StudioGate() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [profile, setProfile] = useState<ArtistProfile | null | undefined>(undefined);
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
          setProfile(undefined);
          if (!nextUser?.emailVerified) return;
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

  if (user === undefined || (user?.emailVerified && profile === undefined)) {
    return <section className="auth-loading" aria-live="polite">Opening your artist studio…</section>;
  }

  if (!user) {
    return (
      <section className="studio-intro">
        <p className="eyebrow">Artist studio</p>
        <h1>Your work,<br />beautifully presented.</h1>
        <p>Create an artist account with any email address or sign in with Google.</p>
        <Link className="studio-signin" href="/signup">Create artist profile <span aria-hidden="true">↗</span></Link>
        <Link className="text-link" href="/login">Already joined? Sign in</Link>
        {error && <p className="error-message">{error}</p>}
      </section>
    );
  }

  if (!user.emailVerified) {
    return (
      <section className="studio-intro">
        <p className="eyebrow">Verify your email</p>
        <h1>One secure<br />step remains.</h1>
        <p>Verify {user.email} before publishing artwork.</p>
        <Link className="studio-signin" href="/signup">Finish verification <span aria-hidden="true">↗</span></Link>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="studio-intro">
        <p className="eyebrow">One quick step</p>
        <h1>Complete your<br />artist profile.</h1>
        <p>Tell collectors who you are before publishing your first work. It only takes a minute.</p>
        <Link className="studio-signin" href="/signup">Create artist profile <span aria-hidden="true">↗</span></Link>
      </section>
    );
  }

  return (
    <>
      <StudioManager displayName={profile.displayName} />
      <div className="studio-session">
        <span>{user.email}</span>
        <button type="button" onClick={async () => { await signOut(await getFirebaseAuth()); window.location.assign("/"); }}>Sign out</button>
      </div>
    </>
  );
}
