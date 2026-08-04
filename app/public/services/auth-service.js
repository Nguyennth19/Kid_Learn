import { auth, authApi } from "./firebase.js";
import { accountDirectory } from "../firebase-config.js";

let persistenceReady;

export function prepareAuth() {
  persistenceReady ||= authApi.setPersistence(
    auth,
    authApi.browserSessionPersistence
  );
  return persistenceReady;
}

export function observeSession(callback) {
  return authApi.onAuthStateChanged(auth, callback);
}

export async function signInWithAccountCode(accountCode, pin) {
  await prepareAuth();
  const normalizedCode = String(accountCode || "").trim().toUpperCase();
  const email = accountDirectory[normalizedCode];

  if (!email) {
    const error = new Error("Mã tài khoản không tồn tại.");
    error.code = "kidlearn/account-code-not-found";
    throw error;
  }

  return authApi.signInWithEmailAndPassword(auth, email, pin);
}

export function signOutCurrentUser() {
  return authApi.signOut(auth);
}
