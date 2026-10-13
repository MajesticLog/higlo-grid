# Images

Every picture the game draws (sounds are in `sfx/`), so any of them can be replaced. Keep the same
file name (or update the path where it's used). SVGs can be swapped for PNG
or WebP if the path is updated too.

| File | What it is | Used in |
|---|---|---|
| `grass-tall.webp` | Tall, unkept grass covering the field (seamless, stretched over the whole grid) | `css/style.css` (`#grid`) |
| `grass-short.svg` | Short grass: a square a sheep has grazed, and the base under shown pictures (stretched to fit) | `css/style.css` (`.tile`) |
| `ufo.svg` | Flying saucer with blinking lights (the sky event, once past dusk) | `js/events.js` |
| `chest.svg` | The memory chest button | `index.html` (`#chest`) |

Everything else on screen is emoji (players' animals, the garden pictures 🌸 🌷
🐌 🐛 🍄 🐦, 🐑, 🐺, sky and weather), drawn by each device's own emoji font.

## Credits

- `grass-tall.webp`: Grass_03 from "Tileable Grass Textures - Set 1" by
  Cethiel, OpenGameArt (https://opengameart.org/content/tileable-grass-textures-set-1),
  CC0. Compressed to WebP.
- All the other images were drawn for this game.
