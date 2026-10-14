// Drawing: everything on screen comes from `state`.
import { myId } from "./session.js";
import { state } from "./state.js";
import { now, nightSteps, skyStep, SKY_DUSK, PICTURES, currentMemory, cluesOf, fitGrid } from "./game.js";
import { SIZE } from "./session.js";
import {
  someoneReading, stillArriving, choosing, sheepLeft, inSheepMode, roundPhase, targetPicture, grazedSquares, sheepSpotted, flashReady,
  zoneSquares, zoneWidth, zoneHeight, renderPatchButton,
} from "./rounds.js";
import { queueCard } from "./card.js";
import {
  updateReplay, setReplayTick, replayActive, replayIsFresh, countdown, pictureAge, replayPosition, nightShown,
  missedShown, showingMissed,
} from "./replay.js";
import { CLUES } from "./lobby.js";
import { playBleat } from "./sound.js";
import { renderPause } from "./pause.js";

const FLOAT_MS = 1400; // must match the float animation in style.css
const GOODBYE_MS = 3000; // must match the goodbye animation in style.css
const POP_MS = 2000; // must match the pop-up animation in style.css

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
  drawZone();
  drawPicks();
  drawPlayers();
  drawGoodbyes();
  drawPops();
  drawSheep();
  drawWolf();
  fireflies.hidden = state.game?.status !== "won" || replayActive();
  // 3, 2, 1 before a replay, or "Ready?" before a flash.
  const count = countdown();
  const ready = count === null ? flashReady() : null; // how long "Ready?" has been up
  const text = count ?? (ready !== null ? "Ready?" : null);
  countdownEl.hidden = text === null;
  countdownEl.classList.toggle("ready", ready !== null);
  if (text !== null && countdownEl.textContent !== String(text)) {
    countdownEl.textContent = text; // a new number: restart its pop
    countdownEl.style.animation = "none";
    void countdownEl.offsetWidth;
    countdownEl.style.animation = "";
    // Arriving mid-"Ready?": pick up where it is, so it's gone before the flash.
    countdownEl.style.animationDelay = ready !== null ? `-${Math.round(ready)}ms` : "";
  }
  renderSky();
  renderStatus();
  renderTimer();
  renderPatchButton();
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
// the flash (the zone's pictures for a few seconds), a chosen square showing
// its picture during the replay, after a miss the zone's pictures again, and
// squares a sheep has grazed (short grass, until the end of the choosing).
let pops = []; // pictures to pop above the players: [{k, icon, age}]

function drawTiles() {
  const game = state.game;
  pops = [];
  if (!game?.board) return;
  const phase = roundPhase();
  // The flash: the zone's pictures.
  if (phase === "flash") {
    for (const k of zoneSquares(game, game.flash?.zone)) card(k, "", PICTURES[game.board[k]]);
  }
  // Squares a sheep has grazed this round: not the picture, so short grass.
  if (phase === "choose") {
    for (const k of grazedSquares(game)) tile(k, "grass");
    for (const k of sheepSpotted(game)) spotted(k, PICTURES[game.flash.target]);
  }
  // The replay: each chosen square shows its picture as its player lands.
  if (replayActive()) {
    const target = game.replay?.target;
    for (const k of Object.keys(game.board)) {
      const age = pictureAge(k);
      if (age === null) continue;
      const right = game.board[k] === target;
      card(k, right ? "right" : "wrong", PICTURES[game.board[k]]);
      if (age < POP_MS) pops.push({ k, icon: PICTURES[game.board[k]], age });
    }
    for (const k of game.replay?.missed ?? []) {
      if (missedShown(k)) card(k, "again", PICTURES[game.board[k]]);
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

// A picture on a pale card, over its square.
function card(k, className, icon) {
  const el = document.createElement("div");
  el.className = `card ${className}`;
  place(el, ...squareOf(k));
  el.append(iconSpan(icon));
  grid.append(el);
}

// The zone the flash shows, outlined in gold: pulsing while "Ready?" is up,
// glowing steadily during the flash, fading as the grass comes back. After a
// miss, it glows again while the zone's pictures show once more.
function drawZone() {
  const game = state.game;
  const phase = roundPhase();
  let zone = null;
  let look = "";
  if (replayActive()) {
    if (showingMissed()) [zone, look] = [game.replay?.zone, "steady"];
  } else if (["countdown", "flash", "pause"].includes(phase)) {
    zone = game.flash?.zone;
    look = { countdown: "pulse", flash: "steady", pause: "fading" }[phase];
  }
  if (!zone) return;
  const el = document.createElement("div");
  el.className = `zone ${look}`;
  el.style.gridColumn = `${zone.x + 1} / span ${zoneWidth(zone)}`;
  el.style.gridRow = `${zone.y + 1} / span ${zoneHeight(zone)}`;
  grid.append(el);
}

// A square of short grass (grazed by a sheep).
function tile(k, className) {
  const el = document.createElement("div");
  el.className = `tile ${className}`;
  place(el, ...squareOf(k));
  grid.append(el);
}

// A square the sheep left standing: the outline of the picture it hides.
function spotted(k, icon) {
  const el = document.createElement("div");
  el.className = "spotted";
  place(el, ...squareOf(k));
  el.append(iconSpan(icon));
  grid.append(el);
}

// Picked squares. Mine shows in my colour with my animal; everyone else's
// is a plain dashed ring, so you can see which squares are taken, not who.
function drawPicks() {
  if (!choosing()) return;
  const picks = state.game.picks ?? {};
  for (const [id, p] of Object.entries(picks)) {
    // Mine, strong, with "You"; the others' in their colour, lighter, so
    // everyone sees who's going where (playtest 7). The result never says
    // who was wrong.
    const mine = id === myId;
    const who = mine ? state.me : state.players.find((player) => player.id === id);
    const el = document.createElement("div");
    el.className = `pick ${mine ? "mine" : "other"}${p.ready ? " ready" : ""}`;
    place(el, p.x, p.y);
    if (who?.color) el.style.setProperty("--c", who.color);
    el.append(animalSpan(who?.animal));
    if (mine) {
      const you = document.createElement("span");
      you.className = "you";
      you.textContent = "You";
      el.append(you);
    }
    grid.append(el);
  }
}

// A sheep placed this round munches in the middle of what it grazed for a
// moment, then fades away with a "bêêê", so it never hides a player standing
// on that square. The grass it grazed stays short until the end of the
// choosing. Timed from when this device first saw it.
const SHEEP_MS = 2500; // munching
const SHEEP_LEAVE_MS = 700; // fading away; keep in sync with sheep-leave in style.css
const sheepPlacedAt = new Map(); // "round:x_y" -> when this device first drew it

function drawSheep() {
  if (roundPhase() !== "choose") return;
  for (const k of Object.values(state.game.grazing ?? {})) {
    const id = `${state.game.round}:${k}`;
    if (!sheepPlacedAt.has(id)) {
      sheepPlacedAt.set(id, performance.now());
      setTimeout(() => { playBleat(); render(); }, SHEEP_MS); // off it goes
      setTimeout(render, SHEEP_MS + SHEEP_LEAVE_MS); // and it's gone
    }
    const age = performance.now() - sheepPlacedAt.get(id);
    if (age >= SHEEP_MS + SHEEP_LEAVE_MS) continue;
    const el = document.createElement("div");
    el.className = age >= SHEEP_MS ? "sheep-sitting leaving" : "sheep-sitting";
    if (age >= SHEEP_MS) el.style.setProperty("--leave-delay", `${SHEEP_MS - age}ms`); // through redraws
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

// Full night: the wolf comes out onto the field (nothing scary). The grid is
// redrawn on every change, so it picks up its animation where it is: it
// trots in and howls once (playtest 6: three times).
const HOWL_DELAY_MS = 1400; // the bubble after the wolf: keep in sync with .howl in style.css
let wolfSince = null; // {game, at}: when this device first drew it
function drawWolf() {
  if (state.game?.status !== "lost" || replayActive()) return; // after the replay
  if (wolfSince?.game !== state.game.id) wolfSince = { game: state.game.id, at: performance.now() };
  const el = document.createElement("div");
  el.className = "wolf";
  el.innerHTML = '<span class="wolf-icon">🐺</span><span class="howl">Ahouuu!</span>';
  const since = wolfSince.at - performance.now(); // 0, then more and more negative
  el.querySelector(".wolf-icon").style.animationDelay = `${since}ms`;
  el.querySelector(".howl").style.animationDelay = `${HOWL_DELAY_MS + since}ms`;
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
  // More stars each step from dusk to night. Only the offset here: game.js
  // (SKY_DUSK) isn't loaded yet while this runs, as it imports this file.
  star.dataset.after = String(i % 3);
  sky.append(star);
  stars.push(star);
}
// For each sky step 0..6 (dawn to night): sun or moon, how high it is in the
// corner (% from the top), and how far along the phone strip (% from the left).
// The sun starts high in the corner and sinks towards dusk; then the moon.
const SKY = [
  ["☀️", 6, 6], ["☀️", 12, 20], ["☀️", 18, 34], ["☀️", 26, 48],
  ["🌅", 34, 62], ["🌙", 18, 78], ["🌕", 6, 94],
];

function renderSky() {
  const steps = nightSteps(state.game); // misses before the wolf, this game
  const night = nightShown(Math.min(state.game?.night ?? 0, steps)); // a miss darkens it once it has played
  const step = skyStep(night, steps); // dawn to night (style.css), whatever the misses
  document.body.dataset.night = step;
  // The squares darken from dusk only.
  const dark = Math.max(0, (night / steps - SKY_DUSK / 6) / (1 - SKY_DUSK / 6));
  document.body.style.setProperty("--night", dark.toFixed(3));
  for (const star of stars) star.hidden = step < SKY_DUSK + Number(star.dataset.after);
  const [icon, top, along] = SKY[step];
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

// Someone who has left (announce.js): a pale copy of their circle waves 👋
// where they last stood, then fades away.
const goodbyes = new Map(); // key -> {x, y, color, animal, startedAt}

export function showGoodbye(key, p) {
  const startedAt = performance.now();
  goodbyes.set(key, { x: p.x, y: p.y, color: p.color, animal: p.animal, startedAt });
  render();
  setTimeout(() => {
    if (goodbyes.get(key)?.startedAt !== startedAt) return;
    goodbyes.delete(key);
    render();
  }, GOODBYE_MS);
}

function drawGoodbyes() {
  for (const { x, y, color, animal, startedAt } of goodbyes.values()) {
    const square = document.createElement("div");
    square.className = "square goodbye";
    place(square, x, y);
    square.style.animationDelay = `${startedAt - performance.now()}ms`; // through redraws
    const el = document.createElement("div");
    el.className = "circle";
    el.style.background = color;
    el.append(animalSpan(animal));
    const wave = document.createElement("span");
    wave.className = "wave";
    wave.textContent = "👋";
    el.append(wave);
    square.append(el);
    grid.append(square);
  }
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
    if (showingMissed()) return say("🔎 Here's the patch again", "The night falls a little");
    return say("👀 Watch what happens…", "Each player shows the square they chose");
  }
  if (game?.status === "lost") {
    endOpen.hidden = false;
    endOpen.textContent = "🌙 Back to bed";
    return say("🐺 The wolf is out, let's go to bed!", "Memories not guessed wait for next time.");
  }
  if (game?.status === "won") {
    endOpen.hidden = false;
    endOpen.textContent = "🎉 Back to the team";
    return say("🎉 What a team! Every memory found!");
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
    // Someone still in the lobby: the game waits for them.
    const coming = stillArriving().map((p) => `${p.animal ?? ""} ${p.name || "Someone"}`.trim());
    if (mine && coming.length) return say("✓ Ready! Waiting for the others…", `${coming.join(", ")} ${coming.length === 1 ? "is" : "are"} getting ready to join`);
    return mine
      ? say("✓ Ready! Waiting for the others…", `Walk around while you wait${count}`)
      : say("🌱 Ready to play?", `Read the rules by tapping ❓${count}`);
  }
  readyButton.textContent = "✓ Ready";
  if (phase === "between") {
    // A memory done: a break before the next one.
    const total = state.players.length;
    const readyCount = state.players.filter((p) => game.between.ready?.[p.id]).length;
    const mine = game.between.ready?.[myId];
    readyButton.hidden = Boolean(mine);
    readyButton.textContent = "✓ Ready";
    const memory = state.memories[currentMemory(game)];
    const next = memory ? `Next: ${`${memory.animal ?? ""} ${memory.name ?? ""}`.trim()}'s memory` : "";
    const count = total > 1 ? `${readyCount} of ${total} ready` : "";
    const detail = [next, count].filter(Boolean).join(" · ");
    return mine
      ? say("✓ Ready! Waiting for the others…", detail)
      : say("🔍 Ready for the next memory?", detail);
  }
  if (phase === "guess") return say("🔍 Time to guess a memory!", "All its clues are found.");
  if (phase === "countdown") return say("👀 Look at the golden patch!", cluesLine(game));
  if (phase === "flash") return say("👀 Remember the pictures in the patch!", cluesLine(game) || "Which one will you need to find?");
  if (phase === "pause") return say("🤔 Who remembers what?", "The picture to find is coming…");
  if (phase === "result") {
    const last = game.replay;
    if (!currentMemory(game)) return say("🌱 Waiting for a memory to find…", "Write one in the lobby, or wait for someone to join");
    if (!last) return say("🌱 Get ready!", cluesLine(game));
    if (someoneReading()) return say("⏳ Waiting for everyone to finish reading…", "The next round starts once every window is closed");
    return last.success
      ? say(`✅ Found together! ${last.found} of ${last.needed} needed`, cluesLine(game))
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
  // A team game: say how many of us need to find one (playtest 7).
  const needed = Math.ceil(total / 2);
  const find = total > 1 ? `Find a ${targetPicture()} together` : `Find a ${targetPicture()}`;
  const team = total > 1 ? `${needed} of you ${needed === 1 ? "needs" : "need"} to find one` : "";
  if (told()) say(mine?.ready ? "✓ Ready!" : find, told());
  else if (mine?.ready) say("✓ Ready!", withCount("Waiting for the others"));
  else if (inSheepMode()) say("🐑 Where should your sheep graze?", "Around it, it shows where the picture isn't");
  else if (mine) say(find, withCount(total > 1 ? "Tap ✓ Ready · one square each" : "Tap ✓ Ready, or pick another square"));
  else say(find, [team, count].filter(Boolean).join(" · ") || "Pick a square where you remember one");
  readyButton.hidden = Boolean(mine?.ready);
  // One sheep per memory: shown until it's been used.
  sheepButton.hidden = Boolean(mine?.ready) || sheepLeft() <= 0;
  const hint = !sheepButton.hidden && sheepHint(game.round);
  sheepButton.classList.toggle("hint", hint);
  sheepButton.textContent = "🐑";
  sheepButton.setAttribute("aria-pressed", String(inSheepMode()));
  sheepButton.setAttribute("aria-label", "Send your sheep");
}

// The 🐑 button pulses during my first round choosing on this
// device (playtest 5: the sheep went unnoticed). Once I've tapped it, or that
// round is over, it's plain.
const SHEEP_SEEN_KEY = "higlo:sheep-seen";
let sheepHintRound = null; // the round the hint was shown in
let sheepSeen = (() => {
  try { return Boolean(localStorage.getItem(SHEEP_SEEN_KEY)); } catch { return false; }
})();

function sheepHint(round) {
  if (!sheepSeen && (inSheepMode() || (sheepHintRound !== null && round !== sheepHintRound))) {
    sheepSeen = true;
    try { localStorage.setItem(SHEEP_SEEN_KEY, "1"); } catch { /* fine */ }
  }
  if (sheepSeen) return false;
  sheepHintRound ??= round;
  return true;
}

// No clock after the first Ready any more (playtest: hard for older people
// and young children): the bar stays hidden, keeping its space.
export function renderTimer() {
  timer.style.visibility = "hidden";
}

// A message in the bar's second line for a moment (a square already taken).
const TELL_MS = 2500;
let telling = null; // {text, until}
const told = () => (telling && performance.now() < telling.until ? telling.text : null);
export function tellStatus(text) {
  telling = { text, until: performance.now() + TELL_MS };
  setTimeout(render, TELL_MS + 50);
  render();
  nudgeStatus();
}

// A little shake when something can't be done (a square already taken).
export function nudgeStatus() {
  statusBar.classList.remove("nudge");
  void statusBar.offsetWidth; // restart the animation
  statusBar.classList.add("nudge");
}
