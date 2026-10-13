**PLAYTEST 7: memory garden, zones (v5)**

Beatrice (Boopsie), with Zoé, 13 October 2026, evening (game from 21:09)

- We used new browsers and a device that had never opened the link before, but the sheep still didn't come back after a memory was guessed. We need a sheep for each memory, or longer games become impossible.
- It's not clear enough that we are collaborating.
- It's not clear which square the other players are choosing, as opposed to ours.
- It's not clear that two players can't share a square (except the middle one).
- Wanted: an interactive tutorial for first-time players, played after writing a memory, that can be seen again with ❓.


**Follow-up: the sheep**

Checked in the code, the database and both sites, 13 October 2026, late evening.

- The test link has the sheep reset; the live site (higlo-grid.web.app) doesn't yet: it still counts one sheep per game. A new browser or device opening the live link gets the old rule, however fresh it is.
- Both sites share the same database, so a family link opened on one or the other leads to the same game, played by whichever code each person loaded.
- In the database, this game went through two memories (Boopsie's revealed, then Jo and co's found without its author) and has no sheep marked as used since, which is what the reset does.
