/* Skin 'neobrutal' (generated from styles2.js:styleNeo by port.py) */
import {
  BASE,
  DUR,
  H,
  LAYER,
  LOV,
  MAUS,
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
  townPines,
} from "./common.js";

export default function styleNeo() {
  const R = regions();
  const K = "#000";
  const o = (fill) =>
    `fill="${fill}" stroke="${K}" stroke-width="3.5" stroke-linejoin="round"`;
  const hs = 'filter="url(#hs)"';
  let s = `<defs><filter id="hs" x="-5%" y="-5%" width="115%" height="120%"><feFlood flood-color="#000"/><feComposite in2="SourceAlpha" operator="in"/><feOffset dx="7" dy="7" result="s"/><feMerge><feMergeNode in="s"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="14" cy="14" r="2" fill="#000" opacity=".18"/></pattern></defs>`;
  s += `<rect width="${W}" height="${H}" fill="#bfe6ff"/><rect width="${W}" height="660" fill="url(#dots)"/>`;
  s += `<g ${hs}><circle cx="1255" cy="215" r="68" ${o("#ffdc58")}/></g>`;
  for (let k = 0; k < 10; k++) {
    const a = (k * Math.PI) / 5;
    s += `<line x1="${1255 + Math.cos(a) * 92}" y1="${215 + Math.sin(a) * 92}" x2="${1255 + Math.cos(a) * 118}" y2="${215 + Math.sin(a) * 118}" stroke="#000" stroke-width="7" stroke-linecap="round"/>`;
  }
  const cloud = (x, y, k) =>
    `<g ${hs}><path d="M${x - 80 * k} ${y} h${160 * k} a${26 * k} ${26 * k} 0 0 0 -${30 * k} -${34 * k} a${34 * k} ${34 * k} 0 0 0 -${62 * k} -${10 * k} a${28 * k} ${28 * k} 0 0 0 -${68 * k} ${44 * k} z" ${o("#fff")}/></g>`;
  s += cloud(150, 300, 1.1) + cloud(1340, 380, 0.8);
  s += LAYER;
  s += `<g ${hs}>` + poly(R.lov, o("#90a8ff"));
  shadowFaces(LOV, BASE + 30).forEach((f) => (s += poly(f, 'fill="#6f86e6"')));
  s += poly(R.lov, `fill="none" stroke="${K}" stroke-width="3.5"`) + "</g>";
  const m = mausoleumShapes(MAUS.cx, MAUS.gy, 1.4);
  [m.terrace, m.wingL, m.wingR].forEach((q) => (s += poly(q, o("#fff"))));
  s += poly(m.center, o("#ff6b6b"));
  s += `<g ${hs}>` + poly(R.dur, o("#b49bff"));
  shadowFaces(DUR, BASE + 30).forEach((f) => (s += poly(f, 'fill="#8b6cf0"')));
  snowCaps(DUR, 34).forEach(
    (f) => (s += poly(f, `fill="#fff" stroke="${K}" stroke-width="3"`)),
  );
  s += poly(R.dur, `fill="none" stroke="${K}" stroke-width="3.5"`) + "</g>";
  s += LAYER;
  s += `<g ${hs}>` + poly(R.plateau, o("#a3e636")) + "</g>";
  s += pinesSvg(
    plateauPines(),
    "#3fae5a",
    `stroke="${K}" stroke-width="2.5" stroke-linejoin="round"`,
  );
  s +=
    poly(R.canyon, o("#5cc46c")) +
    poly(
      [
        [420, 760],
        [500, 850],
        [560, 935],
        [590, 935],
        [520, 840],
        [450, 760],
      ],
      'fill="#3e9e52"',
    );
  s += `<path d="M558 935 Q590 896 622 935 Z" ${o("#4ecdc4")}/>`;
  s += bridgeSvg("#000", 14, "#000", 7) + bridgeSvg("#fff", 7, "#fff", 2.5);
  s += LAYER;
  s += `<g ${hs}>` + poly(R.hill, o("#7fdc6a")) + "</g>";
  s += pinesSvg(
    townPines(),
    "#2f9e55",
    `stroke="${K}" stroke-width="2.5" stroke-linejoin="round"`,
  );
  s += poly(R.ground, o("#ffe58a"));
  const ob = {
    wall: "#ffffff",
    roof: "#ff6b6b",
    metal: "#90a8ff",
    stone: "#ffdc58",
    ink: K,
    cross: "#ffdc58",
    fresco: "#90a8ff",
  };
  s += `<g ${hs}>` + monasterySvg(ob) + "</g>";
  s +=
    `<g ${hs}>` +
    housesSvg({
      walls: ["#fff", "#ffa6f6", "#90a8ff", "#ffdc58"],
      roof: ["#ff6b6b", "#ff9f43"],
      block: "#fff",
      win: K,
      ink: K,
    }) +
    "</g>";
  s +=
    `<g ${hs}>` +
    plantSvg({
      tower: "#e0e0e0",
      chim: "#fff",
      band: "#ff6b6b",
      hall: "#fff",
      plume: "#fff",
      ink: K,
    }) +
    "</g>";
  s += poly(R.river, o("#4ecdc4"));
  s += poly(R.meadow, o("#c4f06b"));
  for (let k = 0; k < 4; k++)
    s += `<path d="M-10 ${1580 + k * 55} Q720 ${1550 + k * 55} 1450 ${1595 + k * 55}" stroke="#000" stroke-width="3" fill="none" stroke-dasharray="18 14"/>`;
  return s;
}
