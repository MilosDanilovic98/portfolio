# Skins: 32 designs for the portfolio

A **Design** button (bottom right) opens a picker with every look: **Original** (the neobrutalist site with its PixiJS sky, the default), the WebGL **Cut-out diorama**, and 30 illustrated styles of Pljevlja. The choice changes the whole site live, with no reload, and is remembered in `localStorage`. You can also link to a design with `?skin=<id>` or `#<id>` (for example `/?skin=folk`).

## How it works

| Part | File | What it does |
| --- | --- | --- |
| List of designs | `registry.js` | Id, name and description of each skin. `dark: true` switches the icons to their white versions, and `pixelated: true` keeps hard pixels when the background is scaled up |
| Interface styling | `skins.css` | Base rules that read design tokens (`--sk-*`), plus one block of tokens per skin and a few signature details for each |
| Fonts | `fonts.css`, `fonts/` | `@font-face` rules for every skin font. The browser only downloads a font when the active skin uses it |
| Runtime | `manager.js` | Renders the background, handles parallax scrolling, swaps skins with a cross-fade, caches scenes, and mounts or destroys the WebGL diorama |
| Picker | `SkinSwitcher.astro` | The button and the panel. Thumbnails load only when the panel opens |
| Scenes | `scenes/*.js` | One module per background, plus `common.js` with the shared Pljevlja geometry (mountains, Tara bridge, monastery, power plant, town) |

### Why it stays fast

- **Instant interface switch.** Every skin's UI is CSS keyed to `<html data-skin="…">`, so switching is one attribute change. A small inline script in `<head>` sets the saved skin before the first paint, so there is no flash.
- **The original background is paused, not destroyed.** `BackgroundCanvas.astro` starts PixiJS only while "Original" is active, and stops its ticker (and the cloud, bird and star spawners) while another design is shown.
- **Code is loaded on demand.** Each scene is its own chunk (1–10 KB) loaded with `import.meta.glob`. A visitor who never opens the picker downloads none of them, and the 128 KB WebGL diorama is only loaded while it is the active design.
- **Draw once, then only move.** A scene is rendered once into 2–7 depth layers: SVG images, or canvases for the pixel, embroidery, mosaic, engraving, ASCII and 1-bit designs. Scrolling then only changes `transform: translate3d()` on those GPU layers inside a single `requestAnimationFrame`. No drawing happens while you scroll.
- **Raster designs sample at cell resolution.** For example, the pixel art samples 240×300 points instead of 1440×1800 pixels and lets CSS scale up a tiny canvas.
- **Caching and cleanup.** Rendered scenes are cached, so going back to a design is instant. Only the last 3 canvas-based designs are kept, to limit memory. Leaving the diorama stops its render loop and releases the WebGL context.
- **Phones.** On phones, full-screen blend-mode texture overlays are skipped. `prefers-reduced-motion` turns off the cross-fade.

## Adding a design

1. Write `scenes/<id>.js`. Its default export returns an SVG string of the 1440 × 1800 scene, using helpers from `common.js` (`regions()`, `monasterySvg()`, `bridgeSvg()`, …). Put `LAYER` between depth layers (sky, mountains, plateau and bridge, town), and `OVERLAY('multiply')` before a fixed texture. It can also return `rasterLayers(...)` for a canvas-based look.
2. Add `{ id, name, blurb }` to `registry.js`, and add the id to the list in the `<head>` script in `layouts/Layout.astro`.

Hook classes used by the skins: `sk-nav` (Navbar header), `sk-hero-box`, `sk-badge`, `sk-chip` (Header), `sk-card`, `sk-card-head`, `sk-shot`, `sk-desc`, `sk-btn` (Project). Services, skills, the call to action, the footer and the contact dialog are styled through their existing classes (`serviceCard`, `skillCard`, `ctaSection`, `ctaButton`, `footer`, `modal-box`).
3. Add a token block `html[data-skin="<id>"] { --sk-… }` to `skins.css`.
4. Add a 264 × 330 thumbnail at `thumbs/<id>.webp`.

The scene modules are generated from the mock-up sources by `tools/port.py`, so a design can be edited in the mock-up page and then ported. Editing `scenes/*.js` directly is fine too.
