Read CLAUDE.md, docs/game-design.md, docs/design-change-v4.md and docs/playtest_12_10_william.md.

After talking with William (playtest 3), I'm changing the core loop: the board becomes a shared Memory game, and finding symbols together unlocks the clues. design-change-v4.md has the agreed design.

Before building:
1. Commit the two new docs on their own: "add William's feedback and design change v4".
2. Merge design-change-v4.md into game-design.md, so game-design.md describes the current game. Move what is removed (traps, clues under the grass, path turning, old sheep) into its "Set aside" section, with the reasons. Then delete design-change-v4.md, so there is only one design document. Commit.

Then propose a plan, one commit per step, each deployed to the test channel for me to check on two devices:
1. 7×7 board of symbols, drawn once per game; remove traps, clues on the board, path turning and the old sheep. Keep the lobby, clue cards, guessing, night, end screens, chest and events.
2. The round: card, flash synced across devices (use server time), choosing, reveal, success → next clue / miss → night.
3. The new sheep.
4. Update "How to play" to the new rules.

Points I want your view on in the plan:
- The round result must be decided exactly once, even with several devices (as now).
- How you'll make the flash start at the same moment everywhere, and what happens for a player who joins mid-flash.
- Anything in the design that conflicts with CLAUDE.md, or that you think won't work at the table.

All numbers go in the config file. Explain your choices briefly; I'm learning. Don't build anything until I approve the plan.