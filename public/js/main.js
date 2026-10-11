// Entry point: lobby, then join the field, keep the player list, wire up the controls.
import { db, ref, get, set, onValue, onDisconnect } from "./firebase.js";
import { SIZE, CENTRE, playersRef, myRef, myId } from "./session.js";
import { runLobby } from "./lobby.js";
import { state } from "./state.js";
import { render } from "./render.js";
import { tryMove, walkTo, stopWalking } from "./moves.js";
import { sendHeart } from "./hearts.js";

document.getElementById("link").textContent = location.href;

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

// The lobby first: pick an animal and a colour, hide a memory.
Object.assign(state.me, await runLobby());
document.getElementById("field").hidden = false;
Object.assign(state.me, spawnSquare((await get(playersRef)).val() || {}));

// Every time the connection comes up (now, or after a network drop), write
// myself into the session and ask the server to remove me when I go.
onValue(ref(db, ".info/connected"), async (snap) => {
  if (snap.val() !== true) return;
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
