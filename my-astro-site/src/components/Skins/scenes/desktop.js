/* Skin 'desktop' (generated from styles3.js:styleMac by port.py) */
import { bridge, flatScene, rasterLayers } from "./common.js";

export default async function styleMac() {
  const C = {
    sky: "#cbdbfc",
    skyBands: [
      [200, "#dfe8ff"],
      [420, "#f2f5ff"],
    ],
    sun: "#ffffff",
    sunX: 1250,
    sunY: 230,
    sunR: 60,
    cloud: "#ffffff",
    lov: "#9badb7",
    lovS: "#696a6a",
    dur: "#847e87",
    durS: "#3f3f4f",
    snow: "#ffffff",
    navy: "#111111",
    plat: "#4b692f",
    pine: "#1d2a1a",
    canyon: "#3a4a2a",
    canyonS: "#111111",
    river: "#9fd0e4",
    bridge: "#ffffff",
    hill: "#8fae6a",
    hillPine: "#2f4a25",
    ground: "#d9c8a6",
    wall: "#ffffff",
    roof: "#5a2a2a",
    metal: "#8a8a8a",
    stone: "#999999",
    walls: ["#ffffff", "#dddddd", "#eeeeee", "#cccccc"],
    roofs: ["#4a2a2a", "#6a3a3a"],
    meadow: "#b9d78a",
    meadow2: "#7a9a5a",
  };
  const B = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const cols = 480,
    rows = 600; // one sample per 3 px dot; CSS scales the canvas up with hard pixels
  return rasterLayers(
    flatScene(C),
    (d, g) => {
      const img = g.createImageData(cols, rows),
        px = img.data;
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++) {
          const o = (j * cols + i) * 4;
          if (d[o + 3] < 128) continue;
          const L = (0.3 * d[o] + 0.59 * d[o + 1] + 0.11 * d[o + 2]) / 255;
          const v =
            Math.pow(L, 0.62) < (B[(j % 4) * 4 + (i % 4)] + 0.5) / 16 ? 0 : 255;
          px[o] = px[o + 1] = px[o + 2] = v;
          px[o + 3] = 255;
        }
      g.putImageData(img, 0, 0);
    },
    { sw: cols, sh: rows, ow: cols, oh: rows },
  );
}
