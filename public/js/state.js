// Live copies of what's in the database, shared by every module.
// Listeners write into it; render.js draws from it.
import { CENTRE, myId } from "./session.js";

export const state = {
  me: { x: CENTRE, y: CENTRE, color: null, animal: null }, // my player record
  joined: false,
  players: [], // [{id, x, y, color, animal}] in join order (push keys sort by time)
  targets: {}, // playerId -> {x, y, found?}
  turn: null, // {player, moved}
  hints: {}, // moverId -> {signallerId: "hot" | "cold"}
  floats: new Map(), // playerId -> {icon, startedAt}: a ❤️ 🔥 ❄️ floating above them
};

export const playerById = (id) => state.players.find((p) => p.id === id);

// True when it's my turn: I can move as far as I like until the turn passes.
export const canMove = () => state.joined && state.turn?.player === myId;
