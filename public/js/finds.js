// Family memories found without their author (guess.js): coming back, the
// author sees who found theirs, whether they guessed it, and their notes, in
// a window that opens once per new find ("🎉 Zoé found your memory!"). The
// memory chest keeps them in a section only the author and the finders see,
// since the rest of the family hasn't found them yet.
import { state } from "./state.js";
import { sessionId } from "./session.js";
import { foundKey } from "./lobby.js";
import { isAuthor } from "./guess.js";
import { noteBox } from "./notes.js";

const box = document.getElementById("finds");
const title = document.getElementById("finds-title");
const list = document.getElementById("finds-list");
const who = (p) => `${p.animal ?? ""} ${p.name ?? ""}`.trim();

// Open family memories, still hidden from the family, that someone found
// alone, and that I may see: I wrote it, or I found it too.
export function foundAlone() {
  const me = state.me.author ? foundKey(state.me.author) : null;
  return Object.entries(state.memories)
    .map(([id, m]) => ({ ...m, id }))
    .filter((m) => m.open && !m.revealedAt && m.foundBy)
    .filter((m) => isAuthor(state.me, m) || (me && m.foundBy[me]));
}

const findersOf = (m) => Object.values(m.foundBy ?? {}).sort((a, b) => a.at - b.at);

// One memory as a list item: its theme, its words, who wrote it, who found
// it, and its notes (with a box to add one).
export function foundItem(m) {
  const item = document.createElement("li");
  item.style.setProperty("--c", m.color ?? "#999");
  const finders = findersOf(m).map((f) => `${who(f)}${f.guessed ? " ✅" : ""}`).join(", ");
  for (const [className, text] of [
    ["end-prompt", m.prompt ?? ""], ["end-text", m.text], ["end-by", who(m)], ["found-by", `🔍 Found by ${finders}`],
  ]) {
    const span = document.createElement("span");
    span.className = className;
    span.textContent = text;
    item.append(span);
  }
  item.append(noteBox(m.id, { folded: true }));
  return item;
}

// --- The welcome: new finds of my memories, once ---
// When I last saw them, per family link and author (this device).
const seenKey = () => `higlo:${sessionId}:finds-seen:${foundKey(state.me.author ?? "")}`;
function seenUntil() {
  try { return Number(localStorage.getItem(seenKey())) || 0; } catch { return 0; }
}

function newFinds() {
  const since = seenUntil();
  return foundAlone()
    .filter((m) => isAuthor(state.me, m))
    .filter((m) => findersOf(m).some((f) => f.at > since));
}

let shownUntil = 0; // the latest find in the window
setInterval(() => {
  if (!state.joined || !box.hidden || !state.me.author) return;
  if (document.querySelector('[role="dialog"]:not([hidden])')) return; // one window at a time
  const finds = newFinds();
  if (finds.length === 0) return;
  shownUntil = Math.max(...finds.flatMap((m) => findersOf(m).map((f) => f.at)));
  const first = findersOf(finds[0]).at(-1);
  title.textContent = finds.length === 1
    ? `🎉 ${who(first)} found your memory!`
    : "🎉 The family found your memories!";
  const items = document.createElement("ul");
  items.append(...finds.map(foundItem));
  list.replaceChildren(items);
  box.hidden = false;
  document.getElementById("finds-close").focus();
}, 1000);

document.getElementById("finds-close").addEventListener("click", () => {
  try { localStorage.setItem(seenKey(), String(shownUntil)); } catch { /* shown again next time */ }
  box.hidden = true;
});
