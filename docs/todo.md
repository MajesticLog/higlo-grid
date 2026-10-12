# To do

End of 11 October 2026. Deadline: Wednesday 14 October, 12:00.

## Before sending to Higlo

- [ ] Deploy the database rules (`database.rules.json`, written, not deployed), then play one game straight away to check nothing is blocked. Test mode can be put back in a minute if needed.
- [ ] Write-up: who it's for, what we added and why, what we threw away, where Claude Code helped or got in the way, what we'd do with another day.
- [ ] Export the last session(s) into `sessions/`.
- [ ] Email: live link (https://higlo-grid.web.app), repository, sessions, write-up.

## Sound design

The current sounds are generated in the browser (`public/js/sound.js`), which keeps the game light but sounds synthetic. Replace them with short recorded or designed sounds, kept as files like the images:

- [ ] Choose the sounds: flip and pop, clue found, trap and night step, guessed (fanfare), wolf howl, sheep bleat and munching, the six sky events, heart, message.
- [ ] Put them in `public/sfx/` with a README (file, use, licence, credit), small (MP3, a few tens of KB each).
- [ ] Load them in `sound.js` and keep the generated sounds as a fallback. (No mute button: devices and browsers have their own.)

## Known gaps

- A refresh gives a fresh set of 3 sheep.
- Memories written before author keys or clues can't be kept, and aren't hidden any more.
- Balance simulated, not yet playtested: 7x7, 7 traps, night at 7. Replay length with 4 players and the 20 s timer after the first Ready still to try.
- QR code next to the share link (needs a small library: ask first).
- Kinder wrong guesses (show ❌ only to the author), French, screen-reader support, a child-as-expert role, a garden that persists between games.
