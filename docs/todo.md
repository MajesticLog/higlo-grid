# To do

End of 11 October 2026. Deadline: Wednesday 14 October, 12:00.

## Before sending to Higlo

- [ ] Deploy the database rules (`database.rules.json`, written, not deployed), then play one game straight away to check nothing is blocked. Test mode can be put back in a minute if needed.
- [ ] Write-up: who it's for, what we added and why, what we threw away, where Claude Code helped or got in the way, what we'd do with another day.
- [ ] Export the last session(s) into `sessions/`.
- [ ] Email: live link (https://higlo-grid.web.app), repository, sessions, write-up.

## Next (after playtest 5, 12 October)

- [x] Rework the flash: showing all the cards at once is super overwhelming, and there's a balance issue. Rethink which cards get shown, and how. Done 13 October: a 3 × 3 zone glowing gold, "Ready?", then its pictures; misses before the wolf are players + 3, at least 5.
- [x] Remove every random event except the UFO: a 25% chance of it appearing once the sky is past dusk, at most once per game.
- [ ] Line up a proper multiplayer session with Mum, my sister and the kids (depending on their constraints).
- [x] Revisit how someone joining or leaving is signalled, to make it more noticeable. Done 13 October: a goodbye sound, bigger tinted messages, a wave where they stood.
- [ ] Once the game feels balanced and fun, polish: SVGs, music, sound effects. Make interactions satisfying and rewarding.

## Family memories, found alone (built 13 October)

Memories left for the family can be found by someone playing on their own, at any time (asynchronous play across homes and time zones). To keep in mind:

- [ ] **The author is recognised by their device and name.** On another device (or after clearing the browser), an author could be offered their own memory to find. Filtering by name as well covers most cases; a real fix would need some kind of account, which the brief rules out.
- [x] **New fields need the database rules.** Memories reject any field the rules don't list, so the new ones (who found a memory alone, whether it's open to the family) must be added to `database.rules.json` before the rules are deployed. Done: `open` and `foundBy` are in the rules (still to deploy).
- [ ] **Time.** The deadline is Wednesday 14 October, 12:00. The rules deploy, the write-up, the session exports and the email come first; this feature only if there's time, otherwise it goes in the write-up as the next step.

## Sound design

Done 12 October: the generated sounds were rendered to WAV files in `public/sfx/` (see its README), ready to be replaced by recorded or designed ones. Better sounds are part of the polish step above.

- [x] Choose the sounds: flip and pop, clue found, trap and night step, guessed (fanfare), wolf howl, sheep bleat and munching, the six sky events, heart, message.
- [x] Put them in `public/sfx/` with a README (file, use, licence, credit), small (MP3, a few tens of KB each).
- [x] Load them in `sound.js` and keep the generated sounds as a fallback. (No mute button: devices and browsers have their own.)

## Known gaps

- ~~A refresh gives a fresh set of 3 sheep.~~ Discarded: one sheep per game now, kept in the game.
- Memories written before author keys or clues can't be kept, and aren't hidden any more.
- ~~Balance simulated, not yet playtested: 7x7, 7 traps, night at 7.~~ Discarded: that was the field (v3); the memory garden's balance is in "Next" above. Replay length with 4 players and the 20 s timer after the first Ready still to try.
- QR code next to the share link (needs a small library: ask first).
- Kinder wrong guesses (show ❌ only to the author), French, screen-reader support, a child-as-expert role, a garden that persists between games.
