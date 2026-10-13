// A little surprise in the sky, for whimsy only: nothing to tap, no points.
// Once the sky is past dusk, there's one chance in four that a UFO wobbles
// across, at most once per game (playtest 5: several events were
// distracting). It's stored in the game, so the whole family sees it at the
// same moment ("did you see that?!").
import { runTransaction } from "./firebase.js";
import { sessionRef } from "./session.js";
import { state } from "./state.js";
import { now, NIGHT_STEPS } from "./game.js";
import { replayActive } from "./replay.js";
import { playTheremin } from "./sound.js";

// Test aid: with ?peek in the link, the UFO always comes.
const fast = new URLSearchParams(location.search).has("peek");
const UFO_CHANCE = fast ? 1 : 0.25; // once past dusk, the chance of a UFO this game
const PAST_DUSK = 0.5; // past dusk: at least half the misses before the wolf (3 of 5)
const UFO_DELAY_MS = [5000, 20000]; // how long after dusk, at a quiet moment

const EVENT_MS = 5000; // the UFO crosses part of the screen in 5 s, fading in and out
const gameRef = sessionRef("game");
const layer = document.getElementById("events");
const between = ([min, max]) => min + Math.random() * (max - min);

// A quiet moment: not during a flash, a replay, a guess or a pause.
function quiet(game) {
  if (game.guess || game.paused || replayActive()) return false;
  return !(game.phase === "flash" && game.flash && now() < game.flash.at + 6000);
}

// Any device in the garden can roll the dice, then send the UFO when it's
// due; the transaction makes sure only one does, once per game.
// game.ufoAt: null (not rolled yet), 0 (no UFO this game), or when it's due.
// game.ufo: {at, seed} once it has flown. applyLocally: false, so a device
// never plays a UFO of its own that loses to another device's.
setInterval(() => {
  const seen = state.game;
  if (!state.joined || !seen || seen.status !== "playing" || seen.ufo) return;
  if ((seen.night ?? 0) / NIGHT_STEPS < PAST_DUSK) return;
  if (seen.ufoAt != null && (seen.ufoAt === 0 || now() < seen.ufoAt || !quiet(seen))) return;
  runTransaction(gameRef, (game) => {
    if (!game || game.id !== seen.id || game.status !== "playing" || game.ufo) return;
    if (game.ufoAt == null) { // the roll, once
      game.ufoAt = Math.random() < UFO_CHANCE ? now() + between(UFO_DELAY_MS) : 0;
      return game;
    }
    if (game.ufoAt === 0 || now() < game.ufoAt || !quiet(game)) return;
    game.ufo = { at: now(), seed: Math.random() }; // same path on every device
    return game;
  }, { applyLocally: false }); // random: only show what the server kept
}, 1000);

// Called by game.js on every game change: play the UFO once, when it's new.
let played = null;

export function eventChanged(game) {
  const ufo = game?.ufo;
  if (!ufo || !state.joined) return;
  const tag = `${game.id}:${ufo.at}`;
  if (played === tag) return;
  played = tag;
  if (now() - ufo.at > 4000) return; // old news (I just arrived)
  flyUfo(ufo.seed);
  playTheremin();
}

// --- Drawing the UFO ---
// It lives in the fixed #events layer (above the field, under the memory
// card and end screen) and removes itself when it's done. From the seed:
// which way it goes, how high (vh), and where along the screen it crosses (vw).
// The drawing is a file in img/ (the UFO emoji has no beam), easy to replace.
const UFO = '<img src="/img/ufo.svg" alt="">';

function flyUfo(seed) {
  const el = document.createElement("div");
  el.className = "event ufo";
  el.innerHTML = `<span class="beam"></span><span class="saucer">${UFO}</span>`;
  el.style.setProperty("--dir", seed < 0.5 ? 1 : -1); // 1 = to the right
  el.style.setProperty("--y", `${8 + ((seed * 997) % 1) * 22}vh`);
  el.style.setProperty("--cx", `${30 + ((seed * 7919) % 1) * 40}vw`);
  layer.append(el);
  setTimeout(() => el.remove(), EVENT_MS);
}
