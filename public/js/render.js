// Drawing: everything on screen comes from `state`.
import { SIZE, myId } from "./session.js";
import { state, playerById, canMove } from "./state.js";

const FLOAT_MS = 1400; // must match the float animation in style.css
const PULSE_MS = 1600; // must match the pulse animation in style.css
export const HINT_ICON = { hot: "🔥", cold: "❄️" };

const grid = document.getElementById("grid");
const banner = document.getElementById("banner");
const turnBar = document.getElementById("turnbar");
const turnText = document.getElementById("turn-text");
const hotButton = document.getElementById("hot");
const coldButton = document.getElementById("cold");
const nextButton = document.getElementById("next");

export function render() {
  grid.replaceChildren();
  drawTargets();
  drawReachable();
  drawPlayers();
  renderTurnBar();
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

// Targets first, so circles are drawn on top of them.
function drawTargets() {
  for (const [id, t] of Object.entries(state.targets)) {
    if (id === myId && !t.found) continue; // your own target stays hidden
    const owner = playerById(id);
    if (!owner) continue;
    const el = document.createElement("div");
    el.className = "target" + (t.found ? " found" : "");
    place(el, t.x, t.y);
    el.style.setProperty("--c", owner.color);
    // Keep every pulse on one shared clock, so redraws don't restart it.
    el.style.animationDelay = `-${Math.round(performance.now() % PULSE_MS)}ms`;
    el.append(animalSpan(owner.animal));
    grid.append(el);
  }
}

// On my turn, soft dots on the squares I can move to.
function drawReachable() {
  if (!canMove()) return;
  for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
    const x = state.me.x + dx;
    const y = state.me.y + dy;
    if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) continue;
    const el = document.createElement("div");
    el.className = "reach";
    el.style.setProperty("--c", state.me.color);
    place(el, x, y);
    grid.append(el);
  }
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
      if (state.turn?.player === p.id) el.classList.add("turn");
      el.style.background = p.color;
      el.dataset.id = p.id;
      el.append(animalSpan(p.animal));
      const hints = hintBadges(p.id);
      if (hints) el.append(hints);
      if (state.floats.has(p.id)) el.append(floatElement(state.floats.get(p.id)));
      square.append(el);
    }
    grid.append(square);
  }
}

// Badges under a player: who said what ("🐶🔥"), on white so the icons read
// by shape, not just colour. They stay until that player moves again.
function hintBadges(playerId) {
  const hints = Object.entries(state.hints[playerId] || {});
  if (hints.length === 0) return null;
  const el = document.createElement("span");
  el.className = "hints";
  for (const [from, kind] of hints) {
    const sender = playerById(from);
    if (!sender) continue;
    const badge = document.createElement("span");
    badge.className = "hint";
    badge.textContent = `${sender.animal}${HINT_ICON[kind] ?? ""}`;
    badge.title = `${sender.animal} says ${kind === "hot" ? "warmer" : "colder"}`;
    el.append(badge);
  }
  return el;
}

// A big ❤️ / 🔥 / ❄️ floating above a player for a moment; everyone sees it.
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

// The bar above the grid: whose turn it is, and the buttons that apply to me.
function renderTurnBar() {
  const t = state.turn;
  const mover = t && playerById(t.player);
  let text = "Joining…";
  let signals = false;
  let next = false;

  if (state.joined && state.players.length <= 1) {
    text = `${state.me.animal} Share the link below: others will guide you to your hidden square`;
  } else if (state.joined && mover) {
    if (mover.id === myId) {
      text = t.moved ? `${mover.animal} Listen for 🔥 warmer or ❄️ colder…` : `${mover.animal} Your turn: move as far as you like`;
      next = t.moved;
    } else {
      text = t.moved ? `Is ${mover.animal} getting warmer or colder?` : `${mover.animal}'s turn to move`;
      signals = t.moved;
    }
  }

  turnText.textContent = text;
  turnBar.style.setProperty("--c", mover?.color ?? "#ccc");
  hotButton.hidden = coldButton.hidden = !signals;
  nextButton.hidden = !next;
  const mine = mover && state.hints[mover.id]?.[myId];
  hotButton.setAttribute("aria-pressed", mine === "hot");
  coldButton.setAttribute("aria-pressed", mine === "cold");
}

// A little shake of the turn bar when someone tries to move out of turn.
export function nudgeTurnBar() {
  turnBar.classList.remove("nudge");
  void turnBar.offsetWidth; // restart the animation
  turnBar.classList.add("nudge");
}

// "Found it!" banner at the top, one line per target currently found.
let bannerShown = "";

export function renderBanner() {
  const found = state.players.filter((p) => state.targets[p.id]?.found);
  const signature = found.map((p) => p.id).join();
  if (signature === bannerShown) return; // unchanged: don't restart the pop-in
  bannerShown = signature;
  banner.replaceChildren();
  for (const p of found) {
    const line = document.createElement("div");
    line.className = "found";
    line.style.setProperty("--c", p.color);
    line.textContent = `${p.animal} ${p.id === myId ? "You found it!" : "Found it!"}`;
    banner.append(line);
  }
}
