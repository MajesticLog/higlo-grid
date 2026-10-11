// Lobby: pick an animal and a colour, then hide a memory in the field.
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
const PROMPTS = [
  "A memory with someone here",
  "Something the others don't know about you",
  "A place you'd love to go back to",
  "Something that made you laugh recently",
  "A meal you'll never forget",
  "Something you'd like us to do together",
  "Your favourite toy or game when you were little",
];
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

// --- Hiding a memory ---
const form = document.getElementById("write");
const memory = document.getElementById("memory");
const promptText = document.getElementById("prompt");
let promptIndex = Math.floor(Math.random() * PROMPTS.length);
promptText.textContent = PROMPTS[promptIndex];
document.getElementById("new-prompt").addEventListener("click", () => {
  promptIndex = (promptIndex + 1) % PROMPTS.length;
  promptText.textContent = PROMPTS[promptIndex];
});

function writeMemory(identity) {
  return new Promise((resolve) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = memory.value.trim();
      if (!text) return memory.focus();
      // Memories belong to the family link, not to this game or this tab.
      push(sessionRef("memories"), {
        text,
        prompt: PROMPTS[promptIndex],
        ...identity,
        createdAt: serverTimestamp(),
      });
      resolve();
    });
    document.getElementById("skip").addEventListener("click", resolve);
  });
}

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
    pickStep.hidden = false;
    await new Promise((resolve) => pickDone.addEventListener("click", resolve, { once: true }));
    tab.choice = { ...choice, name: playerName() };
    write("sessionStorage", TAB_KEY, tab);
    write("localStorage", LAST_KEY, tab.choice);

    if (!tab.memoryDone) {
      pickStep.hidden = true;
      writeStep.hidden = false;
      memory.focus();
      await writeMemory(identity());
      tab.memoryDone = true;
      write("sessionStorage", TAB_KEY, tab);
    }
    lobby.hidden = true;
  }
  done = true;
  return identity();
}

const identity = () => ({
  name: playerName(),
  animal: ANIMALS[choice.animals],
  color: COLOURS[choice.colors].value,
});
