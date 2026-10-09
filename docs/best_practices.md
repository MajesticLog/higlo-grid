# Best practices: multiplayer games for families across generations and distance

Compiled 9 October 2026 for the Higlo building test. Each of the eight brainstorm notes is checked against published research and industry precedent. The verdict line says whether the note holds, needs a nuance, or needs a correction. New principles not in the original notes follow at the end, then a short list of implications for the build, then sources.

A caveat on the evidence: research on intergenerational digital games is real but thin. Most studies are small (6 to 30 pairs), often lab or workshop settings, often grandparent–grandchild pairs specifically rather than whole families. Treat the findings as strong hints, not laws.

---

## 1. Entrée immédiate — low floor, high ceiling

**Verdict: holds, with two refinements.**

- The phrase comes from Seymour Papert and Mitchel Resnick (Logo, Scratch), not from game design. Resnick's full formulation has a third term: **low floor, high ceiling, wide walls**. Wide walls means many different paths and styles of participation, not just a range of difficulty. For a family game, wide walls is arguably the more important of the three: it is what lets a grandparent and a 7-year-old do different things in the same space. [1][2]
- A study of mobile game design for adults over 50 concluded that a universal design accessible to novices of any generation mattered more than special rules for older players, and that improving the experience for older adults tended to improve it for everyone else too. So "low floor" should be designed for *novices*, not for "the elderly". [3]
- Iwata reference: accurate in spirit. Iwata described the DS as a platform no one could hate and the Wii as an attempt to create a lifestyle where the family gathers to laugh and talk; he used mothers who disliked games as his benchmark. Nintendo also designed the hardware so it would be accepted in the living room by the whole family rather than read as a child's toy. [4][5] Note that the Wii's success was co-located (one TV, one room); the remote case is different, see section 8.
- Pictionary-style drawing remains a good example: no rules to explain, and skill differences are funny rather than humiliating.

## 2. Des rôles adaptés à chacun — asymmetric activities

**Verdict: strongly supported, but the example needs correcting.**

- Asymmetric cooperative play has the best direct evidence of anything in this list. Harris and Hancock (CHI 2019) found that asymmetric cooperative games may increase perceived connectedness, social engagement, immersion and comfort with controls compared with symmetric co-op, and that outcomes improved further by tuning *interdependence*: the timing of cooperative actions and the direction of dependence between players. [6] Their work explicitly names grandparents and grandchildren as a target case for asymmetry. [7]
- Pais et al. (CSCW 2024) applied this to families: they identified time and expertise as the two main barriers, proposed asymmetric design plus asynchronous play to reconcile adults' and children's needs, and used interdependent progress to generate conversation topics that carried into daily family life. [8]
- **Correction to the example** ("la grand-mère raconte, l'enfant invente"): it assigns roles by age stereotype. The literature points the other way on technology: in digital play, children often become the mentor, reversing the usual pattern where the older person leads. [9] In the Open University video-call study, grandparents turned to grandchildren for help with setup, and a key barrier was that instructions were written for adults and did not use the children's expertise. [10] A pilot study framed its value as an "equal playing field" where both generations teach and learn. [11]
- Better framing: **roles chosen by preference and skill, not by age**, with each role genuinely needing the other. Make it possible for the child to be the expert and the grandparent to be the one who helps, and vice versa.
- Different roles are not enough on their own. The interdependence (who depends on whom, and when) is what produces the social effect. [6]

## 3. Personne ne perd vraiment — cooperation over competition

**Verdict: needs correction. The evidence is mixed, and competition has a measurable benefit.**

- The common view in the literature is that older players are generally less competitive, so intergenerational games should favour collaboration or "cooperative competition". [12]
- However, the only randomised field study I found that compared modes directly (Zahn et al., 2022, *Myosotis FoodPlanet*, seniors with younger co-players) found **significantly more laughing together in the competitive mode** (competitive > cooperative > creative). The **creative mode produced the most verbal communication**. [13] The authors note an ongoing debate on this point in the field.
- A systematic review lists competitive, collaborative, cooperative and "cooperative competition" as the available forms, without declaring one superior. [14]
- Revised principle: **the stakes should be low, not absent.** Light competition produces shared laughter; creative modes produce conversation. Avoid what actually hurts: elimination, public ranking of skill, time-pressured reflex tests where older players reliably lose. Mixed-generation teams competing against each other, or everyone against the game, keeps competition without pitting grandparent against grandchild.
- The point about older adults not feeling ridiculous with technology is well supported (see section 9 on fear of failure). [15]

## 4. L'attention va vers les autres — the screen is a table, the exchange is the product

**Verdict: holds. This is the most consistent finding across the remote-family research.**

- Family Story Play (Nokia / Sesame Workshop) was explicitly designed to shift interaction from conversation to shared activity, and improved child engagement and interaction quality with distant grandparents. [16][17]
- StoryVisit (61 families): sessions around a shared e-book lasted about five times longer than typical family video chats; adding an animated character increased session length by another 50%. [18]
- Yarosh's ShareTable work concluded that phone and video calls fail remote families because they focus on conversation rather than care and play, which is how closeness is actually built; communication more than doubled with a shared activity space, and children initiated more sessions. [19]
- The Open University study: compared with a normal video call, playing a game together gave longer, more enjoyable and more meaningful interaction, with shared memories and laughter. They describe the default video call as formal questions met with one-word answers, after which the child drifts away. [10]
- A pilot with students and older adults reported the experience was more about the conversation than the game. [11]
- Nuance: the activity still has to hold the child's attention on its own terms. The animated-character result above shows that a third party in the activity (a character, a creature) extends sessions.

## 5. Surprise et humour

**Verdict: holds, but evidence is mostly from practice, not controlled study.**

- MIT's Video Play prototypes were built specifically to create opportunities for silliness and open-ended play between adults and young children. [20]
- Laughter is measurable and design-dependent (section 3: competitive mode produced the most shared laughter). [13]
- Ames's work on family video chat found families used video for visual play and jokes that voice alone cannot carry; she also stresses not pressuring the child to perform. [21] This matters for surprise: it should happen *to* the group, not be demanded *of* a player.
- Your note "la surprise reste au service des personnes" is consistent with this.

## 6. Les adultes s'amusent aussi — two levels of reading

**Verdict: holds, with a caution about how.**

- The Cooney Center's joint media engagement guidance includes designing for the enjoyment of all audiences, and Takeuchi argues media should make it easier for people to interact around it. [22][23]
- Caution: film scholarship on adult jokes in children's films describes an inherent conflict in this double coding, between deferring to a child audience and to informed adults. [24] Jokes that only adults get can split the room rather than join it.
- Better target: **one shared moment that each age reads at its own depth**, rather than separate adult-only layers. Also, adults have fun when they have something real to do (a role with choices), not only something to watch.
- Children's side matters just as much: in Mahmud et al., older adults were eager to play with grandchildren, while children preferred peers but did not refuse grandparents as long as the game was one they liked. The authors (as summarised in a later review) suggest giving priority to children's preferences, because older adults adapt more readily. [25][26]

## 7. Tolérance au désordre — pause, drop-in, short sessions

**Verdict: holds, well supported.**

- Older players' stated preferences in a systematic review: short sessions, simple rules, intellectual challenge over reflex. [26]
- During the pandemic, remote play worked, but the friction points were scheduling, setup, miscommunication and players' wellbeing. [27]
- Yarosh found the wish to connect sometimes conflicted with the wish not to disrupt the other household. [19] A game that can be joined and left quietly respects that.
- Pais et al. name lack of time as one of two main barriers to family play. [8]
- Precedent: Jackbox lets players join from any device's web browser with a short code, no install, and its success at parties is often attributed to exactly that; one reviewer notes even older people unfamiliar with their phones can usually join. [28][29] The Higlo base (open a link, you're in) already starts from this.

## 8. Spécifique à la distance — faces, latency, async

**Verdict: holds, with specifics on latency and one design consequence.**

*Faces*
- Seeing each other in the same space matters. WaaZam found that playing inside a shared, merged video space enabled new activities and increased social engagement compared with separate windows. [30] ShareTable's overlapped video was used by families to express metaphorical touch and closeness. [19]
- Practical point for this build: the game does not have to carry the video itself. Families already have FaceTime, WhatsApp or Zoom. The activity can be designed to sit next to a call. Building video into the game (WebRTC) is a significant amount of work for a 5-day exercise.

*Latency*
- Normal conversation has gaps of about 200 ms between speakers; a Michigan study suggests even short added lag of 30–70 ms can disturb the rhythm of turn-taking. Zoom's own guidance is that under 150 ms should feel lag-free. [31]
- Delay over 100 ms affected perceived fairness in a competitive quiz over video conferencing. [32]
- Consequence: **avoid mechanics where the outcome depends on who reacts first across two homes.** Network delay will decide, and it will feel unfair. Prefer turn-based moments, simultaneous-but-not-racing actions, or collective outcomes. Laughter staying synchronised depends more on the call than on the game.

*Asynchronous*
- Pais et al. used asynchronous play to handle different schedules, and found it created ongoing conversation topics in daily family life. [8]
- Animal Crossing research on families (27 families) recommends designing for persistent shared spaces and flexible in-game progress. [33] Families also used it for communal coping, with shared ownership of a collective problem. [34]

*Physical anchor*
- An ongoing trial on structured video chat found children showed more joint attention when they had their own physical copy of the book to follow rather than only the on-screen version. [35] Something physical in each home (paper and pencil, an object) may be worth considering.

## 9. Une trace — something to come back to

**Verdict: holds.**

- Persistent shared spaces and flexible progress (Animal Crossing families study). [33]
- Interdependent progress becoming "pervasive conversational topics" in family routines (Pais et al.). [8]
- Wordle is the plain-language example of a shared daily ritual across time zones: one family describes waiting to share scores until a reasonable hour for relatives in other zones, and calling it how they feel anchored to family who live far away. [36]
- My own judgment, not from a source: avoid streak mechanics and anything that punishes absence. A ritual for a family should forgive a missed week, or the grandparent who misses three sessions stops coming back out of embarrassment.

---

## New principles to add

**10. Interface for both ends of the age range.** Documented difficulties for older players: reading on-screen text, noticing items at the edge of the screen, mouse and keyboard control, selecting and scrolling, time-pressured actions, and hearing. [26] Quick decisions under time pressure are a recurring challenge category. [37] Young children may not read at all: Family Story Play let children start calls by touching icons. [17] Large targets, icons over text, sound as a secondary channel, nothing that depends on peripheral vision or speed.

**11. Fear of failure is real for older players.** A DFKI interview study notes fear of failure and older adults' tendency to prefer casual over performance-related games. [15] The Open University study adds that grandparents feel pressure to adopt technology so as not to miss out on grandchildren's lives. [10] Design so a mistake is invisible or funny, never exposed as "you lost".

**12. Creative modes generate conversation.** In the one controlled comparison, creative play produced the most talking. [13] If the exchange is the product (your note 4), a creative component (drawing, building, naming) is the strongest lever for talk; light competition is the strongest for laughter. A combination is probably the target.

**13. Make the child the competent one sometimes.** Children often mentor in digital play; instructions written for adults wasted that. [9][10] Onboarding could be child-led: the youngest player teaches.

**14. Children choose, adults adapt.** Prioritise children's preferences in themes and activity; older adults are more willing to stretch. [25][26]

**15. Test with real families early.** The co-design literature recommends small groups and building on the shared ideas of both generations. [38] For this test, even one 15-minute session with two households on two devices will reveal more than another feature.

---

## Implications for the Higlo build (short)

- **Arrow keys are a problem.** The base specifies keyboard arrows. Grandparents and young children are most likely to be on a tablet or phone, which has no arrow keys. Touch controls (tap a square, or swipe) are probably the single most important change to the base, and easy to justify in the write-up.
- **No reaction races between homes.** Every move goes through the Firebase Realtime Database and back, with a delay that varies by household connection; outcomes that depend on who arrives first will feel arbitrary. Worth measuring on real connections rather than assuming either way.
- **Leave video to the family's existing call app**, and say so in the write-up as a deliberate choice.
- **Something persists on the grid between sessions** (a drawing, a creature, a garden) so the link has a reason to be reopened next week.
- **Arrivals and departures are moments** (the brief asks how they feel): soft, visible, never punishing for leaving.

---

## Sources

1. Resnick, *Lifelong Kindergarten* (MIT Press, 2017), summary: https://boingboing.net/2017/10/04/passion-play-peers-projects.html/amp
2. "Low floors, high ceilings, wide walls" (Papert & Resnick), INTED 2026 paper: https://library.iated.org/view/MOOG2026BEY
3. Mobile Game Design Guide … Middle-Aged and Older Adult Population, *JMIR Serious Games* (2021): https://doi.org/10.2196/24449
4. Iwata interview in Asahi Shimbun, via Nintendo World Report: https://nintendoworldreport.com/news/15058
5. Iwata Asks — Wii hardware: https://iwataasks.nintendo.com/interviews/wii/wii_console/0/2
6. Harris & Hancock, "To Asymmetry and Beyond!", CHI 2019: https://uwaterloo.ca/touchlab/references/asymmetry-and-beyond-improving-social-connectedness
7. Waterloo Touchlab, asymmetric games project: https://uwaterloo.ca/touchlab/projects/asymmetric-games-understanding-how-meaningfully-engage
8. Pais et al., "Promoting Family Play through Asymmetric Game Design", CSCW 2024: https://dl.acm.org/doi/abs/10.1145/3637392 (summary: https://www.universityxp.com/research/2026/7/23/promoting-family-play-through-asymmetric-game-design)
9. "Intergenerational active play: a scoping review", ACM: https://dl.acm.org/doi/fullHtml/10.1145/3572921.3576217
10. Capdevila & Lazard (Open University), The Conversation, 2022: https://stuff.co.za/2022/06/27/board-games-how-playing-them-online-can-bring-grandparents-and-grandchildren-closer-together/
11. "Games Are for Everyone" pilot, *Innovation in Aging* (2024): https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11689886/
12. "Setting Up and Conducting the Co-design of an Intergenerational Digital Game" (2019): https://link.springer.com/chapter/10.1007/978-3-030-22012-9_5
13. Zahn et al., "Effects of Game Mode in Multiplayer Video Games on Intergenerational Social Interaction", *JMIR Formative Research* (2022): https://pmc.ncbi.nlm.nih.gov/articles/PMC8892273
14. "Benefits and Factors Influencing the Design of Intergenerational Digital Games: A Systematic Literature Review", *Societies* (2017): https://doi.org/10.3390/soc7030018
15. Altmeyer et al. (DFKI), older adults and game elements: https://www.dfki.de/fileadmin/user_upload/import/9808_p453-altmeyer.pdf
16. Raffle et al., "Family Story Play", CHI 2010: https://mijn.bsl.nl/doi/10.1145/1753326.1753563
17. Cooney Center press release on Storyplay (2009): https://joanganzcooneycenter.org/press/sesame-street-and-nokia-research-center-explore-story-time-for-the-21st-century/ and https://current.org/?p=9742
18. Raffle et al., "Hello, Is Grandma There? StoryVisit", CHI 2011: https://research.google/pubs/pub37241/
19. Yarosh, *Supporting remote synchronous communication between parents and young children* (Georgia Tech): https://repository.gatech.edu/entities/publication/dfd26484-dee5-436c-b551-d0d6dfb32914
20. Follmer, Raffle, Ishii, Video Play (MIT Media Lab): https://tangible.media.mit.edu/project/video-play/
21. Ames, "Making Love in the Network Closet", summarised in Headspace: https://www.headspace.com/articles/grandparents-live-far-away
22. Takeuchi & Stevens, *The New Coviewing* panel notes (Cooney Center): https://joanganzcooneycenter.org/2012/02/14/the-cooney-center-presents-the-new-coviewing/
23. New America podcast with Lori Takeuchi: https://www.newamerica.org/insights/podcast-children-adults-the-new-co-viewing-via-digital-media/
24. Summers, "Intertextuality and 'adult' humour in children's film", *Oxford Handbook of Children's Film* (2022): https://repository.mdx.ac.uk/item/qz7z2
25. Mahmud et al. (2010), summarised in "Enhancing Older Adults' Social Connectedness through Digital Games": https://crimsonpublishers.com/ggs/fulltext/GGS.000504.php
26. Systematic review (as 14), section on player-centric factors: https://doi.org/10.3390/soc7030018
27. Stawarz & Ramirez Gomez, "Socially distanced games", CHI PLAY 2022: https://orca.cardiff.ac.uk/154234
28. Nintendo eShop, Jackbox Party Pack 2: https://www.nintendo.com/au/games/nintendo-switch/the-jackbox-party-pack-2/
29. Kotaku on Jackbox: https://kotaku.com/the-jackbox-party-games-are-some-of-the-best-games-of-t-1840661742
30. WaaZam!, CHI 2014: https://ink.library.smu.edu.sg/sis_research/7923
31. University of Michigan, Boland on Zoom lag: https://record.umich.edu/?p=84212
32. Review of video conferencing shortcomings (citing Ishibashi et al. 2006): https://arxiv.org/pdf/2507.03902
33. Martinez et al., "Joint Media Engagement in Families Playing Animal Crossing", CSCW 2022: https://homes.cs.washington.edu/~jessejm/data/MartinezCSCWAnimalCrossing2022.pdf
34. "Families Playing Animal Crossing Together: Coping With Video Games": https://pmc.ncbi.nlm.nih.gov/articles/PMC9209879
35. Structured video chat trial, NCT06071832: https://clinicaltrials.gov/study/NCT06071832
36. "Wordle together, stay together", The Hinsdalean (2024): https://www.thehinsdalean.com/story/2024/02/08/opinion/wordle-together-stay-together/7440.html
37. AI as assistive technology for older adult gamers, pilot (2025): https://arxiv.org/html/2506.07830v1
38. Co-design state-of-the-art review (as 12), ResearchGate version: https://www.researchgate.net/publication/334371395_Setting_Up_and_Conducting_the_Co-design_of_an_Intergenerational_Digital_Game_A_State-of-the-Art_Literature_Review
