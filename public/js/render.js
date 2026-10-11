// Drawing: everything on screen comes from `state`.
import { SIZE, myId } from "./session.js";
import { state } from "./state.js";
import { now, NIGHT_STEPS } from "./game.js";
import {
  READY_WAIT_MS, choosing, sheepLine, sheepLeft, inSheepMode, SHEEP_LENGTH, pathBetween,
} from "./rounds.js";
import { queueCard, explainOnce } from "./card.js";
import { playBleat } from "./sound.js";

const FLOAT_MS = 1400; // must match the float animation in style.css
const FLIP_MS = 600; // must match the flip animation in style.css
const POP_MS = 2200; // longest pop or insect animation in style.css, delay included
const FLYERS = ["🐞", "🦗"]; // the other insects walk away
const SHEEP_STEP_MS = 800; // the sheep takes this long per square; keep in sync with style.css

const grid = document.getElementById("grid");
// Test aid: add ?peek to the link to see what's hidden under the grass.
const peek = new URLSearchParams(location.search).has("peek");

export function render() {
  grid.replaceChildren();
  drawTiles();
  drawSniffed();
  drawPicks();
  drawPlayers();
  drawPops();
  drawGrazing();
  drawWolf();
  fireflies.hidden = state.game?.status !== "won";
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
let justArrived = false; // this render is my first look at this game
let pops = []; // [{k, tile, age}] squares turned over in the last POP_MS

function drawTiles() {
  const game = state.game;
  pops = [];
  if (!game) return;
  const arriving = gameSeen !== game.id;
  justArrived = arriving;
  gameSeen = game.id;
  for (const [k, tile] of Object.entries(game.revealed ?? {})) {
    const el = document.createElement("div");
    el.className = `tile ${tile.show}`;
    place(el, ...squareOf(k));
    if (tile.show === "flower") el.classList.add(`f${tile.f ?? 0}`);
    if (tile.icon && tile.show !== "insect") el.append(iconSpan(tile.icon)); // insects leave
    if (tile.show === "memory" || tile.show === "clue") {
      el.style.setProperty("--c", state.memories[tile.memory]?.color ?? "#999"); // the author's colour
      el.dataset.memory = tile.memory; // tap it to read it again
    }
    if (tile.show === "clue") {
      el.dataset.clue = tile.n;
      const animal = document.createElement("span");
      animal.className = "clue-animal"; // whose memory it belongs to
      animal.textContent = state.memories[tile.memory]?.animal ?? "";
      const number = document.createElement("span");
      number.className = "clue-number"; // which of the 3 clues
      number.textContent = tile.n + 1;
      el.append(animal, number);
    }
    const id = `${game.id}:${k}`;
    if (!firstSeen.has(id)) {
      firstSeen.set(id, arriving ? -Infinity : performance.now());
      if (!arriving && (tile.show === "memory" || tile.show === "clue")) {
        queueCard({ memory: tile.memory, n: tile.n });
      }
      if (!arriving && tile.show === "trap" && state.joined) {
        explainOnce("trap", {
          heading: "🪤 A trap!",
          text: `The sky gets a little darker. After ${NIGHT_STEPS} traps it's full night, `
            + "and the wolf comes out! Find all the clues before then.",
        }, 900); // after the trap pops up
      }
    }
    const age = performance.now() - firstSeen.get(id);
    if (age < FLIP_MS) {
      el.classList.add("flip");
      el.style.animationDelay = `${-age}ms`;
    }
    if (age < POP_MS && tile.icon) pops.push({ k, tile, age });
    grid.append(el);
  }
  if (!peek) return;
  for (const [k, hidden] of Object.entries(game.board ?? {})) {
    if (game.revealed?.[k]) continue;
    const el = document.createElement("div");
    el.className = "peek";
    place(el, ...squareOf(k));
    el.append(iconSpan({ trap: "🪤", clue: "🔍" }[hidden.kind] ?? "📜"));
    grid.append(el);
  }
}

// Picked squares. Mine shows in my colour with my animal; everyone else's
// is a plain dashed ring, so you can see where people are going, not who.
// A sheep's pick covers its whole line, with a 🐑 on the square tapped.
function drawPicks() {
  if (!choosing()) return;
  const picks = state.game.picks ?? {};
  const others = new Map(); // "x_y" -> true if a sheep stands there
  for (const [id, p] of Object.entries(picks)) {
    if (id === myId) continue;
    for (const [x, y] of pickSquares(p)) {
      const k = `${x}_${y}`;
      others.set(k, others.get(k) || (p.sheep && x === p.x && y === p.y));
    }
  }
  for (const [k, sheep] of others) {
    const el = document.createElement("div");
    el.className = "pick";
    place(el, ...squareOf(k));
    if (sheep) el.append(iconSpan("🐑"));
    grid.append(el);
  }
  const mine = picks[myId];
  if (!mine) return;
  // The squares I'll walk through, as small footprints: traps on the way go
  // off, so I can see what I'll cross and pick somewhere else.
  if (!mine.sheep) {
    for (const k of pathBetween(state.me, mine)) {
      const step = document.createElement("div");
      step.className = "footstep";
      place(step, ...squareOf(k));
      grid.append(step);
    }
  }
  for (const [x, y] of pickSquares(mine)) {
    const el = document.createElement("div");
    el.className = "pick mine" + (mine.ready ? " ready" : "");
    el.style.setProperty("--c", state.me.color);
    place(el, x, y);
    if (!mine.sheep) el.append(animalSpan(state.me.animal));
    else if (x === mine.x && y === mine.y) {
      el.append(iconSpan("🐑"));
      if (!mine.ready) {
        const turn = document.createElement("span");
        turn.className = "turn-hint"; // tap again to turn
        turn.textContent = "↻";
        el.append(turn);
      }
    }
    grid.append(el);
  }
}

const pickSquares = (p) => (p.sheep ? sheepLine(p.x, p.y, p.sheep) : [[p.x, p.y]]);

// Squares a sheep refused: something is hiding there (a clue or a trap).
function drawSniffed() {
  const game = state.game;
  if (!game) return;
  for (const k of Object.keys(game.sniffed ?? {})) {
    if (game.revealed?.[k] || game.spotted?.[k]) continue;
    const el = document.createElement("div");
    el.className = "sniffed";
    place(el, ...squareOf(k));
    el.append(iconSpan("❓"));
    grid.append(el);
  }
  // A clue someone walked past: we know a clue is there, not what it says.
  for (const k of Object.keys(game.spotted ?? {})) {
    if (game.revealed?.[k]) continue;
    const el = document.createElement("div");
    el.className = "sniffed spotted";
    place(el, ...squareOf(k));
    el.append(iconSpan("🔍"));
    const bang = document.createElement("span");
    bang.className = "spotted-bang";
    bang.textContent = "!";
    el.append(bang);
    grid.append(el);
  }
}

// The sheep sent last round trot along their lines, above everyone. At a
// square they refuse, a "Baa?" bubble pops up as they reach it.
let grazeSeen = null; // "gameId:round" of the grazing this device has timed
let grazeStart = 0;

function drawGrazing() {
  const game = state.game;
  const runs = game?.grazed;
  if (!runs) return;
  const tag = `${game.id}:${game.round}`;
  if (grazeSeen !== tag) {
    // First time I see this grazing: animate it, unless I just arrived,
    // with a "bêêê" at each square a sheep refuses.
    grazeStart = justArrived ? -Infinity : performance.now();
    grazeSeen = tag;
    if (!justArrived) {
      for (const run of runs) {
        for (const k of run.refused ?? []) {
          setTimeout(playBleat, (run.line.indexOf(k) + 1) * SHEEP_STEP_MS - 300);
        }
      }
    }
  }
  const age = performance.now() - grazeStart;
  if (age > SHEEP_STEP_MS * (SHEEP_LENGTH + 2)) return; // the walk plus the last "Baa?"
  for (const run of runs) {
    // The lane covers the sheep's squares; the sheep walks it from its first
    // square, backwards along the lane when it goes left or up.
    const squares = run.line.map(squareOf);
    const left = Math.min(...squares.map(([x]) => x));
    const top = Math.min(...squares.map(([, y]) => y));
    const across = ["right", "left", "h"].includes(run.dir);
    const lane = document.createElement("div");
    lane.className = `graze ${across ? "h" : "v"}`;
    if (run.dir === "left" || run.dir === "up") lane.classList.add("reverse");
    if (run.dir === "right" || run.dir === "h") lane.classList.add("face-right");
    if (across) {
      lane.style.gridColumn = `${left + 1} / span ${SHEEP_LENGTH}`;
      lane.style.gridRow = top + 1;
    } else {
      lane.style.gridColumn = left + 1;
      lane.style.gridRow = `${top + 1} / span ${SHEEP_LENGTH}`;
    }
    const walker = document.createElement("span");
    walker.className = "walker";
    walker.append(iconSpan("🐑"));
    walker.style.animationDelay = `${-age}ms`;
    lane.append(walker);
    grid.append(lane);
    for (const k of run.refused ?? []) {
      const i = run.line.indexOf(k);
      const baa = document.createElement("div");
      baa.className = "baa";
      place(baa, ...squareOf(k));
      const bubble = document.createElement("span");
      bubble.textContent = "Baa?";
      bubble.style.animationDelay = `${(i + 1) * SHEEP_STEP_MS - 300 - age}ms`; // as the sheep gets there
      baa.append(bubble);
      grid.append(baa);
    }
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

// A win: fireflies drift over the field. They live outside the grid, so
// redraws don't restart them.
const fireflies = document.getElementById("fireflies");
for (let i = 0; i < 24; i++) {
  const fly = document.createElement("span");
  fly.className = "firefly";
  fly.style.left = `${Math.random() * 100}%`;
  fly.style.top = `${Math.random() * 100}%`;
  fly.style.setProperty("--dx", `${(Math.random() * 2 - 1) * 60}px`);
  fly.style.setProperty("--dy", `${(Math.random() * 2 - 1) * 60}px`);
  fly.style.animationDelay = `-${(Math.random() * 4).toFixed(2)}s`;
  fireflies.append(fly);
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
// Where each circle is drawn: it walks one square at a time towards where the
// player really is, instead of jumping there.
const WALK_STEP_MS = 180;
const shown = new Map(); // playerId -> {x, y} as drawn
let walker = null;

function stepWalkers() {
  let moving = false;
  for (const p of state.players) {
    const at = shown.get(p.id);
    if (!at) continue;
    const dx = p.x - at.x;
    const dy = p.y - at.y;
    if (dx === 0 && dy === 0) continue;
    // Along the axis with the most distance left: a natural staircase path.
    if (Math.abs(dx) >= Math.abs(dy)) at.x += Math.sign(dx);
    else at.y += Math.sign(dy);
    moving = true;
  }
  if (!moving) {
    clearInterval(walker);
    walker = null;
  }
  render();
}

function drawnAt(p) {
  if (!shown.has(p.id)) shown.set(p.id, { x: p.x, y: p.y }); // just arrived: no walk
  const at = shown.get(p.id);
  if ((at.x !== p.x || at.y !== p.y) && !walker) walker = setInterval(stepWalkers, WALK_STEP_MS);
  return at;
}

function drawPlayers() {
  const here = new Set(state.players.map((p) => p.id));
  for (const id of shown.keys()) if (!here.has(id)) shown.delete(id);
  const squares = new Map();
  for (const p of state.players) {
    const at = drawnAt(p);
    const key = `${at.x},${at.y}`;
    if (!squares.has(key)) squares.set(key, []);
    squares.get(key).push({ ...p, ...at });
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
const endOpen = document.getElementById("end-open"); // reopens the end screen
const sheepButton = document.getElementById("sheep");
const statusDetail = document.getElementById("status-detail");

// The bar: what to do, big; the details small, underneath.
function say(main, detail = "") {
  statusText.textContent = main;
  statusDetail.textContent = detail;
  statusDetail.hidden = !detail;
}
const timer = document.getElementById("timer");
const timerFill = timer.firstElementChild;

function renderStatus() {
  const game = state.game;
  if (state.joined && !state.online) {
    say("📶 Connection lost, reconnecting…");
    readyButton.hidden = sheepButton.hidden = endOpen.hidden = true;
    return;
  }
  if (game?.status === "lost") {
    say("🐺 The wolf is out, let's go to bed!", "Memories not guessed can be hidden again next game.");
  } else if (game?.status === "won") {
    say("✨ Every memory found!");
  }
  const over = game && game.status !== "playing";
  endOpen.hidden = !over;
  if (over) endOpen.textContent = game.status === "won" ? "☕ Back to the tea" : "🌙 Back to bed";
  if (!choosing()) {
    if (game?.guess && !over) say("🔍 Time to guess a memory!", "All its clues are found.");
    else if (!over) say("Joining…");
    readyButton.hidden = true;
    sheepButton.hidden = true;
    return;
  }
  const picks = game.picks ?? {};
  const total = state.players.length;
  const readyCount = state.players.filter((p) => picks[p.id]?.ready).length;
  const count = total > 1 ? `${readyCount} of ${total} ready` : "";
  const mine = picks[myId];
  const sheepMode = inSheepMode();
  const withCount = (text) => [text, count].filter(Boolean).join(" · ");
  if (mine?.ready) {
    say("✓ Ready!", withCount("Waiting for the others"));
  } else if (sheepMode && mine?.sheep) {
    say("🐑 Tap ✓ Ready to send your sheep", withCount("Tap the 🐑 square again to turn it ↻"));
  } else if (sheepMode) {
    say("🐑 Choose where to place your sheep", withCount(`Tap a square: it grazes ${SHEEP_LENGTH} squares from there`));
  } else if (mine) {
    say("Tap ✓ Ready", withCount("or pick another square · the footprints show your way"));
  } else {
    say("Pick any square", withCount("then tap ✓ Ready · traps on your way go off!"));
  }
  readyButton.hidden = Boolean(mine?.ready);
  // The sheep button shows the sheep I have left, one icon each: no reading needed.
  const left = sheepLeft();
  sheepButton.hidden = Boolean(mine?.ready) || (left <= 0 && !sheepMode);
  sheepButton.textContent = "🐑".repeat(Math.max(0, left));
  sheepButton.setAttribute("aria-pressed", String(sheepMode));
  sheepButton.setAttribute("aria-label", `Send a sheep (${left} left)`);
}

// After the first Ready, a calm bar shows the time left (no numbers).
export function renderTimer() {
  const deadline = state.game?.deadline;
  timer.hidden = !deadline || !choosing();
  if (timer.hidden) return;
  const left = Math.max(0, deadline - now());
  timerFill.style.width = `${(left / READY_WAIT_MS) * 100}%`;
}

// A little shake when something can't be done (no sheep left, no line placed).
export function nudgeStatus() {
  statusBar.classList.remove("nudge");
  void statusBar.offsetWidth; // restart the animation
  statusBar.classList.add("nudge");
}
