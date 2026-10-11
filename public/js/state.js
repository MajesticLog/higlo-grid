// Live copies of what's in the database, shared by every module.
// Listeners write into it; render.js draws from it.
import { CENTRE } from "./session.js";

export const state = {
  me: { x: CENTRE, y: CENTRE, color: null, animal: null }, // my player record
  joined: false,
  players: [], // [{id, x, y, color, animal}] in join order (push keys sort by time)
  floats: new Map(), // playerId -> {icon, startedAt}: a ❤️ floating above them
};
