// The field: one game at a time per family link. Grass everywhere, with
// traps and the family's memories hidden underneath. The bottom row starts
// turned over, as flowers, and that's where everyone starts.
import { db, ref, update, onValue, runTransaction } from "./firebase.js";
import { SIZE, CENTRE, sessionRef, myRef, myId } from "./session.js";
import { state, rememberPosition } from "./state.js";
import { render } from "./render.js";
import { applyMyMove, maybeResolve } from "./rounds.js";
import { gameChanged } from "./end.js";
import { eventChanged, firstEventAt } from "./events.js";
import { renderChest } from "./chest.js";
import { renderGuess, maybeAdvance } from "./guess.js";
import { CLUES, myMemoryId, backToLobby } from "./lobby.js";

// Starting values from docs/game-design.md, to tune after playtests.
export const TRAPS = 8; // was 12: with 3 clues per player, 12 made winning nearly impossible
export const NIGHT_STEPS = 6; // traps turned over before the wolf comes
export const START_ROW = SIZE - 1;
const IDLE_MS = 2 * 60 * 60 * 1000; // a game nobody has touched for 2 hours is replaced

const INSECT_CHANCE = 0.15; // share of empty squares that show an insect
const FLOWER_CHANCE = 0.45; // share that show little flowers (the rest: plain short grass)
const FLOWER_KINDS = 4; // dot patterns in style.css (.tile.flower.f0 ... f3)

const INSECTS = ["🐞", "🐛", "🐜", "🦗"];
const gameRef = sessionRef("game");
const memoriesRef = sessionRef("memories");

// Squares are keyed "x_y" (database keys can't contain dots).
export const key = (x, y) => `${x}_${y}`;
const pick = (list) => list[Math.floor(Math.random() * list.length)];

export const flower = () => ({ show: "flower", f: Math.floor(Math.random() * FLOWER_KINDS) });

// Turn a square over, inside a round's transaction. Already turned over: nothing.
// Each trap brings the night one step closer.
export function revealSquare(game, k) {
  if (game.revealed[k]) return;
  const hidden = game.board[k];
  if (hidden?.kind === "trap") {
    game.revealed[k] = { show: "trap", icon: "🪤" };
    game.night += 1;
  } else if (hidden?.kind === "clue") {
    // A 🔍 with the author's animal beside it, framed in their colour.
    game.revealed[k] = { show: "clue", icon: "🔍", memory: hidden.memory, n: hidden.n };
  } else if (hidden?.kind === "memory") { // games from before clues
    game.revealed[k] = { show: "memory", icon: "📜", memory: hidden.memory };
  } else {
    // Empty: short grass, sometimes with little flowers, sometimes an insect.
    const roll = Math.random();
    if (roll < INSECT_CHANCE) game.revealed[k] = { show: "insect", icon: pick(INSECTS) };
    else if (roll < INSECT_CHANCE + FLOWER_CHANCE) game.revealed[k] = flower();
    else game.revealed[k] = { show: "grass" };
  }
}

// After a round: every clue found means a win (even if night fell in the
// same round: be kind); full night means the wolf comes out.
const isTarget = (hidden) => hidden.kind === "clue" || hidden.kind === "memory";

// A memory whose clues have all turned over gets guessed before anything
// else happens: start the next one waiting, if none is on.
export function nextGuess(game) {
  if (game.guess) return;
  const cluesOf = {};
  for (const [k, hidden] of Object.entries(game.board ?? {})) {
    if (hidden.kind === "clue") (cluesOf[hidden.memory] ??= []).push(k);
  }
  for (const [memory, squares] of Object.entries(cluesOf)) {
    if (game.guessed?.[memory] || !squares.every((k) => game.revealed[k])) continue;
    game.guess = { memory, phase: "guessing", startedAt: now() };
    return;
  }
}

export function checkEnd(game) {
  if (game.guess) return; // finish guessing first, even at nightfall
  const targets = Object.keys(game.board).filter((k) => isTarget(game.board[k]));
  if (targets.length > 0 && targets.every((k) => game.revealed[k])) game.status = "won";
  else if (game.night >= NIGHT_STEPS) game.status = "lost";
}

// A memory is found once all its clues have turned over: it won't be hidden
// again next game. Every device that sees it may write this; the writes
// agree, so that's fine.
const markedFound = new Set();

function markFound() {
  const game = state.game;
  if (!game) return;
  const squaresOf = {}; // memoryId -> its squares on the board
  for (const [k, hidden] of Object.entries(game.board ?? {})) {
    if (isTarget(hidden)) (squaresOf[hidden.memory] ??= []).push(k);
  }
  for (const [id, squares] of Object.entries(squaresOf)) {
    const m = state.memories[id];
    // Done for good once guessed (clues) or turned over (older memories); a
    // memory found in an earlier game but never guessed counts again here.
    if (markedFound.has(id) || !m || (m.clues ? m.revealedAt : m.foundAt) || m.gameId === game.id) continue;
    if (!squares.every((k) => game.revealed?.[k])) continue;
    markedFound.add(id);
    update(sessionRef(`memories/${id}`), { foundAt: now(), gameId: game.id });
  }
}

// Server time, so devices with different clocks agree on when a game went quiet.
let serverOffset = 0;
onValue(ref(db, ".info/serverTimeOffset"), (snap) => { serverOffset = snap.val() || 0; });
export const now = () => Date.now() + serverOffset;

// The start row, filled from the middle outwards: 5, 4, 6, 3, 7...
const START_COLUMNS = [...Array(SIZE).keys()]
  .sort((a, b) => Math.abs(a - CENTRE) - Math.abs(b - CENTRE) || a - b);

// Joining: the first free start square (shared if the row is full).
export function spawnSquare(players) {
  const taken = new Set(players.map((p) => `${p.x},${p.y}`));
  const x = START_COLUMNS.find((c) => !taken.has(`${c},${START_ROW}`)) ?? CENTRE;
  return { x, y: START_ROW };
}

function newGame() {
  const game = {
    id: now().toString(36),
    status: "playing",
    updatedAt: now(), // also bumped by every reveal (step 3)
    nextEventAt: firstEventAt(now()), // something crossing the sky (events.js)
    night: 0,
    round: 1,
    entered: {}, // memoryId -> true: the memories of the players in this game
    board: {}, // "x_y" -> {kind: "trap"} or {kind: "clue", memory: id, n}; empty squares aren't stored
    revealed: {}, // "x_y" -> {show, icon, memory?}
    // During a round, also: picks {playerId: {x, y, ready}}, deadline.
    // After one: moves {playerId: {x, y}}, where each player went.
  };
  // Everything starts as tall grass. Nothing is hidden in the start row, so
  // where everyone starts is safe.
  for (let i = 0; i < TRAPS; i++) {
    const square = freeSquare(game);
    if (square) game.board[square] = { kind: "trap" };
  }
  return game;
}

// A random square that's still grass and has nothing hidden under it yet.
function freeSquare(game) {
  const options = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const k = key(x, y);
      if (y !== START_ROW && !game.board[k] && !game.revealed[k]) options.push(k);
    }
  }
  return options.length ? pick(options) : null;
}

// A memory's clues go close together: within a 3×3 area, so finding one
// tells the group the others are near (the quest). Falls back to anywhere
// if the field is too crowded.
function clueSquares(game) {
  const free = (k) => !k.endsWith(`_${START_ROW}`) && !game.board[k] && !game.revealed[k];
  for (let tries = 0; tries < 200; tries++) {
    const cx = 1 + Math.floor(Math.random() * (SIZE - 2));
    const cy = 1 + Math.floor(Math.random() * (START_ROW - 1));
    const area = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (free(key(cx + dx, cy + dy))) area.push(key(cx + dx, cy + dy));
      }
    }
    if (area.length >= CLUES) return area.sort(() => Math.random() - 0.5).slice(0, CLUES);
  }
  const squares = [];
  for (let n = 0; n < CLUES; n++) {
    const k = freeSquare(game);
    if (!k) break;
    squares.push(k);
    game.board[k] = { kind: "taken" }; // so the next pick avoids it; replaced below
  }
  return squares;
}

// Hide the clues of any memory entered in this game that isn't in the field
// yet: each player brings one from the lobby (new, or kept from before).
// Memories of people who aren't playing wait in the chest. (Games from before
// "entered" existed hide every unguessed memory.) Returns how many it hid.
function hideMissingMemories(game) {
  const hidden = new Set(Object.values(game.board).map((c) => c.memory).filter(Boolean));
  const entered = (id) => !game.entered || game.entered[id];
  const missing = Object.entries(state.memories)
    .filter(([id, m]) => !m.revealedAt && m.clues?.length === CLUES && entered(id) && !hidden.has(id))
    .map(([id]) => id);
  for (const id of missing) {
    clueSquares(game).forEach((k, n) => { game.board[k] = { kind: "clue", memory: id, n }; });
  }
  return missing.length;
}

// Start a game if there isn't one (or the last one went quiet), and hide any
// missing memory. One transaction, so two devices can't create two games or
// hide the same memory twice.
export function syncGame() {
  if (!state.joined) return;
  runTransaction(gameRef, (game) => {
    const fresh = !game || now() - (game.updatedAt ?? 0) > IDLE_MS;
    if (fresh) game = newGame();
    game.entered ??= {};
    if (game.status !== "playing") return; // abort; a finished game waits for "play again"
    game.board ??= {}; // the database drops empty objects
    game.revealed ??= {};
    // Bring my memory into this game (once it has reached the database).
    const mine = myMemoryId();
    let entering = false;
    if (mine && state.memories[mine] && game.entered && !game.entered[mine]) {
      game.entered[mine] = true;
      entering = true;
    }
    if (hideMissingMemories(game) === 0 && !fresh && !entering) return; // nothing to do: abort
    return game;
  }, { applyLocally: false }); // a random board: only show the one the server kept
}

// "New game": replace the game I'm looking at. If someone else already
// replaced it, their new board stays and mine is dropped. Returns a promise
// that settles once the database has answered.
export function newBoard() {
  const seen = state.game?.id ?? null;
  return runTransaction(gameRef, (game) => {
    if ((game?.id ?? null) !== seen) return; // abort
    // Everyone goes back to the lobby to keep their memory or write a new
    // one; each brings it in on the way back. Nothing is hidden until then.
    return { ...newGame(), viaLobby: true };
  }, { applyLocally: false }); // a random board: only show the one the server kept
}

onValue(gameRef, (snap) => {
  const previous = state.game;
  state.game = snap.val();
  if (previous && state.game && state.game.id !== previous.id) {
    if (state.game.viaLobby && state.joined) return backToLobby(); // New game / Play again
    backToStart();
  } else {
    applyMyMove();
  }
  markFound();
  render();
  gameChanged(previous, state.game);
  eventChanged(state.game);
  renderGuess();
  maybeAdvance();
  maybeResolve();
});

// A new board: everyone goes back to the start row. Each device moves its own
// player to the column matching its place in the join order, so nobody collides.
function backToStart() {
  if (!state.joined) return;
  const index = Math.max(0, state.players.findIndex((p) => p.id === myId));
  state.me.x = START_COLUMNS[index % SIZE];
  state.me.y = START_ROW;
  update(myRef, { x: state.me.x, y: state.me.y });
  rememberPosition();
}

// --- The "New game" button, with an inline "are you sure?" ---
const ask = document.getElementById("new-game-ask");
const confirmBox = document.getElementById("new-game-confirm");
const showConfirm = (show) => { ask.hidden = show; confirmBox.hidden = !show; };
ask.addEventListener("click", () => showConfirm(true));
document.getElementById("new-game-no").addEventListener("click", () => showConfirm(false));
document.getElementById("new-game-yes").addEventListener("click", () => {
  showConfirm(false);
  newBoard();
});

onValue(memoriesRef, (snap) => {
  state.memories = snap.val() || {};
  renderChest();
  renderGuess();
  markFound();
  syncGame();
});
