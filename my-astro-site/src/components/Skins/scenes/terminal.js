/* Skin 'terminal' (generated from styles4.js:styleAscii by port.py) */
import {
  H,
  W,
  bridge,
  flatScene,
  rasterLayers,
  rnd,
  setSeed,
} from "./common.js";

export default async function styleAscii() {
  const C = {
    sky: "#000010",
    sun: "#ffffff",
    sunX: 220,
    sunY: 300,
    sunR: 64,
    cloud: "#555566",
    lov: "#8a9a9a",
    lovS: "#5a6a6a",
    dur: "#9aa0b0",
    durS: "#5a6070",
    snow: "#ffffff",
    navy: "#222233",
    plat: "#507050",
    pine: "#304030",
    canyon: "#384838",
    canyonS: "#1a221a",
    river: "#7fb0d0",
    bridge: "#f0f0f0",
    hill: "#608a50",
    hillPine: "#3a5a32",
    ground: "#a09070",
    wall: "#e0e0e0",
    roof: "#806050",
    metal: "#909090",
    stone: "#a0a0a0",
    walls: ["#e0e0e0", "#c8c8c8", "#d8d8d8", "#bbbbbb"],
    roofs: ["#806050", "#705040"],
    meadow: "#6a8a4a",
    meadow2: "#4a6a3a",
  };
  try {
    await document.fonts.load("700 16px PlexMono");
  } catch (e) {
    /* fall back to monospace */
  }
  const cw = 10,
    ch = 17,
    cols = Math.ceil(W / cw),
    rows = Math.ceil(H / ch);
  const ramp = " .:-=+*#%@";
  return rasterLayers(
    flatScene(C),
    (d, g, li) => {
      setSeed(3 + li);
      g.font = "700 16px PlexMono, monospace";
      g.textBaseline = "top";
      if (li === 0) {
        g.fillStyle = "#020a04";
        g.fillRect(0, 0, W, H);
      }
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++) {
          const o = (j * cols + i) * 4;
          if (d[o + 3] < 128) continue;
          const L = (0.3 * d[o] + 0.59 * d[o + 1] + 0.11 * d[o + 2]) / 255;
          if (li > 0) {
            g.fillStyle = "#020a04";
            g.fillRect(i * cw, j * ch, cw, ch);
          }
          if (L < 0.05) {
            if (rnd() < 0.012) {
              g.fillStyle = "rgba(120,255,160,.5)";
              g.fillText(rnd() < 0.5 ? "." : "*", i * cw, j * ch);
            }
            continue;
          }
          g.fillStyle = `rgba(${Math.round(60 + 140 * L)},255,${Math.round(110 + 80 * L)},${(0.35 + 0.65 * L).toFixed(2)})`;
          g.fillText(
            ramp[
              Math.min(
                ramp.length - 1,
                Math.floor(Math.pow(L, 0.6) * ramp.length),
              )
            ],
            i * cw,
            j * ch,
          );
        }
    },
    { sw: cols, sh: rows },
  );
}
