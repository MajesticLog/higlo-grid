// Entry point: lobby, then join the field, keep the player list, wire up the controls.
import { db, ref, get, set, onValue, onDisconnect } from "./firebase.js";
import { SIZE, playersRef, myRef, myId } from "./session.js";
import { runLobby } from "./lobby.js";
import { syncGame, spawnSquare } from "./game.js";
import { state } from "./state.js";
import { render } from "./render.js";
import { pickSquare, movePick, inReach, choosing, maybeResolve } from "./rounds.js";
import { openCard } from "./card.js";
import { sendHeart } from "./hearts.js";

document.getElementById("link").textContent = location.href;

// The lobby first: pick an animal and a colour, hide a memory.
Object.assign(state.me, await runLobby());
document.getElementById("field").hidden = false;
Object.assign(state.me, spawnSquare(Object.values((await get(playersRef)).val() || {})));

// Every time the connection comes up (now, or after a network drop), write
// myself into the session and ask the server to remove me when I go.
onValue(ref(db, ".info/connected"), async (snap) => {
  if (snap.val() !== true) return;
  await onDisconnect(myRef).remove();
  await set(myRef, state.me);
  state.joined = true;
  syncGame(); // start a game if there isn't one, and hide my memory
});

onValue(playersRef, (snap) => {
  state.players = [];
  snap.forEach((child) => { state.players.push({ id: child.key, ...child.val() }); });
  render();
  maybeResolve(); // the last player we were waiting for may have left
});

// --- Controls ---
// Arrow keys: move my pick one square, within reach.
const MOVES = {
  ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
};

document.addEventListener("keydown", (e) => {
  const move = MOVES[e.key];
  if (!move) return;
  e.preventDefault(); // stop the arrows from scrolling the page
  movePick(...move);
});

// Tap or click a square within reach: that's my pick. Out of reach: a found
// memory opens again, and someone else's circle gets a heart. Pointer events cover mouse,
// finger and pen.
const grid = document.getElementById("grid");
const clamp = (n) => Math.max(0, Math.min(SIZE - 1, n));

grid.addEventListener("pointerdown", (e) => {
  if (!state.joined) return;
  const rect = grid.getBoundingClientRect();
  const x = clamp(Math.floor(((e.clientX - rect.left) / rect.width) * SIZE));
  const y = clamp(Math.floor(((e.clientY - rect.top) / rect.height) * SIZE));
  // A found memory, not something I'm picking: open it again.
  const memoryTile = [...grid.querySelectorAll(".tile.memory")]
    .find((el) => Number(el.style.gridColumn) === x + 1 && Number(el.style.gridRow) === y + 1);
  if (memoryTile && !(choosing() && inReach(x, y))) return openCard(memoryTile.dataset.memory);
  const circle = e.target.closest(".circle");
  if (circle && circle.dataset.id !== myId && !inReach(x, y)) return sendHeart(circle.dataset.id);
  pickSquare(x, y);
});
