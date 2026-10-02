/* Skin 'pixel' (generated from styles2.js:stylePixel by port.py) */
import { bridge, flatScene, hex, quantize, rasterLayers } from "./common.js";

export default async function stylePixel() {
  const C = {
    sky: "#5b6ee1",
    skyBands: [
      [150, "#639bff"],
      [330, "#8fc1ff"],
      [500, "#cbdbfc"],
    ],
    sun: "#fbf236",
    sunX: 190,
    sunY: 300,
    sunR: 60,
    cloud: "#ffffff",
    lov: "#9badb7",
    lovS: "#847e87",
    dur: "#306082",
    durS: "#3f3f74",
    snow: "#ffffff",
    navy: "#222034",
    plat: "#37946e",
    pine: "#4b692f",
    canyon: "#4b692f",
    canyonS: "#323c39",
    river: "#5fcde4",
    bridge: "#eec39a",
    hill: "#6abe30",
    hillPine: "#37946e",
    ground: "#d9a066",
    wall: "#eec39a",
    roof: "#ac3232",
    metal: "#9badb7",
    stone: "#8f563b",
    walls: ["#eec39a", "#ffffff", "#d9a066", "#cbdbfc"],
    roofs: ["#ac3232", "#df7126"],
    meadow: "#99e550",
    meadow2: "#6abe30",
  };
  const pal = [
    ...new Set(
      Object.values(C)
        .flat(2)
        .filter((v) => typeof v === "string" && v[0] === "#"),
    ),
  ];
  const cols = 240,
    rows = 300; // one sample per 6 px cell; the canvas stays this small and CSS scales it up
  return rasterLayers(
    flatScene(C),
    (d, g, li) => {
      const q = quantize(d, pal);
      const img = g.createImageData(cols, rows),
        px = img.data,
        P2 = pal.map(hex);
      for (let n = 0; n < q.length; n++) {
        const k = q[n];
        if (k < 0) continue;
        const c = P2[k];
        px[n * 4] = c[0];
        px[n * 4 + 1] = c[1];
        px[n * 4 + 2] = c[2];
        px[n * 4 + 3] = 255;
      }
      g.putImageData(img, 0, 0);
      if (li === 0) {
        g.fillStyle = "#639bff";
        for (let i = 0; i < cols; i += 2) g.fillRect(i, 24, 1, 1);
        g.fillStyle = "#8fc1ff";
        for (let i = 1; i < cols; i += 2) g.fillRect(i, 54, 1, 1);
        g.fillStyle = "#cbdbfc";
        for (let i = 0; i < cols; i += 2) g.fillRect(i, 82, 1, 1);
        g.fillStyle = "#222034";
        [
          [163, 70],
          [168, 67],
          [173, 71],
        ].forEach(([x, y]) => {
          g.fillRect(x, y, 1, 1);
          g.fillRect(x + 1, y + 1, 1, 1);
          g.fillRect(x + 2, y, 1, 1);
        });
      }
    },
    { sw: cols, sh: rows, ow: cols, oh: rows },
  );
}
