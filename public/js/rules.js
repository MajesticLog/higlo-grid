// How to play: a few cards, mostly pictures and few words, opened with the
// ❓ button (which glows for newcomers). The numbers come
// from the game's settings, so the rules stay true when they're tuned.
import { FLASH_MS } from "./rounds.js";
import { NIGHT_STEPS, PICTURES } from "./game.js";
import { CLUES } from "./lobby.js";

const SEEN_KEY = "higlo:rules-seen";

const CARDS = [
  {
    picture: PICTURES.join(""),
    title: "The garden",
    text: "Under the grass hide garden pictures, 8 of each. They stay in the same places all game.",
  },
  {
    picture: "👀 🌷 🐌",
    title: "Remember them together",
    text: `Each round, a few squares show their pictures for ${FLASH_MS / 1000} seconds. `
      + "Remember them together: you don't know yet which one you'll need!",
  },
  {
    picture: "🐌 👆 ✓",
    title: "Find the picture",
    text: "Then a card shows the picture to find. Everyone goes to a different square where they "
      + "remember one, and taps ✓ Ready (or presses Enter).",
  },
  {
    picture: "✅ 🌙 🐺",
    title: "A clue, or the night",
    text: "If at least half of you find it, you earn a clue to someone's memory. If not, the night "
      + `falls a little. After ${NIGHT_STEPS} misses, the wolf comes out and everyone runs off to bed!`,
  },
  {
    picture: "💭 🗣️ ✅",
    title: "Guess the memory",
    text: `With ${CLUES} clues, everyone guesses what the memory is: type it, or say it out loud. `
      + "The person who wrote it says if you got it! Think you know sooner? Open 💡 and tap Ready to guess.",
  },
  {
    picture: "🐑",
    title: "Your sheep",
    text: "Once per game, tap 🐑 and place your sheep on a square. It grazes all around it, and shows "
      + "where the picture isn't. Then choose your square as usual.",
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

// The rules never open by themselves (a window in the way; and links opened
// from a messaging app often forget they've been shown). Instead, the ❓
// glows for anyone who hasn't opened it yet on this device.
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
