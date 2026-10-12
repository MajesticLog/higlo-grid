# Game design: field

11 October 2026, after playtest 1. Amended the same evening after playtest 2 (clues and guessing) and playtest 3 (clarity, free movement, replay, messages). Numbers are placeholding values, to be tweaked after playtests.

## Why this design

Playtest 1 (hidden targets, players guiding each other) with my sister Mathilde highlighted a few issues :

- Guides had nothing to do. Joining and waiting was boring.
- An ordinary target square wasn't motivating. Players wanted to find something personal.
- Players wanted the game to make them talk about themselves.

Playtest 2 (the field, with memories hidden under the grass) with my father added:

- The rules need explaining more clearly.
- The game should focus on exchange and communication, with more of a "quest": clues to follow.
- Guessing *what* a memory is matters more than finding *where* it is. How you get to the memory is as important as the memory itself.

Playtest 3 (clues and guessing) with my sister Amélie and her husband William added:

- The guessing screen was broken (everyone could judge, answers leaked between rounds).
- The visual hierarchy was confusing: the flower row, players versus clues, where you can move.
- It was hard to follow what happened in a round: everything turned over at once.
- They wanted to talk inside the game, to see all the clues found, and to guess as soon as they had an idea.
- New game kept the clues of people who weren't there.

## A session in one paragraph

Everyone opens the family link, lands in a lobby where they type their name and pick an animal and a colour, then pick a theme ("Places from our youth", "Food"…) and write a short memory with three clues to it, or keep a memory of theirs still waiting to be guessed. The clues are hidden under tall grass, near each other, along with a few wolf traps. Each round, everyone picks any square at the same time and taps Ready. Then "3, 2, 1" and the round plays back one player at a time: each circle walks to its square, the grass it walks through is cut, a trap on the way goes off and the sky darkens, a clue passed on the way is spotted (🔍!), and the square a player lands on turns over. Players can also send one of their sheep to graze a line of five squares. When all three clues of a memory are found, or whenever someone thinks they know it, the game pauses: everyone else guesses what the memory is, out loud or in writing, and the author says yes or no. If every memory is guessed or found before full night, fireflies come out and the family ends around a cup of herbal tea, where all memories can be revisited or saved. If night falls, the wolf comes (a soft howl, nothing scary) and everyone runs off to bed. Memories not guessed wait in the memory chest for their authors to bring them back next time.

## 1. Arrival: the lobby

- On opening the link, each player types their name and selects their animal and colour (each one unique, reserved live).
- Then they pick one of eight themes (places from our youth, food, holidays, toys and games, pets and animals, songs and music, funny moments, a secret about me) and write the memory in a few words (80 characters) and **three clues** (60 characters each) that hint without giving it away. Each theme shows an example memory and clues.
- A player with a memory still waiting to be guessed can **keep it** for this game instead of writing a new one.
- Text only for now. Small drawing to be explored in terms of feasability and implemented later.
- Players can skip writing (a young child, a reluctant player). "← Back" returns to name, animal and colour without losing what's typed.
- Someone joining mid-game brings their memory into the game in progress.
- The first time on a device, "How to play" opens before the field.
- The author is recognised by a key made of their device and name, so a later visit with another animal or colour still counts as them.

## 2. The grid

- The grid is 7 × 7 (it was 11 × 11, then 9 × 9: squares were too small to tap comfortably on a phone). It's covered in tall, unkept grass. Hidden under it: clues, wolf traps, and empty squares. Everyone starts in the middle, spread over the centre square and the 8 around it, which hide nothing.
- Each player's three clues are hidden near each other, within a 5×5 area, but never touching. Finding one tells the group the others are close: that's the quest.
- Turned-over squares are short grass: plain, with little flowers (dots of colour), or with an insect (15%) that flies or walks away.
- Found clues stay visible on their square for the rest of the game: a 🔍 on a pale card framed in the author's colour, with their animal and the clue's number (1, 2, 3). Tap one to read it again.
- A clue spotted on someone's way shows 🔍! until someone lands on it. A square a sheep refused shows ❓.

## 3. A typical round

1. **Choosing phase.** All players act at the same time. Each player either:
    - picks **any square** on the field (small footprints show the way they'll walk), and taps Ready; or
    - sends a sheep (see 4).
2. The phase ends as soon as everyone has confirmed, or 20s after the first player confirms (the clock only starts then, so families can talk it over). A player who hasn't confirmed turns over the square they're standing on.
3. **Replay.** "3, 2, 1", then each player's move plays one after the other: their circle walks square by square.
    - The grass they walk through turns over (short grass, flowers, insects).
    - A trap on the way goes off: the sky darkens as they reach it. The longer the walk, the bigger the risk.
    - A clue on the way is only spotted (🔍!): someone has to land on it to read it.
    - The square they land on turns over, clue or trap included.
    - Then the sheep graze. Clue cards and guessing come after the replay.
4. Results are collective. Two players may choose the same square; it turns over once. Players who meet on a square, even walking through, get a heart.
5. An author alone on one of their own clues doesn't turn it over (it would give their memory away): it gets a ❓.

## 4. Sheep

- Each player has 3 sheep per game, shown as sheep icons (no reading needed).
- Using a sheep replaces moving for that round.
- "Choose where to place your sheep": the player taps a square and the sheep's line is that square and the next **four** (five squares). Tapping it again turns the line: up, right, down, left (↻).
- The sheep eats the grass on empty squares, which reveals them (with a munching sound).
- The sheep refuses to touch a square hiding a clue or a trap ("Baa?", a bleat). That square stays covered, marked with a ❓. It doesn't say what hides under.

## 5. Clues and guessing

- When clues turn over, their cards open for everyone at the end of the replay, stacked if there are several: "🐶 Mathilde's clue, 2 of 3", with the clues found so far for that memory.
- The 💡 button lists every memory's clues found so far.
- When all three clues of a memory are found, the rounds pause (no clock, no night) and everyone except the author guesses what the memory is: type it, say it out loud (so young children who can't write still take part), or "not sure yet".
- **Ready to guess!** From the 💡 list, anyone but the author can start guessing a memory before all its clues are found. If nobody gets it, "Not yet! Keep looking": the memory stays secret. If someone gets it, its remaining clues go back to grass.
- The guesses appear together once everyone has answered, so nobody copies. The author can show them early if someone has stepped away.
- Only the author judges: yes or no to each typed guess, or "Yes, someone got it!" for a spoken one. If the author has left, everyone sees the answer and the group judges.
- One round of guesses once all clues are found: if nobody gets it, the memory is revealed to everyone ("It was…") and play carries on. Nobody gets stuck.

## 6. Night and the wolf

- The sky starts sunny. Each trap that goes off makes it darker by one step, bringing it to dusk and nightfall, with stars and the moon.
- The game never shows who turned over a trap. Night falls on the group.
- At full night (6 steps), the wolf appears and everyone runs off. "The wolf is out, let's go to bed!"
- Losing the game doesn't punish the players: memories not guessed wait in the chest, and their authors can bring them back next game.

## 7. End of game

**Win:** every memory guessed or all its clues found, before full night.

- Fireflies, a short victory trumpet sound.
- End screen: the family around a teapot, each with a cup, and the memories of this game with their clues and whether the family guessed them.

**Loss:** full night.

- The wolf comes. "Let's go to bed!"
- A message makes clear that the memories that weren't guessed are not lost.

**Both:** each player chooses Play again (a ✅ appears on their token). When everyone in the field has chosen, everyone goes back to the lobby to keep their memory or write a new one. "New game" (with a confirmation) does the same at any time. Only memories of people who are playing get hidden.

## 8. Persistence

- Memories belong to the family link, not to one game. They're kept in the memory chest (top right), grouped by game, with the date and who played.
- The chest shows a memory once it's been guessed or revealed, never before. It can be saved as a small page to keep.
- A memory not guessed comes back when its author keeps it in the lobby.
- A game nobody has touched for 2 hours is replaced by a fresh board.

## 9. Talking and sharing

- 💬 A short message (40 characters) pops up in a bubble above its sender for everyone, then fades.
- 👋 When someone joins, everyone sees "🐶 Mathilde has joined the game!" at the top and a sparkle on their circle; when someone leaves, "… has left the game". A refresh says nothing.
- ❤️ Tapping another player sends them a heart. Players who meet on a square get one each.
- Sky events every 1 to 2 minutes, for whimsy only: a hot-air balloon, birds, a rain shower (day); an owl, a shooting star, a UFO (night). Same moment for everyone, with soft sounds.

## 10. How to play

- Seven illustrated cards, mostly icons and few words, shown once after the lobby and reopened with the ❔ button: find the clues, pick a square, clues, guessing (and 💡), traps and the wolf, sheep, the memory chest.
- Traps are stated plainly: each trap makes the sky darker, and 6 bring full night and the wolf. Find all the clues before then.
- The first trap on a device also opens a short card saying so.

## Principles this follows

See docs/best_practices.md and docs/benchmark.md.

- Everything is collective: no individual score, no blame for traps.
- No reflex race between homes: positions are locked before the reveal, so latency doesn't matter.
- The timer only stops a round waiting for someone who has stepped away, no pressure, no stress
- Losing is gentle and gives a reason to come back.
- Voice stays on the family's own call. Guesses can be spoken, so writing is never required to play. Message bubbles help those who aren't on the call.

## Current values

Grid size: 7*7 (was 11*11, then 9*9), everyone starting in the middle 3*3, which hides nothing
1 memory and 3 clues per player, clues hidden in a 5×5 area, never touching
7 "trap" squares, and the wolf comes once all 7 have gone off. Chosen by simulating thousands of games on the 7*7 field: families win about 3 times in 5 with 2 players and 7 in 10 with 3 or 4, in 8 to 15 rounds (with 12, then 8 traps and night at 6 on 11*11, they won about 1 time in 5 without early guessing)
3 sheep bonus per player, grazing 5 squares
Players can move anywhere; traps on the path go off
Timer set to 20s, from the first player ready
Sky events every 1 to 2 minutes


## Set aside

- **Guided hidden targets** (playtest 1): guides had nothing to do, and an ordinary target square wasn't motivating.
- **Pictionary**: already done well by Gartic Phone and skribbl.io, speed-based, typing excludes young children.
- **Cat and mouse at night**: real-time flashlight aiming is a reflex race between homes; too costly to balance in the time available. Its night atmosphere survives here.
- **Photos and voice recordings**: need Firebase's paid Blaze plan and raise privacy questions about photos of children; voice already goes through the call.
- **moving as a group**: can be frustrating
- **teaching kids words**: different product altogether
- **pick where to hide the memory**: maybe worth testing later, not for now
- **Movement limited to 3 squares, with glowing reachable squares** (playtest 3): too slow and visually heavy. Replaced by free movement where the path itself is the risk.
- **Clearing the 8 squares around where you land**: tried, then replaced by turning over only the path walked.
- **Short grass and flowers as textures**: only the tall grass kept a texture; the short grass reads better as a simple drawing.
- **A sound on/off button**: removed, phones and browsers already let people mute a page.
- **Starting on the bottom row**: replaced by starting in the middle, as in the brief, spread over neighbouring squares.
