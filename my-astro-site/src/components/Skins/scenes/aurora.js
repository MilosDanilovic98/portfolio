/* Skin 'aurora' (generated from styles3.js:styleAurora by port.py) */
import {
  DUR,
  H,
  LAYER,
  LOV,
  MAUS,
  P,
  W,
  bridge,
  bridgeSvg,
  housesSvg,
  mausoleumShapes,
  monasterySvg,
  pinesSvg,
  plantSvg,
  plateauPines,
  poly,
  regions,
  riverY,
  rnd,
  setSeed,
  snowCaps,
  townPines,
} from "./common.js";

export default function styleAurora() {
  const R = regions();
  const glow = 'filter="url(#gl)"';
  let s = `<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#02040f"/><stop offset=".33" stop-color="#0a1433"/><stop offset=".37" stop-color="#14204a"/></linearGradient>
  <filter id="au" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="28"/></filter>
  <filter id="gl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="md" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#25365f"/><stop offset=".5" stop-color="#0d1530"/></linearGradient>
  <linearGradient id="ml" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d3a52"/><stop offset=".6" stop-color="#0b1426"/></linearGradient>
  <linearGradient id="a1" x1="0" x2="1"><stop offset="0" stop-color="#2affb0" stop-opacity="0"/><stop offset=".3" stop-color="#2affb0"/><stop offset=".7" stop-color="#2ad4ff"/><stop offset="1" stop-color="#7b5cff" stop-opacity="0"/></linearGradient>
  <linearGradient id="a2" x1="0" x2="1"><stop offset="0" stop-color="#7b5cff" stop-opacity="0"/><stop offset=".4" stop-color="#b44cff"/><stop offset=".8" stop-color="#2affb0"/><stop offset="1" stop-color="#2affb0" stop-opacity="0"/></linearGradient></defs>`;
  s += `<rect width="${W}" height="${H}" fill="#04081a"/><rect width="${W}" height="700" fill="url(#sky)"/>`;
  setSeed(17);
  for (let k = 0; k < 260; k++)
    s += `<circle cx="${rnd() * W}" cy="${rnd() * 620}" r="${0.4 + rnd() * 1.3}" fill="#fff" opacity="${0.2 + rnd() * 0.8}"/>`;
  s += `<g filter="url(#au)" style="mix-blend-mode:screen" opacity=".85"><path d="M-100 260 C200 120 420 380 720 230 S1200 120 1560 260" stroke="url(#a1)" stroke-width="110" fill="none"/><path d="M-100 380 C300 260 560 470 880 330 S1300 300 1560 420" stroke="url(#a2)" stroke-width="80" fill="none" opacity=".8"/><path d="M200 120 C500 60 800 180 1300 80" stroke="url(#a1)" stroke-width="50" fill="none" opacity=".6"/></g>`;
  s += `<circle cx="1260" cy="160" r="38" fill="#f4f1e6" ${glow}/><circle cx="1276" cy="150" r="34" fill="#0a1433"/>`;
  s += LAYER;
  s +=
    poly(R.lov, 'fill="url(#ml)"') +
    `<polyline points="${P(LOV)}" fill="none" stroke="#7fb8d8" stroke-width="1.6" opacity=".7"/>`;
  const m = mausoleumShapes(MAUS.cx, MAUS.gy, 1.3);
  [m.terrace, m.wingL, m.wingR, m.center].forEach(
    (q) =>
      (s += poly(
        q,
        'fill="#0b1426" stroke="#7fb8d8" stroke-width="1" stroke-opacity=".6"',
      )),
  );
  s += `<circle cx="${MAUS.cx}" cy="${MAUS.gy - 14}" r="2.5" fill="#ffd27a" ${glow}/>`;
  s += poly(R.dur, 'fill="url(#md)"');
  snowCaps(DUR, 34).forEach(
    (f) => (s += poly(f, 'fill="#9fb4e8" opacity=".45"')),
  );
  s += `<polyline points="${P(DUR)}" fill="none" stroke="#9fc3ff" stroke-width="1.8" opacity=".75"/>`;
  s += LAYER;
  s += poly(R.plateau, 'fill="#070e20"') + pinesSvg(plateauPines(), "#040917");
  s +=
    poly(R.canyon, 'fill="#040814"') +
    `<path d="M560 935 Q590 900 620 935" fill="#1b4a6a"/>`;
  s += bridgeSvg("#1c2a52", 6, "#16224a", 2.5);
  const b = bridge();
  for (let x = b.deck.x0 + 10; x < b.deck.x1; x += 29)
    s += `<circle cx="${x}" cy="${b.deck.y - 8}" r="2.4" fill="#ffd27a" ${glow}/>`;
  s += LAYER;
  s += poly(R.hill, 'fill="#08102a"') + pinesSvg(townPines(), "#050a1c");
  s += poly(R.ground, 'fill="#0a1328"');
  s +=
    `<g ${glow}>` +
    monasterySvg({
      wall: "#1c2647",
      roof: "#141c38",
      metal: "#24305a",
      stone: "#141c38",
      ink: "none",
      cross: "#ffd27a",
      fresco: "#ffd27a",
      neon: true,
    }).replace(/fill="#8a7a62"|fill="#5b4330"/g, 'fill="#ffd27a"') +
    "</g>";
  s += housesSvg({
    walls: ["#141c38", "#18213f", "#121a33"],
    roof: ["#0c1228"],
    block: "#18213f",
    win: "#ffcf6b",
    ink: "none",
    neon: true,
  });
  s += `<g ${glow}><circle cx="1250" cy="1028" r="3" fill="#ff4d4d"/><circle cx="1250" cy="1090" r="3" fill="#ff4d4d"/></g>`;
  s += plantSvg({
    tower: "#18213f",
    chim: "#1c2647",
    band: "#3a2440",
    hall: "#141c38",
    plume: "#2a3660",
    ink: "none",
  });
  s += poly(R.river, 'fill="#14285a"');
  for (let k = 0; k < 12; k++)
    s += `<rect x="${80 + k * 115}" y="${riverY - 4 + (k % 3) * 5}" width="${40 + (k % 4) * 15}" height="2" fill="#2affb0" opacity=".35"/>`;
  s += poly(R.meadow, 'fill="#060c1e"');
  setSeed(23);
  for (let k = 0; k < 40; k++)
    s += `<circle cx="${rnd() * W}" cy="${1520 + rnd() * 260}" r="${1.5 + rnd() * 1.5}" fill="#e8ff8a" opacity="${0.4 + rnd() * 0.6}" ${glow}/>`;
  return s;
}
