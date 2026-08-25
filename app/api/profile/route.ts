import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { artistProfiles } from "@/db/schema";
import { getFirebaseUser } from "@/lib/firebase-auth-server";
import { getArtistProfile } from "@/lib/get-artist-profile";

function value(input: unknown, maxLength: number) {
  return typeof input === "string" ? input.trim().slice(0, maxLength) : "";
}

function normalizeWebsite(input: string) {
  if (!input) return "";
  const candidate = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString().slice(0, 240);
  } catch {
    return null;
  }
}

function normalizeInstagram(input: string) {
  return input
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/\/$/, "")
    .trim()
    .slice(0, 30);
}

export async function GET(request: Request) {
  const user = await getFirebaseUser(request);
  if (!user) {
    return Response.json({ error: "Sign in to view your artist profile." }, { status: 401 });
  }
  if (!user.emailVerified) {
    return Response.json({ error: "Verify your email to view your artist profile." }, { status: 403 });
  }

  const profile = await getArtistProfile(user.email);
  return Response.json({ profile });
}

export async function PUT(request: Request) {
  const user = await getFirebaseUser(request);
  if (!user) {
    return Response.json({ error: "Sign in to create an artist profile." }, { status: 401 });
  }
  if (!user.emailVerified) {
    return Response.json({ error: "Verify your email before creating a profile." }, { status: 403 });
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const displayName = value(payload.displayName, 100);
    const location = value(payload.location, 100);
    const website = normalizeWebsite(value(payload.website, 240));
    const instagram = normalizeInstagram(value(payload.instagram, 120));
    const bio = value(payload.bio, 800);

    if (displayName.length < 2) {
      return Response.json({ error: "Enter your artist name." }, { status: 400 });
    }
    if (bio.length < 20) {
      return Response.json({ error: "Tell collectors a little more about your work." }, { status: 400 });
    }
    if (website === null) {
      return Response.json({ error: "Enter a valid website address." }, { status: 400 });
    }
    if (payload.acceptedTerms !== true) {
      return Response.json({ error: "Accept the artist terms to continue." }, { status: 400 });
    }

    const db = getDb();
    const [profile] = await db
      .insert(artistProfiles)
      .values({
        email: user.email,
        displayName,
        location,
        website,
        instagram,
        bio,
      })
      .onConflictDoUpdate({
        target: artistProfiles.email,
        set: {
          displayName,
          location,
          website,
          instagram,
          bio,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        },
      })
      .returning();

    return Response.json({ profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save your artist profile.";
    return Response.json({ error: message }, { status: 500 });
  }
}
