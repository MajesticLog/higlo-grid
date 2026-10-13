// Lobby: pick an animal and a colour, then write a memory and 3 clues to it.
// The clues get hidden in the field; the memory is what the others guess.
import { push, onValue, onDisconnect, runTransaction, serverTimestamp } from "./firebase.js";
import { sessionId, sessionRef, playersRef } from "./session.js";

export const COLOURS = [
  { name: "red", value: "#e4572e" }, { name: "blue", value: "#2e86ab" },
  { name: "yellow", value: "#f4c430" }, { name: "green", value: "#4caf50" },
  { name: "purple", value: "#9c27b0" }, { name: "orange", value: "#ff8c42" },
  { name: "teal", value: "#17bebb" }, { name: "pink", value: "#e91e63" },
  { name: "brown", value: "#795548" }, { name: "indigo", value: "#3f51b5" },
  { name: "lime", value: "#8bc34a" }, { name: "grey", value: "#607d8b" },
];
export const ANIMALS = [
  "🐱", "🐶", "🐸", "🦊", "🐻", "🐰", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷",
  "🐵", "🐔", "🐧", "🐙", "🦉", "🐢", "🦄", "🐝", "🐳", "🦋", "🐌", "🦔",
];
// Themes keep memories guessable: knowing it's "food" narrows it down. Each
// comes with an example memory and clues, shown as placeholders.
export const CATEGORIES = [
  { id: "places", icon: "🏡", label: "Places from our youth",
    example: ["Grandma's garden", "There was a swing", "It smelled of roses", "We went every summer"] },
  { id: "food", icon: "🍲", label: "Food",
    example: ["Grandpa's pancakes", "On Sunday mornings", "Far too much sugar", "He flipped them in the air"] },
  { id: "holidays", icon: "🏖️", label: "Holidays",
    example: ["Camping by the lake", "The tent leaked", "We saw a deer", "It rained all week"] },
  { id: "toys", icon: "🧸", label: "Toys and games",
    example: ["My red bike", "It had a bell", "A birthday present", "I fell off it in the park"] },
  { id: "animals", icon: "🐾", label: "Pets and animals",
    example: ["Our cat Moustache", "Black and white", "She slept on the piano", "She hated the hoover"] },
  { id: "music", icon: "🎵", label: "Songs and music",
    example: ["Singing in the car", "On long drives", "Always the same cassette", "Dad knew all the words"] },
  { id: "funny", icon: "😂", label: "Funny moments",
    example: ["The cake on the floor", "It was a birthday", "Chocolate everywhere", "The dog was delighted"] },
  { id: "secret", icon: "🤫", label: "A secret about me",
    example: ["I can juggle", "I learned as a teenager", "With three balls", "I practised in my room"] },
];
export const CLUES = 3;
const KINDS = ["animals", "colors"]; // database nodes: animals/<i>, colors/<i>

// --- Remembering who I am ---
// sessionStorage lives as long as the tab, refreshes included, so a refresh
// brings me straight back. localStorage remembers my last animal and colour
// for this link, to preselect them on my next visit.
function read(storage, key) {
  try { return JSON.parse(window[storage].getItem(key)) ?? {}; } catch { return {}; }
}
function write(storage, key, data) {
  try { window[storage].setItem(key, JSON.stringify(data)); } catch { /* private mode: fine */ }
}
const TAB_KEY = `higlo:${sessionId}:tab`;
const LAST_KEY = `higlo:${sessionId}:last`;
const tab = read("sessionStorage", TAB_KEY); // {id, choice?, memoryDone?}
tab.id ??= Math.random().toString(36).slice(2, 10);
write("sessionStorage", TAB_KEY, tab);

// This device, for good (all family links): with the player's name it makes
// an author key, so a memory's author is recognised on a later visit even
// with another animal or colour, and two people sharing a device stay apart.
const device = (() => {
  const saved = read("localStorage", "higlo:device");
  if (saved.id) return saved.id;
  const id = Math.random().toString(36).slice(2, 12);
  write("localStorage", "higlo:device", { id });
  return id;
})();
export const authorKey = (name) => `${device}:${name.trim().toLowerCase()}`;

// --- Claiming an animal or a colour ---
// A transaction writes my tab id into the slot only if it's free (or already
// mine), so two players can never hold the same one. The server frees it when
// I disconnect. Owners are tab ids, not player ids, so a refresh can reclaim.
const slotRef = (kind, i) => sessionRef(`${kind}/${i}`);

async function claim(kind, i) {
  const slot = slotRef(kind, i);
  const result = await runTransaction(slot, (owner) =>
    owner === null || owner === tab.id ? tab.id : undefined); // undefined = abort
  if (!result.committed) return false;
  await onDisconnect(slot).remove();
  return true;
}

function release(kind, i) {
  if (i == null) return;
  const slot = slotRef(kind, i);
  onDisconnect(slot).cancel();
  runTransaction(slot, (owner) => (owner === tab.id ? null : undefined));
}

// Who holds what, live: index -> tab id.
const taken = { animals: new Map(), colors: new Map() };
const choice = { animals: null, colors: null };
let done = false;

for (const kind of KINDS) {
  onValue(sessionRef(kind), (snap) => {
    taken[kind] = new Map();
    snap.forEach((child) => { taken[kind].set(Number(child.key), child.val()); });
    // After a network drop, or a refresh racing the old tab's clean-up, the
    // server may free my slot: take it back.
    if (done && !taken[kind].has(choice[kind])) claim(kind, choice[kind]);
    updatePicker();
  });
}

// --- The picker ---
const lobby = document.getElementById("lobby");
const pickStep = document.getElementById("pick");
const writeStep = document.getElementById("write");
const preview = document.getElementById("preview");
const pickDone = document.getElementById("pick-done");
const nameInput = document.getElementById("name");
const playerName = () => nameInput.value.trim();
nameInput.addEventListener("input", () => updatePicker());

function choiceButtons(containerId, items, kind, setUp) {
  const container = document.getElementById(containerId);
  return items.map((item, i) => {
    const b = document.createElement("button");
    b.type = "button";
    setUp(b, item);
    b.addEventListener("click", () => choose(kind, i));
    container.append(b);
    return b;
  });
}

const buttons = {
  animals: choiceButtons("animals", ANIMALS, "animals", (b, a) => { b.textContent = a; }),
  colors: choiceButtons("colours", COLOURS, "colors", (b, c) => {
    b.style.backgroundColor = c.value; // not `background`: keeps the "taken" cross line
    b.setAttribute("aria-label", c.name);
  }),
};

function updatePicker() {
  for (const kind of KINDS) {
    buttons[kind].forEach((b, i) => {
      const owner = taken[kind].get(i);
      b.disabled = owner != null && owner !== tab.id; // someone else has it
      b.setAttribute("aria-pressed", choice[kind] === i);
    });
  }
  preview.style.background = COLOURS[choice.colors]?.value ?? "#ddd";
  preview.querySelector(".animal").textContent = ANIMALS[choice.animals] ?? "?";
  pickDone.disabled = !playerName() || choice.animals == null || choice.colors == null;
}

async function choose(kind, i) {
  if (choice[kind] === i) return;
  const previous = choice[kind];
  choice[kind] = i; // show it straight away; undone below if someone beat me
  updatePicker();
  if (await claim(kind, i)) {
    if (choice[kind] === i) release(kind, previous);
    else release(kind, i); // I tapped something else meanwhile
  } else if (choice[kind] === i) {
    choice[kind] = previous;
    updatePicker();
  }
}

// Players already in the field, so you know who you're joining.
const here = document.getElementById("here");
onValue(playersRef, (snap) => {
  const names = [];
  snap.forEach((child) => {
    const p = child.val();
    names.push(`${p.animal ?? ""} ${p.name ?? ""}`.trim());
  });
  here.textContent = names.length
    ? `Already in the field: ${names.join(", ")}`
    : "Nobody in the field yet. Share the link below so others can join.";
});

// --- Hiding a memory: a theme, the memory in a few words, 3 clues ---
const form = document.getElementById("write");
const memory = document.getElementById("memory");
const clues = [...Array(CLUES)].map((_, i) => document.getElementById(`clue-${i + 1}`));
const fields = document.getElementById("memory-fields");
const hideButton = document.getElementById("hide");
let category = null;

const categoryButtons = CATEGORIES.map((c) => {
  const b = document.createElement("button");
  b.type = "button";
  b.innerHTML = `<span class="category-icon"></span><span class="category-label"></span>`;
  b.querySelector(".category-icon").textContent = c.icon;
  b.querySelector(".category-label").textContent = c.label;
  b.addEventListener("click", () => chooseCategory(c));
  document.getElementById("categories").append(b);
  return b;
});

// Picking a theme shows the fields, with that theme's example as a guide.
function chooseCategory(c) {
  category = c;
  categoryButtons.forEach((b, i) => b.setAttribute("aria-pressed", String(CATEGORIES[i] === c)));
  const [example, ...exampleClues] = c.example;
  memory.placeholder = `For example: ${example}`;
  clues.forEach((input, i) => { input.placeholder = exampleClues[i]; });
  fields.hidden = false;
  updateHide();
  memory.focus();
}

const openBox = document.getElementById("open"); // "The family can find it even when I'm not here"

// Ready to hide once there's a theme, a memory and all 3 clues.
function updateHide() {
  hideButton.disabled = !category || !memory.value.trim() || clues.some((c) => !c.value.trim());
}
for (const input of [memory, ...clues]) input.addEventListener("input", updateHide);

// Resolves with "done" (hidden, or skipped) or "back" (to the name, animal
// and colour step). What's typed stays in the fields either way.
let finishWriting = null;
const writeMemory = () => {
  showKeep();
  showFamily();
  return new Promise((resolve) => { finishWriting = resolve; });
};

// My memory for this game (kept, or just written), so the field hides its
// clues. Only memories of players who are here get hidden.
export const myMemoryId = () => tab.memoryId ?? null;
function useMemory(id) {
  tab.memoryId = id;
  write("sessionStorage", TAB_KEY, tab);
}

// A family memory I chose to find (left open by someone else), brought into
// the game with mine.
export const visitMemoryId = () => tab.visitId ?? null;
function useVisit(id) {
  tab.visitId = id;
  write("sessionStorage", TAB_KEY, tab);
}

// Where a player is recorded on a memory they found without its author
// (memories/<id>/foundBy/<key>): their author key, made safe for a database key.
export const foundKey = (author) => author.replace(/[.#$/[\]]/g, "_");

// A memory of mine still waiting to be guessed can be kept for this game.
let memories = {};
onValue(sessionRef("memories"), (snap) => { memories = snap.val() || {}; });
const keepBox = document.getElementById("keep");
let keepId = null;

function showKeep() {
  const mine = Object.entries(memories)
    .filter(([, m]) => m.author === authorKey(playerName()) && m.clues && !m.revealedAt)
    .sort(([, a], [, b]) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  keepId = mine[0]?.[0] ?? null;
  keepBox.hidden = !keepId;
  if (keepId) {
    const m = mine[0][1];
    document.getElementById("keep-text").textContent = `${m.prompt ?? ""}: “${m.text}”`;
  }
}

// Memories the family left open, by someone else, still waiting to be
// guessed together, that I haven't found yet. Only who wrote it and its
// theme show, never its words. The author is recognised by device and name
// (lobby.js), and by name alone too, in case they're on another device.
const familyBox = document.getElementById("family");
const familyList = document.getElementById("family-list");
const skipButton = document.getElementById("skip");

function showFamily() {
  const me = authorKey(playerName());
  const open = Object.entries(memories)
    .filter(([, m]) => m.open && m.clues?.length === CLUES && !m.revealedAt)
    .filter(([, m]) => m.author !== me && m.name?.trim().toLowerCase() !== playerName().trim().toLowerCase())
    .filter(([, m]) => !m.foundBy?.[foundKey(me)])
    .sort(([, a], [, b]) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  if (!open.some(([id]) => id === tab.visitId)) useVisit(null);
  familyBox.hidden = open.length === 0;
  familyList.replaceChildren(...open.map(([id, m]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "family-pick";
    b.textContent = `${m.animal ?? ""} ${m.name ?? ""} · ${m.prompt ?? ""}`.trim();
    b.setAttribute("aria-pressed", String(id === tab.visitId));
    b.addEventListener("click", () => {
      useVisit(id === tab.visitId ? null : id); // tap again to change my mind
      showFamily();
    });
    return b;
  }));
  // With one chosen, there's no need to write: "skip" becomes "just this one".
  skipButton.textContent = tab.visitId ? "Find this memory 🔍" : "Skip for now";
}

document.getElementById("keep-it").addEventListener("click", () => {
  if (!keepId || !finishWriting) return;
  useMemory(keepId);
  finishWriting("done");
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  updateHide();
  if (hideButton.disabled || !finishWriting) return;
  // Memories belong to the family link, not to this game or this tab. An
  // open one can also be found by someone playing without me (guess.js).
  const ref = push(sessionRef("memories"), {
    text: memory.value.trim(),
    category: category.id,
    prompt: `${category.icon} ${category.label}`,
    clues: clues.map((c) => c.value.trim()),
    open: openBox.checked,
    ...identity(),
    createdAt: serverTimestamp(),
  });
  useMemory(ref.key);
  finishWriting("done");
});
document.getElementById("skip").addEventListener("click", () => {
  useMemory(null);
  finishWriting?.("done");
});
document.getElementById("write-back").addEventListener("click", () => finishWriting?.("back"));

// --- The whole lobby: resolves with {animal, color} once I'm ready for the field ---
export async function runLobby() {
  // Start from this tab's choice (a refresh) or my last visit's.
  const start = tab.choice ?? read("localStorage", LAST_KEY);
  nameInput.value = start.name ?? "";
  const claimed = await Promise.all(KINDS.map(async (kind) => {
    const i = start[kind];
    if (i == null || !(await claim(kind, i))) return false;
    choice[kind] = i;
    return true;
  }));
  updatePicker();

  const resuming = tab.choice && tab.memoryDone && claimed.every(Boolean);
  if (!resuming) {
    lobby.hidden = false;
    // Name, animal and colour, then the memory; "Back" goes round again.
    for (;;) {
      pickStep.hidden = false;
      writeStep.hidden = true;
      await new Promise((resolve) => pickDone.addEventListener("click", resolve, { once: true }));
      tab.choice = { ...choice, name: playerName() };
      write("sessionStorage", TAB_KEY, tab);
      write("localStorage", LAST_KEY, tab.choice);
      if (tab.memoryDone) break;

      pickStep.hidden = true;
      writeStep.hidden = false;
      (category ? memory : categoryButtons[0]).focus();
      if (await writeMemory() === "done") {
        tab.memoryDone = true;
        write("sessionStorage", TAB_KEY, tab);
        break;
      }
    }
    lobby.hidden = true;
  }
  done = true;
  return identity();
}

// From the end screen: back through the lobby to write a new memory (with
// the same name, animal and colour preselected). Reloading leaves the field
// cleanly: the server removes my player and frees my choices. Coming back,
// I count as wanting to play again (see takePlayAgain).
export function backToLobby() {
  tab.memoryDone = false;
  tab.playAgain = true;
  write("sessionStorage", TAB_KEY, tab);
  location.reload();
}

// True once, if I came back from the lobby after a game ended.
export function takePlayAgain() {
  if (!tab.playAgain) return false;
  tab.playAgain = false;
  write("sessionStorage", TAB_KEY, tab);
  return true;
}

const identity = () => ({
  tab: tab.id,
  author: authorKey(playerName()), // recognises the author of a memory (see guess.js)
  name: playerName(),
  animal: ANIMALS[choice.animals],
  color: COLOURS[choice.colors].value,
});
