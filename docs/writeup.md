# Higlo grid: the memory garden

**Draft, 14 October 2026.** ✏️ marks what only I can fill in or confirm.

Live: https://higlo-grid.web.app · Repository: https://github.com/MajesticLog/higlo-grid · Sessions: `sessions/` · How it works now: `docs/game-design.md` · Playtest notes: `docs/playtest_*.md`

## Who I imagined playing it, and what they're doing together

- My own family, spread between homes: my parents, my sisters and their partners, the children (Olivia, 4, and Joséphine, 11), and friends. ✏️ (who's where)
- They're already on a video call. The game is the table they sit around: it doesn't replace their voices, it gives them something to talk about.
- What they do: each person hides a short memory behind three clues ("🏖️ By the sea", "🍦 Ice cream", "☔ It rained"). Together they remember where pictures hide in a garden, and every picture they find together earns a clue to someone's memory. With three clues, everyone guesses the memory, out loud or typed, and its author says who got it. Then anyone can leave a note ("I'd forgotten the red bicycle!").
- Why they'd come back: the memory chest keeps every memory found, with its clues, answers and notes, game after game. Memories can be left open, so someone in another time zone can drop in alone, find one, and its author sees "🎉 Zoé found your memory!" next time.

## What I added, and why

- **Memories, clues and guessing.** Playtests 1 and 2 (guiding each other to a hidden square): guides had nothing to do, an ordinary square wasn't motivating, and players wanted the game to make them talk about themselves. Guessing *what* a memory is turned out to matter more than finding *where* it is.
- **A garden remembered together.** William suggested a memory game played as a team (playtest 4): the youngest and oldest have weaker memories, and remembering as a group helps them. Everyone sees the same flash, then chooses a square; it's found if half the family are on the picture. No race between homes: choices are locked, then replayed in order so everyone can follow.
- **A golden patch instead of the whole garden.** Showing all 48 pictures at once was overwhelming (playtest 5). A 3 × 3 patch glows, "Ready?" pops up, then its pictures show for 6 seconds. The timings came from playtests with a 4-year-old and grandparents.
- **Gentle failure.** A missed round moves the day towards night; at full night a wolf sends everyone to bed. No score, no elimination, and the game never says who picked wrong. Unguessed memories wait for next time.
- **Small helpers.** One sheep each per memory eats the grass where the picture isn't. 💡 lets anyone guess early. ⏸️ pauses for everyone.
- **Arriving and leaving are felt.** A doorbell and "🐶 Mathilde has joined the game!", a soft "bye-bye" and a waving circle when someone leaves, and "… is getting ready to join" while someone is in the lobby. The first round waits for them.
- **Learning by doing.** Eight cards of rules were too much (playtest 6). Now there are four cards with little looping scenes, and a one-minute tutorial in a practice garden, with "Tap here" where to go next.
- **For every age, from the playtests:**
  - guesses can be spoken
  - every player is an animal as well as a colour
  - no timer once someone is ready
  - a "Smaller patch" (6 pictures instead of 9)
  - the squares a sheep leaves show the picture's outline, because my mother struggled to tell the greens apart
- **Sound that explains.** A twinkle when a round is found, a soft "aww" when it's missed (playtest 7: it made the result clear at a glance). The music and ambience are optional, with sliders, because they compete with voices on the call. ✏️ (what we decided about music)
- **Changes to the base.**
  - The grid is 7 × 7 rather than 11 × 11: small enough to remember, big enough to need moving.
  - Touch and click first, arrow keys and Enter still work: families play on phones, tablets and laptops, and young children and grandparents tap more easily than they use arrow keys.
  - Circles start in the middle and come back to it after every round, so each round starts fair.

## What I tried and threw away

- **Guided hidden targets** (v1): one player guided, the others had nothing to do.
- **The field** (v3): clues hidden under the grass, traps that brought the night, risky walks. Guessing was fun, but every square was the same until turned over, so moving had no purpose, and it was too hard (about 1 win in 5 in simulation).
- **Moving at most 3 squares, with the reachable squares glowing**: slow and visually heavy.
- **Flashing 6 random squares, then the whole garden**: the first made the pictures seem to move, the second was overwhelming.
- **A garden that grows with the family** (5 × 5, then 6 × 6): too easy. Back to 7 × 7.
- **Six sky events** (balloon, birds, rain, owl, shooting star, UFO): distracting. Only a rare UFO is left.
- **A 20-second timer after the first Ready**: calm, but still hard for older people and young children.
- **A big "Find a 🌷!" over the garden**: distracting. A pulsing card in the bar does the job.
- **Showing the picture to find before the flash**: simulated, every family won.
- **Ideas not built**: Pictionary (already done well, and typing excludes young children), cat and mouse at night (a reflex race between homes), photos and voice recordings (a paid plan, and privacy questions about photos of children).

## Where Claude Code helped, and where it got in the way

- **Helped:**
  - researching what makes family games work across homes (`docs/best_practices.md`, `docs/benchmark.md`)
  - simulating thousands of games to check the difficulty before playtests
  - building fast enough to playtest a new version almost every day
  - keeping the design doc, playtest notes and todo up to date as we went
  - checking its own changes in a headless browser (load errors, screenshots of the tutorial) before I tried them on two devices
- **Got in the way:**
  - It sometimes stated things it hadn't checked: a `?fast` test option that doesn't exist.
  - It couldn't find why the sheep didn't come back. The fix was a sturdier design rather than the bug itself.
  - It used a command to close its own test browser that could also close parts of mine.
  - Once, it took "Perfect" as the go-ahead to deploy the database rules.
  - Its first `git add public` picked up 90 MB of raw sound files. It was caught before the push.
- **How I steered it:**
  - a plan before anything large, and my go-ahead before building
  - small commits after each step
  - everything on a preview channel I tested on a laptop and an iPhone before going live
  - nothing deployed live without asking
  - ✏️ (in your own words: what worked, what surprised you)
- **What I learned:**
  - I didn't know about `/clear`: most of the work ran in one long conversation that had to be summarised again and again.
  - The test link and the live site share one database, so two versions of the game can end up playing the same game.
  - ✏️

## What I'd do with another day

- **French**, at least: my family is French-speaking, and for many grandparents English alone is a barrier.
- **Players who can't see the pictures**: the garden isn't accessible to screen readers today.
- **A garden that persists between games**, so the family's garden grows over weeks, not just the chest.
- **Bigger families**: with 4 players and a patch holding 3 of the picture, one person can never be on the right square. Sharing squares, or a "safe" middle square, would fix it.
- **Recognising the author on another device** without accounts, which the brief rules out.
- **Kinder wrong guesses**: show ❌ only to the author.
- **A QR code** next to the link, for grandparents on a tablet.
- **Designed visuals and sounds**, and a playtest to settle whether the music adds anything under a call.
- **A role for the child as the expert** (whoever remembers best leads).
