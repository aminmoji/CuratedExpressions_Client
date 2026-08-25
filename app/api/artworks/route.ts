import { env } from "cloudflare:workers";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { artworks } from "@/db/schema";
import { getFirebaseUser } from "@/lib/firebase-auth-server";
import { getArtistProfile } from "@/lib/get-artist-profile";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function presentArtwork(row: typeof artworks.$inferSelect) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    artist: row.artist,
    medium: row.medium,
    year: row.year,
    dimensions: row.dimensions,
    priceCents: row.priceCents,
    description: row.description,
    image: row.imageKey
      ? `/media/${encodeURIComponent(row.imageKey)}`
      : row.imageUrl,
    createdAt: row.createdAt,
  };
}

function field(form: FormData, name: string, maxLength: number) {
  const value = form.get(name);
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function makeSlug(title: string) {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 56) || "untitled";
  return `${base}-${crypto.randomUUID().slice(0, 6)}`;
}

function safeFileName(name: string) {
  const extension = name.toLowerCase().match(/\.(jpe?g|png|webp|gif)$/)?.[0] ?? "";
  return `${crypto.randomUUID()}${extension}`;
}

export async function GET(request: Request) {
  try {
    const db = getDb();
    const mine = new URL(request.url).searchParams.get("mine") === "1";

    if (mine) {
      const user = await getFirebaseUser(request);
      if (!user) {
        return Response.json({ error: "Sign in to view your studio." }, { status: 401 });
      }
      if (!user.emailVerified) {
        return Response.json({ error: "Verify your email to view your studio." }, { status: 403 });
      }

      const rows = await db
        .select()
        .from(artworks)
        .where(eq(artworks.ownerEmail, user.email))
        .orderBy(desc(artworks.createdAt), desc(artworks.id));
      return Response.json({ artworks: rows.map(presentArtwork) });
    }

    const rows = await db
      .select()
      .from(artworks)
      .orderBy(desc(artworks.createdAt), desc(artworks.id));
    return Response.json({ artworks: rows.map(presentArtwork) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load artwork.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getFirebaseUser(request);
  if (!user) {
    return Response.json({ error: "Sign in to publish artwork." }, { status: 401 });
  }
  if (!user.emailVerified) {
    return Response.json({ error: "Verify your email before publishing artwork." }, { status: 403 });
  }

  const profile = await getArtistProfile(user.email);
  if (!profile) {
    return Response.json(
      { error: "Create your artist profile before publishing artwork." },
      { status: 403 },
    );
  }

  try {
    const form = await request.formData();
    const title = field(form, "title", 120);
    const artist = field(form, "artist", 100) || profile.displayName;
    const medium = field(form, "medium", 100);
    const dimensions = field(form, "dimensions", 80);
    const description = field(form, "description", 1200);
    const year = Number.parseInt(field(form, "year", 4), 10);
    const price = Number.parseFloat(field(form, "price", 12));
    const image = form.get("image");

    if (!title || !artist || !medium || !dimensions || !description) {
      return Response.json({ error: "Complete every artwork detail." }, { status: 400 });
    }
    if (!Number.isInteger(year) || year < 1900 || year > new Date().getFullYear() + 1) {
      return Response.json({ error: "Enter a valid artwork year." }, { status: 400 });
    }
    if (!Number.isFinite(price) || price <= 0 || price > 1_000_000) {
      return Response.json({ error: "Enter a valid price in CAD." }, { status: 400 });
    }
    if (!(image instanceof File) || image.size === 0) {
      return Response.json({ error: "Choose an artwork image." }, { status: 400 });
    }
    if (!ALLOWED_IMAGE_TYPES.has(image.type)) {
      return Response.json({ error: "Use a JPEG, PNG, WebP, or GIF image." }, { status: 415 });
    }
    if (image.size > MAX_IMAGE_BYTES) {
      return Response.json({ error: "Images must be smaller than 8 MB." }, { status: 413 });
    }
    if (!env.BUCKET) {
      throw new Error("Image storage is unavailable.");
    }

    const imageKey = `artwork-${safeFileName(image.name)}`;
    await env.BUCKET.put(imageKey, image.stream(), {
      httpMetadata: { contentType: image.type },
      customMetadata: { owner: user.email },
    });

    try {
      const db = getDb();
      const [created] = await db
        .insert(artworks)
        .values({
          slug: makeSlug(title),
          title,
          artist,
          medium,
          year,
          dimensions,
          priceCents: Math.round(price * 100),
          description,
          imageKey,
          ownerEmail: user.email,
        })
        .returning();

      return Response.json({ artwork: presentArtwork(created) }, { status: 201 });
    } catch (error) {
      await env.BUCKET.delete(imageKey);
      throw error;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to publish artwork.";
    return Response.json({ error: message }, { status: 500 });
  }
}
