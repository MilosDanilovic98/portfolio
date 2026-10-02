/* Skin 'chalk' (generated from styles5.js:styleChalk by port.py) */
import {
  BASE,
  DUR,
  H,
  LAYER,
  MAUS,
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
  thick,
  townPines,
} from "./common.js";

export default function styleChalk() {
  const R = regions();
  const board = "#22302a";
  let s = `<defs>
  <filter id="ch" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="5" result="g"/><feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.9" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in" result="c"/><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="8" result="w"/><feDisplacementMap in="c" in2="w" scale="4"/></filter>
  <filter id="dust"><feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="4" seed="2"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .16 -.03"/></filter>
  <filter id="sm"><feTurbulence type="fractalNoise" baseFrequency=".004 .02" numOctaves="2" seed="11"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .12 -.02"/></filter></defs>`;
  const pats = {};
  let defs2 = "";
  const hatch = (c, a) => {
    const id = "ch" + c.slice(1) + a;
    if (!pats[id]) {
      pats[id] = 1;
      defs2 += `<pattern id="${id}" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(${a})"><rect width="9" height="3" fill="${c}"/></pattern>`;
    }
    return `url(#${id})`;
  };
  const ck = (pts, line, fill, a = -35, fo = 0.55) =>
    poly(pts, `fill="${board}"`) +
    `<g filter="url(#ch)">${fill ? poly(pts, `fill="${hatch(fill, a)}" opacity="${fo}"`) : ""}${poly(pts, `fill="none" stroke="${line}" stroke-width="4" stroke-linejoin="round"`)}</g>`;
  s += `<rect width="${W}" height="${H}" fill="${board}"/><rect width="${W}" height="${H}" filter="url(#sm)"/><rect width="${W}" height="${H}" filter="url(#dust)"/>`;
  s +=
    `<g filter="url(#ch)"><circle cx="1240" cy="230" r="62" fill="${"url(#__SUN)"}" stroke="#ffe48a" stroke-width="5"/>` +
    Array.from({ length: 12 }, (_, k) => {
      const a = (k * Math.PI) / 6;
      return `<line x1="${1240 + Math.cos(a) * 80}" y1="${230 + Math.sin(a) * 80}" x2="${1240 + Math.cos(a) * 118}" y2="${230 + Math.sin(a) * 118}" stroke="#ffe48a" stroke-width="6" stroke-linecap="round"/>`;
    }).join("");
  s += `<path d="M110 310 q10 -40 50 -30 q20 -40 70 -10 q40 -10 40 30 q20 20 -10 30 h-140 q-30 -10 -10 -20z" fill="none" stroke="#f4f4ee" stroke-width="4"/><path d="M1080 420 q10 -30 40 -24 q20 -30 56 -8 q32 -6 30 24 h-120z" fill="none" stroke="#f4f4ee" stroke-width="4"/></g>`;
  s += LAYER;
  s += ck(R.lov, "#cfe8e4", "#9fd0c8", 30, 0.4);
  const m = mausoleumShapes(MAUS.cx, MAUS.gy, 1.5);
  s +=
    `<g filter="url(#ch)">` +
    [m.terrace, m.wingL, m.wingR, m.center]
      .map((q) => poly(q, `fill="${board}" stroke="#f4f4ee" stroke-width="3"`))
      .join("") +
    "</g>";
  s += ck(R.dur, "#e8eeff", "#a9b8f0", -30, 0.45);
  s +=
    `<g filter="url(#ch)">` +
    shadowFaces(DUR, BASE + 30)
      .map((f) => poly(f, `fill="${hatch("#a9b8f0", 50)}" opacity=".5"`))
      .join("") +
    snowCaps(DUR, 34)
      .map((f) => poly(f, 'fill="#f4f4ee" opacity=".9"'))
      .join("") +
    "</g>";
  s += LAYER;
  s += ck(R.plateau, "#b8f0a8", "#8fd880", -20, 0.35);
  s +=
    `<g filter="url(#ch)">` +
    plateauPines()
      .map(
        (t) =>
          `<path d="M${t.x} ${t.y - t.h} L${t.x - t.w} ${t.y} H${t.x + t.w} Z" fill="none" stroke="#8fd880" stroke-width="3"/>`,
      )
      .join("") +
    "</g>";
  s += ck(R.canyon, "#b8f0a8", "#6fb860", 40, 0.3);
  s += `<g filter="url(#ch)">${bridgeSvg("#f4f4ee", 5, "#f4f4ee", 2.4)}<path d="M560 935 Q590 900 620 935" fill="none" stroke="#8fd0f0" stroke-width="4"/></g>`;
  s += LAYER;
  s += ck(R.hill, "#c8f0a0", "#9fd880", -40, 0.3);
  s +=
    `<g filter="url(#ch)">` +
    townPines()
      .map(
        (t) =>
          `<path d="M${t.x} ${t.y - t.h} L${t.x - t.w} ${t.y} H${t.x + t.w} Z" fill="none" stroke="#8fd880" stroke-width="3"/>`,
      )
      .join("") +
    "</g>";
  s += ck(R.ground, "#ffe0a8", "#f0c070", 25, 0.25);
  s +=
    `<g filter="url(#ch)">` +
    thick(
      monasterySvg({
        wall: board,
        roof: "#ff9a8a",
        metal: "#a9b8f0",
        stone: board,
        ink: "#f4f4ee",
        cross: "#ffe48a",
        fresco: "#a9b8f0",
      }),
      3,
    ) +
    "</g>";
  s +=
    `<g filter="url(#ch)">` +
    thick(
      housesSvg({
        walls: [board],
        roof: ["#ff9a8a", "#ffc48a"],
        block: board,
        win: "#ffe48a",
        ink: "#f4f4ee",
      }),
      2.6,
    ) +
    "</g>";
  s +=
    `<g filter="url(#ch)">` +
    thick(
      plantSvg({
        tower: board,
        chim: board,
        band: "#ff9a8a",
        hall: board,
        plume: "none",
        ink: "#f4f4ee",
      }),
      2.6,
    ) +
    "</g>";
  s += ck(R.river, "#8fd0f0", "#8fd0f0", 0, 0.5);
  s += ck(R.meadow, "#c8f0a0", "#9fd880", -50, 0.25);
  setSeed(13);
  s += `<g filter="url(#ch)">`;
  for (let k = 0; k < 30; k++) {
    const x = rnd() * W,
      y = 1550 + rnd() * 220,
      c = ["#ff9a8a", "#ffe48a", "#d0a8ff", "#f4f4ee"][k % 4];
    s += `<line x1="${x}" y1="${y + 8}" x2="${x}" y2="${y + 34}" stroke="#9fd880" stroke-width="3"/><circle cx="${x}" cy="${y}" r="9" fill="none" stroke="${c}" stroke-width="3.5"/>`;
  }
  s += "</g>";
  s = s.replace("url(#__SUN)", hatch("#ffe48a", 45));
  return `<defs>${defs2}</defs>` + s;
}
