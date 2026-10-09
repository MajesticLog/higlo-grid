# Functional benchmark: family multiplayer at a distance

9 October 2026 · Zoé

## Scope and method

Twenty-seven products and research prototypes, chosen because each shares at least one function with the Higlo brief: a shared space several people occupy at once, join-by-link, remote family play, or a reason to come back.

- **Sources:** developer interviews and talks, studies, usage data reported in the press, and reviews. Commercial "what didn't work" is often inferred by journalists from usage curves; where that is the case it is marked as such.
- **Not covered:** large online worlds aimed at children alone (Roblox, Minecraft). Their moderation and complexity problems are a different scale from a private family link.
- **How to read it:** the table gives the scan view. Each category section then gives the evidence and a one-line take-away for the build. Pitfalls and gaps are consolidated at the end.
- Companion document: the research-based principles are in best_practices.md; this benchmark does not repeat them.

## Summary: what to reuse, what to avoid

The wheel already exists for joining (link or QR code, in a browser, no account) and for why people stay (a shared activity, not a conversation). What nobody has built well is a light, persistent shared space that a family reopens without an occasion.

**Reuse**

1. **Join by link, no install, no account.** Jackbox, Gartic Phone, skribbl.io, the .io games and Netflix Game Night all succeed on this. The Higlo base already does it; keep it that way.
2. **An activity beside the call, not a call with an activity.** Every product that gave families something to do together during a call reported longer sessions than plain video.
3. **Communication through the world, not through text.** Journey's chirp and Sky's hand-holding create connection with no reading required; the family's own call app carries speech.
4. **Asymmetric information makes people talk.** Keep Talking and Nobody Explodes is built on one player seeing what the other cannot.
5. **A reveal and a keepsake.** Gartic Phone's end-of-round reveal, Wordle's shareable grid, r/place's final canvas.
6. **Toy-like creation on a grid.** Townscaper turns simple placement into something good-looking, so nobody's contribution looks clumsy.

**Avoid**

1. **Time-pressured co-op.** Overcooked is notorious for arguments, including between siblings.
2. **Novelty with nothing underneath.** Draw Something and Houseparty both lost most of their audience within months.
3. **A dedicated device or app.** Facebook Portal was discontinued; app-only products shut out whoever does not install them.
4. **Unprotected shared canvases.** r/place shows that anything one person makes, another can overwrite.
5. **Replicating a room.** Gather's proximity video suits events; it adds the awkwardness of deciding whether to walk up to a conversation.

## Benchmark table

One row per product, grouped by category. "Keep" and "Avoid" are what the evidence suggests for this build, not general verdicts.

| Product | Category | How people join | What they do together | Keep | Avoid |
| --- | --- | --- | --- | --- | --- |
| Gather | Shared space | Browser link, avatar picker | Walk a 2D map; video opens by proximity | Browser-only, arrow keys or click-to-move | Hesitation at the edge of a conversation |
| r/place | Shared space | Reddit account | Place one pixel per cooldown on a shared canvas | Cooldown makes coordination necessary | Overwriting others' work |
| Townscaper | Creative toy (solo) | Purchase, install | Place blocks; an algorithm shapes them into houses | No goals, no fail, flattering results | Nothing to do together |
| Jackbox | Link-join party | Browser + room code | Party games on one shared screen | Phone as controller, audience mode | Needs one shared screen |
| Gartic Phone | Link-join party | Browser link, no account | Draw–guess chains, revealed at the end | No winner, end reveal | Timers that rush slow players |
| skribbl.io | Link-join party | Browser link | Draw while others guess | Instant start | Speed-based scoring |
| Agar.io and .io games | Link-join arena | Open the URL | Free-for-all arena | Zero friction | Elimination |
| Netflix Game Night | Link-join party | QR code from the TV | Party games, phones as controllers | QR join | Co-located only |
| Houseparty | Games in calls | App install | Video rooms with built-in games | Games give calls a purpose | Pandemic-only habit |
| Messenger games | Games in calls | Inside a Messenger call | Casual games during video | No install | Video shrunk to a strip |
| SharePlay (Kahoot!) | Games in calls | Inside a FaceTime call | Quiz in sync over the call | Everyone on the call enters automatically | Apple-only |
| Caribu | Family video app | App + subscription | Read, draw, play during a video call | Shared book or page | App and paywall |
| Facebook Portal | Family device | Dedicated hardware | Video calls, AR Story Time | Story Time for young kids | Device dependency |
| Journey | Wordless co-op | Console, matched stranger | Travel together, chirp to communicate | No chat, no names, no lobby | Strangers only |
| Sky | Wordless co-op | App | Hold hands, guide, gift candles | Physical gestures as connection | Monetised friendship |
| Keep Talking and Nobody Explodes | Asymmetric co-op | One screen + a manual | One sees the bomb, the others read the manual | Split information forces talk | Fail-state time pressure |
| Overcooked | Pressured co-op | Console | Cook orders against the clock | Shared goal | Blame under time pressure |
| Wordle | Async ritual | Open the page daily | One puzzle a day, share the grid | Daily cadence, spoiler-free share | Solo at its core |
| Draw Something | Async turns | App + account | Trade drawings turn by turn | Reached older and younger players | Content went stale fast |
| Animal Crossing: New Horizons | Persistent world | Console | Visit islands, build, gift | Persistent shared space | Hardware, cost |
| Kind Words | Async letters | Purchase | Anonymous supportive letters | Structured, short exchanges | Strangers only |
| Family Story Play | Research | Prototype device | Grandparent reads a paper book with child over video | Activity over conversation | Hardware |
| StoryVisit | Research | Web + video | Shared e-book over video | 5x longer sessions | Reading-only |
| ShareTable | Research | Prototype table | Video + shared tabletop | Child-initiated calls | Hardware |
| WaaZam | Research | Prototype | Families composited into one video scene | Shared video space | Setup cost |
| Age Invaders | Research | Floor rig + remote client | Grandparents and children on a floor; parents join remotely | Handicaps balance ages | Hardware |
| Pais et al. testbed | Research | Mobile | Asymmetric, asynchronous family game | Roles by time and expertise | Small sample |

## Shared spaces and grids

The closest analogues to the Higlo base already exist, and they show that a shared grid needs a reason to be there and a rule that protects what people make.

**[Gather](https://arxiv.org/pdf/2105.08795)** is almost the Higlo base with video added: avatars on a 2D tile map in the browser, moved with arrow keys or by [double-clicking a destination](https://www.uibk.ac.at/credence-goods/events/eaye2021/eaye2021_userguide.pdf), with audio and video opening when avatars come close.

- Worked: no install; a conference organiser reported only positive feedback and that the informal social room was the most used space. Its founders deliberately chose [keyboard, mouse and low-resolution pixel art in a browser](https://www.forbesargentina.com/innovacion/mas-alla-meta-metaverso-baja-resolucion-revoluciona-silicon-valley-n12904/amp) to build quickly on familiar technology.
- Didn't: hosts of a virtual pub [saw avatars circling a conversation](https://jiri-necas.medium.com/how-we-created-an-extraordinary-virtual-event-using-gather-town-99a426eb1bfc), unsure whether to join. Making large rooms to absorb overflow did not raise engagement and added lag. The company's centre of gravity moved to virtual offices.
- Take-away: movement on a grid alone is not an activity. Click-to-move matters as much as arrow keys.

**[r/place](https://www.digitalamerica.org/?p=5720)** gave every Reddit user one pixel on a shared canvas every few minutes, for about three days.

- Worked: the cooldown meant nobody could make anything alone, so people coordinated. A study of all three editions found [more cooperation in response to competition](https://arxiv.org/html/2408.13236v2). The canvas was wiped at the end, with a saved record of the result.
- Didn't: creation and destruction ran side by side; a streamer [directing viewers to overwrite others' work](https://www.vice.com/en/article/twitch-influencers-ruined-rplace-for-everyone/) caused anger. Coordination moved to Discord because the platform could not support it.
- Take-away: a cooldown or a turn rhythm creates cooperation. In a family, griefing is less likely to be malicious, but a child painting over a grandparent's work will still hurt. Give each person something that is theirs.

**[Townscaper](https://www.gog.com/en/game/townscaper)** is a single-player toy: pick a colour, place a block on an irregular grid, and an algorithm turns the blocks into houses, arches and gardens.

- Worked: [no score, no timer, no goals](https://www.gog.com/en/game/townscaper); building is [stress-free by design](https://destructoid.com/?p=258363). Any placement looks good, so a novice's town is as pleasing as an expert's.
- Didn't: no shared mode, and some players find the lack of goals empty.
- Take-away: the procedural "make anything look good" layer is the strongest available answer to older players' fear of looking clumsy. It has not been made multiplayer.

## Link-join party games

Joining is a solved problem: open a link or scan a code in a browser, type a name, play. The weak points are elsewhere, in timers and in scoring by speed.

**[Jackbox](https://kotaku.com/the-jackbox-party-games-are-some-of-the-best-games-of-t-1840661742)** runs on one shared screen; players join from any phone's browser with a room code.

- Worked: no app, no controllers. A reviewer reports almost never having to help anyone join, older people included. [Spectators can join as an audience](https://www.nintendo.com/au/games/nintendo-switch/the-jackbox-party-pack-2/) and still affect some games.
- Didn't: designed for one room around one screen; remote play needs someone to stream the screen.
- Take-away: an audience or spectator role gives the reluctant or the very young a way in without the pressure of playing.

**[Gartic Phone](https://www.liverpool.ac.uk/researcher/postdoc-appreciation-week/npdc/engagement/pre-conference/gartic-telephone/)** chains drawing and guessing like the children's game of telephone; at the end everyone compares the first phrase with the last drawing. **skribbl.io** is classic draw-and-guess.

- Worked: no account; the reveal at the end is the payoff, not a score. Drawing removes the gap between people who play games and people who don't, and bad drawings are funny.
- Didn't: a timer and a ringing phone push players to finish; forum players complain the time to describe an image is too short. The Liverpool guide warns that going to the home page instead of the private link drops you into a public room with strangers.
- Take-away: keep the reveal, drop or soften the timer, and make sure a shared link can never land a child in a public room.

**[Agar.io](https://en.wikipedia.org/wiki/Agar.io)** started the .io genre: open the URL, play instantly in a shared arena. Commentators attribute its success to being a free browser game with simple, intuitive mechanics.

- Didn't (for this audience): the core loop is eliminating other players.
- Take-away: the friction model is right; the competitive model is wrong for families.

**[Netflix Game Night](https://www.netflix.com/tudum/articles/new-netflix-games-play-on-tv-2025)** (launched late 2025) puts party games such as Pictionary on the TV, with phones joining by [QR code](https://www.thurrott.com/?p=329581).

- Worked: a large platform betting that joining should be as easy as watching.
- Didn't: co-located only; Pictionary keeps the race against the clock.
- Take-away: a QR code on the host screen is now a familiar way to join, worth adding next to the copyable link.

## Games inside video calls

The big platforms have all tried putting games inside calls; the products that lasted rode on a call people already make, and the ones that died depended on a reason to call that went away.

**[Houseparty](https://app.appfigures.com/resources/insights/20211008?f=3)** offered drop-in video rooms with built-in games (Heads Up, trivia, Quick Draw).

- Worked: games gave calls a purpose; it was briefly among the most popular social apps.
- Didn't: downloads had already halved between 2018 and 2019, spiked during lockdown, then fell back below pre-pandemic levels. Epic, which had bought it, [shut it down in October 2021](https://gameworldobserver.com/?p=11657).
- Take-away: a novelty that fills an empty evening does not create a habit. Something must carry over from one session to the next.

**[Messenger games](https://techcrunch.com/2023/04/06/messenger-adds-multiplayer-games-you-can-play-during-video-calls)** (2023) and **[SharePlay with Kahoot!](https://kahoot.com/press/2021/10/27/facetime-kahoot-shareplay-ios/)** (2021) put games inside existing calls.

- Worked: no install for Messenger; with SharePlay everyone on the FaceTime call enters the game automatically.
- Didn't: in Messenger the game takes most of the screen and the faces [shrink to a strip](https://www.sammobile.com/news/facebook-messenger-games-video-calls/). Each is locked to one ecosystem, which families rarely share.
- Take-away: when faces and game compete for one small screen, faces lose. A separate tab or device for the game, next to the family's usual call, avoids the trade-off.

**[Caribu](https://www.commonsensemedia.org/app-reviews/caribu-family-video-calls)** is the most direct commercial equivalent: a video-call app with a shared library of books, colouring and simple games for children and remote adults.

- Worked: shared books and drawing during calls; [tic-tac-toe with grandparents](https://www.romper.com/p/the-caribu-video-calling-app-lets-kids-play-virtual-games-read-with-family-22767309) was one family's favourite. Only one account needs a subscription.
- Didn't: app-only and subscription-based; content is selected for ages 0–12, which leaves teenagers out by design; the adults' role is mostly reading and helping.
- Take-away: confirms the activity-in-call model, and leaves the "adults have fun too" space open.

**[Facebook Portal](https://www.buzzfeednews.com/article/katienotopoulos/facebook-portal-rip-amazon)** was a dedicated video-calling device with AR Story Time for children.

- Worked: reviewers liked it; it sold to grandparents during lockdowns.
- Didn't: [privacy distrust from launch](https://www.techspot.com/community/topics/meta-is-killing-off-its-portal-video-calling-devices-for-consumers.275691/), and sales slowed once grandparents could see grandchildren again. The consumer line was discontinued in 2022.
- Take-away: anything that requires buying or installing something for grandparents is a barrier. A web link is the right medium.

## Wordless and gentle co-op

thatgamecompany showed twice that people feel close without any text at all, if the game gives them a few expressive actions and makes the other player the focus.

**[Journey](https://www.mcvuk.com/jenova-chen-reveals-secrets-of-journey-design/)** pairs two anonymous players in a desert; the only communication is a chirp.

- Worked: Jenova Chen removed the interface, visible names, the lobby and verbal communication, and gave players no weapons. He describes how, once the players had no power over each other, the other player became the focus.
- Didn't: Chen acknowledged it might cost the game the chance to spread virally. It was also designed for strangers, not for people who already know each other.
- Take-away: a small set of expressive gestures (a sound, a glow, a wave) can carry a lot. For a family that already talks over a call, they add play rather than replace speech.

**[Sky: Children of the Light](https://sg.news.yahoo.com/add-friend-sky-children-light-181503480.html)** extends Journey into a social online world.

- Worked: holding hands lets an experienced player lead a newer one, and groups chain together this way. Text chat is off by default and opens on [special benches for the time a candle burns](https://voices.uchicago.edu/202003sosc20224/2020/07/09/communication-and-relationships-in-sky-children-of-the-light), so each person chooses how open to be.
- Didn't: friendship abilities are unlocked with candles, which can be bought with real money.
- Take-away: "hold hands and I'll guide you" is a direct, wordless model for a grandparent and a grandchild on the same grid, and for the child-as-expert role.

## Asymmetric and pressured co-op

Splitting information between players reliably makes them talk; adding a hard clock on top turns that talk into blame, which is the wrong trade for a family.

**[Keep Talking and Nobody Explodes](https://gdcvault.com/play/1023113/Designing-Asymmetric-Gameplay-For-Keep)**: one player sees a bomb but not the instructions; the others hold the manual but cannot see the bomb.

- Worked: its designer describes it as a game about communication between players, tuned to produce tension, mistakes and laughter. Started at a game jam as a VR experiment, it was praised for [including everyone in the room](https://archive.vrroom.studio/?p=30136) when only one person had the headset. Because the exchange is spoken, the structure transfers to a call between homes.
- Didn't: the bomb timer and the limit on mistakes make it tense; the GDC talk itself discusses balancing approachability against challenge.
- Take-away: split information is a cheap, strong mechanic for this brief. Keep the asymmetry and remove the fail state.

**[Overcooked](https://automaton-media.com/en/news/overcooked-japanese-celebrities-fear-reveals-former-akb48-member/)**: up to four players cook orders against a clock.

- Worked: shared goal, simple actions, plenty of laughter when it goes wrong.
- Didn't: famous for arguments between couples and friends; a student reviewer who [played it with an 11-year-old sister](https://www.yorkvision.co.uk/?p=112556) describes it as anything but bonding. Review aggregators list stress and blaming teammates as the main complaints, and an assist mode exists for this reason.
- Take-away: interdependence plus time pressure produces blame. For a family across homes, where latency adds to the pressure, leave the clock out.

## Asynchronous rituals and traces

What brings people back is a small, regular thing that leaves a trace; what makes them leave is content that runs out.

**[Wordle](https://www.thehinsdalean.com/story/2024/02/08/opinion/wordle-together-stay-together/7440.html)**: one puzzle a day, shared as a spoiler-free grid of coloured squares.

- Worked: one columnist describes two family group chats built around it across time zones, and calls it what keeps her anchored to relatives who live far away.
- Didn't: the play is solo; the togetherness happens entirely outside the game.
- Take-away: one small thing a day (or a week), and an artefact designed to be shared, can sustain a family ritual on their own.

**[Draw Something](https://www.buzzfeednews.com/article/justinesharrock/life-after-zynga-riding-the-draw-something-meme)**: Pictionary by turns, between friends.

- Worked: reached people outside the usual gaming audience; its creator said half its players were not on Facebook because the game had spread to many older and younger users.
- Didn't: daily users [fell from a 14.6 million peak by 3 million within a month](https://gamesbeat.com/draw-something-loses-3-million-players/); the studio was closed about fourteen months after its acquisition, with players described as [bored](https://www.cultofmac.com/?p=229877).
- Take-away: a simple loop reaches every generation, but the same loop repeated wears out. The returning reason has to grow, not repeat.

**[Animal Crossing: New Horizons](https://homes.cs.washington.edu/~jessejm/data/MartinezCSCWAnimalCrossing2022.pdf)**: a persistent island players visit and decorate.

- Worked: a CSCW study of 27 families recommends persistent shared spaces, flexible in-game progress and social life simulation. A companion study found families using it to [cope together](https://pmc.ncbi.nlm.nih.gov/articles/PMC9209879), with shared ownership of a collective problem.
- Didn't: needs a console per household.
- Take-away: the strongest commercial proof for a persistent shared place that changes slowly.

**[Kind Words](https://unwinnable.com/2019/10/10/clacking-out-a-few-kind-words/)**: anonymous, supportive letters between strangers.

- Worked: at launch, thousands of players sent tens of thousands of letters and the developers banned only a few dozen. One deliberate choice: [letters to individuals are private and cannot be replied to](https://steamcommunity.com/app/1070710/discussions/0/1640919103669125275), which the developers say reduces bad behaviour.
- Take-away: structured, short exchanges (a card, a sticker, a note) are easier to make kind than open chat. Useful for leaving a message for someone who is not online.

## Research prototypes

Research labs have built most of the ideas in the Higlo brief already, usually on custom hardware; the web now makes the same ideas possible with a link. Detail on each is in best_practices.md.

| Prototype | What it does | Result | What it means here |
| --- | --- | --- | --- |
| [Family Story Play](https://mijn.bsl.nl/doi/10.1145/1753326.1753563) (Nokia, Sesame Workshop, 2010) | Grandparent and child read the same paper book over video; Elmo prompts | More child engagement, better interaction quality | The activity carries the call |
| [StoryVisit](https://research.google/pubs/pub37241/) (2011, 61 families) | Shared e-book plus video | Sessions about 5 times longer than typical family video chat; an animated character added 50% more | A third character in the activity extends sessions |
| [ShareTable](https://repository.gatech.edu/entities/publication/dfd26484-dee5-436c-b551-d0d6dfb32914) (Georgia Tech) | Video plus a shared tabletop between two homes | Communication more than doubled; more calls started by the child | Make it easy for the child to open the link |
| [WaaZam](https://ink.library.smu.edu.sg/sis_research/7923) (CHI 2014) | Families composited into one video scene they can customise | Shared space increased engagement over side-by-side windows | One shared space beats split screens |
| [Age Invaders](https://unpaywall.org/10.1007%2FS10055-008-0083-0) (2007–2009) | Grandparents and children on an LED floor; parents join remotely online | Game properties adjust automatically to offset slower reactions | Handicaps can be built into the rules, invisibly |
| [Pais et al.](https://dl.acm.org/doi/abs/10.1145/3637392) (CSCW 2024) | Asymmetric, asynchronous family game on mobile | Interdependent progress became conversation in daily family life | Roles can differ in time as well as in skill |

Age Invaders is also an early precedent for a mixed setup: some family members physically together, others remote, each with a different interface. [The parents could introduce new elements into the game from afar](https://aese.psu.edu/outreach/intergenerational/articles/intergenerational-contact-zones/virtual-environments-online-gaming).

## Known pitfalls

Eight failure patterns recur across the benchmark; each has a known mitigation.

| Pitfall | Seen in | What happens | Mitigation |
| --- | --- | --- | --- |
| Clock pressure on a shared task | Overcooked, Keep Talking, Pictionary, Gartic Phone | Blame, rushed slow players, arguments | No timer, or a soft one that never fails the group |
| Speed decides the winner | skribbl.io, .io games, Pictionary | Older players and young children always lose; across homes, latency decides | Turn-based or simultaneous-but-not-racing actions |
| Novelty with no carry-over | Houseparty, Draw Something | Fast rise, fast fall | Something persists and grows between sessions |
| Install, account or device required | Portal, Caribu, Animal Crossing, SharePlay | The least technical person never joins | Browser link and QR code; name optional |
| Others can erase your work | r/place | Anger, defensive behaviour | Each person owns something; shared areas change slowly |
| Faces and game fight for one screen | Messenger games | Faces shrink to a strip | Leave video to the family's call; the game in its own tab or device |
| Replicating a physical room | Gather | Hesitation at the edge of groups | Give the space a shared object or task, not just positions |
| Shared link reaches strangers | Gartic Phone public rooms | A child lands in a public room | Private rooms only; no public lobby |

## Gaps no one has filled

These are my reading of the benchmark, not findings from a source. Each is a space where the Higlo build would not be reinventing anything.

1. **A persistent family place on the web.** Animal Crossing has the persistence but needs a console per home; Wordle has the ritual but is solo; Gather is built for events and offices.
2. **Townscaper-style flattering creation, multiplayer.** The "anything you place looks good" layer exists only as a solo toy.
3. **Wordless gestures between people who already know each other.** Journey and Sky designed them for strangers. Between relatives on a call, they would add play on top of speech rather than replace it.
4. **One activity that holds a 6-year-old, a teenager and a grandparent at once.** Caribu stops at 12; party games aim at adults and teenagers; research prototypes mostly study grandparent–young child pairs.
5. **The child as expert.** Sky's hand-holding comes closest. No family product found makes the child the one who guides by design.

## Implications for the Higlo build

With four and a half days to the deadline, the benchmark argues for a small number of proven mechanics combined in a way nobody has shipped, rather than a new mechanic.

**Take as-is (already proven)**

- Link join with a QR code beside it, private rooms only, name optional (Jackbox, Gartic Phone, Netflix).
- Tap or click a square to move, not only arrow keys (Gather offers both).
- No video in the game; it runs next to the family's own call (Messenger's shrunken faces).
- An end-of-session reveal or keepsake that can be shared (Gartic Phone, Wordle).

**Adapt (proven elsewhere, new in this combination)**

- Townscaper-style placement on the shared grid, so every contribution looks good.
- A handful of wordless gestures, Journey-style, and a Sky-style "take my hand" that lets one circle lead another.
- A cooldown or turn rhythm that makes coordination necessary (r/place), without competition for space.
- Something on the grid that persists and grows between sessions (Animal Crossing, Pais et al.).

**Do not build**

- Timers that fail the group, reaction races, elimination.
- Built-in video, accounts, or anything that needs an install.
- A public lobby or matchmaking.

A likely trap: picking all of the "Adapt" items. The brief rewards a few ideas done with care, and the write-up can list what was considered and left out, with these sources as the reason.

## Sources

- Gather: [Cool Stars 20.5 lessons](https://arxiv.org/pdf/2105.08795) · [user guide](https://www.uibk.ac.at/credence-goods/events/eaye2021/eaye2021_userguide.pdf) · [Forbes Argentina profile](https://www.forbesargentina.com/innovacion/mas-alla-meta-metaverso-baja-resolucion-revoluciona-silicon-valley-n12904/amp) · [virtual pub write-up](https://jiri-necas.medium.com/how-we-created-an-extraordinary-virtual-event-using-gather-town-99a426eb1bfc)
- r/place: [Digital America](https://www.digitalamerica.org/?p=5720) · [three-iteration study](https://arxiv.org/html/2408.13236v2) · [Vice/Motherboard](https://www.vice.com/en/article/twitch-influencers-ruined-rplace-for-everyone/)
- Townscaper: [GOG page](https://www.gog.com/en/game/townscaper) · [Destructoid](https://destructoid.com/?p=258363)
- Jackbox: [Kotaku](https://kotaku.com/the-jackbox-party-games-are-some-of-the-best-games-of-t-1840661742) · [Nintendo eShop listing](https://www.nintendo.com/au/games/nintendo-switch/the-jackbox-party-pack-2/)
- Gartic Phone: [University of Liverpool guide](https://www.liverpool.ac.uk/researcher/postdoc-appreciation-week/npdc/engagement/pre-conference/gartic-telephone/)
- Agar.io: [Wikipedia](https://en.wikipedia.org/wiki/Agar.io)
- Netflix Game Night: [Netflix Tudum](https://www.netflix.com/tudum/articles/new-netflix-games-play-on-tv-2025) · [Thurrott](https://www.thurrott.com/?p=329581)
- Houseparty: [Appfigures](https://app.appfigures.com/resources/insights/20211008?f=3) · [Game World Observer](https://gameworldobserver.com/?p=11657)
- Messenger games: [TechCrunch](https://techcrunch.com/2023/04/06/messenger-adds-multiplayer-games-you-can-play-during-video-calls) · [SamMobile](https://www.sammobile.com/news/facebook-messenger-games-video-calls/)
- SharePlay with Kahoot!: [Kahoot! press release](https://kahoot.com/press/2021/10/27/facetime-kahoot-shareplay-ios/)
- Caribu: [Common Sense Media](https://www.commonsensemedia.org/app-reviews/caribu-family-video-calls) · [Romper](https://www.romper.com/p/the-caribu-video-calling-app-lets-kids-play-virtual-games-read-with-family-22767309)
- Facebook Portal: [BuzzFeed News](https://www.buzzfeednews.com/article/katienotopoulos/facebook-portal-rip-amazon) · [TechSpot](https://www.techspot.com/community/topics/meta-is-killing-off-its-portal-video-calling-devices-for-consumers.275691/)
- Journey: [MCV, Jenova Chen at DICE](https://www.mcvuk.com/jenova-chen-reveals-secrets-of-journey-design/)
- Sky: [Yahoo guide](https://sg.news.yahoo.com/add-friend-sky-children-light-181503480.html) · [University of Chicago observation](https://voices.uchicago.edu/202003sosc20224/2020/07/09/communication-and-relationships-in-sky-children-of-the-light)
- Keep Talking and Nobody Explodes: [GDC 2016 talk](https://gdcvault.com/play/1023113/Designing-Asymmetric-Gameplay-For-Keep) · [VRroom](https://archive.vrroom.studio/?p=30136)
- Overcooked: [Automaton](https://automaton-media.com/en/news/overcooked-japanese-celebrities-fear-reveals-former-akb48-member/) · [York Vision review](https://www.yorkvision.co.uk/?p=112556)
- Wordle: [The Hinsdalean](https://www.thehinsdalean.com/story/2024/02/08/opinion/wordle-together-stay-together/7440.html)
- Draw Something: [BuzzFeed News](https://www.buzzfeednews.com/article/justinesharrock/life-after-zynga-riding-the-draw-something-meme) · [GamesBeat](https://gamesbeat.com/draw-something-loses-3-million-players/) · [Cult of Mac](https://www.cultofmac.com/?p=229877)
- Animal Crossing: [Martinez et al., CSCW 2022](https://homes.cs.washington.edu/~jessejm/data/MartinezCSCWAnimalCrossing2022.pdf) · [family coping study](https://pmc.ncbi.nlm.nih.gov/articles/PMC9209879)
- Kind Words: [Unwinnable](https://unwinnable.com/2019/10/10/clacking-out-a-few-kind-words/) · [developer on Steam](https://steamcommunity.com/app/1070710/discussions/0/1640919103669125275)
- Research prototypes: [Family Story Play](https://mijn.bsl.nl/doi/10.1145/1753326.1753563) · [StoryVisit](https://research.google/pubs/pub37241/) · [ShareTable](https://repository.gatech.edu/entities/publication/dfd26484-dee5-436c-b551-d0d6dfb32914) · [WaaZam](https://ink.library.smu.edu.sg/sis_research/7923) · [Age Invaders](https://unpaywall.org/10.1007%2FS10055-008-0083-0) · [Age Invaders, Penn State summary](https://aese.psu.edu/outreach/intergenerational/articles/intergenerational-contact-zones/virtual-environments-online-gaming) · [Pais et al.](https://dl.acm.org/doi/abs/10.1145/3637392)
