// Live copies of what's in the database, shared by every module.
// Listeners write into it; render.js draws from it.
import { sessionId } from "./session.js";

export const state = {
  me: { x: 0, y: 0, color: null, animal: null }, // my player record (placed in main.js)
  joined: false, // in the field (past the lobby)
  online: false, // connected to the database right now
  players: [], // [{id, x, y, color, animal}] in join order (push keys sort by time)
  game: null, // the current game: board, round, clues, night... (game.js, rounds.js)
  memories: {}, // memoryId -> {text, prompt, name, animal, color, createdAt, foundAt?}
  floats: new Map(), // playerId -> {icon, startedAt}: a ❤️ floating above them
  bubbles: new Map(), // playerId -> {text, startedAt}: a message above them (messages.js)
  arriving: {}, // tab -> {name, animal, color}: in the lobby or the tutorial, not in the garden yet
};

// Where I stand in the current game, kept for this tab only, so a refresh
// puts me back on my square instead of the start row.
const POSITION_KEY = `higlo:${sessionId}:position`;

export function rememberPosition(gameId = state.game?.id) {
  try {
    sessionStorage.setItem(POSITION_KEY, JSON.stringify({ game: gameId, x: state.me.x, y: state.me.y }));
  } catch { /* private mode: a refresh starts in the middle */ }
}

export function savedPosition(gameId) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(POSITION_KEY));
    return saved && gameId && saved.game === gameId ? { x: saved.x, y: saved.y } : null;
  } catch {
    return null;
  }
}
