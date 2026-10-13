# Game design: memory garden (v4)

12 October 2026, after playtest 4; updated after playtest 5 the same evening, and on 13 October (zones, dawn to night, music, family memories found alone). This replaces the "field" design (v3, tag `v3-guesstheanswer` and the commits after it): the lobby, memories, clues, guessing, night and the wolf stay; how clues are earned changes completely. Numbers are placeholding values, to be tweaked after playtests.

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

Everyone opens the family link, lands in a lobby where they type their name and pick an animal and a colour, then pick a theme and write a short memory with three clues to it (or keep one still waiting to be guessed). Then they all pop up together in the middle of a 7 × 7 garden. Under the grass of the other 48 squares hide garden pictures: sakura flowers, tulips, snails, caterpillars, mushrooms and birds, eight of each, in places that stay the same all game. Each round, a patch of the garden glows gold, "Ready?" pops up, and the patch shows its pictures for a few seconds; then a card shows which picture to find. The family talks it over ("the snails were bottom left!"), everyone walks to a square they think hides it, taps Ready, and after "3, 2, 1" the chosen squares show their pictures. If enough players found it, a clue to one family member's memory appears; if not, the patch shows again and the day moves on towards night. Everyone walks back to the middle for the next round. With three clues, everyone guesses the memory, the author says if they got it, and anyone can leave a little note about it. If every memory is found before full night, fireflies come out: "What a team!"; if the night falls, the wolf comes and everyone runs off to bed. The memories wait in the memory chest.

## 1. Arrival: the lobby

Unchanged from v3:

- Each player types their name and selects their animal and colour (each one unique, reserved live).
- They pick one of eight themes (places from our youth, food, holidays, toys and games, pets and animals, songs and music, funny moments, a secret about me) and write the memory in a few words (80 characters) and **three clues** (60 characters each). Each theme shows an example.
- A player with a memory still waiting to be guessed can **keep it** for this game.
- Under the clues, "🌍 The family can find it even when I'm not here" (ticked by default) leaves the memory **open**: someone playing without its author can find it (section 6).
- **Find a family memory:** the lobby lists open memories by others, still waiting and not found by this player yet, showing only who wrote each one and its theme ("🐶 Mathilde · 🍲 Food"). One can be brought into the game, with or without writing a memory of one's own.
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
- The first round starts once everyone in the garden has tapped "Ready to play", or a minute after the first one did (so nobody who wandered off holds everyone up). A rooster crows and the morning music starts. Players joining later arrive in the game in progress.

## 4. A typical round

1. **Flash.** A **3 × 3 patch** of the garden glows with a pulsing gold outline and a big **"Ready?"** pops up; once it has faded, the patch's squares show their pictures for **5 seconds**, then the grass covers them again. Players don't know yet which picture will be asked. The patch holds enough of that picture for the family to find it, plus one, when the garden allows (2 for 2 players, 3 for 3 or 4); it never includes the middle square where everyone stands, and it's never the same patch, nor the same picture, twice in a row. The board never changes, so the family learns it a little more every round. (Before: the whole garden at once, which was overwhelming; and earlier, 6 squares for 4 seconds, which made the pictures feel as if they moved.) The flash waits while anyone has a window open: the rules or the chest for up to 30 seconds, a clue card or a guess's result until it's closed.
2. **Pause.** About a second, with a message on screen ("Who remembers what?"), so nobody feels stuck. Nobody can move until every square is covered again.
3. **The card.** A card at the top shows the picture to find this round, labelled "Find" underneath and pulsing gently in gold, and the bar says "Find a 🌷 together" with how many of the family need to find one ("2 of you need to find one"). It's never the same picture as the round before. (Playtest 7: it wasn't clear whether to look for the picture or the sheep, nor that it's a team game. A big "Find a 🌷!" over the garden was tried and removed: distracting.)
4. **Choosing.** Everyone talks it over and walks to a square they think hides it, then taps Ready (or presses Enter). Everyone's chosen square shows in their colour with their animal (mine stronger, with "You"), so the family sees who's going where. Players can cross paths and share a square while walking, but no two players can choose the same square: tapping someone else's says so ("🐻 Grandma is on that square: one each!"). The round ends when everyone is ready, or 20 s after the first Ready; anyone not ready keeps the square they're on.
5. **Reveal.** "3, 2, 1", then each chosen square shows its picture, popping up above the player like a heart, then the grass covers it again. (Pictures turning over like cards were tried and removed.)
6. **Result.**
    - **Found:** at least half the players, rounded up, found the picture on different squares (1 of 1 or 2, 2 of 3 or 4, 3 of 5 or 6). A twinkle of bells, "✅ Found together!", and a clue to the current memory appears for everyone.
    - **Missed:** a soft "aww" (two low notes sliding down, never a buzzer), then the whole patch shows its pictures again ("Here's the patch again"), to help the family remember it, then the day moves on one step. After **players + 3 misses (at least 5)**, the wolf comes.
7. **Back to the middle.** Everyone walks back to the centre square, and the next round starts from there.

**One thing at a time.** After a round, each screen shows things in order, and nothing opens on top of something else: "3, 2, 1", the players walking and their squares' pictures, the result in the bar ("✅ Found!" or "🌙 the night falls a little…", with the missed squares), then the clue card, then the guess if all the clues are in, then its result with the notes, then the end screen if the game is over. Wherever players can do something (close a card, guess, judge, write notes), the game waits for everyone to finish, with no timer.

Everything stays collective: the result never says who picked a wrong square.

Players can choose any square they remember holding the picture, not only squares in the patch: remembering earlier rounds pays off, but the patch is a hint rather than a rule. Left as it is for now.

## 5. Sheep

- Each player has **1 sheep per memory**.
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
- After a guess (right, or revealed when nobody got it), a break: "🔍 Ready for the next memory?", with whose memory comes next. The next round starts once everyone has tapped ✓ Ready, or a minute after the first one did. Everyone gets their sheep back. The day carries on where it was.
- **Found without its author.** An open memory guessed while its author isn't in the garden isn't used up. Whoever is there sees the answer and says if they got it (the honour system; alone: "✅ Yes, I got it!" or "❌ Not this time"). Each of them is recorded on the memory, which stays hidden for the rest of the family until it's guessed with its author there. Their notes stay with it, out of the chest, so they spoil nothing.
- **👀** next to an answer: that player has found this memory before. They still guess with everyone: it's not a competition, and answers only show once everyone has answered.
- **Coming back:** the author sees "🎉 Zoé found your memory!", with whether they guessed it and their notes, and can reply with a note. The chest keeps these memories in a section only the author and the finders see.

## 7. Night and the wolf

- The day starts at dawn (a pale sky, pink towards the bottom) with the sun high in the corner. Each missed round moves the day along: morning, noon, afternoon, dusk, evening, then night, with stars and the moon. The squares only darken from dusk.
- The steps are spread over the misses allowed: **players + 3, at least 5** (5 for 1 or 2 players, 6 for 3, 7 for 4). It grows when someone joins, and never shrinks when someone leaves, so the wolf never jumps closer.
- At full night, the wolf appears and everyone runs off. "The wolf is out, let's go to bed!"
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
- 👋 "🐶 Mathilde has joined the game!" (with a doorbell ding) / "👋 … has left the game" (with a soft "bye-bye", and their circle waving where it stood) at the top, tinted with the player's colour; a refresh says nothing.
- ⏸️ Anyone can pause if they need to step away: everyone sees who paused, anyone can resume, and every clock carries on from where it stopped.
- A UFO, for whimsy only: once the sky is past dusk, one chance in four, at most once per game. (Several sky events were distracting.)
- **Music and ambience**, in two layers: "Morning" (Kevin MacLeod) from the rooster until nightfall, with a summer's day from noon to dusk and crickets from dusk on top. A 🎵 panel has a volume slider for each, on each device: a test aid, to see whether they add anything under a family call. Sounds keep their own volume.

## 11. How to play

- Four cards that show rather than tell, opened with ❓ (never by themselves; for anyone who hasn't opened it yet on that device, the ❓ pulses and a bouncing arrow points at it). Each has a little looping scene and one line: the golden patch ("Ready?", its pictures, the grass again); finding it together (the card, the sheep grazing, two players on the snails, ✓); a clue or the night (a clue card, then the sky darkening until the wolf); guessing the memory (three clues, a guess, 🎉; its line also says that 💡 then "Ready to guess!" guesses sooner). With less motion, each scene holds still on its telling moment. The credits for the music and sounds are at the bottom. (Before playtest 6: eight cards of text, too many and too long.) Under the cards: "▶ Play the tutorial".
- **The tutorial** (playtest 7): about a minute in a small practice garden, learning by doing, with 🐻 Grandma playing along. Offered once on each device after the memory step ("Play the tutorial" or "Join the game"), and always from ❓. The golden patch (shown again on a loop until the player picks a square); finding a 🌷 together, one square each; a 🐌 nobody saw, so a miss and the day moving on; the 🐌 again with the sheep; 🐰 Sam joining and leaving; then tapping ❓, 💡 and 🧺 in turn. Skip at any time. It only lives on that device: nothing is saved and the family's game isn't touched. Meanwhile the others see "🐶 Zoé is getting ready to join…"; from ❓ during a game, the player steps out quietly and comes back to the middle.

## Principles this follows

See docs/best_practices.md and docs/benchmark.md.

- Everything is collective: no individual score, never who picked wrong.
- The group remembers together: the youngest and the oldest are helped by everyone else ("no, I remember, it's over there!"), and a child with a good memory can be the expert.
- No reflex race between homes: everyone sees the same flash, and choices are locked before the reveal.
- The 5-second flash is the one timed moment; nothing else rushes anyone. The timer only stops a round waiting for someone who has stepped away.
- Losing is gentle and gives a reason to come back. So do family memories left open: anyone can drop in alone, at any time, and the author sees it next time.
- Pictures, not words, on the board. Voice stays on the family's own call; guesses can be spoken.

## Current values

Grid: 7*7 for everyone (for now), everyone starting on the centre square and back to it after each round
Pictures: 6 kinds, 8 of each (48 squares)
Flash: a 3*3 patch (not the middle) glowing gold, "Ready?" (1.6 s), then its pictures for 5 seconds, then about 1 second before the card
Missed round: the whole patch shows again for 4 seconds
Found: half the players rounded up, on different squares
Misses before the wolf: players + 3, at least 5
Sheep: 1 per player per memory, grazing 3*3
Clues: 3 per memory, one memory at a time
Timer: 20 s from the first player ready

Simulated before the zones (see docs/recommendations.md for the flash options; these figures are for the earlier flashes): with the flash first and the card after, a family of 3 or 4 with an average memory wins about 9 times in 10, a forgetful one about 4 in 10, a sharp one nearly always; games last about 10 to 14 rounds. Families of 1 or 2 nearly always win, in 3 to 7 rounds: gentle and short. Showing the card first made every family win: the flash alone said where to go.

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
- **The whole garden in each flash** (playtest 5, then 13 October): overwhelming unless the garden is tiny, which leaves no reason to move. Replaced by a 3 × 3 patch.
- **Several sky events** (balloon, birds, rain, owl, shooting star): distracting. Only the UFO is left, rarely.
- **Leaving out of the guess anyone who already knows a memory**: not as fun; a 👀 by their answer is enough, since it's not a competition.
