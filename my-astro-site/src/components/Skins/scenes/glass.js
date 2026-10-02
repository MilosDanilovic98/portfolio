/* Skin 'glass' (generated from styles3.js:styleGlass by port.py) */
import {
  DUR,
  H,
  LAYER,
  LAYERF,
  MAUS,
  OVERLAY,
  P,
  W,
  bridgeSvg,
  housesSvg,
  mausoleumShapes,
  monasterySvg,
  plantSvg,
  poly,
  regions,
  shards,
  snowCaps,
} from "./common.js";

export default function styleGlass() {
  const R = regions();
  const lead = "#17130f",
    LW = 7;
  const L = (w = LW) =>
    `fill="none" stroke="${lead}" stroke-width="${w}" stroke-linejoin="round"`;
  let s = `<defs>
  <clipPath id="cSky"><rect width="${W}" height="680"/></clipPath>
  <clipPath id="cDur"><polygon points="${P(R.dur)}"/></clipPath><clipPath id="cLov"><polygon points="${P(R.lov)}"/></clipPath>
  <clipPath id="cPlat"><polygon points="${P(R.plateau)}"/></clipPath><clipPath id="cHill"><polygon points="${P(R.hill)}"/></clipPath>
  <clipPath id="cGround"><polygon points="${P(R.ground)}"/></clipPath><clipPath id="cMeadow"><polygon points="${P(R.meadow)}"/></clipPath><clipPath id="cCan"><polygon points="${P(R.canyon)}"/></clipPath>
  <radialGradient id="lt" cx=".5" cy=".25" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient>
  <filter id="gt"><feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="3" seed="12"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .5 -.18"/></filter>
  <filter id="stone"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="4" seed="3"/><feColorMatrix values="0 0 0 0 .2  0 0 0 0 .17  0 0 0 0 .15  0 0 0 .6 .2"/></filter></defs>`;
  s += shards(
    "cSky",
    0,
    W,
    0,
    680,
    13,
    5,
    ["#1f4f9a", "#2a63b8", "#3d7fd0", "#16407f", "#2f6fc4", "#4a8fdc"],
    41,
    lead,
    4,
  );
  s += `<circle cx="300" cy="320" r="62" fill="#f2c14e" ${L().replace('fill="none"', "")}/>`;
  for (let k = 0; k < 12; k++) {
    const a = (k * Math.PI) / 6;
    s += `<line x1="${300 + Math.cos(a) * 62}" y1="${320 + Math.sin(a) * 62}" x2="${300 + Math.cos(a) * 150}" y2="${320 + Math.sin(a) * 150}" stroke="${lead}" stroke-width="4"/>`;
  }
  s += LAYER;
  s +=
    shards(
      "cLov",
      880,
      1470,
      380,
      690,
      7,
      3,
      ["#2f7f8f", "#256f7f", "#3a91a0", "#1f5a66"],
      42,
      lead,
      3.5,
    ) + poly(R.lov, L());
  const m = mausoleumShapes(MAUS.cx, MAUS.gy, 1.5);
  [m.terrace, m.wingL, m.wingR].forEach(
    (q) => (s += poly(q, `fill="#e9e1d0" stroke="${lead}" stroke-width="4"`)),
  );
  s += poly(m.center, `fill="#8a1f2a" stroke="${lead}" stroke-width="4"`);
  s += shards(
    "cDur",
    -20,
    1140,
    300,
    690,
    14,
    4,
    ["#5b4a9e", "#4a3c8c", "#6c59b3", "#3b2f73", "#7562bd"],
    43,
    lead,
    3.5,
  );
  snowCaps(DUR, 36).forEach(
    (f) =>
      (s += poly(
        f,
        `fill="#e8eef8" stroke="${lead}" stroke-width="4" stroke-linejoin="round"`,
      )),
  );
  s += poly(R.dur, L());
  s += LAYER;
  s +=
    shards(
      "cPlat",
      -10,
      1450,
      650,
      1060,
      16,
      3,
      ["#2f8a4a", "#26743e", "#3a9e58", "#1f6234"],
      44,
      lead,
      3.5,
    ) + poly(R.plateau, L());
  s +=
    shards(
      "cCan",
      300,
      880,
      660,
      940,
      6,
      3,
      ["#1f5a3a", "#174a30", "#2a6a45"],
      45,
      lead,
      3.5,
    ) + poly(R.canyon, L());
  s += `<path d="M558 935 Q590 896 622 935 Z" fill="#3fa0d8" stroke="${lead}" stroke-width="4"/>`;
  s += bridgeSvg(lead, 14, lead, 8) + bridgeSvg("#efe6cf", 6, "#efe6cf", 3);
  s += LAYER;
  s +=
    shards(
      "cHill",
      -10,
      1450,
      960,
      1300,
      16,
      3,
      ["#5aa84a", "#4a9a3e", "#6dbb58", "#3e8a36"],
      46,
      lead,
      3.5,
    ) + poly(R.hill, L());
  s +=
    shards(
      "cGround",
      380,
      1450,
      1190,
      1470,
      10,
      3,
      ["#d9a441", "#c98f30", "#e3b456"],
      47,
      lead,
      3.5,
    ) + poly(R.ground, L());
  s += monasterySvg({
    wall: "#efe6cf",
    roof: "#b3262f",
    metal: "#3d7fd0",
    stone: "#d9a441",
    ink: lead,
    cross: "#f2c14e",
    fresco: "#2a63b8",
  }).replace(/stroke-width="1(\.3)?"/g, 'stroke-width="4"');
  s += housesSvg({
    walls: ["#efe6cf", "#e8d6a8", "#d8e6f2", "#efe6cf"],
    roof: ["#b3262f", "#8a1f2a"],
    block: "#efe6cf",
    win: "#2a63b8",
    ink: lead,
  }).replace(/stroke-width="1(\.3)?"/g, 'stroke-width="3.5"');
  s += plantSvg({
    tower: "#a9b3bf",
    chim: "#efe6cf",
    band: "#b3262f",
    hall: "#d8e6f2",
    plume: "#e9eef5",
    ink: lead,
  }).replace(/stroke-width="1(\.3)?"/g, 'stroke-width="3.5"');
  s += poly(R.river, `fill="#3fa0d8" ${L().replace('fill="none"', "")}`);
  s +=
    shards(
      "cMeadow",
      -10,
      1450,
      1460,
      1810,
      16,
      3,
      ["#7cc06a", "#6aae5a", "#8fd07a", "#5a9e4c"],
      48,
      lead,
      3.5,
    ) + poly(R.meadow, L());
  s += OVERLAY("overlay");
  s += `<rect width="${W}" height="${H}" filter="url(#gt)" style="mix-blend-mode:overlay"/>`;
  s += OVERLAY("soft-light");
  s += `<rect width="${W}" height="${H}" fill="url(#lt)" style="mix-blend-mode:soft-light"/>`;
  s += LAYERF(1);
  // stone arch frame
  s += `<path fill-rule="evenodd" d="M0 0 H${W} V${H} H0 Z M60 ${H} V700 A660 640 0 0 1 1380 700 V${H} Z" fill="#2a2420"/>`;
  s += `<path fill-rule="evenodd" d="M0 0 H${W} V${H} H0 Z M60 ${H} V700 A660 640 0 0 1 1380 700 V${H} Z" filter="url(#stone)" opacity=".7"/>`;
  s += `<path d="M60 ${H} V700 A660 640 0 0 1 1380 700 V${H}" fill="none" stroke="#c9a24a" stroke-width="3"/>`;
  return s;
}
