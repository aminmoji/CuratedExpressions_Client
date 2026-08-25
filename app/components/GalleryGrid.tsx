"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Artwork } from "@/lib/artworks";

type LiveArtwork = {
  id: number;
  slug: string;
  title: string;
  artist: string;
  medium: string;
  priceCents: number;
  image: string | null;
};

function formatCad(cents: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export default function GalleryGrid({ initialWorks }: { initialWorks: Artwork[] }) {
  const [liveWorks, setLiveWorks] = useState<LiveArtwork[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/artworks")
      .then(async (response) => {
        if (!response.ok) throw new Error("Collection unavailable");
        return response.json() as Promise<{ artworks: LiveArtwork[] }>;
      })
      .then((data) => {
        if (active) setLiveWorks(data.artworks);
      })
      .catch(() => {
        // The curated edit remains visible if the live collection is unavailable.
      });
    return () => {
      active = false;
    };
  }, []);

  const works = useMemo(
    () => [
      ...liveWorks.map((work) => ({
        ...work,
        price: formatCad(work.priceCents),
        image: work.image ?? initialWorks[0].image,
      })),
      ...initialWorks.filter(
        (work) => !liveWorks.some((live) => live.slug === work.slug),
      ),
    ],
    [initialWorks, liveWorks],
  );

  return (
    <div className="art-grid">
      {works.map((work, index) => (
        <article className="art-card" key={work.slug}>
          <Link href={`/artwork/${work.slug}`} className="art-image-link">
            <span className="art-number">{String(index + 1).padStart(2, "0")}</span>
            <img src={work.image} alt={`${work.title} by ${work.artist}`} />
          </Link>
          <div className="art-meta">
            <div>
              <h3>
                <Link href={`/artwork/${work.slug}`}>{work.title}</Link>
              </h3>
              <p>{work.artist} · {work.medium}</p>
            </div>
            <strong>{work.price.replace("CA", "")} CAD</strong>
          </div>
        </article>
      ))}
    </div>
  );
}
