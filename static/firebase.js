import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app-check.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgK69fUBOQ-XkA6j9qeuVpQ7K6OX-DNFY",
  authDomain: "curatedexpressions-b2d42.firebaseapp.com",
  projectId: "curatedexpressions-b2d42",
  storageBucket: "curatedexpressions-b2d42.appspot.com",
  messagingSenderId: "733207874420",
  appId: "1:733207874420:web:903425d7d051a1a51bfa21",
  measurementId: "G-H35TR96QF8",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider("6LexzZgtAAAAAAM-nIHBzHAICrb7AQY0gjZakP-o"),
  isTokenAutoRefreshEnabled: true,
});
export const auth = getAuth(app);
export const db = getFirestore(app);

let persistencePromise;

export function prepareAuth() {
  if (!persistencePromise) {
    persistencePromise = setPersistence(auth, browserLocalPersistence);
  }
  return persistencePromise;
}

export function firebaseErrorMessage(error) {
  const messages = {
    "auth/account-exists-with-different-credential": "That email already uses another sign-in method.",
    "auth/email-already-in-use": "An account already exists for that email.",
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/network-request-failed": "Check your connection and try again.",
    "auth/operation-not-allowed": "That sign-in method has not been enabled yet.",
    "auth/popup-blocked": "Allow the sign-in window, then try again.",
    "auth/popup-closed-by-user": "The sign-in window was closed before finishing.",
    "auth/too-many-requests": "Too many attempts. Wait a moment and try again.",
    "auth/unauthorized-domain": "This website has not been authorized in Firebase yet.",
    "auth/weak-password": "Use a stronger password with at least 12 characters.",
    "permission-denied": "This action is not permitted. Refresh the page and try again.",
  };
  return messages[error?.code] || error?.message || "Unable to continue. Please try again.";
}
