import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import { db } from "./firebase.js";
import { featuredWorks, formatCad, path } from "./common.js";

const grid = document.querySelector("#art-grid");

function artworkCard(work, index) {
  const article = document.createElement("article");
  article.className = "art-card";

  const link = document.createElement("a");
  link.className = "art-image-link";
  link.href = work.id
    ? `${path("/artwork/")}?id=${encodeURIComponent(work.id)}`
    : `${path("/artwork/")}?slug=${encodeURIComponent(work.slug)}`;

  const number = document.createElement("span");
  number.className = "art-number";
  number.textContent = String(index + 1).padStart(2, "0");

  const image = document.createElement("img");
  image.src = work.imageDataUrl || work.image;
  image.alt = `${work.title} by ${work.artist}`;
  image.loading = index > 1 ? "lazy" : "eager";

  link.append(number, image);

  const meta = document.createElement("div");
  meta.className = "art-meta";
  const copy = document.createElement("div");
  const title = document.createElement("h3");
  const titleLink = document.createElement("a");
  titleLink.href = link.href;
  titleLink.textContent = work.title;
  title.append(titleLink);
  const details = document.createElement("p");
  details.textContent = `${work.artist} · ${work.medium}`;
  copy.append(title, details);
  const price = document.createElement("strong");
  price.textContent = `${formatCad(work.priceCents).replace("CA", "")} CAD`;
  meta.append(copy, price);
  article.append(link, meta);
  return article;
}

function render(works) {
  if (!grid) return;
  grid.replaceChildren(...works.map(artworkCard));
}

render(featuredWorks);

try {
  const snapshot = await getDocs(query(collection(db, "artworks"), orderBy("createdAt", "desc"), limit(12)));
  const live = snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));
  const liveSlugs = new Set(live.map((work) => work.slug));
  render([...live, ...featuredWorks.filter((work) => !liveSlugs.has(work.slug))]);
} catch {
  // The editorial selection stays visible if live listings cannot be loaded.
}
