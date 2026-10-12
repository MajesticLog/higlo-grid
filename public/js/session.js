// Which session this page is in, and who "I" am in it.
import { db, ref, push } from "./firebase.js";

// The garden's size follows the family (docs/game-design.md): 6 x 6 for 1 to 3
// players, 7 x 7 for 4 or more (5 x 5 was too easy). fitGrid() in game.js sets it;
// every module reads SIZE live (an ES module export follows its variable).
export let SIZE = 7;
export const sizeFor = (players) => (players <= 3 ? 6 : 7);
export function setSize(size) { SIZE = size; }

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
