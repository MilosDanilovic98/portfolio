/* Skin 'engraving' (generated from styles5.js:styleEngraving by port.py) */
import { H, W, bridge, flatScene, rasterLayers } from "./common.js";

export default async function styleEngraving() {
  const C = {
    sky: "#e6e6e6",
    skyBands: [
      [120, "#eeeeee"],
      [300, "#f6f6f6"],
    ],
    sun: "#ffffff",
    sunX: 1230,
    sunY: 260,
    sunR: 70,
    cloud: "#ffffff",
    lov: "#a8a8a8",
    lovS: "#7a7a7a",
    dur: "#8a8a8a",
    durS: "#4a4a4a",
    snow: "#fafafa",
    navy: "#202020",
    plat: "#5a5a5a",
    pine: "#2a2a2a",
    canyon: "#4a4a4a",
    canyonS: "#1e1e1e",
    river: "#9a9a9a",
    bridge: "#f8f8f8",
    bw: 10,
    cw: 5,
    hill: "#787878",
    hillPine: "#3a3a3a",
    ground: "#bdbdbd",
    wall: "#f4f4f4",
    roof: "#555555",
    metal: "#888888",
    stone: "#cccccc",
    walls: ["#f4f4f4", "#e2e2e2", "#ececec", "#d8d8d8"],
    roofs: ["#4a4a4a", "#666666"],
    meadow: "#9c9c9c",
    meadow2: "#808080",
  };
  const paper = "#f2efe6",
    ink = "#1a1a1a",
    band = 6,
    sx = 2,
    cols = W / sx,
    rows = H / band;
  return rasterLayers(
    flatScene(C),
    (d, g) => {
      for (let j = 0; j < rows; j++) {
        const y0 = j * band;
        let i = 0;
        while (i < cols) {
          if (d[(j * cols + i) * 4 + 3] < 128) {
            i++;
            continue;
          }
          let e = i;
          while (e < cols && d[(j * cols + e) * 4 + 3] >= 128) e++;
          g.fillStyle = paper;
          g.fillRect(i * sx, y0, (e - i) * sx, band);
          g.fillStyle = ink;
          for (let x = i; x < e; x++) {
            const o = (j * cols + x) * 4,
              L = (0.3 * d[o] + 0.59 * d[o + 1] + 0.11 * d[o + 2]) / 255,
              t = (1 - L) * band * 1.05;
            if (t > 0.35)
              g.fillRect(
                x * sx,
                y0 + (band - t) / 2 + Math.sin(x * sx * 0.02 + y0 * 0.1) * 0.6,
                sx,
                t,
              );
          }
          i = e;
        }
      }
    },
    { sw: cols, sh: rows },
  );
}
