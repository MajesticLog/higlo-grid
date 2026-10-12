// Drawing: everything on screen comes from `state`.
import { myId } from "./session.js";
import { state } from "./state.js";
import { now, NIGHT_STEPS, PICTURES, currentMemory, cluesOf, fitGrid } from "./game.js";
import { SIZE } from "./session.js";
import {
  READY_WAIT_MS, FLASH_MS, choosing, sheepLeft, inSheepMode, roundPhase, targetPicture, grazedSquares, flashCountdown,
} from "./rounds.js";
import { queueCard } from "./card.js";
import {
  updateReplay, setReplayTick, replayActive, replayIsFresh, countdown, pictureAge, replayPosition, nightShown,
  SHOW_MS, missedAge, showingMissed,
} from "./replay.js";
import { CLUES } from "./lobby.js";
import { renderPause } from "./pause.js";

const FLOAT_MS = 1400; // must match the float animation in style.css
const POP_MS = 2000; // must match the pop-up animation in style.css
const TURN_DOWN_MS = 500; // must match card-down in style.css

const grid = document.getElementById("grid");
// Test aid: add ?peek to the link to see every picture under the grass.
const peek = new URLSearchParams(location.search).has("peek");

setReplayTick(() => render());
const countdownEl = document.getElementById("countdown");

export function render() {
  fitGrid(); // the garden's size can change before the first round
  // A new round result: start its replay (unless I've only just arrived).
  if (state.game) {
    updateReplay(gameSeen !== state.game.id);
    gameSeen = state.game.id;
    cardForResult();
  }
  grid.replaceChildren();
  drawTiles();
  drawPicks();
  drawPlayers();
  drawPops();
  drawSheep();
  drawWolf();
  fireflies.hidden = state.game?.status !== "won" || replayActive();
  const count = countdown() ?? flashCountdown(); // before a replay, or before a flash
  countdownEl.hidden = count === null;
  if (count !== null && countdownEl.textContent !== String(count)) {
    countdownEl.textContent = count; // a new number: restart its pop
    countdownEl.style.animation = "none";
    void countdownEl.offsetWidth;
    countdownEl.style.animation = "";
  }
  renderSky();
  renderStatus();
  renderTimer();
  renderPause();
}

// Squares are keyed "x_y" in the database.
const squareOf = (k) => k.split("_").map(Number);
let gameSeen = null;

// After a round this device watched: the clue earned, as a card for everyone
// (card.js shows it once the replay is over).
let carded = null;
function cardForResult() {
  const replay = state.game?.replay;
  if (!replay || carded === replay.tag || !replayIsFresh(replay.tag)) return;
  carded = replay.tag;
  if (replay.success && replay.memory != null) queueCard({ memory: replay.memory, n: replay.clue });
}

// The garden. Squares are tall grass (the grid's own background) except:
// the flash (6 pictures for a few seconds), a chosen square showing its
// picture during the replay, after a miss the squares that had the picture,
// and squares a sheep has grazed (short grass). Pictures are cards that turn
// over, then turn back.
let pops = []; // pictures to pop above the players: [{k, icon, age}]

function drawTiles() {
  const game = state.game;
  pops = [];
  if (!game?.board) return;
  const phase = roundPhase();
  // The flash.
  if (phase === "flash") {
    const age = now() - game.flash.at; // the same moment on every device
    for (const k of game.flash.squares ?? []) card(k, "", PICTURES[game.board[k]], age, FLASH_MS);
  }
  // Squares a sheep has grazed this round: not the picture, so short grass.
  if (phase === "choose") {
    for (const k of grazedSquares(game)) tile(k, "grass");
  }
  // The replay: each chosen square shows its picture as its player lands.
  if (replayActive()) {
    const target = game.replay?.target;
    for (const k of Object.keys(game.board)) {
      const age = pictureAge(k);
      if (age === null) continue;
      const right = game.board[k] === target;
      card(k, right ? "right" : "wrong", PICTURES[game.board[k]], age, SHOW_MS);
      if (age < POP_MS) pops.push({ k, icon: PICTURES[game.board[k]], age });
    }
    for (const k of game.replay?.missed ?? []) {
      const shown = missedAge(k);
      if (shown) card(k, "missed", PICTURES[game.board[k]], shown.age, shown.life);
    }
  }
  if (!peek) return;
  for (const [k, kind] of Object.entries(game.board)) {
    const el = document.createElement("div");
    el.className = "peek";
    place(el, ...squareOf(k));
    el.append(iconSpan(PICTURES[kind]));
    grid.append(el);
  }
}

// A picture as a card: it turns face up (card-up), shows for `life` ms, then
// turns face down again (card-down). `age`: how long it has been showing, so
// the turn carries on smoothly through redraws.
function card(k, className, icon, age, life) {
  const el = document.createElement("div");
  el.className = `card ${className}`;
  place(el, ...squareOf(k));
  const inner = document.createElement("div");
  inner.className = "card-inner";
  inner.style.animationDelay = `${-age}ms, ${life - TURN_DOWN_MS - age}ms`;
  const front = document.createElement("div");
  front.className = "card-face card-front";
  front.append(iconSpan(icon));
  const back = document.createElement("div");
  back.className = "card-face card-back";
  inner.append(front, back);
  el.append(inner);
  grid.append(el);
}

// A square of short grass (grazed by a sheep).
function tile(k, className) {
  const el = document.createElement("div");
  el.className = `tile ${className}`;
  place(el, ...squareOf(k));
  grid.append(el);
}

// Picked squares. Mine shows in my colour with my animal; everyone else's
// is a plain dashed ring, so you can see which squares are taken, not who.
function drawPicks() {
  if (!choosing()) return;
  const picks = state.game.picks ?? {};
  for (const [id, p] of Object.entries(picks)) {
    const el = document.createElement("div");
    el.className = id === myId ? `pick mine${p.ready ? " ready" : ""}` : "pick";
    place(el, p.x, p.y);
    if (id === myId) {
      el.style.setProperty("--c", state.me.color);
      el.append(animalSpan(state.me.animal));
    }
    grid.append(el);
  }
}

// The sheep placed this round, munching in the middle of what it grazed.
function drawSheep() {
  if (roundPhase() !== "choose") return;
  for (const k of Object.values(state.game.grazing ?? {})) {
    const el = document.createElement("div");
    el.className = "sheep-sitting";
    place(el, ...squareOf(k));
    el.append(iconSpan("🐑"));
    grid.append(el);
  }
}

// A chosen square's picture pops above the player standing on it, so
// nobody's circle hides it.
function drawPops() {
  for (const { k, icon, age } of pops) {
    const el = document.createElement("div");
    el.className = "pop pop";
    place(el, ...squareOf(k));
    const span = iconSpan(icon);
    span.style.animationDelay = `${-age}ms`;
    el.append(span);
    grid.append(el);
  }
}

// Full night: the wolf comes out onto the field (nothing scary).
function drawWolf() {
  if (state.game?.status !== "lost" || replayActive()) return; // after the replay
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

// --- The sky: each missed round brings the night one step closer ---
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
  const night = nightShown(Math.min(state.game?.night ?? 0, NIGHT_STEPS)); // a miss darkens it once it has played
  const step = Math.round((night / NIGHT_STEPS) * 6); // the sky has 6 steps (style.css), whatever NIGHT_STEPS is
  document.body.dataset.night = step;
  document.body.style.setProperty("--night", (night / NIGHT_STEPS).toFixed(3));
  for (const star of stars) star.hidden = step < Number(star.dataset.from);
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

// Clamped, so a circle not yet moved onto a smaller grid doesn't add a column.
function place(el, x, y) {
  el.style.gridColumn = Math.min(x, SIZE - 1) + 1; // CSS grid lines start at 1
  el.style.gridRow = Math.min(y, SIZE - 1) + 1;
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
  const replayed = replayPosition(p.id); // during a replay, the replay walks them
  if (replayed) {
    shown.set(p.id, replayed);
    return replayed;
  }
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

  celebrateMeetings(squares);

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
      if (state.bubbles.has(p.id)) el.append(bubbleElement(state.bubbles.get(p.id)));
      square.append(el);
    }
    grid.append(square);
  }
}

// Players who end up on the same square, even just walking through, get a
// heart each, once per meeting. Every device sees the same meetings, so it
// works out its own hearts (nothing to send).
let together = new Set(); // "x,y:idA,idB" of meetings on screen right now

function celebrateMeetings(squares) {
  const now = new Set();
  for (const [where, group] of squares) {
    if (group.length < 2) continue;
    const meeting = `${where}:${group.map((p) => p.id).sort().join(",")}`;
    now.add(meeting);
    if (!together.has(meeting)) {
      setTimeout(() => { for (const p of group) showFloat(p.id, "❤️"); }, 0); // after this redraw
    }
  }
  together = now;
}

// A message bubble above a player (messages.js); like floats, it carries on
// through redraws.
function bubbleElement({ text, startedAt }) {
  const el = document.createElement("span");
  el.className = "bubble";
  el.textContent = text;
  el.style.animationDelay = `${startedAt - performance.now()}ms`;
  return el;
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

// --- The bar above the grid: what to do, the card, Ready, the sheep ---
const statusBar = document.getElementById("status");
const statusText = document.getElementById("status-text");
const readyButton = document.getElementById("ready");
const endOpen = document.getElementById("end-open"); // reopens the end screen
const sheepButton = document.getElementById("sheep");
const statusDetail = document.getElementById("status-detail");
const targetCard = document.getElementById("target");

// The bar: what to do, big; the details small, underneath.
// Every line of the bar keeps its place even when empty (style.css), so the
// bar never changes height and the field below never jumps.
function say(main, detail = "") {
  statusText.textContent = main;
  statusDetail.textContent = detail;
}
const timer = document.getElementById("timer");
const timerFill = timer.firstElementChild;

// "Clues for 🐶 Mathilde's memory: 1 of 3"
function cluesLine(game) {
  const memory = currentMemory(game);
  const m = memory && state.memories[memory];
  if (!m) return "";
  return `Clues for ${`${m.animal ?? ""} ${m.name ?? ""}`.trim()}'s memory: ${cluesOf(game, memory)} of ${CLUES}`;
}

function renderStatus() {
  const game = state.game;
  readyButton.hidden = sheepButton.hidden = endOpen.hidden = true;
  // The card only takes room when it shows something, so the buttons stay
  // centred (the row itself keeps its height either way).
  targetCard.hidden = true;
  const showTarget = (icon) => {
    targetCard.textContent = icon;
    targetCard.hidden = !icon;
  };
  if (state.joined && !state.online) return say("📶 Connection lost, reconnecting…");
  if (game?.paused) return say("⏸️ Paused", "Anyone can resume when everyone's back");
  // During a replay, nothing else yet: not the wolf, not the end, not guessing.
  if (replayActive()) {
    showTarget(PICTURES[game.replay?.target] ?? "");
    if (showingMissed()) return say("🔎 Here's where they were", "The night falls a little");
    return say("👀 Watch what happens…", "Each player shows the square they chose");
  }
  if (game?.status === "lost") {
    endOpen.hidden = false;
    endOpen.textContent = "🌙 Back to bed";
    return say("🐺 The wolf is out, let's go to bed!", "Memories not guessed wait for next time.");
  }
  if (game?.status === "won") {
    endOpen.hidden = false;
    endOpen.textContent = "☕ Back to the tea";
    return say("✨ Every memory found!");
  }
  if (!state.joined || !game) return say("Joining…");
  const phase = roundPhase();
  if (phase === "waiting") {
    // Before the first round: time to arrive, walk around and read the rules.
    const total = state.players.length;
    const readyCount = state.players.filter((p) => game.playReady?.[p.id]).length;
    const mine = game.playReady?.[myId];
    readyButton.hidden = Boolean(mine);
    readyButton.textContent = "✓ Ready to play";
    const count = total > 1 ? ` · ${readyCount} of ${total} ready` : "";
    return mine
      ? say("✓ Ready! Waiting for the others…", `Walk around while you wait${count}`)
      : say("🌱 Ready to play?", `Read the rules by tapping ❓${count}`);
  }
  readyButton.textContent = "✓ Ready";
  if (phase === "guess") return say("🔍 Time to guess a memory!", "All its clues are found.");
  if (phase === "countdown") return say("👀 Get ready to remember!", cluesLine(game));
  if (phase === "flash") return say("👀 Remember the pictures!", cluesLine(game) || "Which one will you need to find?");
  if (phase === "pause") return say("🤔 Who remembers what?", "The picture to find is coming…");
  if (phase === "result") {
    const last = game.replay;
    if (!currentMemory(game)) return say("🌱 Waiting for a memory to find…", "Write one in the lobby, or wait for someone to join");
    if (!last) return say("🌱 Get ready!", cluesLine(game));
    return last.success
      ? say(`✅ Found! ${last.found} of ${last.needed} needed`, cluesLine(game))
      : say("🌙 Not this time… the night falls a little", cluesLine(game));
  }
  // Choosing: the card shows the picture to find.
  showTarget(targetPicture());
  const picks = game.picks ?? {};
  const total = state.players.length;
  const readyCount = state.players.filter((p) => picks[p.id]?.ready).length;
  const count = total > 1 ? `${readyCount} of ${total} ready` : "";
  const mine = picks[myId];
  const withCount = (text) => [text, count].filter(Boolean).join(" · ");
  if (mine?.ready) say("✓ Ready!", withCount("Waiting for the others"));
  else if (inSheepMode()) say("🐑 Where should your sheep graze?", "Around it, it shows where the picture isn't");
  else if (mine) say(`Find the ${targetPicture()}`, withCount("Tap ✓ Ready, or pick another square"));
  else say(`Find the ${targetPicture()}`, withCount("Pick a square where you remember one"));
  readyButton.hidden = Boolean(mine?.ready);
  // One sheep per game: shown until it's been used.
  sheepButton.hidden = Boolean(mine?.ready) || sheepLeft() <= 0;
  sheepButton.textContent = "🐑";
  sheepButton.setAttribute("aria-pressed", String(inSheepMode()));
  sheepButton.setAttribute("aria-label", "Send your sheep");
}

// After the first Ready, a calm bar shows the time left (no numbers).
export function renderTimer() {
  const deadline = state.game?.deadline;
  const off = !deadline || !choosing();
  timer.style.visibility = off ? "hidden" : "visible"; // keeps its space either way
  if (off) return;
  const left = Math.max(0, deadline - now());
  timerFill.style.width = `${(left / READY_WAIT_MS) * 100}%`;
}

// A little shake when something can't be done (a square already taken).
export function nudgeStatus() {
  statusBar.classList.remove("nudge");
  void statusBar.offsetWidth; // restart the animation
  statusBar.classList.add("nudge");
}
