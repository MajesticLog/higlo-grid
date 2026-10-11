// Replay: a round's result arrives all at once, but each device plays it
// back in order so everyone can follow what happened: "3, 2, 1", then each
// player's walk one after another (squares turning over as their circle
// reaches them, traps darkening the sky as they go off), then the sheep.
// Clue cards, guessing and the end of the game wait until it's over.
// Someone who arrives mid-replay just sees the result.
//
// The round's transaction stores game.replay: {tag, actions}, where an action
// is {kind: "walk", player, from: {x, y}, path: ["x_y", ...]} (the landing
// square last) or {kind: "graze", run} (an index into game.grazed).
import { state } from "./state.js";

export const COUNT_MS = 650; // each of 3, 2, 1
export const STEP_MS = 220; // a circle walking one square
export const SHEEP_STEP_MS = 800; // keep in sync with the graze animation in style.css
const PAUSE_MS = 350; // between one player's walk and the next

let current = null; // the replay being played: its timeline
let ticker = null;
let onTick = () => {};

export const setReplayTick = (fn) => { onTick = fn; };

const squareOf = (k) => k.split("_").map(Number);

// Builds the timeline the first time this device sees a round's replay.
// `arriving`: my first look at this game, so nothing to replay.
export function updateReplay(arriving) {
  const replay = state.game?.replay;
  if (!replay) {
    current = null;
    return;
  }
  if (current?.tag === replay.tag) return;
  const start = arriving ? -Infinity : performance.now();
  const reveal = new Map(); // "x_y" -> when it turns over
  const walks = new Map(); // playerId -> {from, path, start}
  const grazes = new Map(); // run index -> start
  const at = (k, t) => { if (!reveal.has(k) || reveal.get(k) > t) reveal.set(k, t); };
  let t = start + 3 * COUNT_MS;
  for (const action of replay.actions ?? []) {
    if (action.kind === "walk") {
      walks.set(action.player, { from: action.from, path: action.path, start: t });
      action.path.forEach((k, i) => at(k, t + (i + 1) * STEP_MS));
      t += action.path.length * STEP_MS + PAUSE_MS;
    } else if (action.kind === "graze") {
      grazes.set(action.run, t);
      const run = state.game.grazed?.[action.run];
      (run?.line ?? []).forEach((k, i) => at(k, t + (i + 1) * SHEEP_STEP_MS - 300));
      t += SHEEP_STEP_MS * ((run?.line.length ?? 0) + 1);
    }
  }
  current = { tag: replay.tag, start, end: t, reveal, walks, grazes };
  if (replayActive() && !ticker) {
    ticker = setInterval(() => {
      if (!replayActive()) {
        clearInterval(ticker);
        ticker = null;
      }
      onTick();
    }, 100);
  }
}

export const replayActive = () => Boolean(current) && performance.now() < current.end;
export const replayEndsAt = () => (replayActive() ? current.end : 0);

// 3, 2, 1, or null once the moves start.
export function countdown() {
  if (!replayActive()) return null;
  const left = Math.ceil((current.start + 3 * COUNT_MS - performance.now()) / COUNT_MS);
  return left >= 1 && left <= 3 ? left : null;
}

// A square turned over this round, not reached yet in the replay.
export const notYet = (k) => replayActive() && (current.reveal.get(k) ?? -Infinity) > performance.now();

// Where a player's circle is in the replay: still at the start, on the way,
// or landed. Null when there's no replay for them.
export function replayPosition(playerId) {
  if (!replayActive()) return null;
  const walk = current.walks.get(playerId);
  if (!walk) return null;
  const steps = Math.floor((performance.now() - walk.start) / STEP_MS);
  if (steps <= 0) return { ...walk.from };
  const [x, y] = squareOf(walk.path[Math.min(steps, walk.path.length) - 1]);
  return { x, y };
}

// When a sheep run starts in the replay (or null: play it as it comes).
export const grazeStartFor = (run) => (current?.grazes.get(run) ?? null);

// The night as shown: traps not reached yet in the replay don't count yet.
export function nightShown(night) {
  if (!replayActive()) return night;
  const revealed = state.game?.revealed ?? {};
  let pending = 0;
  for (const [k, t] of current.reveal) {
    if (t > performance.now() && revealed[k]?.show === "trap") pending += 1;
  }
  return Math.max(0, night - pending);
}
