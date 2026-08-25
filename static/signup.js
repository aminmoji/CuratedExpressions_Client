import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import { auth, db, firebaseErrorMessage, prepareAuth } from "./firebase.js";
import { escapeHtml, feedback, path } from "./common.js";

const root = document.querySelector("#signup-root");
let currentProfile = null;

function entryView() {
  root.innerHTML = `
    <section class="signup-entry">
      <div class="signup-art-panel">
        <img src="https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1500&q=90" alt="Colourful abstract artwork with layered organic forms" />
        <p>Independent work deserves a considered setting.</p>
      </div>
      <div class="signup-copy">
        <p class="eyebrow">For independent artists</p>
        <h1>Show your work.<br />Keep your voice.</h1>
        <p class="signup-lead">Create a free artist profile with any email address, or continue with Google.</p>
        <form class="auth-form" id="create-account-form">
          <label>Email address<input name="email" type="email" required autocomplete="email" /></label>
          <label>Password<input name="password" type="password" required minlength="8" autocomplete="new-password" /></label>
          <label>Confirm password<input name="passwordConfirmation" type="password" required minlength="8" autocomplete="new-password" /></label>
          <button type="submit">Create account <span aria-hidden="true">↗</span></button>
        </form>
        <div class="auth-divider"><span>or</span></div>
        <button class="google-button" id="google-signup" type="button"><span class="google-mark" aria-hidden="true">G</span> Continue with Google</button>
        <div class="form-feedback" id="signup-feedback" aria-live="polite"></div>
        <p class="signup-privacy">Already joined? <a href="${path("/login/")}">Sign in to your studio.</a></p>
      </div>
    </section>`;

  const form = document.querySelector("#create-account-form");
  const feedbackRoot = document.querySelector("#signup-feedback");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector("button");
    const data = new FormData(form);
    const password = String(data.get("password") || "");
    const confirmation = String(data.get("passwordConfirmation") || "");
    if (password.length < 8) return feedback(feedbackRoot, { error: "Use a password with at least 8 characters." });
    if (password !== confirmation) return feedback(feedbackRoot, { error: "The passwords do not match." });
    button.disabled = true;
    button.firstChild.textContent = "Creating account… ";
    try {
      const credential = await createUserWithEmailAndPassword(auth, String(data.get("email") || "").trim(), password);
      await sendEmailVerification(credential.user);
    } catch (error) {
      feedback(feedbackRoot, { error: firebaseErrorMessage(error) });
      button.disabled = false;
      button.firstChild.textContent = "Create account ";
    }
  });

  document.querySelector("#google-signup").addEventListener("click", async (event) => {
    event.currentTarget.disabled = true;
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
    } catch (error) {
      feedback(feedbackRoot, { error: firebaseErrorMessage(error) });
      event.currentTarget.disabled = false;
    }
  });
}

function verificationView(user) {
  root.innerHTML = `
    <section class="signup-success" aria-live="polite">
      <span class="success-mark email-mark" aria-hidden="true">@</span>
      <p class="eyebrow">Verify your email</p>
      <h1>Check your inbox.</h1>
      <p>Use the verification link sent to <strong>${escapeHtml(user.email)}</strong>, then return here.</p>
      <div class="form-feedback" id="verify-feedback"></div>
      <button class="studio-signin auth-action" id="check-verification" type="button">I verified my email <span aria-hidden="true">↗</span></button>
      <button class="text-button" id="resend-verification" type="button">Resend verification email</button>
      <button class="text-button" id="different-email" type="button">Use a different email</button>
    </section>`;
  const feedbackRoot = document.querySelector("#verify-feedback");
  document.querySelector("#check-verification").addEventListener("click", async (event) => {
    event.currentTarget.disabled = true;
    await user.reload();
    if (user.emailVerified) location.reload();
    else {
      feedback(feedbackRoot, { error: "That email is not verified yet. Open the link in your inbox, then try again." });
      event.currentTarget.disabled = false;
    }
  });
  document.querySelector("#resend-verification").addEventListener("click", async () => {
    try {
      await sendEmailVerification(user);
      feedback(feedbackRoot, { message: `A new verification link was sent to ${user.email}.` });
    } catch (error) {
      feedback(feedbackRoot, { error: firebaseErrorMessage(error) });
    }
  });
  document.querySelector("#different-email").addEventListener("click", () => signOut(auth));
}

function profileView(user, profile) {
  currentProfile = profile;
  root.innerHTML = `
    <form class="signup-form" id="profile-form">
      <div class="signup-form-heading">
        <div><p class="eyebrow">Step 02 · Artist profile</p><h1>${profile ? "Update your profile." : "Introduce your work."}</h1></div>
        <p>This information helps collectors understand the person and practice behind the work.</p>
      </div>
      <label>Verified email<input value="${escapeHtml(user.email)}" readonly /><small>Verified securely through Firebase</small></label>
      <label>Artist or studio name<input name="displayName" required minlength="2" maxlength="100" value="${escapeHtml(profile?.displayName || user.displayName || "")}" autocomplete="name" /></label>
      <div class="form-pair">
        <label>Location<input name="location" maxlength="100" value="${escapeHtml(profile?.location || "")}" placeholder="Toronto, Canada" /></label>
        <label>Website<input name="website" inputmode="url" maxlength="240" value="${escapeHtml(profile?.website || "")}" placeholder="yourstudio.com" /></label>
      </div>
      <label>Instagram<div class="prefixed-input"><span aria-hidden="true">@</span><input name="instagram" maxlength="30" value="${escapeHtml(profile?.instagram || "")}" placeholder="yourhandle" /></div></label>
      <label>Short artist bio<textarea name="bio" required minlength="20" maxlength="800" rows="6" placeholder="Tell collectors about your practice, materials, and point of view.">${escapeHtml(profile?.bio || "")}</textarea><small>20–800 characters</small></label>
      <label class="terms-check"><input name="acceptedTerms" type="checkbox" value="yes" required /><span>I confirm that I own or represent the work I publish and agree to provide accurate listing information.</span></label>
      <button type="submit">${profile ? "Save profile" : "Create artist profile"} <span aria-hidden="true">↗</span></button>
      <div class="form-feedback" id="profile-feedback" aria-live="polite"></div>
    </form>`;

  const form = document.querySelector("#profile-form");
  const feedbackRoot = document.querySelector("#profile-feedback");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector("button[type=submit]");
    const data = new FormData(form);
    button.disabled = true;
    try {
      await setDoc(doc(db, "artist_profiles", user.uid), {
        email: user.email,
        displayName: String(data.get("displayName") || "").trim(),
        location: String(data.get("location") || "").trim(),
        website: String(data.get("website") || "").trim(),
        instagram: String(data.get("instagram") || "").trim().replace(/^@/, ""),
        bio: String(data.get("bio") || "").trim(),
        acceptedTerms: data.get("acceptedTerms") === "yes",
        updatedAt: serverTimestamp(),
        ...(currentProfile ? {} : { createdAt: serverTimestamp() }),
      }, { merge: true });
      root.innerHTML = `
        <section class="signup-success" aria-live="polite">
          <span class="success-mark" aria-hidden="true">✓</span>
          <p class="eyebrow">Profile ready</p><h1>You're in.</h1>
          <p>Your artist profile is saved. Open the Studio to publish your first original work.</p>
          <a class="studio-signin" href="${path("/studio/")}">Open artist studio <span aria-hidden="true">↗</span></a>
          <a class="text-link" href="${path("/")}">Return to the collection</a>
        </section>`;
    } catch (error) {
      feedback(feedbackRoot, { error: firebaseErrorMessage(error) });
      button.disabled = false;
    }
  });
}

await prepareAuth();
onAuthStateChanged(auth, async (user) => {
  if (!user) return entryView();
  if (!user.emailVerified) return verificationView(user);
  root.innerHTML = '<section class="auth-loading" aria-live="polite">Loading your artist profile…</section>';
  try {
    const snapshot = await getDoc(doc(db, "artist_profiles", user.uid));
    profileView(user, snapshot.exists() ? snapshot.data() : null);
  } catch (error) {
    root.innerHTML = `<section class="studio-intro"><p class="error-message">${escapeHtml(firebaseErrorMessage(error))}</p></section>`;
  }
});
