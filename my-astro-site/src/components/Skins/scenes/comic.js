/* Skin 'comic' (generated from styles4.js:styleComic by port.py) */
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
  mausoleumShapes,
  monasterySvg,
  pinesSvg,
  plantSvg,
  plateauPines,
  poly,
  regions,
  shadowFaces,
  snowCaps,
  thick,
  townPines,
} from "./common.js";

export default function styleComic() {
  const R = regions();
  let defs = "",
    n = 0;
  const dot = (base, dc, r = 2.4, sz = 11) => {
    const id = "cd" + n++;
    defs += `<pattern id="${id}" width="${sz}" height="${sz}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="${sz}" height="${sz}" fill="${base}"/><circle cx="${sz / 2}" cy="${sz / 2}" r="${r}" fill="${dc}"/></pattern>`;
    return `url(#${id})`;
  };
  const o = (f, w = 4) =>
    `fill="${f}" stroke="#000" stroke-width="${w}" stroke-linejoin="round"`;
  let s = "";
  s += `<rect width="${W}" height="${H}" fill="${dot("#eaf8ff", "#9fdcf2", 2.6, 12)}"/>`;
  // burst behind the sun
  let burst = [];
  for (let k = 0; k < 32; k++) {
    const a = (k * Math.PI) / 16,
      r = k % 2 ? 105 : 160;
    burst.push([1260 + Math.cos(a) * r, 210 + Math.sin(a) * r]);
  }
  s += `<polygon points="${P(burst)}" ${o("#fff3a8", 3)}/>`;
  s += `<circle cx="1260" cy="210" r="72" ${o(dot("#ffe14d", "#ff9f1c", 3, 10), 5)}/>`;
  const cloud = (x, y, k) =>
    `<path d="M${x - 80 * k} ${y} q-30 -40 20 -48 q10 -40 60 -26 q30 -30 70 0 q46 -6 40 40 q30 30 -20 34 z" transform="translate(0,0)" ${o("#fff", 4)}/>`;
  s += cloud(150, 300, 1) + cloud(1290, 400, 1);
  s += LAYER;
  s += poly(R.lov, o(dot("#9fe0d4", "#4fb0a0")));
  shadowFaces(LOV, BASE + 30).forEach((f) => (s += poly(f, 'fill="#4fb0a0"')));
  s += poly(R.lov, o("none"));
  const m = mausoleumShapes(MAUS.cx, MAUS.gy, 1.4);
  [m.terrace, m.wingL, m.wingR].forEach((q) => (s += poly(q, o("#fff", 3))));
  s += poly(m.center, o("#ff4b3a", 3));
  s += poly(R.dur, o(dot("#7f9cf0", "#3f5fd0", 2.8)));
  shadowFaces(DUR, BASE + 30).forEach((f) => (s += poly(f, 'fill="#3f5fd0"')));
  snowCaps(DUR, 36).forEach((f) => (s += poly(f, o("#fff", 3.5))));
  s += poly(R.dur, o("none", 5));
  s += LAYER;
  s += poly(R.plateau, o(dot("#8be070", "#3faa4a")));
  s += pinesSvg(
    plateauPines(),
    "#2f9a40",
    'stroke="#000" stroke-width="2.5" stroke-linejoin="round"',
  );
  s +=
    poly(R.canyon, o(dot("#4fb05a", "#2a7a3a", 3))) +
    `<path d="M558 935 Q590 896 622 935 Z" ${o("#3fb8f0", 3)}/>`;
  s += bridgeSvg("#000", 14, "#000", 7) + bridgeSvg("#fff", 7, "#fff", 2.5);
  s += LAYER;
  s += poly(R.hill, o(dot("#b6ea86", "#6cc04a")));
  s += pinesSvg(
    townPines(),
    "#3aa54a",
    'stroke="#000" stroke-width="2.5" stroke-linejoin="round"',
  );
  s += poly(R.ground, o(dot("#ffe08a", "#f5a742", 2.6)));
  s += thick(
    monasterySvg({
      wall: "#fff",
      roof: "#ff4b3a",
      metal: "#5f7ff0",
      stone: "#ffd27a",
      ink: "#000",
      cross: "#ffe14d",
      fresco: "#5f7ff0",
    }),
    3,
  );
  s += thick(
    housesSvg({
      walls: ["#fff", "#ffd9e0", "#d9ecff", "#fff4c2"],
      roof: ["#ff4b3a", "#ff8a1c"],
      block: "#fff",
      win: "#000",
      ink: "#000",
    }),
    3,
  );
  s += thick(
    plantSvg({
      tower: "#e0e0e0",
      chim: "#fff",
      band: "#ff4b3a",
      hall: "#fff",
      plume: "#fff",
      ink: "#000",
    }),
    3,
  );
  s += poly(R.river, o("#3fb8f0"));
  s += poly(R.meadow, o(dot("#d4f590", "#9ad65a", 3)));
  // speed lines at the bottom
  for (let k = 0; k < 18; k++)
    s += `<line x1="${k * 85}" y1="${1800}" x2="${720 + (k * 85 - 720) * 0.25}" y2="${1560}" stroke="#000" stroke-width="2" opacity=".18"/>`;
  return `<defs>${defs}</defs>` + s;
}
