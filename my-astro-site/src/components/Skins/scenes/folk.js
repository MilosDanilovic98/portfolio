/* Skin 'folk' (generated from styles2.js:styleStitch by port.py) */
import {
  H,
  W,
  bridge,
  flatScene,
  hex,
  quantize,
  rasterLayers,
} from "./common.js";

export default async function styleStitch() {
  const C = {
    sky: "#efe6d2",
    sun: "#d9a640",
    sunX: 190,
    sunY: 300,
    sunR: 64,
    cloud: "#efe6d2",
    lov: "#8fb3cf",
    lovS: "#5f86ab",
    dur: "#2f5a8a",
    durS: "#1f3554",
    snow: "#f7f3ea",
    navy: "#231f20",
    plat: "#3f6b3a",
    pine: "#24402a",
    canyon: "#4f7a3f",
    canyonS: "#24402a",
    river: "#8fb3cf",
    bridge: "#f7f3ea",
    bw: 16,
    cw: 10,
    hill: "#7ea35a",
    hillPine: "#3f6b3a",
    ground: "#c79a62",
    wall: "#f7f3ea",
    roof: "#b3202a",
    metal: "#8a8f99",
    stone: "#c79a62",
    walls: ["#f7f3ea", "#e8d3a8", "#f7f3ea", "#e8d3a8"],
    roofs: ["#b3202a", "#7a1520"],
    meadow: "#a7bf6a",
    meadow2: "#7ea35a",
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
    linen = "#efe6d2";
  const shade = (h, f) =>
    `rgb(${hex(h)
      .map((v) => Math.round(v * f))
      .join(",")})`;
  const skyIdx = pal.indexOf(linen);
  const weave = (g) => {
    g.strokeStyle = "rgba(120,95,60,.12)";
    g.lineWidth = 1;
    g.beginPath();
    for (let x = 0; x < W; x += 4) {
      g.moveTo(x + 0.5, 0);
      g.lineTo(x + 0.5, H);
    }
    for (let y = 0; y < H; y += 4) {
      g.moveTo(0, y + 0.5);
      g.lineTo(W, y + 0.5);
    }
    g.stroke();
  };
  return rasterLayers(
    flatScene(C),
    (d, g, li) => {
      const q = quantize(d, pal);
      g.fillStyle = linen;
      if (li === 0) g.fillRect(0, 0, W, H);
      else
        for (let n = 0; n < q.length; n++)
          if (q[n] >= 0)
            g.fillRect(
              (n % cols) * cell,
              Math.floor(n / cols) * cell,
              cell,
              cell,
            );
      g.save();
      g.globalCompositeOperation = "source-atop";
      weave(g);
      g.restore();
      g.lineCap = "round";
      // batch strokes per colour: three passes (shadow, thread, highlight) per palette entry
      const byColour = new Map();
      for (let n = 0; n < q.length; n++) {
        const k = q[n];
        if (k < 0 || k === skyIdx) continue;
        if (!byColour.has(k)) byColour.set(k, []);
        byColour.get(k).push(n);
      }
      const p = 2.2;
      for (const [k, cells] of byColour) {
        const c = pal[k];
        for (const [style, lw, dx, dy] of [
          [shade(c, 0.62), cell * 0.36, 0.6, 0.8],
          [c, cell * 0.3, 0, 0],
          ["rgba(255,255,255,.25)", cell * 0.08, -0.6, -0.4],
        ]) {
          g.strokeStyle = style;
          g.lineWidth = lw;
          g.beginPath();
          for (const n of cells) {
            const x = (n % cols) * cell + dx,
              y = Math.floor(n / cols) * cell + dy;
            g.moveTo(x + p, y + p);
            g.lineTo(x + cell - p, y + cell - p);
            g.moveTo(x + cell - p, y + p);
            g.lineTo(x + p, y + cell - p);
          }
          g.stroke();
        }
      }
    },
    { sw: cols, sh: rows },
  );
}
