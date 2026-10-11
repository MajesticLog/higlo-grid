// Memory cards: when a memory turns over, it opens for everyone, with who
// wrote it. Each device closes its own card. Found memories reopen with a tap.
import { state } from "./state.js";

const CARD_DELAY_MS = 900; // let the 📜 pop up first

const card = document.getElementById("card");
const promptText = document.getElementById("card-prompt");
const text = document.getElementById("card-text");
const author = document.getElementById("card-author");
const closeButton = document.getElementById("card-close");

const queue = []; // memory ids waiting, if several turn over in one round
const shown = new Set();

// A memory just turned over while I was watching: show it once.
export function queueCard(id) {
  if (shown.has(id)) return;
  shown.add(id);
  setTimeout(() => {
    queue.push(id);
    if (card.hidden) showNext();
  }, CARD_DELAY_MS);
}

// Tapping a found memory on the grid opens it again.
export function openCard(id) {
  queue.unshift(id);
  showNext();
}

function showNext() {
  const id = queue.shift();
  const memory = id && state.memories[id];
  if (!memory) {
    card.hidden = true;
    return;
  }
  promptText.textContent = memory.prompt ?? "";
  text.textContent = memory.text;
  author.textContent = `${memory.animal ?? ""} ${memory.name ?? ""}`.trim();
  card.style.setProperty("--c", memory.color ?? "#999");
  card.hidden = false;
  closeButton.focus();
}

closeButton.addEventListener("click", showNext);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !card.hidden) showNext();
});
