import {
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { auth, firebaseErrorMessage, prepareAuth } from "./firebase.js";
import { feedback, path } from "./common.js";

await prepareAuth();

const form = document.querySelector("#login-form");
const feedbackRoot = document.querySelector("#login-feedback");

function finish(user) {
  location.assign(user.emailVerified ? path("/studio/") : path("/signup/"));
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = form.querySelector("button");
  const data = new FormData(form);
  button.disabled = true;
  feedback(feedbackRoot);
  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      String(data.get("email") || "").trim(),
      String(data.get("password") || ""),
    );
    finish(credential.user);
  } catch (error) {
    feedback(feedbackRoot, { error: firebaseErrorMessage(error) });
    button.disabled = false;
  }
});

document.querySelector("#google-login").addEventListener("click", async (event) => {
  event.currentTarget.disabled = true;
  feedback(feedbackRoot);
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const credential = await signInWithPopup(auth, provider);
    finish(credential.user);
  } catch (error) {
    feedback(feedbackRoot, { error: firebaseErrorMessage(error) });
    event.currentTarget.disabled = false;
  }
});

document.querySelector("#reset-password").addEventListener("click", async () => {
  const email = String(new FormData(form).get("email") || "").trim();
  if (!email) return feedback(feedbackRoot, { error: "Enter your email address first." });
  try {
    await sendPasswordResetEmail(auth, email);
    feedback(feedbackRoot, { message: "Password reset email sent. Check your inbox." });
  } catch (error) {
    feedback(feedbackRoot, { error: firebaseErrorMessage(error) });
  }
});
