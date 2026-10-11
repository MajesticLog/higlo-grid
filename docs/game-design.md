# Game design: field

11 October 2026, after playtest 1. Amended the same evening after playtest 2 (clues and guessing). Numbers are placeholding values, to be tweaked after playtests.

## Why this design

Playtest 1 (hidden targets, players guiding each other) with my sister Mathilde highlighted a few issues :

- Guides had nothing to do. Joining and waiting was boring.
- An ordinary target square wasn't motivating. Players wanted to find something personal.
- Players wanted the game to make them talk about themselves.

Playtest 2 (the field, with memories hidden under the grass) with my father added:

- The rules need explaining more clearly.
- The game should focus on exchange and communication, with more of a "quest": clues to follow.
- Guessing *what* a memory is matters more than finding *where* it is. How you get to the memory is as important as the memory itself.

## A session in one paragraph

Everyone opens the family link, lands in a lobby where they select their colour/icon, and are then prompted to write a short memory and three clues to it. The clues are hidden under the grass of the grid, close together, along with a few wolf traps. Each round, everyone picks a square at the same time, then all squares turn over together. Empty squares show an insect (less often) or a flower (most common option); clues appear for everyone, marked with their author's colour and animal; traps make night fall a little. Players can also send one of their sheep to graze a line of five squares. When all three clues of a memory are found, the game pauses: everyone else guesses what the memory is, out loud or in writing, and the author says yes or no. If every memory's clues are found before full night, fireflies come out and the family ends around a cup of herbal tea in the victory screen, where all memories can be revisited or saved/downloaded. If night falls, the wolf comes (howling sound, nothing scary), everyone runs off to bed, and the clues that weren't found stay hidden for next time.

## 1. Arrival: the lobby

- On opening the link, each player types their name, selects their animal and colour, and is then prompted to write a short memory or message (about 80 characters) and **three clues** to it (about 60 characters each). Use questions or suggestions to guide them: "A memory with someone here", "Something the others don't know about you", and an example of good clues.
- Text only for now. Small drawing to be explored in terms of feasability and implemented later.
- The clues will be hidden under grass squares, close together. The author doesn't see where.
- Someone joining mid-game writes their memory and clues, and they are hidden under squares that haven't been turned over yet.
- Players can skip writing (a young child, a reluctant player).
- Once the memory is written, the player sees how to play (first time), then is transported into the grid-field.

## 2. The grid

- The grid is covered in grass. Hidden under it: clues, wolf traps, and empty squares.
- Each player's three clues are hidden within a small area (about 3×3 squares). Finding one tells the group the others are nearby: that's the quest.
- Players start aligned at the bottom of the grid, on already upturned empty square showing a flower.
- Empty squares, once turned over, show an insect (15% of empty squares) that flies away or walks away and fades out, or a flower at random. The garden fills up as the game goes on.
- Found clues stay visible on their square for the rest of the game, framed in their author's colour with their animal and number (1, 2, 3). Tap one to read it again.

## 3. A typical round

1. **Choosing phase.** All players act at the same time. Each player either:
    - moves their circle to a square within 3 squares of where they are, and confirms; or
    - sends a sheep (see 4).
2. The phase ends as soon as everyone has confirmed, or 20s after the first player confirms (the clock only starts then, so families can talk it over). A player who hasn't confirmed turns over the square they're standing on.
3. **Reveal.** All chosen squares turn over together. Results are collective, no finger pointing at a person who picked a wolf square.
4. Two players may choose the same square. It turns over once.

## 4. Sheep

- Each player has 3 sheep per game, shown as sheep icons (no reading needed).
- Using a sheep replaces turning over a square for that round.
- The player taps a square: the sheep's line is that square and the next **four** (five squares). Tapping it again turns the line: up, right, down, left.
- The sheep eats the grass on empty squares, which reveals them (insect or flower).
- The sheep refuses to touch a square hiding a clue or a trap ("bêêê"). That square stays covered, marked with a ❓. It doesn't say what hides under.
- A short, funny sheep animation.

## 5. Clues and guessing

- When a clue turns over, a card opens for everyone: "🐶 Mathilde's clue, 2 of 3: …".
- When all three clues of a memory are found, the rounds pause (no clock, no night) and everyone except the author guesses what the memory is. Each guesser either types a guess or taps "I'll say it out loud", so young children who can't write still take part.
- The guesses appear together once everyone has answered, so nobody copies. The author can reveal them early if someone has stepped away.
- The author answers yes or no to each typed guess, or "Yes, someone got it!" for a spoken one.
- One round of guesses: if nobody gets it, the memory is revealed to everyone ("It was…") and play carries on. Nobody gets stuck.

## 6. Night and the wolf

- The sky starts sunny. Each trap turned over makes it darker by one step, bringing it to dusk and nightfall.
- The game never shows who turned over a trap. Night falls on the group.
- At full night (6 steps), the wolf appears and everyone runs off. "The wolf is out, let's go to bed!"
- Losing the game doesn't punish the players. Memories whose clues weren't all found remain, and will be added to the next game, although hidden in new spots.

## 7. End of game

**Win:** every memory's three clues found before full night.

- Fireflies, a short victory trumpet sound.
- End screen: the family around a cup of herbal tea (icons and a small teacup next to them), surrounding the set of memories found, each with its clues and whether the family guessed it.
- Option to look back through the memories found in this game.

**Loss:** full night.

- The wolf comes. "Let's go to bed!"
- Options: rewatch found memories if any, back to the main screen, or play again. Each player chooses; the new game starts once everyone has.
- A message makes clear that the memories that weren't found are not lost: they'll be hidden again in new places next game.

## 8. Persistence

- Memories belong to the family link, not to one game. They persist between sessions, in a treasure chest icon at the top right corner. Dated and grouped per game rather than a long list.
- Memories whose clues weren't all found are reshuffled into the next game, with any new ones.
- Found memories go into the memory chest, which can be revisited and importantly downloaded.
- Memories written before clues existed stay in the chest but are no longer hidden.

## 9. How to play

- A few illustrated cards, mostly icons and few words, shown once after the lobby and reopened with a ❔ button in the field.
- They cover: moving and Ready, traps and the night, sheep, clues and guessing.
- Traps must be stated plainly: each trap turned over makes the sky darker, and turning over too many (6) brings full night and the wolf. Find all the clues before then.
- The sheep get their own short explanation the first time a player sends one.

## Principles this follows

See docs/best_practices.md and docs/benchmark.md.

- Everything is collective: no individual score, no blame for traps.
- No reflex race between homes: positions are locked before the reveal, so latency doesn't matter.
- The timer only stops a round waiting for someone who has stepped away, no pressure, no stress
- Losing is gentle and gives a reason to come back.
- Voice stays on the family's own call. Guesses can be spoken, so writing is never required to play.

## Current values

Grid size: 11*11
1 memory and 3 clues per player, clues hidden within about 3×3 squares
8 "trap" squares (was 12: with 3 clues per player, 12 traps made winning nearly impossible)
Takes 6 wolf squares for the wolf to show up - to be adapted after playtesting
3 sheep bonus per player, grazing 5 squares
Players move by up to 3 squares
Timer set to 20s, from the first player ready


## Set aside

- **Guided hidden targets** (playtest 1): guides had nothing to do, and an ordinary target square wasn't motivating.
- **Pictionary**: already done well by Gartic Phone and skribbl.io, speed-based, typing excludes young children.
- **Cat and mouse at night**: real-time flashlight aiming is a reflex race between homes; too costly to balance in the time available. Its night atmosphere survives here.
- **Photos and voice recordings**: need Firebase's paid Blaze plan and raise privacy questions about photos of children; voice already goes through the call.
- **moving as a group**: can be frustrating
- **teaching kids words**: different product altogether
- **pick where to hide the memory**: maybe worth testing later, not for now
