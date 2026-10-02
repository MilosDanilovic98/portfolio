/* Skin 'mosaic' (generated from styles5.js:styleMosaic by port.py) */
import {
  H,
  W,
  bridge,
  flatScene,
  hex,
  quantize,
  rasterLayers,
  rnd,
  setSeed,
} from "./common.js";

export default async function styleMosaic() {
  const C = {
    sky: "#ece2cc",
    sun: "#d98a2b",
    sunX: 1310,
    sunY: 190,
    sunR: 62,
    cloud: "#ffffff",
    lov: "#8a9aa6",
    lovS: "#6a7a88",
    dur: "#4f6680",
    durS: "#34465c",
    snow: "#f4f0e6",
    navy: "#2a2622",
    plat: "#6b7f3a",
    pine: "#3f4f26",
    canyon: "#7f6a3f",
    canyonS: "#4f3f26",
    river: "#3f78a0",
    bridge: "#f4f0e6",
    bw: 14,
    cw: 8,
    hill: "#8a9a4a",
    hillPine: "#4f5f2a",
    ground: "#c9a46a",
    wall: "#f4f0e6",
    roof: "#b04a2f",
    metal: "#4f6680",
    stone: "#c9a46a",
    walls: ["#f4f0e6", "#e8d8b0", "#f4f0e6", "#dcc8a0"],
    roofs: ["#b04a2f", "#8a3a24"],
    meadow: "#9aa64f",
    meadow2: "#7f8a3f",
  };
  const pal = [
    ...new Set(
      Object.values(C)
        .flat(2)
        .filter((v) => typeof v === "string" && v[0] === "#"),
    ),
  ];
  const cell = 12,
    cols = W / cell,
    rows = H / cell,
    grout = "#d8cdb8";
  return rasterLayers(
    flatScene(C),
    (d, g, li) => {
      const q = quantize(d, pal),
        P2 = pal.map(hex);
      setSeed(70 + li);
      g.fillStyle = grout;
      for (let n = 0; n < q.length; n++)
        if (q[n] >= 0)
          g.fillRect(
            (n % cols) * cell,
            Math.floor(n / cols) * cell,
            cell,
            cell,
          );
      for (let n = 0; n < q.length; n++) {
        const k = q[n];
        if (k < 0) continue;
        const x = (n % cols) * cell,
          y = Math.floor(n / cols) * cell;
        const [r, gg, b] = P2[k],
          v = 0.88 + rnd() * 0.22;
        g.fillStyle = `rgb(${Math.min(255, r * v) | 0},${Math.min(255, gg * v) | 0},${Math.min(255, b * v) | 0})`;
        const jx = (rnd() - 0.5) * 1.6,
          jy = (rnd() - 0.5) * 1.6,
          sz = cell - 2.2 - rnd() * 1.2;
        g.beginPath();
        g.moveTo(x + 1 + jx, y + 1 + jy);
        g.lineTo(x + 1 + sz + jx + (rnd() - 0.5), y + 1 + jy + (rnd() - 0.5));
        g.lineTo(x + 1 + sz + jx, y + 1 + sz + jy);
        g.lineTo(x + 1 + jx + (rnd() - 0.5), y + 1 + sz + jy);
        g.closePath();
        g.fill();
      }
    },
    { sw: cols, sh: rows },
  );
}
