/* Skin 'paper' (generated from styles.js:stylePaper by port.py) */
import {
  BASE,
  DUR,
  H,
  LAYER,
  LOV,
  MAUS,
  OVERLAY,
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

export default function stylePaper() {
  const R = regions();
  const sh = 'filter="url(#ps)"';
  let s = `<defs><filter id="ps" x="-5%" y="-5%" width="110%" height="120%"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#2b3a4a" flood-opacity="0.32"/></filter>
  <filter id="tex"><feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" seed="9"/><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 0.35 -0.1"/></filter>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd6ef"/><stop offset="0.4" stop-color="#d4eef7"/></linearGradient></defs>`;
  s += `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  s += `<circle cx="1290" cy="200" r="62" fill="#ffd166" ${sh}/>`;
  const cloud = (x, y, k) =>
    `<g ${sh} fill="#fff"><ellipse cx="${x}" cy="${y}" rx="${70 * k}" ry="${24 * k}"/><circle cx="${x - 25 * k}" cy="${y - 14 * k}" r="${26 * k}"/><circle cx="${x + 18 * k}" cy="${y - 22 * k}" r="${32 * k}"/></g>`;
  s += cloud(140, 300, 1.0) + cloud(1120, 120, 0.7) + cloud(1340, 330, 0.8);
  s += LAYER;
  s += `<g ${sh}>` + poly(R.lov, 'fill="#a9c1d6"');
  shadowFaces(LOV, BASE + 30).forEach((f) => (s += poly(f, 'fill="#93aecb"')));
  const m = mausoleumShapes(MAUS.cx, MAUS.gy, 1.25);
  s +=
    poly(m.terrace, 'fill="#fff"') +
    poly(m.wingL, 'fill="#fff"') +
    poly(m.wingR, 'fill="#fff"') +
    poly(m.center, 'fill="#6b7fa3"') +
    "</g>";
  s += `<g ${sh}>` + poly(R.dur, 'fill="#86a8c8"');
  shadowFaces(DUR, BASE + 30).forEach((f) => (s += poly(f, 'fill="#6f90b5"')));
  snowCaps(DUR, 34).forEach((f) => (s += poly(f, 'fill="#ffffff"')));
  s += "</g>";
  s += LAYER;
  s +=
    `<g ${sh}>` +
    poly(R.plateau, 'fill="#6fb07a"') +
    pinesSvg(plateauPines(), "#4c9a66") +
    "</g>";
  s +=
    `<g ${sh}>` +
    poly(R.canyon, 'fill="#4f8d63"') +
    `<path d="M560 935 Q590 900 620 935" fill="#7cc6e8"/>` +
    "</g>";
  s += `<g ${sh}>` + bridgeSvg("#ffffff", 7, "#ffffff", 3) + "</g>";
  s += LAYER;
  s +=
    `<g ${sh}>` +
    poly(R.hill, 'fill="#9bd07f"') +
    pinesSvg(townPines(), "#5aa970") +
    "</g>";
  s += `<g ${sh}>` + poly(R.ground, 'fill="#c8e7a0"') + "</g>";
  s +=
    `<g ${sh}>` +
    monasterySvg({
      wall: "#ffffff",
      roof: "#ff8a65",
      metal: "#8aa2c4",
      stone: "#e9cf9f",
      ink: "none",
      cross: "#ffc94a",
      fresco: "#6b8fd0",
    }) +
    "</g>";
  s +=
    `<g ${sh}>` +
    housesSvg({
      walls: ["#fff4dc", "#ffe0e0", "#dcefff", "#ffffff"],
      roof: ["#ff8a65", "#f26d5b"],
      block: "#ffffff",
      win: "#7aa7d9",
      ink: "none",
    }) +
    "</g>";
  s +=
    `<g ${sh}>` +
    plantSvg({
      tower: "#dcdde6",
      chim: "#ffffff",
      band: "#ff6b5b",
      hall: "#eef0f6",
      plume: "#ffffff",
      ink: "none",
    }) +
    "</g>";
  s += `<g ${sh}>` + poly(R.river, 'fill="#7cc6e8"') + "</g>";
  s += `<g ${sh}>` + poly(R.meadow, 'fill="#b4df84"') + "</g>";
  s += OVERLAY("normal");
  s += `<rect width="${W}" height="${H}" filter="url(#tex)" opacity="0.45"/>`;
  return s;
}
