import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { artworks } from "@/db/schema";
import { getFirebaseUser } from "@/lib/firebase-auth-server";

type RouteProps = { params: Promise<{ slug: string }> };

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

export async function GET(_: Request, { params }: RouteProps) {
  try {
    const { slug } = await params;
    const db = getDb();
    const [row] = await db.select().from(artworks).where(eq(artworks.slug, slug)).limit(1);
    if (!row) {
      return Response.json({ error: "Artwork not found." }, { status: 404 });
    }
    return Response.json({ artwork: presentArtwork(row) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load artwork.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  const user = await getFirebaseUser(request);
  if (!user) {
    return Response.json({ error: "Sign in to remove artwork." }, { status: 401 });
  }
  if (!user.emailVerified) {
    return Response.json({ error: "Verify your email before removing artwork." }, { status: 403 });
  }

  try {
    const { slug } = await params;
    const db = getDb();
    const [row] = await db.select().from(artworks).where(eq(artworks.slug, slug)).limit(1);
    if (!row) {
      return Response.json({ error: "Artwork not found." }, { status: 404 });
    }
    if (row.ownerEmail !== user.email) {
      return Response.json({ error: "You can only remove your own artwork." }, { status: 403 });
    }

    await db.delete(artworks).where(eq(artworks.id, row.id));
    if (row.imageKey && env.BUCKET) {
      await env.BUCKET.delete(row.imageKey);
    }
    return Response.json({ deleted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to remove artwork.";
    return Response.json({ error: message }, { status: 500 });
  }
}
