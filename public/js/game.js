// The memory garden (docs/game-design.md, v4): one game at a time per family
// link. Under the grass of the 7x7 field, 48 garden pictures (6 kinds, 8 of
// each) stay in place all game. Rounds (rounds.js) flash some of them, ask
// for one kind, and reward the family with the next clue to one memory at a
// time. Missed rounds bring the night.
import { db, ref, update, onValue, runTransaction } from "./firebase.js";
import { SIZE, CENTRE, sessionRef, myRef } from "./session.js";
import { state, rememberPosition } from "./state.js";
import { render } from "./render.js";
import { applyMyMove, maybeResolve, maybeStartRound } from "./rounds.js";
import { gameChanged } from "./end.js";
import { eventChanged, firstEventAt } from "./events.js";
import { renderChest } from "./chest.js";
import { renderGuess, maybeAdvance } from "./guess.js";
import { CLUES, myMemoryId, backToLobby } from "./lobby.js";

// Starting values from docs/game-design.md, to tune after playtests.
export const PICTURES = ["🌸", "🌷", "🐌", "🐛", "🍄", "🐦"]; // sakura, tulip, snail, caterpillar, mushroom, bird
const EACH = 8; // of each picture: 6 x 8 = 48, every square but the centre
export const NIGHT_STEPS = 5; // missed rounds before the wolf comes
const FIRST_ROUND_MS = 4000; // a moment to settle in before the first flash
const IDLE_MS = 2 * 60 * 60 * 1000; // a game nobody has touched for 2 hours is replaced
const VERSION = 4; // the memory garden

const gameRef = sessionRef("game");
const memoriesRef = sessionRef("memories");

// Squares are keyed "x_y" (database keys can't contain dots).
export const key = (x, y) => `${x}_${y}`;
export const CENTRE_KEY = key(CENTRE, CENTRE);

// Server time, so devices with different clocks agree on when things happen.
let serverOffset = 0;
onValue(ref(db, ".info/serverTimeOffset"), (snap) => { serverOffset = snap.val() || 0; });
export const now = () => Date.now() + serverOffset;

// Everyone starts together on the centre square (drawn at the size players
// have when they share a square). It hides no picture.
export const spawnSquare = () => ({ x: CENTRE, y: CENTRE });

// The pictures, shuffled once per game over every square but the centre.
function newBoard() {
  const squares = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) if (key(x, y) !== CENTRE_KEY) squares.push(key(x, y));
  }
  const kinds = PICTURES.flatMap((_, kind) => Array(EACH).fill(kind));
  for (let i = kinds.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [kinds[i], kinds[j]] = [kinds[j], kinds[i]];
  }
  return Object.fromEntries(squares.map((k, i) => [k, kinds[i]]));
}

function newGame() {
  return {
    id: now().toString(36),
    version: VERSION, // a game from an earlier design (v3 field) gets replaced
    size: SIZE, // and one from another grid size
    status: "playing",
    updatedAt: now(),
    nextEventAt: firstEventAt(now()), // something crossing the sky (events.js)
    night: 0, // missed rounds
    round: 0,
    board: newBoard(), // "x_y" -> picture (index in PICTURES)
    started: false, // false until everyone has said "Ready to play" (rounds.js)
    playReady: {}, // playerId -> true
    phase: "result", // "flash" while a round is on (flash, pause, choosing); "result" between rounds
    nextRoundAt: now() + FIRST_ROUND_MS,
    entered: {}, // memoryId -> true: the memories of the players in this game
    queue: [], // those memories, in the order they came in: played one at a time
    clues: {}, // memoryId -> clues earned so far (0..3)
    // During a round: flash {at, squares, target}, picks, grazing, deadline.
    // After one: moves, replay (rounds.js); guess, guessed, lastGuess (guess.js).
  };
}

// The memory being played for: the first in the queue not yet guessed or revealed.
export const currentMemory = (game) => (game?.queue ?? []).find((id) => !game.guessed?.[id]) ?? null;
export const cluesOf = (game, memoryId) => game?.clues?.[memoryId] ?? 0;

// With all its clues, the current memory gets guessed before anything else.
export function nextGuess(game) {
  if (game.guess) return;
  const memory = currentMemory(game);
  if (memory && cluesOf(game, memory) >= CLUES) {
    game.guess = { memory, phase: "guessing", startedAt: now() };
  }
}

// Every memory found (guessed, or revealed after its clues): a win. Full
// night: the wolf. Guessing always finishes first.
export function checkEnd(game) {
  if (game.guess) return;
  const queue = game.queue ?? [];
  if (queue.length > 0 && queue.every((id) => game.guessed?.[id])) game.status = "won";
  else if (game.night >= NIGHT_STEPS) game.status = "lost";
}

// Start a game if there isn't one (or the last one went quiet, or is from
// another grid size), and bring my memory into it. One transaction, so two
// devices can't create two games or enter a memory twice.
export function syncGame() {
  if (!state.joined) return;
  runTransaction(gameRef, (game) => {
    const fresh = !game || game.version !== VERSION || game.size !== SIZE || now() - (game.updatedAt ?? 0) > IDLE_MS;
    if (fresh) game = newGame();
    game.entered ??= {};
    game.queue ??= [];
    if (game.status !== "playing") return; // abort; a finished game waits for "play again"
    const mine = myMemoryId();
    const entering = mine && state.memories[mine]?.clues?.length === CLUES && !game.entered[mine];
    if (entering) {
      game.entered[mine] = true;
      game.queue.push(mine);
    }
    if (!fresh && !entering) return; // nothing to do: abort
    return game;
  }, { applyLocally: false }); // a random board: only show the one the server kept
}

// "New game": replace the game I'm looking at. If someone else already
// replaced it, their new board stays and mine is dropped. Returns a promise
// that settles once the database has answered.
export function newGameForAll() {
  const seen = state.game?.id ?? null;
  return runTransaction(gameRef, (game) => {
    if ((game?.id ?? null) !== seen) return; // abort
    // Everyone goes back to the lobby to keep their memory or write a new
    // one, and brings it in on the way back.
    return { ...newGame(), viaLobby: true };
  }, { applyLocally: false });
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
  recordPlayer();
  render();
  gameChanged(previous, state.game);
  eventChanged(state.game);
  renderGuess();
  maybeAdvance();
  maybeResolve();
  maybeStartRound();
});

// A new game: everyone back to the centre square.
function backToStart() {
  if (!state.joined) return;
  ({ x: state.me.x, y: state.me.y } = spawnSquare());
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
  newGameForAll();
});

onValue(memoriesRef, (snap) => {
  state.memories = snap.val() || {};
  renderChest();
  renderGuess();
  syncGame();
});

// Who played each game, for the memory chest: each player adds themselves
// once per game (keyed by tab, so a refresh doesn't add them twice).
let recordedFor = null;

function recordPlayer() {
  const game = state.game;
  if (!state.joined || !game || recordedFor === game.id || !state.me.tab) return;
  recordedFor = game.id;
  update(sessionRef(`history/${game.id}`), {
    [`players/${state.me.tab}`]: { name: state.me.name ?? "", animal: state.me.animal ?? "", color: state.me.color ?? "" },
    startedAt: game.updatedAt ?? now(),
  });
}
