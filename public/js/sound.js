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
  swoosh: { file: "/sfx/swoosh.wav", volume: 1 }, // hot-air balloon
  caws: { file: "/sfx/caws.wav", volume: 1 }, // birds
  rain: { file: "/sfx/rain.wav", volume: 1 }, // rain shower
  hoot: { file: "/sfx/hoot.wav", volume: 1 }, // owl
  twinkle: { file: "/sfx/twinkle.wav", volume: 1 }, // shooting star; a memory guessed
  theremin: { file: "/sfx/theremin.wav", volume: 1 }, // UFO
  bleat: { file: "/sfx/bleat.wav", volume: 1 }, // sheep
  munch: { file: "/sfx/munch.wav", volume: 1 }, // sheep grazing
  ding: { file: "/sfx/ding.wav", volume: 1 }, // someone joined
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
function unlock() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return; }
  }
  if (ctx.state !== "running") ctx.resume().catch(() => {});
  loadSounds();
}
for (const gesture of ["pointerup", "touchend", "click", "keydown"]) {
  document.addEventListener(gesture, unlock, { passive: true });
}

const ready = () => ctx && ctx.state === "running";

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

// White noise, made once: the raw material for wind, rain and swooshes.
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

// Hot-air balloon: a light swoosh, like a gust past the basket.
export function playSwoosh() {
  if (!ready() || playFile("swoosh")) return;
  const t = ctx.currentTime + 0.05;
  const band = filter("bandpass", 300, 1.5);
  band.frequency.setValueAtTime(300, t);
  band.frequency.exponentialRampToValueAtTime(1400, t + 0.7);
  band.frequency.exponentialRampToValueAtTime(450, t + 1.6);
  noiseSource(t, 1.7).connect(band).connect(envelope(t, 0.14, 0.5, 0.3, 0.8));
}

// Birds: three crow-like caws, raspy and falling.
export function playCaws() {
  if (!ready() || playFile("caws")) return;
  const start = ctx.currentTime + 0.05;
  [0, 0.42, 0.95].forEach((at, i) => {
    const t = start + at;
    const nasal = filter("bandpass", 1300, 2);
    nasal.connect(envelope(t, 0.09, 0.02, 0.12, 0.1));
    for (const [type, detune] of [["sawtooth", 0], ["square", 12]]) {
      const o = osc(type, t, 0.26);
      o.detune.value = detune;
      o.frequency.setValueAtTime(640 - i * 30, t);
      o.frequency.exponentialRampToValueAtTime(420 - i * 20, t + 0.22);
      o.connect(nasal);
    }
  });
}

// Shower: gentle drops pattering on leaves (little "plinks" at random
// pitches), over a very soft, low hush. No hiss.
export function playRainAndWind() {
  if (!ready() || playFile("rain")) return;
  const start = ctx.currentTime + 0.05;
  noiseSource(start, 4).connect(filter("lowpass", 500)).connect(envelope(start + 0.5, 0.025, 1, 1.5, 1));
  for (let i = 0; i < 45; i++) {
    // More drops in the middle of the shower, fewer at the start and end.
    const at = 0.8 + 2.6 * ((Math.random() + Math.random()) / 2);
    const t = start + at;
    const drop = osc("sine", t, 0.12);
    drop.frequency.setValueAtTime(1200 + Math.random() * 1800, t);
    drop.frequency.exponentialRampToValueAtTime(700 + Math.random() * 400, t + 0.08);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.025 + Math.random() * 0.025, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    drop.connect(gain).connect(ctx.destination);
  }
}

// Owl: "hoo... hoo-hoo".
export function playHoot() {
  if (!ready() || playFile("hoot")) return;
  const start = ctx.currentTime + 0.05;
  for (const [at, length] of [[0, 0.45], [0.75, 0.22], [1.05, 0.5]]) {
    const t = start + at;
    const o = osc("sine", t, length + 0.1);
    o.frequency.setValueAtTime(410, t);
    o.frequency.linearRampToValueAtTime(370, t + length);
    o.connect(envelope(t, 0.14, 0.05, length - 0.15, 0.15));
  }
}

// Shooting star: a twinkling run of little bells, like a carillon.
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
  if (!ready() || playFile("bleat")) return;
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
