# Images

Every picture the game draws, so any of them can be replaced. Keep the same
file name (or update the path where it's used). SVGs can be swapped for PNG
or WebP if the path is updated too.

| File | What it is | Used in |
|---|---|---|
| `grass-tall.webp` | Tall, unkept grass covering the field (seamless, stretched over the whole grid) | `css/style.css` (`#grid`) |
| `grass-short.svg` | Short grass: one turned-over square (stretched to fit) | `css/style.css` (`.tile`) |
| `flowers-1.svg` … `flowers-4.svg` | Little flowers, transparent around the dots, laid over the short grass | `css/style.css` (`.tile.flower.f0` … `.f3`) |
| `balloon.svg` | Hot-air balloon (sky event, day) | `js/events.js` |
| `ufo.svg` | Flying saucer with blinking lights (sky event, night) | `js/events.js` |
| `chest.svg` | The memory chest button | `index.html` (`#chest`) |

Everything else on screen is emoji (players' animals, 🐑, 🔍, 🪤, 🐺, insects,
sky and weather), drawn by each device's own emoji font.

## Credits

- `grass-tall.webp`: Grass_03 from "Tileable Grass Textures - Set 1" by
  Cethiel, OpenGameArt (https://opengameart.org/content/tileable-grass-textures-set-1),
  CC0. Compressed to WebP.
- All the other images were drawn for this game.
