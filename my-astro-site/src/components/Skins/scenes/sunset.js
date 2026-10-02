/* Skin 'sunset' (generated from styles5.js:styleSunset by port.py) */
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
  pines,
  pinesSvg,
  plantSvg,
  plateauPines,
  poly,
  regions,
  setSeed,
  shadowFaces,
  snowCaps,
  townPines,
} from "./common.js";

export default function styleSunset() {
  const R = regions();
  let s = `<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8714a"/><stop offset=".18" stop-color="#f39a5b"/><stop offset=".32" stop-color="#fbc77a"/><stop offset=".38" stop-color="#fde3a7"/></linearGradient>
  <radialGradient id="sg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff6d8"/><stop offset=".35" stop-color="#fff1c9" stop-opacity=".85"/><stop offset="1" stop-color="#fde3a7" stop-opacity="0"/></radialGradient>
  <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbc77a" stop-opacity="0"/><stop offset="1" stop-color="#fbc77a" stop-opacity=".55"/></linearGradient>
  <linearGradient id="haze2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e38a6a" stop-opacity="0"/><stop offset="1" stop-color="#e38a6a" stop-opacity=".45"/></linearGradient>
  <linearGradient id="rv" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a2f3d"/><stop offset=".5" stop-color="#f6a65a"/><stop offset="1" stop-color="#7a2f3d"/></linearGradient></defs>`;
  s += `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  s += `<circle cx="1080" cy="470" r="260" fill="url(#sg)"/><circle cx="1080" cy="470" r="92" fill="#fff4d6"/>`;
  const bird = (x, y, k) =>
    `<path d="M${x - 12 * k} ${y} q${6 * k} ${-7 * k} ${12 * k} 0 q${6 * k} ${-7 * k} ${12 * k} 0" fill="none" stroke="#7a2f3d" stroke-width="${2.2 * k}" stroke-linecap="round"/>`;
  s +=
    bird(260, 220, 1.2) +
    bird(300, 245, 0.9) +
    bird(1220, 300, 1) +
    bird(1180, 330, 0.8);
  s += LAYER;
  s += poly(R.lov, 'fill="#ec9c74"');
  shadowFaces(LOV, BASE + 30).forEach((f) => (s += poly(f, 'fill="#de8a68"')));
  const m = mausoleumShapes(MAUS.cx, MAUS.gy, 1.4);
  [m.terrace, m.wingL, m.wingR, m.center].forEach(
    (q) => (s += poly(q, 'fill="#c96e5a"')),
  );
  s += `<rect y="430" width="${W}" height="240" fill="url(#haze)"/>`;
  s += poly(R.dur, 'fill="#c4614f"');
  shadowFaces(DUR, BASE + 30).forEach((f) => (s += poly(f, 'fill="#a94f45"')));
  snowCaps(DUR, 34).forEach((f) => (s += poly(f, 'fill="#f3b88a"')));
  s += `<rect y="520" width="${W}" height="160" fill="url(#haze2)"/>`;
  s += LAYER;
  s += poly(R.plateau, 'fill="#8e3b46"') + pinesSvg(plateauPines(), "#7a2f3d");
  s +=
    poly(R.canyon, 'fill="#6d2a3a"') +
    `<path d="M560 935 Q590 900 620 935" fill="#f6a65a"/>`;
  s += bridgeSvg("#5a2234", 7, "#5a2234", 3);
  s += `<rect y="900" width="${W}" height="200" fill="url(#haze2)" opacity=".6"/>`;
  s += LAYER;
  s += poly(R.hill, 'fill="#4f1f33"') + pinesSvg(townPines(), "#3f1729");
  s += poly(R.ground, 'fill="#3a1630"');
  s += monasterySvg({
    wall: "#2e1128",
    roof: "#2e1128",
    metal: "#2e1128",
    stone: "#2e1128",
    ink: "none",
    cross: "#ffcf7a",
    fresco: "#ffcf7a",
    neon: true,
  }).replace(/fill="#8a7a62"|fill="#5b4330"/g, 'fill="#ffcf7a"');
  s += housesSvg({
    walls: ["#2e1128", "#341430"],
    roof: ["#24101f"],
    block: "#341430",
    win: "#ffcf7a",
    ink: "none",
    neon: true,
  });
  s += plantSvg({
    tower: "#2e1128",
    chim: "#2e1128",
    band: "#5a2234",
    hall: "#2e1128",
    plume: "#c96e5a",
    ink: "none",
  });
  s += poly(R.river, 'fill="url(#rv)"');
  s += poly(R.meadow, 'fill="#24101f"');
  setSeed(12);
  s += pinesSvg(
    pines(-10, 1450, (x) => 1560 + 30 * Math.sin(x * 0.01), 40, 90, 34),
    "#1a0a16",
  );
  return s;
}
