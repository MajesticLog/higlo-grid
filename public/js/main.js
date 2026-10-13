// Entry point: lobby, then join the field, keep the player list, wire up the controls.
import { db, ref, get, set, update, remove, onValue, onDisconnect } from "./firebase.js";
import { SIZE, setSize, sessionRef, playersRef, myRef, myId } from "./session.js";
import { runLobby } from "./lobby.js";
import { syncGame, spawnSquare, gridSize, now } from "./game.js";
import { state, rememberPosition, savedPosition } from "./state.js";
import { render } from "./render.js";
import { pickSquare, movePick, maybeResolve, ready } from "./rounds.js";
import { playersChanged } from "./announce.js";
import { gameChanged, maybeStartAgain } from "./end.js";
import { renderGuess, maybeAdvance, readingResult } from "./guess.js";
import { cardOpen } from "./card.js";
import { hintHelp } from "./rules.js";
import { sendHeart } from "./hearts.js";
import "./messages.js";
import "./music.js";

document.getElementById("link").textContent = location.href;

// The lobby first: pick an animal and a colour, hide a memory.
Object.assign(state.me, await runLobby());
document.getElementById("field").hidden = false;
hintHelp(); // the ❓ glows for anyone who hasn't opened the rules yet
// Back on my square after a refresh in the same game; otherwise the start row.
const [players, gameNow] = await Promise.all([get(playersRef), get(sessionRef("game"))]);
const gameId = gameNow.val()?.id;

// A reload (a phone that froze the page in the background, a refresh) leaves
// my previous circle behind until the server notices it's gone, which can
// take a minute. Remove it now: same tab, so it's me.
players.forEach((child) => {
  if (child.key !== myId && child.val()?.tab && child.val().tab === state.me.tab) remove(child.ref);
});
// The garden's size with me in it, so I start in its middle.
let count = 1;
players.forEach((child) => { if (child.val()?.tab !== state.me.tab) count += 1; });
setSize(gridSize(gameNow.val(), count));
Object.assign(state.me, savedPosition(gameId) ?? spawnSquare());
rememberPosition(gameId);

// Every time the connection comes up (now, or after a network drop), write
// myself into the session and ask the server to remove me when I go. While
// it's down, the status bar says so.
onValue(ref(db, ".info/connected"), async (snap) => {
  state.online = snap.val() === true;
  render();
  if (!state.online) return;
  await onDisconnect(myRef).remove();
  await set(myRef, state.me);
  state.joined = true;
  render(); // the status bar may still say "Joining…" if nothing else changes
  syncGame(); // start a game if there isn't one, and hide my memory
  gameChanged(null, state.game); // a game that ended while I was in the lobby: show its end screen now
});

// A window open on my screen (rules, a clue card, guessing, the chest, the
// 💡 list): tell the others, so the next flash waits for me (rounds.js), for
// a while. A clue card, and the result of a guess where notes are written,
// it waits for until I close them.
let busy = false;
let reading = false;
setInterval(() => {
  if (!state.joined) return;
  const open = Boolean(document.querySelector('[role="dialog"]:not([hidden])'));
  if (open !== busy) {
    busy = open;
    update(myRef, { busy: open ? now() : null });
  }
  const nowReading = readingResult() || cardOpen();
  if (nowReading !== reading) {
    reading = nowReading;
    update(myRef, { reading: reading || null });
  }
}, 400);

onValue(playersRef, (snap) => {
  const players = [];
  snap.forEach((child) => { players.push({ id: child.key, ...child.val() }); });
  playersChanged(players); // "🐶 Mathilde has joined the game!"
  state.players = players;
  render();
  maybeResolve(); // the last player we were waiting for may have left
  maybeStartAgain(); // ...or the last one to choose at the end of a game
  renderGuess();
  maybeAdvance(); // ...or the last guesser
});

// --- Controls ---
// Arrow keys: move my pick one square.
const MOVES = {
  ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
};

// Enter: Ready.
document.addEventListener("keydown", (e) => {
  // Not while typing (a guess, a message) or while a card, the rules or the chest is open.
  if (e.target.closest?.("input, textarea") || document.querySelector('[role="dialog"]:not([hidden])')) return;
  // On a focused button, Enter presses that button instead.
  if (e.key === "Enter" && !e.target.closest?.("button")) {
    e.preventDefault();
    return ready();
  }
  const move = MOVES[e.key];
  if (!move) return;
  e.preventDefault(); // stop the arrows from scrolling the page
  movePick(...move);
});

// Tap or click a square: that's my pick. Someone else's circle also gets a
// heart. Pointer events cover mouse,
// finger and pen.
const grid = document.getElementById("grid");
const clamp = (n) => Math.max(0, Math.min(SIZE - 1, n));

grid.addEventListener("pointerdown", (e) => {
  if (!state.joined) return;
  const rect = grid.getBoundingClientRect();
  const x = clamp(Math.floor(((e.clientX - rect.left) / rect.width) * SIZE));
  const y = clamp(Math.floor(((e.clientY - rect.top) / rect.height) * SIZE));
  // Another player's circle: a heart for them (and their square is my pick).
  const circle = e.target.closest(".circle");
  if (circle && circle.dataset.id !== myId) sendHeart(circle.dataset.id);
  pickSquare(x, y);
});
