// Replay: a round's result arrives all at once, but each device plays it
// back in order so everyone can follow what happened: "3, 2, 1", then each
// player walks to their square, one after another, and the picture under it
// shows (popping above them) for a moment before the grass covers it again.
// After a miss, the flash's zone shows its pictures again. The clue
// card or the night comes after. Someone who arrives mid-replay just
// sees the result.
//
// The round's transaction stores game.replay: {tag, actions, success, ...},
// where an action is {kind: "walk", player, from: {x, y}, path: ["x_y", ...]}
// (the square they chose last).
import { state } from "./state.js";

export const COUNT_MS = 650; // each of 3, 2, 1
export const STEP_MS = 220; // a circle walking one square
export const PAUSE_MS = 350; // between one player's walk and the next
export const SHOW_MS = 2200; // how long a chosen square shows its picture
export const MISSED_MS = 4000; // after a miss: how long the zone shows its pictures again
const MISSED_STAGGER_MS = 150; // its squares turn one after another

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
  const shown = new Map(); // "x_y" -> when its picture shows
  const walks = new Map(); // playerId -> {from, path, start}
  let t = start + 3 * COUNT_MS;
  for (const action of replay.actions ?? []) {
    if (action.kind !== "walk") continue;
    walks.set(action.player, { from: action.from, path: action.path, start: t });
    const landing = action.path[action.path.length - 1];
    const landed = t + action.path.length * STEP_MS;
    if (!shown.has(landing)) shown.set(landing, landed);
    t = landed + PAUSE_MS;
  }
  // After a miss, once everyone has walked: the zone again.
  const missed = new Map(); // "x_y" -> when it turns over
  (replay.missed ?? []).forEach((k, i) => missed.set(k, t + i * MISSED_STAGGER_MS));
  const end = Math.max(
    t,
    ...[...shown.values()].map((at) => at + SHOW_MS),
    ...[...missed.values()].map((at) => at + MISSED_MS - MISSED_STAGGER_MS * (missed.size - 1)),
  );
  current = { tag: replay.tag, start, end, shown, missed, walks, replay, fresh: !arriving };
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
// True once per new round result this device watched live (not on arrival).
export const replayIsFresh = (tag) => current?.tag === tag && current.fresh;

// 3, 2, 1, or null once the moves start.
export function countdown() {
  if (!replayActive()) return null;
  const left = Math.ceil((current.start + 3 * COUNT_MS - performance.now()) / COUNT_MS);
  return left >= 1 && left <= 3 ? left : null;
}

// A chosen square showing its picture right now: how long it has been shown
// (ms), or null.
export function pictureAge(k) {
  if (!replayActive()) return null;
  const at = current.shown.get(k);
  if (at === undefined) return null;
  const age = performance.now() - at;
  return age >= 0 && age < SHOW_MS ? age : null;
}

// A missed square showing its picture right now.
export function missedShown(k) {
  if (!replayActive()) return false;
  const at = current.missed.get(k);
  return at !== undefined && performance.now() >= at;
}

// True while the missed squares are showing (for the status bar).
export const showingMissed = () =>
  replayActive() && [...current.missed.values()].some((at) => performance.now() >= at);

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

// The night as shown: a missed round only darkens the sky once it has played.
export function nightShown(night) {
  if (!replayActive() || current.replay.success) return night;
  return Math.max(0, night - 1);
}
