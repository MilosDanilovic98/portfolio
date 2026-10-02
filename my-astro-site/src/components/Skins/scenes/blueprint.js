/* Skin 'blueprint' (generated from styles2.js:styleBlueprint by port.py) */
import {
  BASE,
  DUR,
  H,
  LOV,
  MAUS,
  P,
  W,
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
  riverY,
  shadowFaces,
  snowCaps,
  townPines,
} from "./common.js";

export default function styleBlueprint() {
  const R = regions();
  const L = "#e8f1ff";
  const ln = (w = 1.6, extra = "") =>
    `fill="none" stroke="${L}" stroke-width="${w}" stroke-linejoin="round" ${extra}`;
  let s = `<defs>
  <pattern id="g1" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#fff" stroke-opacity=".08"/></pattern>
  <pattern id="g2" width="120" height="120" patternUnits="userSpaceOnUse"><path d="M120 0H0V120" fill="none" stroke="#fff" stroke-opacity=".16"/></pattern>
  <pattern id="bh" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="${L}" stroke-opacity=".45" stroke-width="1"/></pattern>
  <radialGradient id="vig" cx=".5" cy=".4" r=".8"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient>
  <marker id="ar" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 1 L10 5 L0 9 z" fill="${L}"/></marker></defs>`;
  s += `<rect width="${W}" height="${H}" fill="#1b4f8f"/><rect width="${W}" height="${H}" fill="url(#g1)"/><rect width="${W}" height="${H}" fill="url(#g2)"/>`;
  // contour lines
  const contours = (r, n) => {
    let c = "";
    for (let k = 1; k <= n; k++)
      c += `<polyline points="${P(r.map(([x, y]) => [x, lerp(y, BASE + 30, k / (n + 1)) + 4 * Math.sin(x * 0.03 + k)]))}" ${ln(0.8, 'stroke-opacity=".45" stroke-dasharray="6 5"')}/>`;
    return c;
  };
  s += poly(R.lov, `fill="#1b4f8f"`) + contours(LOV, 4);
  shadowFaces(LOV, BASE + 30).forEach((f) => (s += poly(f, 'fill="url(#bh)"')));
  s += `<polyline points="${P(LOV)}" ${ln(2)}/>`;
  const m = mausoleumShapes(MAUS.cx, MAUS.gy, 1.4);
  [m.terrace, m.wingL, m.wingR, m.center, m.door].forEach(
    (q) =>
      (s += poly(q, `fill="#1b4f8f" ${ln(1.4).replace('fill="none"', "")}`)),
  );
  s += poly(R.dur, `fill="#1b4f8f"`) + contours(DUR, 5);
  shadowFaces(DUR, BASE + 30).forEach((f) => (s += poly(f, 'fill="url(#bh)"')));
  snowCaps(DUR, 34).forEach(
    (f) =>
      (s += poly(
        f,
        `fill="#1b4f8f" ${ln(1.2, 'stroke-dasharray="4 3"').replace('fill="none"', "")}`,
      )),
  );
  s += `<polyline points="${P(DUR)}" ${ln(2.2)}/>`;
  s +=
    poly(R.plateau, `fill="#1b4f8f"`) +
    `<polyline points="${P(R.plateau.slice(0, -2))}" ${ln(1.8)}/>`;
  s += pinesSvg(
    plateauPines(),
    "none",
    `stroke="${L}" stroke-width="1" stroke-opacity=".75"`,
  );
  s += poly(R.canyon, `fill="url(#bh)" ${ln(1.8).replace('fill="none"', "")}`);
  s += bridgeSvg("#1b4f8f", 8, "#1b4f8f", 3) + bridgeSvg(L, 2, L, 1);
  s += `<polyline points="${P(R.hill.slice(0, -2))}" ${ln(1.8)}/>`;
  s += pinesSvg(
    townPines(),
    "none",
    `stroke="${L}" stroke-width="1" stroke-opacity=".75"`,
  );
  s += `<polyline points="${P(R.ground.slice(1, -2))}" ${ln(1.2, 'stroke-dasharray="10 6"')}/>`;
  const ob = {
    tower: "#1b4f8f",
    wall: "#1b4f8f",
    roof: "#1b4f8f",
    metal: "#1b4f8f",
    stone: "#1b4f8f",
    ink: L,
    cross: L,
    fresco: "url(#bh)",
    neon: true,
  };
  s += monasterySvg(ob);
  s += housesSvg({
    walls: ["#1b4f8f"],
    roof: ["url(#bh)"],
    block: "#1b4f8f",
    win: L,
    ink: L,
    neon: true,
  });
  s += plantSvg({
    tower: "#1b4f8f",
    chim: "#1b4f8f",
    band: "url(#bh)",
    hall: "#1b4f8f",
    plume: "none",
    ink: L,
  });
  s += `<polyline points="${P(R.river.slice(0, R.river.length / 2))}" ${ln(1.6)}/><polyline points="${P(R.river.slice(R.river.length / 2))}" ${ln(1.6)}/>`;
  for (let k = 0; k < 5; k++)
    s += `<path d="M-10 ${riverY + k * 9} q60 -6 120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0" ${ln(0.8, 'stroke-opacity=".4"')}/>`;
  // dimensions and callouts
  const T = (x, y, t, a = "middle", sz = 14) =>
    `<text x="${x}" y="${y}" fill="${L}" font-family="PlexMono" font-size="${sz}" text-anchor="${a}" letter-spacing="1.5">${t}</text>`;
  s += `<line x1="300" y1="652" x2="880" y2="652" ${ln(1, 'marker-start="url(#ar)" marker-end="url(#ar)"')}/><line x1="300" y1="640" x2="300" y2="684" ${ln(1)}/><line x1="880" y1="640" x2="880" y2="684" ${ln(1)}/>`;
  s +=
    `<rect x="534" y="640" width="112" height="22" fill="#1b4f8f"/>` +
    T(590, 657, "365.0 m");
  s +=
    `<line x1="470" y1="790" x2="710" y2="790" ${ln(1, 'stroke-dasharray="3 3" marker-start="url(#ar)" marker-end="url(#ar)"')}/>` +
    T(590, 812, "MAIN ARCH 116 m", "middle", 12);
  s += T(60, 372, "▲ 2313 — SAVIN KUK", "start", 12);
  s += T(1284, 336, "LOVĆEN 1657 · NJEGOŠ MAUSOLEUM", "middle", 12);
  s +=
    `<line x1="1278" y1="1215" x2="1278" y2="1025" ${ln(1, 'marker-start="url(#ar)" marker-end="url(#ar)"')}/>` +
    T(1290, 1120, "250 m", "start", 12);
  s +=
    `<line x1="250" y1="820" x2="250" y2="770" ${ln(1)}/><circle cx="250" cy="752" r="18" ${ln(1.4)}/>` +
    T(250, 757, "C", "middle", 14) +
    T(276, 757, "SV. TROJICA · 1592", "start", 12);
  s +=
    `<circle cx="140" cy="600" r="18" ${ln(1.4)}/>` +
    T(140, 605, "A") +
    T(166, 605, "DURMITOR", "start", 12);
  s +=
    `<circle cx="960" cy="720" r="18" ${ln(1.4)}/>` +
    T(960, 725, "B") +
    T(986, 725, "TARA CANYON", "start", 12);
  s += `<rect width="${W}" height="${H}" fill="url(#vig)"/>`;
  return s;
}
