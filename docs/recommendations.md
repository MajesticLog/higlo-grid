# Recommendations: the flash and the balance

12 October 2026, after playtest 5 (Mathilde) and Zoé's own games. Showing every picture in the flash felt overwhelming, and the balance was off. This tests the alternatives in a simulation before changing the game.

## How it was tested

A Monte Carlo simulation of the memory garden: 7 × 7, 48 pictures (6 kinds × 8), centre square empty, the board fixed all game. Thousands of games per setting, for families of 1, 2 (two adults, or a grandparent and a child), 4 and 6 of mixed ages, and a weaker and a stronger family of 4.

The memory model, built so that showing more squares isn't free:

- **Capacity:** each player takes in only a few picture-and-square pairs from one 5-second glance (about 4 for an adult in the generous model, fewer for a young child).
- **Overload:** shown N squares, a player takes in `capacity × min(1, √(2 × capacity / N))` of them, so 48 squares give well under half of what 6 would.
- **Recall:**
  - What was taken in this round is recalled most of the time.
  - Squares seen in earlier rounds (flashes and replays) build up, then fade.
  - Some recalls are off by one square.
- **Rounds:**
  - The family pools what it remembers, but needs half the players (rounded up) on different right squares.
  - A sheep (one per player per game) is used when they know too few.
- **Learning from the replay:** after each round, the chosen squares show, and on a miss every square with the picture shows. Both count as learning chances.
- **Winning:** 3 clues per memory, one memory per player, before 5 misses.

A first, generous model gave every option about 100% wins, which contradicts the playtests: Mathilde found the 6-square flash on 7 × 7 "really difficult". The numbers below use a harsher model closer to what the playtests felt:

- less taken in per glance
- recall 75% within a round
- 35% of recalls off by one square
- faster fading

**These parameters are chosen, not measured: trust the ranking of the options more than the exact percentages.**

## Results

Win rate (harsher model), 5 misses for everyone:

| Flash | Alone | 2 adults | Grandparent + child | Family of 4 | Weaker 4 | Stronger 4 |
|---|---|---|---|---|---|---|
| All 48 (current) | 53% | 74% | 57% | **5%** | 1% | 34% |
| 4 random | 92% | 100% | 99% | 99% | 93% | 97% |
| 6 random (before) | 86% | 99% | 92% | 94% | 55% | 99% |
| **8 random** | 75% | 96% | 85% | 76% | 24% | 97% |
| 12 random | 64% | 90% | 72% | 37% | 9% | 87% |
| 2 picture kinds in full (16) | 82% | 97% | 87% | 65% | 16% | 96% |
| A 3 × 4 area of the garden | 69% | 93% | 77% | 47% | 9% | 91% |
| Growing from 6 to 16 | 74% | 94% | 80% | 44% | 7% | 93% |

("Random" flashes include enough of the asked picture to succeed, plus one.)

The night scaled with the family (8 random squares):

| Misses allowed | Alone | 2 adults | Grandparent + child | Family of 4 | Family of 6 | Weaker 4 | Stronger 4 |
|---|---|---|---|---|---|---|---|
| 5 for everyone | 77% | 96% | 84% | 74% | 46% | 27% | 98% |
| players + 3, at least 5 | 77% | 97% | 87% | 90% | 89% | 47% | 100% |

## Findings

1. **Showing all 48 is the worst option.** It overloads everyone, and it's harsh on bigger families: a family of 4 wins 5% of the time. Skill barely changes the outcome either (1% for a weaker family against 34% for a stronger one), so it feels like luck. This matches "super overwhelming" from the playtest.
2. **Family size is the real imbalance, whatever the flash.** A family of 4 needs 12 clues (3 per memory) and a family of 6 needs 18, but every family gets the same 5 misses.
3. **8 random squares gives the best spread.** Most families win, a weaker family has a real chance, and a stronger one feels the difference. 6 is a bit easy; 12 and more tip into overload.
4. **Two picture kinds in full** ("today: all the snails and all the mushrooms") is worth playtesting for how it feels. It may be easier to take in than scattered squares, which the model doesn't capture.

## Recommendations

- **Flash:** 8 random squares for 5 seconds, including enough of the asked picture to succeed, plus one.
- **Night:** allow players + 3 misses before the wolf, never fewer than 5.
- **Pairs:** two adults still win about 97%. If pairs feel too easy in play, show them a few more squares (10 to 12).
- **Playtest:** the session with Mum, my sister and the kids will settle the numbers. Note who remembered what, how many rounds were found, and whether the flash felt overwhelming.

## Open: more than one picture to find (to decide)

With more than 2 players, there should be more than one kind of picture to find in a round, so everyone has a part to play and the round asks the family to share out the work:

- **2 players:** build a pair (two squares of the same picture).
- **4 players:** build 2 pairs (two kinds, two squares of each).
- **3 and 5 players:** to be decided.

Not simulated yet. It changes what "found" means and how many of each picture the flash needs to show.

## Caveats

- The memory model's parameters are chosen to fit how the playtests felt, not measured.
- In the harsher model, round success drops slightly in late rounds rather than rising as the family learns the board. Partly that's because only struggling families play long games. But it suggests 8 random squares won't, on its own, deliver the "gets easier as you learn" feel.
