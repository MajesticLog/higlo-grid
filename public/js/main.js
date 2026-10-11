// Entry point: join the session, keep the player list, wire up the controls.
import { db, ref, get, set, onValue, onDisconnect, runTransaction } from "./firebase.js";
import { SIZE, CENTRE, sessionRef, playersRef, myRef, myId } from "./session.js";
import { state } from "./state.js";
import { render } from "./render.js";
import { tryMove, walkTo, stopWalking } from "./moves.js";
import { sendHeart } from "./hearts.js";

document.getElementById("link").textContent = location.href;

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

// Claim a colour slot with a transaction: the database accepts the write only
// if the slot is still empty (or already mine), so two players joining at the
// same moment can never get the same colour. Released when I disconnect.
let myColourIndex = 0;

async function claimColour(start) {
  for (let i = start; ; i++) {
    const slot = sessionRef(`colors/${i}`);
    const result = await runTransaction(slot, (owner) =>
      owner === null || owner === myId ? myId : undefined // undefined = abort
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
let spawned = false;
onValue(ref(db, ".info/connected"), async (snap) => {
  if (snap.val() !== true) return;
  myColourIndex = await claimColour(myColourIndex);
  state.me.color = colourFor(myColourIndex);
  state.me.animal = animalFor(myColourIndex);
  if (!spawned) {
    Object.assign(state.me, spawnSquare((await get(playersRef)).val() || {}));
    spawned = true;
  }
  await onDisconnect(myRef).remove();
  await set(myRef, state.me);
  state.joined = true;
});

onValue(playersRef, (snap) => {
  state.players = [];
  snap.forEach((child) => { state.players.push({ id: child.key, ...child.val() }); });
  render();
});

// --- Controls ---
// Arrow keys: one square per press.
const MOVES = {
  ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
};

document.addEventListener("keydown", (e) => {
  const move = MOVES[e.key];
  if (!move) return;
  e.preventDefault(); // stop the arrows from scrolling the page
  stopWalking();
  tryMove(...move);
});

// Tap or click: on someone else's circle, send a heart; anywhere else, walk
// to that square. Pointer events cover mouse, finger and pen.
const grid = document.getElementById("grid");
const clamp = (n) => Math.max(0, Math.min(SIZE - 1, n));

grid.addEventListener("pointerdown", (e) => {
  if (!state.joined) return;
  const target = e.target.closest(".circle");
  if (target && target.dataset.id !== myId) return sendHeart(target.dataset.id);
  const rect = grid.getBoundingClientRect();
  walkTo(
    clamp(Math.floor(((e.clientX - rect.left) / rect.width) * SIZE)),
    clamp(Math.floor(((e.clientY - rect.top) / rect.height) * SIZE)),
  );
});
