/* Skin 'poster' (generated from styles.js:stylePoster by port.py) */
import {
  BASE,
  DUR,
  H,
  LAYER,
  LOV,
  MAUS,
  OVERLAY,
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

export default function stylePoster() {
  const R = regions();
  const C = {
    sky1: "#2f5d73",
    sky2: "#e9a76f",
    sky3: "#f7dfb2",
    sun: "#e8573a",
    lov: "#86a5a6",
    lovS: "#62858e",
    dur: "#557a93",
    durS: "#34536f",
    snow: "#f7ecd6",
    plat: "#2f5b4a",
    pine: "#1d3c34",
    canyon: "#3f6d58",
    canyonS: "#284b3e",
    hill: "#4c7d5c",
    hillPine: "#2d5443",
    ground: "#cdb27a",
    wall: "#f6ead0",
    roof: "#d65a37",
    river: "#7fb6b8",
    meadow: "#9fae55",
    meadow2: "#8a9a48",
    cream: "#f6ead0",
    navy: "#1f3347",
  };
  let s = `<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.sky1}"/><stop offset="0.28" stop-color="#6f8f93"/><stop offset="0.52" stop-color="${C.sky2}"/><stop offset="0.72" stop-color="${C.sky3}"/></linearGradient>
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 0.12  0 0 0 0 0.1  0 0 0 0 0.08  0 0 0 0.55 -0.12"/></filter>
  </defs>`;
  s += `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  s += `<circle cx="200" cy="300" r="90" fill="${C.sun}"/>`;
  // long flat clouds
  s += `<g fill="${C.cream}" opacity="0.9"><rect x="60" y="380" width="260" height="14" rx="7"/><rect x="1120" y="400" width="160" height="10" rx="5"/><rect x="1150" y="372" width="250" height="12" rx="6"/><rect x="1180" y="110" width="200" height="12" rx="6"/></g>`;
  s += LAYER;
  s += poly(R.lov, `fill="${C.lov}"`);
  shadowFaces(LOV, BASE + 30).forEach(
    (f) => (s += poly(f, `fill="${C.lovS}"`)),
  );
  s += poly(R.dur, `fill="${C.dur}"`);
  shadowFaces(DUR, BASE + 30).forEach(
    (f) => (s += poly(f, `fill="${C.durS}"`)),
  );
  snowCaps(DUR, 34).forEach((f) => (s += poly(f, `fill="${C.snow}"`)));
  const m = mausoleumShapes(MAUS.cx, MAUS.gy, 1.25);
  s +=
    poly(m.terrace, `fill="${C.cream}"`) +
    poly(m.wingL, `fill="${C.cream}"`) +
    poly(m.wingR, `fill="${C.cream}"`) +
    poly(m.center, `fill="${C.navy}"`);
  s += LAYER;
  s += poly(R.plateau, `fill="${C.plat}"`);
  s += pinesSvg(plateauPines(), C.pine);
  s += poly(R.canyon, `fill="${C.canyon}"`);
  s += poly(
    [
      [420, 760],
      [500, 850],
      [560, 935],
      [590, 935],
      [520, 840],
      [450, 760],
    ],
    `fill="${C.canyonS}"`,
  );
  s += `<path d="M560 935 Q590 900 620 935" fill="${C.river}"/>`;
  s += bridgeSvg(C.cream, 7, C.cream, 3);
  s += LAYER;
  s += poly(R.hill, `fill="${C.hill}"`);
  s += pinesSvg(townPines(), C.hillPine);
  s += poly(R.ground, `fill="${C.ground}"`);
  s += monasterySvg({
    wall: C.wall,
    roof: C.roof,
    metal: C.lovS,
    stone: "#c9a87a",
    ink: "none",
    cross: "#e8b84a",
    fresco: C.navy,
  });
  s += housesSvg({
    walls: [C.wall, "#efd9ae", "#f3e3c0", "#e9cfa0"],
    roof: [C.roof, "#b8482e"],
    block: "#efe1c4",
    win: C.navy,
    ink: "none",
  });
  s += plantSvg({
    tower: "#b9b2a2",
    chim: C.cream,
    band: C.sun,
    hall: "#e6dcc4",
    plume: C.cream,
    ink: "none",
  });
  s += poly(R.river, `fill="${C.river}"`);
  s += poly(R.meadow, `fill="${C.meadow}"`);
  for (let k = 0; k < 6; k++)
    s += `<path d="M-10 ${1560 + k * 42} Q720 ${1530 + k * 42} 1450 ${1575 + k * 42}" stroke="${C.meadow2}" stroke-width="10" fill="none" opacity="0.5"/>`;
  s += OVERLAY("normal");
  s += `<rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.5"/>`;
  return s;
}
