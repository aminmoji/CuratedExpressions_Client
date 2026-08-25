import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Artist Sign In | Curated Expressions",
  description: "Sign in to manage your Curated Expressions artist studio.",
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return (
    <main className="signup-page">
      <header className="site-header">
        <Link className="wordmark" href="/">Curated<span>Expressions</span></Link>
        <nav aria-label="Sign-in navigation">
          <Link href="/#collection">View collection</Link>
          <Link className="studio-link" href="/signup">Join as an artist</Link>
        </nav>
      </header>
      <LoginForm />
    </main>
  );
}
