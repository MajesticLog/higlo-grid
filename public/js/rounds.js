// Rounds (docs/game-design.md, v4):
// 1. Flash: 6 squares show their pictures for 4 s (3 of them the kind that
//    will be asked, a mix of others), timed in server time so every device
//    sees the same flash.
// 2. Pause: about a second; nobody can move until the grass is back.
// 3. The card: which picture to find. Everyone picks a different square
//    (sheep can help), then Ready. The round ends when everyone is ready, or
//    20 s after the first Ready.
// 4. Result: half the players (rounded up) on right, different squares earn
//    the next clue to the current memory; otherwise the night falls a step.
//    The replay (replay.js) shows each player walking and their square's
//    picture, then the grass covers it again.
import { update, runTransaction } from "./firebase.js";
import { SIZE, sessionRef, myRef, myId } from "./session.js";
import { state, rememberPosition } from "./state.js";
import { render, renderTimer, nudgeStatus } from "./render.js";
import { key, now, PICTURES, CENTRE_KEY, checkEnd, nextGuess, currentMemory, cluesOf } from "./game.js";
import { playBleat, playMunch } from "./sound.js";
import { replayActive, COUNT_MS, STEP_MS, PAUSE_MS as WALK_PAUSE_MS, SHOW_MS } from "./replay.js";

export const FLASH_SQUARES = 6;
// Of the flashed squares, how many show the kind that will be asked: what the
// family needs to succeed, plus one (2 for 1-2 players, 3 for 3-4...).
const flashTargets = (players) => Math.ceil(players / 2) + 1;
const BUSY_WAIT_MS = 30000; // the next flash waits for open windows, but not forever
export const FLASH_MS = 4000;
export const PAUSE_MS = 1200; // after the flash, before the card: nobody moves yet
const FLASH_LEAD_MS = 800; // a round's flash starts a little after it's decided, so every device has it
const RESULT_MS = 3500; // after the replay, before the next flash: the result and the clue card
const READY_WAIT_MS = 20000; // after the first Ready, how long the others have
const gameRef = sessionRef("game");

export const inReach = (x, y) => x >= 0 && y >= 0 && x < SIZE && y < SIZE;
export const myPick = () => state.game?.picks?.[myId];
export const sheepLeft = () => (state.game?.sheepUsed?.[myId] ? 0 : 1); // one per player, per game

// Where the round is, on this device's clock (server time).
export function roundPhase() {
  const game = state.game;
  if (!game || game.status !== "playing") return "over";
  if (game.guess) return "guess";
  if (game.phase !== "flash" || !game.flash) return "result";
  const t = now() - game.flash.at;
  if (t < 0) return "countdown"; // 3, 2, 1, then the flash
  if (t < FLASH_MS) return "flash";
  if (t < FLASH_MS + PAUSE_MS) return "pause";
  return "choose";
}
export const choosing = () => state.joined && roundPhase() === "choose";
export const targetPicture = () => PICTURES[state.game?.flash?.target] ?? "";

// 3, 2, 1 before a flash (server time), or null.
export function flashCountdown() {
  const game = state.game;
  if (game?.phase !== "flash" || !game.flash) return null;
  const left = Math.ceil((game.flash.at - now()) / COUNT_MS);
  return left >= 1 && left <= 3 ? left : null;
}

// Someone has a window open (rules, a clue card, the chest...): the next
// flash waits for them, unless it's been open a long time (they've wandered off).
const someoneBusy = () => state.players.some((p) => p.busy && now() - p.busy < BUSY_WAIT_MS);

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
  if (starting || !state.joined || !game || game.status !== "playing" || game.guess) return;
  if (game.phase === "flash" || now() < (game.nextRoundAt ?? 0) || replayActive()) return;
  if (!currentMemory(game)) return; // nothing to play for yet: waiting for a memory
  if (someoneBusy()) return; // nobody misses the flash behind a window
  starting = true;
  const seen = game.id;
  runTransaction(gameRef, (g) => {
    if (!g || g.id !== seen || g.status !== "playing" || g.guess || g.phase === "flash") return;
    if (now() < (g.nextRoundAt ?? 0) || !currentMemory(g) || someoneBusy()) return;
    // The kind to find: never the same twice in a row.
    const kinds = PICTURES.map((_, i) => i).filter((i) => i !== g.lastTarget);
    const target = kinds[Math.floor(Math.random() * kinds.length)];
    const squares = Object.keys(g.board);
    const shuffle = (list) => list.sort(() => Math.random() - 0.5);
    const rightCount = flashTargets(state.players.length);
    const right = shuffle(squares.filter((k) => g.board[k] === target)).slice(0, rightCount);
    const others = shuffle(squares.filter((k) => g.board[k] !== target)).slice(0, FLASH_SQUARES - rightCount);
    g.round = (g.round ?? 0) + 1;
    g.phase = "flash";
    // 3, 2, 1 first, so everyone is looking when it flashes.
    g.flash = { at: now() + FLASH_LEAD_MS + 3 * COUNT_MS, squares: shuffle([...right, ...others]), target };
    g.moves = null; // last round's moves are done
    g.picks = null;
    g.grazing = null;
    g.deadline = null;
    g.updatedAt = now();
    return g;
  }, { applyLocally: false }).finally(() => { starting = false; });
}

// --- Sheep: one per player per game, placed during the choosing phase ---
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
    if (game.sheepUsed[myId]) return false;
    game.sheepUsed[myId] = true;
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
  const from = myPick() ?? state.me;
  pickSquare(from.x + dx, from.y + dy);
}

// Ready with no pick means "the square I'm standing on".
export function ready() {
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
// Ready players go to their pick; anyone not ready stays where they are.
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
      moves[p.id] = to;
      const k = key(to.x, to.y);
      if (k !== CENTRE_KEY) chosen.add(k);
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
    };
    game.lastTarget = target;
    game.phase = "result";
    // The next flash after everyone has seen the replay and the result.
    const walks = actions.reduce((t, a) => t + a.path.length * STEP_MS + WALK_PAUSE_MS, 0);
    game.nextRoundAt = now() + 3 * COUNT_MS + walks + SHOW_MS + RESULT_MS;
    game.picks = null;
    game.grazing = null;
    game.deadline = null;
    game.updatedAt = now();
  }, { applyLocally: false }).finally(() => { resolving = false; });
}

// After a round, move my circle to where I went. Each device moves only its
// own player, so nobody writes a record for someone who has left.
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
    lastPhase = phase;
    if (phase !== "choose") sheepRound = null;
    render();
  }
  renderTimer();
  maybeResolve();
  maybeStartRound();
}, 200);

export { READY_WAIT_MS };
