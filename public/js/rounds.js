// Rounds: everyone picks a square within reach at the same time and taps
// Ready. When all are ready, or 20 seconds after the first Ready (so one
// player who stepped away can't stall the game), every picked square turns
// over at once. Others see which squares are picked, never by whom.
// Instead of turning over a square, a player can send one of their sheep
// to graze a line of three squares.
import { update, runTransaction } from "./firebase.js";
import { SIZE, sessionRef, myRef, myId } from "./session.js";
import { state } from "./state.js";
import { render, renderTimer, nudgeStatus } from "./render.js";
import { key, now, revealSquare, checkEnd } from "./game.js";

export const REACH = 3; // steps up, down, left or right; no diagonals
export const SHEEP_PER_PLAYER = 3; // per game
const READY_WAIT_MS = 20000; // after the first Ready, how long the others have
const gameRef = sessionRef("game");

const distance = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
export const inReach = (x, y) =>
  x >= 0 && y >= 0 && x < SIZE && y < SIZE && distance(state.me, { x, y }) <= REACH;
export const choosing = () => state.joined && state.game?.status === "playing";
export const myPick = () => state.game?.picks?.[myId];
export const sheepLeft = () => SHEEP_PER_PLAYER - (state.game?.sheepUsed?.[myId] ?? 0);

// A sheep's line: the tapped square and the next two, to the right ("h") or
// downwards ("v"), shifted back if it would run off the field.
export function sheepLine(x, y, dir) {
  const sx = dir === "h" ? Math.min(x, SIZE - 3) : x;
  const sy = dir === "v" ? Math.min(y, SIZE - 3) : y;
  return [0, 1, 2].map((i) => (dir === "h" ? [sx + i, sy] : [sx, sy + i]));
}

// Every change to a round goes through a transaction on the game, tied to
// the game and round I'm looking at, so a late tap can never land in the
// next round or the next game. `edit` returns false to abort.
function changeRound(edit) {
  const seen = state.game;
  if (!seen) return;
  runTransaction(gameRef, (game) => {
    if (!game || game.id !== seen.id || game.round !== seen.round || game.status !== "playing") return;
    game.picks ??= {};
    game.revealed ??= {};
    game.board ??= {};
    return edit(game) === false ? undefined : game;
  });
}

// --- Sheep mode: on this device only, until the round ends ---
let sheepRound = null; // the round in which I tapped 🐑, or null
export const inSheepMode = () => sheepRound !== null && sheepRound === state.game?.round;

function toggleSheep() {
  if (!choosing() || myPick()?.ready) return;
  if (!inSheepMode() && sheepLeft() <= 0) return nudgeStatus();
  sheepRound = inSheepMode() ? null : state.game.round;
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
// turns the line between across and down.
export function pickSquare(x, y) {
  if (!choosing()) return;
  if (!inReach(x, y)) return nudgeStatus();
  if (inSheepMode()) {
    const pick = myPick();
    const turn = pick?.sheep && pick.x === x && pick.y === y;
    const dir = turn ? (pick.sheep === "h" ? "v" : "h") : (pick?.sheep ?? "h");
    return changeRound((game) => { game.picks[myId] = { x, y, sheep: dir, ready: false }; });
  }
  changeRound((game) => { game.picks[myId] = { x, y, ready: false }; });
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
function ready() {
  if (!choosing()) return;
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
  const refused = [];
  for (const k of line) {
    if (game.revealed[k]) continue;
    if (game.board[k]) {
      game.sniffed ??= {};
      game.sniffed[k] = true;
      refused.push(k);
    } else {
      revealSquare(game, k);
    }
  }
  return { line, dir: pick.sheep, refused };
}

// Any device can end the round; the transaction makes sure it happens once.
// Ready players go to their pick. Anyone not ready stays where they stand,
// and that square turns over. Two players on one square turn it over once.
// A player who sent a sheep stays put and turns nothing over themselves.
export function maybeResolve() {
  if (!choosing() || !roundOver(state.game)) return;
  changeRound((game) => {
    if (!roundOver(game)) return false;
    game.sheepUsed ??= {};
    const moves = {};
    const squares = new Set();
    const sheep = [];
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
      squares.add(key(to.x, to.y));
    }
    for (const k of squares) revealSquare(game, k);
    game.grazed = sheep.map((pick) => graze(game, pick)); // after the players: they get there first
    if (game.grazed.length === 0) game.grazed = null;
    checkEnd(game);
    game.moves = moves; // each device moves its own player (see applyMyMove)
    game.round += 1;
    game.picks = null;
    game.deadline = null;
    game.updatedAt = now();
  });
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
}

// The clock: redraw the timer bar and check the deadline a few times a second.
setInterval(() => {
  renderTimer();
  maybeResolve();
}, 250);

export { READY_WAIT_MS };
