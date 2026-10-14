# Higlo grid: the memory garden

**Play:** https://higlo-grid.web.app (opening it starts a private garden; share the link from the address bar)

**Write-up for Higlo:** docs/writeup.md

A small Memory-inspired game for a family or friends playing together from different homes, on phones, tablets or computers. 

Everyone hides a memory behind three clues. Then, as a team, they play rounds of Memory: a golden patch highlights where the images will be shown, tiles get turned for a few seconds for all to memorise, and they are finally asked to recall where a certain image was. Find it together and you earn a clue to someone's memory; miss it and the day moves on towards night, when the wolf sends everyone to bed. With three clues, everyone guesses the memory, out loud or typed, and the person who wrote it says if they got it. Found memories go into the family's memory chest.

No accounts, no install, no reaction races, no timer once someone is ready, nobody eliminated. Touch and click first; arrow keys and Enter work too. A one-minute tutorial teaches it by playing, and "🌱 Smaller patch" makes it easier for young children and grandparents. The tile is currently 7x7 for accessibility reasons.

## Where things are

- `public/`: the game (HTML, CSS, vanilla JS modules, no build step), sounds in `public/sfx/` (credits in its README).
- `database.rules.json`: Firebase Realtime Database rules.
- `docs/brief.md`: the brief from Higlo.
- `docs/game-design.md`: how the game works now, its current values, and what was set aside and why.
- `docs/playtest_*.md`: notes from each playtest with family and friends (11 to 13 October 2026).
- `docs/best_practices.md`, `docs/benchmark.md`, `docs/recommendations.md`, `docs/ideas.md`: research and options considered along the way.
- `docs/ClaudeCode_remarks.md`: remarks on working with Claude Code, and remarks from Claude Code.
- `docs/todo.md`: what's done and what's next.
- `sessions/`: the exported Claude Code sessions, in order. 00-research.md was made with claude.ai and gave as an output the benchmark.md and best_practices.md files.

The git history follows each idea and each playtest. Tags mark each phase up to the memory garden in its final forms: `v0-setup`, `v1-hotandcold`, `v2-treasurehunt`, `v3-guesstheanswer`, `v4-memory`, and `prototype-1-targets` (the first design).

## Running it

It's a static site with Firebase Realtime Database for the shared state (the SDK loads from Google's CDN).

- Preview channel: `firebase hosting:channel:deploy test --only higlo-grid`
- Live: `firebase deploy --only hosting` (rules: `firebase deploy --only database`)

Test aid: `?peek` in the link shows every picture and always sends the UFO.
