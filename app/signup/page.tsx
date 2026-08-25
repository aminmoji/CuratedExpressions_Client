import type { Metadata } from "next";
import Link from "next/link";
import SignupForm from "./SignupForm";

export const metadata: Metadata = {
  title: "Join as an Artist | Curated Expressions",
  description:
    "Create your Curated Expressions artist profile and publish original work.",
  alternates: { canonical: "/signup" },
};

export default function SignupPage() {
  return (
    <main className="signup-page">
      <header className="site-header">
        <Link className="wordmark" href="/">
          Curated<span>Expressions</span>
        </Link>
        <nav aria-label="Sign-up navigation">
          <Link href="/#collection">View collection</Link>
          <Link className="studio-link" href="/login">Sign in</Link>
        </nav>
      </header>
      <SignupForm />
    </main>
  );
}
