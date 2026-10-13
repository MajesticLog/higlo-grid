// Pause: anyone can pause the game if they need to step away for a moment.
// Everyone sees who paused, and anyone can resume, so it's never stuck on
// one person. While paused nothing moves: no round, no flash, no timer, no
// sky events. Resuming shifts every clock by the time spent paused, so a
// round carries on exactly where it stopped.
import { runTransaction } from "./firebase.js";
import { sessionRef } from "./session.js";
import { state } from "./state.js";
import { now } from "./game.js";

const gameRef = sessionRef("game");
const button = document.getElementById("pause");
const box = document.getElementById("paused");
const who = document.getElementById("paused-who");

export const isPaused = () => Boolean(state.game?.paused);

function pause() {
  const seen = state.game?.id;
  runTransaction(gameRef, (game) => {
    if (!game || game.id !== seen || game.status !== "playing" || game.paused) return;
    game.paused = { at: now(), by: { name: state.me.name ?? "", animal: state.me.animal ?? "" } };
    return game;
  });
}

function resume() {
  const seen = state.game?.id;
  runTransaction(gameRef, (game) => {
    if (!game || game.id !== seen || !game.paused) return;
    const away = Math.max(0, now() - game.paused.at);
    // Every clock moves on by the time spent paused.
    if (game.flash) game.flash.at += away;
    if (game.deadline) game.deadline += away;
    if (game.nextRoundAt) game.nextRoundAt += away;
    if (game.ufoAt) game.ufoAt += away; // the UFO (events.js)
    if (game.firstReadyAt) game.firstReadyAt += away;
    game.paused = null;
    game.updatedAt = now();
    return game;
  });
}

button.addEventListener("click", pause);
document.getElementById("resume").addEventListener("click", resume);

// Called by render.js on every redraw.
export function renderPause() {
  const game = state.game;
  button.hidden = !state.joined || !game || game.status !== "playing" || Boolean(game.paused);
  box.hidden = !state.joined || !game?.paused;
  if (game?.paused) {
    const by = `${game.paused.by?.animal ?? ""} ${game.paused.by?.name ?? ""}`.trim() || "Someone";
    who.textContent = `${by} had to step away for a moment.`;
  }
}
