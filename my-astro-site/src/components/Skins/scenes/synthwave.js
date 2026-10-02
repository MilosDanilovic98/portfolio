/* Skin 'synthwave' (generated from styles.js:styleSynth by port.py) */
import {
  BASE,
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
  lerp,
  mausoleumShapes,
  monasterySvg,
  pinesSvg,
  plantSvg,
  plateauPines,
  poly,
  regions,
  rnd,
  setSeed,
  townPines,
} from "./common.js";

export default function styleSynth() {
  const R = regions();
  const pink = "#ff3fd2",
    cyan = "#2de2e6",
    yellow = "#ffd319";
  const glow = 'filter="url(#glow)"';
  let s = `<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07001a"/><stop offset="0.18" stop-color="#1c0642"/><stop offset="0.33" stop-color="#4b0d63"/><stop offset="0.38" stop-color="#ff3d81"/></linearGradient>
  <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${yellow}"/><stop offset="1" stop-color="#ff2975"/></linearGradient>
  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <mask id="sunmask"><rect x="0" y="0" width="${W}" height="${H}" fill="#fff"/>${[0, 1, 2, 3, 4, 5, 6].map((k) => `<rect x="0" y="${470 + k * 22 + k * k * 1.2}" width="${W}" height="${3 + k * 2}" fill="#000"/>`).join("")}</mask>
  </defs>`;
  s += `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  s += `<rect y="660" width="${W}" height="${H - 660}" fill="#0a0018"/>`;
  setSeed(13);
  for (let k = 0; k < 160; k++)
    s += `<circle cx="${rnd() * W}" cy="${rnd() * 420}" r="${0.5 + rnd()}" fill="#fff" opacity="${0.3 + rnd() * 0.7}"/>`;
  s += `<circle cx="720" cy="470" r="190" fill="url(#sun)" mask="url(#sunmask)"/>`;
  // mountains: dark fill, neon edges, wireframe
  const wire = (r, col) => {
    let w = "";
    for (const p of r)
      w += `<line x1="${p[0]}" y1="${p[1]}" x2="${lerp(p[0], 720, 0.15)}" y2="${BASE + 20}" stroke="${col}" stroke-width="1" opacity="0.45"/>`;
    for (let k = 1; k <= 3; k++)
      w += `<polyline points="${P(r.map((p) => [p[0], lerp(p[1], BASE + 20, k / 4)]))}" fill="none" stroke="${col}" stroke-width="1" opacity="0.35"/>`;
    return w;
  };
  s += LAYER;
  s +=
    poly(R.lov, 'fill="#10002a"') +
    wire(LOV, cyan) +
    `<polyline points="${P(LOV)}" fill="none" stroke="${cyan}" stroke-width="2.5" ${glow}/>`;
  const m = mausoleumShapes(MAUS.cx, MAUS.gy, 1.25);
  [m.terrace, m.wingL, m.wingR, m.center].forEach(
    (q) =>
      (s += poly(
        q,
        `fill="#10002a" stroke="${cyan}" stroke-width="1.8" ${glow}`,
      )),
  );
  s +=
    poly(R.dur, 'fill="#14002e"') +
    wire(DUR, pink) +
    `<polyline points="${P(DUR)}" fill="none" stroke="${pink}" stroke-width="3" ${glow}/>`;
  // the grid floor
  s += LAYER;
  s += `<rect y="${BASE + 20}" width="${W}" height="${H}" fill="#0a0018"/>`;
  let g = "";
  for (let k = 0; k < 40; k++) {
    const y = BASE + 20 + Math.pow(k, 1.7) * 3.2;
    if (y > H) break;
    g += `<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`;
  }
  for (let k = -24; k <= 24; k++)
    g += `<line x1="${720 + k * 20}" y1="${BASE + 20}" x2="${720 + k * 260}" y2="${H}"/>`;
  s += `<g stroke="${pink}" stroke-width="1.4" opacity="0.55">${g}</g>`;
  // canyon edge + bridge in neon
  s += `<polyline points="${P(R.canyon)}" fill="#05000f" stroke="${cyan}" stroke-width="2" ${glow}/>`;
  s += `<g ${glow}>` + bridgeSvg(cyan, 3, cyan, 1.2) + "</g>";
  s += pinesSvg(
    plateauPines(),
    "none",
    `stroke="${cyan}" stroke-width="1.4" opacity="0.8"`,
  );
  s += LAYER;
  s += `<polyline points="${P(R.hill.slice(0, -2))}" fill="none" stroke="${pink}" stroke-width="2.5" ${glow}/>`;
  s += poly(R.hill, 'fill="#0a0018" opacity="0.6"');
  s +=
    `<g ${glow}>` +
    pinesSvg(townPines(), "none", `stroke="${pink}" stroke-width="1.4"`) +
    "</g>";
  s +=
    `<g ${glow}>` +
    monasterySvg({
      wall: "#120030",
      roof: "#120030",
      metal: "#120030",
      stone: "#120030",
      ink: yellow,
      cross: yellow,
      fresco: pink,
      neon: true,
    }) +
    "</g>";
  s +=
    `<g ${glow}>` +
    housesSvg({
      walls: ["#120030"],
      roof: ["#120030"],
      block: "#120030",
      win: yellow,
      ink: cyan,
      neon: true,
    }) +
    "</g>";
  s +=
    `<g ${glow}>` +
    plantSvg({
      tower: "#120030",
      chim: "#120030",
      band: pink,
      hall: "#120030",
      plume: "none",
      ink: pink,
    }) +
    "</g>";
  s += `<polyline points="${P(R.river.slice(0, R.river.length / 2))}" fill="none" stroke="${cyan}" stroke-width="3" ${glow}/>`;
  return s;
}
