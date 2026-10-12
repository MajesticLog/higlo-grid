// Arrivals and departures: a short message at the top ("🐶 Mathilde has
// joined the game!") and a little sparkle on the newcomer, so everyone knows
// who comes and who goes. A refresh (leaving and coming straight back from
// the same tab) says nothing.
import { myId } from "./session.js";
import { state } from "./state.js";
import { showFloat } from "./render.js";

const TOAST_MS = 4000; // must match the toast animation in style.css
const LEAVE_WAIT_MS = 4000; // a refresh comes back within this: no message

const toasts = document.getElementById("toasts");
let known = null; // players at the last update (null until the first one)
const leaving = new Map(); // tab -> timer for a "has left" waiting to be said

const who = (p) => `${p.animal ?? ""} ${p.name ?? ""}`.trim() || "Someone";

function toast(text, color) {
  const el = document.createElement("div");
  el.className = "toast";
  el.style.setProperty("--c", color ?? "#999");
  el.textContent = text;
  toasts.append(el);
  setTimeout(() => el.remove(), TOAST_MS);
}

// Called by main.js with the new player list, before it replaces the old one.
export function playersChanged(players) {
  if (known === null || !state.joined) {
    known = players; // the first look (or still in the lobby): nothing to announce
    return;
  }
  const before = new Map(known.map((p) => [p.id, p]));
  const now = new Map(players.map((p) => [p.id, p]));
  for (const p of players) {
    if (before.has(p.id) || p.id === myId) continue;
    if (p.tab && leaving.has(p.tab)) { // back after a refresh: say nothing
      clearTimeout(leaving.get(p.tab));
      leaving.delete(p.tab);
      continue;
    }
    toast(`${who(p)} has joined the game!`, p.color);
    setTimeout(() => showFloat(p.id, "✨"), 0);
  }
  for (const p of known) {
    if (now.has(p.id) || p.id === myId) continue;
    const key = p.tab ?? p.id;
    leaving.set(key, setTimeout(() => {
      leaving.delete(key);
      toast(`${who(p)} has left the game`, p.color);
    }, LEAVE_WAIT_MS));
  }
  known = players;
}
