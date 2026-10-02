/* Skin 'aero' (generated from styles5.js:styleAero by port.py) */
import {
  BASE,
  DUR,
  H,
  LAYER,
  MAUS,
  W,
  bridgeSvg,
  housesSvg,
  mausoleumShapes,
  monasterySvg,
  pinesSvg,
  plantSvg,
  plateauPines,
  plateauTop,
  poly,
  regions,
  rnd,
  setSeed,
  shadowFaces,
  snowCaps,
  townHillY,
  townPines,
} from "./common.js";

export default function styleAero() {
  const R = regions();
  let s = `<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f7fe0"/><stop offset=".22" stop-color="#5fb4ff"/><stop offset=".37" stop-color="#d8f2ff"/></linearGradient>
  <radialGradient id="fl" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset=".25" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <radialGradient id="bb" cx=".35" cy=".3" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".25" stop-color="#e8f8ff" stop-opacity=".35"/><stop offset=".85" stop-color="#9fdcff" stop-opacity=".15"/><stop offset="1" stop-color="#fff" stop-opacity=".7"/></radialGradient>
  <linearGradient id="gm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe0ff"/><stop offset=".6" stop-color="#5f9ad8"/></linearGradient>
  <linearGradient id="gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8f0ff"/><stop offset=".7" stop-color="#7fb8e0"/></linearGradient>
  <linearGradient id="gg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a8f06a"/><stop offset=".25" stop-color="#5fd03a"/><stop offset="1" stop-color="#2f9a2a"/></linearGradient>
  <linearGradient id="gg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c8ff8a"/><stop offset=".2" stop-color="#7ae04a"/><stop offset="1" stop-color="#3aa832"/></linearGradient>
  <linearGradient id="gw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bff4ff"/><stop offset="1" stop-color="#1fa8e0"/></linearGradient>
  <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>`;
  s += `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  s += `<circle cx="1180" cy="170" r="240" fill="url(#fl)"/><circle cx="1180" cy="170" r="46" fill="#fff"/>`;
  [
    [980, 330, 18],
    [880, 400, 9],
    [760, 470, 26],
    [620, 520, 7],
  ].forEach(
    ([x, y, r]) =>
      (s += `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".35"/>`),
  );
  const cloud = (x, y, k) =>
    `<g fill="#fff"><ellipse cx="${x}" cy="${y}" rx="${90 * k}" ry="${30 * k}"/><circle cx="${x - 40 * k}" cy="${y - 16 * k}" r="${34 * k}"/><circle cx="${x + 18 * k}" cy="${y - 34 * k}" r="${46 * k}"/><circle cx="${x + 62 * k}" cy="${y - 10 * k}" r="${28 * k}"/></g>`;
  s += cloud(170, 330, 1.1) + cloud(1320, 420, 0.8) + cloud(560, 120, 0.6);
  setSeed(19);
  for (let k = 0; k < 14; k++) {
    const x = rnd() * W,
      y = 80 + rnd() * 480,
      r = 10 + rnd() * 34;
    s += `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#bb)" stroke="#fff" stroke-opacity=".7" stroke-width="1.2"/>`;
  }
  s += LAYER;
  s += poly(R.lov, 'fill="url(#gl)"');
  const m = mausoleumShapes(MAUS.cx, MAUS.gy, 1.4);
  [m.terrace, m.wingL, m.wingR].forEach((q) => (s += poly(q, 'fill="#fff"')));
  s += poly(m.center, 'fill="#5f9ad8"');
  s += poly(R.dur, 'fill="url(#gm)"');
  shadowFaces(DUR, BASE + 30).forEach(
    (f) => (s += poly(f, 'fill="#4f86c8" opacity=".55"')),
  );
  snowCaps(DUR, 36).forEach((f) => (s += poly(f, 'fill="#fff"')));
  s += LAYER;
  s += poly(R.plateau, 'fill="url(#gg)"');
  s += `<path d="M-10 ${plateauTop(0) + 8} ${Array.from({ length: 30 }, (_, k) => `L${k * 50} ${plateauTop(k * 50) + 8}`).join(" ")} L1450 ${plateauTop(1450) + 40} L-10 ${plateauTop(0) + 40} Z" fill="url(#shine)"/>`;
  s += pinesSvg(plateauPines(), "#2f9a2a");
  s +=
    poly(R.canyon, 'fill="#3aa832"') +
    `<path d="M558 935 Q590 896 622 935 Z" fill="url(#gw)"/>`;
  s += bridgeSvg("#ffffff", 8, "#ffffff", 3.5);
  s += LAYER;
  s += poly(R.hill, 'fill="url(#gg2)"');
  s += `<path d="M-10 ${townHillY(0) + 6} ${Array.from({ length: 30 }, (_, k) => `L${k * 50} ${townHillY(k * 50) + 6}`).join(" ")} L1450 ${townHillY(1450) + 50} L-10 ${townHillY(0) + 50} Z" fill="url(#shine)"/>`;
  s += pinesSvg(townPines(), "#2f9a2a");
  s += poly(R.ground, 'fill="#e8f4ff"');
  s += monasterySvg({
    wall: "#ffffff",
    roof: "#ff6a4a",
    metal: "#5fb4ff",
    stone: "#e8f4ff",
    ink: "none",
    cross: "#ffd23a",
    fresco: "#5fb4ff",
  });
  s += housesSvg({
    walls: ["#ffffff", "#f0f8ff", "#e8f4ff", "#ffffff"],
    roof: ["#ff6a4a", "#1f7fe0", "#3aa832"],
    block: "#ffffff",
    win: "#5fb4ff",
    ink: "none",
  });
  s += plantSvg({
    tower: "#f0f8ff",
    chim: "#ffffff",
    band: "#ff6a4a",
    hall: "#ffffff",
    plume: "#ffffff",
    ink: "none",
  });
  s += poly(R.river, 'fill="url(#gw)"');
  s += poly(R.meadow, 'fill="url(#gg2)"');
  s += `<rect y="1488" width="${W}" height="40" fill="url(#shine)"/>`;
  setSeed(29);
  for (let k = 0; k < 10; k++) {
    const x = rnd() * W,
      y = 1560 + rnd() * 200,
      r = 12 + rnd() * 26;
    s += `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#bb)" stroke="#fff" stroke-opacity=".7"/>`;
  }
  return s;
}
