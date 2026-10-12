// Rounds: everyone picks a square anywhere on the field at the same time and taps
// Ready. When all are ready, or 20 seconds after the first Ready (so one
// player who stepped away can't stall the game), every picked square turns
// over at once. Others see which squares are picked, never by whom.
// Instead of turning over a square, a player can send one of their sheep
// to graze a line of five squares.
import { update, runTransaction } from "./firebase.js";
import { SIZE, sessionRef, myRef, myId } from "./session.js";
import { state, rememberPosition } from "./state.js";
import { render, renderTimer, nudgeStatus } from "./render.js";
import { key, now, revealSquare, checkEnd, nextGuess } from "./game.js";
import { playBleat } from "./sound.js";
import { replayActive } from "./replay.js";
import { isAuthor } from "./guess.js";

export const SHEEP_PER_PLAYER = 3; // per game
export const SHEEP_LENGTH = 5; // squares a sheep grazes; keep in sync with the graze animation in style.css
const READY_WAIT_MS = 20000; // after the first Ready, how long the others have
const gameRef = sessionRef("game");

// Players can go anywhere on the field: the walk itself is the risk.
export const inReach = (x, y) => x >= 0 && y >= 0 && x < SIZE && y < SIZE;
// Rounds pause while a memory is being guessed.
export const choosing = () => state.joined && state.game?.status === "playing" && !state.game.guess;
export const myPick = () => state.game?.picks?.[myId];
export const sheepLeft = () => SHEEP_PER_PLAYER - (state.game?.sheepUsed?.[myId] ?? 0);

// A sheep's line: the tapped square and the next four in its direction.
// Tapping the 🐑 square again turns it: up, right, down, left. Near an edge
// the line shifts back so it stays on the field. ("h" and "v" are the two
// directions from before, kept for games already in progress.)
const STEPS = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0], h: [1, 0], v: [0, 1] };
const TURN = { up: "right", right: "down", down: "left", left: "up", h: "down", v: "left" };
export const FIRST_DIRECTION = "up";

export function sheepLine(x, y, dir) {
  const [dx, dy] = STEPS[dir] ?? STEPS.up;
  const shift = (start, step) => {
    const end = start + (SHEEP_LENGTH - 1) * step;
    if (end < 0) return start - end;
    if (end > SIZE - 1) return start - (end - (SIZE - 1));
    return start;
  };
  const sx = shift(x, dx);
  const sy = shift(y, dy);
  return Array.from({ length: SHEEP_LENGTH }, (_, i) => [sx + i * dx, sy + i * dy]); // in the order the sheep walks
}

// Every change to a round goes through a transaction on the game, tied to
// the game and round I'm looking at, so a late tap can never land in the
// next round or the next game. `edit` returns false to abort.
// Taps show at once (applied locally). Anything random (ending a round)
// passes { applyLocally: false }: the device waits for the server, so it
// never shows its own flowers if another device's version wins.
function changeRound(edit, options) {
  const seen = state.game;
  if (!seen) return Promise.resolve();
  return runTransaction(gameRef, (game) => {
    if (!game || game.id !== seen.id || game.round !== seen.round || game.status !== "playing" || game.guess) return;
    game.picks ??= {};
    game.revealed ??= {};
    game.board ??= {};
    return edit(game) === false ? undefined : game;
  }, options);
}

// --- Sheep mode: on this device only, until the round ends ---
let sheepRound = null; // the round in which I tapped 🐑, or null
export const inSheepMode = () => sheepRound !== null && sheepRound === state.game?.round;

function toggleSheep() {
  if (!choosing() || replayActive() || myPick()?.ready) return;
  if (!inSheepMode() && sheepLeft() <= 0) return nudgeStatus();
  sheepRound = inSheepMode() ? null : state.game.round;
  if (inSheepMode()) playBleat(); // "bêêê", here I come
  // Switching between a sheep and a square: start the pick afresh.
  changeRound((game) => {
    if (!game.picks[myId]) return false;
    delete game.picks[myId];
  });
  render();
}

document.getElementById("sheep").addEventListener("click", toggleSheep);

// Tap a square (or move with the arrows): that's my pick, not ready yet.
// In sheep mode, it places the sheep's line; tapping the same square again
// turns it to the next direction (up, right, down, left).
export function pickSquare(x, y) {
  if (!choosing() || replayActive()) return; // watch the replay first
  if (!inReach(x, y)) return nudgeStatus();
  if (inSheepMode()) {
    const pick = myPick();
    const turn = pick?.sheep && pick.x === x && pick.y === y;
    const dir = turn ? (TURN[pick.sheep] ?? FIRST_DIRECTION) : (pick?.sheep ?? FIRST_DIRECTION);
    return changeRound((game) => { game.picks[myId] = { x, y, sheep: dir, ready: false }; });
  }
  changeRound((game) => { game.picks[myId] = { x, y, ready: false }; });
}

// R on a keyboard: turn my sheep's line, as tapping its square again does.
export function turnSheep() {
  const pick = myPick();
  if (inSheepMode() && pick?.sheep && !pick.ready) pickSquare(pick.x, pick.y);
}

export function movePick(dx, dy) {
  const from = myPick() ?? state.me;
  const x = from.x + dx;
  const y = from.y + dy;
  if (inSheepMode() && myPick()?.sheep) {
    if (!inReach(x, y)) return nudgeStatus();
    const dir = myPick().sheep; // arrows move the line, they don't turn it
    return changeRound((game) => { game.picks[myId] = { x, y, sheep: dir, ready: false }; });
  }
  pickSquare(x, y);
}

// Ready with no pick means "the square I'm standing on". In sheep mode, the
// line has to be placed first.
export function ready() {
  if (!choosing() || replayActive()) return;
  if (inSheepMode() && !myPick()?.sheep) return nudgeStatus();
  changeRound((game) => {
    const pick = game.picks[myId] ?? { x: state.me.x, y: state.me.y };
    game.picks[myId] = { ...pick, ready: true };
    game.deadline ??= now() + READY_WAIT_MS; // the first Ready starts the clock
  });
}

document.getElementById("ready").addEventListener("click", ready);

// --- Ending a round ---
function roundOver(game) {
  const picks = game.picks ?? {};
  const allReady = state.players.length > 0 && state.players.every((p) => picks[p.id]?.ready);
  return allReady || (game.deadline != null && now() >= game.deadline);
}

// A sheep grazes its line: empty squares turn over (no night, the sheep is
// careful); a square hiding a memory or a trap is refused and stays covered,
// marked with ❓ for the rest of the game. Returns what happened, for the
// animation everyone sees.
function graze(game, pick) {
  const line = sheepLine(pick.x, pick.y, pick.sheep).map(([x, y]) => key(x, y));
  const refused = line.filter((k) => clear(game, k) === "refused");
  return { line, dir: pick.sheep, refused };
}

// A sheep grazing a square: empty grass turns over; a square hiding a clue
// or a trap is left covered with a ❓.
function clear(game, k) {
  if (game.revealed[k]) return "done";
  if (game.board[k]) {
    game.sniffed ??= {};
    game.sniffed[k] = true;
    return "refused";
  }
  revealSquare(game, k);
  return "cleared";
}

// The squares a player walks through on the way (not the start, not where
// they land), along the same staircase path their circle is drawn walking
// (and the footprints show before Ready).
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

// Walking through a square: grass turns over, a trap goes off (the sky
// darkens), and a clue is spotted (🔍!) but not read: someone has to land
// on it for that.
function walkThrough(game, k) {
  if (game.revealed[k]) return;
  if (game.board[k]?.kind === "clue") {
    game.spotted ??= {};
    game.spotted[k] = true;
    return;
  }
  revealSquare(game, k);
}

// Any device can end the round; the transaction makes sure it happens once.
// Ready players go to their pick. Anyone not ready stays where they stand,
// and that square turns over. Two players on one square turn it over once.
// A player who sent a sheep stays put and turns nothing over themselves.
// One request at a time: while the server answers, the clock keeps ticking
// but this device doesn't ask again.
let resolving = false;

export function maybeResolve() {
  if (resolving || !choosing() || !roundOver(state.game)) return;
  resolving = true;
  changeRound((game) => {
    if (!roundOver(game)) return false;
    game.sheepUsed ??= {};
    const moves = {};
    const squares = new Map(); // "x_y" -> the players turning it over
    const walked = []; // squares walked through on the way
    const sheep = [];
    const actions = []; // the order the replay plays things in (replay.js)
    const before = new Set(Object.keys(game.revealed)); // turned over in earlier rounds
    for (const p of state.players) {
      const pick = game.picks[p.id];
      const used = game.sheepUsed[p.id] ?? 0;
      if (pick?.ready && pick.sheep && used < SHEEP_PER_PLAYER) {
        game.sheepUsed[p.id] = used + 1;
        sheep.push(pick);
        moves[p.id] = { x: p.x, y: p.y };
        continue;
      }
      const to = pick?.ready && !pick.sheep ? { x: pick.x, y: pick.y } : { x: p.x, y: p.y };
      moves[p.id] = to;
      const k = key(to.x, to.y);
      squares.set(k, [...(squares.get(k) ?? []), p]);
      walked.push(...pathBetween(p, to));
      actions.push({ kind: "walk", player: p.id, from: { x: p.x, y: p.y }, path: [...pathBetween(p, to), k] });
    }
    for (const [k, players] of squares) {
      // My own clue can't be turned over by me alone (it would give my
      // memory away): it stays covered with a ❓, like a sheep's refusal.
      const hidden = game.board[k];
      const memory = hidden?.kind === "clue" && state.memories[hidden.memory];
      if (memory && !game.revealed[k] && players.every((p) => isAuthor(p, memory))) {
        game.sniffed ??= {};
        game.sniffed[k] = true;
        continue;
      }
      revealSquare(game, k);
    }
    // Then the squares walked through: after the landings, so a square one
    // player lands on turns over (and is read) even if another walks past it.
    for (const k of walked) walkThrough(game, k);
    game.grazed = sheep.map((pick) => graze(game, pick)); // after the players: they get there first
    game.grazed.forEach((_, run) => actions.push({ kind: "graze", run }));
    if (game.grazed.length === 0) game.grazed = null;
    nextGuess(game); // all of a memory's clues found: guess it first
    checkEnd(game);
    game.moves = moves; // each device moves its own player (see applyMyMove)
    game.round += 1;
    // Only squares turned over in this round are replayed: walking over old
    // ones (or old traps) must not hide them again or undo the night.
    const fresh = Object.keys(game.revealed).filter((k) => !before.has(k));
    game.replay = { tag: `${game.id}:${game.round}`, actions, fresh: Object.fromEntries(fresh.map((k) => [k, true])) };
    game.picks = null;
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
  const tag = `${game?.id}:${game?.round}`;
  if (!to || movedFor === tag) return;
  movedFor = tag;
  if (to.x === state.me.x && to.y === state.me.y) return;
  state.me.x = to.x;
  state.me.y = to.y;
  update(myRef, { x: to.x, y: to.y });
  rememberPosition();
}

// The clock: redraw the timer bar and check the deadline a few times a second.
setInterval(() => {
  renderTimer();
  maybeResolve();
}, 250);

export { READY_WAIT_MS };
