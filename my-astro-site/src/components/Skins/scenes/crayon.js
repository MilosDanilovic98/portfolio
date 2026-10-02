/* Skin 'crayon' (generated from styles4.js:styleCrayon by port.py) */
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
  thick,
  townPines,
} from "./common.js";

export default function styleCrayon() {
  const R = regions();
  let defs = `<filter id="wob" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="7"/></filter>
  <filter id="wax" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="9" result="g"/><feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.75" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in" result="c"/><feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="2" seed="2" result="w"/><feDisplacementMap in="c" in2="w" scale="6"/></filter>
  <filter id="pap"><feTurbulence type="fractalNoise" baseFrequency=".5" numOctaves="3" seed="1"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .45  0 0 0 0 .38  0 0 0 .12 0"/></filter>`;
  const pats = {};
  const hatch = (c, ang = -30) => {
    const id = "h" + c.slice(1) + (ang < 0 ? "n" : "p") + Math.abs(ang);
    if (!pats[id]) {
      pats[id] = 1;
      defs += `<pattern id="${id}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(${ang})"><rect width="6" height="3.6" fill="${c}"/></pattern>`;
    }
    return `url(#${id})`;
  };
  const cr = (pts, c, line, ang) =>
    (line ? poly(pts, 'fill="#fdfbf4"') : "") +
    `<g filter="url(#wax)">${poly(pts, `fill="${c}" opacity=".5"`)}${poly(pts, `fill="${hatch(c, ang)}"`)}</g>` +
    (line
      ? `<g filter="url(#wob)">${poly(pts, `fill="none" stroke="${line}" stroke-width="3.2" stroke-linejoin="round" opacity=".85"`)}</g>`
      : "");
  let s = `<rect width="${W}" height="${H}" fill="#fdfbf4"/>`;
  s +=
    `<g filter="url(#wax)" opacity=".7">` +
    [80, 150, 230, 320, 420, 520]
      .map(
        (y, k) =>
          `<path d="M-20 ${y} Q360 ${y - 18} 720 ${y + 6} T1460 ${y - 4}" stroke="#7cc4ef" stroke-width="${30 - k * 3}" fill="none" opacity="${0.75 - k * 0.1}"/>`,
      )
      .join("") +
    "</g>";
  s += `<g filter="url(#wax)"><circle cx="1260" cy="210" r="62" fill="#ffd23a"/><circle cx="1260" cy="210" r="62" fill="${hatch("#ffb800", 40)}"/></g>`;
  s +=
    `<g filter="url(#wob)">` +
    Array.from({ length: 12 }, (_, k) => {
      const a = (k * Math.PI) / 6;
      return `<line x1="${1260 + Math.cos(a) * 80}" y1="${210 + Math.sin(a) * 80}" x2="${1260 + Math.cos(a) * 120}" y2="${210 + Math.sin(a) * 120}" stroke="#ffb800" stroke-width="7" stroke-linecap="round"/>`;
    }).join("") +
    `<circle cx="1260" cy="210" r="62" fill="none" stroke="#f08a00" stroke-width="3"/></g>`;
  s += `<g filter="url(#wob)" fill="none" stroke="#7a8aa0" stroke-width="3"><path d="M90 300 q10 -40 50 -30 q20 -40 70 -10 q40 -10 40 30 q20 20 -10 30 h-140 q-30 -10 -10 -20z"/><path d="M1100 420 q10 -30 40 -24 q20 -30 56 -8 q32 -6 30 24 h-120z"/></g>`;
  s += LAYER;
  s += cr(R.lov, "#6cc0b0", "#3a8a7a", -25);
  shadowFaces(LOV, BASE + 30).forEach((f) => (s += cr(f, "#3a9a8a", null, 35)));
  const m = mausoleumShapes(MAUS.cx, MAUS.gy, 1.5);
  [m.terrace, m.wingL, m.wingR, m.center].forEach(
    (q, k) =>
      (s += `<g filter="url(#wob)">${poly(q, `fill="${k === 3 ? "#e8483a" : "#fff"}" stroke="#555" stroke-width="2.5"`)}</g>`),
  );
  s += cr(R.dur, "#7a8fe0", "#4a5ab0", -30);
  shadowFaces(DUR, BASE + 30).forEach((f) => (s += cr(f, "#4a5ac0", null, 30)));
  snowCaps(DUR, 34).forEach(
    (f) =>
      (s += `<g filter="url(#wob)">${poly(f, 'fill="#fdfbf4" stroke="#4a5ab0" stroke-width="2.5"')}</g>`),
  );
  s += LAYER;
  s += cr(R.plateau, "#5cc05a", "#2f8a3a", -20);
  s +=
    `<g filter="url(#wob)">` +
    plateauPines()
      .map(
        (t) =>
          `<polygon points="${P([
            [t.x - t.w, t.y + 2],
            [t.x + t.w, t.y + 2],
            [t.x, t.y - t.h],
          ])}" fill="#2f8a3a" stroke="#1f5a2a" stroke-width="2"/>`,
      )
      .join("") +
    "</g>";
  s +=
    cr(R.canyon, "#3f9a4a", "#2a6a32", 30) +
    `<g filter="url(#wax)"><path d="M558 935 Q590 896 622 935 Z" fill="#3aa0e8"/></g>`;
  s += `<g filter="url(#wob)">${bridgeSvg("#6a6a72", 5, "#6a6a72", 2.4)}</g>`;
  s += LAYER;
  s += cr(R.hill, "#8fd06a", "#4a9a3a", -35);
  s +=
    `<g filter="url(#wob)">` +
    townPines()
      .map(
        (t) =>
          `<polygon points="${P([
            [t.x - t.w, t.y + 2],
            [t.x + t.w, t.y + 2],
            [t.x, t.y - t.h],
          ])}" fill="#3aa04a" stroke="#1f5a2a" stroke-width="2"/>`,
      )
      .join("") +
    "</g>";
  s += cr(R.ground, "#f0c070", "#c08a3a", 25);
  s +=
    `<g filter="url(#wob)">` +
    thick(
      monasterySvg({
        wall: "#ffffff",
        roof: "#e8483a",
        metal: "#6a8ae0",
        stone: "#f0c070",
        ink: "#555",
        cross: "#ffb800",
        fresco: "#6a8ae0",
      }),
      2.4,
    ) +
    "</g>";
  s +=
    `<g filter="url(#wob)">` +
    thick(
      housesSvg({
        walls: ["#fff", "#ffe3ec", "#e3f0ff", "#fff6d8"],
        roof: ["#e8483a", "#ff8a3a", "#9a6ae0"],
        block: "#fff",
        win: "#3aa0e8",
        ink: "#555",
      }),
      2.2,
    ) +
    "</g>";
  s +=
    `<g filter="url(#wob)">` +
    thick(
      plantSvg({
        tower: "#cfcfd8",
        chim: "#fff",
        band: "#e8483a",
        hall: "#f4f4f8",
        plume: "#fff",
        ink: "#555",
      }),
      2.2,
    ) +
    "</g>";
  s += cr(R.river, "#3aa0e8", "#2a70b8", -10);
  s += cr(R.meadow, "#a8e060", "#6ab03a", -40);
  setSeed(8);
  s += `<g filter="url(#wob)">`;
  for (let k = 0; k < 34; k++) {
    const x = rnd() * W,
      y = 1560 + rnd() * 220,
      c = ["#e8483a", "#ffb800", "#9a6ae0", "#ff7ab0"][k % 4];
    s +=
      `<line x1="${x}" y1="${y + 6}" x2="${x}" y2="${y + 34}" stroke="#2f8a3a" stroke-width="3"/>` +
      [0, 1, 2, 3, 4]
        .map(
          (q) =>
            `<circle cx="${x + Math.cos(q * 1.26) * 8}" cy="${y + Math.sin(q * 1.26) * 8}" r="6" fill="${c}"/>`,
        )
        .join("") +
      `<circle cx="${x}" cy="${y}" r="4" fill="#ffd23a"/>`;
  }
  s += "</g>";
  s += OVERLAY("normal");
  s += `<rect width="${W}" height="${H}" filter="url(#pap)"/>`;
  return `<defs>${defs}</defs>` + s;
}
