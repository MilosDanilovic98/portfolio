/* Skin 'monoline' (generated from styles5.js:styleMono by port.py) */
import {
  BASE,
  DUR,
  H,
  LAYER,
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
  thick,
  townPines,
} from "./common.js";

export default function styleMono() {
  const R = regions();
  const ink = "#1c1c1c",
    bg = "#fafaf7",
    acc = "#ff5a36";
  const ln = (w = 1.6) =>
    `fill="${bg}" stroke="${ink}" stroke-width="${w}" stroke-linejoin="round"`;
  let s = `<rect width="${W}" height="${H}" fill="${bg}"/>`;
  s += `<circle cx="1220" cy="250" r="54" fill="${acc}"/>`;
  s += `<line x1="1110" y1="330" x2="1330" y2="330" stroke="${ink}" stroke-width="1.6"/><line x1="1150" y1="346" x2="1290" y2="346" stroke="${ink}" stroke-width="1.6"/>`;
  s += LAYER;
  s += poly(R.lov, ln());
  const m = mausoleumShapes(MAUS.cx, MAUS.gy, 1.4);
  [m.terrace, m.wingL, m.wingR, m.center].forEach(
    (q) => (s += poly(q, ln(1.3))),
  );
  s += poly(R.dur, ln(1.8));
  shadowFaces(DUR, BASE + 30).forEach(
    (f) =>
      (s += `<polyline points="${P(f.slice(0, -2))}" fill="none" stroke="${ink}" stroke-width="1"/>`),
  );
  snowCaps(DUR, 34).forEach(
    (f) =>
      (s += `<polyline points="${P(f.slice(3))}" fill="none" stroke="${ink}" stroke-width="1"/>`),
  );
  s += LAYER;
  s += poly(R.plateau, ln());
  s += plateauPines()
    .filter((_, k) => k % 3 === 0)
    .map(
      (t) =>
        `<path d="M${t.x} ${t.y} V${t.y - t.h} M${t.x - t.w * 0.6} ${t.y - t.h * 0.35} L${t.x} ${t.y - t.h} L${t.x + t.w * 0.6} ${t.y - t.h * 0.35}" fill="none" stroke="${ink}" stroke-width="1.2"/>`,
    )
    .join("");
  s +=
    poly(R.canyon, ln()) +
    `<path d="M560 935 Q590 900 620 935" fill="none" stroke="${acc}" stroke-width="2"/>`;
  s += bridgeSvg(bg, 7, bg, 3) + bridgeSvg(ink, 1.6, ink, 1);
  s += LAYER;
  s += poly(R.hill, ln());
  s += townPines()
    .filter((_, k) => k % 2 === 0)
    .map(
      (t) =>
        `<path d="M${t.x} ${t.y} V${t.y - t.h} M${t.x - t.w * 0.6} ${t.y - t.h * 0.35} L${t.x} ${t.y - t.h} L${t.x + t.w * 0.6} ${t.y - t.h * 0.35}" fill="none" stroke="${ink}" stroke-width="1.2"/>`,
    )
    .join("");
  s += poly(R.ground, ln(1.2));
  s += thick(
    monasterySvg({
      wall: bg,
      roof: bg,
      metal: bg,
      stone: bg,
      ink,
      cross: acc,
      fresco: bg,
      neon: true,
    }),
    1.4,
  ).replace(/fill="#1c1c1c" opacity="0.8"/g, `fill="none"`);
  s += thick(
    housesSvg({
      walls: [bg],
      roof: [bg],
      block: bg,
      win: ink,
      ink,
      neon: true,
    }),
    1.3,
  );
  s += thick(
    plantSvg({ tower: bg, chim: bg, band: acc, hall: bg, plume: "none", ink }),
    1.3,
  );
  s += poly(R.river, ln(1.4));
  s += poly(R.meadow, ln(1.4));
  for (let k = 0; k < 6; k++)
    s += `<path d="M${100 + k * 210} ${1600 + (k % 2) * 60} q30 -20 60 0" fill="none" stroke="${ink}" stroke-width="1.2"/>`;
  return s;
}
