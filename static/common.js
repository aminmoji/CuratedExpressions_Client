export const BASE = location.hostname.endsWith("github.io")
  ? "/CuratedExpressions_Client"
  : "";

export const featuredWorks = [
  {
    slug: "gathered-light",
    title: "Gathered Light",
    artist: "Mara Bell",
    medium: "Oil on linen",
    year: 2025,
    dimensions: "76 × 61 cm",
    priceCents: 125000,
    description: "A quiet study of late-afternoon colour, built in translucent layers and finished with confident, gestural marks.",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1600&q=90",
  },
  {
    slug: "blue-hour-study",
    title: "Blue Hour Study",
    artist: "Nico Laurent",
    medium: "Acrylic on canvas",
    year: 2024,
    dimensions: "61 × 51 cm",
    priceCents: 86000,
    description: "Broad fields of cobalt and mineral blue hold a flicker of warmth—a painting about the moment daylight slips away.",
    image: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=1600&q=90",
  },
  {
    slug: "garden-after-rain",
    title: "Garden After Rain",
    artist: "Sofia Reyes",
    medium: "Gouache on paper",
    year: 2025,
    dimensions: "42 × 30 cm",
    priceCents: 54000,
    description: "Loose botanical forms and saturated colour capture the lush, sharpened feeling of a garden after summer rain.",
    image: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1600&q=90",
  },
  {
    slug: "still-moving",
    title: "Still, Moving",
    artist: "Ari Okafor",
    medium: "Mixed media",
    year: 2024,
    dimensions: "81 × 66 cm",
    priceCents: 98000,
    description: "Layered paper, pigment, and graphite turn a simple interior rhythm into something tactile and gently unsettled.",
    image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&w=1600&q=90",
  },
];

export function path(route = "") {
  return `${BASE}${route}` || "/";
}

export function formatCad(cents) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: Number(cents) % 100 === 0 ? 0 : 2,
  }).format(Number(cents) / 100);
}

export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || `work-${Date.now()}`;
}

export function feedback(root, { error = "", message = "" } = {}) {
  if (!root) return;
  root.innerHTML = error
    ? `<p class="error-message">${escapeHtml(error)}</p>`
    : message
      ? `<p class="success-message">${escapeHtml(message)}</p>`
      : "";
}
