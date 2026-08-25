import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Curated Expressions",
  description:
    "A considered collection of original art from independent makers.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: "Curated Expressions",
    description: "Art worth living with.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Curated Expressions — Art worth living with.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Curated Expressions",
    description: "Art worth living with.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
