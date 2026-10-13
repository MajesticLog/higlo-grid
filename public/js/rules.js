// How to play: four cards that show rather than tell (playtest 6: too much
// text, too many cards). Each has a little scene on a 3x3 patch of the
// garden, playing on a loop (style.css, "How to play"), and one line.
// Opened with the ❓ button (which glows for newcomers).
import { PICTURES } from "./game.js";
import { CLUES } from "./lobby.js";
import { playTutorial } from "./tutorial.js";

const SEEN_KEY = "higlo:rules-seen";

// A 3x3 patch of tall grass: `cell(i)` fills square i (0..8, row by row).
const patch = (cell, extra = "") =>
  `<div class="demo-grid">${[...Array(9).keys()].map((i) => `<div class="demo-cell">${cell(i)}</div>`).join("")}${extra}</div>`;
const pic = (icon, className = "") => `<span class="demo-pic ${className}">${icon}</span>`;

// The patch on the first two cards: snails in two corners (top right,
// bottom left). Built when the rules open: game.js may still be loading
// when this module runs.
const snail = () => PICTURES[2];
const patchPictures = () => {
  const [flower, tulip, , caterpillar, mushroom, bird] = PICTURES;
  return [flower, mushroom, snail(), bird, tulip, caterpillar, snail(), flower, mushroom];
};

const CARDS = [
  {
    title: "Remember the golden patch",
    still: 0.55, // with less motion: the pictures showing
    // It glows gold, "Ready?", its pictures show, the grass grows back.
    scene: () => patch((i) => pic(patchPictures()[i]), '<div class="demo-zone"></div><div class="demo-ready">Ready?</div>'),
    text: () => "Watch the patch that glows gold, and remember its pictures together.",
  },
  {
    title: "Find it together",
    still: 0.8, // on the snails, ready
    // The card asks for a snail; the sheep eats the grass where there's none;
    // two players walk onto the snails and tap Ready; the snails show.
    scene: () => `<div class="demo-target">${snail()}</div>`
      + patch((i) => (patchPictures()[i] === snail() ? pic(snail(), "found") : '<span class="demo-short"></span>'),
        '<span class="demo-sheep">🐑</span>'
        + '<span class="demo-player a"><span class="demo-tick">✓</span></span>'
        + '<span class="demo-player b"><span class="demo-tick">✓</span></span>'),
    text: () => `Each go to a ${snail()} on a different square, and tap ✓. Stuck? Your 🐑 eats the grass where it isn't.`,
  },
  {
    title: "A clue, or the night",
    still: 0.95, // the wolf
    // Found: a clue card turns over. Missed: the day moves on, until the wolf.
    scene: () => '<div class="demo-sky"><span class="demo-sun">☀️</span><span class="demo-moon">🌙</span>'
      + '<span class="demo-wolf">🐺</span><span class="demo-mark yes">✅</span><span class="demo-mark no">❌</span>'
      + `<span class="demo-clue">🔍 Clue 1 of ${CLUES}</span></div>`,
    text: () => "Found it: a clue. Missed: the day moves on. At night, the 🐺 sends everyone to bed!",
  },
  {
    title: "Guess the memory",
    still: 0.85, // the clues, the guess, hurray
    // The clues, one by one, then a guess, then hurray.
    scene: () => '<div class="demo-guess">'
      + ["🏖️ By the sea", "🍦 Ice cream", "☔ It rained"].map((c, i) => `<span class="demo-clue-line n${i + 1}">${c}</span>`).join("")
      + '<span class="demo-think">💭 Our holiday in Brittany!</span><span class="demo-cheer">🎉</span></div>',
    text: () => `With ${CLUES} clues, guess the memory: type it, or say it out loud! Think you know sooner? Tap 💡, then "Ready to guess!"`,
  },
];

const box = document.getElementById("rules");
const scene = document.getElementById("rules-picture");
const title = document.getElementById("rules-title");
const text = document.getElementById("rules-text");
const dots = document.getElementById("rules-dots");
const backButton = document.getElementById("rules-back");
const nextButton = document.getElementById("rules-next");
let page = 0;

function draw() {
  const card = CARDS[page];
  scene.innerHTML = card.scene(); // our own markup, above
  scene.style.setProperty("--still", String(-card.still));
  title.textContent = card.title;
  text.textContent = card.text();
  dots.replaceChildren(...CARDS.map((_, i) => {
    const dot = document.createElement("span");
    dot.className = i === page ? "dot on" : "dot";
    return dot;
  }));
  dots.setAttribute("aria-label", `Card ${page + 1} of ${CARDS.length}`);
  backButton.hidden = page === 0;
  nextButton.textContent = page === CARDS.length - 1 ? "Let's play! 🌱" : "Next ➜";
}

export function openRules() {
  page = 0;
  draw();
  box.hidden = false;
  nextButton.focus();
}

// The rules never open by themselves (a window in the way; and links opened
// from a messaging app often forget they've been shown). Instead, the ❓
// pulses, with an arrow pointing at it, for anyone who hasn't opened it yet
// on this device.
const helpButton = document.getElementById("help");

export function hintHelp() {
  let seen = false;
  try { seen = Boolean(localStorage.getItem(SEEN_KEY)); } catch { /* can't remember: glow */ }
  helpButton.classList.toggle("glow", !seen);
}

function rulesSeen() {
  helpButton.classList.remove("glow");
  try { localStorage.setItem(SEEN_KEY, "1"); } catch { /* fine */ }
}

nextButton.addEventListener("click", () => {
  if (page === CARDS.length - 1) {
    box.hidden = true;
    return;
  }
  page += 1;
  draw();
});
backButton.addEventListener("click", () => {
  page = Math.max(0, page - 1);
  draw();
});
document.getElementById("rules-close").addEventListener("click", () => { box.hidden = true; });
// The practice garden (tutorial.js), any time.
document.getElementById("rules-tutorial").addEventListener("click", () => {
  box.hidden = true;
  playTutorial();
});
helpButton.addEventListener("click", () => {
  rulesSeen();
  openRules();
});
document.addEventListener("keydown", (e) => {
  if (box.hidden) return;
  if (e.key === "Escape") box.hidden = true;
  if (e.key === "ArrowRight") nextButton.click();
  if (e.key === "ArrowLeft" && page > 0) backButton.click();
});
