// Message bubbles: a short message pops up above the sender's circle for
// everyone, then fades. For the little things a call doesn't carry well
// ("over here!", "I think it's grandma's"), and for anyone not on the call.
import { sessionRef, myId } from "./session.js";
import { push, remove, onDisconnect, onChildAdded } from "./firebase.js";
import { state } from "./state.js";
import { render } from "./render.js";

export const BUBBLE_MS = 5000; // must match the bubble animation in style.css
const MAX_LENGTH = 40;
const messagesRef = sessionRef("messages");

const form = document.getElementById("say");
const input = document.getElementById("say-text");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim().slice(0, MAX_LENGTH);
  if (!text || !state.joined) return;
  const messageRef = push(messagesRef, { from: myId, text });
  // The sender cleans up, so messages don't pile up in the database.
  onDisconnect(messageRef).remove();
  setTimeout(() => remove(messageRef), BUBBLE_MS);
  input.value = "";
  input.blur(); // on phones, put the keyboard away
});

// Every message, mine included, shows above its sender for a few seconds.
onChildAdded(messagesRef, (snap) => {
  const { from, text } = snap.val() ?? {};
  if (!from || !text) return;
  const startedAt = performance.now();
  state.bubbles.set(from, { text: String(text).slice(0, MAX_LENGTH), startedAt });
  render();
  setTimeout(() => {
    if (state.bubbles.get(from)?.startedAt !== startedAt) return; // a newer one took over
    state.bubbles.delete(from);
    render();
  }, BUBBLE_MS);
});
