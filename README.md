# Higlo grid: the memory garden

**Play:** https://higlo-grid.web.app (opening it starts a private garden; share the link from the address bar)

A small game for a family or friends playing together from different homes, on phones, tablets or computers. Everyone hides a memory behind three clues ("🏖️ By the sea", "🍦 Ice cream", "☔ It rained"). Then, together in a garden, they remember where pictures hide under the grass: each round, a golden patch shows its pictures for a few seconds, a card asks for one, and everyone goes to a different square where they think it is. Find it together and you earn a clue to someone's memory; miss it and the day moves on towards night, when the wolf sends everyone to bed. With three clues, everyone guesses the memory, out loud or typed, and the person who wrote it says if they got it. Found memories go into the family's memory chest.

No accounts, no install, no reaction races, no timer once someone is ready, nobody eliminated. Touch and click first; arrow keys and Enter work too. A one-minute tutorial teaches it by playing, and "🌱 Smaller patch" makes it easier for young children and grandparents.

## Where things are

- `public/`: the game (HTML, CSS, vanilla JS modules, no build step), sounds in `public/sfx/` (credits in its README).
- `database.rules.json`: Firebase Realtime Database rules.
- `docs/brief.md`: the brief from Higlo.
- `docs/game-design.md`: how the game works now, its current values, and what was set aside and why.
- `docs/playtest_*.md`: notes from each playtest with family and friends (11 to 13 October 2026).
- `docs/best_practices.md`, `docs/benchmark.md`, `docs/recommendations.md`, `docs/ideas.md`: research and options considered along the way.
- `docs/ClaudeCode_remarks.md`: remarks on working with Claude Code, and notes for the write-up.
- `docs/todo.md`: what's done and what's next.
- `sessions/`: the exported Claude Code sessions, in order.

The git history follows each idea and each playtest. Tags mark each phase: `v0-setup`, `v1-hotandcold`, `v2-treasurehunt`, `v3-guesstheanswer`, `v4-memory`, and `prototype-1-targets` (the first design).

## Running it

It's a static site with Firebase Realtime Database for the shared state (the SDK loads from Google's CDN).

- Preview channel: `firebase hosting:channel:deploy test --only higlo-grid`
- Live: `firebase deploy --only hosting` (rules: `firebase deploy --only database`)

Test aid: `?peek` in the link shows every picture and always sends the UFO.
