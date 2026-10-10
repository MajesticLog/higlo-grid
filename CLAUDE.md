# Higlo grid

Small browser multiplayer game for families playing together from different homes and potentially different devices (we will assume touch screens and potentially computer with mouse clicks, arrow keys as an option).
Brief: docs/brief.md. Research: docs/best_practices.md, docs/benchmark.md.

## Stack
- Static site in public/ (HTML, CSS, vanilla JS modules). No build step.
- Firebase Realtime Database for shared state; Firebase SDK loaded from the CDN.
- Deploy with `firebase deploy`. Security rules live in database.rules.json.

## How to work with me
- Propose a plan before large changes; wait for my go-ahead.
- Keep changes small and commit after each working step, with clear messages.
- Explain technical decisions briefly so I can follow and learn.
- Do not add dependencies or a build tool without asking.
- Test with two browser windows before calling something done.

## Design principles (from docs/best_practices.md and docs/benchmark.md)
- Players: families across homes and generations, from young children to grandparents.
- Touch and click first; arrow keys as a bonus, not the only control.
- No timers that fail the group, no reaction races, no elimination.
- Private rooms only, no accounts, no install.
If a request conflicts with these, say so before implementing it.