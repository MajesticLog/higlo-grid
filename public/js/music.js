// Music and ambience under the game (sound.js has the short sounds). When the
// first round of a game starts, a rooster crows and a morning tune fades in;
// at noon, the sounds of a summer's day; from dusk, crickets. Each one fades
// into the next, and they all go quiet when the game ends. Every device
// follows its own sky, so someone arriving mid-game hears what matches it
// (without the rooster). Files in sfx/ (see its README), streamed rather than
// loaded whole, and played through the Web Audio API (an iPhone ignores a
// page's volume for <audio>, but not a gain).
//
// Test aid: the 🎵 slider sets the music's volume on this device only, to see
// whether music adds anything under a family call. Sounds keep their volume.
import { state } from "./state.js";
import { audio, onGesture, playRooster } from "./sound.js";
import { nightSteps, skyStep, SKY_NOON, SKY_DUSK } from "./game.js";
import { nightShown } from "./replay.js";

const TRACKS = {
  morning: { file: "/sfx/morning.mp3", level: 1 }, // "Morning", Kevin MacLeod
  day: { file: "/sfx/day.mp3", level: 1 }, // birds and a breeze
  night: { file: "/sfx/night.mp3", level: 0.4 }, // crickets (louder than they sound: turned down)
};
const FADE_S = 3; // each fade in or out
const PAUSED_LEVEL = 0.25; // while the game is paused
const ROOSTER_MS = 1800; // the rooster crows, then the morning tune starts
const VOLUME_KEY = "higlo:music-volume";
const DEFAULT_VOLUME = 50; // % on the slider

let master = null; // every track goes through it: the slider's volume
const tracks = {}; // name -> {el, gain, level, offAt}
let roosterFor = null; // a game seen waiting for "Ready to play"
let holdUntil = 0; // the rooster is crowing

// The slider's % as a gain: squared, so the low end is finely tuned.
const sliderGain = (percent) => (percent / 100) ** 2;

function readVolume() {
  try {
    const saved = localStorage.getItem(VOLUME_KEY);
    if (saved !== null) return Number(saved);
  } catch { /* can't remember: the default */ }
  return DEFAULT_VOLUME;
}

function track(name) {
  if (tracks[name]) return tracks[name];
  const ctx = audio();
  if (!ctx) return null;
  if (!master) {
    master = ctx.createGain();
    master.gain.value = sliderGain(readVolume());
    master.connect(ctx.destination);
  }
  const el = new Audio(TRACKS[name].file);
  el.loop = true;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  ctx.createMediaElementSource(el).connect(gain).connect(master);
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

// Which track the sky calls for, or null.
function wanted() {
  const game = state.game;
  if (!state.joined || !game || game.status !== "playing" || game.started === false) return null;
  if (performance.now() < holdUntil) return null;
  const step = skyStep(nightShown(game.night ?? 0), nightSteps(game)); // as the sky shows it
  if (step >= SKY_DUSK) return "night";
  return step >= SKY_NOON ? "day" : "morning";
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
  const want = wanted();
  for (const name of Object.keys(TRACKS)) {
    const on = name === want;
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

// --- The 🎵 slider (a test aid) ---
const button = document.getElementById("music");
const panel = document.getElementById("music-panel");
const slider = document.getElementById("music-volume");
slider.value = readVolume();

button.addEventListener("click", () => { panel.hidden = !panel.hidden; });
slider.addEventListener("input", () => {
  const percent = Number(slider.value);
  try { localStorage.setItem(VOLUME_KEY, String(percent)); } catch { /* this visit only */ }
  if (master) master.gain.setTargetAtTime(sliderGain(percent), audio()?.currentTime ?? 0, 0.05);
});
document.addEventListener("click", (e) => { // a tap elsewhere closes it
  if (!panel.hidden && !panel.contains(e.target) && e.target !== button) panel.hidden = true;
});
