// Cards: when a clue turns over, it opens for everyone, saying whose memory
// it belongs to ("🐶 Mathilde's clue, 2 of 3"). Each device closes its own.
// Found clues reopen with a tap. (Games from before clues hid whole
// memories; those still open as memory cards.)
import { state } from "./state.js";
import { CLUES } from "./lobby.js";

const CARD_DELAY_MS = 900; // let the clue pop up first

const card = document.getElementById("card");
const heading = document.getElementById("card-found");
const promptText = document.getElementById("card-prompt");
const text = document.getElementById("card-text");
const author = document.getElementById("card-author");
const closeButton = document.getElementById("card-close");

const queue = []; // {memory, n?} waiting, if several turn over in one round
const shown = new Set();

// A clue (or an old-style memory) just turned over while I was watching:
// show it once.
export function queueCard(item) {
  const tag = `${item.memory}:${item.n}`;
  if (!state.joined || shown.has(tag)) return; // not over the lobby
  shown.add(tag);
  setTimeout(() => {
    queue.push(item);
    if (card.hidden) showNext();
  }, CARD_DELAY_MS);
}

// A card explaining something (the sheep), shown straight away.
export function showInfo(info) {
  queue.unshift({ info });
  showNext();
}

// Tapping a found clue on the grid opens it again.
export function openCard(item) {
  queue.unshift(item);
  showNext();
}

function showNext() {
  const item = queue.shift();
  if (item?.info) {
    heading.textContent = item.info.heading;
    promptText.textContent = "";
    text.textContent = item.info.text;
    author.textContent = "";
    card.style.setProperty("--c", "#2f7d32");
    card.hidden = false;
    closeButton.focus();
    return;
  }
  const memory = item && state.memories[item.memory];
  if (!memory) {
    card.hidden = true;
    return;
  }
  const who = `${memory.animal ?? ""} ${memory.name ?? ""}`.trim();
  promptText.textContent = memory.prompt ?? "";
  card.style.setProperty("--c", memory.color ?? "#999");
  if (item.n == null) {
    heading.textContent = "📜 A memory!";
    text.textContent = memory.text;
    author.textContent = who;
  } else {
    heading.textContent = `🔍 ${who}'s clue, ${item.n + 1} of ${CLUES}`;
    text.textContent = memory.clues?.[item.n] ?? "";
    author.textContent = "";
  }
  card.hidden = false;
  closeButton.focus();
}

closeButton.addEventListener("click", showNext);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !card.hidden) showNext();
});
