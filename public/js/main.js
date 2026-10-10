import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getDatabase, ref, push, set, update, get, onValue, onDisconnect,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const SIZE = 11;
const CENTRE = Math.floor(SIZE / 2);
const PALETTE = [
  "#e4572e", "#2e86ab", "#f4c430", "#4caf50", "#9c27b0", "#ff8c42",
  "#17bebb", "#e91e63", "#795548", "#3f51b5", "#8bc34a", "#607d8b",
];

// --- Session: read it from the path, or start a new one ---
function newSessionId() {
  // No look-alike characters (0/O, 1/l/I), so the link is easy to read aloud.
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  let id = "";
  for (let i = 0; i < 6; i++) id += alphabet[Math.floor(Math.random() * alphabet.length)];
  return id;
}

let sessionId = location.pathname.slice(1).split("/")[0];
if (!/^[a-z0-9]{4,20}$/.test(sessionId)) {
  sessionId = newSessionId();
  history.replaceState(null, "", "/" + sessionId);
}
document.getElementById("link").textContent = location.href;

// --- Firebase ---
const db = getDatabase(initializeApp(firebaseConfig));
const playersRef = ref(db, `sessions/${sessionId}/players`);
const myRef = push(playersRef); // unique key generated locally, nothing written yet

// Where I am. Kept locally so a reconnect can write it back.
const me = { x: CENTRE, y: CENTRE, color: null };

async function pickColour() {
  const snap = await get(playersRef);
  const used = new Set(Object.values(snap.val() || {}).map((p) => p.color));
  return PALETTE.find((c) => !used.has(c))
    ?? `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
}

// Every time the connection comes up (first load or after a network drop),
// write myself into the session and ask the server to remove me when I go.
onValue(ref(db, ".info/connected"), async (snap) => {
  if (snap.val() !== true) return;
  if (!me.color) me.color = await pickColour();
  await onDisconnect(myRef).remove();
  await set(myRef, me);
});

// --- Drawing: the database is the source of truth ---
const grid = document.getElementById("grid");

onValue(playersRef, (snap) => {
  grid.replaceChildren();
  snap.forEach((child) => {
    const p = child.val();
    const el = document.createElement("div");
    el.className = "circle" + (child.key === myRef.key ? " me" : "");
    el.style.background = p.color;
    el.style.gridColumn = p.x + 1; // CSS grid lines start at 1
    el.style.gridRow = p.y + 1;
    grid.append(el);
  });
});

// --- Arrow keys: one square at a time, clamped to the grid ---
const MOVES = {
  ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
};
const clamp = (n) => Math.max(0, Math.min(SIZE - 1, n));

document.addEventListener("keydown", (e) => {
  const move = MOVES[e.key];
  if (!move) return;
  e.preventDefault(); // stop the arrows from scrolling the page
  if (!me.color) return; // not joined yet
  const x = clamp(me.x + move[0]);
  const y = clamp(me.y + move[1]);
  if (x === me.x && y === me.y) return; // against an edge: nothing to send
  me.x = x;
  me.y = y;
  update(myRef, { x, y });
});
