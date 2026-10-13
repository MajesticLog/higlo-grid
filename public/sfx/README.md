# Sounds

Every sound the game plays, so any of them can be replaced. Keep the same file
name, or change the path in `js/sound.js` (the `SOUNDS` list at the top), where
each sound also has a `volume` (1 = as recorded).

The files that come with the game were rendered from the sounds the game used
to make in the browser (same notes and timings). They're **quiet on purpose**
(peaks around 10 to 15% of full volume), to sit under a family video call. A
louder replacement can be turned down with its `volume`.

MP3 or WAV both work in every browser; keep each one short (a few seconds) and
small (tens of KB for MP3). If a file can't be loaded, the game falls back to
making the sound itself (except the rooster).

The music and ambiences (`js/music.js`) are longer loops, streamed: MP3 at
96 kbps, levelled to the same loudness (-30 LUFS) so they fade into each other
smoothly. The uncompressed originals are kept out of the repository.

| File | When it plays |
|---|---|
| `fanfare.wav` | Every memory found: fireflies and "What a team!" |
| `howl.wav` | Full night: the wolf comes out |
| `twinkle.wav` | A memory is guessed |
| `ding.wav` | Someone joins the garden |
| `goodbye.wav` | Someone leaves the garden |
| `sheep.wav` | Choosing to send your sheep, and when it trots off |
| `rooster.wav` | The first round of a game starts |
| `munch.wav` | The sheep grazing |
| `theremin.wav` | A UFO wobbles across (sometimes, once past dusk) |

### Music and ambience

| File | When it plays |
|---|---|
| `morning.mp3` | After the rooster, until noon (looped) |
| `day.mp3` | From noon to dusk (looped) |
| `night.mp3` | From dusk until the end of the game (looped) |

## Credits

- `morning.mp3`: "Morning" by Kevin MacLeod (incompetech.com), licensed under
  Creative Commons: By Attribution 4.0 (https://creativecommons.org/licenses/by/4.0/).
- `rooster.wav`: by BenjaminNelan, freesound.org
  (https://freesound.org/people/BenjaminNelan/sounds/435508/), CC BY.
- `sheep.wav`: by n_audioman, freesound.org
  (https://freesound.org/people/n_audioman/sounds/321967/), CC BY.
- `day.mp3`: by The_Sound_Side, freesound.org
  (https://freesound.org/people/The_Sound_Side/sounds/262230/), CC BY.
- `night.mp3`: "Night Time Crickets" by iainmccurdy, freesound.org
  (https://freesound.org/people/iainmccurdy/sounds/761326/), CC BY.

These were converted for the game (mono WAV or MP3, made quieter or levelled).
All the other sounds were made for this game.
