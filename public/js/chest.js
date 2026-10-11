// The memory chest: every memory this family has found, game by game, newest
// first, to read again together or save as a page to keep. It lives on the
// family link, so it grows from one game to the next.
import { state } from "./state.js";

const button = document.getElementById("chest");
const count = document.getElementById("chest-count");
const panel = document.getElementById("chest-panel");
const list = document.getElementById("chest-list");
const hiddenNote = document.getElementById("chest-hidden");
const saveButton = document.getElementById("chest-save");

const found = () => Object.values(state.memories).filter((m) => m.foundAt);

// Found memories grouped by the game they were found in, newest game first,
// each group in the order its memories turned up.
function byGame() {
  const games = new Map();
  for (const m of found().sort((a, b) => a.foundAt - b.foundAt)) {
    const id = m.gameId ?? "earlier";
    if (!games.has(id)) games.set(id, []);
    games.get(id).push(m);
  }
  return [...games.values()].sort((a, b) => b[0].foundAt - a[0].foundAt);
}

const dateOf = (time) => new Date(time).toLocaleString(undefined, {
  weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit",
});
const author = (m) => `${m.animal ?? ""} ${m.name ?? ""}`.trim();

// The button's badge: how many memories are in the chest.
export function renderChest() {
  const n = found().length;
  count.textContent = n;
  count.hidden = n === 0;
  button.setAttribute("aria-label", `Memory chest, ${n} ${n === 1 ? "memory" : "memories"}`);
  if (!panel.hidden) fill(); // a memory found while the chest is open
}

function fill() {
  list.replaceChildren();
  const games = byGame();
  if (games.length === 0) {
    const empty = document.createElement("p");
    empty.className = "chest-empty";
    empty.textContent = "The chest is empty for now. Memories you find in the field will be kept here.";
    list.append(empty);
  }
  for (const memories of games) {
    const section = document.createElement("section");
    const heading = document.createElement("h3");
    heading.textContent = dateOf(memories[0].foundAt);
    const items = document.createElement("ul");
    for (const m of memories) {
      const item = document.createElement("li");
      item.style.setProperty("--c", m.color ?? "#999");
      for (const [className, text] of [["end-prompt", m.prompt ?? ""], ["end-text", m.text], ["end-by", author(m)]]) {
        const span = document.createElement("span");
        span.className = className;
        span.textContent = text;
        item.append(span);
      }
      items.append(item);
    }
    section.append(heading, items);
    list.append(section);
  }
  const waiting = Object.values(state.memories).length - found().length;
  hiddenNote.textContent = waiting > 0
    ? `🌱 ${waiting} ${waiting === 1 ? "memory is" : "memories are"} still hidden in the field.`
    : "";
  saveButton.hidden = games.length === 0;
}

function open() {
  fill();
  panel.hidden = false;
  document.getElementById("chest-close").focus();
}

function close() {
  panel.hidden = true;
  button.focus();
}

// --- Saving: one small web page with every memory, readable offline and
// printable, made on the device (nothing is sent anywhere). ---
const escape = (text) => String(text).replace(/[&<>"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[c]);

function savePage() {
  const sections = byGame().map((memories) => `
    <section>
      <h2>${escape(dateOf(memories[0].foundAt))}</h2>
      ${memories.map((m) => `
        <article style="border-color:${escape(m.color ?? "#999")}">
          <p class="prompt">${escape(m.prompt ?? "")}</p>
          <p class="text">${escape(m.text)}</p>
          <p class="by">${escape(author(m))}</p>
        </article>`).join("")}
    </section>`).join("");
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Our family memories</title>
<style>
  body { margin: 0; padding: 24px 16px; background: #fffaf0; color: #222; font-family: system-ui, sans-serif; }
  main { max-width: 640px; margin: 0 auto; }
  h1 { text-align: center; }
  h2 { margin-top: 32px; font-size: 18px; color: #555; }
  article { margin: 12px 0; padding: 12px 16px; border-left: 6px solid #999; border-radius: 12px; background: #fff; break-inside: avoid; }
  .prompt { margin: 0; font-style: italic; color: #666; font-size: 14px; }
  .text { margin: 6px 0; font-size: 18px; white-space: pre-wrap; }
  .by { margin: 0; font-weight: 700; }
</style>
</head>
<body><main><h1>🧺 Our family memories</h1>${sections}</main></body>
</html>`;
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  link.download = `family-memories-${new Date().toISOString().slice(0, 10)}.html`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

button.addEventListener("click", open);
document.getElementById("chest-close").addEventListener("click", close);
saveButton.addEventListener("click", savePage);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !panel.hidden) close();
});
