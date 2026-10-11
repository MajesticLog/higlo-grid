// Hearts: tap someone else's circle to send them one; everyone sees it.
import { sessionRef, myId } from "./session.js";
import { push, remove, onDisconnect, onChildAdded } from "./firebase.js";
import { showFloat } from "./render.js";

const HEART_TTL_MS = 1400; // how long the heart stays in the database
const heartsRef = sessionRef("hearts");

export function sendHeart(to) {
  const heartRef = push(heartsRef, { to, from: myId });
  // The sender cleans up, so hearts don't pile up in the database.
  onDisconnect(heartRef).remove();
  setTimeout(() => remove(heartRef), HEART_TTL_MS);
}

onChildAdded(heartsRef, (snap) => showFloat(snap.val().to, "❤️"));
