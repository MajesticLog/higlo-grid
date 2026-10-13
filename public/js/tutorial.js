// The tutorial: about a minute in a little practice garden, learning by
// doing (playtest 7). Offered once on a device, after the memory step
// ("Play the tutorial" or "Join the game"), and always from ❓.
//
// It only lives on this device: nothing is saved and the family's game isn't
// touched. 🐻 Grandma plays along. While someone is in it, the others see
// "🐶 Zoé is getting ready to join…" (arriving/<tab>, announce.js). From ❓
// during a game, the player steps out of the game and comes back after.
//
// The steps: remember the golden patch, find a picture together (one square
// each), a miss and the day moving on, the sheep, someone joining and
// leaving, then the ❓, 💡 and 🧺 buttons.
import { set, remove, onDisconnect, serverTimestamp } from "./firebase.js";
import { sessionRef, myRef } from "./session.js";
import { state } from "./state.js";
import { PICTURES, spawnSquare } from "./game.js";
import { playDing, playGoodbye, playBleat, playMunch, playTwinkle, playMiss } from "./sound.js";

const SEEN_KEY = "higlo:tutorial-seen";
const SIZE = 5;
const START = { x: 2, y: 4 }; // everyone starts at the bottom, in the middle
const ZONE = { x: 1, y: 0 }; // the golden patch: columns 1-3, rows 0-2
const FLASH_MS = 4000;
const GRANDMA = { id: "grandma", name: "Grandma", animal: "🐻", color: "#8d6e63" };
const SAM = { id: "sam", name: "Sam", animal: "🐰", color: "#5c6bc0" }; // family or a friend

// The practice garden: tulips in the patch, snails outside it.
// Indices into PICTURES (game.js), as numbers: game.js may still be loading
// when this module runs, so nothing here reads it until the tutorial starts.
const [FLOWER, TULIP, SNAIL, CATERPILLAR, MUSHROOM, BIRD] = [0, 1, 2, 3, 4, 5];
const BOARD = [
  [FLOWER, TULIP, MUSHROOM, BIRD, CATERPILLAR],
  [SNAIL, CATERPILLAR, FLOWER, MUSHROOM, BIRD],
  [MUSHROOM, MUSHROOM, BIRD, TULIP, SNAIL],
  [BIRD, SNAIL, FLOWER, CATERPILLAR, FLOWER],
  [CATERPILLAR, TULIP, null, MUSHROOM, SNAIL],
];
const at = (x, y) => BOARD[y]?.[x] ?? null;
const inZone = (x, y) => x >= ZONE.x && x < ZONE.x + 3 && y >= ZONE.y && y < ZONE.y + 3;

const box = document.getElementById("tutorial");
const offer = document.getElementById("tut-offer");
const play = document.getElementById("tut-play");
const bar = document.getElementById("tut-bar");
const grid = document.getElementById("tut-grid");
const big = document.getElementById("tut-big");
const sayText = document.getElementById("tut-say");
const sayDetail = document.getElementById("tut-detail");
const target = document.getElementById("tut-target");
const sheepButton = document.getElementById("tut-sheep");
const readyButton = document.getElementById("tut-ready");
const tools = document.getElementById("tut-tools");
const doneButton = document.getElementById("tut-done");
const toasts = document.getElementById("tut-toasts"); // over the garden, not over the bar

// --- What's on the practice garden right now ---
let t = null;
const fresh = () => ({
  players: [{ ...state.me, id: "me", ...START }, { ...GRANDMA, ...START }],
  zone: null, // "pulse" | "steady" | null
  shown: new Set(), // "x_y" showing their picture
  wrong: new Set(), // shown, but not the one to find
  picks: {}, // id -> {x, y}
  grazed: new Set(),
  sheepAt: null,
  target: null,
  sheep: false, // in sheep mode
  canPick: false,
  night: 0,
});

function draw() {
  grid.replaceChildren();
  box.dataset.night = String(t.night);
  const place = (el, x, y) => { el.style.gridColumn = x + 1; el.style.gridRow = y + 1; };
  for (const k of t.grazed) {
    const el = document.createElement("div");
    el.className = "tile grass";
    place(el, ...k.split("_").map(Number));
    grid.append(el);
  }
  for (const k of t.shown) {
    const [x, y] = k.split("_").map(Number);
    const el = document.createElement("div");
    el.className = `card${t.wrong.has(k) ? " wrong" : ""}`;
    place(el, x, y);
    const icon = document.createElement("span");
    icon.className = "icon";
    icon.textContent = PICTURES[at(x, y)];
    el.append(icon);
    grid.append(el);
  }
  if (t.zone) {
    const el = document.createElement("div");
    el.className = `zone ${t.zone}`;
    el.style.gridColumn = `${ZONE.x + 1} / span 3`;
    el.style.gridRow = `${ZONE.y + 1} / span 3`;
    grid.append(el);
  }
  for (const [id, p] of Object.entries(t.picks)) {
    const who = t.players.find((q) => q.id === id);
    const el = document.createElement("div");
    el.className = `pick ${id === "me" ? "mine" : "other"}${p.ready ? " ready" : ""}`;
    place(el, p.x, p.y);
    el.style.setProperty("--c", who.color);
    el.append(animal(who.animal));
    if (id === "me") {
      const you = document.createElement("span");
      you.className = "you";
      you.textContent = "You";
      el.append(you);
    }
    grid.append(el);
  }
  if (t.sheepAt) {
    const el = document.createElement("div");
    el.className = "sheep-sitting";
    place(el, t.sheepAt.x, t.sheepAt.y);
    const icon = document.createElement("span");
    icon.className = "icon";
    icon.textContent = "🐑";
    el.append(icon);
    grid.append(el);
  }
  const squares = new Map();
  for (const p of t.players) {
    const k = `${p.x}_${p.y}`;
    if (!squares.has(k)) squares.set(k, []);
    squares.get(k).push(p);
  }
  for (const [k, group] of squares) {
    const square = document.createElement("div");
    square.className = "square";
    place(square, ...k.split("_").map(Number));
    square.style.setProperty("--cols", Math.ceil(Math.sqrt(group.length)));
    for (const p of group) {
      const el = document.createElement("div");
      el.className = `circle${p.id === "me" ? " me" : ""}`;
      el.style.background = p.color;
      el.append(animal(p.animal));
      square.append(el);
    }
    grid.append(square);
  }
  // Taps: one invisible button per square, on top.
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const el = document.createElement("div");
      el.className = "tut-hit";
      place(el, x, y);
      el.addEventListener("click", () => tapped(x, y));
      grid.append(el);
    }
  }
  target.hidden = !t.target;
  target.textContent = t.target ?? "";
  sheepButton.setAttribute("aria-pressed", String(t.sheep));
}

const animal = (icon) => {
  const el = document.createElement("span");
  el.className = "animal";
  el.textContent = icon ?? "";
  return el;
};

function say(text, detail = "") {
  sayText.textContent = text;
  sayDetail.textContent = detail;
}

function nudge() {
  bar.classList.remove("nudge");
  void bar.offsetWidth;
  bar.classList.add("nudge");
}

// The big word over the garden ("Ready?", "Find a 🌷!").
function shout(text, ms) {
  big.textContent = text;
  big.hidden = false;
  big.style.animation = "none";
  void big.offsetWidth;
  big.style.animation = `ready-pop ${ms}ms ease-out both`;
}

// --- Waiting for time, or for the player ---
let run = 0; // bumps on skip: every pending step stops
class Stopped extends Error {}
const wait = (ms) => {
  const mine = run;
  return new Promise((resolve, reject) => setTimeout(() => (mine === run ? resolve() : reject(new Stopped())), ms));
};
let waiting = null; // {resolve, reject}: the step waiting for a tap
const until = () => new Promise((resolve, reject) => { waiting = { resolve, reject }; });
const go = (value) => { const w = waiting; waiting = null; w?.resolve(value); };

// --- Taps ---
let onSquare = null; // what a tap on a square does in this step

function tapped(x, y) {
  if (onSquare) onSquare(x, y);
}

sheepButton.addEventListener("click", () => {
  if (sheepButton.hidden || sheepButton.disabled) return;
  t.sheep = !t.sheep;
  if (t.sheep) playBleat();
  say(t.sheep ? "🐑 Where should your sheep graze?" : `Find a ${t.target}`,
    t.sheep ? "Tap a square: it eats the grass all around it" : "");
  draw();
});
readyButton.addEventListener("click", () => {
  if (!t.picks.me) {
    nudge();
    return say(sayText.textContent, "Pick a square first");
  }
  go("ready");
});

// Choosing a square: one each, never Grandma's.
function pickHere(x, y) {
  const taken = Object.entries(t.picks).find(([id, p]) => id !== "me" && p.x === x && p.y === y);
  if (taken) {
    nudge();
    say(sayText.textContent, `${GRANDMA.animal} Grandma is on that square: one each!`);
    return;
  }
  if (x === START.x && y === START.y) return nudge(); // nothing hides there
  stopReminding();
  t.picks.me = { x, y };
  readyButton.disabled = false;
  draw();
}

// The golden patch showing its pictures, or not.
function showPatch(on) {
  for (let y = ZONE.y; y < ZONE.y + 3; y++) {
    for (let x = ZONE.x; x < ZONE.x + 3; x++) t.shown[on ? "add" : "delete"](`${x}_${y}`);
  }
  t.zone = on ? "steady" : null;
  draw();
}

// While I haven't picked a square: the patch glows and shows again, slowly,
// on a loop, so nobody is stuck for having missed it.
async function remindPatch() {
  t.remind = true;
  while (t.remind) {
    await wait(3500);
    if (!t.remind) break;
    t.zone = "pulse";
    draw();
    await wait(1200);
    if (!t.remind) break;
    showPatch(true);
    await wait(FLASH_MS);
    if (t.remind) showPatch(false);
  }
}
const stopReminding = () => {
  if (!t.remind) return;
  t.remind = false;
  showPatch(false);
};

// Everyone walks to their square; the pictures show. Returns: found?
async function reveal(needed) {
  stopReminding();
  readyButton.hidden = true;
  sheepButton.hidden = true;
  onSquare = null;
  t.sheep = false;
  for (const p of t.players) Object.assign(p, t.picks[p.id] ?? {});
  t.picks = {};
  let found = 0;
  for (const p of t.players) {
    const k = `${p.x}_${p.y}`;
    t.shown.add(k);
    if (PICTURES[at(p.x, p.y)] === t.target) found += 1;
    else t.wrong.add(k);
  }
  draw();
  (found >= needed ? playTwinkle : playMiss)(); // heard as well as seen
  await wait(1600);
  return found >= needed;
}

// Back to the start, grass everywhere.
function reset() {
  for (const p of t.players) Object.assign(p, START);
  t.shown.clear();
  t.wrong.clear();
  t.grazed.clear();
  t.sheepAt = null;
  t.target = null;
  t.picks = {};
  draw();
}

// A round's choosing: the card, Grandma's pick, mine, then Ready.
// Grandma goes to grandmaAt, or to her second choice if I'm already there.
async function choose(picture, [grandmaAt, grandmaElse] = [], line = "") {
  t.target = picture;
  say(`Find a ${picture} together`, line);
  readyButton.hidden = false;
  readyButton.disabled = true;
  onSquare = pickHere; // taps count straight away
  const chosen = until();
  chosen.catch(() => { /* skipped: the step below stops too */ });
  draw();
  if (grandmaAt) {
    await wait(1200);
    const mine = t.picks.me;
    const spot = mine && mine.x === grandmaAt.x && mine.y === grandmaAt.y ? grandmaElse : grandmaAt;
    t.picks.grandma = { ...spot, ready: true };
    draw();
  }
  await chosen;
}

// --- The script ---
async function lesson() {
  t = fresh();
  tools.hidden = true;
  doneButton.hidden = true;
  readyButton.hidden = true;
  sheepButton.hidden = true;
  big.hidden = true;
  say("This is your family's garden", `You're the ${state.me.animal ?? "🙂"}, with ${GRANDMA.animal} Grandma`);
  draw();
  await wait(2500);

  // 1. The golden patch.
  t.zone = "pulse";
  say("👀 Look at the golden patch!");
  draw();
  shout("Ready?", 1600);
  await wait(1800);
  t.zone = "steady";
  showPatch(true);
  say("👀 Remember the pictures, together", "They hide again in a moment");
  await wait(FLASH_MS);
  t.zone = null;
  t.shown.clear();
  draw();
  await wait(500);

  // 2. Find it together: one square each. Until I pick, the patch shows
  // again every few seconds.
  const finding = choose(PICTURES[TULIP], [{ x: 3, y: 2 }, { x: 1, y: 0 }],
    `Tap where you saw one, then ✓ Ready. One square each: ${GRANDMA.animal} Grandma takes one too`);
  remindPatch().catch(() => { /* skipped */ });
  await finding;
  await reveal(1);
  say("✅ Found together! You earn a clue", "With 2 players, 1 is enough. With 4, you'd need 2");
  shout("🔍 Clue 1 of 3", 1800);
  await wait(2800);
  reset();

  // 3. A miss: the day moves on.
  await choose(PICTURES[SNAIL], [{ x: 2, y: 2 }, { x: 3, y: 3 }], "There wasn't one in the patch… pick any square, then ✓ Ready");
  const lucky = await reveal(1);
  t.night = 1;
  draw();
  say(lucky ? "🍀 Lucky! But usually, a miss moves the day on" : "🌙 Missed… the day moves on",
    "Each miss brings the night closer. At night, the 🐺 sends everyone to bed!");
  await wait(4000);
  reset();

  // 4. The sheep.
  await (async () => {
    t.target = PICTURES[SNAIL];
    say(`Find a ${t.target} again`, "Not sure? Tap 🐑, then a square");
    sheepButton.hidden = false;
    sheepButton.classList.add("hint");
    draw();
    // The sheep first: it eats the grass where there's no snail.
    await new Promise((resolve, reject) => {
      waiting = { resolve, reject };
      onSquare = (x, y) => {
        if (!t.sheep) return nudge();
        t.sheep = false;
        t.sheepAt = { x, y };
        t.grazed.clear();
        let snails = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const k = at(x + dx, y + dy);
            if (k === null) continue;
            if (k === SNAIL) snails += 1;
            else t.grazed.add(`${x + dx}_${y + dy}`);
          }
        }
        playMunch();
        sheepButton.classList.remove("hint");
        if (snails === 0) {
          say("No 🐌 around here!", "Tap 🐑 and try another spot (in the game: one sheep for each memory)");
          draw();
          return;
        }
        draw();
        go();
      };
    });
    sheepButton.hidden = true;
    say(`The grass still tall hides a ${t.target}`, "Tap it, then ✓ Ready");
    readyButton.hidden = false;
    readyButton.disabled = true;
    onSquare = (x, y) => { t.sheepAt = null; pickHere(x, y); };
    await until();
  })();
  t.picks.grandma = { x: 3, y: 3, ready: true };
  const found = await reveal(1);
  say(found ? "✅ Found it, thanks to your sheep!" : "Nearly! The sheep shows where to look",
    "You get one sheep for each memory");
  await wait(3000);
  reset();

  // 5. Someone joins, someone leaves.
  t.players.push({ ...SAM, ...START });
  toast(`${SAM.animal} ${SAM.name} has joined the game!`, SAM.color, "join");
  playDing();
  say("Other players can join at any time…");
  draw();
  await wait(2800);
  t.players = t.players.filter((p) => p.id !== SAM.id);
  toast(`👋 ${SAM.animal} ${SAM.name} has left the game`, SAM.color, "leave");
  playGoodbye();
  say("…and leave at any time", "The game carries on with whoever is there");
  draw();
  await wait(2800);

  // 6. The buttons.
  tools.hidden = false;
  const lines = {
    "tut-help": ["❓ How to play", "The rules, and this tutorial, any time"],
    "tut-bulb": ["💡 Clues found", "Think you know the memory already? Tap \"Ready to guess!\""],
    "tut-chest": ["🧺 The memory chest", "Every memory you find goes in here"],
  };
  const left = new Set(Object.keys(lines));
  for (const id of left) document.getElementById(id).classList.add("glow");
  say("Last thing: tap each button", "❓  💡  🧺");
  await new Promise((resolve, reject) => {
    waiting = { resolve, reject };
    tools.onclick = (e) => {
      const button = e.target.closest("button");
      if (!button || !lines[button.id]) return;
      button.classList.remove("glow");
      left.delete(button.id);
      say(...lines[button.id]);
      if (left.size === 0) setTimeout(go, 2200);
    };
  });
  tools.onclick = null;

  say("You're ready! 🌱", "Remember together, one square each, and have fun!");
  doneButton.hidden = false;
  doneButton.focus();
  await until();
}

function toast(text, color, kind) {
  const el = document.createElement("div");
  el.className = `toast ${kind}`;
  el.style.setProperty("--c", color);
  el.textContent = text;
  toasts.append(el);
  setTimeout(() => el.remove(), 6000);
}

// --- Telling the others ---
const arrivingRef = () => sessionRef(`arriving/${state.me.tab}`);
function arriving(on) {
  if (!state.me.tab) return;
  if (on) {
    onDisconnect(arrivingRef()).remove();
    set(arrivingRef(), { name: state.me.name ?? "", animal: state.me.animal ?? "", color: state.me.color ?? "", at: serverTimestamp() });
  } else {
    onDisconnect(arrivingRef()).cancel();
    remove(arrivingRef());
  }
}

// --- Opening and closing ---
let finish = null;

async function start() {
  offer.hidden = true;
  play.hidden = false;
  try {
    await lesson();
  } catch (e) {
    if (!(e instanceof Stopped)) throw e;
  }
}

function close() {
  run += 1; // stops any step still waiting
  waiting?.reject(new Stopped());
  waiting = null;
  onSquare = null;
  box.hidden = true;
  try { localStorage.setItem(SEEN_KEY, "1"); } catch { /* fine */ }
  const done = finish;
  finish = null;
  done?.();
}

document.getElementById("tut-start").addEventListener("click", () => start().then(close));
document.getElementById("tut-join").addEventListener("click", close);
document.getElementById("tut-skip").addEventListener("click", close);
doneButton.addEventListener("click", () => go());

// After the memory step, on a device that hasn't seen it: "Play the tutorial"
// or "Join the game". Resolves when they're ready to join.
export function offerTutorial() {
  let seen = false;
  try { seen = Boolean(localStorage.getItem(SEEN_KEY)); } catch { /* offer it */ }
  if (seen) return Promise.resolve();
  return new Promise((resolve) => {
    arriving(true);
    finish = () => { arriving(false); resolve(); };
    offer.hidden = false;
    play.hidden = true;
    box.hidden = false;
    document.getElementById("tut-start").focus();
  });
}

// From ❓: straight into it. During a game, I step out of the garden (the
// others carry on) and come back to the middle when it's done.
export function playTutorial() {
  if (!box.hidden) return;
  const inGame = state.joined;
  arriving(true);
  if (inGame) remove(myRef);
  finish = () => {
    arriving(false);
    if (inGame) {
      Object.assign(state.me, spawnSquare());
      set(myRef, state.me);
    }
  };
  box.hidden = false;
  start().then(close);
}
