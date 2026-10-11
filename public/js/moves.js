// Moving: arrow keys step one square, a tap or click walks to a square.
import { SIZE, myRef } from "./session.js";
import { update } from "./firebase.js";
import { state } from "./state.js";

const STEP_MS = 150; // walking speed when you tap a square
const clamp = (n) => Math.max(0, Math.min(SIZE - 1, n));

export function tryMove(dx, dy) {
  if (!state.joined) return stopWalking();
  const x = clamp(state.me.x + dx);
  const y = clamp(state.me.y + dy);
  if (x === state.me.x && y === state.me.y) return; // against an edge
  state.me.x = x;
  state.me.y = y;
  update(myRef, { x, y });
}

// Tap or click a square: walk there one square at a time, so others see the path.
let walkTarget = null;
let walkTimer = null;

export function stopWalking() {
  clearInterval(walkTimer);
  walkTimer = null;
  walkTarget = null;
}

function step() {
  const dx = walkTarget.x - state.me.x;
  const dy = walkTarget.y - state.me.y;
  if (dx === 0 && dy === 0) return stopWalking(); // arrived
  // Step along the axis with the most distance left: a natural staircase path.
  if (Math.abs(dx) >= Math.abs(dy)) tryMove(Math.sign(dx), 0);
  else tryMove(0, Math.sign(dy));
}

export function walkTo(x, y) {
  if (!state.joined) return;
  walkTarget = { x, y };
  if (!walkTimer) {
    step();
    if (walkTarget) walkTimer = setInterval(step, STEP_MS);
  }
}
