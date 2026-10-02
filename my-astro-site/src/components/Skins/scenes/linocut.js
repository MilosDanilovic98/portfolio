/* Skin 'linocut' (generated from styles5.js:styleLinocut by port.py) */
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
  lerp,
  mausoleumShapes,
  monasterySvg,
  plantSvg,
  plateauPines,
  plateauTop,
  poly,
  regions,
  riverY,
  rnd,
  setSeed,
  snowCaps,
  thick,
  townHillY,
  townPines,
} from "./common.js";

export default function styleLinocut() {
  const R = regions();
  const ink = "#1c1a17",
    paper = "#f1e9d8",
    red = "#c8372d";
  let s = `<defs>
  <filter id="lw" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5"/></filter>
  <filter id="li" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3" result="g"/><feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3 2.35" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in"/></filter>
  <filter id="pp"><feTurbulence type="fractalNoise" baseFrequency=".02" numOctaves="4" seed="9"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .42  0 0 0 0 .3  0 0 0 .2 -.04"/></filter></defs>`;
  const gouge = (pts, w) =>
    `<polyline points="${P(pts)}" fill="none" stroke="${paper}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<rect width="${W}" height="${H}" fill="${paper}"/><rect width="${W}" height="${H}" filter="url(#pp)"/>`;
  let sky = "";
  setSeed(4);
  for (let y = 60; y < 460; y += 22) {
    let x = -20;
    while (x < W) {
      const l = 60 + rnd() * 240;
      if (rnd() < 0.62 - y / 1200)
        sky += `<line x1="${x}" y1="${y + rnd() * 4}" x2="${x + l}" y2="${y + rnd() * 4}" stroke="${ink}" stroke-width="${3 + rnd() * 3}" stroke-linecap="round"/>`;
      x += l + 20 + rnd() * 80;
    }
  }
  s += `<g filter="url(#lw)" opacity=".9">${sky}</g>`;
  s += `<g filter="url(#lw)"><circle cx="1310" cy="200" r="80" fill="${red}"/>${[62, 44, 26].map((r) => `<circle cx="1310" cy="200" r="${r}" fill="none" stroke="${paper}" stroke-width="4"/>`).join("")}</g>`;
  s += LAYER;
  const carve = (r, n, w) => {
    let t = "";
    setSeed(21);
    for (let k = 1; k <= n; k++)
      t += gouge(
        r.map(([x, y]) => [
          x,
          lerp(y, BASE + 30, k / (n + 1)) + (rnd() - 0.5) * 6,
        ]),
        w * (1 - k / (n + 2)),
      );
    return t;
  };
  s += `<g filter="url(#lw)"><g filter="url(#li)">${poly(R.lov, `fill="${ink}"`)}</g>${carve(LOV, 5, 3)}</g>`;
  const m = mausoleumShapes(MAUS.cx, MAUS.gy, 1.4);
  [m.terrace, m.wingL, m.wingR].forEach(
    (q) => (s += poly(q, `fill="${paper}" stroke="${ink}" stroke-width="2"`)),
  );
  s += poly(m.center, `fill="${red}"`);
  s += `<g filter="url(#lw)"><g filter="url(#li)">${poly(R.dur, `fill="${ink}"`)}</g>${carve(DUR, 7, 4)}`;
  snowCaps(DUR, 34).forEach((f) => (s += poly(f, `fill="${paper}"`)));
  s += "</g>";
  s += LAYER;
  s += `<g filter="url(#lw)"><g filter="url(#li)">${poly(R.plateau, `fill="${ink}"`)}</g>`;
  setSeed(31);
  for (let k = 0; k < 160; k++) {
    const x = rnd() * W,
      y = plateauTop(x) + 30 + rnd() * 320;
    if (x > 300 && x < 880 && y > 680) continue;
    s += `<line x1="${x}" y1="${y}" x2="${x + 3}" y2="${y - 9}" stroke="${paper}" stroke-width="2.5" stroke-linecap="round"/>`;
  }
  plateauPines().forEach(
    (t) =>
      (s += `<polygon points="${P([
        [t.x - t.w, t.y + 2],
        [t.x + t.w, t.y + 2],
        [t.x, t.y - t.h],
      ])}" fill="${ink}"/><line x1="${t.x}" y1="${t.y - t.h * 0.8}" x2="${t.x}" y2="${t.y}" stroke="${paper}" stroke-width="1.5"/>`),
  );
  s += poly(R.canyon, `fill="${paper}"`);
  for (let k = 0; k < 9; k++)
    s += `<polyline points="${P([
      [330 + k * 22, 700 + k * 26],
      [590, 760 + k * 22],
      [850 - k * 22, 700 + k * 26],
    ])}" fill="none" stroke="${ink}" stroke-width="${2 + k * 0.6}"/>`;
  s += `<path d="M558 935 Q590 896 622 935 Z" fill="${red}"/>`;
  s += bridgeSvg(paper, 12, paper, 6) + bridgeSvg(ink, 5, ink, 2.4) + "</g>";
  s += LAYER;
  s += `<g filter="url(#lw)"><g filter="url(#li)">${poly(R.hill, `fill="${ink}"`)}</g>`;
  setSeed(41);
  for (let k = 0; k < 140; k++) {
    const x = rnd() * W,
      y = townHillY(x) + 20 + rnd() * 300;
    s += `<line x1="${x}" y1="${y}" x2="${x + 2}" y2="${y - 8}" stroke="${paper}" stroke-width="2.4" stroke-linecap="round"/>`;
  }
  townPines().forEach(
    (t) =>
      (s += `<polygon points="${P([
        [t.x - t.w, t.y + 2],
        [t.x + t.w, t.y + 2],
        [t.x, t.y - t.h],
      ])}" fill="${ink}" stroke="${paper}" stroke-width="1.6"/>`),
  );
  s += poly(R.ground, `fill="${paper}" stroke="${ink}" stroke-width="3"`);
  s += thick(
    monasterySvg({
      wall: paper,
      roof: red,
      metal: ink,
      stone: paper,
      ink,
      cross: red,
      fresco: ink,
    }),
    2.4,
  );
  s += thick(
    housesSvg({
      walls: [paper],
      roof: [red, ink],
      block: paper,
      win: ink,
      ink,
    }),
    2.2,
  );
  s += thick(
    plantSvg({
      tower: paper,
      chim: paper,
      band: red,
      hall: paper,
      plume: paper,
      ink,
    }),
    2.2,
  );
  s += poly(R.river, `fill="${ink}"`);
  for (let x = 0; x < W; x += 50)
    s += `<path d="M${x} ${riverY} q12 -6 25 0 t25 0" fill="none" stroke="${paper}" stroke-width="2.5"/>`;
  s += `<g filter="url(#li)">${poly(R.meadow, `fill="${ink}"`)}</g>`;
  setSeed(51);
  for (let k = 0; k < 220; k++) {
    const x = rnd() * W,
      y = 1500 + rnd() * 300;
    s += `<path d="M${x} ${y} l3 -12 M${x + 5} ${y} l-1 -14" stroke="${paper}" stroke-width="2.4" stroke-linecap="round"/>`;
  }
  s += "</g>";
  return s;
}
