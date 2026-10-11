// Little surprises crossing the sky, for whimsy only: nothing to tap, no
// points. Day: a hot-air balloon, a flock of birds, a cloud with a quick
// shower (the grass glistens after). From sunset: an owl, a shooting star,
// a UFO. Each event is stored in the game, so the whole family sees the
// same one at the same moment ("did you see that?!").
import { runTransaction } from "./firebase.js";
import { sessionRef } from "./session.js";
import { state } from "./state.js";
import { now } from "./game.js";
import {
  playSwoosh, playCaws, playRainAndWind, playHoot, playTwinkle, playTheremin,
} from "./sound.js";

// Test aid: with ?peek in the link, only 10 to 15 seconds of calm between
// events after the first one.
const fast = new URLSearchParams(location.search).has("peek");
const FIRST_EVENT_MS = fast ? [30000, 40000] : [30000, 90000]; // never in a game's first 30 seconds
const CALM_MS = fast ? [10000, 15000] : [45000, 120000]; // calm after each event ends: 45 s to 2 min
const NIGHT_FROM = 3; // night step from which the night events take over
const DAY = ["balloon", "birds", "rain"];
const NIGHT = ["owl", "star", "ufo"];

const EVENT_MS = 5000; // each event crosses part of the screen in 5 s, fading in and out
const gameRef = sessionRef("game");
const layer = document.getElementById("events");
const between = ([min, max]) => min + Math.random() * (max - min);

export const firstEventAt = (t) => t + between(FIRST_EVENT_MS);

// Any device in the field can schedule the next event when it's due; the
// transaction makes sure only one does. applyLocally: false, so a device
// never plays an event of its own that loses to another device's.
setInterval(() => {
  const seen = state.game;
  if (!state.joined || !seen || seen.status !== "playing") return;
  if (seen.nextEventAt && now() < seen.nextEventAt) return;
  runTransaction(gameRef, (game) => {
    if (!game || game.id !== seen.id || game.status !== "playing") return;
    if (game.nextEventAt && now() < game.nextEventAt) return; // someone did it
    if (!game.nextEventAt) {
      game.nextEventAt = firstEventAt(now()); // a game from before events existed
      return game;
    }
    // Never the same event twice in a row.
    const all = (game.night ?? 0) >= NIGHT_FROM ? NIGHT : DAY;
    const kinds = all.filter((k) => k !== game.event?.kind);
    game.event = {
      kind: kinds[Math.floor(Math.random() * kinds.length)],
      at: now(),
      seed: Math.random(), // same path on every device
    };
    game.nextEventAt = now() + EVENT_MS + between(CALM_MS); // counted from the end of this one
    return game;
  }, { applyLocally: false }); // the event is random: only show the one the server kept
}, 1000);

// Called by game.js on every game change: play an event once, when it's new.
let played = null;

export function eventChanged(game) {
  const event = game?.event;
  if (!event || !state.joined) return;
  const tag = `${game.id}:${event.at}`;
  if (played === tag) return;
  played = tag;
  if (now() - event.at > 4000) return; // old news (I just arrived)
  PLAY[event.kind]?.(event.seed);
  SOUND[event.kind]?.();
}

const SOUND = {
  balloon: playSwoosh,
  birds: playCaws,
  rain: playRainAndWind,
  owl: playHoot,
  star: playTwinkle,
  ufo: playTheremin,
};

// --- Drawing the events ---
// Each one lives in the fixed #events layer (above the field, under the
// memory card and end screen) and removes itself when it's done.
function add(className, html, ms, vars = {}) {
  const el = document.createElement("div");
  el.className = `event ${className}`;
  el.innerHTML = html;
  for (const [name, value] of Object.entries(vars)) el.style.setProperty(name, value);
  layer.append(el);
  setTimeout(() => el.remove(), ms);
  return el;
}

// From the seed: which way it goes (1 = to the right), how high (vh), and
// where along the screen it crosses (vw).
const direction = (seed) => (seed < 0.5 ? 1 : -1);
const height = (seed, min, max) => `${min + ((seed * 997) % 1) * (max - min)}vh`;
const across = (seed) => `${30 + ((seed * 7919) % 1) * 40}vw`;

// A hot-air balloon (there's no emoji for one, so a small drawing).
const BALLOON = `<svg viewBox="0 0 60 80" aria-hidden="true">
  <path d="M30 3C13 3 4 16 4 29c0 15 15 25 20 31h12c5-6 20-16 20-31C56 16 47 3 30 3z" fill="#e4572e"/>
  <path d="M30 3c-7 0-11 13-11 26 0 15 5 25 7 31h8c2-6 7-16 7-31 0-13-4-26-11-26z" fill="#f4c430"/>
  <path d="M25 60l1 8M35 60l-1 8" stroke="#6d4c41" stroke-width="1.5"/>
  <rect x="24" y="67" width="12" height="9" rx="2" fill="#a1887f"/>
</svg>`;

// A flying saucer with a little alien (the emoji has its own beam, which
// clashed with ours).
const UFO = `<svg viewBox="0 0 80 44" aria-hidden="true">
  <ellipse cx="40" cy="17" rx="15" ry="13" fill="#b3e5fc" stroke="#4fc3f7" stroke-width="1.5"/>
  <circle cx="40" cy="16" r="5.5" fill="#81c784"/>
  <circle cx="38" cy="15" r="1.3" fill="#1b5e20"/><circle cx="42" cy="15" r="1.3" fill="#1b5e20"/>
  <ellipse cx="40" cy="27" rx="37" ry="10" fill="#90a4ae"/>
  <ellipse cx="40" cy="24" rx="37" ry="6" fill="#cfd8dc"/>
  <circle class="ufo-light" cx="18" cy="29" r="2.8" fill="#ffee58"/>
  <circle class="ufo-light" cx="31" cy="31.5" r="2.8" fill="#ff8a65"/>
  <circle class="ufo-light" cx="49" cy="31.5" r="2.8" fill="#ffee58"/>
  <circle class="ufo-light" cx="62" cy="29" r="2.8" fill="#ff8a65"/>
</svg>`;

const PLAY = {
  balloon(seed) {
    add("balloon", BALLOON, EVENT_MS, { "--dir": direction(seed), "--y": height(seed, 6, 30), "--cx": across(seed) });
  },

  birds(seed) {
    const dir = direction(seed);
    const flock = [[0, 0], [-1, -1], [-1, 1], [-2, -2], [-2, 2]]
      .map(([x, y], i) => `<span style="--bx:${x};--by:${y};animation-delay:-${i * 0.13}s">🐦</span>`)
      .join("");
    add("birds", flock, EVENT_MS, { "--dir": dir, "--y": height(seed, 8, 35), "--cx": across(seed) });
  },

  // A cloud drifts over the field, rains for a few seconds, drifts on, and
  // the grass glistens for a moment after.
  rain(seed) {
    const board = document.getElementById("board").getBoundingClientRect();
    if (!board.width) return;
    const dir = direction(seed);
    const size = Math.max(90, board.width * 0.38);
    add("cloud", "☁️", EVENT_MS, {
      "--dir": dir,
      "--size": `${size}px`,
      "--top": `${Math.max(0, board.top - size * 0.45)}px`,
      "--centre": `${board.left + board.width / 2}px`,
    });
    const drops = Array.from({ length: 50 }, () =>
      `<i style="left:${(Math.random() * 100).toFixed(1)}%;animation-delay:-${(Math.random() * 0.6).toFixed(2)}s"></i>`).join("");
    add("rain", drops, EVENT_MS, {
      "--left": `${board.left}px`,
      "--top": `${board.top}px`,
      "--width": `${board.width}px`,
      "--height": `${board.height}px`,
    });
    setTimeout(glisten, 3600); // as the cloud leaves
  },

  owl(seed) {
    add("owl", "<span>🦉</span>", EVENT_MS, { "--dir": direction(seed), "--y": height(seed, 8, 35), "--cx": across(seed) });
  },

  star(seed) {
    add("star", "<i></i><span>⭐</span>", 1800, {
      "--dir": direction(seed),
      "--y": height(seed, 4, 22),
      "--x": `${10 + ((seed * 7919) % 1) * 50}vw`,
    });
  },

  ufo(seed) {
    add("ufo", `<span class="beam"></span><span class="saucer">${UFO}</span>`, EVENT_MS, {
      "--dir": direction(seed),
      "--y": height(seed, 8, 30),
      "--cx": across(seed),
    });
  },
};

// After the shower: a shimmer and a few sparkles over the grass.
function glisten() {
  const board = document.getElementById("board");
  const el = document.createElement("div");
  el.className = "glisten";
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = Array.from({ length: 12 }, () =>
    `<span style="left:${(Math.random() * 95).toFixed(1)}%;top:${(Math.random() * 95).toFixed(1)}%;animation-delay:-${(Math.random() * 1.2).toFixed(2)}s">✨</span>`).join("");
  board.append(el);
  setTimeout(() => el.remove(), 2500);
}
