// Music and ambience under the game (sound.js has the short sounds), in two
// layers. The tune: when the first round of a game starts, a rooster crows
// and "Morning" fades in, and it plays until nightfall (the step before the
// wolf). The ambience, on top: the sounds of a summer's day from noon to dusk,
// then crickets until the end. Everything fades in and out, and goes quiet
// when the game ends. Every device follows its own sky, so someone arriving
// mid-game hears what matches it (without the rooster). Files in sfx/ (see
// its README), streamed rather than loaded whole, and played through the Web
// Audio API (an iPhone ignores a page's volume for <audio>, but not a gain).
//
// Test aid: the 🎵 panel has a volume slider for each layer, on this device
// only, to see whether they add anything under a family call. Sounds keep
// their volume.
import { state } from "./state.js";
import { audio, onGesture, playRooster } from "./sound.js";
import { nightSteps, skyStep, SKY_NOON, SKY_DUSK, SKY_NIGHTFALL } from "./game.js";
import { nightShown } from "./replay.js";

// When each track plays, in sky steps (game.js): from `from` until before `until`.
const TRACKS = {
  morning: { file: "/sfx/morning.mp3", layer: "music", level: 1, from: 0, until: SKY_NIGHTFALL }, // Kevin MacLeod
  day: { file: "/sfx/day.mp3", layer: "ambience", level: 1, from: SKY_NOON, until: SKY_DUSK }, // birds, a breeze
  night: { file: "/sfx/night.mp3", layer: "ambience", level: 0.4, from: SKY_DUSK, until: Infinity }, // crickets (turned down)
};
const FADE_S = 3; // each fade in or out
const PAUSED_LEVEL = 0.25; // while the game is paused
const ROOSTER_MS = 1800; // the rooster crows, then the tune starts
const DEFAULT_VOLUME = 50; // % on each slider
const LAYERS = ["music", "ambience"];
const volumeKey = (layer) => `higlo:${layer}-volume`;

const masters = {}; // layer -> its gain: the slider's volume
const tracks = {}; // name -> {el, gain, level, offAt}
let roosterFor = null; // a game seen waiting for "Ready to play"
let holdUntil = 0; // the rooster is crowing

// The slider's % as a gain: squared, so the low end is finely tuned.
const sliderGain = (percent) => (percent / 100) ** 2;

function readVolume(layer) {
  try {
    const saved = localStorage.getItem(volumeKey(layer));
    if (saved !== null) return Number(saved);
  } catch { /* can't remember: the default */ }
  return DEFAULT_VOLUME;
}

function track(name) {
  if (tracks[name]) return tracks[name];
  const ctx = audio();
  if (!ctx) return null;
  const { layer } = TRACKS[name];
  if (!masters[layer]) {
    masters[layer] = ctx.createGain();
    masters[layer].gain.value = sliderGain(readVolume(layer));
    masters[layer].connect(ctx.destination);
  }
  const el = new Audio(TRACKS[name].file);
  el.loop = true;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  ctx.createMediaElementSource(el).connect(gain).connect(masters[layer]);
  tracks[name] = { el, gain, level: 0, offAt: 0 };
  return tracks[name];
}

function fade(t, level) {
  const ctx = audio();
  const g = t.gain.gain;
  g.cancelScheduledValues(ctx.currentTime);
  g.setValueAtTime(g.value, ctx.currentTime);
  g.linearRampToValueAtTime(level, ctx.currentTime + FADE_S);
  t.level = level;
  t.offAt = level === 0 ? performance.now() + FADE_S * 1000 : 0;
}

// Is this track called for now, by the game and its sky?
function wanted(name) {
  const game = state.game;
  if (!state.joined || !game || game.status !== "playing" || game.started === false) return false;
  if (performance.now() < holdUntil) return false;
  const step = skyStep(nightShown(game.night ?? 0), nightSteps(game)); // as the sky shows it
  return step >= TRACKS[name].from && step < TRACKS[name].until;
}

function update() {
  if (!audio()) return;
  const game = state.game;
  // The first round starting, seen live: the rooster, then the music.
  if (game?.started === false) roosterFor = game.id;
  else if (game?.started && roosterFor === game.id) {
    roosterFor = null;
    if (state.joined) {
      playRooster();
      holdUntil = performance.now() + ROOSTER_MS;
    }
  }
  for (const name of Object.keys(TRACKS)) {
    const on = wanted(name);
    const t = on ? track(name) : tracks[name];
    if (!t) continue;
    const level = on ? TRACKS[name].level * (game?.paused ? PAUSED_LEVEL : 1) : 0;
    if (t.level !== level) fade(t, level);
    if (on && t.el.paused) t.el.play().catch(() => { /* blocked until a tap: onGesture */ });
    if (!on && !t.el.paused && t.offAt && performance.now() > t.offAt) t.el.pause(); // faded out: stop streaming
  }
}

setInterval(update, 500);
onGesture(update);

// --- The 🎵 panel: a slider for each layer (a test aid) ---
const button = document.getElementById("music");
const panel = document.getElementById("music-panel");

for (const layer of LAYERS) {
  const slider = document.getElementById(`${layer}-volume`);
  slider.value = readVolume(layer);
  slider.addEventListener("input", () => {
    const percent = Number(slider.value);
    try { localStorage.setItem(volumeKey(layer), String(percent)); } catch { /* this visit only */ }
    masters[layer]?.gain.setTargetAtTime(sliderGain(percent), audio()?.currentTime ?? 0, 0.05);
  });
}

button.addEventListener("click", () => { panel.hidden = !panel.hidden; });
document.addEventListener("click", (e) => { // a tap elsewhere closes it
  if (!panel.hidden && !panel.contains(e.target) && e.target !== button) panel.hidden = true;
});
