// Drawing: everything on screen comes from `state`.
import { myId } from "./session.js";
import { state } from "./state.js";
import { now, NIGHT_STEPS } from "./game.js";
import { REACH, READY_WAIT_MS, inReach, choosing } from "./rounds.js";
import { queueCard } from "./card.js";

const FLOAT_MS = 1400; // must match the float animation in style.css
const FLIP_MS = 600; // must match the flip animation in style.css
const POP_MS = 2200; // longest pop or insect animation in style.css, delay included
const FLYERS = ["🐞", "🦗"]; // the other insects walk away

const grid = document.getElementById("grid");
// Test aid: add ?peek to the link to see what's hidden under the grass.
const peek = new URLSearchParams(location.search).has("peek");

export function render() {
  grid.replaceChildren();
  drawTiles();
  drawReach();
  drawPicks();
  drawPlayers();
  drawPops();
  drawWolf();
  renderSky();
  renderStatus();
  renderTimer();
}

// Squares are keyed "x_y" in the database.
const squareOf = (k) => k.split("_").map(Number);

// Turned-over squares, drawn under the players. The grass is the grid's own
// background, so squares still covered need no element at all.
// Squares that turn over while I watch flip, and what was under them pops up
// above the players (see drawPops). The ones already turned over when I
// arrive don't. Redraws keep animations going with a negative delay.
const firstSeen = new Map(); // "gameId:x_y" -> when this device first drew it
let gameSeen = null;
let pops = []; // [{k, tile, age}] squares turned over in the last POP_MS

function drawTiles() {
  const game = state.game;
  pops = [];
  if (!game) return;
  const arriving = gameSeen !== game.id;
  gameSeen = game.id;
  for (const [k, tile] of Object.entries(game.revealed ?? {})) {
    const el = document.createElement("div");
    el.className = `tile ${tile.show}`;
    place(el, ...squareOf(k));
    if (tile.show !== "insect") el.append(iconSpan(tile.icon)); // insects leave
    if (tile.show === "memory") {
      el.style.setProperty("--c", state.memories[tile.memory]?.color ?? "#999"); // the author's colour
      el.dataset.memory = tile.memory; // tap it to read it again
    }
    const id = `${game.id}:${k}`;
    if (!firstSeen.has(id)) {
      firstSeen.set(id, arriving ? -Infinity : performance.now());
      if (!arriving && tile.show === "memory") queueCard(tile.memory);
    }
    const age = performance.now() - firstSeen.get(id);
    if (age < FLIP_MS) {
      el.classList.add("flip");
      el.style.animationDelay = `${-age}ms`;
    }
    if (age < POP_MS) pops.push({ k, tile, age });
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

// While I choose: a soft glow on the squares I can reach.
function drawReach() {
  if (!choosing() || state.game.picks?.[myId]?.ready) return;
  for (let dy = -REACH; dy <= REACH; dy++) {
    for (let dx = -REACH; dx <= REACH; dx++) {
      const x = state.me.x + dx;
      const y = state.me.y + dy;
      if ((dx === 0 && dy === 0) || !inReach(x, y)) continue;
      const el = document.createElement("div");
      el.className = "reach";
      place(el, x, y);
      grid.append(el);
    }
  }
}

// Picked squares. Mine shows in my colour with my animal; everyone else's
// is a plain dashed ring, so you can see where people are going, not who.
function drawPicks() {
  if (!choosing()) return;
  const picks = state.game.picks ?? {};
  const others = new Set();
  for (const [id, p] of Object.entries(picks)) {
    if (id !== myId) others.add(`${p.x}_${p.y}`);
  }
  for (const k of others) {
    const el = document.createElement("div");
    el.className = "pick";
    place(el, ...squareOf(k));
    grid.append(el);
  }
  const mine = picks[myId];
  if (mine) {
    const el = document.createElement("div");
    el.className = "pick mine" + (mine.ready ? " ready" : "");
    el.style.setProperty("--c", state.me.color);
    place(el, mine.x, mine.y);
    el.append(animalSpan(state.me.animal));
    grid.append(el);
  }
}

// What was under a square that just turned over, drawn above the players so
// nobody's circle hides it: a flower, memory or trap pops up and fades; an
// insect flies or walks off the square.
function drawPops() {
  for (const { k, tile, age } of pops) {
    const [x, y] = squareOf(k);
    const el = document.createElement("div");
    let kind = "pop";
    if (tile.show === "insect") kind = FLYERS.includes(tile.icon) ? "fly" : "walk";
    el.className = `pop ${kind}`;
    place(el, x, y);
    el.style.setProperty("--dir", (x + y) % 2 ? 1 : -1); // left or right, same on every device
    const icon = iconSpan(tile.icon);
    icon.style.animationDelay = `${-age}ms`;
    el.append(icon);
    grid.append(el);
  }
}

// Full night: the wolf comes out onto the field (nothing scary).
function drawWolf() {
  if (state.game?.status !== "lost") return;
  const el = document.createElement("div");
  el.className = "wolf";
  el.innerHTML = '<span class="wolf-icon">🐺</span><span class="howl">Ahouuu!</span>';
  grid.append(el);
}

// --- The sky: each trap brings the night one step closer ---
// Stars appear from dusk and twinkle; the sun goes down, the moon comes up.
const sky = document.getElementById("sky");
const skyIcon = document.getElementById("sky-icon"); // laptop: top-right corner
const stripIcon = document.getElementById("sky-strip-icon"); // phone: strip above the bar
const stars = [];
for (let i = 0; i < 45; i++) {
  const star = document.createElement("span");
  star.className = "star";
  star.textContent = i % 5 ? "·" : "✦";
  star.style.left = `${Math.random() * 100}%`;
  star.style.top = `${Math.random() * 100}%`;
  star.style.animationDelay = `-${(Math.random() * 3).toFixed(2)}s`;
  star.dataset.from = String(3 + (i % 4)); // more stars each step from 3 to 6
  sky.append(star);
  stars.push(star);
}
// For each night step 0..6: sun or moon, how high it is in the corner (%
// from the top), and how far along the phone strip (% from the left).
const SKY = [
  ["☀️", 6, 6], ["☀️", 14, 20], ["☀️", 24, 34], ["🌅", 34, 50],
  ["🌙", 22, 66], ["🌙", 12, 80], ["🌕", 6, 94],
];

function renderSky() {
  const night = Math.min(state.game?.night ?? 0, NIGHT_STEPS);
  document.body.dataset.night = night;
  document.body.style.setProperty("--night", (night / NIGHT_STEPS).toFixed(3));
  for (const star of stars) star.hidden = night < Number(star.dataset.from);
  const [icon, top, along] = SKY[Math.round((night / NIGHT_STEPS) * 6)];
  skyIcon.textContent = stripIcon.textContent = icon;
  skyIcon.style.top = `${top}%`;
  stripIcon.style.left = `${along}%`;
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

// --- The bar above the grid: what to do, how many are ready, the Ready button ---
const statusBar = document.getElementById("status");
const statusText = document.getElementById("status-text");
const readyButton = document.getElementById("ready");
const timer = document.getElementById("timer");
const timerFill = timer.firstElementChild;

function renderStatus() {
  const game = state.game;
  if (game?.status === "lost") {
    statusText.textContent = "🐺 The wolf is out, let's go to bed! The memories still hidden will wait for next time.";
  } else if (game?.status === "won") {
    statusText.textContent = "✨ Every memory found!";
  }
  if (!choosing()) {
    if (!game || game.status === "playing") statusText.textContent = "Joining…";
    readyButton.hidden = true;
    return;
  }
  const picks = game.picks ?? {};
  const total = state.players.length;
  const readyCount = state.players.filter((p) => picks[p.id]?.ready).length;
  const count = total > 1 ? ` (${readyCount} of ${total} ready)` : "";
  const mine = picks[myId];
  if (mine?.ready) {
    statusText.textContent = `✓ Ready! Waiting for the others${count}`;
  } else if (mine) {
    statusText.textContent = `Tap ✓ Ready, or pick another square${count}`;
  } else {
    statusText.textContent = `Pick a square up to ${REACH} steps away, then tap ✓ Ready${count}`;
  }
  readyButton.hidden = Boolean(mine?.ready);
}

// After the first Ready, a calm bar shows the time left (no numbers).
export function renderTimer() {
  const deadline = state.game?.deadline;
  timer.hidden = !deadline || !choosing();
  if (timer.hidden) return;
  const left = Math.max(0, deadline - now());
  timerFill.style.width = `${(left / READY_WAIT_MS) * 100}%`;
}

// A little shake when someone taps a square out of reach.
export function nudgeStatus() {
  statusBar.classList.remove("nudge");
  void statusBar.offsetWidth; // restart the animation
  statusBar.classList.add("nudge");
}
