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
const others = document.getElementById("card-others");
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

// A card the first time something happens on this device (a sheep, a trap).
export function explainOnce(name, info, delay = 0) {
  const storageKey = `higlo:explained:${name}`;
  try {
    if (localStorage.getItem(storageKey)) return;
    localStorage.setItem(storageKey, "1");
  } catch { /* private mode: explain every time */ }
  setTimeout(() => showInfo(info), delay);
}

// Tapping a found clue on the grid opens it again.
export function openCard(item) {
  queue.unshift(item);
  showNext();
}

function showNext() {
  const item = queue.shift();
  others.replaceChildren();
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
    // The other clues found so far for this memory, so someone who arrived
    // late (or looked away) can catch up from any card.
    const found = Object.values(state.game?.revealed ?? {})
      .filter((t) => t.show === "clue" && t.memory === item.memory && t.n !== item.n)
      .map((t) => t.n)
      .sort();
    for (const n of found) {
      const li = document.createElement("li");
      li.textContent = `${n + 1}. ${memory.clues?.[n] ?? ""}`;
      others.append(li);
    }
    if (found.length) {
      const label = document.createElement("li");
      label.className = "card-others-label";
      label.textContent = "Clues found so far:";
      others.prepend(label);
    }
  }
  card.hidden = false;
  closeButton.focus();
}

closeButton.addEventListener("click", showNext);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !card.hidden) showNext();
});
