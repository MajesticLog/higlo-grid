# Session 00 — Research before building

**Date:** Friday 9 October 2026, 21:49–22:18 (London)
**Tool:** Claude (claude.ai chat with agentic tools), not Claude Code
**Model:** Claude Opus 5.5

> **About this file.** This is not a system export. The claude.ai chat has no `/export` command, so this transcript was written by Claude at my request at the end of the session. My prompts are verbatim. Claude's replies are its final messages to me, verbatim. Tool calls (web searches, page fetches, file writes) are summarised in brackets, because the raw tool output was tens of thousands of words of search results. The build sessions that follow are in Claude Code and are exported with `/export`.

Outputs of this session, in `docs/`:

- `best_practices.md`: my brainstorm notes checked against the research literature
- `benchmark.md`: functional benchmark of 27 comparable games, products and research prototypes

---

## 1. Literature review on intergenerational game design

### Me

*(Attached: the Higlo brief, `Higlo - Building test`.)*

> Good evening Claude, please have a look at this but do not start building anything yet. I would like to run a deep search on publications and research regarding best practices when it comes to game design for multiplayer, multigenerational, children and elderly people friendly games. These were some of my notes from a previous brainstorming: "Entrée immédiate. Low floor, high ceiling : tout le monde participe dès la première minute, sans règles à expliquer. Pictionary, la Wii et le principe d'Iwata d'une console acceptée par toute la maison.
>
> * Des rôles adaptés à chacun. Activités asymétriques : la grand-mère raconte, l'enfant invente. Personne n'est mis en difficulté.
> * Personne ne perd vraiment. Coopération plutôt que compétition, ou compétition légère avec du hasard. Personne ne doit se sentir ridicule, en particulier les adultes âgés face à la technologie.
> * L'attention va vers les autres. L'écran est une table de jeu, pas le centre. Le vrai produit, c'est l'échange que l'activité provoque.
> * Surprise et humour. Le dragon qui garde de la glace. La surprise reste au service des personnes.
> * Les adultes s'amusent aussi. Deux niveaux de lecture, comme chez Pixar.
> * Tolérance au désordre. Pause facile, on peut rejoindre en cours de route, sessions courtes.
> * Une trace. Un dessin, une créature qu'on retrouve la fois suivante. Crée un rituel et une raison de revenir.
> * Spécifique à la distance. Voir les visages pendant l'activité, une latence assez faible pour que les rires restent synchronisés, une option asynchrone quand les horaires ne coïncident pas."
>
> Amend and correct if your research contradicts me, and add to it. Compile findings in a "best_practices" document (.txt or .md)

### Claude

[Created a task list: research, check notes against findings, write and verify.]

[Ran about 16 web searches and one page fetch, covering: intergenerational game design guidelines and systematic reviews; remote family play research (Family Story Play, StoryVisit, ShareTable, WaaZam, Video Play); a randomised study comparing competitive, cooperative and creative game modes with seniors (Myosotis FoodPlanet); asymmetric cooperative games (Harris and Hancock); Papert and Resnick's "low floor, high ceiling, wide walls"; Iwata on the Wii and the family living room; video-call latency and conversational turn-taking; older adults and fear of failure; joint media engagement (Cooney Center); families playing games over video during the pandemic (Open University study); asynchronous family play (Pais et al., CSCW 2024); Wordle as a family ritual; adult humour in children's media; Jackbox; Animal Crossing family studies.]

[Wrote `best_practices.md`. One edit after a self-check: softened an unsourced claim about Firebase latency into "worth measuring on real connections".]

> best_practices.md is ready. I wrote it in English, since the write-up goes to Higlo. Your notes are referenced by their French titles. Nothing has been built.
>
> Most of your notes hold up. Three points from the research change them:
>
> **1. "Personne ne perd vraiment" needs correcting.**
> - The only controlled comparison I found studied seniors playing with younger partners. It found the most shared laughter in the competitive mode and the most conversation in the creative mode. Cooperative mode came second on laughter.
> - So the stakes should be low rather than absent. What causes harm is elimination, skill rankings and time pressure, not competition as such.
>
> **2. "La grand-mère raconte, l'enfant invente" assigns roles by age.**
> - Asymmetric roles are the best-supported principle in the whole document.
> - But in digital play, children are often the experts. One video-call study found the main obstacle was that game instructions were written for adults, so the children's skills went unused.
> - Roles should follow preference and skill. Each role should actually depend on the other; giving players different jobs is not enough on its own.
>
> **3. Latency has a direct design consequence.**
> - Avoid any mechanic where the outcome depends on who reacts first across two homes. The network will decide the winner, and it will feel unfair.
> - I'd also suggest leaving video to the family's usual call app rather than building it into the game.
>
> One issue with the base brief itself: it specifies arrow keys. Grandparents and young children are likely to be on tablets or phones, which have no arrow keys. Touch controls are probably the most defensible change you can make to the base.
>
> The evidence in this field comes from small studies, often of grandparent–grandchild pairs only. The document says this at the top, so you don't overstate it in the write-up.

---

## 2. Functional benchmark of existing games

### Me

> Thank you. Next, please do a deep search on games with similar concepts that have been made, identify them, identify what worked, what didn't, to make sure I don't waste time reinventing the wheel and avoid any known problems in game design and player experience. Let's conduct a functional benchmark.

### Claude

> I'll research comparable games and products, both commercial and research prototypes, and compile a functional benchmark: what each does, what worked, what failed, and what that means for your build.

[Ran about 18 web searches and one page fetch, covering: Gather (2D avatar map with proximity video) and its move to virtual offices; Reddit r/place (cooldowns, griefing, three-edition study); Houseparty's shutdown; Caribu; Facebook Portal's discontinuation; Journey and Sky: Children of the Light (wordless co-op, hand-holding); Draw Something's decline; Gartic Phone and skribbl.io; games inside video calls (Messenger, SharePlay); Keep Talking and Nobody Explodes; Age Invaders; Townscaper; Agar.io and .io games; Netflix Game Night; Kind Words; Overcooked and arguments between players.]

[Created the benchmark as a shared Claude Doc and filled it section by section: scope, summary, benchmark table, six category sections, known pitfalls, gaps no one has filled, implications for the build, sources. During filling, corrected three statements that went further than their sources: the product count, a claim about Caribu's adult audience, and a generalisation from a single Wordle column.]

> Outline is up; filling the scope section first.

> The benchmark is ready as a doc. It covers 27 products and research prototypes: what each does, what worked, what didn't, and what that means for your build. You can edit it inline or leave comments. If you'd rather keep it next to best_practices.md in the repo, I can export it as a .md file.

---

## 3. Benchmark as Markdown

### Me

> Let's do that, .md kept in the repo

### Claude

[Exported the doc to Markdown and wrote `benchmark.md`.]

> benchmark.md has the same content as the doc. I only changed the byline from the doc's date chip to plain text.
>
> The repository doesn't exist yet. Both files are here for now, and they'll go into a `docs/` folder at the repository root as part of the first commit, once we start building.
>
> The doc and the .md file are now separate copies. If you edit the doc later, I'll need to export it again.

