/* Skin 'midcentury' (generated from styles4.js:styleMidcentury by port.py) */
import {
  BASE,
  DUR,
  H,
  LAYER,
  LOV,
  MAUS,
  OVERLAY,
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

export default function styleMidcentury() {
  const R = regions();
  const br = "#4a3426",
    cr = "#f2e6cc",
    mu = "#e3a83b",
    te = "#2f7f7a",
    or = "#d9622b",
    ol = "#8a8f3c";
  let s = `<defs><filter id="sp"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="1" seed="7"/><feColorMatrix values="0 0 0 0 .29  0 0 0 0 .2  0 0 0 0 .15  0 0 0 -9 6.2"/></filter></defs>`;
  s += `<rect width="${W}" height="${H}" fill="${cr}"/>`;
  s += `<circle cx="220" cy="300" r="92" fill="${mu}"/>`;
  const star = (x, y, r, c) =>
    `<path d="M${x} ${y - r} L${x + r * 0.16} ${y - r * 0.16} L${x + r} ${y} L${x + r * 0.16} ${y + r * 0.16} L${x} ${y + r} L${x - r * 0.16} ${y + r * 0.16} L${x - r} ${y} L${x - r * 0.16} ${y - r * 0.16}Z" fill="${c}"/>`;
  s +=
    star(1150, 180, 34, or) +
    star(1300, 300, 22, te) +
    star(120, 140, 18, te) +
    star(1040, 120, 14, br) +
    star(1380, 120, 16, mu);
  const boom = (x, y, c) =>
    `<path d="M${x} ${y} q60 -50 130 -10 q-40 -10 -60 30 q-20 -30 -70 -20z" fill="${c}"/>`;
  s += boom(60, 430, te) + boom(1230, 400, or);
  s += LAYER;
  s += poly(R.lov, `fill="#c98b3a"`);
  shadowFaces(LOV, BASE + 30).forEach((f) => (s += poly(f, `fill="#a86f2a"`)));
  const m = mausoleumShapes(MAUS.cx, MAUS.gy, 1.4);
  [m.terrace, m.wingL, m.wingR].forEach((q) => (s += poly(q, `fill="${cr}"`)));
  s += poly(m.center, `fill="${br}"`);
  s += poly(R.dur, `fill="${te}"`);
  shadowFaces(DUR, BASE + 30).forEach((f) => (s += poly(f, `fill="#1f5a57"`)));
  snowCaps(DUR, 34).forEach((f) => (s += poly(f, `fill="${cr}"`)));
  s += `<polyline points="${P(DUR.map(([x, y]) => [x + 7, y + 5]))}" fill="none" stroke="${br}" stroke-width="2.2"/>`;
  s += LAYER;
  s += poly(R.plateau, `fill="${ol}"`);
  const tree = (t, k) => {
    const c = [te, or, mu, "#5f6a2a"][k % 4];
    return k % 2
      ? `<line x1="${t.x}" y1="${t.y + 2}" x2="${t.x}" y2="${t.y - t.h * 0.3}" stroke="${br}" stroke-width="2"/><ellipse cx="${t.x}" cy="${t.y - t.h * 0.65}" rx="${t.w * 0.7}" ry="${t.h * 0.42}" fill="${c}"/>`
      : `<polygon points="${P([
          [t.x - t.w * 0.7, t.y - 4],
          [t.x + t.w * 0.7, t.y - 4],
          [t.x, t.y - t.h * 1.1],
        ])}" fill="${c}"/><line x1="${t.x}" y1="${t.y + 2}" x2="${t.x}" y2="${t.y - 4}" stroke="${br}" stroke-width="2"/>`;
  };
  plateauPines().forEach((t, k) => (s += tree(t, k)));
  s +=
    poly(R.canyon, `fill="#6b4a2f"`) +
    poly(
      [
        [420, 760],
        [500, 850],
        [560, 935],
        [590, 935],
        [520, 840],
        [450, 760],
      ],
      `fill="#4a3426"`,
    );
  s += `<path d="M560 935 Q590 900 620 935" fill="${te}"/>`;
  s += bridgeSvg(cr, 7, cr, 3);
  s += LAYER;
  s += poly(R.hill, `fill="#b5a33f"`);
  townPines().forEach((t, k) => (s += tree(t, k + 1)));
  s += poly(R.ground, `fill="#e8c88a"`);
  s += monasterySvg({
    wall: cr,
    roof: or,
    metal: te,
    stone: mu,
    ink: br,
    cross: mu,
    fresco: te,
  });
  s += housesSvg({
    walls: [cr, "#f0d8a8", cr, "#e8d0b0"],
    roof: [or, te, mu],
    block: cr,
    win: br,
    ink: br,
  });
  s += plantSvg({
    tower: "#c9b89a",
    chim: cr,
    band: or,
    hall: "#e8d8b8",
    plume: cr,
    ink: br,
  });
  s += poly(R.river, `fill="${te}"`);
  s += poly(R.meadow, `fill="#a3a24a"`);
  setSeed(5);
  for (let k = 0; k < 26; k++) {
    const x = 30 + k * 55 + rnd() * 20,
      y = 1580 + (k % 3) * 60 + rnd() * 30;
    s += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + 40}" stroke="${br}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="${9 + rnd() * 6}" fill="${[or, mu, cr, te][k % 4]}"/>`;
  }
  s += OVERLAY("normal");
  s += `<rect width="${W}" height="${H}" filter="url(#sp)" opacity=".22"/>`;
  return s;
}
