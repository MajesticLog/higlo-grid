// Sounds: files in /sfx (easy to replace, see sfx/README.md), played with the
// Web Audio API. Each sound can also be made in the browser (the functions
// below), which is what plays if its file hasn't loaded. Browsers only allow
// sound after a tap or key press, so the audio starts on the first one. To
// mute it, use the device's or browser's own sound controls.
let ctx = null;

// The sound files, and how loud to play each (1 = as recorded). The files that
// come with the game are quiet on purpose, to sit under a family call; a
// louder replacement can be turned down here.
const SOUNDS = {
  fanfare: { file: "/sfx/fanfare.wav", volume: 1 }, // every memory found
  howl: { file: "/sfx/howl.wav", volume: 1 }, // full night: the wolf
  twinkle: { file: "/sfx/twinkle.wav", volume: 1 }, // a memory guessed
  theremin: { file: "/sfx/theremin.wav", volume: 1 }, // UFO
  sheep: { file: "/sfx/sheep.wav", volume: 1 }, // the sheep's "bêêê"
  rooster: { file: "/sfx/rooster.wav", volume: 0.5 }, // the first round of a game (music.js)
  munch: { file: "/sfx/munch.wav", volume: 1 }, // sheep grazing
  ding: { file: "/sfx/ding.wav", volume: 1 }, // someone joined
  goodbye: { file: "/sfx/goodbye.wav", volume: 1 }, // someone left
};
const buffers = {}; // name -> decoded sound, once loaded

// Load every file once sound is allowed. Any that fails (offline, a bad
// replacement) falls back to the generated sound.
let loading = false;
function loadSounds() {
  if (loading || !ctx) return;
  loading = true;
  for (const [name, { file }] of Object.entries(SOUNDS)) {
    fetch(file)
      .then((response) => response.arrayBuffer())
      .then((data) => ctx.decodeAudioData(data))
      .then((decoded) => { buffers[name] = decoded; })
      .catch(() => { /* the generated sound plays instead */ });
  }
}

// Plays a sound's file if it's loaded; false if not (then generate it).
function playFile(name) {
  const decoded = buffers[name];
  if (!decoded) return false;
  const source = ctx.createBufferSource();
  source.buffer = decoded;
  const gain = ctx.createGain();
  gain.gain.value = SOUNDS[name].volume;
  source.connect(gain).connect(ctx.destination);
  source.start();
  return true;
}

// Browsers only count some gestures as permission to play: a key press, a
// click, or a finger *lifting* (a finger touching down doesn't count). So
// listen for all of them; on a phone, a refresh that skips the lobby (no
// typing) would otherwise never get sound. Each gesture also wakes the sound
// up if the phone suspended or interrupted it (a call, a notification).
const gestureHooks = [];
function unlock() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return; }
  }
  if (ctx.state !== "running") ctx.resume().catch(() => {});
  loadSounds();
  for (const hook of gestureHooks) hook();
}
for (const gesture of ["pointerup", "touchend", "click", "keydown"]) {
  document.addEventListener(gesture, unlock, { passive: true });
}

const ready = () => ctx && ctx.state === "running";

// For the music (music.js): the audio, once sound is allowed (or null), and a
// way to try again on each tap (a phone may block music until one).
export const audio = () => (ready() ? ctx : null);
export const onGesture = (hook) => gestureHooks.push(hook);

// A rooster crowing: the first round of a game. No generated version: if the
// file hasn't loaded, the morning tune just starts on its own.
export function playRooster() {
  if (ready()) playFile("rooster");
}

// One note with a soft start and end, through an optional low-pass filter.
function note(freq, start, length, { type = "triangle", volume = 0.12, filter } = {}) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.02);
  gain.gain.setValueAtTime(volume, start + length - 0.06);
  gain.gain.linearRampToValueAtTime(0, start + length);
  let out = osc;
  if (filter) {
    const lowpass = ctx.createBiquadFilter();
    lowpass.frequency.value = filter;
    out = osc.connect(lowpass);
  }
  out.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + length);
}

// A short, cheerful fanfare: G C E G ... E G.
export function playTrumpet() {
  if (!ready() || playFile("fanfare")) return;
  const t = ctx.currentTime + 0.05;
  const brass = { type: "sawtooth", volume: 0.08, filter: 1800 };
  for (const [freq, at, length] of [
    [392, 0, 0.14], [523, 0.15, 0.14], [659, 0.3, 0.14], [784, 0.45, 0.45],
    [659, 0.95, 0.14], [784, 1.1, 0.7],
  ]) note(freq, t + at, length, brass);
}

// A soft, faraway howl: a gentle rise and fall with a little wobble.
export function playHowl() {
  if (!ready() || playFile("howl")) return;
  const t = ctx.currentTime + 0.05;
  const osc = ctx.createOscillator();
  const wobble = ctx.createOscillator();
  const wobbleDepth = ctx.createGain();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(260, t);
  osc.frequency.exponentialRampToValueAtTime(520, t + 0.5);
  osc.frequency.setValueAtTime(520, t + 1.0);
  osc.frequency.exponentialRampToValueAtTime(360, t + 1.8);
  wobble.frequency.value = 5;
  wobbleDepth.gain.value = 8;
  wobble.connect(wobbleDepth).connect(osc.frequency);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.1, t + 0.3);
  gain.gain.setValueAtTime(0.1, t + 1.3);
  gain.gain.linearRampToValueAtTime(0, t + 1.9);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  wobble.start(t);
  osc.stop(t + 2);
  wobble.stop(t + 2);
}

// --- Generated versions (the fallback), and event sounds (events.js) ---

// A gain that rises, holds and falls: the shape of each sound.
function envelope(t, peak, attack, hold, release) {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(peak, t + attack);
  gain.gain.setValueAtTime(peak, t + attack + hold);
  gain.gain.linearRampToValueAtTime(0, t + attack + hold + release);
  gain.connect(ctx.destination);
  return gain;
}

// White noise, made once: the raw material for the munching.
let noise = null;
function noiseSource(t, length) {
  if (!noise) {
    noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = noise;
  source.loop = true;
  source.start(t);
  source.stop(t + length);
  return source;
}

function filter(type, freq, q = 1) {
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  return f;
}

function osc(type, t, length) {
  const o = ctx.createOscillator();
  o.type = type;
  o.start(t);
  o.stop(t + length);
  return o;
}

// A memory guessed: a twinkling run of little bells, like a carillon.
export function playTwinkle() {
  if (!ready() || playFile("twinkle")) return;
  const start = ctx.currentTime + 0.05;
  [2093, 2637, 3136, 2349, 2794, 3520].forEach((freq, i) => {
    const t = start + i * 0.09;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
    gain.connect(ctx.destination);
    // A bell is a note plus a brighter, quieter partial.
    for (const [multiple, level] of [[1, 1], [2.76, 0.35]]) {
      const partial = ctx.createGain();
      partial.gain.value = level;
      const o = osc("sine", t, 1.25);
      o.frequency.value = freq * multiple;
      o.connect(partial).connect(gain);
    }
  });
}

// UFO: a wobbly, slightly spooky theremin swooping up and down.
export function playTheremin() {
  if (!ready() || playFile("theremin")) return;
  const t = ctx.currentTime + 0.05;
  const o = osc("sine", t, 3.2);
  o.frequency.setValueAtTime(520, t);
  o.frequency.linearRampToValueAtTime(900, t + 0.8);
  o.frequency.linearRampToValueAtTime(640, t + 1.5);
  o.frequency.linearRampToValueAtTime(1000, t + 2.2);
  o.frequency.linearRampToValueAtTime(480, t + 3.0);
  const vibrato = osc("sine", t, 3.2);
  vibrato.frequency.value = 6.5;
  const depth = ctx.createGain();
  depth.gain.value = 25;
  vibrato.connect(depth).connect(o.frequency);
  o.connect(envelope(t, 0.08, 0.3, 2.3, 0.5));
}

// Sheep: a wobbly "bêêê" (a buzzy voice with a fast tremolo).
export function playBleat() {
  if (!ready() || playFile("sheep")) return;
  const t = ctx.currentTime + 0.05;
  const voice = filter("bandpass", 1100, 3);
  voice.connect(envelope(t, 0.14, 0.04, 0.5, 0.25));
  const tremolo = ctx.createGain();
  tremolo.gain.value = 0.6;
  const wobble = osc("sine", t, 0.85);
  wobble.frequency.value = 22;
  const wobbleDepth = ctx.createGain();
  wobbleDepth.gain.value = 0.4;
  wobble.connect(wobbleDepth).connect(tremolo.gain);
  tremolo.connect(voice);
  for (const [type, detune] of [["sawtooth", 0], ["square", 8]]) {
    const o = osc(type, t, 0.85);
    o.detune.value = detune;
    o.frequency.setValueAtTime(340, t);
    o.frequency.linearRampToValueAtTime(385, t + 0.15);
    o.frequency.linearRampToValueAtTime(310, t + 0.8);
    o.connect(tremolo);
  }
}

// Sheep munching grass: a few soft, crunchy nibbles.
export function playMunch() {
  if (!ready() || playFile("munch")) return;
  const start = ctx.currentTime + 0.02;
  for (let i = 0; i < 3; i++) {
    const t = start + i * 0.14 + Math.random() * 0.03;
    noiseSource(t, 0.08).connect(filter("bandpass", 1400 + Math.random() * 600, 2))
      .connect(envelope(t, 0.07, 0.005, 0.03, 0.04));
  }
}

// Someone joined: a soft two-note "ding-dong", like a doorbell.
export function playDing() {
  if (!ready() || playFile("ding")) return;
  const start = ctx.currentTime + 0.02;
  [[1046, 0], [784, 0.18]].forEach(([freq, at]) => {
    const t = start + at;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.1, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    gain.connect(ctx.destination);
    // A bell: the note, plus a quieter, brighter partial.
    for (const [multiple, level] of [[1, 1], [2.4, 0.25]]) {
      const partial = ctx.createGain();
      partial.gain.value = level;
      const o = osc("sine", t, 0.95);
      o.frequency.value = freq * multiple;
      o.connect(partial).connect(gain);
    }
  });
}

// Someone left: a soft wooden "bye-bye", two notes falling, lower and shorter
// than the doorbell so the two are easy to tell apart.
export function playGoodbye() {
  if (!ready() || playFile("goodbye")) return;
  const start = ctx.currentTime + 0.02;
  [[659, 0], [523, 0.22]].forEach(([freq, at]) => {
    const t = start + at;
    // Like a marimba: a soft note, plus a quieter partial that dies away first.
    for (const [type, multiple, level, length] of [["triangle", 1, 0.12, 0.6], ["sine", 4, 0.02, 0.15]]) {
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(level, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
      gain.connect(ctx.destination);
      const o = osc(type, t, length + 0.05);
      o.frequency.value = freq * multiple;
      o.connect(gain);
    }
  });
}
