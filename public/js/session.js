// Which session this page is in, and who "I" am in it.
import { db, ref, push } from "./firebase.js";

export const SIZE = 7; // was 11, then 9: bigger squares, easier to tap (playtest feedback)
export const CENTRE = Math.floor(SIZE / 2);

// Read the session from the path, or start a new one.
function newSessionId() {
  // No look-alike characters (0/O, 1/l/I), so the link is easy to read aloud.
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  let id = "";
  for (let i = 0; i < 6; i++) id += alphabet[Math.floor(Math.random() * alphabet.length)];
  return id;
}

let id = location.pathname.slice(1).split("/")[0];
if (!/^[a-z0-9]{4,20}$/.test(id)) {
  id = newSessionId();
  history.replaceState(null, "", "/" + id);
}
export const sessionId = id;

// A reference to a path inside this session, e.g. sessionRef("players").
export const sessionRef = (path) => ref(db, `sessions/${sessionId}/${path}`);

export const playersRef = sessionRef("players");
export const myRef = push(playersRef); // unique key generated locally, nothing written yet
export const myId = myRef.key;
