# Game design: field

11 October 2026, after playtest 1. Numbers are placeholding values, to be tweaked after playtests.

## Why this design

Playtest 1 (hidden targets, players guiding each other) with my sister Mathilde highlighted a few issues :

- Guides had nothing to do. Joining and waiting was boring.
- An ordinary target square wasn't motivating. Players wanted to find something personal.
- Players wanted the game to make them talk about themselves.


## A session in one paragraph

Everyone opens the family link, lands in a lobby where they selected their colour/icon, and are then prompted to write a short memory or message, or draw something (or upload a photo if doable although not on the firebase free plan). These memories are "treasures" that are hidden under the grass of the grid, along with a few wolf traps. Each round, everyone picks a square at the same time, then all squares turn over together. Empty squares show an insect (less often) or a flower (most common option); treasure-memories appear for everyone; traps make night fall a little. Players can also send one of their sheep to graze a line of three squares. If all memories are found before full night, fireflies come out and the family ends around a cup of herbal tea in the victory screen, where all found memories can be revisited or saved/downloaded. If night falls, the wolf comes (howling sound, nothing scary), everyone runs off to bed, and the memories that weren't found stay hidden for next time.

## 1. Arrival: the lobby

- on opening the link, each player selects their icon and is then prompted to write a short memory or message. Use questions or suggestions to guide them "A memory with someone here", "Something the others don't know about you".
- Text only for now. Small drawing to be explored in terms of feasability and implemented later.
- The memory will be hidden under a random grass square. The author doesn't see where.
- Someone joining mid-game writes their memory and it is hidden under a square that hasn't been turned over yet.
- once the memory is written, the player is then transported into the grid-field.

## 2. The grid

- The grid is covered in grass. Hidden under it: memories, wolf, and empty squares.
- Players start aligned at the bottom of the grid, on already upturned empty square showing a flower.
- Empty squares, once turned over, show an insect (15% of empty squares) that flies away or walks away and fades out, or a flower at random. The garden fills up as the game goes on.
- Found memories stay visible on their square for the rest of the game.

## 3. A typical round

1. **Choosing phase.** All players act at the same time. Each player either:
    - moves their circle to a square within 3 squares of where they are, and confirms; or
    - sends a sheep (see 4).
2. The phase ends as soon as everyone has confirmed, or when the timer runs out (20s). A player who hasn't confirmed turns over the square they're standing on.
3. **Reveal.** All chosen squares turn over together. Results are collective, no finger poiting at a person who picked a wolf square.
4. Two players may choose the same square. It turns over once.

## 4. Sheep

- Each player has 3 sheep per game.
- Using a sheep replaces turning over a square for that round.
- The player picks three squares in a line (horizontal or vertical).
- The sheep eats the grass on empty squares, which reveals them (insect or flower).
- The sheep refuses to touch a square hiding a memory or a trap. That square stays covered. It doesn't say what hides under.
- A short, funny sheep animation.

## 5. Night and the wolf

- The sky starts sunny. Each trap turned over makes it darker by one step, bringing it to dusk and nightfall.
- The game never shows who turned over a trap. Night falls on the group.
- At full night (5 steps), the wolf appears and everyone runs off. "The wolf is out, let's go to bed!"
- Losing the game doesn't punish the players. The treasures-memories remain there and will be added to the next game, although hidden in new spots.

## 6. End of game

**Win:** every hidden memory found before full night.

- Fireflies (?), a short victory trumpet sound.
- End screen: the family around a cup of herbal tea (icons and a small teacup next to them), surrounding the set of memories found.
- Option to look back through the memories found in this game.

**Loss:** full night.

- The wolf comes. "Let's go to bed!"
- Options: rewatch found memories if any, back to the main screen, or play again.
- A message makes clear that the memories that weren't found are not lost: they'll be hidden again in new places next game.

## 7. Persistence

- Memories belong to the family link, not to one game. They persist between sessions. Let's store them in a treasure chest icon at the top right corner or something like that. Date them and store them grouped per session rather than a long list.
- Unfound memories are reshuffled into the next game, with any new ones.
- Found memories go into a memory book/box that can be revisited and importantly downloaded.

## Principles this follows

See docs/best_practices.md and docs/benchmark.md.

- Everything is collective: no individual score, no blame for traps.
- No reflex race between homes: positions are locked before the reveal, so latency doesn't matter.
- The timer only stops a round waiting for someone who has stepped away, no pressure, no stress
- Losing is gentle and gives a reason to come back.
- Voice stays on the family's own call.

## Current values

Grid size: 11*11
1 memoy per player
12 "trap" squares
Takes 6 worl squares for the wolf to show up - to be adapted after playtesting
3 sheep bonus perplayer
Players move by up to 3 squares
Timer set to 20s


## Set aside

- **Guided hidden targets** (playtest 1): guides had nothing to do, and an ordinary target square wasn't motivating.
- **Pictionary**: already done well by Gartic Phone and skribbl.io, speed-based, typing excludes young children.
- **Cat and mouse at night**: real-time flashlight aiming is a reflex race between homes; too costly to balance in the time available. Its night atmosphere survives here.
- **Photos and voice recordings**: need Firebase's paid Blaze plan and raise privacy questions about photos of children; voice already goes through the call.
