import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getDatabase, ref, push, set, update, get, remove, onValue, onChildAdded,
  onDisconnect, runTransaction,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const SIZE = 11;
const CENTRE = Math.floor(SIZE / 2);
const STEP_MS = 150; // walking speed when you tap a square
const PALETTE = [
  "#e4572e", "#2e86ab", "#f4c430", "#4caf50", "#9c27b0", "#ff8c42",
  "#17bebb", "#e91e63", "#795548", "#3f51b5", "#8bc34a", "#607d8b",
];
// Past the palette, spread hues by the golden angle so they stay distinct.
const colourFor = (i) => PALETTE[i] ?? `hsl(${Math.round(i * 137.5) % 360}, 65%, 50%)`;
// One animal per colour slot, so players can be told apart without seeing
// colour, and named aloud on a call ("the fox is getting warmer").
const ANIMALS = [
  "🐱", "🐶", "🐸", "🦊", "🐻", "🐰", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷",
  "🐵", "🐔", "🐧", "🐙", "🦉", "🐢", "🦄", "🐝", "🐳", "🦋", "🐌", "🦔",
];
const animalFor = (i) => ANIMALS[i % ANIMALS.length];

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
const sessionPath = `sessions/${sessionId}`;
const playersRef = ref(db, `${sessionPath}/players`);
const myRef = push(playersRef); // unique key generated locally, nothing written yet

// Where I am. Kept locally so a reconnect can write it back.
const me = { x: CENTRE, y: CENTRE, color: null, animal: null };
let myColourIndex = 0;

// Claim a colour slot with a transaction: the database accepts the write only
// if the slot is still empty (or already mine), so two players joining at the
// same moment can never get the same colour. Released when I disconnect.
async function claimColour(start) {
  for (let i = start; ; i++) {
    const slot = ref(db, `${sessionPath}/colors/${i}`);
    const result = await runTransaction(slot, (owner) =>
      owner === null || owner === myRef.key ? myRef.key : undefined // undefined = abort
    );
    if (result.committed) {
      await onDisconnect(slot).remove();
      return i;
    }
  }
}

// Free square closest to the centre, ring by ring, so nobody spawns on top of anyone.
function spawnSquare(players) {
  const taken = new Set(Object.values(players).map((p) => `${p.x},${p.y}`));
  for (let ring = 0; ring <= CENTRE; ring++) {
    const squares = [];
    for (let y = CENTRE - ring; y <= CENTRE + ring; y++) {
      for (let x = CENTRE - ring; x <= CENTRE + ring; x++) {
        if (Math.max(Math.abs(x - CENTRE), Math.abs(y - CENTRE)) === ring) squares.push({ x, y });
      }
    }
    // Within a ring, prefer straight neighbours over diagonal ones.
    squares.sort((a, b) =>
      Math.abs(a.x - CENTRE) + Math.abs(a.y - CENTRE) - Math.abs(b.x - CENTRE) - Math.abs(b.y - CENTRE));
    const free = squares.find((s) => !taken.has(`${s.x},${s.y}`));
    if (free) return free;
  }
  return { x: CENTRE, y: CENTRE }; // grid full: share the centre
}

// Every time the connection comes up (first load or after a network drop),
// write myself into the session and ask the server to remove me when I go.
let joined = false;
onValue(ref(db, ".info/connected"), async (snap) => {
  if (snap.val() !== true) return;
  myColourIndex = await claimColour(myColourIndex);
  me.color = colourFor(myColourIndex);
  me.animal = animalFor(myColourIndex);
  if (!joined) {
    Object.assign(me, spawnSquare((await get(playersRef)).val() || {}));
    joined = true;
  }
  await onDisconnect(myRef).remove();
  await set(myRef, me);
});

// --- Drawing: the database is the source of truth ---
const grid = document.getElementById("grid");
let players = []; // latest snapshot, kept so hearts can trigger a redraw
const hearts = new Map(); // playerId -> time the heart started showing

onValue(playersRef, (snap) => {
  players = [];
  snap.forEach((child) => { players.push({ id: child.key, ...child.val() }); });
  render();
});

function render() {
  // Group players by square; several on one square are drawn side by side.
  const squares = new Map();
  for (const p of players) {
    const key = `${p.x},${p.y}`;
    if (!squares.has(key)) squares.set(key, []);
    squares.get(key).push(p);
  }

  grid.replaceChildren();
  for (const group of squares.values()) {
    const square = document.createElement("div");
    square.className = "square";
    square.style.gridColumn = group[0].x + 1; // CSS grid lines start at 1
    square.style.gridRow = group[0].y + 1;
    square.style.setProperty("--cols", Math.ceil(Math.sqrt(group.length)));
    for (const p of group) {
      const el = document.createElement("div");
      el.className = "circle" + (p.id === myRef.key ? " me" : "");
      el.style.background = p.color;
      el.dataset.id = p.id;
      const animal = document.createElement("span");
      animal.className = "animal";
      animal.textContent = p.animal ?? "";
      el.append(animal);
      if (hearts.has(p.id)) el.append(heartElement(hearts.get(p.id)));
      square.append(el);
    }
    grid.append(square);
  }
}

// --- Hearts: tap someone else's circle to send them one ---
const HEART_MS = 1400; // must match the heart animation in style.css
const heartsRef = ref(db, `${sessionPath}/hearts`);

function heartElement(startedAt) {
  const el = document.createElement("span");
  el.className = "heart";
  el.textContent = "❤️";
  // Redraws rebuild the circles; a negative delay resumes the animation
  // where it was instead of restarting it.
  el.style.animationDelay = `${startedAt - performance.now()}ms`;
  return el;
}

function sendHeart(to) {
  const heartRef = push(heartsRef, { to, from: myRef.key });
  // The sender cleans up, so hearts don't pile up in the database.
  onDisconnect(heartRef).remove();
  setTimeout(() => remove(heartRef), HEART_MS);
}

onChildAdded(heartsRef, (snap) => {
  const { to } = snap.val();
  const startedAt = performance.now();
  hearts.set(to, startedAt);
  render();
  setTimeout(() => {
    if (hearts.get(to) !== startedAt) return; // a newer heart took over
    hearts.delete(to);
    render();
  }, HEART_MS);
});

// --- Moving ---
const clamp = (n) => Math.max(0, Math.min(SIZE - 1, n));

function moveTo(x, y) {
  x = clamp(x);
  y = clamp(y);
  if (x === me.x && y === me.y) return; // against an edge: nothing to send
  me.x = x;
  me.y = y;
  update(myRef, { x, y });
}

// Arrow keys: one square at a time.
const MOVES = {
  ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
};

document.addEventListener("keydown", (e) => {
  const move = MOVES[e.key];
  if (!move) return;
  e.preventDefault(); // stop the arrows from scrolling the page
  if (!joined) return;
  stopWalking();
  moveTo(me.x + move[0], me.y + move[1]);
});

// Tap or click a square: walk there one square at a time, so others see the path.
// Pointer events cover mouse, finger and pen with one listener.
let walkTarget = null;
let walkTimer = null;

function stopWalking() {
  clearInterval(walkTimer);
  walkTimer = null;
  walkTarget = null;
}

function step() {
  const dx = walkTarget.x - me.x;
  const dy = walkTarget.y - me.y;
  if (dx === 0 && dy === 0) return stopWalking();
  // Step along the axis with the most distance left: a natural staircase path.
  if (Math.abs(dx) >= Math.abs(dy)) moveTo(me.x + Math.sign(dx), me.y);
  else moveTo(me.x, me.y + Math.sign(dy));
}

grid.addEventListener("pointerdown", (e) => {
  if (!joined) return;
  // On someone else's circle: send a heart instead of walking.
  const target = e.target.closest(".circle");
  if (target && target.dataset.id !== myRef.key) return sendHeart(target.dataset.id);
  const rect = grid.getBoundingClientRect();
  walkTarget = {
    x: clamp(Math.floor(((e.clientX - rect.left) / rect.width) * SIZE)),
    y: clamp(Math.floor(((e.clientY - rect.top) / rect.height) * SIZE)),
  };
  if (!walkTimer) {
    step();
    if (walkTarget) walkTimer = setInterval(step, STEP_MS);
  }
});
