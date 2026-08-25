import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { artistProfiles } from "@/db/schema";

export async function getArtistProfile(email: string) {
  try {
    const db = getDb();
    const [profile] = await db
      .select()
      .from(artistProfiles)
      .where(eq(artistProfiles.email, email))
      .limit(1);
    return profile ?? null;
  } catch {
    return null;
  }
}
