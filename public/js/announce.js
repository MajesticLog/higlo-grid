// Arrivals and departures: a message at the top in the player's colour
// ("🐶 Mathilde has joined the game!"), with a doorbell "ding-dong" and a
// sparkle on the newcomer; or "👋 … has left the game", with a soft
// "bye-bye" and their circle waving goodbye where it stood. So everyone knows
// who comes and who goes. A refresh (leaving and coming straight back from
// the same tab) says nothing. Someone in the tutorial (tutorial.js):
// "🐶 Zoé is getting ready to join…", and no "has left" if they stepped out
// of the game for it.
import { onValue } from "./firebase.js";
import { myId, sessionRef } from "./session.js";
import { state } from "./state.js";
import { showFloat, showGoodbye } from "./render.js";
import { playDing, playGoodbye } from "./sound.js";

const TOAST_MS = 6000; // must match the toast animation in style.css
const LEAVE_WAIT_MS = 4000; // a refresh comes back within this: no message

const toasts = document.getElementById("toasts");
let known = null; // players at the last update (null until the first one)
const leaving = new Map(); // tab -> timer for a "has left" waiting to be said

const who = (p) => `${p.animal ?? ""} ${p.name ?? ""}`.trim() || "Someone";

// Getting ready to join: tab -> {name, animal, color}.
let arriving = {};
onValue(sessionRef("arriving"), (snap) => {
  const now = snap.val() ?? {};
  for (const [tab, p] of Object.entries(now)) {
    if (arriving[tab] || tab === state.me.tab || !state.joined) continue;
    toast(`${who(p)} is getting ready to join…`, p.color, "arriving");
  }
  arriving = now;
});

function toast(text, color, kind) {
  const el = document.createElement("div");
  el.className = `toast ${kind}`;
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
    toast(`${who(p)} has joined the game!`, p.color, "join");
    playDing();
    setTimeout(() => showFloat(p.id, "✨"), 0);
  }
  for (const p of known) {
    if (now.has(p.id) || p.id === myId) continue;
    // Still here from the same tab (a reload replaced their old circle): not leaving.
    if (p.tab && players.some((q) => q.tab === p.tab)) continue;
    const key = p.tab ?? p.id;
    leaving.set(key, setTimeout(() => {
      leaving.delete(key);
      if (p.tab && arriving[p.tab]) return; // stepped out for the tutorial
      toast(`👋 ${who(p)} has left the game`, p.color, "leave");
      playGoodbye();
      showGoodbye(key, p);
    }, LEAVE_WAIT_MS));
  }
  known = players;
}
