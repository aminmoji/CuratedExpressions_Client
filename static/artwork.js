import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import { db } from "./firebase.js";
import { escapeHtml, featuredWorks, formatCad, path } from "./common.js";

const root = document.querySelector("#artwork-root");
const params = new URLSearchParams(location.search);
let work;

try {
  if (params.get("id")) {
    const snapshot = await getDoc(doc(db, "artworks", params.get("id")));
    if (snapshot.exists()) work = { id: snapshot.id, ...snapshot.data() };
  } else if (params.get("slug")) {
    work = featuredWorks.find((item) => item.slug === params.get("slug"));
  }
} catch {
  work = null;
}

if (!work) {
  root.innerHTML = `
    <section class="studio-intro">
      <p class="eyebrow">Artwork unavailable</p>
      <h1>This work is<br />no longer listed.</h1>
      <p>Return to the current edit to discover other original work.</p>
      <a class="studio-signin" href="${path("/#collection")}">View collection <span aria-hidden="true">↗</span></a>
    </section>`;
} else {
  const image = work.imageDataUrl || work.image;
  document.title = `${work.title} by ${work.artist} | Curated Expressions`;
  document.querySelector('meta[name="description"]').content = `${work.medium}, ${work.year}. ${work.description}`;
  const subject = encodeURIComponent(`Inquiry about ${work.title}`);
  root.innerHTML = `
    <article class="artwork-detail">
      <div class="detail-image-wrap"><img src="${image}" alt="${escapeHtml(work.title)} by ${escapeHtml(work.artist)}" /></div>
      <div class="detail-copy">
        <p class="eyebrow">Original work · Available</p>
        <h1>${escapeHtml(work.title)}</h1>
        <p class="detail-artist">by ${escapeHtml(work.artist)}</p>
        <p class="detail-description">${escapeHtml(work.description)}</p>
        <dl>
          <div><dt>Medium</dt><dd>${escapeHtml(work.medium)}</dd></div>
          <div><dt>Year</dt><dd>${escapeHtml(work.year)}</dd></div>
          <div><dt>Dimensions</dt><dd>${escapeHtml(work.dimensions)}</dd></div>
          <div><dt>Price</dt><dd>${formatCad(work.priceCents)} CAD</dd></div>
        </dl>
        <a class="inquiry-button" href="mailto:hello@curatedexpressions.ca?subject=${subject}">Inquire about this work <span aria-hidden="true">↗</span></a>
        <p class="detail-note">Shipping is quoted separately based on destination.</p>
      </div>
    </article>`;
}
