I went through the game against your research documents and the brief, and ran a few thousand simulated games for the difficulty. In short: the game matches the research best on
  talk and gentleness. Its weak points are how much there is to learn, small tap targets on phones, and difficulty. As it stands it's a bit too hard, and long for two players.

  1. Accessibility and abilities

  What works
  - Not by colour alone: every player is a colour and an animal, and clues show colour, animal and number.
  - Gentle failure:
    - the game never says who set off a trap
    - losing means a soft wolf, then bedtime
    - there's no elimination and no score
  - No speed tests: moves are locked before the reveal, so a slow or distant player is never disadvantaged. The 20-second timer only starts once someone taps Ready.
  - Sound is never needed: everything you hear also shows on screen, and there's a mute button.
  - Reduced motion is respected for most animations.
  - Speech replaces writing for guesses ("say it out loud", "not sure yet"), and the sheep count is shown with icons rather than numbers.

  Gaps, most important first
  1. Small tap targets on phones. On a typical phone a square is about 33 px, below the usual 44 px minimum. That's hard for young children, for older fingers and for anyone with
     a tremor. Picks can be changed before Ready, and the footprints confirm the choice, which softens it.
  2. Landscape phones. The field is sized to fit the screen height minus room for the bars. Held sideways, a phone leaves almost nothing for the field. Portrait works.
  3. Lots to learn. Free movement, traps on the path, 🔍!, ❓, sheep and their directions, 💡 early guessing, the chest, messages, and six buttons with icons (❔ 💡 🧺 🔊 🔄 💬).
     That's the opposite of the "low floor" in best_practices.md (§1, §10). The rules cards help, but there are seven of them, mostly text.
  4. Reading: clue cards, memories and the rules are text. A child who can't read depends on an adult reading aloud. That's fine on a family call, but it's a dependency.
  5. Language: the whole game is in English. The playtests so far have been with French-speaking family, and for many grandparents that alone is a barrier.
  6. Screen readers: the field is not accessible. Squares have no labels, and what turns over isn't announced. Only the status bar is read out. Blind players can't play it today.
  7. Keyboard: you can play with arrow keys, Tab and Enter, but a sheep's line can't be turned from the keyboard.
  8. Wrong guesses are visible: each wrong answer shows a ❌ next to the person's name, in front of everyone. best_practices.md §11 (fear of failure) argues against that.

  2. Children and older players

  - Good for both:
    - talking about memories
    - guessing out loud
    - no reflexes needed
    - hearts and events for fun
    - themes that narrow down the guess
  - Children: they enjoy the sheep, insects, wolf and sky events. But they need an adult to write their memory, read the clues, and understand that walking far is risky. Nothing
    makes the child the expert (§13).
  - Older players: gentle and unhurried. The risk is the number of rules and icons, plus small text on clue tiles on phones.

  3. Against the brief

  ┌───────────────────────────────────────────────────────────────────────────────────┬────────────────────────────────────────────────────────────────────────────────────────┐
  │                                       Brief                                       │                                         Status                                         │
  ├───────────────────────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤
  │ 11×11 shared grid, link sessions, others' circles visible, leaving removes your   │ ✅                                                                                     │
  │ circle                                                                            │                                                                                        │
  ├───────────────────────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤
  │ Circle in the centre                                                              │ ❌ changed: players start on the bottom row                                            │
  ├───────────────────────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤
  │ Arrow keys move your circle one square at a time                                  │ ❌ changed: arrows move your pick, taps work everywhere, and circles move during the   │
  │                                                                                   │ replay                                                                                 │
  ├───────────────────────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤
  │ Others' circles move in real time                                                 │ Partly: presence, picks, hearts and messages are real time; moves play back once per   │
  │                                                                                   │ round                                                                                  │
  ├───────────────────────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤
  │ Live link, repository, sessions                                                   │ ✅ (sessions up to 004)                                                                │
  ├───────────────────────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤
  │ Write-up                                                                          │ Still to do                                                                            │
  └───────────────────────────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────────────────┘

  The brief explicitly allows changes ("change the grid, the circles or the controls… and tell us why"). The v0-setup tag shows the base existed. The write-up has to explain these
  three changes: touch first, no racing between homes, and the replay so everyone can follow.

  One risk: "A few ideas done with care are better than many done roughly." The game now has a lot: sheep, sky events, messages, hearts, chest, early guessing, replay. In the
  write-up I'd present one core loop (find a family member's clues, guess their memory together) and treat everything else as supporting it.

  4. Against best_practices.md and benchmark.md

  Followed well
  - the exchange is the point (§4)
  - low stakes, cooperative (§3)
  - no racing across homes (§8)
  - drop-in and drop-out (§7)
  - a lasting trace with the memory chest and saving (§9), and no streaks
  - surprise and humour (§5)
  - tested with real families three times (§15, the strongest point)
  - from the benchmark:
    - join by link with no account
    - private rooms
    - video left to the family's call
    - a reveal and a keepsake
    - wordless gestures (hearts)

  Partly
  - Roles: they're asymmetric (the author versus the guessers, §2), but nothing gives a child the expert role (§13), and there's no "take my hand" gesture.
  - Persistence: memories carry over between games, but the field resets each game. It's not yet the persistent garden the benchmark identified as the main gap.

  Missing
  - A QR code beside the link (recommended in the benchmark, useful for grandparents on a tablet).
  - "Name optional" (recommended in the benchmark). We require a name, but we need it to know who wrote each memory. That's worth one line in the write-up.

  5. Difficulty

  How I measured it: a simplified simulation of 3,000 games per case under the current rules. It models no sheep and no talking, and assumes early guessing succeeds half the time
  once 2 clues are found. Take the figures as an indication, not a promise. Two kinds of family:
  - cautious: creeps outwards
  - bold: goes anywhere

  Current settings (8 traps, night at 6)

  ┌─────────┬────────────────────────┬──────────────────────────┬─────────────────────────┐
  │ Players │ Win, no early guessing │ Win, with early guessing │ Typical length (rounds) │
  ├─────────┼────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ 2       │ 14–21%                 │ 36–45%                   │ 25–39                   │
  ├─────────┼────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ 3       │ 20–23%                 │ 51–54%                   │ 15–24                   │
  ├─────────┼────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ 4       │ 19–21%                 │ 50%                      │ 11–18                   │
  └─────────┴────────────────────────┴──────────────────────────┴─────────────────────────┘

  What this means
  - Too hard: early guessing is what makes winning possible. Without it, families lose four times out of five.
  - Two players have the hardest time, with the lowest odds and the longest games. With one round taking about 30 to 60 seconds, that's 15 to 30 minutes. The research favours
    short sessions.

  Other settings (win rate with early guessing, averaging both kinds of family)

  ┌─────────────────────┬───────────┬───────────┬─────────────────┐
  │       Setting       │ 2 players │ 3 players │    4 players    │
  ├─────────────────────┼───────────┼───────────┼─────────────────┤
  │ 6 traps, night at 6 │ 60%       │ 81%       │ 81%             │
  ├─────────────────────┼───────────┼───────────┼─────────────────┤
  │ 8 traps, night at 8 │ 65%       │ 84%       │ 87%             │
  ├─────────────────────┼───────────┼───────────┼─────────────────┤
  │ 7 traps, night at 7 │ 63%       │ 84%       │ 84%             │
  ├─────────────────────┼───────────┼───────────┼─────────────────┤
  │ 6 traps, night at 7 │ 73%       │ 98%       │ 100% (too easy) │
  └─────────────────────┴───────────┴───────────┴─────────────────┘

  My recommendation: 7 traps, night at 7. Families would win most of the time (60 to 85%), which suits a gentle family game, while traps still matter. It's a two-line change.
  Sheep and talking will help a little more in real play. Shortening two-player games would need a bigger change (fewer clues, or a smaller field), so I'd leave that for another
  day and mention it in the write-up.

  Quick wins before Wednesday

  1. Balance: 7 traps, night at 7.
  2. Landscape phones and small screens: stop the field shrinking to almost nothing.
  3. Kinder wrong guesses: show ❌ only to the author. Everyone else just sees "not this time".
  4. Keyboard: a key to turn the sheep's line.
  5. A QR code next to the share link, a small addition the benchmark recommended.

  Too big for now, so for the write-up's "another day" section: French and other languages, screen-reader support, larger tap targets (zoom or bigger squares), a child-as-expert
  role, and a garden that persists between games.

## My notes on working with Claude Code

- I didn't realise I could (should?) use `/clear` between tasks. All the work from 10 to 12 October ran in one long conversation, which had to be summarised whenever it got too long.

## Notes for the write-up

- **Zones and bigger families (13 October).** The flash now shows a 3 × 3 zone that holds the picture to find: 2 of it for 2 players, 3 for 3 or 4 players. A round is found when half the players (rounded up) are on the picture, so 3 is enough to win, but with 4 players one person can never stand on the right picture, and only 3 out of 4 taking part isn't much fun. Since the brief says the game will be tried from 2 or 3 devices, it's kept like this for now. For bigger families, the fix would be to let players share a square, or to make the middle square a "safe" square where anyone unsure can stay.
- **Choosing squares outside the zone (13 October).** Players can choose any square in the garden that they remember holding the picture, not only squares in the zone that just flashed. That rewards remembering earlier rounds, but it also means the zone is a hint rather than a rule. I'm on the fence, and leaving it as it is for now.
