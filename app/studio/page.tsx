import type { Metadata } from "next";
import Link from "next/link";
import StudioGate from "./StudioGate";

export const metadata: Metadata = {
  title: "Artist Studio | Curated Expressions",
  description: "Publish and manage original artwork on Curated Expressions.",
  alternates: { canonical: "/studio" },
};

export default function StudioPage() {
  return (
    <main className="studio-page">
      <header className="site-header">
        <Link className="wordmark" href="/">Curated<span>Expressions</span></Link>
        <nav aria-label="Studio navigation"><Link href="/#collection">View collection</Link></nav>
      </header>
      <StudioGate />
    </main>
  );
}
