**INITIAL IDEAS**

Quelques idées en vrac: refaire un Pictionary (simple, efficace, classique); un jardin collaboratif avec mini jeux (où on doit trouver une graine ensemble puis la protéger d'un singe malicieux qui veut la voler, par exemple); à la fin de la session quand on plante la graine chacun peut écrire quelque chose ou ajouter une photo; les autres joueurs ne pourront le voir qu'une fois que la plante atteint son âge adulte, et ce sont ces souvenirs qui décorent le jardin. Marcherait aussi avec une ambiance galaxie étoiles univers, mais peut etre moins fun pour les enfants. 

Collaboratif: pour trouver [objet], joueur P1 se déplace sur la grille à l'aveugle. P2 et P3 voient des zones bleues (froid) ou rouges (tu chauffes!) et doivent guider P1 (et P1 et P3 guident P2, etc).

Compétition légère: un sorte de chat-cache-cache. P1 est le chat et garde [objet ou sortie]. La carte/grille est plongée dans la nuit. P2 et P3 se déplacent de X cases par tour pour se cacher de buisson en buisson, mais s'ils bougent trop (de 2 cases ou plus) ils font du bruit qui indique sur la carte où est le loup (le chat). Le chat a un faisceau de lampe de poche qu'il peut diriger et voir les autres joueurs s'ils ne sont pas cachés par genre un buisson ou autre.

**TRANSLATION**

Some ideas:

Redo a Pictionary (simple, effective, classic); a collaborative garden with mini-games (where players have to find a seed together and then protect it from a funny monkey trying to steal it, for example). At the end of the session, when planting the seed, everyone can write something or add a photo; other players will only be able to see it once the plant reaches adulthood, and these memories end up decorating the garden. This would also work with a galaxy/stars/universe theme, though perhaps less fun for kids.

Collaborative: To find [an object], player P1 moves blindly around the grid. P2 and P3 see blue zones (cold) or red zones (getting warmer!) and have to guide P1 (then P1 and P3 guide P2, and so on).

Light competition: A sort of tag / hide-and-seek. P1 is the tagger ("the cat") guarding [an object or an exit]. The map/grid is plunged into darkness. P2 and P3 move X squares per turn to hide from bush to bush, but if they move too much (2 squares or more), they make noise that reveals their location to the seeker ("the wolf/cat"). The seeker has a flashlight beam they can aim to spot other players unless they are hidden behind something like a bush.

**THOUGHTS**

Pictionary has been done and redone, no point. Garden with mini games is gimmicky. Hide-and-seek could be fun but can be frustrating with roles etc.
Finding memories or anything that helps build a connection should be kept albeit reworked. it's what makes people come back and want to play.
Testing: asymmetrical game where players guide each other.

**AFTER PLAYTEST 1**

Date: Sunday 11 October 2026, 12:14–12:30 (London) Tool: Claude (claude.ai chat with agentic tools), not Claude Code Model: Claude Opus 5.5

About this file. This is not a system export. The claude.ai chat has no /export command, so Claude wrote this transcript at my request. The conversation was in French; this is an English translation. My prompts are translated faithfully. Claude's replies are its final messages, translated faithfully. Tool calls are summarised in brackets. Earlier in the same chat (not included here), Claude had looked up the rules of Mr. Wolf after my sister Mathilde mentioned a cooperative family game with a wolf; those rules are summarised in the references at the end, along with three other family games that shaped the design.

Output of this session: docs/game-design.md.

1. Flipping squares, and a lobby
Me

Let's set aside the idea of finding squares by being guided by the other players.

A few ideas: you click the link, you arrive in the lobby, you make a drawing or write a message that will be hidden under one of the squares.

Claude

The direction is good. It answers Mathilde's three main points directly: you have something to do as soon as you arrive, what you find is personal, and the conversation is about you. Mr. Wolf's principle brings tension without a stopwatch.

Here's how I'd put it together, then the questions to settle before coding.

The proposed loop

The lobby. On opening the link, each person writes a message or makes a small drawing, with a suggestion to help ("a memory with someone here", "something the others don't know about you"). This is the immediate action that was missing.
Hiding. Each contribution is hidden under a random square. "Wolf" squares are hidden too.
The game. You bring your circle to a square to turn it over. Keeping movement gives the grid a purpose: the others see where you're heading and can react ("not there, we've done that one!").
A memory: it appears for everyone, and people talk.
An empty square: nothing, but it stays marked as turned over.
A wolf: it moves one step along its path.
The end. You win if every memory is found before the wolf arrives.
The trace. Found memories stay displayed on their square. The grid becomes the recap board Mathilde asked for.

Questions to settle

1. What happens when the wolf arrives? This is the most important one. Memories mustn't be lost: that would punish people for sharing something. I suggest that whatever the wolf kept from being found stays hidden for next time. Losing becomes a reason to come back, and it adds the light asynchrony Mathilde mentioned.

2. Taking turns, or everyone at once?

Simultaneous play is chaotic, and latency matters between two homes.
Strict turns mean waiting, which is exactly what bored Mathilde.
A middle ground: rounds. Everyone turns over one square, in any order. When everyone has done so, a new round starts. Waiting stays short, and everyone always has a decision to make.

3. Density. On 121 squares, three players with one message each means three memories lost in an almost empty grid. People would mostly turn over empty squares, which is dull. You need one of:

a smaller grid for this game;
several contributions per person;
or empty squares that give a hint, for example glowing more or less depending on how close a memory is. That's the Minesweeper principle, with wolves instead of mines. Turning over an empty square is then no longer wasted, and the group works out together where to look.

4. Guess who wrote what? An optional but cheap layer: when a memory appears, its author isn't shown, and the group guesses aloud before the reveal. That's the light competition that makes people laugh, with no loser.

Technical side

Text is no problem in the Realtime Database.
Drawing is doable without the Blaze plan: a small canvas (around 256 × 256 pixels), saved as a compressed image directly in the database. But it's a separate piece of work. I'd do text first and drawing later, if there's time.
A limit to be aware of: as with the targets, hidden content goes through the database, so a curious player could read it in the browser's developer tools. For a family, that's acceptable.

Build order

The lobby and the text message, hidden under a square.
Turning a square over and revealing the memory to everyone.
The wolf, its squares and its path.
Rounds.
Keeping the board from one session to the next.
If time allows: drawing, and guessing the author.

Remember to note in docs/ideas.md that guiding towards a target is set aside, and why: the test showed the guides had nothing to do, and an ordinary square wasn't motivating. That's exactly the kind of abandoned idea Higlo wants to read about.

Shall I draft the message for Claude Code once these four points are settled?

2. Grass, simultaneous rounds and sheep
Me

OK, let's say: the squares are covered in grass. Round 1: all players position themselves on a square before a timer runs out (without serious consequences), then once positions are confirmed the squares turn over: empty squares sometimes show an insect, or a flower. Trap squares bring the [wolf, cat, UFO, something that symbolises defeat].

Each player has one (or two) bonus sheep, which they can use to clear a group of 3 adjacent squares containing only empty squares (no opening the wolf or the memory, then). That clears 9 to 18 squares, with a funny animation of a sheep moving.

Claude

This is becoming a real game. The simultaneous placement phase solves the waiting problem: everyone acts at the same time, then everything is revealed at once, which makes a shared moment, and latency no longer matters since positions are locked before the reveal. Insects and flowers under empty squares mean no flip is wasted, and the garden blooms as the game goes on: your original idea comes back on its own.

Four points to clarify before coding.

1. How do the sheep work? The rule can be read two ways, and they make two different games:

(a) The game itself picks a group of 3 safe squares, and the sheep eats them. Pure help, no decision.
(b) The player picks 3 squares in a line. The sheep eats the grass on empty squares, but refuses to touch a square hiding something, without turning it over.

I'd recommend (b). It gives the player a decision and it provides information: if the sheep stops in front of a square, there's a wolf or a memory underneath. The group discusses it, which fills the game's one gap: without hints, turning over a square is pure chance. That's fine for a 6-year-old, but quickly flat for adults. The sheep's refusal adds deduction without adding rules.

2. The timer.

Make the round end as soon as everyone has confirmed. The timer only avoids waiting for someone who has stepped away.
Make it generous, around 30 seconds, for slower fingers.
If someone hasn't confirmed when it ends, their current square is turned over. That's the "without serious consequences".
Moving one square at a time is a problem: crossing the grid takes ten taps within the time limit. I'd limit movement to 3 squares around your position per round, with a direct tap on the target square. Position then matters from one round to the next, and nobody has to tap frantically.

3. Two players on the same square? I'd allow it: "let's go together" is a nice moment. It just means one square turned over instead of two.

4. Balance. On 121 squares, the game risks being too long. A rough estimate for 3 players: 3 flips per round, and about 12 wolf squares (10% of the grid). With a path of 5 steps, the wolf arrives in 15 to 20 rounds, i.e. 7 to 10 minutes. By then the group will have turned over 50 to 60 squares, plus 9 to 18 with the sheep. With 6 memories, about half will be found, and the rest will wait for next time. That seems a good pace for a short game, but these numbers need tuning by playing. Ask Claude Code to gather them in a single settings file.

The symbol of defeat: the wolf goes well with the sheep, it's coherent, and Mr. Wolf shows it doesn't scare 4-year-olds. A gentler variant in the spirit of the garden: night falling, the sky darkening with each trap square. Your call, depending on the identity you want.

What happens when the wolf wins still needs confirming: I'm keeping my suggestion, that unfound memories stay hidden for next time.

If you approve these choices (sheep version b, rounds ending early, a range of 3 squares, shared squares allowed, and wolf or night), I'll draft the message for Claude Code, split into steps.

3. Four sheep, and nightfall
Me

If we say 4 bonus sheep per player (option b, they choose the 3 squares to clear), and the wolf comes out at nightfall, so we have the visual of the sky changing + the wolf and everyone runs away (but the unfound hidden memories remain), does that seem good?

Claude

Yes, that holds together. Nightfall is a better gauge than a number: everyone, including a child who can't read, sees at a glance how much time is left. And everyone running away together is a gentle defeat: nobody gets eaten, nobody is eliminated, and the memories wait for next time.

One adjustment on the sheep, and two details.

1. Four sheep per player is a lot, unless using them has a cost. With three players that's 12 sheep, so up to 36 squares cleared safely. With version (b), each sheep that refuses a square also reveals where something is hidden. If sheep come on top of flips, the group will have cleared a third of the grid in the first rounds, and the wolf will no longer be a threat. I suggest: each round, you choose between turning over your square or sending a sheep. The choice becomes strategic (do I take a risk, or move carefully?) and the group discusses it. Keep 4 sheep as the starting value in the settings file, and adjust after a test game.

2. Don't single anyone out. When a trap square darkens the sky, don't show who turned it over. With the simultaneous reveal, that's easy: all squares turn over together, and the sky darkens for the group. That's the Overcooked lesson: individual blame under pressure creates arguments.

3. Plan the win as much as the loss. If every memory is found before full night, you need a matching moment, for example the sun rising, or fireflies. In both cases, the end screen shows the garden as it has become, with the flowers, insects and found memories. That's Mathilde's recap board.

If you agree with "turn over or send a sheep", I'll draft the message for Claude Code, split into steps.

4. Decisions, and the design document
Me
Yes, you either turn over a square or use a sheep. Let's say 3 bonus sheep for each little shepherd-player.
Good point, everything is collective.
If we win: fireflies, victory (little trumpet sound), off to the end screen around a cup of herbal tea, with an option to look back at the memories found during a game session. If we lose: the wolf comes, "let's go to bed!", options "back to main screen" and "play again", with a note that the memories aren't lost but will be reshuffled.
Claude

[Wrote docs/game-design.md: the agreed design, starting values in a single table, open questions, and the ideas set aside with reasons.] game-design.md re-read and amended manually to make sure the human touch and small details get passed on to Claude Code.

**GAME REFERENCES**

Four cooperative or family games informed this design. The first three share the mechanic I kept: the group turns things over one at a time, and a threat advances on a track each time a bad one comes up. The threat moves with the turns, not a clock, so there's tension without time pressure, and latency between homes doesn't matter.

These are either games I play with my family (intergenerational, at the dinner table before bed) or recommended by friends and family.

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


**NOTES**

I tried to be mindful of all abilities when building things, including not relying solely on sound or colours to play, but there may be things I didn't notice.

Reference to wolves: Wolves and cats are usually the "hunters" when playing tag in France, and tend to occupy a central place in kid's games. This is cultural and I am not sure at that point if it's as common across cultures, but the nightfall is generally universal.
