// Guessing: once all 3 clues of a memory are found, the rounds pause and
// everyone except the author guesses what the memory is, typed or out loud
// (so young children who can't write still play). The guesses appear
// together, so nobody copies; the author says yes or no. One round of
// guesses: if nobody gets it, the memory is revealed and play carries on.
//
// In the game: guess {memory, phase: "guessing" | "judging", answers, verdicts}
// while it's on; guessed {memoryId: "guessed" | "revealed"} once done; and
// lastGuess, the result everyone sees for a moment.
import { update, runTransaction } from "./firebase.js";
import { sessionRef, myId } from "./session.js";
import { state } from "./state.js";
import { now, nextGuess, checkEnd } from "./game.js";
import { CLUES } from "./lobby.js";
import { playTwinkle } from "./sound.js";
import { replayEndsAt } from "./replay.js";

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
    const last = snapshot.val()?.lastGuess;
    if (committed && last?.memory === seen.memory) {
      update(sessionRef(`memories/${seen.memory}`), { revealedAt: last.at, guessed: last.guessed });
    }
  });
}

// Over: everyone sees the result; the rounds resume (or the next memory's
// guessing starts, or the game ends).
function finish(game, guessed) {
  const { memory, answers = null, verdicts = null } = game.guess;
  game.guessed ??= {};
  game.guessed[memory] = guessed ? "guessed" : "revealed";
  game.lastGuess = { memory, guessed, answers, verdicts, at: now() };
  game.guess = null;
  nextGuess(game);
  checkEnd(game);
  game.updatedAt = now();
}

// Guesses appear together once every guesser here has answered.
function allAnswered(game) {
  const memory = state.memories[game.guess.memory];
  return guessers(memory).every((p) => game.guess.answers?.[p.id]);
}

// Any device moves things on when they're due: nobody here to guess (the
// author is alone) reveals the memory; everyone answered shows the guesses.
export function maybeAdvance() {
  const guess = state.game?.guess;
  const memory = memoryOf(guess);
  if (!state.joined || !memory) return;
  if (guess.phase === "guessing" && guessers(memory).length === 0) {
    changeGuess((game) => finish(game, false));
  } else if (guess.phase === "guessing" && allAnswered(state.game)) {
    changeGuess((game) => {
      if (game.guess.phase !== "guessing" || !allAnswered(game)) return false;
      game.guess.phase = "judging";
    });
  }
}

function answer(entry) {
  changeGuess((game) => {
    if (game.guess.phase !== "guessing") return false;
    game.guess.answers[myId] = { ...entry, name: state.me.name ?? "", animal: state.me.animal ?? "" };
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
    const open = answers.some(([id, a]) => a.aloud || game.guess.verdicts[id] !== false);
    if (!open) finish(game, false);
  });
}
someoneButton.addEventListener("click", () => changeGuess((game) => finish(game, true)));
nobodyButton.addEventListener("click", () => changeGuess((game) => finish(game, false)));

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

// The guess shows after a short delay (the last clue's card first). Until
// then, or once it's over, the latest result shows until closed.
export function renderGuess() {
  const game = state.game;
  if (!state.joined || !game) return;
  const guess = game.guess;
  const last = game.lastGuess;
  const lastTag = last && `${game.id}:${last.at}`;
  // After the replay and its clue cards.
  const replayLeft = replayEndsAt() - performance.now();
  if (guess && replayLeft > 0) setTimeout(renderGuess, replayLeft + SHOW_DELAY_MS + 50);
  const guessReady = guess && memoryOf(guess) && replayLeft <= 0
    && seenFor(`${game.id}:${guess.memory}`) >= SHOW_DELAY_MS;
  const resultOpen = last && state.memories[last.memory] && closedResult !== lastTag && seenFor(lastTag) !== Infinity;
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

function drawClues(memory) {
  theme.textContent = memory.prompt ?? "";
  clueList.replaceChildren(...(memory.clues ?? []).map((c) => {
    const li = document.createElement("li");
    li.textContent = c;
    return li;
  }));
}

function drawAnswers(answers = {}, verdicts = {}, judging = false) {
  answerList.replaceChildren(...Object.entries(answers).map(([id, a]) => {
    const li = document.createElement("li");
    const text = document.createElement("span");
    text.className = "guess-text";
    text.textContent = a.aloud ? `${a.animal} ${a.name} 🗣️ says it out loud` : `${a.animal} ${a.name}: “${a.text}”`;
    li.append(text);
    if (verdicts?.[id] === false) li.append(mark("❌"));
    if (judging && !a.aloud && verdicts?.[id] !== false) {
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
  title.textContent = mine
    ? "🎉 The others are guessing your memory now!"
    : `🔍 All ${CLUES} of ${who(memory)}'s clues are found!`;
  drawClues(memory);
  reveal.hidden = true;
  closeButton.hidden = true;
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
    statusText.textContent = mine
      ? "Did someone get it? Tap ✅ or ❌ next to each guess, or answer for the ones said out loud."
      : groupJudges
        ? `${who(memory)} isn't here. Here's the answer: did someone get it?`
        : `Waiting for ${who(memory)} to say if someone got it…`;
  }
  box.hidden = false;
}

function drawResult(game, last, memory) {
  const tag = `${game.id}:${last.at}`;
  if (last.guessed && !cheered.has(tag)) { // a little twinkle of bells, once
    cheered.add(tag);
    playTwinkle();
  }
  title.textContent = last.guessed ? "🎉 You guessed it!" : "Nobody guessed it this time";
  drawClues(memory);
  form.hidden = true;
  earlyButton.hidden = true;
  judgeButtons.hidden = true;
  statusText.textContent = "";
  reveal.hidden = false;
  reveal.querySelector(".guess-it-was").textContent = "It was…";
  reveal.querySelector(".guess-memory").textContent = memory.text;
  reveal.querySelector(".guess-by").textContent = who(memory);
  answerList.hidden = !last.answers;
  drawAnswers(last.answers ?? {}, last.verdicts ?? {}, false);
  closeButton.hidden = false;
  closeButton.textContent = game.guess ? "Next ➜" : "Back to the field";
  box.hidden = false;
}

closeButton.addEventListener("click", () => {
  closedResult = `${state.game?.id}:${state.game?.lastGuess?.at}`;
  box.hidden = true;
  renderGuess(); // the next guess, if one is waiting
});
