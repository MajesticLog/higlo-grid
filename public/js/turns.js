// Turns, in join order. The player whose turn it is moves as far as they
// like; the others signal 🔥 warmer or ❄️ colder. The turn passes once all
// of them have, or when the mover taps "Next" (so one absent player can
// never stall the game).
import { SIZE, sessionRef, myRef, myId } from "./session.js";
import { set, update, remove, onValue, runTransaction } from "./firebase.js";
import { state, canMove } from "./state.js";
import { render, nudgeTurnBar, showFloat, HINT_ICON } from "./render.js";
import { checkFound } from "./targets.js";

const STEP_MS = 150; // walking speed when you tap a square
const MAX_PATH = 40; // squares remembered per turn, start included

const turnRef = sessionRef("turn");
const hintsRef = sessionRef("hints");
const myHintsRef = sessionRef(`hints/${myId}`);

onValue(turnRef, (snap) => {
  state.turn = snap.val();
  render();
  ensureTurn();
  maybePass();
});

// When a guide signals, a big 🔥 / ❄️ floats above that guide for everyone,
// so it's clear who said what. Not on first load: those are old signals.
let hintsLoaded = false;

onValue(hintsRef, (snap) => {
  const hints = snap.val() || {};
  const fresh = [];
  if (hintsLoaded) {
    for (const [mover, byGuide] of Object.entries(hints)) {
      for (const [guide, kind] of Object.entries(byGuide)) {
        if (state.hints[mover]?.[guide] !== kind) fresh.push([guide, kind]);
      }
    }
  }
  hintsLoaded = true;
  state.hints = hints;
  render();
  for (const [guide, kind] of fresh) showFloat(guide, HINT_ICON[kind]);
  maybePass();
});

// Join order: push keys sort by time, so the next player is the first key
// after this one. Works even if that player has just left.
function nextAfter(id) {
  const ids = state.players.map((p) => p.id);
  return ids.find((k) => k > id) ?? ids[0];
}

// Transaction: only pass the turn if it's still `from`'s, so two devices
// can never both move it on.
export function passTurn(from) {
  runTransaction(turnRef, (t) => {
    if (t && t.player !== from) return; // someone already passed it: abort
    return { player: nextAfter(from), moved: false };
  });
}

// Make sure the turn belongs to someone who is here: the first player to
// join starts, and if the turn's owner leaves, it moves on.
export function ensureTurn() {
  if (!state.joined || state.players.length === 0) return;
  const present = (id) => state.players.some((p) => p.id === id);
  if (state.turn && present(state.turn.player)) return;
  runTransaction(turnRef, (t) => {
    if (t && present(t.player)) return; // already fine: abort
    return { player: t ? nextAfter(t.player) : state.players[0].id, moved: false };
  });
}

// The mover's device passes the turn once every other player has signalled.
// Alone, there's nobody to wait for, so the turn comes straight back.
export function maybePass() {
  const t = state.turn;
  if (!t || t.player !== myId || !t.moved) return;
  const received = state.hints[myId] || {};
  const others = state.players.filter((p) => p.id !== myId);
  if (others.every((p) => received[p.id])) passTurn(myId);
}

// --- Moving: on your turn, as far as you like ---
const clamp = (n) => Math.max(0, Math.min(SIZE - 1, n));

export function tryMove(dx, dy) {
  if (!canMove()) {
    stopWalking();
    return nudgeTurnBar();
  }
  const from = { x: state.me.x, y: state.me.y };
  const x = clamp(state.me.x + dx);
  const y = clamp(state.me.y + dy);
  if (x === from.x && y === from.y) return; // against an edge
  state.me.x = x;
  state.me.y = y;
  update(myRef, { x, y });
  remove(myHintsRef); // old hints were about where I was
  // Record the step in the turn's path, so guides who looked away can still
  // see where I started. Only while the turn is still mine.
  runTransaction(turnRef, (t) => {
    if (!t || t.player !== myId) return; // abort
    let path = [...(t.path ?? [from]), { x, y }];
    if (path.length > MAX_PATH) path = [path[0], ...path.slice(-(MAX_PATH - 1))]; // keep the start
    return { ...t, moved: true, path };
  });
  if (checkFound()) { // found it: no hints needed
    stopWalking();
    passTurn(myId);
  }
}

// Tap or click a square: walk there one square at a time, so others see the path.
let walkTarget = null;
let walkTimer = null;

export function stopWalking() {
  clearInterval(walkTimer);
  walkTimer = null;
  walkTarget = null;
}

function step() {
  const dx = walkTarget.x - state.me.x;
  const dy = walkTarget.y - state.me.y;
  if ((dx === 0 && dy === 0) || !canMove()) return stopWalking(); // arrived, or turn over
  // Step along the axis with the most distance left: a natural staircase path.
  if (Math.abs(dx) >= Math.abs(dy)) tryMove(Math.sign(dx), 0);
  else tryMove(0, Math.sign(dy));
}

export function walkTo(x, y) {
  if (!canMove()) return nudgeTurnBar();
  walkTarget = { x, y };
  if (!walkTimer) {
    step();
    if (walkTarget) walkTimer = setInterval(step, STEP_MS);
  }
}

// --- Signals and "Next" ---
function signal(kind) {
  const t = state.turn;
  if (!t || !t.moved || t.player === myId) return;
  set(sessionRef(`hints/${t.player}/${myId}`), kind);
}

document.getElementById("hot").addEventListener("click", () => signal("hot"));
document.getElementById("cold").addEventListener("click", () => signal("cold"));
document.getElementById("next").addEventListener("click", () => {
  if (state.turn?.player === myId && state.turn.moved) passTurn(myId);
});
