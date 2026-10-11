// Cards: when a clue turns over, it opens for everyone, saying whose memory
// it belongs to ("🐶 Mathilde's clue, 2 of 3") and listing the clues found so
// far. Clues found in the same round open together, stacked one under the
// other, with a single Close. Found clues reopen with a tap. (Games from
// before clues hid whole memories; those still open as memory cards.)
import { state } from "./state.js";
import { CLUES } from "./lobby.js";

const CARD_DELAY_MS = 900; // let the clue pop up first

const card = document.getElementById("card");
const stack = document.getElementById("card-stack");
const closeButton = document.getElementById("card-close");

const shown = new Set();
let pending = []; // clues found this round, waiting for the pop-up to finish
let timer = null;

// A clue (or an old-style memory) just turned over while I was watching:
// show it once, with any others found at the same moment.
export function queueCard(item) {
  const tag = `${item.memory}:${item.n}`;
  if (!state.joined || shown.has(tag)) return; // not over the lobby
  shown.add(tag);
  pending.push(item);
  timer ??= setTimeout(() => {
    timer = null;
    show(pending);
    pending = [];
  }, CARD_DELAY_MS);
}

// Tapping a found clue on the grid opens it again, on its own.
export function openCard(item) {
  show([item], true);
}

// A card explaining something (a trap), shown straight away.
export function showInfo(info) {
  show([{ info }], true);
}

// A card the first time something happens on this device (a trap).
export function explainOnce(name, info, delay = 0) {
  const storageKey = `higlo:explained:${name}`;
  try {
    if (localStorage.getItem(storageKey)) return;
    localStorage.setItem(storageKey, "1");
  } catch { /* private mode: explain every time */ }
  setTimeout(() => showInfo(info), delay);
}

// Adds the cards to the open stack (or starts a new one).
function show(items, replace = false) {
  if (replace || card.hidden) stack.replaceChildren();
  for (const item of items) {
    const body = cardFor(item);
    if (body) stack.append(body);
  }
  if (!stack.children.length) return;
  card.hidden = false;
  closeButton.focus();
}

function line(className, text, tag = "p") {
  const el = document.createElement(tag);
  el.className = className;
  el.textContent = text;
  return el;
}

function cardFor(item) {
  const body = document.createElement("div");
  body.className = "card-body";
  if (item.info) {
    body.style.setProperty("--c", "#2f7d32");
    body.append(line("card-found", item.info.heading), line("card-text", item.info.text));
    return body;
  }
  const memory = state.memories[item.memory];
  if (!memory) return null;
  const who = `${memory.animal ?? ""} ${memory.name ?? ""}`.trim();
  body.style.setProperty("--c", memory.color ?? "#999");
  if (item.n == null) { // an old-style whole memory
    body.append(line("card-found", "📜 A memory!"), line("card-prompt", memory.prompt ?? ""),
      line("card-text", memory.text), line("card-author", who));
    return body;
  }
  body.append(
    line("card-found", `🔍 ${who}'s clue, ${item.n + 1} of ${CLUES}`),
    line("card-prompt", memory.prompt ?? ""),
    line("card-text", memory.clues?.[item.n] ?? ""),
  );
  // The other clues found so far for this memory, so someone who arrived
  // late (or looked away) can catch up from any card.
  const others = Object.values(state.game?.revealed ?? {})
    .filter((t) => t.show === "clue" && t.memory === item.memory && t.n !== item.n)
    .map((t) => t.n)
    .sort();
  if (others.length) {
    const list = document.createElement("ul");
    list.className = "card-others";
    list.append(line("card-others-label", "Clues found so far:", "li"));
    for (const n of others) list.append(line("", `${n + 1}. ${memory.clues?.[n] ?? ""}`, "li"));
    body.append(list);
  }
  return body;
}

function close() {
  card.hidden = true;
  stack.replaceChildren();
}

closeButton.addEventListener("click", close);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !card.hidden) close();
});
