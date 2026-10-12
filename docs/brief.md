# Higlo - Building test

The exercise is to create a small multiplayer game that runs in the browser. The game itself is the easy part: with something like Claude Code, the basic version should be a one-shot thing, from the description below. The interesting part is how you build on that to make it something special and interesting: your ideas, your taste, and how you work with the tools to get it there.

## In short

- Build the base game below with Claude Code (or other tools if you prefer).
- Spend the rest of your time making it something a family or friends would want to play together from different homes: fun, cool, and something they'd come back to.
- By **[Wed 14 October, 12:00]**, send us a live link, your repository, your Claude Code sessions and a short write-up (a few bullet points explaining the thinking).
- Then we'll play it together and we can talk through it.

## The base

A shared grid that several people can be in at once.

- Each person sees an 11 × 11 grid, with a coloured circle of their own in the centre.
- The arrow keys move your circle one square at a time. It can't leave the grid.
- Opening the site without a session link starts a new session, and the address bar updates to a link you can share.
- Anyone who opens that link joins the same grid. They get a circle of their own, and everyone sees everyone else's circles move in real time.
- When someone leaves, their circle disappears.

We expect Claude Code to build this in one go from the description above (with some supporting text from below), so you're welcome to paste this section, or the whole document, as part of your first prompt.

## The exercise: make it something unique

Imagine the people on the link are a family or close friends spread across different homes: cousins, parents and kids who have left home, old school friends. Make it something they'd enjoy doing together, and want to open again next week.

Some questions to start from. You don't need to answer them all:

- What do they actually do together on the grid? Why would they come back?
- How does it feel when someone arrives, moves, or leaves?
- What interface and device does each person use, and what's the best way for them to use it?
- How do you give the activity an identity? How do people refer to it?
- What small touches would make it clearer, or more delightful?

The base is a starting point, not a rule. Change the grid, the circles or the controls if it makes the experience better, and tell us why. Use any tools you like for visuals and sound, generative ones included.

A few ideas done with care are better than many done roughly. Try things, keep what works and throw away what doesn't, and tell us what you threw away: that interests us as much as what you kept.

## How to build it

**Claude Code.** We'd strongly suggest you use Claude Code; it's what we currently use at Higlo, but if you prefer Codex or something else, that's fine. If you don't already have a subscription for Claude Code, take out Claude Pro and we'll reimburse the first month. Just send us the receipt. Pro usage should be enough, but if you run out and need the Max subscription, go for it and keep the receipt.

**Firebase.** We suggest you use Firebase for the backend, and in particular the Realtime Database for the shared state (the backend of the communication); it's made for exactly this. Create your own Firebase project on the free Spark plan (no card needed), add a Realtime Database, and deploy with Firebase Hosting, which is also free. Claude Code can walk you through the setup if you've not done it before.

**Git.** Work in a git repository, and commit as you go: once the base works, then after each idea. We'll read the history, because it shows how your thinking developed. A public GitHub repository is ideal, and it's free.

**Your sessions.** This isn't a hard requirement, but at the end of each Claude Code session, run `/export` and save the conversation to a file. Put the files in a `sessions/` folder in the repository, or attach them to your email. They show us how you steer the agent, so there's no need to save your prompts separately.

## What we're looking at

- **How it feels to play with other people.** We'll try it on two or three devices at once.
- **Your ideas and your taste.** What you added, what you left out, and why.
- **How you work with Claude Code.** How you steer it, and what you do when it gets something wrong.
- **How you explain your decisions.**

We're not looking at code quality for its own sake, test coverage, or a polished write-up.

## What to send

By **[Wed 14 October, 12:00]**, email us:

- A link to the live site
- A link to the repository
- Your exported Claude Code sessions (in `sessions/`, or attached)
- A short write-up (informal is fine, and so are bullet points) covering:
  - who you imagined playing it, and what they're doing together
  - what you added, and why
  - what you tried and threw away
  - where Claude Code helped, and where it got in the way
  - what you'd do with another day
- Your subscription receipt, and bank details to reimburse you, if you took one out

## Help

If you get stuck on Firebase, Claude Code or deploying, email us. We'd much rather help than have you lose time on setup.

