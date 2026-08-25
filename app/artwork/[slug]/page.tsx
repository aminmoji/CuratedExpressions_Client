import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { featuredWorks } from "@/lib/artworks";
import { getArtwork } from "@/lib/get-artwork";

export const dynamic = "force-dynamic";

type ArtworkPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return featuredWorks.map((work) => ({ slug: work.slug }));
}

export async function generateMetadata({
  params,
}: ArtworkPageProps): Promise<Metadata> {
  const { slug } = await params;
  const work = await getArtwork(slug);
  if (!work) return {};

  return {
    title: `${work.title} by ${work.artist} | Curated Expressions`,
    description: `${work.medium}, ${work.year}. ${work.description}`,
    openGraph: {
      title: `${work.title} by ${work.artist}`,
      description: work.description,
      images: [{ url: work.image, alt: `${work.title} by ${work.artist}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${work.title} by ${work.artist}`,
      description: work.description,
      images: [work.image],
    },
  };
}

export default async function ArtworkPage({ params }: ArtworkPageProps) {
  const { slug } = await params;
  const work = await getArtwork(slug);
  if (!work) notFound();

  return (
    <main className="detail-shell">
      <header className="site-header">
        <Link className="wordmark" href="/">
          Curated<span>Expressions</span>
        </Link>
        <nav aria-label="Artwork navigation">
          <Link href="/#collection">Back to collection</Link>
          <Link className="studio-link" href="/studio">
            Artist studio
          </Link>
        </nav>
      </header>

      <article className="artwork-detail">
        <div className="detail-image-wrap">
          <img src={work.image} alt={`${work.title} by ${work.artist}`} />
        </div>
        <div className="detail-copy">
          <p className="eyebrow">Original work · Available</p>
          <h1>{work.title}</h1>
          <p className="detail-artist">by {work.artist}</p>
          <p className="detail-description">{work.description}</p>
          <dl>
            <div><dt>Medium</dt><dd>{work.medium}</dd></div>
            <div><dt>Year</dt><dd>{work.year}</dd></div>
            <div><dt>Dimensions</dt><dd>{work.dimensions}</dd></div>
            <div><dt>Price</dt><dd>{work.price} CAD</dd></div>
          </dl>
          <a className="inquiry-button" href={`mailto:hello@curatedexpressions.ca?subject=${encodeURIComponent(`Inquiry about ${work.title}`)}`}>
            Inquire about this work <span aria-hidden="true">↗</span>
          </a>
          <p className="detail-note">Shipping is quoted separately based on destination.</p>
        </div>
      </article>
    </main>
  );
}
