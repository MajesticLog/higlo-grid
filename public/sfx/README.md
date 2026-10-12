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
making the sound itself.

| File | When it plays |
|---|---|
| `fanfare.wav` | Every memory found: fireflies and tea time |
| `howl.wav` | Full night: the wolf comes out |
| `twinkle.wav` | A shooting star crosses the sky; a memory is guessed |
| `ding.wav` | Someone joins the garden |
| `bleat.wav` | Choosing to send your sheep |
| `munch.wav` | The sheep grazing |
| `swoosh.wav` | A hot-air balloon crosses the sky |
| `caws.wav` | A flock of birds crosses the sky |
| `rain.wav` | A rain cloud passes over the field |
| `hoot.wav` | An owl glides by (night) |
| `theremin.wav` | A UFO wobbles across (night) |

## Credits

All the sounds were made for this game.
