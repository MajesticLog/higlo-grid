// Notes on a found memory (playtest 5): once a memory is guessed or revealed,
// anyone, its author too, can leave short notes about it ("I'd forgotten the
// bell!"), as many as they like, to keep the moment and reminisce together.
// Written in the result window or the memory chest; shown there and on the
// end screen, and saved with the chest's page.
//
// Stored with the memory: memories/<id>/notes/<key>: {text, name, animal, color, at}.
import { push } from "./firebase.js";
import { sessionRef } from "./session.js";
import { state } from "./state.js";
import { now } from "./game.js";

export const NOTE_MAX = 80;

// A memory's notes, oldest first.
export const notesOf = (memoryId) => Object.values(state.memories[memoryId]?.notes ?? {})
  .sort((a, b) => a.at - b.at);

export const noteLine = (n) => `${n.animal ?? ""} ${n.name ?? ""}`.trim() + `: ${n.text}`;

function addNote(memoryId, text) {
  push(sessionRef(`memories/${memoryId}/notes`), {
    text: text.slice(0, NOTE_MAX),
    name: state.me.name ?? "",
    animal: state.me.animal ?? "",
    color: state.me.color ?? "",
    at: now(),
  });
}

// The notes of one memory, as a list that refreshNotes() keeps up to date.
export function notesList(memoryId) {
  const list = document.createElement("ul");
  list.className = "notes-list";
  list.dataset.memory = memoryId;
  fillList(list);
  return list;
}

function fillList(list) {
  const notes = notesOf(list.dataset.memory);
  list.hidden = notes.length === 0;
  list.replaceChildren(...notes.map((n) => {
    const item = document.createElement("li");
    item.style.setProperty("--c", n.color || "#999");
    item.textContent = noteLine(n);
    return item;
  }));
}

// The notes and a box to add one. `folded`: the box opens from a small
// "📝 Add a note" button (the chest, where every memory has one).
export function noteBox(memoryId, { folded = false } = {}) {
  const box = document.createElement("div");
  box.className = "notes";
  const heading = document.createElement("p");
  heading.className = "notes-title";
  heading.textContent = "📝 Notes";
  const form = document.createElement("form");
  form.className = "notes-form";
  form.hidden = folded;
  const input = document.createElement("input");
  input.type = "text";
  input.maxLength = NOTE_MAX;
  input.autocomplete = "off";
  input.placeholder = "A detail, a feeling, a story…";
  input.setAttribute("aria-label", "Leave a note about this memory");
  const button = document.createElement("button");
  button.type = "submit";
  button.textContent = "Add";
  form.append(input, button);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return input.focus();
    addNote(memoryId, text);
    input.value = "";
  });
  if (folded) {
    heading.hidden = true;
    const open = document.createElement("button");
    open.type = "button";
    open.className = "notes-open";
    open.textContent = "📝 Add a note";
    open.addEventListener("click", () => {
      open.hidden = true;
      form.hidden = false;
      input.focus();
    });
    box.append(heading, notesList(memoryId), open, form);
  } else {
    box.append(heading, notesList(memoryId), form);
  }
  return box;
}

// New notes arrived (game.js, on every change to the memories): update every
// list on screen in place, so nobody loses what they're typing.
export function refreshNotes() {
  document.querySelectorAll(".notes-list").forEach(fillList);
}
