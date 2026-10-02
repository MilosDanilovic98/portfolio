/* Skin 'ukiyoe' (generated from styles3.js:styleUkiyoe by port.py) */
import {
  BASE,
  DUR,
  H,
  LAYER,
  MAUS,
  OVERLAY,
  P,
  W,
  bridgeSvg,
  housesSvg,
  mausoleumShapes,
  monasterySvg,
  plantSvg,
  plateauPines,
  poly,
  regions,
  shadowFaces,
  snowCaps,
  townPines,
} from "./common.js";

export default function styleUkiyoe() {
  const R = regions();
  const ink = "#2a2420",
    paper = "#efe4cc";
  const o = (f, w = 1.6) =>
    `fill="${f}" stroke="${ink}" stroke-width="${w}" stroke-linejoin="round"`;
  let s = `<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f3f66"/><stop offset=".14" stop-color="#4f7398"/><stop offset=".33" stop-color="${paper}"/></linearGradient>
  <linearGradient id="gd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f4a6b"/><stop offset=".55" stop-color="#7f95a6"/><stop offset="1" stop-color="#d7d6c6"/></linearGradient>
  <linearGradient id="gds" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c2f48"/><stop offset="1" stop-color="#5f7489" stop-opacity=".6"/></linearGradient>
  <linearGradient id="gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4f6f62"/><stop offset="1" stop-color="#d6d4bf"/></linearGradient>
  <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f6249"/><stop offset=".6" stop-color="#7b9566"/></linearGradient>
  <linearGradient id="gh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5d7f50"/><stop offset=".5" stop-color="#a3ad7a"/></linearGradient>
  <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5c5a40"/><stop offset="1" stop-color="#2b3a4a"/></linearGradient>
  <pattern id="sei" width="40" height="20" patternUnits="userSpaceOnUse" patternTransform="scale(2)"><rect width="40" height="20" fill="#86a06e"/>${[0, 40, 20].map((cx, k) => [18, 13, 8, 3].map((r, q) => `<circle cx="${cx}" cy="${k === 2 ? 10 : 20}" r="${r}" fill="${q % 2 ? "#a3b47f" : "#87a06c"}" stroke="${ink}" stroke-width=".4"/>`).join("")).join("")}</pattern>
  <pattern id="wav" width="60" height="26" patternUnits="userSpaceOnUse"><rect width="60" height="26" fill="#2b5d8a"/><path d="M0 18 q15 -14 30 0 t30 0" fill="none" stroke="#e9e2cf" stroke-width="2"/><path d="M8 18 q7 -7 14 0" fill="none" stroke="#e9e2cf" stroke-width="1.2"/></pattern>
  <filter id="fib"><feTurbulence type="fractalNoise" baseFrequency=".02 .5" numOctaves="3" seed="8"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .38  0 0 0 0 .28  0 0 0 .35 -.08"/></filter></defs>`;
  s += `<rect width="${W}" height="${H}" fill="${paper}"/><rect width="${W}" height="660" fill="url(#sky)"/>`;
  s += `<circle cx="200" cy="300" r="70" fill="#c8402f"/>`;
  const mist = (x, y, w, h, c) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${c}" stroke="${ink}" stroke-width="1"/>`;
  s += LAYER;
  s += poly(R.lov, o("url(#gl)"));
  const m = mausoleumShapes(MAUS.cx, MAUS.gy, 1.3);
  [m.terrace, m.wingL, m.wingR].forEach((q) => (s += poly(q, o(paper, 1.1))));
  s += poly(m.center, o("#2b3a4a", 1.1));
  s += poly(R.dur, o("url(#gd)", 2));
  shadowFaces(DUR, BASE + 30).forEach(
    (f) => (s += poly(f, 'fill="url(#gds)" opacity=".7"')),
  );
  snowCaps(DUR, 40).forEach((f) => (s += poly(f, o("#f6f1e4", 1.3))));
  s += `<polyline points="${P(DUR)}" fill="none" stroke="${ink}" stroke-width="2"/>`;
  s +=
    mist(-60, 560, 520, 34, "#f0d9c4") +
    mist(820, 590, 700, 30, paper) +
    mist(380, 520, 300, 22, "#f0d9c4") +
    mist(1100, 430, 380, 20, "#f6e7d2");
  s += LAYER;
  s += poly(R.plateau, o("url(#gp)", 1.8));
  plateauPines().forEach((t) => {
    for (let k = 0; k < 3; k++) {
      const h = t.h * (1 - k * 0.28),
        w = t.w * (1 - k * 0.22),
        y = t.y - k * t.h * 0.3;
      s += `<polygon points="${P([
        [t.x - w, y],
        [t.x + w, y],
        [t.x, y - h * 0.55],
      ])}" ${o("#22392c", 0.8)}/>`;
    }
  });
  s +=
    poly(R.canyon, o("url(#gc)", 1.8)) +
    `<path d="M558 935 Q590 896 622 935 Z" fill="url(#wav)" stroke="${ink}"/>`;
  s += bridgeSvg(ink, 11, ink, 5) + bridgeSvg("#efe4cc", 6, "#efe4cc", 2);
  s += LAYER;
  s += poly(R.hill, o("url(#gh)", 1.8));
  townPines().forEach((t) => {
    for (let k = 0; k < 3; k++) {
      const h = t.h * (1 - k * 0.28),
        w = t.w * (1 - k * 0.22),
        y = t.y - k * t.h * 0.3;
      s += `<polygon points="${P([
        [t.x - w, y],
        [t.x + w, y],
        [t.x, y - h * 0.55],
      ])}" ${o("#2f4a35", 0.8)}/>`;
    }
  });
  s += poly(R.ground, o("#d8c49a", 1.4));
  s += monasterySvg({
    wall: "#f3ead6",
    roof: "#a8432f",
    metal: "#4b6a8a",
    stone: "#c9b28a",
    ink,
    cross: "#c99a2e",
    fresco: "#2b5d8a",
  });
  s += housesSvg({
    walls: ["#f3ead6", "#e8d9b8", "#f3ead6", "#e2cfa8"],
    roof: ["#a8432f", "#5d4a3a"],
    block: "#ece2cc",
    win: ink,
    ink,
  });
  s += plantSvg({
    tower: "#bdb6a2",
    chim: "#f3ead6",
    band: "#a8432f",
    hall: "#e4d9c0",
    plume: "#f6efe0",
    ink,
  });
  s += poly(R.river, `fill="url(#wav)" stroke="${ink}" stroke-width="1.6"`);
  s += poly(R.meadow, `fill="url(#sei)" stroke="${ink}" stroke-width="1.6"`);
  s += mist(-40, 1520, 600, 40, "#f0d9c4") + mist(900, 1640, 620, 36, paper);
  s += OVERLAY("multiply");
  s += `<rect width="${W}" height="${H}" filter="url(#fib)" style="mix-blend-mode:multiply"/>`;
  return s;
}
