**PLAYTEST 7: memory garden, zones (v5)**

Beatrice (Boopsie), with Zoé, 13 October 2026, evening (game from 21:09)

- We used new browsers and a device that had never opened the link before, but the sheep still didn't come back after a memory was guessed. We need a sheep for each memory, or longer games become impossible.
- It's not clear enough that we are collaborating.
- It's not clear which square the other players are choosing, as opposed to ours.
- It's not clear that two players can't share a square (except the middle one).
- It's not clear whether we have to look for the picture or for the sheep: which picture to find should be announced more clearly.
- Wanted: an interactive tutorial for first-time players, played after writing a memory, that can be seen again with ❓.


**Follow-up: the sheep**

Checked in the code, the database and both sites, 13 October 2026, late evening.

- We played on the test link, which had the sheep reset (the live site didn't have it yet).
- Zoé used her sheep for the first memory. In the database, the game went through two memories (Boopsie's revealed, then Jo and co's found without its author), and no sheep was marked as used afterwards, so a reset did happen at some point. The exact path where the sheep stayed gone wasn't found.
- Fix: each sheep now remembers the memory it was used for, and is back as soon as the game plays for another one, however it got there. It no longer depends on the break between memories. Deployed to the test link and the live site the same evening, so every link runs the same code.


**What we changed**

Built and checked on the test link on 13 and 14 October, then live.

- Everyone's chosen square shows in their colour with their animal, and mine with "You".
- Tapping a square someone else chose says so: "🐻 Grandma is on that square: one each!".
- The bar says "Find a 🌷 together" and how many need to find one.
- The card to find is labelled "Find" and pulses; the sheep's button is just 🐑.
- A twinkle when a round is found, a soft "aww" when it's missed.
- A one-minute tutorial in a practice garden, learning by doing: offered once after the memory step, and from ❓. "Tap here" shows where to go next. The others see "… is getting ready to join".
