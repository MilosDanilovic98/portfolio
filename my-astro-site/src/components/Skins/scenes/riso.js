/* Skin 'riso' (generated from styles2.js:styleRiso by port.py) */
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
  pinesSvg,
  plantSvg,
  plateauPines,
  poly,
  regions,
  shadowFaces,
  snowCaps,
  townPines,
} from "./common.js";

export default function styleRiso() {
  const R = regions();
  const INK = { P: "#ff48b0", B: "#0078bf", Y: "#ffe800" },
    paper = "#f4efe4";
  const pats = {};
  let defs = "";
  const pat = (spec) => {
    const id = "r" + spec.replace(/[^A-Z0-9]/g, "");
    if (pats[id]) return `url(#${id})`;
    pats[id] = 1;
    const S = 7;
    let c = `<rect width="${S}" height="${S}" fill="${paper}"/>`;
    spec.split(" ").forEach((t, k) => {
      const ink = INK[t[0]],
        d = +t.slice(1) / 100;
      if (d >= 0.95)
        c += `<rect width="${S}" height="${S}" fill="${ink}" style="mix-blend-mode:multiply"/>`;
      else {
        const r = S * Math.sqrt(d / (2 * Math.PI)),
          ox = k === 1 ? S / 4 : 0;
        [
          [0, 0],
          [S, 0],
          [0, S],
          [S, S],
          [S / 2, S / 2],
        ].forEach(
          ([x, y]) =>
            (c += `<circle cx="${(x + ox) % (S + 0.01)}" cy="${(y + ox) % (S + 0.01)}" r="${r}" fill="${ink}" style="mix-blend-mode:multiply"/>`),
        );
      }
    });
    defs += `<pattern id="${id}" width="${S}" height="${S}" patternUnits="userSpaceOnUse" patternTransform="rotate(${(spec.length * 7) % 45})">${c}</pattern>`;
    return `url(#${id})`;
  };
  let s = "";
  s += `<rect width="${W}" height="660" fill="${pat("Y18 B8")}"/>`;
  s += `<circle cx="210" cy="300" r="105" fill="${pat("P100 Y100")}"/>`;
  s += `<g style="mix-blend-mode:multiply"><circle cx="216" cy="295" r="105" fill="none" stroke="${INK.P}" stroke-width="3" opacity=".7"/></g>`;
  s += LAYER;
  s += poly(R.lov, `fill="${pat("B40")}"`);
  shadowFaces(LOV, BASE + 30).forEach(
    (f) => (s += poly(f, `fill="${pat("B75")}"`)),
  );
  const m = mausoleumShapes(MAUS.cx, MAUS.gy, 1.4);
  [m.terrace, m.wingL, m.wingR].forEach(
    (q) => (s += poly(q, `fill="${paper}"`)),
  );
  s += poly(m.center, `fill="${pat("B100")}"`);
  s += poly(R.dur, `fill="${pat("B45 P12")}"`);
  shadowFaces(DUR, BASE + 30).forEach(
    (f) => (s += poly(f, `fill="${pat("B75 P25")}"`)),
  );
  snowCaps(DUR, 34).forEach((f) => (s += poly(f, `fill="${paper}"`)));
  s += `<polyline points="${P(DUR.map(([x, y]) => [x + 4, y - 3]))}" fill="none" stroke="${INK.P}" stroke-width="3" style="mix-blend-mode:multiply" opacity=".8"/>`;
  s += LAYER;
  s +=
    poly(R.plateau, `fill="${pat("Y70 B45")}"`) +
    pinesSvg(plateauPines(), pat("B100 Y50"));
  s +=
    poly(R.canyon, `fill="${pat("B70 Y35")}"`) +
    `<path d="M560 935 Q590 900 620 935" fill="${pat("B45")}"/>`;
  s += bridgeSvg(paper, 8, paper, 3.5);
  s += `<g style="mix-blend-mode:multiply" opacity=".85" transform="translate(4,-3)">${bridgeSvg(INK.P, 2, INK.P, 1.2)}</g>`;
  s += LAYER;
  s +=
    poly(R.hill, `fill="${pat("Y60 B35")}"`) +
    pinesSvg(townPines(), pat("B90 Y60"));
  s += poly(R.ground, `fill="${pat("Y45 P15")}"`);
  s += monasterySvg({
    wall: paper,
    roof: pat("P100 Y60"),
    metal: pat("B60"),
    stone: pat("Y60 P25"),
    ink: "none",
    cross: INK.Y,
    fresco: pat("B100"),
  });
  s += housesSvg({
    walls: [paper, pat("Y30"), paper, pat("P15")],
    roof: [pat("P100 Y50"), pat("P90")],
    block: paper,
    win: INK.B,
    ink: "none",
  });
  s += plantSvg({
    tower: pat("B30"),
    chim: paper,
    band: INK.P,
    hall: pat("B15"),
    plume: paper,
    ink: "none",
  });
  s +=
    poly(R.river, `fill="${pat("B65")}"`) +
    poly(R.meadow, `fill="${pat("Y55 B25")}"`);
  for (let k = 0; k < 5; k++)
    s += `<path d="M-10 ${1570 + k * 46} Q720 ${1540 + k * 46} 1450 ${1585 + k * 46}" stroke="${INK.B}" stroke-width="5" fill="none" opacity=".35" style="mix-blend-mode:multiply"/>`;
  s += OVERLAY("normal");
  s += `<filter id="rg"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="6"/><feColorMatrix values="0 0 0 0 .3  0 0 0 0 .25  0 0 0 0 .2  0 0 0 .5 -.15"/></filter><rect width="${W}" height="${H}" filter="url(#rg)" opacity=".45"/>`;
  return (
    `<defs>${defs}</defs><rect width="${W}" height="${H}" fill="${paper}"/>` + s
  );
}
