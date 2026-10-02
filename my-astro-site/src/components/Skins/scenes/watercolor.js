/* Skin 'watercolor' (generated from styles.js:styleWatercolor by port.py) */
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
  plantSvg,
  plateauPines,
  poly,
  regions,
  shadowFaces,
  snowCaps,
  townPines,
} from "./common.js";

export default function styleWatercolor() {
  const R = regions();
  const ink = "#2b2a28";
  const wc = 'filter="url(#wc)" style="mix-blend-mode:multiply"';
  const ik = `fill="none" stroke="${ink}" stroke-width="1.8" stroke-linejoin="round" filter="url(#ink)"`;
  let s = `<defs>
  <filter id="wc" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="18" result="d"/><feGaussianBlur in="d" stdDeviation="1.4"/></filter>
  <filter id="ink"><feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3"/></filter>
  <filter id="paper"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" seed="2"/><feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.48  0 0 0 0 0.38  0 0 0 0.22 -0.05"/></filter>
  <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="7" stroke="${ink}" stroke-width="1" opacity="0.55"/></pattern>
  </defs>`;
  s += `<rect width="${W}" height="${H}" fill="#f6f0e2"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#paper)"/>`;
  // sky washes
  s += `<g ${wc} opacity="0.55"><ellipse cx="400" cy="200" rx="520" ry="160" fill="#9cc6e3"/><ellipse cx="1100" cy="140" rx="460" ry="140" fill="#a9cfe8"/><ellipse cx="1080" cy="420" rx="300" ry="90" fill="#f3c9a1"/></g>`;
  s += `<circle cx="1300" cy="200" r="50" fill="#f2c45a" ${wc} opacity="0.8"/><circle cx="1300" cy="200" r="50" ${ik}/>`;
  s += LAYER;
  s += `<g opacity="0.75">` + poly(R.lov, `fill="#b7c4a8" ${wc}`) + "</g>";
  shadowFaces(LOV, BASE + 30).forEach(
    (f) => (s += poly(f, 'fill="url(#hatch)"')),
  );
  s += `<polyline points="${P(LOV)}" ${ik}/>`;
  const m = mausoleumShapes(MAUS.cx, MAUS.gy, 1.25);
  s +=
    poly(m.terrace, 'fill="#f6f0e2"') +
    poly(m.wingL, 'fill="#f6f0e2"') +
    poly(m.wingR, 'fill="#f6f0e2"') +
    poly(m.center, `fill="#7d7f8c" ${wc}`);
  [m.terrace, m.wingL, m.wingR, m.center].forEach(
    (q) => (s += poly(q, ik.replace("1.8", "1.3"))),
  );
  s += `<g opacity="0.8">` + poly(R.dur, `fill="#a7b4cc" ${wc}`) + "</g>";
  shadowFaces(DUR, BASE + 30).forEach((f) => {
    s +=
      `<g opacity="0.6">` +
      poly(f, `fill="#7f8fb2" ${wc}`) +
      "</g>" +
      poly(f, 'fill="url(#hatch)"');
  });
  snowCaps(DUR, 34).forEach(
    (f) => (s += poly(f, 'fill="#f6f0e2" opacity="0.92"')),
  );
  s += `<polyline points="${P(DUR)}" ${ik}/>`;
  s += LAYER;
  s += poly(R.plateau, 'fill="#f6f0e2"');
  s += `<g opacity="0.75">` + poly(R.plateau, `fill="#8fb38a" ${wc}`) + "</g>";
  s += `<polyline points="${P(R.plateau.slice(0, -2))}" ${ik}/>`;
  plateauPines().forEach(
    (t) =>
      (s += `<path d="M${t.x} ${t.y - t.h} L${t.x - t.w} ${t.y} M${t.x} ${t.y - t.h} L${t.x + t.w} ${t.y} M${t.x} ${t.y - t.h} L${t.x} ${t.y + 3}" ${ik.replace("1.8", "1.2")}/>`),
  );
  s +=
    `<g opacity="0.7">` +
    poly(R.canyon, `fill="#b59d80" ${wc}`) +
    "</g>" +
    poly(R.canyon, ik);
  s += `<path d="M560 935 Q590 900 620 935" fill="#8cc3d8" ${wc}/>`;
  s += bridgeSvg("#f6f0e2", 7, "#f6f0e2", 3);
  s += bridgeSvg(ink, 1.6, ink, 1, 'filter="url(#ink)"');
  s += LAYER;
  s += poly(R.hill, 'fill="#f6f0e2"');
  s += `<g opacity="0.7">` + poly(R.hill, `fill="#a9c58e" ${wc}`) + "</g>";
  s += `<polyline points="${P(R.hill.slice(0, -2))}" ${ik}/>`;
  townPines().forEach(
    (t) =>
      (s += `<polygon points="${P([
        [t.x - t.w, t.y + 2],
        [t.x + t.w, t.y + 2],
        [t.x, t.y - t.h],
      ])}" fill="#7da57a" ${wc} opacity="0.7"/><path d="M${t.x} ${t.y - t.h} L${t.x - t.w} ${t.y} M${t.x} ${t.y - t.h} L${t.x + t.w} ${t.y}" ${ik.replace("1.8", "1.2")}/>`),
  );
  s += `<g opacity="0.6">` + poly(R.ground, `fill="#d9c79a" ${wc}`) + "</g>";
  s += monasterySvg({
    wall: "#f6f0e2",
    roof: "#d98a6a",
    metal: "#8e95a8",
    stone: "#d7c29a",
    ink,
    cross: "#d4a43a",
    fresco: "#6f8fc0",
    wc: true,
  });
  s += housesSvg({
    walls: ["#f6f0e2", "#f3e2bf", "#f6f0e2", "#efd8c4"],
    roof: ["#d98a6a", "#c0705a"],
    block: "#f6f0e2",
    win: ink,
    ink,
    wc: true,
  });
  s += plantSvg({
    tower: "#cfc8b8",
    chim: "#f6f0e2",
    band: "#d9705a",
    hall: "#ece4d2",
    plume: "#f6f0e2",
    ink,
    wc: true,
  });
  s += `<g opacity="0.75">` + poly(R.river, `fill="#8cc3d8" ${wc}`) + "</g>";
  s += `<g opacity="0.6">` + poly(R.meadow, `fill="#c7d48f" ${wc}`) + "</g>";
  for (let k = 0; k < 40; k++) {
    const x = (k * 37) % 1440,
      y = 1540 + ((k * 53) % 240);
    s += `<path d="M${x} ${y} l3 -10 M${x + 5} ${y} l-1 -12 M${x + 9} ${y} l-4 -9" ${ik.replace("1.8", "1")}/>`;
  }
  return s;
}
