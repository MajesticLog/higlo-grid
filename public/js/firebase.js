// The one place the Firebase SDK is loaded and its version pinned.
// Other modules import the database functions from here.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

export {
  ref, push, set, update, get, remove, onValue, onChildAdded, onDisconnect, runTransaction,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

export const db = getDatabase(initializeApp(firebaseConfig));
