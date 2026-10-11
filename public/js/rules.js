// How to play: a few cards, mostly pictures and few words, shown once per
// device after the lobby and reopened with the ❔ button. The numbers come
// from the game's settings, so the rules stay true when they're tuned.
import { SHEEP_LENGTH, SHEEP_PER_PLAYER } from "./rounds.js";
import { NIGHT_STEPS } from "./game.js";
import { CLUES } from "./lobby.js";

const SEEN_KEY = "higlo:rules-seen";

const CARDS = [
  {
    picture: "🌱🔍🌱",
    title: "Find the clues together",
    text: `Under the grass are ${CLUES} clues to each player's memory. Find them, then guess the memories!`,
  },
  {
    picture: "👆 ✓",
    title: "Pick a square",
    text: "Each round, everyone taps any square, then ✓ Ready. Footprints show your way. "
      + "The square you land on turns over, and so does the grass you walk through: "
      + "watch out, a trap on your way goes off! A clue you pass shows 🔍! until someone lands on it.",
  },
  {
    picture: "🐶 ① ② ③",
    title: "Clues",
    text: "A clue shows whose memory it belongs to: their animal and colour, and its number. "
      + `Each player's ${CLUES} clues are hidden near each other, so look around a clue or a 🔍!`,
  },
  {
    picture: "💭 🗣️ ✅",
    title: "Guess the memory",
    text: `When all ${CLUES} clues of a memory are found, everyone guesses what it is: `
      + "type it, or say it out loud. The person who wrote it says if you got it!",
  },
  {
    picture: "🪤 ☀️ 🌅 🌙 🐺",
    title: "Watch out for traps",
    text: `Each trap makes the sky darker. Turn over ${NIGHT_STEPS} traps and night falls: `
      + "the wolf comes out and everyone runs off to bed! Find all the clues before then.",
  },
  {
    picture: "🐑".repeat(SHEEP_PER_PLAYER),
    title: "Your sheep",
    text: `Instead of turning over a square, send a sheep: it grazes ${SHEEP_LENGTH} squares in a line. `
      + `It won't touch a clue or a trap, and leaves a ❓ there. You have ${SHEEP_PER_PLAYER} sheep each game.`,
  },
  {
    picture: "🧺",
    title: "The memory chest",
    text: "Every memory you find goes in the chest at the top. Read them again any time, or save them to keep.",
  },
];

const box = document.getElementById("rules");
const picture = document.getElementById("rules-picture");
const title = document.getElementById("rules-title");
const text = document.getElementById("rules-text");
const dots = document.getElementById("rules-dots");
const backButton = document.getElementById("rules-back");
const nextButton = document.getElementById("rules-next");
let page = 0;

function draw() {
  const card = CARDS[page];
  picture.textContent = card.picture;
  title.textContent = card.title;
  text.textContent = card.text;
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

// After the lobby: the first time on this device only.
export function rulesOnce() {
  try {
    if (localStorage.getItem(SEEN_KEY)) return;
    localStorage.setItem(SEEN_KEY, "1");
  } catch { /* private mode: show them each visit */ }
  openRules();
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
document.getElementById("help").addEventListener("click", openRules);
document.addEventListener("keydown", (e) => {
  if (box.hidden) return;
  if (e.key === "Escape") box.hidden = true;
  if (e.key === "ArrowRight") nextButton.click();
  if (e.key === "ArrowLeft" && page > 0) backButton.click();
});
