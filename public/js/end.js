// End of a game. Won: fireflies and a little fanfare, then "What a team!" with
// the family together. Night: the wolf howls, then everyone goes to bed. Both
// show the memories found this game. Each player then chooses: play again,
// or back to the lobby to write a new memory. The screen stays until they
// choose, and the new board starts once everyone in the field has chosen.
import { runTransaction } from "./firebase.js";
import { sessionRef, myId } from "./session.js";
import { state } from "./state.js";
import { newGameForAll } from "./game.js";
import { backToLobby, takePlayAgain } from "./lobby.js";
import { playTrumpet, playHowl } from "./sound.js";
import { replayActive } from "./replay.js";
import { cardOpen } from "./card.js";
import { guessOpen } from "./guess.js";
import { notesList } from "./notes.js";

const END_DELAY_MS = 3500; // time to enjoy the fireflies or the wolf first

const screen = document.getElementById("end");
const title = document.getElementById("end-title");
const family = document.getElementById("end-family");
const note = document.getElementById("end-note");
const memoriesTitle = document.getElementById("end-memories-title");
const list = document.getElementById("end-memories");
const againButton = document.getElementById("end-again");
const waiting = document.getElementById("end-waiting");
const gameRef = sessionRef("game");

let handled = null; // "gameId:status" this device has already reacted to
let timer = null;

// Called by game.js on every game change, with the game as it was before.
export function gameChanged(previous, game) {
  if (!game || game.status === "playing") {
    clearTimeout(timer);
    screen.hidden = true;
    handled = null;
    return;
  }
  // Still in the lobby: nothing to show yet. main.js calls this again the
  // moment I enter the field.
  if (!state.joined) return;
  const tag = `${game.id}:${game.status}`;
  if (handled !== tag) {
    handled = tag;
    // Watched it happen: once nothing else is on screen (the replay, a clue
    // card, the guess and its result), the sound, then the screen after a
    // moment. Arrived late: show it now.
    const live = previous?.id === game.id && previous.status === "playing";
    if (live) {
      clearTimeout(timer);
      endWhenFree(tag);
    } else {
      showEnd();
    }
  } else if (!screen.hidden) {
    drawEnd(); // someone chose: update the ticks
  }
  maybeStartAgain();
}

function endWhenFree(tag) {
  const game = state.game;
  if (!game || `${game.id}:${game.status}` !== tag) return; // a new game started
  if (replayActive() || cardOpen() || guessOpen()) {
    timer = setTimeout(() => endWhenFree(tag), 300);
    return;
  }
  (game.status === "won" ? playTrumpet : playHowl)();
  timer = setTimeout(showEnd, END_DELAY_MS);
}

export function showEnd() {
  if (!state.game || state.game.status === "playing") return;
  drawEnd();
  screen.hidden = false;
  if (!againButton.hidden) againButton.focus();
}

function drawEnd() {
  const game = state.game;
  const won = game.status === "won";
  const again = game.again ?? {};
  screen.classList.toggle("won", won);
  screen.classList.toggle("lost", !won);
  // Plain words any family understands (playtest 5: "tea time" wasn't clear).
  // Counted from the game itself: the memories' own records may arrive a moment later.
  const count = (game.queue ?? []).filter((id) => game.guessed?.[id] && game.guessed[id] !== "kept").length;
  title.textContent = won ? "🎉 What a team!" : "🌙 Let's go to bed!";
  note.textContent = won
    ? (count > 0 ? `Well done! You found ${count} ${count === 1 ? "memory" : "memories"}!` : "Well done!")
    : "The wolf is out, everyone runs off to bed! The memories not guessed aren't lost: next game, their authors can hide them again.";
  drawFamily(won, again);
  drawMemories(game);
  againButton.hidden = Boolean(again[myId]);
  waiting.hidden = !again[myId];
}

// "Play again": I'm ready. Only for the game I'm looking at, so a late tap
// can't land in the next one.
function chooseAgain() {
  const seen = state.game?.id;
  runTransaction(gameRef, (game) => {
    if (!game || game.id !== seen || game.status === "playing") return; // abort
    game.again ??= {};
    game.again[myId] = true;
    return game;
  });
}

// Once everyone in the field has chosen, any device starts the new board
// (newGameForAll only replaces the game it saw, so it happens once). Players who
// went to the lobby have left the field, so nobody waits for them; they
// count as ready when they come back.
export function maybeStartAgain() {
  const game = state.game;
  if (!state.joined || !game) return;
  if (game.status === "playing") {
    takePlayAgain(); // came back to a game in progress: nothing to choose
    return;
  }
  const again = game.again ?? {};
  if (!again[myId] && takePlayAgain()) return chooseAgain();
  if (state.players.length > 0 && state.players.every((p) => again[p.id])) newGameForAll();
}

// Everyone in a ring: around a trophy, each with a star, or tucked in with 💤.
// A ✅ shows who has chosen to play again, readable without reading.
function drawFamily(won, again) {
  family.replaceChildren();
  const centre = document.createElement("span");
  centre.className = "end-centre";
  centre.textContent = won ? "🏆" : "🏡";
  family.append(centre);
  const players = state.players;
  players.forEach((p, i) => {
    const angle = (i / players.length) * 2 * Math.PI - Math.PI / 2;
    const token = document.createElement("div");
    token.className = "end-token";
    token.style.left = `${50 + 38 * Math.cos(angle)}%`;
    token.style.top = `${50 + 38 * Math.sin(angle)}%`;
    const circle = document.createElement("span");
    circle.className = "end-circle";
    circle.style.background = p.color;
    circle.textContent = p.animal;
    const badge = document.createElement("span");
    badge.className = "end-badge";
    badge.textContent = won ? "⭐" : "💤";
    circle.append(badge);
    if (again[p.id]) {
      const check = document.createElement("span");
      check.className = "end-check";
      check.textContent = "✅";
      circle.append(check);
    }
    const name = document.createElement("span");
    name.className = "end-name";
    name.textContent = p.name ?? "";
    token.append(circle, name);
    family.append(token);
  });
}

// The memories found in this game, in the order they turned up.
const foundThisGame = (game) => Object.entries(state.memories)
  .map(([id, m]) => ({ ...m, id }))
  .filter((m) => m.gameId === game.id && m.foundAt && (!m.clues || m.revealedAt))
  .sort((a, b) => a.foundAt - b.foundAt);

function drawMemories(game) {
  const found = foundThisGame(game);
  memoriesTitle.hidden = found.length === 0;
  list.replaceChildren();
  for (const m of found) {
    const item = document.createElement("li");
    item.style.setProperty("--c", m.color ?? "#999");
    const lines = [
      ["end-prompt", m.prompt ?? ""],
      ["end-text", m.text],
      ["end-clues", m.clues ? `🔍 ${m.clues.join(" · ")}` : ""],
      ["end-by", `${m.animal ?? ""} ${m.name ?? ""}`.trim() + (m.clues ? (m.guessed ? " · ✅ guessed" : " · revealed") : "")],
    ];
    for (const [className, text] of lines) {
      if (!text) continue;
      const span = document.createElement("span");
      span.className = className;
      span.textContent = text;
      item.append(span);
    }
    item.append(notesList(m.id)); // notes.js keeps it up to date
    list.append(item);
  }
}

againButton.addEventListener("click", chooseAgain);
document.getElementById("end-garden").addEventListener("click", () => { screen.hidden = true; });
document.getElementById("end-open").addEventListener("click", showEnd);
