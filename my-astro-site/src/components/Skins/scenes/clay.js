/* Skin 'clay' (generated from styles3.js:styleClay by port.py) */
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
  rnd,
  setSeed,
  shadowFaces,
  snowCaps,
  townPines,
} from "./common.js";

export default function styleClay() {
  const R = regions();
  const cl = 'filter="url(#clay)"';
  const rp = (pts, f, w = 18) =>
    `<polygon points="${P(pts)}" fill="${f}" stroke="${f}" stroke-width="${w}" stroke-linejoin="round"/>`;
  let s = `<defs>
  <filter id="clay" x="-10%" y="-10%" width="120%" height="140%" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceAlpha" stdDeviation="9" result="b"/>
    <feSpecularLighting in="b" surfaceScale="7" specularConstant=".75" specularExponent="16" lighting-color="#ffffff" result="sp"><feDistantLight azimuth="225" elevation="48"/></feSpecularLighting>
    <feComposite in="sp" in2="SourceAlpha" operator="in" result="spi"/>
    <feGaussianBlur in="SourceAlpha" stdDeviation="7" result="b2"/><feOffset in="b2" dx="-7" dy="-9" result="o"/>
    <feComposite in="SourceAlpha" in2="o" operator="out" result="inner"/>
    <feFlood flood-color="#4a2f6b" flood-opacity=".22"/><feComposite in2="inner" operator="in" result="innerS"/>
    <feGaussianBlur in="SourceAlpha" stdDeviation="12"/><feOffset dy="14"/><feComponentTransfer result="ds"><feFuncA type="linear" slope=".22"/></feComponentTransfer>
    <feMerge><feMergeNode in="ds"/><feMergeNode in="SourceGraphic"/><feMergeNode in="innerS"/><feMergeNode in="spi"/></feMerge>
  </filter>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe2ff"/><stop offset=".35" stop-color="#fde6f1"/></linearGradient></defs>`;
  s += `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  s += `<circle cx="1260" cy="210" r="66" fill="#ffd27a" ${cl}/>`;
  const cloud = (x, y, k) =>
    `<g ${cl}><circle cx="${x - 40 * k}" cy="${y}" r="${30 * k}" fill="#fff"/><circle cx="${x}" cy="${y - 18 * k}" r="${42 * k}" fill="#fff"/><circle cx="${x + 44 * k}" cy="${y}" r="${30 * k}" fill="#fff"/><rect x="${x - 70 * k}" y="${y}" width="${140 * k}" height="${30 * k}" rx="${15 * k}" fill="#fff"/></g>`;
  s += cloud(160, 300, 1.1) + cloud(1340, 380, 0.8);
  s += LAYER;
  s += `<g ${cl}>` + rp(R.lov, "#9ec5f0");
  shadowFaces(LOV, BASE + 30).forEach(
    (f) => (s += poly(f, 'fill="#86b0e0" opacity=".8"')),
  );
  const m = mausoleumShapes(MAUS.cx, MAUS.gy, 1.4);
  [m.terrace, m.wingL, m.wingR].forEach((q) => (s += rp(q, "#ffffff", 5)));
  s += rp(m.center, "#ff9fb5", 5);
  s += "</g>";
  s += `<g ${cl}>` + rp(R.dur, "#b3a5ee");
  shadowFaces(DUR, BASE + 30).forEach(
    (f) => (s += poly(f, 'fill="#9a8ae0" opacity=".85"')),
  );
  snowCaps(DUR, 34).forEach((f) => (s += rp(f, "#ffffff", 8)));
  s += "</g>";
  s += LAYER;
  s += `<g ${cl}>` + rp(R.plateau, "#9bdba0") + "</g>";
  s +=
    `<g ${cl}>` +
    plateauPines()
      .map((t) =>
        rp(
          [
            [t.x - t.w, t.y],
            [t.x + t.w, t.y],
            [t.x, t.y - t.h],
          ],
          "#6cc283",
          6,
        ),
      )
      .join("") +
    "</g>";
  s +=
    `<g ${cl}>` +
    rp(R.canyon, "#7fcf92") +
    `<path d="M560 935 Q590 900 620 935" fill="#8fd6f0"/></g>`;
  s += `<g ${cl}>` + bridgeSvg("#ffffff", 12, "#ffffff", 6) + "</g>";
  s += LAYER;
  s += `<g ${cl}>` + rp(R.hill, "#b5e6a6") + "</g>";
  s +=
    `<g ${cl}>` +
    townPines()
      .map((t) =>
        rp(
          [
            [t.x - t.w, t.y],
            [t.x + t.w, t.y],
            [t.x, t.y - t.h],
          ],
          "#7ccf8c",
          7,
        ),
      )
      .join("") +
    "</g>";
  s += `<g ${cl}>` + rp(R.ground, "#ffe2b8") + "</g>";
  s +=
    `<g ${cl}>` +
    monasterySvg({
      wall: "#ffffff",
      roof: "#ff9f9f",
      metal: "#a5b8f0",
      stone: "#ffd9a0",
      ink: "none",
      cross: "#ffc94a",
      fresco: "#a5b8f0",
    }) +
    "</g>";
  s +=
    `<g ${cl}>` +
    housesSvg({
      walls: ["#ffffff", "#ffe0ec", "#e0ecff", "#fff4d6"],
      roof: ["#ff9f9f", "#c8a5f0"],
      block: "#ffffff",
      win: "#a5b8f0",
      ink: "none",
    }) +
    "</g>";
  s +=
    `<g ${cl}>` +
    plantSvg({
      tower: "#e6e0f5",
      chim: "#ffffff",
      band: "#ff9f9f",
      hall: "#f3eefc",
      plume: "#ffffff",
      ink: "none",
    }) +
    "</g>";
  s += `<g ${cl}>` + rp(R.river, "#8fd6f0") + "</g>";
  s += `<g ${cl}>` + rp(R.meadow, "#c7efa8") + "</g>";
  setSeed(9);
  let fl = "";
  for (let k = 0; k < 30; k++) {
    const x = rnd() * W,
      y = 1560 + rnd() * 200,
      c = ["#ff9fb5", "#ffd27a", "#c8a5f0", "#ffffff"][k % 4];
    fl += `<circle cx="${x}" cy="${y}" r="${8 + rnd() * 6}" fill="${c}"/>`;
  }
  s += `<g ${cl}>${fl}</g>`;
  return s;
}
