/* Skin 'topo' (generated from styles4.js:styleTopo by port.py) */
import { H, P, W, bridge, peaks, rnd, setSeed } from "./common.js";
import { contours } from "d3-contour";

export default function styleTopo() {
  const cell = 6,
    cols = W / cell,
    rows = H / cell;
  const peaks = [
    [200, 400, 1300, 110],
    [300, 330, 1500, 90],
    [390, 420, 1700, 80],
    [470, 350, 1900, 75],
    [560, 460, 1400, 100],
    [150, 560, 1100, 140],
    [640, 320, 1200, 120],
    [330, 540, 900, 160],
    [1150, 330, 900, 190],
    [1290, 470, 700, 160],
    [1020, 520, 500, 150],
    [260, 1050, 600, 220],
    [520, 1250, 500, 200],
    [800, 1050, 450, 190],
  ];
  const canyon = [
    [820, -20],
    [760, 300],
    [700, 620],
    [560, 820],
    [300, 900],
    [-20, 960],
  ];
  const seg = (px, py, a, b) => {
    const dx = b[0] - a[0],
      dy = b[1] - a[1],
      t = Math.max(
        0,
        Math.min(
          1,
          ((px - a[0]) * dx + (py - a[1]) * dy) / (dx * dx + dy * dy),
        ),
      );
    return Math.hypot(px - a[0] - t * dx, py - a[1] - t * dy);
  };
  const dC = (x, y) => {
    let d = 1e9;
    for (let i = 0; i < canyon.length - 1; i++)
      d = Math.min(d, seg(x, y, canyon[i], canyon[i + 1]));
    return d;
  };
  const hgt = (x, y) => {
    let h =
      780 +
      60 * Math.sin(x * 0.011 + y * 0.004) +
      40 * Math.sin(x * 0.023 - y * 0.017) +
      25 * Math.sin(y * 0.05 + x * 0.01);
    for (const [px, py, a, s] of peaks)
      h += a * Math.exp(-((x - px) ** 2 + (y - py) ** 2) / (2 * s * s));
    h -= 650 * Math.exp(-(dC(x, y) ** 2) / (2 * 38 * 38));
    h -= 200 * Math.exp(-((x - 1180) ** 2 + (y - 1560) ** 2) / (2 * 260 * 260));
    return h;
  };
  const vals = new Float64Array(cols * rows);
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) vals[j * cols + i] = hgt(i * cell, j * cell);
  const th = [];
  for (let t = 300; t <= 2700; t += 100) th.push(t);
  const cs = contours().size([cols, rows]).thresholds(th)(vals);
  const ramp = [
    [300, "#b9dcc4"],
    [700, "#cfe3b0"],
    [1000, "#e6e2b0"],
    [1300, "#e3cf9a"],
    [1600, "#d6b488"],
    [1900, "#c9a38a"],
    [2200, "#e2d6cc"],
    [2500, "#f6f2ec"],
  ];
  const col = (v) => {
    for (let i = ramp.length - 1; i >= 0; i--)
      if (v >= ramp[i][0]) return ramp[i][1];
    return ramp[0][1];
  };
  const path = (mp) =>
    mp.coordinates
      .map((pg) =>
        pg
          .map(
            (ring) =>
              "M" +
              ring
                .map(
                  ([x, y]) =>
                    `${(x * cell).toFixed(1)} ${(y * cell).toFixed(1)}`,
                )
                .join("L") +
              "Z",
          )
          .join(""),
      )
      .join("");
  let s = `<defs><pattern id="tg" width="180" height="180" patternUnits="userSpaceOnUse"><path d="M180 0H0V180" fill="none" stroke="#3a6fa8" stroke-opacity=".25" stroke-width="1"/></pattern>
  <filter id="pp"><feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="4" seed="5"/><feColorMatrix values="0 0 0 0 .55  0 0 0 0 .45  0 0 0 0 .3  0 0 0 .18 -.02"/></filter></defs>`;
  s += `<rect width="${W}" height="${H}" fill="#b9dcc4"/>`;
  cs.forEach((c) => (s += `<path d="${path(c)}" fill="${col(c.value)}"/>`));
  cs.forEach(
    (c) =>
      (s += `<path d="${path(c)}" fill="none" stroke="#8a5a3a" stroke-opacity="${c.value % 500 ? 0.45 : 0.8}" stroke-width="${c.value % 500 ? 0.8 : 1.6}"/>`),
  );
  s += `<rect width="${W}" height="${H}" fill="url(#tg)"/>`;
  // rivers and lake
  s += `<polyline points="${P(canyon)}" fill="none" stroke="#2f7fc8" stroke-width="5" stroke-linejoin="round"/>`;
  s += `<path d="M1460 1330 C1300 1400 1320 1480 1200 1520 S1000 1600 960 1700 S880 1790 860 1820" fill="none" stroke="#2f7fc8" stroke-width="4"/>`;
  s += `<ellipse cx="135" cy="660" rx="34" ry="20" fill="#7fb6e0" stroke="#2f7fc8" stroke-width="2"/>`;
  // trail
  s += `<path d="M1150 1560 C1000 1480 940 1300 900 1150 S760 760 700 620 S520 520 470 360" fill="none" stroke="#d6322d" stroke-width="3.5" stroke-dasharray="10 7"/>`;
  // bridge symbol
  s += `<g transform="translate(700,620) rotate(-55)"><rect x="-30" y="-7" width="60" height="14" fill="#fff" stroke="#222" stroke-width="2"/><line x1="-30" y1="-12" x2="30" y2="-12" stroke="#222" stroke-width="2"/><line x1="-30" y1="12" x2="30" y2="12" stroke="#222" stroke-width="2"/></g>`;
  // town
  setSeed(61);
  for (let k = 0; k < 140; k++) {
    const a = rnd() * 6.28,
      r = Math.sqrt(rnd()) * 150;
    const x = 1180 + Math.cos(a) * r * 1.3,
      y = 1590 + Math.sin(a) * r * 0.75;
    s += `<rect x="${x}" y="${y}" width="${6 + rnd() * 8}" height="${5 + rnd() * 6}" fill="#5a4a46" transform="rotate(${-20 + rnd() * 40} ${x} ${y})"/>`;
  }
  s += `<circle cx="1010" cy="1470" r="13" fill="#fff" stroke="#222" stroke-width="2"/><path d="M1010 1462 v16 M1004 1468 h12" stroke="#222" stroke-width="2.5"/>`;
  s += `<rect x="1352" y="1640" width="8" height="40" fill="#222"/><circle cx="1356" cy="1632" r="6" fill="none" stroke="#222" stroke-width="2"/>`;
  s += `<text x="1290" y="1520" font-family="Oswald" font-size="18" fill="#222">⚒</text>`;
  // labels
  const T = (x, y, t, sz, f = "#3a2a1a", ls = 6, w = 700, it = "") =>
    `<text x="${x}" y="${y}" font-family="Oswald" font-weight="${w}" font-size="${sz}" fill="${f}" letter-spacing="${ls}" text-anchor="middle" ${it} stroke="#f4f0e6" stroke-width="4" paint-order="stroke">${t}</text>`;
  s += T(390, 610, "DURMITOR", 30, "#5a3a1a", 18);
  s += T(1180, 640, "LJUBIŠNJA", 22, "#5a3a1a", 12);
  s += `<text font-family="Oswald" font-size="20" font-style="italic" fill="#2f7fc8" letter-spacing="8" stroke="#f4f0e6" stroke-width="4" paint-order="stroke"><textPath href="#tp">TARA</textPath></text><path id="tp" d="M330 872 L540 806" fill="none"/>`;
  s += T(1250, 1500, "PLJEVLJA", 34, "#222", 10);
  s +=
    T(470, 336, "▲ Bobotov kuk 2523", 15, "#3a2a1a", 1, 500) +
    T(135, 702, "Crno jezero", 14, "#2f7fc8", 1, 500, 'font-style="italic"');
  s +=
    T(700, 676, "Most na Đurđevića Tari", 14, "#222", 1, 500) +
    T(1010, 1450, "Sv. Trojica", 14, "#222", 1, 500) +
    T(1356, 1700, "TE Pljevlja", 13, "#222", 1, 500);
  s += `<rect width="${W}" height="${H}" filter="url(#pp)" style="mix-blend-mode:multiply"/>`;
  // compass
  s += `<g transform="translate(1340,170)"><circle r="46" fill="#f4f0e6" stroke="#3a2a1a" stroke-width="1.5"/><polygon points="0,-40 9,0 0,40 -9,0" fill="#3a2a1a"/><polygon points="0,-40 9,0 -9,0" fill="#d6322d"/><text y="-50" font-family="Oswald" font-size="16" text-anchor="middle" fill="#3a2a1a">N</text></g>`;
  return s;
}
