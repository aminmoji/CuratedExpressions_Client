"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { getFirebaseAuth } from "@/lib/firebase-client";

type StudioArtwork = {
  id: number;
  slug: string;
  title: string;
  artist: string;
  medium: string;
  priceCents: number;
  image: string | null;
};

export default function StudioManager({
  displayName,
}: {
  displayName: string;
}) {
  const [works, setWorks] = useState<StudioArtwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function bearerToken() {
    const auth = await getFirebaseAuth();
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error("Sign in to continue.");
    return token;
  }

  useEffect(() => {
    let active = true;
    bearerToken()
      .then((token) => fetch("/api/artworks?mine=1", {
        headers: { Authorization: `Bearer ${token}` },
      }))
      .then(async (response) => {
        const data = (await response.json()) as {
          artworks?: StudioArtwork[];
          error?: string;
        };
        if (!response.ok) throw new Error(data.error ?? "Unable to load your artwork.");
        return data.artworks ?? [];
      })
      .then((artworks) => {
        if (active) setWorks(artworks);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : "Unable to load your artwork.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");
    const form = event.currentTarget;

    try {
      const token = await bearerToken();
      const response = await fetch("/api/artworks", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: new FormData(form),
      });
      const data = (await response.json()) as {
        artwork?: StudioArtwork;
        error?: string;
      };
      if (!response.ok || !data.artwork) {
        throw new Error(data.error ?? "Unable to publish artwork.");
      }
      setWorks((current) => [data.artwork!, ...current]);
      setMessage(`“${data.artwork.title}” is now live in the collection.`);
      form.reset();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to publish artwork.");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(work: StudioArtwork) {
    if (!window.confirm(`Remove “${work.title}” from the collection?`)) return;
    setError("");
    setMessage("");
    try {
      const token = await bearerToken();
      const response = await fetch(`/api/artworks/${encodeURIComponent(work.slug)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Unable to remove artwork.");
      setWorks((current) => current.filter((item) => item.id !== work.id));
      setMessage(`“${work.title}” was removed.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to remove artwork.");
    }
  }

  return (
    <div className="studio-workspace">
      <div className="studio-welcome">
        <p className="eyebrow">Artist studio</p>
        <h1>Welcome,<br />{displayName.split(" ")[0]}.</h1>
        <p>
          Add an original work to the live collection. You can remove your own
          listings at any time.
        </p>
      </div>

      <form className="publish-form" onSubmit={publish}>
        <div className="form-heading">
          <span>New listing</span>
          <strong>01</strong>
        </div>
        <label>
          Artwork title
          <input name="title" required maxLength={120} />
        </label>
        <label>
          Artist name
          <input name="artist" required maxLength={100} defaultValue={displayName} />
        </label>
        <div className="form-pair">
          <label>
            Medium
            <input name="medium" required maxLength={100} placeholder="Oil on linen" />
          </label>
          <label>
            Year
            <input
              name="year"
              required
              type="number"
              min="1900"
              max={new Date().getFullYear() + 1}
              defaultValue={new Date().getFullYear()}
            />
          </label>
        </div>
        <div className="form-pair">
          <label>
            Dimensions
            <input name="dimensions" required maxLength={80} placeholder="76 × 61 cm" />
          </label>
          <label>
            Price (CAD)
            <input name="price" required type="number" min="1" max="1000000" step="0.01" />
          </label>
        </div>
        <label>
          Description
          <textarea name="description" required maxLength={1200} rows={5} />
        </label>
        <label className="file-field">
          Artwork image
          <input name="image" required type="file" accept="image/jpeg,image/png,image/webp,image/gif" />
          <small>JPEG, PNG, WebP, or GIF · 8 MB maximum</small>
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? "Publishing…" : "Publish artwork"}
          <span aria-hidden="true">↗</span>
        </button>
        <div className="form-feedback" aria-live="polite">
          {error && <p className="error-message">{error}</p>}
          {message && <p className="success-message">{message}</p>}
        </div>
      </form>

      <section className="studio-collection" aria-labelledby="your-work-title">
        <div className="form-heading">
          <h2 id="your-work-title">Your live work</h2>
          <strong>{String(works.length).padStart(2, "0")}</strong>
        </div>
        {loading ? (
          <p className="studio-empty">Loading your studio…</p>
        ) : works.length === 0 ? (
          <p className="studio-empty">Your first published work will appear here.</p>
        ) : (
          <div className="studio-list">
            {works.map((work) => (
              <article key={work.id}>
                {work.image ? <img src={work.image} alt="" /> : <span className="image-placeholder" />}
                <div>
                  <h3><Link href={`/artwork/${work.slug}`}>{work.title}</Link></h3>
                  <p>{work.medium} · {(work.priceCents / 100).toLocaleString("en-CA", { style: "currency", currency: "CAD" })}</p>
                </div>
                <button type="button" onClick={() => remove(work)}>Remove</button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
