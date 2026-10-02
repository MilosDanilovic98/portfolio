/* Generated from the mock-up sources (port.py). Shared geometry for all skins. */
// Shared geometry for the five style mock-ups (1440 x 1800 page: hero + one content screen)
const W = 1440;
const H = 1800;
let seed = 7;
const setSeed = (v) => {
  seed = v;
};
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const P = (pts) =>
  pts.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
const lerp = (a, b, t) => a + (b - a) * t;

// Durmitor (Savin kuk, the teeth, Međed, Crvena greda) and Lovćen with the mausoleum
const DUR = [
  [-20, 575],
  [60, 535],
  [140, 480],
  [200, 428],
  [240, 384],
  [272, 418],
  [300, 440],
  [330, 412],
  [350, 432],
  [372, 398],
  [392, 428],
  [414, 392],
  [436, 422],
  [458, 404],
  [500, 366],
  [548, 334],
  [592, 318],
  [640, 322],
  [684, 344],
  [726, 380],
  [768, 358],
  [808, 342],
  [850, 372],
  [896, 412],
  [946, 452],
  [1000, 486],
  [1080, 520],
  [1140, 560],
];
const LOV = [
  [880, 560],
  [960, 524],
  [1040, 500],
  [1110, 476],
  [1170, 460],
  [1215, 430],
  [1250, 396],
  [1268, 388],
  [1300, 388],
  [1320, 404],
  [1356, 440],
  [1410, 466],
  [1470, 488],
];
const BASE = 640;
function ridgeY(r, x) {
  for (let i = 0; i < r.length - 1; i++)
    if (x >= r[i][0] && x <= r[i + 1][0])
      return lerp(
        r[i][1],
        r[i + 1][1],
        (x - r[i][0]) / (r[i + 1][0] - r[i][0]),
      );
  return BASE;
}
function peaks(r) {
  const out = [];
  for (let i = 1; i < r.length - 1; i++)
    if (r[i][1] < r[i - 1][1] && r[i][1] < r[i + 1][1]) out.push(i);
  return out;
}
// light from the right: the face left of a line from each peak down to the base is in shadow
function shadowFaces(r, base) {
  const res = [];
  for (const i of peaks(r)) {
    const p = r[i];
    let j = i - 1;
    while (j > 0 && r[j - 1][1] > r[j][1]) j--;
    const pts = [p];
    for (let k = i - 1; k >= j; k--) pts.push(r[k]);
    const drop = base - p[1];
    pts.push([r[j][0] + drop * 0.05, base]);
    pts.push([p[0] + drop * 0.32, base]);
    res.push(pts);
  }
  return res;
}
function snowCaps(r, depth) {
  const res = [];
  for (const i of peaks(r)) {
    const p = r[i];
    if (p[1] > 430) continue;
    const d = depth * (1.2 - (p[1] - 300) / 300);
    const pts = [[p[0] - d * 0.9, p[1] + d], p, [p[0] + d * 1.1, p[1] + d]];
    const lo = [];
    for (let k = 0; k <= 6; k++) {
      const x = lerp(p[0] + d * 1.1, p[0] - d * 0.9, k / 6);
      lo.push([x, p[1] + d * (0.8 + 0.6 * (k % 2 ? 1 : 0.4))]);
    }
    res.push([...pts, ...lo]);
  }
  return res;
}
function pines(x0, x1, yfn, hmin, hmax, step) {
  const t = [];
  for (let x = x0; x < x1; x += step * (0.6 + rnd() * 0.8)) {
    const h = lerp(hmin, hmax, rnd()),
      w = h * 0.36,
      y = yfn(x);
    t.push({ x, y, h, w });
  }
  return t;
}
const hillY = (x) =>
  760 + 26 * Math.sin(x * 0.006 + 1) + 14 * Math.sin(x * 0.017);
const townHillY = (x) =>
  1110 -
  120 * Math.exp(-Math.pow((x - 240) / 260, 2)) +
  10 * Math.sin(x * 0.01);
const riverY = 1470;

// the bridge over the Tara (five arches)
function bridge() {
  const deck = { x0: 300, x1: 880, y: 690 };
  const arches = [
    { cx: 590, span: 120, rise: 130 },
    { cx: 418, span: 48, rise: 70 },
    { cx: 334, span: 34, rise: 44 },
    { cx: 762, span: 48, rise: 70 },
    { cx: 846, span: 34, rise: 44 },
  ];
  return { deck, arches };
}
function archPts(a, deckY, n = 28) {
  const pts = [];
  for (let k = 0; k <= n; k++) {
    const u = -1 + (2 * k) / n;
    pts.push([a.cx + u * a.span, deckY + 8 + a.rise * u * u]);
  }
  return pts;
}
// houses of the town (screen 2)
function houses() {
  const out = [];
  setSeed(31);
  for (let row = 0; row < 3; row++) {
    const yb = 1250 + row * 70;
    for (let x = 470 + row * 23; x < 1380; x += 62 + rnd() * 30) {
      if (row === 0 && x > 1080 && x < 1260) continue;
      const w = 34 + rnd() * 22,
        h = 24 + rnd() * 26;
      out.push({
        x,
        y: yb + rnd() * 8,
        w,
        h,
        roof: 14 + rnd() * 10,
        c: Math.floor(rnd() * 4),
        block: row === 0 && rnd() < 0.3,
      });
    }
  }
  return out;
}

// Builds the scene SVG for one of the five styles
const plateauTop = (x) =>
  700 +
  18 * Math.sin(x * 0.004 + 0.5) +
  6 * Math.sin(x * 0.03) +
  (x < 300 || x > 880 ? 10 * Math.sin(x * 0.011) : 0);
function regions() {
  const top = [];
  for (let x = -10; x <= 1450; x += 10) top.push([x, plateauTop(x)]);
  const hill = [];
  for (let x = -10; x <= 1450; x += 10) hill.push([x, townHillY(x)]);
  const ground = [];
  for (let x = 380; x <= 1450; x += 10)
    ground.push([x, 1212 + 8 * Math.sin(x * 0.012)]);
  const river = [],
    riverB = [];
  for (let x = -10; x <= 1450; x += 10) {
    river.push([x, riverY - 12 + 6 * Math.sin(x * 0.01)]);
    riverB.unshift([x, riverY + 14 + 6 * Math.sin(x * 0.01 + 0.6)]);
  }
  const meadow = [];
  for (let x = -10; x <= 1450; x += 10)
    meadow.push([x, riverY + 14 + 6 * Math.sin(x * 0.01 + 0.6)]);
  return {
    lov: [...LOV, [1470, BASE + 30], [880, BASE + 30]],
    dur: [...DUR, [1140, BASE + 30], [-20, BASE + 30]],
    plateau: [...top, [1450, 1050], [-10, 1050]],
    canyon: [
      [300, plateauTop(300)],
      [330, plateauTop(330) + 30],
      [420, 760],
      [500, 850],
      [560, 935],
      [620, 935],
      [690, 850],
      [770, 760],
      [850, plateauTop(850) + 30],
      [880, plateauTop(880)],
    ],
    hill: [...hill, [1450, H + 10], [-10, H + 10]],
    ground: [[380, 1300], ...ground, [1450, H + 10], [380, H + 10]],
    river: [...river, ...riverB],
    meadow: [...meadow, [1450, H + 10], [-10, H + 10]],
  };
}
const poly = (pts, attrs = "") => `<polygon points="${P(pts)}" ${attrs}/>`;
const pathD = (pts, close = true) =>
  "M" +
  pts.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L") +
  (close ? " Z" : "");

// ---------------------------------------------------------------- buildings (shared shapes)
function monasteryShapes(cx, gy, s = 1) {
  // returns named rectangles / polygons in page coordinates
  const X = (x) => cx + x * s,
    Y = (y) => gy - y * s;
  return {
    konakL: [
      [X(-120), Y(0)],
      [X(-50), Y(0)],
      [X(-50), Y(34)],
      [X(-120), Y(34)],
    ],
    konakLRoof: [
      [X(-128), Y(34)],
      [X(-42), Y(34)],
      [X(-56), Y(50)],
      [X(-114), Y(50)],
    ],
    konakR: [
      [X(52), Y(0)],
      [X(110), Y(0)],
      [X(110), Y(30)],
      [X(52), Y(30)],
    ],
    konakRRoof: [
      [X(46), Y(30)],
      [X(116), Y(30)],
      [X(103), Y(45)],
      [X(59), Y(45)],
    ],
    church: [
      [X(-34), Y(0)],
      [X(34), Y(0)],
      [X(34), Y(44)],
      [X(0), Y(66)],
      [X(-34), Y(44)],
    ],
    drum: [
      [X(-12), Y(58)],
      [X(12), Y(58)],
      [X(12), Y(84)],
      [X(-12), Y(84)],
    ],
    dome: { cx: X(0), cy: Y(84), r: 13 * s },
    cross: [X(0), Y(97), X(0), Y(112)],
    tower: [
      [X(38), Y(0)],
      [X(52), Y(0)],
      [X(52), Y(78)],
      [X(38), Y(78)],
    ],
    spire: [
      [X(36), Y(78)],
      [X(54), Y(78)],
      [X(45), Y(112)],
    ],
    door: [
      [X(-7), Y(0)],
      [X(7), Y(0)],
      [X(7), Y(18)],
      [X(-7), Y(18)],
    ],
    fresco: [
      [X(-22), Y(26)],
      [X(22), Y(26)],
      [X(22), Y(38)],
      [X(-22), Y(38)],
    ],
  };
}
function mausoleumShapes(cx, gy, s = 1) {
  const X = (x) => cx + x * s,
    Y = (y) => gy - y * s;
  return {
    terrace: [
      [X(-26), Y(0)],
      [X(26), Y(0)],
      [X(23), Y(-10)],
      [X(-23), Y(-10)],
    ],
    wingL: [
      [X(-20), Y(0)],
      [X(-7), Y(0)],
      [X(-7), Y(14)],
      [X(-20), Y(14)],
    ],
    wingR: [
      [X(7), Y(0)],
      [X(20), Y(0)],
      [X(20), Y(14)],
      [X(7), Y(14)],
    ],
    center: [
      [X(-7), Y(0)],
      [X(7), Y(0)],
      [X(7), Y(16)],
      [X(0), Y(22)],
      [X(-7), Y(16)],
    ],
    door: [
      [X(-3.5), Y(0)],
      [X(3.5), Y(0)],
      [X(3.5), Y(10)],
      [X(-3.5), Y(10)],
    ],
  };
}
function plantShapes(x, gy) {
  const tower = [];
  for (let k = 0; k <= 12; k++) {
    const t = k / 12;
    const w = 30 * Math.sqrt(1 + Math.pow((t - 0.7) / 0.55, 2)) * 0.62;
    tower.push([x - 60 - w, gy - t * 90]);
  }
  for (let k = 12; k >= 0; k--) {
    const t = k / 12;
    const w = 30 * Math.sqrt(1 + Math.pow((t - 0.7) / 0.55, 2)) * 0.62;
    tower.push([x - 60 + w, gy - t * 90]);
  }
  return {
    tower,
    chimney: [
      [x - 6, gy],
      [x + 6, gy],
      [x + 4, gy - 190],
      [x - 4, gy - 190],
    ],
    hall: [
      [x + 14, gy],
      [x + 90, gy],
      [x + 90, gy - 46],
      [x + 14, gy - 46],
    ],
    plume: [
      [x - 60, gy - 110, 22],
      [x - 40, gy - 140, 30],
      [x - 8, gy - 170, 36],
      [x + 34, gy - 192, 34],
    ],
  };
}
const MON = { cx: 250, gy: 1000 };
const PLANT = { x: 1250, gy: 1215 };
const MAUS = { cx: 1284, gy: 388 };

function shapeSvg(pts, fill, o, sw = 1.3) {
  const stroke =
    o.ink && o.ink !== "none"
      ? `stroke="${o.ink}" stroke-width="${sw}" stroke-linejoin="round"`
      : "";
  if (o.wc)
    return (
      poly(
        pts,
        `fill="${fill}" filter="url(#wc)" style="mix-blend-mode:multiply" opacity="0.85"`,
      ) + poly(pts, `fill="none" ${stroke} filter="url(#ink)"`)
    );
  return poly(pts, `fill="${fill}" ${stroke}`);
}
function monasterySvg(o) {
  const gy = townHillY(MON.cx) + 6;
  const m = monasteryShapes(MON.cx, gy, 1.45);
  let s = "";
  // terrace wall
  s += shapeSvg(
    [
      [MON.cx - 200, gy + 22],
      [MON.cx + 180, gy + 22],
      [MON.cx + 180, gy],
      [MON.cx - 200, gy],
    ],
    o.stone,
    o,
  );
  s += shapeSvg(m.konakL, o.wall, o) + shapeSvg(m.konakLRoof, o.roof, o);
  s += shapeSvg(m.konakR, o.wall, o) + shapeSvg(m.konakRRoof, o.roof, o);
  s += shapeSvg(m.drum, o.wall, o);
  s += `<circle cx="${m.dome.cx}" cy="${m.dome.cy}" r="${m.dome.r}" fill="${o.metal}" ${o.ink !== "none" ? `stroke="${o.ink}" stroke-width="1.3"` : ""}/>`;
  s +=
    shapeSvg(m.church, o.wall, o) +
    shapeSvg(m.fresco, o.fresco, o, 1) +
    shapeSvg(m.door, o.neon ? o.wall : "#7a5236", o, 1);
  s +=
    shapeSvg(
      m.tower,
      o.tower || (o.stone === "#120030" ? o.stone : "#d8bf92"),
      o,
    ) + shapeSvg(m.spire, o.metal, o);
  const c = m.cross;
  s += `<line x1="${c[0]}" y1="${c[1]}" x2="${c[2]}" y2="${c[3]}" stroke="${o.cross}" stroke-width="3"/><line x1="${c[0] - 6}" y1="${c[3] + 5}" x2="${c[0] + 6}" y2="${c[3] + 5}" stroke="${o.cross}" stroke-width="3"/>`;
  // arcades / windows
  for (let k = 0; k < 6; k++) {
    const x = MON.cx + (-112 + k * 11) * 1.45;
    s += `<rect x="${x}" y="${gy - 18}" width="${6 * 1.45}" height="${14}" rx="4" fill="${o.neon ? o.ink : "#8a7a62"}" opacity="${o.neon ? 0.8 : 1}"/>`;
  }
  for (let k = 0; k < 5; k++) {
    const x = MON.cx + (-116 + k * 14) * 1.45;
    s += `<rect x="${x}" y="${gy - 44}" width="${7}" height="${8}" fill="${o.neon ? o.ink : "#5b4330"}"/>`;
  }
  return s;
}
function housesSvg(o) {
  let s = "";
  for (const h of houses()) {
    const wall = o.walls[h.c % o.walls.length],
      roof = o.roof[h.c % o.roof.length];
    if (h.block) {
      const hh = h.h + 40;
      s += shapeSvg(
        [
          [h.x, h.y],
          [h.x + h.w + 12, h.y],
          [h.x + h.w + 12, h.y - hh],
          [h.x, h.y - hh],
        ],
        o.block,
        o,
      );
      for (let r = 0; r < 4; r++)
        for (let c = 0; c < 3; c++)
          s += `<rect x="${h.x + 6 + c * (h.w / 3)}" y="${h.y - hh + 8 + r * (hh / 4.4)}" width="6" height="6" fill="${o.win}" opacity="${o.neon ? 0.9 : 0.8}"/>`;
      continue;
    }
    s += shapeSvg(
      [
        [h.x, h.y],
        [h.x + h.w, h.y],
        [h.x + h.w, h.y - h.h],
        [h.x, h.y - h.h],
      ],
      wall,
      o,
    );
    s += shapeSvg(
      [
        [h.x - 5, h.y - h.h],
        [h.x + h.w + 5, h.y - h.h],
        [h.x + h.w * 0.72, h.y - h.h - h.roof],
        [h.x + h.w * 0.28, h.y - h.h - h.roof],
      ],
      roof,
      o,
    );
    s += `<rect x="${h.x + h.w * 0.3}" y="${h.y - h.h * 0.7}" width="7" height="8" fill="${o.win}" opacity="0.85"/>`;
    if (h.w > 44)
      s += `<rect x="${h.x + h.w * 0.65}" y="${h.y - h.h * 0.7}" width="7" height="8" fill="${o.win}" opacity="0.85"/>`;
  }
  return s;
}
function plantSvg(o) {
  const p = plantShapes(PLANT.x, PLANT.gy);
  let s = "";
  if (o.plume !== "none")
    p.plume.forEach(
      (c) =>
        (s += `<circle cx="${c[0]}" cy="${c[1]}" r="${c[2]}" fill="${o.plume}" ${o.wc ? 'filter="url(#wc)" opacity="0.8"' : 'opacity="0.95"'}/>`),
    );
  else
    p.plume.forEach(
      (c) =>
        (s += `<circle cx="${c[0]}" cy="${c[1]}" r="${c[2]}" fill="none" stroke="${o.ink}" stroke-width="1.2" opacity="0.6"/>`),
    );
  s +=
    shapeSvg(p.tower, o.tower, o) +
    shapeSvg(p.hall, o.hall, o) +
    shapeSvg(p.chimney, o.chim, o);
  for (let k = 0; k < 3; k++)
    s += `<rect x="${PLANT.x - 4.5}" y="${PLANT.gy - 186 + k * 22}" width="9" height="10" fill="${o.band}"/>`;
  return s;
}

// Layer markers let one scene description become separate parallax layers on the site.
// <!--L--> starts the next depth layer (default factors sky .3, mountains .55, mid .8, front 1),
// <!--L:0.9--> sets the factor explicitly, <!--O:multiply--> starts a fixed overlay with a blend mode.
const LAYER = "<!--L-->";
const LAYERF = (f) => `<!--L:${f}-->`;
const OVERLAY = (b = "normal") => `<!--O:${b}-->`;
const DEFAULT_F = [0.3, 0.55, 0.8, 1, 1, 1];

function splitLayers(svg) {
  let defs = "";
  const body = svg.replace(/<defs>([\s\S]*?)<\/defs>/g, (m, d) => {
    defs += d;
    return "";
  });
  const parts = body.split(/(<!--[LO](?::[\w.-]+)?-->)/);
  const out = [];
  let cur = { kind: "L", factor: DEFAULT_F[0], blend: "normal", svg: "" };
  let li = 0;
  for (const p of parts) {
    const m = p.match(/^<!--([LO])(?::([\w.-]+))?-->$/);
    if (m) {
      if (cur.svg.trim()) out.push(cur);
      if (m[1] === "L") {
        li++;
        cur = {
          kind: "L",
          factor: m[2] ? +m[2] : DEFAULT_F[Math.min(li, 5)],
          blend: "normal",
          svg: "",
        };
      } else cur = { kind: "O", factor: 0, blend: m[2] || "normal", svg: "" };
    } else cur.svg += p;
  }
  if (cur.svg.trim()) out.push(cur);
  return out.map((l) => ({
    ...l,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${defs}</defs>${l.svg}</svg>`,
  }));
}

// Rasterise each layer at the sampling resolution only (sw x sh), which is all the raster
// skins need, then let proc(d, ctx, index, sw, sh) draw the result into an output canvas
// of size ow x oh (default full page size).
async function rasterLayers(
  svg,
  proc,
  { sw = W, sh = H, ow = W, oh = H } = {},
) {
  const ls = splitLayers(svg);
  const smp = document.createElement("canvas");
  smp.width = sw;
  smp.height = sh;
  const sg = smp.getContext("2d", { willReadFrequently: true });
  const out = [];
  for (let i = 0; i < ls.length; i++) {
    const img = new Image();
    img.src = URL.createObjectURL(
      new Blob([ls[i].svg], { type: "image/svg+xml" }),
    );
    await img.decode();
    sg.clearRect(0, 0, sw, sh);
    sg.drawImage(img, 0, 0, sw, sh);
    URL.revokeObjectURL(img.src);
    const d = sg.getImageData(0, 0, sw, sh).data;
    const cv = document.createElement("canvas");
    cv.width = ow;
    cv.height = oh;
    await proc(d, cv.getContext("2d"), i, sw, sh);
    out.push({
      kind: ls[i].kind,
      factor: ls[i].factor,
      blend: ls[i].blend,
      canvas: cv,
    });
  }
  return out;
}
// nearest-palette index for every sampled pixel, -1 where the layer is transparent
function quantize(d, pal) {
  const P2 = pal.map(hex),
    n = d.length / 4,
    out = new Int16Array(n);
  for (let q = 0; q < n; q++) {
    const o = q * 4;
    if (d[o + 3] < 128) {
      out[q] = -1;
      continue;
    }
    let best = 0,
      bd = 1e9;
    for (let k = 0; k < P2.length; k++) {
      const p = P2[k],
        dr = p[0] - d[o],
        dg = p[1] - d[o + 1],
        db = p[2] - d[o + 2],
        dd = dr * dr + dg * dg + db * db;
      if (dd < bd) {
        bd = dd;
        best = k;
      }
    }
    out[q] = best;
  }
  return out;
}
// mock-up only: flatten layers (strings or canvases) into one picture
async function flattenLayers(res) {
  if (typeof res === "string") return res;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const g = cv.getContext("2d");
  for (const l of res) {
    g.globalCompositeOperation =
      l.blend === "normal" || !l.blend ? "source-over" : l.blend;
    g.imageSmoothingEnabled = l.canvas.width >= W;
    g.drawImage(l.canvas, 0, 0, W, H);
  }
  return `<img src="${cv.toDataURL()}" width="${W}" height="${H}">`;
}

function pinesSvg(list, fill, extra = "") {
  return list
    .map(
      (t) =>
        `<polygon points="${P([
          [t.x - t.w, t.y + 2],
          [t.x + t.w, t.y + 2],
          [t.x, t.y - t.h],
        ])}" fill="${fill}" ${extra}/>`,
    )
    .join("");
}
function bridgeSvg(stroke, w, colStroke, colW, extra = "") {
  const b = bridge();
  let s = "";
  for (const a of b.arches) {
    const pts = archPts(a, b.deck.y);
    s += `<polyline points="${P(pts)}" fill="none" stroke="${stroke}" stroke-width="${a.span > 100 ? w * 1.4 : w}" stroke-linecap="round" ${extra}/>`;
    for (let k = 1; k < 9; k++) {
      const u = -1 + (2 * k) / 9,
        x = a.cx + u * a.span,
        y = b.deck.y + 8 + a.rise * u * u;
      if (y - b.deck.y > 10)
        s += `<line x1="${x}" y1="${b.deck.y + 4}" x2="${x}" y2="${y}" stroke="${colStroke}" stroke-width="${colW}" ${extra}/>`;
    }
  }
  s += `<rect x="${b.deck.x0}" y="${b.deck.y - 5}" width="${b.deck.x1 - b.deck.x0}" height="10" fill="${stroke}" ${extra}/>`;
  return s;
}
function townPines() {
  setSeed(3);
  return pines(-10, 1450, (x) => townHillY(x) + 2, 26, 50, 22).filter(
    (t) => Math.abs(t.x - 250) > 150,
  );
}
function plateauPines() {
  setSeed(5);
  return pines(-10, 1450, (x) => plateauTop(x) + 2, 18, 36, 13).filter(
    (t) => t.x < 292 || t.x > 888,
  );
}
function lowpoly(topFn, x0, x1, bottom, cols, rows, colorFn, sd) {
  setSeed(sd);
  const dx = (x1 - x0) / cols,
    V = [];
  for (let i = 0; i <= cols; i++) {
    const row = [];
    for (let j = 0; j <= rows; j++) {
      let x = x0 + i * dx + (i > 0 && i < cols ? (rnd() - 0.5) * dx * 0.7 : 0);
      const top = topFn(x);
      const t = Math.pow(j / rows, 1.35);
      let y =
        lerp(top, bottom, t) +
        (j > 0 && j < rows
          ? (((rnd() - 0.5) * (bottom - top)) / rows) * 0.6
          : 0);
      if (j === 0) y = top;
      row.push([x, y, rnd() * 30 + (bottom - y) * 0.15]);
    }
    V.push(row);
  }
  const L = [0.55, -0.45, 0.7],
    ln = Math.hypot(...L);
  let s = "";
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      const a = V[i][j],
        b = V[i + 1][j],
        c = V[i + 1][j + 1],
        d = V[i][j + 1];
      const tris =
        (i + j) % 2
          ? [
              [a, b, c],
              [a, c, d],
            ]
          : [
              [a, b, d],
              [b, c, d],
            ];
      for (const t of tris) {
        const u = [t[1][0] - t[0][0], t[1][1] - t[0][1], t[1][2] - t[0][2]],
          v = [t[2][0] - t[0][0], t[2][1] - t[0][1], t[2][2] - t[0][2]];
        let n = [
          u[1] * v[2] - u[2] * v[1],
          u[2] * v[0] - u[0] * v[2],
          u[0] * v[1] - u[1] * v[0],
        ];
        const nl = Math.hypot(...n) || 1;
        n = n.map((q) => q / nl);
        if (n[2] < 0) n = n.map((q) => -q);
        const lam = Math.max(0, (n[0] * L[0] + n[1] * L[1] + n[2] * L[2]) / ln);
        const yc = (t[0][1] + t[1][1] + t[2][1]) / 3;
        s += `<polygon points="${P(t)}" fill="${colorFn(lam, yc)}" stroke="${colorFn(lam, yc)}" stroke-width="0.6"/>`;
      }
    }
  return s;
}
const mixC = (a, b, t) => {
  const p = (h) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16));
  const A = p(a),
    B = p(b);
  return `rgb(${A.map((v, k) => Math.round(lerp(v, B[k], Math.max(0, Math.min(1, t))))).join(",")})`;
};
function flatScene(C) {
  const R = regions();
  let s = `<rect width="${W}" height="${H}" fill="${C.sky}"/>`;
  (C.skyBands || []).forEach(
    ([y, c]) =>
      (s += `<rect y="${y}" width="${W}" height="${H - y}" fill="${c}"/>`),
  );
  s += `<circle cx="${C.sunX || 200}" cy="${C.sunY || 260}" r="${C.sunR || 70}" fill="${C.sun}"/>`;
  const cloud = (x, y, k) =>
    `<g fill="${C.cloud}"><ellipse cx="${x}" cy="${y}" rx="${70 * k}" ry="${22 * k}"/><circle cx="${x - 25 * k}" cy="${y - 14 * k}" r="${26 * k}"/><circle cx="${x + 18 * k}" cy="${y - 22 * k}" r="${32 * k}"/></g>`;
  s += cloud(1250, 140, 1) + cloud(160, 420, 0.8) + cloud(1350, 330, 0.7);
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
  const m = mausoleumShapes(MAUS.cx, MAUS.gy, 1.6);
  s +=
    poly(m.terrace, `fill="${C.snow}"`) +
    poly(m.wingL, `fill="${C.snow}"`) +
    poly(m.wingR, `fill="${C.snow}"`) +
    poly(m.center, `fill="${C.navy}"`);
  s += LAYER;
  s += poly(R.plateau, `fill="${C.plat}"`) + pinesSvg(plateauPines(), C.pine);
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
  s += bridgeSvg(C.bridge, C.bw || 9, C.bridge, C.cw || 5);
  s += LAYER;
  s += poly(R.hill, `fill="${C.hill}"`) + pinesSvg(townPines(), C.hillPine);
  s += poly(R.ground, `fill="${C.ground}"`);
  s += monasterySvg({
    wall: C.wall,
    roof: C.roof,
    metal: C.metal,
    stone: C.stone,
    ink: "none",
    cross: C.sun,
    fresco: C.navy,
  });
  s += housesSvg({
    walls: C.walls,
    roof: C.roofs,
    block: C.wall,
    win: C.navy,
    ink: "none",
  });
  s += plantSvg({
    tower: C.metal,
    chim: C.wall,
    band: C.roof,
    hall: C.wall,
    plume: C.cloud,
    ink: "none",
  });
  s +=
    poly(R.river, `fill="${C.river}"`) + poly(R.meadow, `fill="${C.meadow}"`);
  for (let k = 0; k < 5; k++)
    s += `<path d="M-10 ${1560 + k * 50} Q720 ${1530 + k * 50} 1450 ${1575 + k * 50}" stroke="${C.meadow2}" stroke-width="12" fill="none"/>`;
  return s;
}
const hex = (h) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16));
function shards(clipId, x0, x1, y0, y1, cols, rows, pal, sd, lead, lw = 3) {
  setSeed(sd);
  const V = [];
  for (let i = 0; i <= cols; i++) {
    const r = [];
    for (let j = 0; j <= rows; j++) {
      const ex = i > 0 && i < cols,
        ey = j > 0 && j < rows;
      r.push([
        x0 +
          ((x1 - x0) * i) / cols +
          (ex ? (((rnd() - 0.5) * (x1 - x0)) / cols) * 0.8 : 0),
        y0 +
          ((y1 - y0) * j) / rows +
          (ey ? (((rnd() - 0.5) * (y1 - y0)) / rows) * 0.8 : 0),
      ]);
    }
    V.push(r);
  }
  let s = `<g clip-path="url(#${clipId})">`;
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      const a = V[i][j],
        b = V[i + 1][j],
        c = V[i + 1][j + 1],
        d = V[i][j + 1];
      const tris =
        rnd() < 0.5
          ? [
              [a, b, c],
              [a, c, d],
            ]
          : [
              [a, b, d],
              [b, c, d],
            ];
      if (rnd() < 0.35) tris.splice(0, 2, [a, b, c, d]);
      for (const t of tris)
        s += `<polygon points="${P(t)}" fill="${pal[Math.floor(rnd() * pal.length)]}" stroke="${lead}" stroke-width="${lw}" stroke-linejoin="round"/>`;
    }
  return s + "</g>";
}
const thick = (svg, w) =>
  svg.replace(/stroke-width="1(\.3)?"/g, `stroke-width="${w}"`);

export {
  BASE,
  DEFAULT_F,
  DUR,
  H,
  LAYER,
  LAYERF,
  LOV,
  MAUS,
  MON,
  OVERLAY,
  P,
  PLANT,
  W,
  archPts,
  bridge,
  bridgeSvg,
  flatScene,
  flattenLayers,
  hex,
  hillY,
  houses,
  housesSvg,
  lerp,
  lowpoly,
  mausoleumShapes,
  mixC,
  monasteryShapes,
  monasterySvg,
  pathD,
  peaks,
  pines,
  pinesSvg,
  plantShapes,
  plantSvg,
  plateauPines,
  plateauTop,
  poly,
  quantize,
  rasterLayers,
  regions,
  ridgeY,
  riverY,
  rnd,
  setSeed,
  shadowFaces,
  shapeSvg,
  shards,
  snowCaps,
  splitLayers,
  thick,
  townHillY,
  townPines,
};
