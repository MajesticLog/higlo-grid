// Drawing: everything on screen comes from `state`.
import { myId } from "./session.js";
import { state } from "./state.js";

const FLOAT_MS = 1400; // must match the float animation in style.css

const grid = document.getElementById("grid");
// Test aid: add ?peek to the link to see what's hidden under the grass.
const peek = new URLSearchParams(location.search).has("peek");

export function render() {
  grid.replaceChildren();
  drawTiles();
  drawPlayers();
}

// Squares are keyed "x_y" in the database.
const squareOf = (k) => k.split("_").map(Number);

// Turned-over squares, drawn under the players. The grass is the grid's own
// background, so squares still covered need no element at all.
function drawTiles() {
  const game = state.game;
  if (!game) return;
  for (const [k, tile] of Object.entries(game.revealed ?? {})) {
    const el = document.createElement("div");
    el.className = `tile ${tile.show}`;
    place(el, ...squareOf(k));
    el.append(iconSpan(tile.icon));
    grid.append(el);
  }
  if (!peek) return;
  for (const [k, hidden] of Object.entries(game.board ?? {})) {
    if (game.revealed?.[k]) continue;
    const el = document.createElement("div");
    el.className = "peek";
    place(el, ...squareOf(k));
    el.append(iconSpan(hidden.kind === "trap" ? "🪤" : "📜"));
    grid.append(el);
  }
}

function iconSpan(icon) {
  const el = document.createElement("span");
  el.className = "icon";
  el.textContent = icon ?? "";
  return el;
}

function place(el, x, y) {
  el.style.gridColumn = x + 1; // CSS grid lines start at 1
  el.style.gridRow = y + 1;
}

function animalSpan(animal) {
  const el = document.createElement("span");
  el.className = "animal";
  el.textContent = animal ?? "";
  return el;
}

// Group players by square; several on one square are drawn side by side.
function drawPlayers() {
  const squares = new Map();
  for (const p of state.players) {
    const key = `${p.x},${p.y}`;
    if (!squares.has(key)) squares.set(key, []);
    squares.get(key).push(p);
  }

  for (const group of squares.values()) {
    const square = document.createElement("div");
    square.className = "square";
    place(square, group[0].x, group[0].y);
    square.style.setProperty("--cols", Math.ceil(Math.sqrt(group.length)));
    for (const p of group) {
      const el = document.createElement("div");
      el.className = "circle" + (p.id === myId ? " me" : "");
      el.style.background = p.color;
      el.dataset.id = p.id;
      if (p.name) el.title = p.name; // on hover, for mouse users
      el.append(animalSpan(p.animal));
      if (state.floats.has(p.id)) el.append(floatElement(state.floats.get(p.id)));
      square.append(el);
    }
    grid.append(square);
  }
}

// A big icon (❤️) floating above a player for a moment; everyone sees it.
export function showFloat(playerId, icon) {
  const startedAt = performance.now();
  state.floats.set(playerId, { icon, startedAt });
  render();
  setTimeout(() => {
    if (state.floats.get(playerId)?.startedAt !== startedAt) return; // a newer one took over
    state.floats.delete(playerId);
    render();
  }, FLOAT_MS);
}

function floatElement({ icon, startedAt }) {
  const el = document.createElement("span");
  el.className = "float";
  el.textContent = icon;
  // Redraws rebuild the circles; a negative delay resumes the animation
  // where it was instead of restarting it.
  el.style.animationDelay = `${startedAt - performance.now()}ms`;
  return el;
}
