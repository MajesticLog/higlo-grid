// Rounds: everyone picks a square within reach at the same time and taps
// Ready. When all are ready, or 20 seconds after the first Ready (so one
// player who stepped away can't stall the game), every picked square turns
// over at once. Others see which squares are picked, never by whom.
import { update, runTransaction } from "./firebase.js";
import { SIZE, sessionRef, myRef, myId } from "./session.js";
import { state } from "./state.js";
import { render, renderTimer, nudgeStatus } from "./render.js";
import { key, now, revealSquare, checkEnd } from "./game.js";

export const REACH = 3; // steps up, down, left or right; no diagonals
const READY_WAIT_MS = 20000; // after the first Ready, how long the others have
const gameRef = sessionRef("game");

const distance = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
export const inReach = (x, y) =>
  x >= 0 && y >= 0 && x < SIZE && y < SIZE && distance(state.me, { x, y }) <= REACH;
export const choosing = () => state.joined && state.game?.status === "playing";
export const myPick = () => state.game?.picks?.[myId];

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

// Tap a square (or move with the arrows): that's my pick, not ready yet.
export function pickSquare(x, y) {
  if (!choosing()) return;
  if (!inReach(x, y)) return nudgeStatus();
  changeRound((game) => { game.picks[myId] = { x, y, ready: false }; });
}

export function movePick(dx, dy) {
  const from = myPick() ?? state.me;
  pickSquare(from.x + dx, from.y + dy);
}

// Ready with no pick means "the square I'm standing on".
function ready() {
  if (!choosing()) return;
  changeRound((game) => {
    const pick = game.picks[myId] ?? { x: state.me.x, y: state.me.y };
    game.picks[myId] = { x: pick.x, y: pick.y, ready: true };
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

// Any device can end the round; the transaction makes sure it happens once.
// Ready players go to their pick. Anyone not ready stays where they stand,
// and that square turns over. Two players on one square turn it over once.
export function maybeResolve() {
  if (!choosing() || !roundOver(state.game)) return;
  changeRound((game) => {
    if (!roundOver(game)) return false;
    const moves = {};
    const squares = new Set();
    for (const p of state.players) {
      const pick = game.picks[p.id];
      const to = pick?.ready ? { x: pick.x, y: pick.y } : { x: p.x, y: p.y };
      moves[p.id] = to;
      squares.add(key(to.x, to.y));
    }
    for (const k of squares) revealSquare(game, k);
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
