// Rounds (docs/game-design.md, v4):
// 1. Flash: a 3 x 3 zone of the garden glows gold while "Ready?" pops up and
//    fades; then its squares show their pictures for 5 s, timed in server time
//    so every device sees the same flash; then the grass covers them again.
// 2. Pause: about a second; nobody can move until the grass is back.
// 3. The card: which picture to find. Everyone picks a different square
//    (sheep can help), then Ready. The round ends when everyone is ready, or
//    20 s after the first Ready.
// 4. Result: half the players (rounded up) on right, different squares earn
//    the next clue to the current memory; otherwise the night falls a step,
//    and the zone shows its pictures again.
//    The replay (replay.js) shows each player walking and their square's
//    picture, then the grass covers it again, and everyone walks back to the
//    middle of the garden for the next round.
import { update, runTransaction } from "./firebase.js";
import { SIZE, sizeFor, sessionRef, myRef, myId } from "./session.js";
import { state, rememberPosition } from "./state.js";
import { render, renderTimer, nudgeStatus } from "./render.js";
import {
  key, now, PICTURES, newBoard, spawnSquare, middleSquares, checkEnd, nextGuess, currentMemory, cluesOf, nightFor,
} from "./game.js";
import { playBleat, playMunch } from "./sound.js";
import { replayActive, COUNT_MS, STEP_MS, PAUSE_MS as WALK_PAUSE_MS, SHOW_MS, MISSED_MS } from "./replay.js";

const BUSY_WAIT_MS = 30000; // the next flash waits for open windows, but not forever
export const ZONE = 3; // the flash shows a ZONE x ZONE area of the garden
export const READY_MS = 1600; // the zone glows and "Ready?" pops up, then fades out
const READY_GAP_MS = 250; // after "Ready?" has gone, before the flash: nothing in the way
export const FLASH_MS = 5000; // the zone shows its pictures
export const PAUSE_MS = 1200; // after the flash, before the card: nobody moves yet
const FLASH_LEAD_MS = 800; // a round's flash starts a little after it's decided, so every device has it
const RESULT_MS = 3500; // after the replay, before the next flash: the result and the clue card
const READY_WAIT_MS = 20000; // after the first Ready, how long the others have
const gameRef = sessionRef("game");

export const inReach = (x, y) => x >= 0 && y >= 0 && x < SIZE && y < SIZE;
export const myPick = () => state.game?.picks?.[myId];
// One sheep per player for each memory: sheepUsed[playerId] is the memory it was
// used for, so it's back as soon as the game plays for another one, however it
// got there (playtest 7: it didn't come back). From before: true.
export const sheepLeft = () => (state.game?.sheepUsed?.[myId] === currentMemory(state.game) ? 0 : 1);

// Where the round is, on this device's clock (server time).
export function roundPhase() {
  const game = state.game;
  if (!game || game.status !== "playing") return "over";
  if (game.paused) return "paused"; // nothing moves (pause.js)
  if (game.started === false) return "waiting"; // before "Ready to play" (older games: started)
  if (game.guess) return "guess";
  if (game.between) return "between"; // "Ready for the next memory?"
  if (game.phase !== "flash" || !game.flash) return "result";
  const t = now() - game.flash.at;
  if (t < 0) return "countdown"; // the zone glows, "Ready?", then the flash
  if (t < FLASH_MS) return "flash";
  if (t < FLASH_MS + PAUSE_MS) return "pause";
  return "choose";
}
export const choosing = () => state.joined && roundPhase() === "choose";
export const targetPicture = () => PICTURES[state.game?.flash?.target] ?? "";

// When a round's flash starts if it's decided now: the zone glows and
// "Ready?" shows first. Resuming a pause before the card starts it over too
// (pause.js, playtest 6: everyone missed the flash).
export const flashStartsAt = () => now() + FLASH_LEAD_MS + READY_MS + READY_GAP_MS;
export const flashNotOver = (game, at) => game.phase === "flash" && game.flash && at < game.flash.at + FLASH_MS + PAUSE_MS;

// "Ready?" before a flash: how long it has been showing (server time), or
// null. It's gone READY_GAP_MS before the flash, so it never hides a picture.
export function flashReady() {
  const game = state.game;
  if (game?.phase !== "flash" || !game.flash || game.paused) return null;
  const shown = now() - (game.flash.at - READY_GAP_MS - READY_MS);
  return shown >= 0 && shown < READY_MS ? shown : null;
}

// The squares of a zone {x, y} that hide a picture (the middle one doesn't).
// A round from before zones: the whole garden.
export function zoneSquares(game, zone) {
  const all = Object.keys(game?.board ?? {});
  if (!zone) return all;
  return all.filter((k) => {
    const [x, y] = k.split("_").map(Number);
    return x >= zone.x && x < zone.x + ZONE && y >= zone.y && y < zone.y + ZONE;
  });
}

// Where the flash looks this round, and the picture to find. The zone holds
// enough of that picture for the family to find it, plus one, when the garden
// allows (docs/recommendations.md); otherwise as many as it can. Never the
// same zone, nor the same picture, twice in a row, and never around the
// middle, where everyone stands while it flashes.
function pickZone(game, needed) {
  const size = game.size ?? SIZE;
  const middle = middleSquares(size);
  const options = [];
  for (let y = 0; y + ZONE <= size; y++) {
    for (let x = 0; x + ZONE <= size; x++) {
      if (game.lastZone === key(x, y)) continue;
      if (middle.some((m) => m.x >= x && m.x < x + ZONE && m.y >= y && m.y < y + ZONE)) continue;
      const counts = new Map();
      for (const k of zoneSquares(game, { x, y })) counts.set(game.board[k], (counts.get(game.board[k]) ?? 0) + 1);
      for (const [kind, count] of counts) {
        if (kind !== game.lastTarget) options.push({ zone: { x, y }, target: kind, count });
      }
    }
  }
  for (const want of [needed + 1, needed, 1]) {
    const fit = options.filter((o) => o.count >= want);
    if (fit.length) return fit[Math.floor(Math.random() * fit.length)];
  }
  return null;
}

// Someone has a window open (rules, the chest...): the next flash waits for
// them, unless it's been open a long time (they've wandered off). A clue card
// and the result of a guess (with its notes) it waits for until closed.
export const someoneReading = () => state.players.some((p) => p.reading);
const someoneBusy = () => someoneReading()
  || state.players.some((p) => p.busy && now() - p.busy < BUSY_WAIT_MS);

// Every change to a round goes through a transaction on the game, tied to
// the game and round I'm looking at, so a late tap can never land in the
// next round or the next game. `edit` returns false to abort.
function changeRound(edit, options) {
  const seen = state.game;
  if (!seen) return Promise.resolve();
  return runTransaction(gameRef, (game) => {
    if (!game || game.id !== seen.id || game.round !== seen.round || game.status !== "playing" || game.guess) return;
    if (game.phase !== "flash") return;
    game.picks ??= {};
    return edit(game) === false ? undefined : game;
  }, options);
}

// --- Starting a round: any device, once the last one's result has been seen ---
let starting = false;

export function maybeStartRound() {
  const game = state.game;
  if (starting || !state.joined || !game || game.status !== "playing" || game.guess || game.paused) return;
  if (game.started === false) return maybeStartGame();
  if (game.between) return maybeEndBetween();
  if (game.phase === "flash" || now() < (game.nextRoundAt ?? 0) || replayActive()) return;
  if (!currentMemory(game)) return; // nothing to play for yet: waiting for a memory
  if (someoneBusy()) return; // nobody misses the flash behind a window
  starting = true;
  const seen = game.id;
  runTransaction(gameRef, (g) => {
    if (!g || g.id !== seen || g.status !== "playing" || g.guess || g.paused || g.phase === "flash") return;
    if (now() < (g.nextRoundAt ?? 0) || !currentMemory(g) || someoneBusy()) return;
    const pick = pickZone(g, Math.ceil(state.players.length / 2));
    if (!pick) return;
    // Someone joined: more misses before the wolf. Never fewer (someone left).
    g.nightSteps = Math.max(g.nightSteps ?? 0, nightFor(state.players.length));
    g.round = (g.round ?? 0) + 1;
    g.phase = "flash";
    // The zone glows and "Ready?" shows first, so everyone is looking when it flashes.
    g.flash = { at: flashStartsAt(), target: pick.target, zone: pick.zone };
    g.lastZone = key(pick.zone.x, pick.zone.y);
    g.moves = null; // last round's moves are done
    g.picks = null;
    g.grazing = null;
    g.deadline = null;
    g.updatedAt = now();
    return g;
  }, { applyLocally: false }).finally(() => { starting = false; });
}

// --- Before the first round: "Ready to play?" ---
// Everyone can walk around freely and read the rules (❓). The first round
// starts once everyone in the garden is ready, or a minute after the first
// one is (so someone who wandered off can't hold everyone up). The board is
// drawn then, at the size for the family there; it stays all game.
const START_WAIT_MS = 60000;

function walkFreely(x, y) {
  if (!inReach(x, y)) return;
  state.me.x = x;
  state.me.y = y;
  update(myRef, { x, y }); // the circle walks there (render.js)
  rememberPosition();
  render();
}

// Back to the middle (Ready, or the first round starting): everyone starts
// the game together there (playtest 6).
function backToMiddle() {
  if (middleSquares(SIZE).some((m) => m.x === state.me.x && m.y === state.me.y)) return;
  const { x, y } = spawnSquare();
  walkFreely(x, y);
}

function readyToPlay() {
  backToMiddle();
  const seen = state.game?.id;
  runTransaction(gameRef, (game) => {
    if (!game || game.id !== seen || game.started !== false) return;
    game.playReady ??= {};
    game.playReady[myId] = true;
    game.firstReadyAt ??= now();
    return game;
  });
}

let startingGame = false;
function maybeStartGame() {
  const game = state.game;
  const everyone = (g) => state.players.length > 0 && state.players.every((p) => g.playReady?.[p.id]);
  const due = (g) => everyone(g) || (g.firstReadyAt && now() - g.firstReadyAt > START_WAIT_MS);
  if (startingGame || !due(game)) return;
  startingGame = true;
  runTransaction(gameRef, (g) => {
    if (!g || g.id !== game.id || g.started !== false || !due(g)) return;
    g.started = true;
    g.size = sizeFor(state.players.length);
    g.board = newBoard(g.size);
    g.nightSteps = nightFor(state.players.length);
    g.nextRoundAt = now() + 1000;
    g.updatedAt = now();
    return g;
  }, { applyLocally: false }).finally(() => { startingGame = false; }); // a random board: only the server's
}

// --- Between two memories: "Ready for the next memory?" ---
// Like "Ready to play": the next round starts once everyone here is ready,
// or a minute after the first one is. (Everyone's sheep is back: sheepLeft.)
function readyForNext() {
  const seen = state.game?.id;
  runTransaction(gameRef, (game) => {
    if (!game || game.id !== seen || !game.between) return;
    game.between.ready ??= {};
    game.between.ready[myId] = true;
    game.between.firstReadyAt ??= now();
    return game;
  });
}

let endingBetween = false;
function maybeEndBetween() {
  const game = state.game;
  const everyone = (g) => state.players.length > 0 && state.players.every((p) => g.between.ready?.[p.id]);
  const due = (g) => everyone(g) || (g.between.firstReadyAt && now() - g.between.firstReadyAt > START_WAIT_MS);
  if (endingBetween || !due(game)) return;
  endingBetween = true;
  runTransaction(gameRef, (g) => {
    if (!g || g.id !== game.id || !g.between || !due(g)) return;
    g.between = null;
    g.nextRoundAt = now() + 1000;
    g.updatedAt = now();
    return g;
  }).finally(() => { endingBetween = false; });
}

// --- Sheep: one per player per memory, placed during the choosing phase ---
let sheepRound = null; // the round in which I tapped 🐑, or null
export const inSheepMode = () => sheepRound !== null && sheepRound === state.game?.round;

function toggleSheep() {
  if (!choosing() || myPick()?.ready) return;
  if (!inSheepMode() && sheepLeft() <= 0) return nudgeStatus();
  sheepRound = inSheepMode() ? null : state.game.round;
  if (inSheepMode()) playBleat(); // "bêêê", here I come
  render();
}

document.getElementById("sheep").addEventListener("click", toggleSheep);

// The sheep grazes the 3x3 around it: those squares that don't hide this
// round's picture show short grass until the end of the round.
function placeSheep(x, y) {
  sheepRound = null;
  changeRound((game) => {
    game.sheepUsed ??= {};
    const memory = currentMemory(game);
    if (game.sheepUsed[myId] === memory) return false;
    game.sheepUsed[myId] = memory;
    game.grazing ??= {};
    game.grazing[myId] = key(x, y);
  });
  playMunch();
  render();
}

export function grazedSquares(game = state.game) {
  const out = new Set();
  for (const k of Object.values(game?.grazing ?? {})) {
    const [cx, cy] = k.split("_").map(Number);
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const sq = key(cx + dx, cy + dy);
        if (game.board[sq] !== undefined && game.board[sq] !== game.flash?.target) out.add(sq);
      }
    }
  }
  return out;
}

// --- Choosing a square ---
// Tap a square (or move with the arrows): that's my pick, not ready yet. No
// two players can pick the same square.
export function pickSquare(x, y) {
  if (state.joined && roundPhase() === "waiting") {
    if (state.game.playReady?.[myId]) return nudgeStatus(); // ready: waiting in the middle
    return walkFreely(x, y);
  }
  if (!choosing()) return;
  if (!inReach(x, y)) return nudgeStatus();
  if (inSheepMode()) return placeSheep(x, y);
  const k = key(x, y);
  const taken = (game) => Object.entries(game.picks ?? {}).some(([id, p]) => id !== myId && key(p.x, p.y) === k);
  if (taken(state.game)) return nudgeStatus();
  changeRound((game) => {
    if (taken(game)) return false;
    game.picks[myId] = { x, y, ready: false };
  });
}

export function movePick(dx, dy) {
  const from = roundPhase() === "waiting" ? state.me : (myPick() ?? state.me);
  pickSquare(from.x + dx, from.y + dy);
}

// Ready with no pick means "the square I'm standing on".
export function ready() {
  if (state.joined && roundPhase() === "waiting") return readyToPlay();
  if (state.joined && roundPhase() === "between") return readyForNext();
  if (!choosing()) return;
  if (inSheepMode()) sheepRound = null;
  changeRound((game) => {
    const pick = game.picks[myId] ?? { x: state.me.x, y: state.me.y };
    game.picks[myId] = { x: pick.x, y: pick.y, ready: true };
    game.deadline ??= now() + READY_WAIT_MS; // the first Ready starts the clock
  });
}

document.getElementById("ready").addEventListener("click", ready);

// --- Ending a round ---
function roundOver(game) {
  if (game.phase !== "flash" || !game.flash || now() < game.flash.at + FLASH_MS + PAUSE_MS) return false;
  const picks = game.picks ?? {};
  const allReady = state.players.length > 0 && state.players.every((p) => picks[p.id]?.ready);
  return allReady || (game.deadline != null && now() >= game.deadline);
}

// The squares a player walks through on the way, along the same staircase
// path their circle is drawn walking.
export function pathBetween(from, to) {
  const squares = [];
  let { x, y } = from;
  while (x !== to.x || y !== to.y) {
    const dx = to.x - x;
    const dy = to.y - y;
    if (Math.abs(dx) >= Math.abs(dy)) x += Math.sign(dx);
    else y += Math.sign(dy);
    squares.push(key(x, y));
  }
  return squares.slice(0, -1);
}

// Any device can end the round; the transaction makes sure it happens once.
// In the replay, ready players go to their pick (anyone not ready stays where
// they are); then everyone walks back to the middle, where no picture hides.
let resolving = false;

export function maybeResolve() {
  if (resolving || !choosing() || !roundOver(state.game)) return;
  resolving = true;
  changeRound((game) => {
    if (!roundOver(game)) return false;
    const target = game.flash.target;
    const moves = {};
    const actions = []; // the order the replay plays things in (replay.js)
    const chosen = new Set();
    for (const p of state.players) {
      const pick = game.picks[p.id];
      const to = pick?.ready ? { x: pick.x, y: pick.y } : { x: p.x, y: p.y };
      moves[p.id] = spawnSquare(); // after the replay: back to the middle
      const k = key(to.x, to.y);
      chosen.add(k);
      actions.push({ kind: "walk", player: p.id, from: { x: p.x, y: p.y }, path: [...pathBetween(p, to), k] });
    }
    // Found: half the players, rounded up, on right squares, all different.
    const found = [...chosen].filter((k) => game.board[k] === target).length;
    const needed = Math.ceil(state.players.length / 2);
    const success = found >= needed;
    const memory = currentMemory(game);
    game.clues ??= {};
    if (success && memory) game.clues[memory] = cluesOf(game, memory) + 1;
    else if (!success) game.night = (game.night ?? 0) + 1;
    nextGuess(game); // all three clues: guess it first
    checkEnd(game);
    game.moves = moves; // each device moves its own player (see applyMyMove)
    game.replay = {
      tag: `${game.id}:${game.round}`,
      actions,
      success,
      found,
      needed,
      target,
      memory: success ? memory : null,
      clue: success && memory ? cluesOf(game, memory) - 1 : null, // which clue was just earned (0, 1, 2)
      zone: game.flash.zone ?? null,
      // A miss: the whole zone shows its pictures again at the end of the
      // replay, to help the family remember it.
      missed: success ? null : zoneSquares(game, game.flash.zone),
    };
    game.lastTarget = target;
    game.phase = "result";
    // The next flash after everyone has seen the replay and the result.
    const walks = actions.reduce((t, a) => t + a.path.length * STEP_MS + WALK_PAUSE_MS, 0);
    game.nextRoundAt = now() + 3 * COUNT_MS + walks + (success ? SHOW_MS : MISSED_MS) + RESULT_MS;
    game.picks = null;
    game.grazing = null;
    game.deadline = null;
    game.updatedAt = now();
  }, { applyLocally: false }).finally(() => { resolving = false; });
}

// After a round, move my circle back to the middle (the replay draws the walk
// to my square first, render.js then walks me back). Each device moves only
// its own player, so nobody writes a record for someone who has left.
let movedFor = null;

export function applyMyMove() {
  const game = state.game;
  const to = game?.moves?.[myId];
  const tag = game?.replay?.tag; // one per round result
  if (!to || !tag || movedFor === tag) return;
  movedFor = tag;
  if (to.x === state.me.x && to.y === state.me.y) return;
  state.me.x = to.x;
  state.me.y = to.y;
  update(myRef, { x: to.x, y: to.y });
  rememberPosition();
}

// The clock: redraw when the round changes step (flash, pause, card), keep
// the timer bar moving, and check whether a round should end or begin.
let lastPhase = null;
setInterval(() => {
  const phase = roundPhase();
  if (phase !== lastPhase) {
    const was = lastPhase;
    lastPhase = phase;
    if (phase !== "choose") sheepRound = null;
    if (was === "waiting" && phase !== "paused" && state.joined) backToMiddle(); // the game started without my Ready
    render();
  }
  renderTimer();
  maybeResolve();
  maybeStartRound();
}, 200);

export { READY_WAIT_MS };
