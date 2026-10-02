/* Skin 'lowpoly' (generated from styles.js:styleLowpoly by port.py) */
import {
  BASE,
  DUR,
  H,
  LAYER,
  LOV,
  MAUS,
  P,
  W,
  bridgeSvg,
  housesSvg,
  lowpoly,
  mausoleumShapes,
  mixC,
  monasterySvg,
  plantSvg,
  plateauPines,
  plateauTop,
  poly,
  regions,
  ridgeY,
  riverY,
  rnd,
  setSeed,
  townHillY,
  townPines,
} from "./common.js";

export default function styleLowpoly() {
  const R = regions();
  let s = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1633"/><stop offset="0.25" stop-color="#2a2a5e"/><stop offset="0.42" stop-color="#7a4a7e"/><stop offset="0.55" stop-color="#f0906a"/></linearGradient>
  <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#ffd2a1" stop-opacity="0.9"/><stop offset="1" stop-color="#ffd2a1" stop-opacity="0"/></radialGradient></defs>`;
  s += `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  setSeed(11);
  for (let k = 0; k < 120; k++)
    s += `<circle cx="${rnd() * W}" cy="${rnd() * 300}" r="${0.6 + rnd() * 1.2}" fill="#fff" opacity="${0.3 + rnd() * 0.6}"/>`;
  s += `<circle cx="1000" cy="560" r="220" fill="url(#glow)"/>`;
  s += LAYER;
  s += lowpoly(
    (x) => ridgeY(LOV, x),
    880,
    1470,
    BASE + 30,
    22,
    6,
    (l, y) => mixC("#3b3a6b", "#9b8fc4", l * 1.1),
    21,
  );
  const m = mausoleumShapes(MAUS.cx, MAUS.gy, 1.25);
  s +=
    poly(m.terrace, 'fill="#d8d3ee"') +
    poly(m.wingL, 'fill="#efeaff"') +
    poly(m.wingR, 'fill="#c7c0e6"') +
    poly(m.center, 'fill="#2a2850"');
  s += lowpoly(
    (x) => ridgeY(DUR, x),
    -20,
    1140,
    BASE + 30,
    46,
    8,
    (l, y) =>
      y < 430
        ? mixC("#8f8cc0", "#f4f1ff", l * 1.15)
        : mixC("#2c2e5c", "#7d7fb8", l * 1.15),
    22,
  );
  s += LAYER;
  s += lowpoly(
    plateauTop,
    -10,
    1450,
    1050,
    60,
    6,
    (l) => mixC("#14303a", "#3f7a6e", l * 1.1),
    23,
  );
  setSeed(5);
  plateauPines().forEach((t) => {
    s += `<polygon points="${P([
      [t.x - t.w, t.y + 2],
      [t.x, t.y + 2],
      [t.x, t.y - t.h],
    ])}" fill="#163a3c"/><polygon points="${P([
      [t.x, t.y + 2],
      [t.x + t.w, t.y + 2],
      [t.x, t.y - t.h],
    ])}" fill="#2a5a55"/>`;
  });
  s += poly(R.canyon, 'fill="#10252c"');
  s += bridgeSvg("#e9e4ff", 6, "#c9c2ef", 2.5);
  s += LAYER;
  s += lowpoly(
    townHillY,
    -10,
    1450,
    1800,
    60,
    10,
    (l) => mixC("#173238", "#4f8a72", l * 1.1),
    24,
  );
  townPines().forEach((t) => {
    s += `<polygon points="${P([
      [t.x - t.w, t.y + 2],
      [t.x, t.y + 2],
      [t.x, t.y - t.h],
    ])}" fill="#163a3c"/><polygon points="${P([
      [t.x, t.y + 2],
      [t.x + t.w, t.y + 2],
      [t.x, t.y - t.h],
    ])}" fill="#2f6a60"/>`;
  });
  s += monasterySvg({
    wall: "#efeaff",
    roof: "#c76b6b",
    metal: "#6c6aa6",
    stone: "#b7a98f",
    ink: "none",
    cross: "#ffd27a",
    fresco: "#2a2850",
    facet: true,
    glow: true,
  });
  s += housesSvg({
    walls: ["#d9d4f2", "#c9c3e8", "#e6e1fa", "#b9b2de"],
    roof: ["#a8556a", "#7c4466"],
    block: "#cfc9ec",
    win: "#ffcf7a",
    ink: "none",
    facet: true,
  });
  s += plantSvg({
    tower: "#9a96c4",
    chim: "#d9d4f2",
    band: "#ff7a7a",
    hall: "#bdb7e0",
    plume: "#c9c2ef",
    ink: "none",
  });
  s += poly(R.river, 'fill="#3b6fa3"');
  s += lowpoly(
    (x) => riverY + 14 + 6 * Math.sin(x * 0.01 + 0.6),
    -10,
    1450,
    1810,
    50,
    5,
    (l) => mixC("#1d4740", "#5d9a78", l * 1.1),
    25,
  );
  return s;
}
