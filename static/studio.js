import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import { auth, db, firebaseErrorMessage, prepareAuth } from "./firebase.js";
import { escapeHtml, feedback, formatCad, path, slugify } from "./common.js";

const root = document.querySelector("#studio-root");
let activeUser;
let activeProfile;
let works = [];

function intro({ eyebrow, title, body, action, href, secondary = "", error = "" }) {
  root.innerHTML = `
    <section class="studio-intro">
      <p class="eyebrow">${escapeHtml(eyebrow)}</p>
      <h1>${title}</h1>
      <p>${escapeHtml(body)}</p>
      <a class="studio-signin" href="${href}">${escapeHtml(action)} <span aria-hidden="true">↗</span></a>
      ${secondary}
      ${error ? `<p class="error-message">${escapeHtml(error)}</p>` : ""}
    </section>`;
}

function timestampMillis(value) {
  return value?.toMillis?.() || 0;
}

async function loadMine() {
  const snapshot = await getDocs(query(collection(db, "artworks"), where("ownerUid", "==", activeUser.uid)));
  works = snapshot.docs
    .map((document) => ({ id: document.id, ...document.data() }))
    .sort((a, b) => timestampMillis(b.createdAt) - timestampMillis(a.createdAt));
  renderWorkList();
}

function renderWorkList() {
  const list = document.querySelector("#studio-list");
  const count = document.querySelector("#work-count");
  count.textContent = String(works.length).padStart(2, "0");
  list.replaceChildren();
  if (!works.length) {
    const empty = document.createElement("p");
    empty.className = "studio-empty";
    empty.textContent = "Your first published work will appear here.";
    list.append(empty);
    return;
  }
  for (const work of works) {
    const article = document.createElement("article");
    const image = document.createElement("img");
    image.src = work.imageDataUrl;
    image.alt = "";
    const copy = document.createElement("div");
    const title = document.createElement("h3");
    const link = document.createElement("a");
    link.href = `${path("/artwork/")}?id=${encodeURIComponent(work.id)}`;
    link.textContent = work.title;
    title.append(link);
    const detail = document.createElement("p");
    detail.textContent = `${work.medium} · ${formatCad(work.priceCents)}`;
    copy.append(title, detail);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => removeWork(work));
    article.append(image, copy, remove);
    list.append(article);
  }
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Unable to read that image.")); };
    image.src = url;
  });
}

async function compressArtwork(file) {
  if (!file || !file.type.startsWith("image/")) throw new Error("Choose a JPEG, PNG, WebP, or GIF image.");
  if (file.size > 8 * 1024 * 1024) throw new Error("Choose an image smaller than 8 MB.");
  const image = await loadImage(file);
  let maximum = 1400;
  let quality = 0.8;
  let result = "";

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const scale = Math.min(1, maximum / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d", { alpha: false });
    context.fillStyle = "#f3f0e8";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    result = canvas.toDataURL("image/jpeg", quality);
    if (result.length < 420000) return result;
    if (quality > 0.56) quality -= 0.08;
    else maximum = Math.round(maximum * 0.8);
  }
  if (result.length >= 500000) throw new Error("This image could not be compressed enough. Try a smaller image.");
  return result;
}

async function publishWork(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector("button[type=submit]");
  const feedbackRoot = document.querySelector("#publish-feedback");
  const data = new FormData(form);
  button.disabled = true;
  button.firstChild.textContent = "Preparing image… ";
  feedback(feedbackRoot);
  try {
    const imageDataUrl = await compressArtwork(data.get("image"));
    button.firstChild.textContent = "Publishing… ";
    const title = String(data.get("title") || "").trim();
    const created = await addDoc(collection(db, "artworks"), {
      slug: `${slugify(title)}-${Date.now().toString(36)}`,
      title,
      artist: String(data.get("artist") || "").trim(),
      medium: String(data.get("medium") || "").trim(),
      year: Number(data.get("year")),
      dimensions: String(data.get("dimensions") || "").trim(),
      priceCents: Math.round(Number(data.get("price")) * 100),
      description: String(data.get("description") || "").trim(),
      imageDataUrl,
      ownerUid: activeUser.uid,
      ownerEmail: activeUser.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    works.unshift({
      id: created.id,
      title,
      medium: String(data.get("medium") || "").trim(),
      priceCents: Math.round(Number(data.get("price")) * 100),
      imageDataUrl,
      createdAt: { toMillis: () => Date.now() },
    });
    renderWorkList();
    form.reset();
    form.querySelector("input[name=artist]").value = activeProfile.displayName;
    form.querySelector("input[name=year]").value = new Date().getFullYear();
    feedback(feedbackRoot, { message: `“${title}” is now live in the collection.` });
  } catch (error) {
    feedback(feedbackRoot, { error: firebaseErrorMessage(error) });
  } finally {
    button.disabled = false;
    button.firstChild.textContent = "Publish artwork ";
  }
}

async function removeWork(work) {
  if (!confirm(`Remove “${work.title}” from the collection?`)) return;
  const feedbackRoot = document.querySelector("#publish-feedback");
  try {
    await deleteDoc(doc(db, "artworks", work.id));
    works = works.filter((item) => item.id !== work.id);
    renderWorkList();
    feedback(feedbackRoot, { message: `“${work.title}” was removed.` });
  } catch (error) {
    feedback(feedbackRoot, { error: firebaseErrorMessage(error) });
  }
}

function workspace() {
  const firstName = activeProfile.displayName.split(/\s+/)[0];
  root.innerHTML = `
    <div class="studio-workspace">
      <div class="studio-welcome">
        <p class="eyebrow">Artist studio</p><h1>Welcome,<br />${escapeHtml(firstName)}.</h1>
        <p>Add an original work to the live collection. You can remove your own listings at any time.</p>
      </div>
      <form class="publish-form" id="publish-form">
        <div class="form-heading"><span>New listing</span><strong>01</strong></div>
        <label>Artwork title<input name="title" required maxlength="120" /></label>
        <label>Artist name<input name="artist" required maxlength="100" value="${escapeHtml(activeProfile.displayName)}" /></label>
        <div class="form-pair">
          <label>Medium<input name="medium" required maxlength="100" placeholder="Oil on linen" /></label>
          <label>Year<input name="year" required type="number" min="1900" max="${new Date().getFullYear() + 1}" value="${new Date().getFullYear()}" /></label>
        </div>
        <div class="form-pair">
          <label>Dimensions<input name="dimensions" required maxlength="80" placeholder="76 × 61 cm" /></label>
          <label>Price (CAD)<input name="price" required type="number" min="1" max="1000000" step="0.01" /></label>
        </div>
        <label>Description<textarea name="description" required minlength="20" maxlength="1200" rows="5"></textarea></label>
        <label class="file-field">Artwork image<input name="image" required type="file" accept="image/jpeg,image/png,image/webp,image/gif" /><small>JPEG, PNG, WebP, or GIF · compressed securely before upload</small></label>
        <button type="submit">Publish artwork <span aria-hidden="true">↗</span></button>
        <div class="form-feedback" id="publish-feedback" aria-live="polite"></div>
      </form>
      <section class="studio-collection" aria-labelledby="your-work-title">
        <div class="form-heading"><h2 id="your-work-title">Your live work</h2><strong id="work-count">00</strong></div>
        <div class="studio-list" id="studio-list"><p class="studio-empty">Loading your studio…</p></div>
      </section>
    </div>
    <div class="studio-session"><span>${escapeHtml(activeUser.email)}</span><button id="sign-out" type="button">Sign out</button></div>`;
  document.querySelector("#publish-form").addEventListener("submit", publishWork);
  document.querySelector("#sign-out").addEventListener("click", async () => {
    await signOut(auth);
    location.assign(path("/"));
  });
  loadMine().catch((error) => feedback(document.querySelector("#publish-feedback"), { error: firebaseErrorMessage(error) }));
}

await prepareAuth();
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    return intro({
      eyebrow: "Artist studio",
      title: "Your work,<br />beautifully presented.",
      body: "Create an artist account with any email address or sign in with Google.",
      action: "Create artist profile",
      href: path("/signup/"),
      secondary: `<a class="text-link" href="${path("/login/")}">Already joined? Sign in</a>`,
    });
  }
  if (!user.emailVerified) {
    return intro({
      eyebrow: "Verify your email",
      title: "One secure<br />step remains.",
      body: `Verify ${user.email} before publishing artwork.`,
      action: "Finish verification",
      href: path("/signup/"),
    });
  }
  try {
    const profileSnapshot = await getDoc(doc(db, "artist_profiles", user.uid));
    if (!profileSnapshot.exists()) {
      return intro({
        eyebrow: "One quick step",
        title: "Complete your<br />artist profile.",
        body: "Tell collectors who you are before publishing your first work. It only takes a minute.",
        action: "Create artist profile",
        href: path("/signup/"),
      });
    }
    activeUser = user;
    activeProfile = profileSnapshot.data();
    workspace();
  } catch (error) {
    intro({
      eyebrow: "Artist studio",
      title: "We couldn't<br />open your studio.",
      body: "Your account is safe. Refresh the page to try again.",
      action: "Return home",
      href: path("/"),
      error: firebaseErrorMessage(error),
    });
  }
});
