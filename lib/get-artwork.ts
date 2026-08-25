import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { artworks } from "@/db/schema";
import { findArtwork, type Artwork } from "@/lib/artworks";

function formatCad(cents: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  })
    .format(cents / 100)
    .replace("CA", "");
}

export async function getArtwork(slug: string): Promise<Artwork | undefined> {
  try {
    const db = getDb();
    const [row] = await db.select().from(artworks).where(eq(artworks.slug, slug)).limit(1);
    if (row) {
      return {
        slug: row.slug,
        title: row.title,
        artist: row.artist,
        medium: row.medium,
        year: row.year,
        dimensions: row.dimensions,
        price: formatCad(row.priceCents),
        description: row.description,
        image: row.imageKey
          ? `/media/${encodeURIComponent(row.imageKey)}`
          : row.imageUrl ?? "",
      };
    }
  } catch {
    // Static curated works remain available while the database initializes.
  }
  return findArtwork(slug);
}
