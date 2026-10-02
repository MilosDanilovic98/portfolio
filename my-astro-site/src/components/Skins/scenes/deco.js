/* Skin 'deco' (generated from styles3.js:styleDeco by port.py) */
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
  lerp,
  mausoleumShapes,
  monasterySvg,
  plantSvg,
  plateauPines,
  plateauTop,
  poly,
  regions,
  snowCaps,
  townPines,
} from "./common.js";

export default function styleDeco() {
  const R = regions();
  const gold = "#d4af6a",
    navy = "#0f1b2d";
  const g = (w = 2, op = 1) =>
    `stroke="${gold}" stroke-width="${w}" stroke-opacity="${op}" stroke-linejoin="miter"`;
  let s = `<defs><pattern id="fan" width="60" height="30" patternUnits="userSpaceOnUse"><rect width="60" height="30" fill="#0e2134"/>${[24, 17, 10].map((r) => `<path d="M${30 - r} 30 A${r} ${r} 0 0 1 ${30 + r} 30" fill="none" stroke="${gold}" stroke-opacity=".35" stroke-width="1.2"/><path d="M${-r} 15 A${r} ${r} 0 0 1 ${r} 15 M${60 - r} 15 A${r} ${r} 0 0 1 ${60 + r} 15" fill="none" stroke="${gold}" stroke-opacity=".35" stroke-width="1.2"/>`).join("")}</pattern>
  <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1322"/><stop offset="1" stop-color="#1b3550"/></linearGradient></defs>`;
  s += `<rect width="${W}" height="${H}" fill="${navy}"/><rect width="${W}" height="660" fill="url(#gs)"/>`;
  for (let k = 0; k < 36; k++) {
    const a1 = Math.PI + (k * Math.PI) / 36,
      a2 = a1 + Math.PI / 72;
    s += `<polygon points="720,660 ${720 + Math.cos(a1) * 1400},${660 + Math.sin(a1) * 1400} ${720 + Math.cos(a2) * 1400},${660 + Math.sin(a2) * 1400}" fill="${gold}" opacity=".07"/>`;
  }
  [190, 230, 270].forEach(
    (r, k) =>
      (s += `<path d="M${720 - r} 660 A${r} ${r} 0 0 1 ${720 + r} 660" fill="${k ? "none" : "#2a3a4a"}" ${g(k ? 1.5 : 3, k ? 0.6 : 1)}/>`),
  );
  const terr = (r, n) => {
    let t = "";
    for (let k = 1; k <= n; k++)
      t += `<polyline points="${P(r.map(([x, y]) => [x, lerp(y, BASE + 30, k / (n + 1))]))}" fill="none" ${g(1.2, 0.45)}/>`;
    return t;
  };
  s += LAYER;
  s += poly(R.lov, `fill="#173c4a" ${g(2.5)}`) + terr(LOV, 5);
  const m = mausoleumShapes(MAUS.cx, MAUS.gy, 1.4);
  [m.terrace, m.wingL, m.wingR].forEach(
    (q) => (s += poly(q, `fill="#efe3c6" ${g(1.2)}`)),
  );
  s += poly(m.center, `fill="${gold}"`);
  s += poly(R.dur, `fill="#142a44" ${g(3)}`) + terr(DUR, 7);
  snowCaps(DUR, 34).forEach((f) => (s += poly(f, `fill="${gold}"`)));
  s += LAYER;
  s += poly(R.plateau, `fill="#10283a" ${g(2.5)}`);
  plateauPines().forEach(
    (t) =>
      (s += `<polygon points="${P([
        [t.x - t.w * 0.6, t.y + 2],
        [t.x + t.w * 0.6, t.y + 2],
        [t.x, t.y - t.h * 1.2],
      ])}" fill="#0c2030" ${g(1.2)}/>`),
  );
  s += poly(R.canyon, `fill="#08121f" ${g(2.5)}`);
  for (let k = 1; k < 6; k++)
    s += `<polyline points="${P([
      [300 + k * 40, plateauTop(300) + k * 40],
      [590, 660 + k * 55 + 80],
      [880 - k * 40, plateauTop(880) + k * 40],
    ])}" fill="none" ${g(1, 0.35)}/>`;
  s += bridgeSvg(gold, 6, gold, 2);
  s += LAYER;
  s += poly(R.hill, `fill="#13304a" ${g(2.5)}`);
  townPines().forEach(
    (t) =>
      (s += `<polygon points="${P([
        [t.x - t.w * 0.6, t.y + 2],
        [t.x + t.w * 0.6, t.y + 2],
        [t.x, t.y - t.h * 1.2],
      ])}" fill="#0f2a40" ${g(1.2)}/>`),
  );
  s += poly(R.ground, `fill="#1a2c42" ${g(1.5)}`);
  const ob = {
    wall: "#efe3c6",
    roof: gold,
    metal: "#2a5a6a",
    stone: "#c7b48a",
    ink: gold,
    cross: gold,
    fresco: "#173c4a",
  };
  s += monasterySvg(ob);
  s += housesSvg({
    walls: ["#efe3c6", "#e3d2ad"],
    roof: [gold, "#2a5a6a"],
    block: "#efe3c6",
    win: navy,
    ink: gold,
  });
  s += plantSvg({
    tower: "#c7b48a",
    chim: "#efe3c6",
    band: gold,
    hall: "#e3d2ad",
    plume: "#efe3c6",
    ink: gold,
  });
  s += poly(R.river, `fill="#173c4a" ${g(2)}`);
  s += poly(R.meadow, `fill="url(#fan)" ${g(2)}`);
  s += OVERLAY("normal");
  s += `<rect x="14" y="14" width="${W - 28}" height="${H - 28}" fill="none" ${g(2)}/><rect x="22" y="22" width="${W - 44}" height="${H - 44}" fill="none" ${g(1, 0.6)}/>`;
  return s;
}
