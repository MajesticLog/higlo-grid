// Sounds made in the browser with the Web Audio API: no audio files, no
// licences. Browsers only allow sound after a tap or key press, so the
// audio starts on the first one. A button turns sound off (remembered).
const MUTE_KEY = "higlo:muted";

let ctx = null;
let muted = false;
try { muted = localStorage.getItem(MUTE_KEY) === "1"; } catch { /* private mode: sound on */ }

function unlock() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return; }
  }
  if (ctx.state === "suspended") ctx.resume();
}
document.addEventListener("pointerdown", unlock);
document.addEventListener("keydown", unlock);

const ready = () => ctx && ctx.state === "running" && !muted;

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
  if (!ready()) return;
  const t = ctx.currentTime + 0.05;
  const brass = { type: "sawtooth", volume: 0.08, filter: 1800 };
  for (const [freq, at, length] of [
    [392, 0, 0.14], [523, 0.15, 0.14], [659, 0.3, 0.14], [784, 0.45, 0.45],
    [659, 0.95, 0.14], [784, 1.1, 0.7],
  ]) note(freq, t + at, length, brass);
}

// A soft, faraway howl: a gentle rise and fall with a little wobble.
export function playHowl() {
  if (!ready()) return;
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

// --- The sound on/off button ---
const button = document.getElementById("sound");

function showButton() {
  button.textContent = muted ? "🔇 Sound off" : "🔊 Sound on";
  button.setAttribute("aria-pressed", String(!muted));
}

button.addEventListener("click", () => {
  muted = !muted;
  try { localStorage.setItem(MUTE_KEY, muted ? "1" : "0"); } catch { /* fine */ }
  showButton();
});
showButton();
