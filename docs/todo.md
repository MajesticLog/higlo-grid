# To do

Updated 14 October 2026, morning. Deadline: Wednesday 14 October, 12:00.

## Before sending to Higlo

- [x] Deploy the database rules (`database.rules.json`), then play one game straight away to check nothing is blocked. Deployed 14 October with the live site; checked: listing sessions and an out-of-garden position are refused, a normal player is accepted, and a game on the live link afterwards worked. Updated the same morning for the answers kept in the chest.
- [ ] Write-up: who it's for, what we added and why, what we threw away, where Claude Code helped or got in the way, what we'd do with another day.
- [ ] Export the last session(s) into `sessions/`. `zoe-008-memorygarden.md` is in (14 October, early morning); export again at the very end, as it stops there.
- [ ] Email: live link (https://higlo-grid.web.app), repository, sessions, write-up.

## Next (after playtest 5, 12 October)

- [x] Rework the flash: showing all the cards at once is super overwhelming, and there's a balance issue. Rethink which cards get shown, and how. Done 13 October: a 3 × 3 zone glowing gold, "Ready?", then its pictures; misses before the wolf are players + 3, at least 5.
- [x] Remove every random event except the UFO: a 25% chance of it appearing once the sky is past dusk, at most once per game.
- [x] Line up a proper multiplayer session with the family. Done: playtest 6 (13 October) with Amélie, Mathilde, Joséphine and Olivia, then playtest 7 with Beatrice.
- [x] Revisit how someone joining or leaving is signalled, to make it more noticeable. Done 13 October: a goodbye sound, bigger tinted messages, a wave where they stood.
- [ ] Once the game feels balanced and fun, polish: SVGs, music, sound effects. Make interactions satisfying and rewarding.

## Family memories, found alone (built 13 October)

Memories left for the family can be found by someone playing on their own, at any time (asynchronous play across homes and time zones). To keep in mind:

- [ ] **The author is recognised by their device and name.** On another device (or after clearing the browser), an author could be offered their own memory to find. Filtering by name as well covers most cases; a real fix would need some kind of account, which the brief rules out.
- [x] **New fields need the database rules.** Memories reject any field the rules don't list, so the new ones (who found a memory alone, whether it's open to the family) must be added to `database.rules.json` before the rules are deployed. Done: `open`, `foundBy` and `answers` are in the rules, deployed 14 October.
- [x] **Time.** Built and playtested on 13 October, in time.

## After playtests 6 and 7 (13 October)

- [x] A break before each new memory ("Ready for the next memory?"), and a sheep for each memory.
- [x] Ready to play walks you back to the middle; resuming a pause restarts the flash; one UFO and one wolf per screen.
- [x] How to play: four cards with little looping scenes instead of eight of text.
- [x] A one-minute tutorial, learning by doing, offered once after the memory step and from ❓; the others see "getting ready to join".
- [x] Playing together made visible: everyone's pick in their colour, "one each!" on a taken square, "Find a 🌷 together", the card labelled and pulsing.
- [x] A twinkle when a round is found, a soft "aww" when it's missed.

## 14 October, morning

- [x] The squares the sheep leaves standing show the picture's white outline in a dashed ring (colour vision).
- [x] Ready? then the patch glowing alone for 3 s, then a 6 s flash (in the tutorial too).
- [x] "Smaller patch": a 3 × 2 patch for everyone, from the next flash.
- [x] No timer after the first Ready; the first round waits for anyone in the lobby or the tutorial.
- [x] The chest and its saved page show each memory's clues and everyone's answers.
- [x] Tutorial: "Tap here" where to go next, Ready glowing, clearer words for the sheep.

## Sound design

Done 12 October: the generated sounds were rendered to WAV files in `public/sfx/` (see its README), ready to be replaced by recorded or designed ones. Better sounds are part of the polish step above.

- [x] Choose the sounds: flip and pop, clue found, trap and night step, guessed (fanfare), wolf howl, sheep bleat and munching, the six sky events, heart, message.
- [x] Put them in `public/sfx/` with a README (file, use, licence, credit), small (MP3, a few tens of KB each).
- [x] Load them in `sound.js` and keep the generated sounds as a fallback. (No mute button: devices and browsers have their own.)
- [x] A twinkle when a round is found, a soft generated "aww" when it's missed (13 October).

## Known gaps

- ~~A refresh gives a fresh set of 3 sheep.~~ Discarded: one sheep per memory now, kept in the game.
- Memories written before author keys or clues can't be kept, and aren't hidden any more.
- ~~Balance simulated, not yet playtested: 7x7, 7 traps, night at 7.~~ Discarded: that was the field (v3); the memory garden's balance is in "Next" above.
- QR code next to the share link (needs a small library: ask first).
- Kinder wrong guesses (show ❌ only to the author), French, screen-reader support, a child-as-expert role, a garden that persists between games.
- ~~The 20 s timer after the first Ready~~ Removed 14 October: a round waits for everyone's Ready. Someone idle in the garden holds the round up (⏸️ or leaving solves it); someone idling in the lobby holds up the first round.
- Visually impaired players aren't supported yet: the game relies on seeing pictures.
