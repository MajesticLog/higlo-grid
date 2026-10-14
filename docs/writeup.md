# Zoé Caudron
# Higlo grid: the memory garden

· Live link: https://higlo-grid.web.app 
· Repository: https://github.com/MajesticLog/higlo-grid 
· Sessions to be found in /sessions
· Research, playtests, game design, notes and remarks to be found in /docs

## General

I loosely followed the "Proven, Better, New" principles: not reinventing the wheel, but adding touches that improve a game that's already proven to be a 
family favourite (in this case, Memory). It seemed a better use of the short time available to come up with a game.

I asked claude.ai to conduct a research to help define best practices and a benchmark; the research session is available under the sessions folder, the best practices and benchmark files are in docs. 

I also took note of a few highly popular family games that are open to all generations. These are either games I play with my family (intergenerational, at the dinner table before bed) or recommended by friends and family. The exact games and rules can be found at the end of this write up.

In the end, after playtesting, I settled on the Memory game: accessible, minimal text, widely known.


## Who I imagined playing it, and what they're doing together

- A family, spread between homes, or long-distance friends; people who have things in common, and memories to share, recall, and cherish.
- They're already on a call or video call. The game gives them something to talk about. It also enables intergenerational dialogue, transmission and sharing of familial anecdotes and memories, important for both children and grand-parents.
- What they do: each person writes a memory they want to share, that others can guess using three clues. They play a round of Memory as a team. If they find the minimum number of tiles, they unlock a clue. Otherwise, the night falls a little: complete dark brings out the wolf and everybody goes to bed (non-threatening for children, non-frustrating loss). Three clues means people have to try and guess the memory. They can add notes and anecdotes in the moment or later on, as families share a unique user link.
- Why they'd come back: the memory chest keeps every memory found, with its clues, answers and notes, game after game. Memories can be saved for another time, meaning players in different time zones or with difficult schedules can still play asynchronously, leaving little messages to be found by their loved ones.

## How does it feel when someone arrives, moves, or leaves?

- Players in-game get a notification that someone has joined the lobby and is getting ready to join, creating expectation.
- A message and a sound cue mark players arriving or leaving, making it clearer to all. 
- Players sharing a tile generate little hearts; players joining the game all pop in the middle tile, so the hearts are noticeable. We move anywhere on the
grid, in a smooth tile-by-tile movement, but crossing paths with a player also pops a heart.

## What interface and device does each person use, and what's the best way for them to use it?

- I used my iPhone 13, tablet and my laptop to test the game
- my family and friends playtested mostly on mobile devices, although one used a laptop as well
- The game is supposed to be played in short sessions, fitting around family obligations and schedules. Mobile and browser are the two best options, so I
amended the controls to allow for tapping and clicking as well as keyboard controls.

## Identity

- the game is casually referred to as the Memory Garden: a Memory game where the goal is to unlock memories. 
- Each family has a unique link, with access to their own treasure chest containing all past memories, notes, anecdotes... that can be downloaded at any time.
- it's family friendly, so it has a peaceful and soft atmosphere: the sheep, the transition from day to night, the wolf that sends players to bed means losing isn't failing. Children reacted to that with the usual "But I don't want to go to bed" and asked to play again, which I took
as a good sign.
- the music and sound designs anchor the atmosphere of the game.
- there is a random event that can take place once you are getting close to nightfall: a UFO comes visit, creating a fun surprise that also softens the loss.

## Small touches

- Sound effects. Multiplayer games on small screens can get confusing really fast, which I saw during playtests. Clear sound cues massively helped with that.
- The golden glow helps player know where to look, preventing frustration.
- the interactive tutorial helps player learn by doing.
- The hearts when tapping another player, a nice signal that the player interacts with us even at a distance. Reminiscent of the multiplayer experience in Journey, for example. 
- sending short messages. Even if we can't join a call, we can still communicate.
- the sheep, both to help players but also because children enjoyed the "bââââ".
- asynchronous game options. If someone found your memory, you'll be notified when returning to the game. Practical when time zones separate families.

## Decisions made and why

- Memories, clues and guessing: Playtests 1 and 2 showed that players wanted the game to make them talk about themselves or each other. Guessing *what* a memory was turned out to matter more than finding *where* it was.
- Remember, together: William suggested a memory game played as a team (playtest 4): the youngest and oldest have weaker memories, and remembering as a group helps them. Everyone sees the same flash, then chooses a square; winning and losing is collective. No race between homes: choices are locked, then replayed in order so everyone can follow what happened. Older and younger players aren't penalised by a timer.
- Only show a selected area: Showing 6 tiles picked randomly on the grid massively confused players. Showing all 48 pictures at once was overwhelming (playtest 5). A 3×3 patch, clearly signalled, followed by a "Ready?" before showing the images for 6 seconds improved the experience for everyone. the specific timings came after playtesting with the older and younger generations. After some research, an option to reduce the size of the patch to a 2x3 area was made available, since short term memory isn't so much about how long but about how many items one has to remember.
- Gentle: A missed round moves the day towards night; at full night a wolf sends everyone to bed. No score, no elimination, no penalising a player in particular. Unguessed memories wait for next time. Important for younger children.
- Interface: 💡 lets anyone guess early. ⏸️ pauses for everyone. ? lets players revisit the rules.
- Accessible (to some extent):
  - guesses can be spoken -> children don't have to know how to write
  - every player is an animal as well as a colour -> shape and colour, making it somewhat colour-blind or slightly visually-impaired friendly.
  - no timer once someone is ready, rushing the older generation didn't go too well.
  - the squares a sheep leaves show the picture's outline, making it clearer for everyone (my mother struggled to tell the greens apart)
- Music: Background music can enhance player's perception of immersion. A soft, calming music without lyrics doesn't negatively impact memory and makes the experience feel more pleasant for players, but in order not to disrupt a call, volume sliders were added.
- Changes to the base game:
  - The grid is 7 × 7 rather than 11 × 11: easier to see and read, not too difficult, not too easy (playtests and Claude Code simulations).
  - Player circles start in the middle and come back to it after every round, so each round starts fair.

## What I tried and threw away

- Guided hidden targets: my v1 was an asymmetrical, "find the target" game: one player can't see the target, the other players can and can signal "hot" or "cold". Turned out not very engaging with players feeling like they had nothing to do. Moved onto the next game.
- The field: Inspired by Mr Wolf, pick a tile at random and find either nothing, a clue or trigger a trap. Guessing was fun, but every square was the same until turned over, so moving had no purpose, and it was too hard (about 1 win in 5 in simulation). No visual hierarchy.
- Moving at most 3 squares, with the reachable squares highlighted: slow, a bit tedious and visually heavy.
- Flashing 6 random squares, then the whole garden: the first made it seem like the images kept changing position and were impossible to remember, the second was overwhelming.
- Random sky events: really distracting and annoying. Only a rare UFO is left.
- 20-second timer after the first "Ready": hard for older people and young children.
- Showing the picture to find before the flash: simulated, every family won.
- Ideas I had but didn't explore: Pictionary (already done well, and typing excludes young children), cat and mouse at night (a reflex race between homes), photos and voice recordings (a paid plan, and privacy questions about photos of children).

## Where Claude Code helped, and where it got in the way

- **Helped:**
  - Not Claude Code but claude.ai: researching what makes family games work across homes
  - simulating thousands of games to check the difficulty before playtests
  - building fast enough to playtest and iterate rapidly
  - keeping the design doc, playtest notes and todo up to date as we went
  - checking its own changes in a headless browser (load errors, screenshots of the tutorial) before I tried them on multiple devices

- **Got in the way:**
  - It sometimes stated things it hadn't checked: a '?fast' test option that doesn't exist.
  - It couldn't find why the sheep didn't regenerate after each memory was found. The fix was a sturdier design rather than the issue itself.
  - It used a command to close its own test browser that could also close parts of mine.
  - Its first 'git add public' picked up 86 MB of raw sound files. It was caught before the push, so not that big of a deal and actually pretty impressive.

- **How I steered it:**
  - a plan before anything large, and my go-ahead before building
  - small commits after each step
  - everything on a preview channel I tested on a laptop and an iPhone before going live
  - nothing deployed live without asking
  - asked it to explain certain issues and proposed fixes before making decisions
  - asked it to clarify my requests rather than interpreting things on its own

- **What I learned:**
  - I didn't know about /clear: most of the work ran in one long conversation that had to be summarised again and again, meaning most sessions contain the ones before (sorry!)
  - The test link and the live site share one database, so two versions of the game can end up playing the same game.
  

## What I'd do with another day

- **French**, at least: my family is French-speaking, and for many grandparents English alone is a barrier.
- **Players who are blind or heavily visually impaired**: the garden isn't accessible to screen readers today.
- **Exploring the garden possibilities**: like actual plants growing over time, can become messy if not tended to, etc
- **Bigger playtests**: with 4 players and a patch holding 3 of the picture, one person can never be on the right square. Sharing squares, or a "safe" middle square, would fix it.
- **Recognising the author on another device** without accounts, which the brief rules out.
- **QR code** next to the link, for easy sharing.
- **Designed visuals and sounds**
- **More important role for children** (child as expert etc).

**NOTES**

I tried to be mindful of all abilities when building things, including not relying solely on sound or colours to play, but there may be things I didn't notice.

Reference to wolves: Wolves and cats are usually the "hunters" when playing tag in France, and tend to occupy a central place in children's games. This is cultural and I am not sure at that point if it's as common across cultures, but the nightfall is generally universal.


## Games referenced

**Mr. Wolf**

Blue Orange, 2018. Designed by Wilfried and Marie Fort, illustrated by Gaëlle Picard. Cooperative, from age 4, 1 to 4 players. As d'Or, Children's Game of the Year 2019.

Animal tokens are scattered face down in a meadow; some hide the wolf. Each barn roof shows which animals belong inside.
On your turn you flip one token. A wanted animal goes into its barn through a slot; an unwanted one goes to the farmyard. A wolf token moves Mr. Wolf one stone closer, and goes back face down where it was, so everyone has to remember where it is.
You can't look inside the barns, so the group remembers together. The rules explicitly encourage players to help each other recall.
The players win if, when the barns are lifted at the end, each one holds exactly the right animals. The wolf wins if he reaches the end of his path first, or if any barn is wrong.

What I took: flipping hidden tokens, a threat advancing on a track, winning or losing as a team. What I left: the barns and memory sorting, too complicated for this format.

**Le Petit Verger** (HABA)

Cooperative, ages 3 to 8, won or lost as a team.

Roll the die; a flower face means turning over the matching card, a sun means turning over any card.
A cherry card: pick a cherry and put it in the basket. A raven card: the raven moves one square towards the tree. A sleeping animal: nothing happens.
Win by picking all the cherries; lose if the raven reaches the tree.

It belongs to HABA's orchard family (Le Verger, Mon premier verger), which all use the same principle: collect together before the bird arrives.

What I took: cards that turn over to reveal something good, a threat, or a harmless "nothing" (here the sleeping animal; in my game the insect or flower). Even an empty flip shows something.

**Loup, y es-tu ? / Le jeu du loup** (Nathan)

Cooperative, from age 3.

Players draw tokens from a bag. A fruit goes on the picking sheet. A wolf token means putting one more piece of clothing on the wolf (magnetic clothes: underwear, jacket, trousers, umbrella, hat, shoes).
If the wolf is fully dressed before the sheet is full, the wolf wins. Players sing "Promenons-nous dans les bois" while dressing him.
Victory depends on luck, so younger children can beat older ones. This is based on a very traditional XVIIth century game and song, where children dance in a circle around a "wolf" (or dance away while the wolf "hides" somewhere), ask the wolf where he is and what he's doing. The wolf responds with the item of clothing he's putting on, until he's all dressed and ready to eat! Kids flee while the wolf chases them.

What I took: the threat shown as a progressive, playful visual rather than a number. Here the wolf gets dressed; in my game, the sky darkens step by step until full night.

**Dixit**

Libellud, 2008. Designed by Jean-Louis Roubira, illustrated by Marie Cardouat. 3 to 6 players. As d'Or 2009, Spiel des Jahres 2010.

Each turn, a storyteller picks a card and gives a clue without showing it. The others each add a card from their hand that fits the clue. All cards are shuffled and laid out, and players vote for the storyteller's card.
The storyteller scores only if some, but not all, players find the card. A clue that is too obvious or too obscure scores nothing.

Dixit isn't cooperative and has no wolf. It's here for a different reason: it's a family game where the fun is personal interpretation and talking about why. That matches Mathilde's feedback ("it's more interesting to talk about us").

What I took: the idea that the content players bring is the game. In my design, the memories each player writes are what the group searches for. The optional "guess who wrote it" layer comes directly from Dixit's guessing.

Sources
Mr. Wolf: official rules, Blue Orange (PDF) · Ludum
Le Petit Verger: rules, Règles 2 Jeux · Mon premier verger, Ludum
Loup, y es-tu ? / Le jeu du loup: L'Éclaireur Fnac
Dixit: Wikipedia

