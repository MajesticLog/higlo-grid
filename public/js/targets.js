// Targets: each player has one; everyone sees it except its owner.
import { SIZE, CENTRE, sessionRef, playersRef, myId } from "./session.js";
import { get, update, onValue, onDisconnect, runTransaction } from "./firebase.js";
import { state } from "./state.js";
import { render, renderBanner } from "./render.js";

const FOUND_MS = 3000; // how long "Found it!" shows before a new target
const targetsRef = sessionRef("targets");
const myTargetRef = sessionRef(`targets/${myId}`);

// Pick my target in a transaction on the whole targets node: it reads every
// target and writes mine in one step, so two targets can't share a square.
export async function assignTarget() {
  const playersNow = Object.values((await get(playersRef)).val() || {});
  const me = state.me;
  const result = await runTransaction(targetsRef, (current) => {
    current = current || {};
    const blocked = new Set([`${CENTRE},${CENTRE}`]);
    for (const p of playersNow) blocked.add(`${p.x},${p.y}`);
    for (const [id, t] of Object.entries(current)) {
      if (id !== myId) blocked.add(`${t.x},${t.y}`);
    }
    const options = [];
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const nearMe = Math.max(Math.abs(x - me.x), Math.abs(y - me.y)) <= 1;
        if (!nearMe && !blocked.has(`${x},${y}`)) options.push({ x, y });
      }
    }
    if (options.length === 0) return; // grid full: abort, no target for now
    current[myId] = options[Math.floor(Math.random() * options.length)];
    return current;
  });
  if (result.committed) await onDisconnect(myTargetRef).remove();
}

onValue(targetsRef, (snap) => {
  state.targets = snap.val() || {};
  render();
  renderBanner();
});

// Called after each of my moves. Returns true if I just found my target.
export function checkFound() {
  const t = state.targets[myId];
  if (!t || t.found || state.me.x !== t.x || state.me.y !== t.y) return false;
  update(myTargetRef, { found: true }); // everyone sees the banner and the target
  setTimeout(assignTarget, FOUND_MS);
  return true;
}
