import Link from "next/link";
import GalleryGrid from "@/app/components/GalleryGrid";
import { featuredWorks } from "@/lib/artworks";

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <Link className="wordmark" href="/" aria-label="Curated Expressions home">
          Curated<span>Expressions</span>
        </Link>
        <nav aria-label="Primary navigation">
          <a href="#collection">Collection</a>
          <a href="#approach">Our approach</a>
          <Link href="/signup">Join as artist</Link>
          <Link className="studio-link" href="/studio">
            Artist studio
          </Link>
        </nav>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">Independent art · thoughtfully selected</p>
          <h1 id="hero-title">Original work.<br />Chosen slowly.</h1>
          <p className="hero-intro">
            A small, considered collection of original art from independent
            makers—selected for the spaces where life actually happens.
          </p>
          <a className="primary-action" href="#collection">
            Explore the collection <span aria-hidden="true">↘</span>
          </a>
        </div>
        <figure className="hero-art">
          <img
            src="https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=1600&q=90"
            alt="Expressive botanical painting in soft blues, green, and ochre"
          />
          <figcaption>
            <span>New this week</span>
            <span>01 / 05</span>
          </figcaption>
        </figure>
      </section>

      <section className="collection" id="collection" aria-labelledby="collection-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">The current edit</p>
            <h2 id="collection-title">Works with a point of view</h2>
          </div>
          <p>
            Limited runs and one-of-one pieces, presented with the details you
            need and none of the gallery pressure.
          </p>
        </div>

        <GalleryGrid initialWorks={featuredWorks} />
      </section>

      <section className="manifesto" id="approach" aria-labelledby="approach-title">
        <p className="eyebrow">Why Curated Expressions</p>
        <h2 id="approach-title">
          Art should feel personal before it feels important.
        </h2>
        <div className="manifesto-grid">
          <p>
            We focus on original work with presence: pieces that reward a
            second look and make a room feel unmistakably yours.
          </p>
          <p>
            Every listing connects you directly to the story, materials, and
            maker behind the work. No mystery. No velvet rope.
          </p>
        </div>
      </section>

      <section className="artist-invite" aria-labelledby="artist-invite-title">
        <div>
          <p className="eyebrow">For artists</p>
          <h2 id="artist-invite-title">A quieter place<br />to show your work.</h2>
        </div>
        <div>
          <p>
            Create a free profile and publish original work in a presentation
            built around the art—not an algorithm.
          </p>
          <Link className="studio-signin" href="/signup">
            Join Curated Expressions <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <footer>
        <Link className="wordmark" href="/">
          Curated<span>Expressions</span>
        </Link>
        <p>Art worth living with.</p>
        <p>© {new Date().getFullYear()} Curated Expressions</p>
      </footer>
    </main>
  );
}
