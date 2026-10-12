# Game design: memory garden (v4)

12 October 2026, after playtest 4; updated after playtest 5 the same evening. This replaces the "field" design (v3, tag `v3-guesstheanswer` and the commits after it): the lobby, memories, clues, guessing, night and the wolf stay; how clues are earned changes completely. Numbers are placeholding values, to be tweaked after playtests.

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

Playtest 4 (the field on 7×7) with William, and the accessibility and balance review:

- Guessing the memory is fun.
- There was no real reason to move: every square was the same until it was turned over.
- He suggested a Memory game played together: the youngest and the oldest players sometimes have a weaker memory, so remembering as a group helps them.
- The review found the field too hard (about 1 win in 5 without early guessing), long for two players, with small tap targets and many rules to learn.

Playtest 5 (the memory garden) with Mathilde:

- Remembering which square has which picture was really difficult, to the point of wondering if the pictures moved (they don't: each round flashed different squares). The grid felt too big.
- The ❓ and the sheep were only found once someone pointed them out.
- Pausing is great; hearts and messages are liked.
- "Tea time" won't be clear to other families: say "What a team!" and how many memories were found.
- Being able to write a note after a guess, not just right or wrong, to keep the moment and reminisce together.

## A session in one paragraph

Everyone opens the family link, lands in a lobby where they type their name and pick an animal and a colour, then pick a theme and write a short memory with three clues to it (or keep one still waiting to be guessed). Then they all pop up together in the middle of a 7 × 7 garden. Under the grass of the other 48 squares hide garden pictures: sakura flowers, tulips, snails, caterpillars, mushrooms and birds, eight of each, in places that stay the same all game. Each round, the whole garden shows its pictures for a few seconds, then a card shows which picture to find. The family talks it over ("the snails were bottom left!"), everyone walks to a square they think hides it, taps Ready, and after "3, 2, 1" the chosen squares show their pictures. If enough players found it, a clue to one family member's memory appears; if not, night falls a little. Everyone walks back to the middle for the next round. With three clues, everyone guesses the memory, the author says if they got it, and anyone can leave a little note about it. If every memory is found before full night, fireflies come out: "What a team!"; if the night falls, the wolf comes and everyone runs off to bed. The memories wait in the memory chest.

## 1. Arrival: the lobby

Unchanged from v3:

- Each player types their name and selects their animal and colour (each one unique, reserved live).
- They pick one of eight themes (places from our youth, food, holidays, toys and games, pets and animals, songs and music, funny moments, a secret about me) and write the memory in a few words (80 characters) and **three clues** (60 characters each). Each theme shows an example.
- A player with a memory still waiting to be guessed can **keep it** for this game.
- Players can skip writing (a young child, a reluctant player). "← Back" returns to name, animal and colour.
- Someone joining mid-game brings their memory into the game in progress.
- "How to play" never opens by itself: the ❓ above the field pulses, with a bouncing arrow pointing at it, until a player opens it once on that device.
- The author is recognised by a key made of their device and name.

## 2. The garden

- **7 × 7 for everyone, for now.** A size that follows the family was tried after playtest 5 (5 × 5 for 1 or 2 players, then 6 × 6 for 1 to 3): both felt too easy. The code can still do it (`sizeFor` in session.js), for later playtests.
- Everyone starts together on the centre square, which hides nothing, and comes back to it after every round.
- The other 48 squares each hide one garden picture: 🌸 sakura, 🌷 tulip, 🐌 snail, 🐛 caterpillar, 🍄 mushroom, 🐦 bird, 8 of each. Pictures only, so children who can't read can play.
- The board is drawn when the first round starts and stays the same until the game ends, so remembering where things are pays off round after round. Before that, players walk around a garden with nothing under it yet.
- Lines between the squares are a dark groove with a light edge, so the squares are easy to tell apart.
- Squares are always covered with grass, except while they flash, while they're revealed after a round, or while a sheep has grazed them.

## 3. Before the first round

- The bar asks "Ready to play?" and suggests reading the rules (❓). Players can walk around freely while they wait: tap a square and their circle walks there; nothing is turned over.
- The first round starts once everyone in the garden has tapped "Ready to play", or a minute after the first one did (so nobody who wandered off holds everyone up). Players joining later arrive in the game in progress.

## 4. A typical round

1. **Flash.** "3, 2, 1", then **every square** shows its picture for **5 seconds**, and the grass covers them all again. Players don't know yet which picture will be asked. The board never changes, so the family learns it a little more every round: hard at first, easier as the game goes on. (Before: 6 squares for 4 seconds, partly repeated; it made the pictures feel as if they moved.) The flash waits while anyone has a window open: the rules or the chest for up to 30 seconds, a clue card or a guess's result until it's closed.
2. **Pause.** About a second, with a message on screen ("Who remembers what?"), so nobody feels stuck. Nobody can move until every square is covered again.
3. **The card.** A card at the top shows the picture to find this round. It's never the same as the round before.
4. **Choosing.** Everyone talks it over and walks to a square they think hides it, then taps Ready (or presses Enter). Players can cross paths and share a square while walking, but no two players can choose the same square. The round ends when everyone is ready, or 20 s after the first Ready; anyone not ready keeps the square they're on.
5. **Reveal.** "3, 2, 1", then each chosen square shows its picture, popping up above the player like a heart, then the grass covers it again. (Pictures turning over like cards were tried and removed.)
6. **Result.**
    - **Found:** at least half the players, rounded up, found the picture on different squares (1 of 1 or 2, 2 of 3 or 4, 3 of 5 or 6). A clue to the current memory appears for everyone.
    - **Missed:** every square with the picture that nobody chose shows it in a gold ring ("Here's where they were"), then night falls one step. After **5 misses**, the wolf comes.
7. **Back to the middle.** Everyone walks back to the centre square, and the next round starts from there.

**One thing at a time.** After a round, each screen shows things in order, and nothing opens on top of something else: "3, 2, 1", the players walking and their squares' pictures, the result in the bar ("✅ Found!" or "🌙 the night falls a little…", with the missed squares), then the clue card, then the guess if all the clues are in, then its result with the notes, then the end screen if the game is over. Wherever players can do something (close a card, guess, judge, write notes), the game waits for everyone to finish, with no timer.

Everything stays collective: the game never shows who picked a wrong square.

## 5. Sheep

- Each player has **1 sheep per game**.
- During the choosing phase, a player can place it on any square. It grazes the 3 × 3 area around it: the squares there that don't hide this round's picture become short grass until the end of the choosing. What's left standing in that area is where the picture is. The sheep munches for a moment, then trots off with a "bêêê" and fades away, so it never hides a player on that square.
- Placing the sheep doesn't replace choosing a square: the player still picks one and taps Ready.
- A short, funny sheep animation and a munching sound.
- The 🐑 button pulses (no extra words) during a player's first choosing on that device, until they've used it or the round ends.

## 6. Memories, clues and guessing

- **One memory at a time**, in the order the players joined. Its clues are the rewards: each round found gives the next clue (1, then 2, then 3), as a card for everyone. The 💡 button lists the clues found so far.
- The memory's author helps find squares like everyone else, but doesn't guess.
- With all three clues, the rounds pause and everyone except the author guesses: type it, say it out loud (so children who can't write take part), or "not sure yet". The guesses appear together. Only the author judges: yes or no, or "someone got it" for a spoken guess. If the author has left, the group judges with the answer shown.
- **Ready to guess!** From the 💡 list, anyone but the author can start guessing before all three clues are in. If nobody gets it, the memory stays secret and the clues keep coming.
- **A note to keep.** Once the guess is judged (or the memory revealed), everyone, the author too, can leave a short note (80 characters), such as "I'd forgotten the red bicycle!". Each person can leave as many as they like. The next round waits until everyone has closed the result window, however long that takes, so nobody is cut off mid-note. Notes appear for everyone, live, and are kept with the memory: shown on the end screen and in the memory chest, where "📝 Add a note" lets the family keep adding to it later, and saved in the chest's page.
- **Nobody to guess.** When the only people in the garden are the memory's author (playing alone), nobody can guess it. The author chooses: **📖 Reveal it** (it goes in the chest, and notes can be added), or **🌱 Keep it for later** (it stays secret, counts as done for this game, and can be brought to the next game from the lobby). If someone joins in the meantime, they guess it as usual.
- After a guess (right, or revealed when nobody got it), the next memory begins.

## 7. Night and the wolf

- The sky starts sunny. Each missed round makes it darker by one step, through dusk to night, with stars and the moon.
- At full night (5 misses), the wolf appears and everyone runs off. "The wolf is out, let's go to bed!"
- Losing doesn't punish anyone: memories not guessed wait in the chest for next time.

## 8. End of game

**Win:** every memory found (guessed, or revealed after three clues) before full night. Fireflies, a short fanfare, and "🎉 What a team! Well done! You found 2 memories!", with the memories of this game and their notes.

**Loss:** full night. The wolf, "Let's go to bed!", and a reassurance that the memories aren't lost.

**Both:** each player chooses Play again. When everyone has, everyone goes back to the lobby to keep their memory or write a new one. "New game" does the same at any time. Only memories of people who are playing are used.

## 9. Persistence

- Memories belong to the family link: the memory chest (top right) keeps every memory found, grouped by game, with the date and who played, and can save them as a page.
- A game nobody has touched for 2 hours is replaced by a fresh one.

## 10. Talking and sharing

- 💬 A short message (40 characters) pops up in a bubble above its sender for everyone.
- ❤️ Tapping another player sends them a heart. Players who meet on a square get one each.
- 👋 "🐶 Mathilde has joined the game!" (with a doorbell ding) / "… has left the game" at the top; a refresh says nothing.
- ⏸️ Anyone can pause if they need to step away: everyone sees who paused, anyone can resume, and every clock carries on from where it stopped.
- Sky events every 1 to 2 minutes, for whimsy only, with soft sounds.

## 11. How to play

- A few picture cards, opened with ❓ (never by themselves; for anyone who hasn't opened it yet on that device, the ❓ pulses and a bouncing arrow points at it): the garden and its pictures, the flash and the card, choosing and Ready, finding versus missing (clues and the night), sheep, guessing, the memory chest.

## Principles this follows

See docs/best_practices.md and docs/benchmark.md.

- Everything is collective: no individual score, never who picked wrong.
- The group remembers together: the youngest and the oldest are helped by everyone else ("no, I remember, it's over there!"), and a child with a good memory can be the expert.
- No reflex race between homes: everyone sees the same flash, and choices are locked before the reveal.
- The 5-second flash is the one timed moment; nothing else rushes anyone. The timer only stops a round waiting for someone who has stepped away.
- Losing is gentle and gives a reason to come back.
- Pictures, not words, on the board. Voice stays on the family's own call; guesses can be spoken.

## Current values

Grid: 7*7 for everyone (for now), everyone starting on the centre square and back to it after each round
Pictures: 6 kinds, 8 of each (48 squares)
Flash: "3, 2, 1", then every square, 5 seconds, then about 1 second before the card
Missed round: every square with the picture that nobody chose shows for 3 seconds
Found: half the players rounded up, on different squares
Misses before the wolf: 5
Sheep: 1 per player per game, grazing 3*3
Clues: 3 per memory, one memory at a time
Timer: 20 s from the first player ready

Simulated (thousands of games, families of different memories): with the flash first and the card after, a family of 3 or 4 with an average memory wins about 9 times in 10, a forgetful one about 4 in 10, a sharp one nearly always; games last about 10 to 14 rounds. Families of 1 or 2 nearly always win, in 3 to 7 rounds: gentle and short. Showing the card first made every family win: the flash alone said where to go.

The adaptive grid (playtest 5) can't be settled by simulation: the model assumes each square is as easy to remember on any grid, and then a smaller grid comes out slightly harder (each picture has fewer copies for old memories to land on), and repeats cost a few percent. What a smaller grid changes is how well people remember each square, which only playtests can tell. Mathilde found the 7 × 7 really hard, closer to the model's "forgetful" family or below. In play, 5 × 5 and then 6 × 6 felt too easy, so the garden went back to 7 × 7, with the whole board shown in each flash instead: these numbers are for playtests to settle.

## Set aside

- **Guided hidden targets** (playtest 1): guides had nothing to do, and an ordinary target square wasn't motivating.
- **Pictionary**: already done well by Gartic Phone and skribbl.io, speed-based, typing excludes young children.
- **Cat and mouse at night**: real-time flashlight aiming is a reflex race between homes; too costly to balance in the time available. Its night atmosphere survives here.
- **Photos and voice recordings**: need Firebase's paid Blaze plan and raise privacy questions about photos of children; voice already goes through the call.
- **moving as a group**: can be frustrating
- **teaching kids words**: different product altogether
- **pick where to hide the memory**: maybe worth testing later, not for now
- **The field (v3)**: clues hidden under the grass, traps that brought the night, risky walks, 🔍! and ❓ marks, sheep grazing a line of five. Guessing was fun, but every square was the same until turned over, so moving had no purpose (playtest 4), and it was too hard (about 1 win in 5 without early guessing).
- **Movement limited to 3 squares, with glowing reachable squares** (playtest 3): too slow and visually heavy.
- **Showing the picture to find before the flash**: simulated, every family won, because the flash itself told them where to go.
- **A sound on/off button**: removed, phones and browsers already let people mute a page.
