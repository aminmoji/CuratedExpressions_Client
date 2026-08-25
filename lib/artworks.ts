export type Artwork = {
  slug: string;
  title: string;
  artist: string;
  medium: string;
  year: number;
  dimensions: string;
  price: string;
  description: string;
  image: string;
};

export const featuredWorks: Artwork[] = [
  {
    slug: "gathered-light",
    title: "Gathered Light",
    artist: "Mara Bell",
    medium: "Oil on linen",
    year: 2025,
    dimensions: "76 × 61 cm",
    price: "$1,250",
    description:
      "A quiet study of late-afternoon colour, built in translucent layers and finished with confident, gestural marks.",
    image:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1600&q=90",
  },
  {
    slug: "blue-hour-study",
    title: "Blue Hour Study",
    artist: "Nico Laurent",
    medium: "Acrylic on canvas",
    year: 2024,
    dimensions: "61 × 51 cm",
    price: "$860",
    description:
      "Broad fields of cobalt and mineral blue hold a flicker of warmth—a painting about the moment daylight slips away.",
    image:
      "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=1600&q=90",
  },
  {
    slug: "garden-after-rain",
    title: "Garden After Rain",
    artist: "Sofia Reyes",
    medium: "Gouache on paper",
    year: 2025,
    dimensions: "42 × 30 cm",
    price: "$540",
    description:
      "Loose botanical forms and saturated colour capture the lush, sharpened feeling of a garden after summer rain.",
    image:
      "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1600&q=90",
  },
  {
    slug: "still-moving",
    title: "Still, Moving",
    artist: "Ari Okafor",
    medium: "Mixed media",
    year: 2024,
    dimensions: "81 × 66 cm",
    price: "$980",
    description:
      "Layered paper, pigment, and graphite turn a simple interior rhythm into something tactile and gently unsettled.",
    image:
      "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&w=1600&q=90",
  },
];

export function findArtwork(slug: string) {
  return featuredWorks.find((work) => work.slug === slug);
}
