// Guessing: once all 3 clues of a memory are found, the rounds pause and
// everyone except the author guesses what the memory is, typed or out loud
// (so young children who can't write still play). The guesses appear
// together, so nobody copies; the author says yes or no. One round of
// guesses: if nobody gets it, the memory is revealed and play carries on.
//
// A family memory found without its author (they left it open, lobby.js):
// whoever is there sees the answer and says if they got it (the honour
// system). It isn't used up: each of them is recorded on the memory
// (foundBy), and it stays hidden for the rest of the family until it's
// guessed with its author there. Players who've found it before still guess;
// a 👀 by their answer says so.
//
// In the game: guess {memory, phase: "guessing" | "judging", answers, verdicts}
// while it's on; guessed {memoryId: "guessed" | "revealed"} once done; and
// lastGuess, the result everyone sees for a moment.
import { update, runTransaction } from "./firebase.js";
import { sessionRef, myId } from "./session.js";
import { state } from "./state.js";
import { now, nextGuess, checkEnd, startBetween, currentMemory, cluesOf } from "./game.js";
import { CLUES, foundKey } from "./lobby.js";
import { playTwinkle } from "./sound.js";
import { replayEndsAt } from "./replay.js";
import { noteBox } from "./notes.js";
import { cardOpen } from "./card.js";

const SHOW_DELAY_MS = 2500; // let the last clue's card show first
const gameRef = sessionRef("game");

const box = document.getElementById("guess");
const title = document.getElementById("guess-title");
const theme = document.getElementById("guess-theme");
const clueList = document.getElementById("guess-clues");
const form = document.getElementById("guess-form");
const input = document.getElementById("guess-input");
const statusText = document.getElementById("guess-status");
const answerList = document.getElementById("guess-answers");
const judgeButtons = document.getElementById("guess-judge");
const someoneButton = document.getElementById("guess-someone");
const nobodyButton = document.getElementById("guess-nobody");
const earlyButton = document.getElementById("guess-early");
const reveal = document.getElementById("guess-reveal");
const closeButton = document.getElementById("guess-close");
const notesSlot = document.getElementById("guess-notes");
const aloneButtons = document.getElementById("guess-alone");

// Who wrote a memory: the same author key (this device and name, see
// lobby.js). Memories from before author keys: the same tab, or the same name.
const sameName = (a, b) => Boolean(a && b) && a.trim().toLowerCase() === b.trim().toLowerCase();
export const isAuthor = (player, memory) => {
  if (!player || !memory) return false;
  if (memory.author && player.author) return memory.author === player.author;
  return Boolean(memory.tab && player.tab === memory.tab) || sameName(player.name, memory.name);
};

const memoryOf = (guess) => guess && state.memories[guess.memory];
const authorHere = (memory) => state.players.some((p) => isAuthor(p, memory));
const guessers = (memory) => state.players.filter((p) => !isAuthor(p, memory));
const amAuthor = (memory) => isAuthor({ ...state.me, id: myId }, memory);
const who = (m) => `${m.animal ?? ""} ${m.name ?? ""}`.trim();
// Has this player found this memory before, without its author?
const seenBefore = (player, memory) => Boolean(player?.author && memory?.foundBy?.[foundKey(player.author)]);

// --- Changing the guess, always in a transaction tied to its memory ---
function changeGuess(edit) {
  const seen = state.game?.guess;
  if (!seen) return;
  runTransaction(gameRef, (game) => {
    if (!game?.guess || game.guess.memory !== seen.memory) return; // abort
    game.guess.answers ??= {};
    game.guess.verdicts ??= {};
    return edit(game) === false ? undefined : game;
  }).then(({ committed, snapshot }) => {
    // The device that finishes a guess records it on the memory, for the
    // chest and the end screen. (Others may too; the writes agree.)
    const game = snapshot.val();
    const last = game?.lastGuess;
    if (!committed || last?.memory !== seen.memory || (last.early && !last.guessed)) return;
    if (last.finders) {
      // Found without its author: each finder is recorded, and it stays hidden.
      for (const f of last.finders) {
        update(sessionRef(`memories/${seen.memory}/foundBy/${foundKey(f.author)}`), {
          name: f.name, animal: f.animal, color: f.color, at: last.at, guessed: last.guessed, gameId: game.id,
        });
      }
      return;
    }
    // Found for good: into the chest, with this game.
    update(sessionRef(`memories/${seen.memory}`), {
      foundAt: last.at, revealedAt: last.at, guessed: last.guessed, gameId: game.id,
    });
  });
}

// Nobody but its author is here to guess (playing alone): they choose to
// keep it for a game with the family. It counts as done for this game, but
// stays hidden, and its author can bring it to the next game from the lobby.
function keepForLater(game) {
  const { memory } = game.guess;
  game.guess = null;
  game.guessed ??= {};
  game.guessed[memory] = "kept";
  nextGuess(game);
  checkEnd(game);
  startBetween(game);
  game.updatedAt = now();
}

// Over: everyone sees the result; the rounds resume (or the next memory's
// guessing starts, or the game ends).
function finish(game, guessed) {
  const { memory, early = false, answers = null, verdicts = null } = game.guess;
  game.lastGuess = { memory, guessed, early, answers, verdicts, at: now() };
  // Its author isn't here (and it's open to the family): not used up. Who
  // was here is recorded on the memory instead (see changeGuess).
  const m = state.memories[memory];
  if (m?.open && !authorHere(m)) {
    game.lastGuess.finders = guessers(m).filter((p) => p.author)
      .map((p) => ({ author: p.author, name: p.name ?? "", animal: p.animal ?? "", color: p.color ?? "" }));
  }
  game.guess = null;
  if (early && !guessed) {
    // Not yet: the memory stays secret and the search goes on.
    nextGuess(game);
    checkEnd(game);
    game.updatedAt = now();
    return;
  }
  game.guessed ??= {};
  game.guessed[memory] = guessed ? "guessed" : "revealed";
  nextGuess(game); // the next memory, if it already has its clues
  checkEnd(game);
  startBetween(game); // a break before the next memory
  game.updatedAt = now();
}

// Guesses appear together once every guesser here has answered.
function allAnswered(game) {
  const memory = state.memories[game.guess.memory];
  return guessers(memory).every((p) => game.guess.answers?.[p.id]);
}

// Any device moves things on when they're due: everyone answered shows the
// guesses. (Nobody here to guess: the author chooses, see drawAlone.)
export function maybeAdvance() {
  const guess = state.game?.guess;
  const memory = memoryOf(guess);
  if (!state.joined || !memory) return;
  if (guess.phase === "guessing" && guessers(memory).length > 0 && allAnswered(state.game)) {
    changeGuess((game) => {
      if (game.guess.phase !== "guessing" || !allAnswered(game)) return false;
      game.guess.phase = "judging";
    });
  }
}

function answer(entry) {
  changeGuess((game) => {
    if (game.guess.phase !== "guessing") return false;
    const seen = seenBefore(state.me, state.memories[game.guess.memory]) || null; // 👀
    game.guess.answers[myId] = { ...entry, name: state.me.name ?? "", animal: state.me.animal ?? "", seen };
    if (allAnswered(game)) game.guess.phase = "judging";
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return input.focus();
  answer({ text });
});
document.getElementById("guess-aloud").addEventListener("click", () => answer({ aloud: true }));
document.getElementById("guess-pass").addEventListener("click", () => answer({ pass: true }));

// The author (or anyone, if the author has left) shows the guesses early.
earlyButton.addEventListener("click", () => changeGuess((game) => {
  if (game.guess.phase !== "guessing") return false;
  game.guess.phase = "judging";
}));

// The author's verdicts. A yes ends it happily. If every typed guess gets a
// no and nobody answered out loud, the memory is revealed.
function judge(playerId, yes) {
  changeGuess((game) => {
    if (game.guess.phase !== "judging") return false;
    if (yes) return finish(game, true);
    game.guess.verdicts[playerId] = false;
    const answers = Object.entries(game.guess.answers);
    const open = answers.some(([id, a]) => a.aloud || (!a.pass && game.guess.verdicts[id] !== false));
    if (!open) finish(game, false);
  });
}
someoneButton.addEventListener("click", () => changeGuess((game) => finish(game, true)));
nobodyButton.addEventListener("click", () => changeGuess((game) => finish(game, false)));
document.getElementById("guess-reveal-it").addEventListener("click", () => changeGuess((game) => {
  if (guessers(state.memories[game.guess.memory]).length > 0) return false; // someone came: they guess
  finish(game, false);
  game.lastGuess.alone = true;
}));
document.getElementById("guess-keep").addEventListener("click", () => changeGuess((game) => {
  if (guessers(state.memories[game.guess.memory]).length > 0) return false;
  keepForLater(game);
}));

// --- Drawing ---
const firstSeen = new Map(); // guess or result tag -> when this device first saw it
let arrived = false; // false until my first look at the game, so old results don't replay
let closedResult = null;
const cheered = new Set();
let inputFor = null;

function seenFor(tag) {
  if (!firstSeen.has(tag)) {
    firstSeen.set(tag, arrived ? performance.now() : -Infinity);
    setTimeout(renderGuess, SHOW_DELAY_MS + 50);
  }
  return performance.now() - firstSeen.get(tag);
}

// One thing at a time: the round's replay, then its clue card, then the
// guess, then its result (until closed). Until then, nothing opens.
export function renderGuess() {
  const game = state.game;
  if (!state.joined || !game) return;
  const guess = game.guess;
  const last = game.lastGuess;
  const lastTag = last && `${game.id}:${last.at}`;
  // After the replay and its clue card.
  const replayLeft = replayEndsAt() - performance.now();
  if ((guess || last) && replayLeft > 0) setTimeout(renderGuess, replayLeft + SHOW_DELAY_MS + 50);
  const free = replayLeft <= 0 && !cardOpen();
  const guessReady = free && guess && memoryOf(guess)
    && seenFor(`${game.id}:${guess.memory}`) >= SHOW_DELAY_MS;
  const resultOpen = free && last && state.memories[last.memory] && closedResult !== lastTag
    && seenFor(lastTag) !== Infinity;
  // A result just ended shows first (with "Next" if another guess is
  // waiting), so its answers never mix with the next guess.
  if (resultOpen) {
    drawResult(game, last, state.memories[last.memory]);
  } else if (guessReady) {
    drawGuess(guess, memoryOf(guess));
  } else {
    box.hidden = true;
  }
  arrived = true;
}

// The clues found so far for a memory, as numbers (0, 1, 2).
// The clues earned so far for a memory, as numbers (0, 1, 2): they come in order.
const foundClues = (memoryId) => [...Array(cluesOf(state.game, memoryId)).keys()];

function drawClues(memory, memoryId, all = false) {
  theme.textContent = memory.prompt ?? "";
  const numbers = all ? (memory.clues ?? []).map((_, n) => n) : foundClues(memoryId);
  clueList.replaceChildren(...numbers.map((n) => {
    const li = document.createElement("li");
    li.value = n + 1; // keep each clue's own number
    li.textContent = memory.clues?.[n] ?? "";
    return li;
  }));
}

function drawAnswers(answers = {}, verdicts = {}, judging = false) {
  answerList.replaceChildren(...Object.entries(answers).map(([id, a]) => {
    const li = document.createElement("li");
    const text = document.createElement("span");
    text.className = "guess-text";
    const name = `${a.animal} ${a.name}${a.seen ? " 👀" : ""}`; // 👀: found it before
    text.textContent = a.pass ? `${name} 🤷 isn't sure yet`
      : a.aloud ? `${name} 🗣️ says it out loud` : `${name}: “${a.text}”`;
    if (a.seen) li.title = "Has found this memory before";
    li.append(text);
    if (verdicts?.[id] === false) li.append(mark("❌"));
    if (judging && !a.aloud && !a.pass && verdicts?.[id] !== false) {
      for (const [label, yes] of [["✅", true], ["❌", false]]) {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = label;
        b.setAttribute("aria-label", `${yes ? "Yes" : "No"}: ${a.text}`);
        b.addEventListener("click", () => judge(id, yes));
        li.append(b);
      }
    }
    return li;
  }));
}

const mark = (icon) => {
  const span = document.createElement("span");
  span.className = "guess-mark";
  span.textContent = icon;
  return span;
};

function drawGuess(guess, memory) {
  const tag = `${state.game.id}:${guess.memory}`;
  if (inputFor !== tag) { // a new guess: start with an empty box
    inputFor = tag;
    input.value = "";
  }
  const mine = amAuthor(memory);
  const answers = guess.answers ?? {};
  const count = `${Object.keys(answers).length} of ${guessers(memory).length}`;
  const starter = guess.by ? `${guess.by.animal} ${guess.by.name}`.trim() : "Someone";
  title.textContent = mine
    ? "🎉 The others are guessing your memory now!"
    : guess.early
      ? `💡 ${starter} thinks they know ${who(memory)}'s memory!`
      : `🔍 All ${CLUES} of ${who(memory)}'s clues are found!`;
  drawClues(memory, guess.memory);
  reveal.hidden = true;
  closeButton.hidden = true;
  notesSlot.hidden = true;
  aloneButtons.hidden = true;
  if (guessers(memory).length === 0) return drawAlone(memory);
  if (guess.phase === "guessing") {
    form.hidden = mine || Boolean(answers[myId]);
    answerList.hidden = true;
    judgeButtons.hidden = true;
    earlyButton.hidden = !(mine || !authorHere(memory)) || Object.keys(answers).length === 0;
    statusText.textContent = mine
      ? `The others are guessing your memory… (${count} answered)`
      : answers[myId]
        ? `✓ Thanks! Waiting for the others (${count} answered)`
        : "What do you think the memory is? Type it, or say it out loud.";
  } else {
    form.hidden = true;
    earlyButton.hidden = true;
    answerList.hidden = false;
    // Normally the author judges. If they've left, everyone sees the answer
    // and the group judges together.
    const groupJudges = !mine && !authorHere(memory);
    const canJudge = mine || groupJudges;
    drawAnswers(answers, guess.verdicts, canJudge);
    judgeButtons.hidden = !canJudge;
    reveal.hidden = !groupJudges;
    if (groupJudges) {
      reveal.querySelector(".guess-it-was").textContent = "The answer:";
      reveal.querySelector(".guess-memory").textContent = memory.text;
      reveal.querySelector(".guess-by").textContent = who(memory);
    }
    const alone = guessers(memory).length === 1; // finding a family memory on my own
    someoneButton.textContent = groupJudges && alone ? "✅ Yes, I got it!" : "✅ Yes, someone got it!";
    nobodyButton.textContent = groupJudges && alone ? "❌ Not this time" : "❌ Nobody got it";
    statusText.textContent = mine
      ? "Did someone get it? Tap ✅ or ❌ next to each guess, or answer for the ones said out loud."
      : groupJudges
        ? `${who(memory)} isn't here. Here's the answer: did ${alone ? "you" : "someone"} get it?`
        : `Waiting for ${who(memory)} to say if someone got it…`;
  }
  box.hidden = false;
}

// Only the author is here, so nobody can guess: reveal it now, or keep it
// secret for a game with the family.
function drawAlone(memory) {
  title.textContent = "🌱 Nobody else is here to guess your memory";
  form.hidden = true;
  earlyButton.hidden = true;
  answerList.hidden = true;
  judgeButtons.hidden = true;
  aloneButtons.hidden = false;
  statusText.textContent = `All ${CLUES} clues are found! Reveal it now, or keep it secret for a game with the family?`;
  reveal.hidden = false;
  reveal.querySelector(".guess-it-was").textContent = "Your memory:";
  reveal.querySelector(".guess-memory").textContent = memory.text;
  reveal.querySelector(".guess-by").textContent = who(memory);
  box.hidden = false;
}

function drawResult(game, last, memory) {
  const tag = `${game.id}:${last.at}`;
  if (last.guessed && !cheered.has(tag)) { // a little twinkle of bells, once
    cheered.add(tag);
    playTwinkle();
  }
  const notYet = last.early && !last.guessed; // the memory stays secret
  title.textContent = last.guessed ? "🎉 You guessed it!"
    : notYet ? "Not yet! Keep looking 🔍"
      : last.alone ? "📖 Your memory is revealed" : "Nobody guessed it this time";
  drawClues(memory, last.memory, !notYet);
  form.hidden = true;
  aloneButtons.hidden = true;
  earlyButton.hidden = true;
  judgeButtons.hidden = true;
  statusText.textContent = notYet ? "The memory stays a secret until you find more clues."
    : last.finders ? `${who(memory)} will see you found it. It stays hidden for the rest of the family.`
      : "";
  reveal.hidden = notYet;
  reveal.querySelector(".guess-it-was").textContent = "It was…";
  reveal.querySelector(".guess-memory").textContent = memory.text;
  reveal.querySelector(".guess-by").textContent = who(memory);
  answerList.hidden = !last.answers;
  drawAnswers(last.answers ?? {}, last.verdicts ?? {}, false);
  // Found for good: a note to keep, from anyone (notes.js). A new box for a
  // new memory; otherwise the same one, so what's being typed stays.
  notesSlot.hidden = notYet;
  if (!notYet && notesSlot.dataset.memory !== last.memory) {
    notesSlot.dataset.memory = last.memory;
    notesSlot.replaceChildren(noteBox(last.memory));
  }
  closeButton.hidden = false;
  closeButton.textContent = game.guess ? "Next ➜" : "Back to the field";
  box.hidden = false;
}

// The result of a guess is on my screen (with its notes): the game waits
// until I close it (main.js tells the others, rounds.js waits).
export const readingResult = () => !box.hidden && !closeButton.hidden;

// The guess or its result is on my screen: the end screen waits for it.
export const guessOpen = () => !box.hidden;

closeButton.addEventListener("click", () => {
  closedResult = `${state.game?.id}:${state.game?.lastGuess?.at}`;
  box.hidden = true;
  renderGuess(); // the next guess, if one is waiting
  document.dispatchEvent(new Event("guess-closed"));
});
document.addEventListener("card-closed", renderGuess); // the guess can open now

// --- 💡 Clues found, and "Ready to guess!" ---
const cluesPanel = document.getElementById("clues-panel");
const cluesList = document.getElementById("clues-list");

// Start guessing the current memory before all its clues are earned. Anyone
// but its author, while nothing else is being guessed.
function readyToGuess(memoryId) {
  const seen = state.game?.id;
  runTransaction(gameRef, (game) => {
    if (!game || game.id !== seen || game.status !== "playing" || game.guess || game.guessed?.[memoryId]) return;
    if (currentMemory(game) !== memoryId || cluesOf(game, memoryId) === 0) return;
    game.guess = {
      memory: memoryId, phase: "guessing", early: true, startedAt: now(),
      by: { name: state.me.name ?? "", animal: state.me.animal ?? "" },
    };
    return game;
  });
  cluesPanel.hidden = true;
}

function drawCluesPanel() {
  const game = state.game;
  // The memories with clues so far, in the order they're played.
  const ids = (game?.queue ?? []).filter((id) => cluesOf(game, id) > 0);
  cluesList.replaceChildren();
  if (ids.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No clues yet. Find the right pictures together to earn them!";
    cluesList.append(empty);
  }
  for (const id of ids) {
    const memory = state.memories[id];
    if (!memory) continue;
    const box = document.createElement("section");
    box.className = "clues-memory";
    box.style.setProperty("--c", memory.color ?? "#999");
    const heading = document.createElement("h3");
    heading.textContent = `${who(memory)}'s memory · ${memory.prompt ?? ""}`;
    const list = document.createElement("ol");
    for (const n of foundClues(id)) {
      const li = document.createElement("li");
      li.value = n + 1;
      li.textContent = memory.clues?.[n] ?? "";
      list.append(li);
    }
    const done = game.guessed?.[id];
    const status = document.createElement("p");
    status.className = "clues-state";
    status.textContent = done === "guessed" ? `✅ Guessed: “${memory.text}”`
      : done === "revealed" ? `It was: “${memory.text}”`
      : done === "kept" ? "🌱 Kept secret for another game"
        : `${foundClues(id).length} of ${CLUES} clues found`;
    box.append(heading, list, status);
    const canGuess = !done && id === currentMemory(game) && !amAuthor(memory) && game.status === "playing" && !game.guess;
    if (canGuess) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "💡 Ready to guess!";
      button.addEventListener("click", () => readyToGuess(id));
      box.append(button);
    }
    cluesList.append(box);
  }
}

document.getElementById("clues").addEventListener("click", () => {
  drawCluesPanel();
  cluesPanel.hidden = false;
  document.getElementById("clues-close").focus();
});
document.getElementById("clues-close").addEventListener("click", () => { cluesPanel.hidden = true; });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !cluesPanel.hidden) cluesPanel.hidden = true;
});
