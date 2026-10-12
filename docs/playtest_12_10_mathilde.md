**PLAYTEST 5: memory garden (v4)**

Mathilde (with Zoé), 12 October 2026, evening (games from 19:16 to 19:55)

- It's difficult remembering which square has which picture. Are the pictures changing position? It's really difficult.
- The grid is too big, and the pictures should stay in the same spot.
- Found the rules button (❓) and the sheep, but only after Zoé mentioned them: they could be more obvious.
- Being able to pause the game is great.
- "Tea time" at the victory won't be clear for other people. Something like "What a team! Well done! You found 2 memories!" instead.
- Instead of only saying whether a guess was right or wrong, it would be nice to be able to write a note or a short message, to keep that high and reminisce together.
- Likes tapping other players to send hearts, and sending messages.


**Follow-up: do the pictures move?**

Checked in the code and the database, 12 October 2026.

- They don't. The board (which picture is under which square) is shuffled once, when a game starts, and every later change to the game keeps it as it is. Rounds, pause, guessing and events never touch it.
- What changes each round is which 6 of the 48 squares flash. A square seen in one round is rarely flashed again, so the pictures feel as if they moved.
- A new game reshuffles the board: "New game", "Play again", a game left for 2 hours, or a device running a different version of the game. The database shows four games during this playtest (19:16, 19:32, 19:37 and 19:46).


**What we decided**

- An adaptive grid: smaller for fewer players (4×4 or 5×5 for 2, 6×6 for 3...).
- A visual cue towards ❓ for someone new: the button pulsing, or an arrow pointing at it until it's opened.
- A clearer victory screen: "What a team! Well done! You found 2 memories!"
- A note or short message when a guess is judged, kept with the memory.
