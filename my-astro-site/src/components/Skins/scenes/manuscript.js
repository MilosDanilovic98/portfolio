/* Skin 'manuscript' (generated from styles4.js:styleManuscript by port.py) */
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
  plantSvg,
  plateauPines,
  poly,
  regions,
  riverY,
  rnd,
  setSeed,
  shadowFaces,
  snowCaps,
  thick,
  townPines,
} from "./common.js";

export default function styleManuscript() {
  const R = regions();
  const ink = "#3a2a1a",
    gold = "#c99a34",
    lap = "#1f4aa0",
    ver = "#c8372d";
  const o = (f, w = 2) =>
    `fill="${f}" stroke="${ink}" stroke-width="${w}" stroke-linejoin="round"`;
  let s = `<defs>
  <linearGradient id="gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b8862a"/><stop offset=".35" stop-color="#f0d27a"/><stop offset=".6" stop-color="#d0a03e"/><stop offset="1" stop-color="#f3dc8a"/></linearGradient>
  <pattern id="dia" width="44" height="44" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="44" height="44" fill="url(#gl)"/><path d="M0 0 H44 M0 0 V44" stroke="#8a6420" stroke-width="1.6" opacity=".6"/><circle cx="22" cy="22" r="3" fill="${ver}" opacity=".8"/></pattern>
  <filter id="parch"><feTurbulence type="fractalNoise" baseFrequency=".008" numOctaves="4" seed="21"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .36  0 0 0 0 .18  0 0 0 .55 -.15"/></filter>
  <clipPath id="mini"><rect x="70" y="100" width="${W - 140}" height="${H - 170}"/></clipPath></defs>`;
  s += `<rect width="${W}" height="${H}" fill="#ecdcb0"/>`;
  let sc = `<rect width="${W}" height="680" fill="url(#dia)"/>`;
  sc +=
    `<circle cx="1280" cy="220" r="46" ${o(gold, 2.5)}/>` +
    Array.from({ length: 16 }, (_, k) => {
      const a = (k * Math.PI) / 8;
      return `<line x1="${1280 + Math.cos(a) * 52}" y1="${220 + Math.sin(a) * 52}" x2="${1280 + Math.cos(a) * (k % 2 ? 66 : 80)}" y2="${220 + Math.sin(a) * (k % 2 ? 66 : 80)}" stroke="${ver}" stroke-width="3"/>`;
    }).join("");
  const ledges = (r, n, c) => {
    let t = "";
    for (let k = 1; k <= n; k++)
      t += `<polyline points="${P(r.map(([x, y], i) => [x, lerp(y, BASE + 30, k / (n + 1)) + (i % 2 ? 6 : -4)]))}" fill="none" stroke="${c}" stroke-width="3" opacity=".75"/>`;
    return t;
  };
  sc += poly(R.lov, o("#b08a5a", 2.5)) + ledges(LOV, 4, "#f2e0b8");
  const m = mausoleumShapes(MAUS.cx, MAUS.gy, 1.4);
  [m.terrace, m.wingL, m.wingR].forEach(
    (q) => (sc += poly(q, o("#f3e6c2", 1.6))),
  );
  sc += poly(m.center, o(ver, 1.6));
  sc += poly(R.dur, o("#7f9a86", 2.5)) + ledges(DUR, 6, "#e8f0e0");
  shadowFaces(DUR, BASE + 30).forEach(
    (f) => (sc += poly(f, 'fill="#4f6a5a" opacity=".55"')),
  );
  snowCaps(DUR, 34).forEach((f) => (sc += poly(f, o("#fbf6ea", 2))));
  sc += poly(R.plateau, o("#4f7a3f", 2.5));
  const tree = (t, k) =>
    `<line x1="${t.x}" y1="${t.y + 2}" x2="${t.x}" y2="${t.y - t.h * 0.4}" stroke="${ink}" stroke-width="2.5"/><circle cx="${t.x}" cy="${t.y - t.h * 0.7}" r="${t.w * 0.85}" ${o(["#2f5a2a", "#3f7a32", "#5a8a3a"][k % 3], 1.6)}/><circle cx="${t.x - t.w * 0.3}" cy="${t.y - t.h * 0.8}" r="${t.w * 0.22}" fill="#e8d88a" opacity=".6"/>`;
  plateauPines().forEach((t, k) => (sc += tree(t, k)));
  sc +=
    poly(R.canyon, o("#6a5a3a", 2.5)) +
    `<path d="M558 935 Q590 896 622 935 Z" ${o(lap, 2)}/>`;
  sc += bridgeSvg(ink, 11, ink, 5) + bridgeSvg("#f3e6c2", 6, "#f3e6c2", 2);
  sc += poly(R.hill, o("#6f8f4a", 2.5));
  townPines().forEach((t, k) => (sc += tree(t, k + 1)));
  sc += poly(R.ground, o("#c9a46a", 2));
  sc += thick(
    monasterySvg({
      wall: "#f3e6c2",
      roof: ver,
      metal: lap,
      stone: "#d9b47a",
      ink,
      cross: gold,
      fresco: lap,
    }),
    2,
  );
  sc += thick(
    housesSvg({
      walls: ["#f3e6c2", "#ecd8a8", "#f3e6c2", "#e6cfa0"],
      roof: [ver, "#8a3a2a"],
      block: "#f0e2bc",
      win: ink,
      ink,
    }),
    1.8,
  );
  sc += thick(
    plantSvg({
      tower: "#bfb29a",
      chim: "#f3e6c2",
      band: ver,
      hall: "#e6dac0",
      plume: "#f6eeda",
      ink,
    }),
    1.8,
  );
  sc += poly(R.river, o(lap, 2.5));
  for (let x = 0; x < W; x += 60)
    sc += `<path d="M${x} ${riverY + 2} q15 -8 30 0 t30 0" fill="none" stroke="#e6eefa" stroke-width="2"/>`;
  sc += poly(R.meadow, o("#5f8a3f", 2.5));
  setSeed(6);
  for (let k = 0; k < 60; k++) {
    const x = rnd() * W,
      y = 1520 + rnd() * 260,
      c = [ver, "#f3e6c2", lap][k % 3];
    sc +=
      [0, 1, 2]
        .map(
          (q) =>
            `<circle cx="${x + Math.cos(q * 2.09 - 1.57) * 5}" cy="${y + Math.sin(q * 2.09 - 1.57) * 5}" r="4" fill="${c}"/>`,
        )
        .join("") + `<circle cx="${x}" cy="${y}" r="2" fill="${gold}"/>`;
  }
  s += `<g clip-path="url(#mini)">${sc}</g>`;
  s += `<rect x="70" y="100" width="${W - 140}" height="${H - 170}" fill="none" stroke="${gold}" stroke-width="8"/><rect x="62" y="92" width="${W - 124}" height="${H - 154}" fill="none" stroke="${ver}" stroke-width="2"/><rect x="80" y="110" width="${W - 160}" height="${H - 190}" fill="none" stroke="${lap}" stroke-width="2"/>`;
  // vine border
  let v = "";
  const along = (x0, y0, x1, y1, n) => {
    for (let k = 0; k <= n; k++) {
      const t = k / n,
        x = lerp(x0, x1, t),
        y = lerp(y0, y1, t),
        c = [ver, lap, "#3f7a32"][k % 3];
      v += `<ellipse cx="${x}" cy="${y}" rx="7" ry="12" fill="${c}" stroke="${ink}" stroke-width="1" transform="rotate(${k * 37} ${x} ${y})"/><circle cx="${x + 10}" cy="${y + 8}" r="3" fill="${gold}"/>`;
    }
  };
  along(30, 70, 30, H - 30, 46);
  along(W - 30, 70, W - 30, H - 30, 46);
  along(30, H - 30, W - 30, H - 30, 36);
  s +=
    `<path d="M30 70 V${H - 30} H${W - 30} V70" fill="none" stroke="#3f7a32" stroke-width="2.5"/>` +
    v;
  s += `<rect width="${W}" height="${H}" filter="url(#parch)" style="mix-blend-mode:multiply"/>`;
  return s;
}
