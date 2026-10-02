// ---------------------------------------------------------------------------
//  Pljevlja diorama — scroll-driven cut-out cartoon background
//
//  mountDiorama(canvas) renders a procedural landscape of the Pljevlja
//  area (Ljubišnja, the Tara canyon & bridge, the Husein-paša mosque, …)
//  into a fixed <canvas>. Page scroll moves the camera down from the peaks
//  into the valley; light theme runs morning → sunset, dark theme is night.
//
//  No dependencies. WebGL2 with a WebGL1 fallback; if neither is available
//  the page keeps a plain CSS gradient (html.diorama-fallback).
//
//  Tweaking: DAY / NIGHT hold the colour keys, DAY_CURVE maps scroll to the
//  time of day, CAM_WIDE / CAM_NARROW are the camera keyframes (desktop /
//  phone). Preview any moment with ?diorama-p=0.8&diorama-night=1.
//
//  Styles (option `style` or ?diorama-style=): "cutout" (default: flat
//  colours, ink outlines, hard shadows), "painterly", "pixel", "riso".
// ---------------------------------------------------------------------------
import FRAG from "./diorama.frag?raw";
import POST from "./diorama-post.frag?raw";
// Durmitor, Ljubišnja and Lovćen, painted from eroded terrain models (see the README)
import MOUNTAINS_URL from "./mountains.webp?url";

const VERT_300 = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;
const VERT_100 = `attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const HEAD_300 = `#version 300 es
precision highp float;
precision highp sampler2D;
out vec4 fragColor;
#define gl_FragColor_OUT fragColor
`;
const HEAD_100 = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
#define texture texture2D
#define fragColor gl_FragColor
#define gl_FragColor_OUT gl_FragColor
`;

// ---------------------------------------------------------------- palettes
const hex = (h) => [
  parseInt(h.slice(1, 3), 16) / 255,
  parseInt(h.slice(3, 5), 16) / 255,
  parseInt(h.slice(5, 7), 16) / 255,
];
const scale = (c, s) => c.map((v) => v * s);

// Light theme: the day passes as you scroll (t = 0 morning … 1 sunset).
// sun: [u (screen x, height units), elevation above horizon, radius]
const DAY = [
  {
    t: 0.0,
    skyTop: hex("#2d7ed8"),
    skyMid: hex("#69ade7"),
    skyHor: hex("#d3e8f2"),
    sunDisc: hex("#fffdf4"),
    sunGlow: scale(hex("#ffe7b0"), 0.95),
    sunCol: scale(hex("#fff1d8"), 1.05),
    amb: scale(hex("#9cbad8"), 0.64),
    haze: hex("#bcd5e9"),
    fog: hex("#eef4f7"),
    sun: [0.62, 0.44, 0.034],
    fogAmt: 0.55,
    hazeD: 0.018,
    backlit: 0.3,
    rim: 0.22,
    cloud: 0.1,
    lights: 0,
  },
  {
    t: 0.38,
    skyTop: hex("#2977d0"),
    skyMid: hex("#6cafe7"),
    skyHor: hex("#d6ebf2"),
    sunDisc: hex("#fffef6"),
    sunGlow: scale(hex("#fff0c8"), 0.9),
    sunCol: scale(hex("#fff5e6"), 1.1),
    amb: scale(hex("#a2bed9"), 0.62),
    haze: hex("#c0d8e9"),
    fog: hex("#e7f0f4"),
    sun: [0.56, 0.36, 0.034],
    fogAmt: 0.3,
    hazeD: 0.018,
    backlit: 0.3,
    rim: 0.25,
    cloud: 0.12,
    lights: 0,
  },
  {
    t: 0.7,
    skyTop: hex("#3a6cb2"),
    skyMid: hex("#94aed0"),
    skyHor: hex("#ffd59e"),
    sunDisc: hex("#fff3cc"),
    sunGlow: scale(hex("#ffbf6e"), 1.0),
    sunCol: scale(hex("#ffc98a"), 1.1),
    amb: scale(hex("#8a97bc"), 0.56),
    haze: hex("#e3c7ab"),
    fog: hex("#f3d8ba"),
    sun: [0.44, 0.17, 0.036],
    fogAmt: 0.34,
    hazeD: 0.022,
    backlit: 0.66,
    rim: 0.62,
    cloud: 0.12,
    lights: 0.02,
  },
  {
    t: 1.0,
    skyTop: hex("#2b4683"),
    skyMid: hex("#b07998"),
    skyHor: hex("#ffb26c"),
    sunDisc: hex("#ffe7aa"),
    sunGlow: scale(hex("#ff9646"), 1.05),
    sunCol: scale(hex("#ffa262"), 1.0),
    amb: scale(hex("#776b9b"), 0.52),
    haze: hex("#d59b88"),
    fog: hex("#e9af8f"),
    sun: [0.37, 0.075, 0.04],
    fogAmt: 0.38,
    hazeD: 0.024,
    backlit: 0.86,
    rim: 0.95,
    cloud: 0.13,
    lights: 0.32,
  },
];

// Dark theme: moonlit night (p = scroll progress 0 … 1)
const NIGHT = [
  {
    t: 0.0,
    skyTop: hex("#050a24"),
    skyMid: hex("#0d1946"),
    skyHor: hex("#28325f"),
    sunDisc: hex("#000000"),
    sunGlow: hex("#000000"),
    sunCol: scale(hex("#a3b8e8"), 0.34),
    amb: scale(hex("#2b3a6c"), 0.5),
    haze: hex("#1d2853"),
    fog: hex("#2c3b6d"),
    moon: [-0.52, 0.47, 0.03],
    fogAmt: 0.34,
    hazeD: 0.024,
    backlit: 0.4,
    rim: 0.55,
    cloud: 0.06,
    lights: 1,
  },
  {
    t: 1.0,
    skyTop: hex("#04081c"),
    skyMid: hex("#0b153d"),
    skyHor: hex("#222c58"),
    sunDisc: hex("#000000"),
    sunGlow: hex("#000000"),
    sunCol: scale(hex("#a3b8e8"), 0.3),
    amb: scale(hex("#28366a"), 0.48),
    haze: hex("#1b2550"),
    fog: hex("#2a3867"),
    moon: [-0.42, 0.22, 0.032],
    fogAmt: 0.4,
    hazeD: 0.025,
    backlit: 0.45,
    rim: 0.6,
    cloud: 0.07,
    lights: 1,
  },
];

// ------------------------------------------------------------------ styles
// painterly = soft atmospheric render; the others add a post pass.
const STYLES = { painterly: 0, cutout: 1, pixel: 2, riso: 3 };
const STYLE_CFG = {
  painterly: { flat: 0, flatSky: 0, cel: 0.3, trees: 1, haze: 1 },
  // brutalist cut-out: flat stickers, thick ink outlines, hard offset shadows
  cutout: {
    flat: 1,
    flatSky: 1,
    cel: 0.3,
    trees: 2.1,
    haze: 0.22,
    outline: 2.2,
    shadow: 6,
    shadowAlpha: 0.5,
    sat: 1,
    contrast: 1,
    exposure: 1,
    ink: "#26344f",
    inkNight: "#04081a",
  },
  // pixel art: 4 px pixels at 1080p, 32-colour palettes, ordered dithering
  pixel: {
    flat: 1,
    flatSky: 0,
    cel: 0.3,
    trees: 1.4,
    haze: 0.5,
    pixel: 4,
    sat: 1.6,
    contrast: 1.08,
    ink: "#231f20",
    inkNight: "#02040c",
  },
  // risograph: inks on paper with halftone screens
  riso: {
    flat: 1,
    flatSky: 0,
    cel: 0.3,
    trees: 1.6,
    haze: 0.75,
    outline: 1.3,
    sat: 1.25,
    contrast: 1.05,
    ink: "#231f20",
    inkNight: "#231f20",
  },
};
// sky overrides for the cut-out style: the site's own flat blue / navy
const CUTOUT_SKY_DAY = [
  {
    t: 0.0,
    skyTop: hex("#0096ff"),
    skyMid: hex("#1ea3ff"),
    skyHor: hex("#5cbcff"),
    haze: hex("#c4ecff"),
  },
  {
    t: 0.6,
    skyTop: hex("#0096ff"),
    skyMid: hex("#1ea3ff"),
    skyHor: hex("#8fd3ff"),
    haze: hex("#c4ecff"),
  },
  {
    t: 0.72,
    skyTop: hex("#0096ff"),
    skyMid: hex("#4db6ff"),
    skyHor: hex("#fff3c4"),
    haze: hex("#d8eef8"),
  },
  {
    t: 0.84,
    skyTop: hex("#0096ff"),
    skyMid: hex("#cfeaff"),
    skyHor: hex("#ffe07a"),
    haze: hex("#f3e2c8"),
  },
  {
    t: 1.0,
    skyTop: hex("#0096ff"),
    skyMid: hex("#ffb45e"),
    skyHor: hex("#ffe066"),
    haze: hex("#f6c79f"),
  },
];
const CUTOUT_SKY_NIGHT = {
  skyTop: hex("#031031"),
  skyMid: hex("#051539"),
  skyHor: hex("#0a1c48"),
  haze: hex("#15244f"),
};
const PAL_PIXEL_DAY = [
  "#0a3a7a",
  "#0b64c7",
  "#0096ff",
  "#35a9ff",
  "#7fc8ff",
  "#c4e7ff",
  "#ffffff",
  "#0f2e1a",
  "#1b4d2c",
  "#236b35",
  "#139a43",
  "#4bb54a",
  "#8fd35a",
  "#c8ec8a",
  "#3b2a20",
  "#6b4a32",
  "#9c7048",
  "#c9a36a",
  "#e9d4a7",
  "#231f20",
  "#4e4a55",
  "#8a8f99",
  "#c7ccd3",
  "#9e2a1f",
  "#d9442f",
  "#f28b4b",
  "#f4e04d",
  "#ffd6a0",
  "#6d4a8f",
  "#c46a9d",
  "#ff9e6b",
  "#2aa3a0",
].map(hex);
const PAL_PIXEL_NIGHT = [
  "#02040c",
  "#060d24",
  "#0c1a42",
  "#152a63",
  "#22408a",
  "#3a5fb0",
  "#7f9be0",
  "#dfe8ff",
  "#07130d",
  "#0e2418",
  "#163823",
  "#23522f",
  "#2f6b3a",
  "#fff3b0",
  "#ffd36b",
  "#ff9f43",
  "#e0602f",
  "#1a1a24",
  "#34344a",
  "#5a5f78",
  "#9aa3bd",
  "#ffffff",
  "#c7ccd3",
  "#1f1712",
  "#3a2a1e",
  "#5c4330",
  "#6b1d1d",
  "#a33a2c",
  "#2b1f3a",
  "#4a3563",
  "#7b5fa0",
  "#1f6f6c",
].map(hex);
const PAL_RISO_DAY = [
  "#f4ecdc",
  "#0078d7",
  "#5cb8ff",
  "#ffd23f",
  "#18a34a",
  "#0b5a2b",
  "#e2432f",
  "#ff7eb6",
  "#ff9a3c",
  "#231f20",
  "#1fb5a9",
].map(hex);
const PAL_RISO_NIGHT = [
  "#031031",
  "#16295e",
  "#3151a0",
  "#f4ecdc",
  "#ffd23f",
  "#18a34a",
  "#0b3a22",
  "#231f20",
  "#e2432f",
].map(hex);

// Scroll progress → time of day (light theme)
const DAY_CURVE = [
  [0.0, 0.0],
  [0.3, 0.2],
  [0.62, 0.48],
  [0.85, 0.8],
  [1.0, 1.0],
];

// Scroll progress → camera. x: world x, h: height above the valley, v: horizon (screen)
const CAM_WIDE = [
  { p: 0.0, x: -0.3, h: 7.4, v: 0.26 },
  { p: 0.2, x: -0.55, h: 6.4, v: 0.3 },
  { p: 0.45, x: -0.5, h: 4.5, v: 0.37 },
  { p: 0.66, x: -0.15, h: 2.6, v: 0.45 },
  { p: 0.8, x: 0.12, h: 1.6, v: 0.52 },
  { p: 0.9, x: 0.24, h: 1.15, v: 0.58 },
  { p: 1.0, x: 0.3, h: 0.95, v: 0.62 },
];
const CAM_NARROW = [
  { p: 0.0, x: -0.6, h: 7.4, v: 0.3 },
  { p: 0.2, x: -0.3, h: 6.4, v: 0.33 },
  { p: 0.45, x: 0.15, h: 4.5, v: 0.38 },
  { p: 0.66, x: 0.8, h: 2.6, v: 0.45 },
  { p: 0.8, x: 1.45, h: 1.6, v: 0.51 },
  { p: 0.9, x: 1.75, h: 1.15, v: 0.56 },
  { p: 1.0, x: 1.9, h: 0.95, v: 0.6 },
];

// Far mountains: where each painting sits in the atlas (u0, v0, u1, v1), its height / width,
// and (Lovćen) where the Njegoš Mausoleum stands in the picture (u, v from the top left)
const MTN = {
  durmitor: { rect: [0.0, 0.0, 0.75, 0.37793], aspect: 0.12598 },
  ljubisnja: { rect: [0.0, 0.39062, 0.5, 0.66992], aspect: 0.13965 },
  lovcen: {
    rect: [0.5, 0.39062, 1.0, 0.62598],
    aspect: 0.11768,
    summit: [0.7383, 0.275],
  },
};
// Placement, as seen at the top of the page: left / right edge (screen x in screen heights,
// 0 = centre), bottom edge (screen y, 0 = bottom) and a vertical stretch. The paintings sit at
// the depth of their layer, so they still parallax correctly while you scroll.
// MTN_WIDE is laid out for a 16:9 screen. On wider or narrower screens each picture keeps its
// size and slides so that its anchor (a: share of its width, e.g. the Lovćen summit) keeps the
// same place relative to the screen's edges. MTN_NARROW is for phones.
const MTN_WIDE = {
  durmitor: { z: 110, l: -1.2, r: 0.62, b: 0.165, s: 1.4, a: 0.5 },
  ljubisnja: { z: 52, l: 0.1, r: 1.35, b: 0.12, s: 0.91, a: 0.35 },
  lovcen: { z: 130, l: -0.112, r: 0.988, b: 0.27, s: 1.55, a: 0.738 },
};
const MTN_NARROW = {
  durmitor: { z: 110, l: -0.62, r: 0.2, b: 0.2, s: 1.5 },
  ljubisnja: { z: 52, l: 0.02, r: 0.66, b: 0.16, s: 1.2 },
  lovcen: { z: 130, l: -0.24, r: 0.26, b: 0.225, s: 1.8 },
};

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);

function mixVal(a, b, t) {
  if (Array.isArray(a)) return a.map((v, i) => lerp(v, b[i], t));
  return lerp(a, b, t);
}
function sampleKeys(keys, t) {
  if (t <= keys[0].t) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i],
      b = keys[i + 1];
    if (t <= b.t) {
      const k = smooth((t - a.t) / (b.t - a.t));
      const out = {};
      for (const key in a)
        out[key] = key === "t" ? t : mixVal(a[key], b[key], k);
      return out;
    }
  }
  return keys[keys.length - 1];
}
function piecewise(curve, x) {
  if (x <= curve[0][0]) return curve[0][1];
  for (let i = 0; i < curve.length - 1; i++) {
    const [x0, y0] = curve[i],
      [x1, y1] = curve[i + 1];
    if (x <= x1) return lerp(y0, y1, (x - x0) / (x1 - x0));
  }
  return curve[curve.length - 1][1];
}
// Catmull-Rom through camera keys (smooth, no kinks at the keys)
function sampleCam(keys, p) {
  const n = keys.length;
  let i = 0;
  while (i < n - 2 && p > keys[i + 1].p) i++;
  const k0 = keys[Math.max(0, i - 1)],
    k1 = keys[i],
    k2 = keys[i + 1],
    k3 = keys[Math.min(n - 1, i + 2)];
  const t = clamp01((p - k1.p) / (k2.p - k1.p));
  const cr = (a, b, c, d) => {
    const t2 = t * t,
      t3 = t2 * t;
    const m1 = ((c - a) / (k2.p - k0.p || 1)) * (k2.p - k1.p);
    const m2 = ((d - b) / (k3.p - k1.p || 1)) * (k2.p - k1.p);
    return (
      (2 * t3 - 3 * t2 + 1) * b +
      (t3 - 2 * t2 + t) * m1 +
      (-2 * t3 + 3 * t2) * c +
      (t3 - t2) * m2
    );
  };
  return {
    x: cr(k0.x, k1.x, k2.x, k3.x),
    h: cr(k0.h, k1.h, k2.h, k3.h),
    v: cr(k0.v, k1.v, k2.v, k3.v),
  };
}

// 256² random texture for 2D value noise (sampled with the smooth trick)
function noiseTexture(gl) {
  const size = 256;
  const data = new Uint8Array(size * size * 4);
  let s = 1337;
  const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  for (let i = 0; i < data.length; i++) data[i] = Math.floor(rnd() * 256);
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    size,
    size,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    data,
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  return tex;
}

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error("Diorama shader error: " + log);
  }
  return sh;
}

const UNIFORMS = [
  "uRes",
  "uTime",
  "uCam",
  "uNoise",
  "uSkyTop",
  "uSkyMid",
  "uSkyHor",
  "uSunDisc",
  "uSunGlow",
  "uSunCol",
  "uAmb",
  "uHaze",
  "uFogCol",
  "uSun",
  "uMoon",
  "uLight",
  "uMisc",
  "uMisc2",
  "uLayout",
  "uLayout2",
  "uStyle",
  "uCelTint",
  "uLayout4",
  "uLayout5",
  "uMtn",
  "uMtnA",
  "uDurRect",
  "uLjuRect",
  "uLovRect",
  "uDurPos",
  "uLjuPos",
  "uLovPos",
  "uMaus",
  "uLayout6",
];
const POST_UNIFORMS = [
  "uScene",
  "uRes",
  "uSceneRes",
  "uInk",
  "uPost",
  "uPal",
  "uPalN",
  "uGrade",
];

export function mountDiorama(canvas, options = {}) {
  if (!canvas) return null;
  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const opts = {
    maxPixelRatio: 1.5, // painterly scene: 1.5× is plenty even on 3× phones
    idleFps: coarse ? 24 : 30, // ambient animation rate while the page is not scrolling
    forceWebGL1: false,
    style: "cutout",
    ...options,
    ...(window.__DIORAMA_OPTIONS__ || {}),
  };
  if (params.has("diorama-style")) opts.style = params.get("diorama-style");
  const styleId = STYLES[opts.style] ?? 0;
  const cfg = STYLE_CFG[opts.style] || STYLE_CFG.painterly;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // ----- GL setup
  const ctxOpts = {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    powerPreference: "default",
    preserveDrawingBuffer: !!opts.preserveDrawingBuffer,
  };
  let gl = opts.forceWebGL1 ? null : canvas.getContext("webgl2", ctxOpts);
  const isGL2 = !!gl;
  if (!gl)
    gl =
      canvas.getContext("webgl", ctxOpts) ||
      canvas.getContext("experimental-webgl", ctxOpts);
  if (!gl) {
    root.classList.add("diorama-fallback");
    return null;
  }

  let prog,
    loc,
    buf,
    tex,
    postProg,
    postLoc,
    fbo,
    fboTex,
    fboW = 0,
    fboH = 0;
  function link(vsSrc, fsSrc) {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vsSrc));
    gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fsSrc));
    gl.bindAttribLocation(p, 0, "aPos");
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS))
      throw new Error("Diorama link error: " + gl.getProgramInfoLog(p));
    return p;
  }
  function ensureFBO(w, h) {
    if (fbo && w === fboW && h === fboH) return;
    if (!fbo) {
      fbo = gl.createFramebuffer();
      fboTex = gl.createTexture();
    }
    gl.bindTexture(gl.TEXTURE_2D, fboTex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      w,
      h,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      fboTex,
      0,
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    fboW = w;
    fboH = h;
  }
  const mtn = { tex: null, img: null, ready: false, readyAt: 0 };
  function uploadMountains() {
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, mtn.tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      mtn.img,
    );
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR,
    );
    gl.activeTexture(gl.TEXTURE0);
    if (!mtn.ready) {
      mtn.ready = true;
      mtn.readyAt = performance.now();
    }
  }
  function loadMountains() {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      mtn.img = img;
      if (gl.isContextLost()) return;
      try {
        uploadMountains();
      } catch (err) {
        console.warn(err);
      }
      state.dirty = true;
    };
    img.src = MOUNTAINS_URL;
  }
  function init() {
    const vs = compile(gl, gl.VERTEX_SHADER, isGL2 ? VERT_300 : VERT_100);
    const fs = compile(
      gl,
      gl.FRAGMENT_SHADER,
      (isGL2 ? HEAD_300 : HEAD_100) + FRAG,
    );
    prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.bindAttribLocation(prog, 0, "aPos");
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
      throw new Error("Diorama link error: " + gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    loc = {};
    for (const u of UNIFORMS) loc[u] = gl.getUniformLocation(prog, u);
    buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    tex = noiseTexture(gl);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(loc.uNoise, 0);
    // far mountains: an empty texture until the painting has loaded, then it fades in
    mtn.tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, mtn.tex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array(4),
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (mtn.img && mtn.img.complete && mtn.img.naturalWidth) uploadMountains();
    gl.activeTexture(gl.TEXTURE0);
    if (styleId > 0) {
      const head = (isGL2 ? HEAD_300 : HEAD_100) + `#define STYLE ${styleId}\n`;
      postProg = link(isGL2 ? VERT_300 : VERT_100, head + POST);
      postLoc = {};
      for (const u of POST_UNIFORMS)
        postLoc[u] = gl.getUniformLocation(postProg, u);
      fbo = null;
      fboW = fboH = 0;
    }
  }
  try {
    init();
  } catch (err) {
    console.warn(err);
    root.classList.add("diorama-fallback");
    return null;
  }
  root.classList.add("diorama-ready");
  loadMountains();

  // ----- state
  const isDark = () => root.classList.contains("darkTheme");
  const state = {
    p: 0,
    pTarget: 0,
    night: isDark() ? 1 : 0,
    nightTarget: isDark() ? 1 : 0,
    time: 12.0,
    quality: 1,
    width: 0,
    height: 0,
    needsResize: true,
    mouseX: 0,
    mouseY: 0,
    mx: 0,
    my: 0,
    lastDraw: 0,
    last: 0,
    dirty: true,
    frameTimes: [],
  };

  const readScroll = () => {
    const max = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight,
    );
    state.pTarget = clamp01(window.scrollY / max);
  };
  readScroll();
  state.p = state.pTarget;

  // debug / preview overrides: ?diorama-p=0.5&diorama-night=1&diorama-time=20
  const ov = {
    p: params.has("diorama-p") ? parseFloat(params.get("diorama-p")) : null,
    night: params.has("diorama-night")
      ? parseFloat(params.get("diorama-night"))
      : null,
    time: params.has("diorama-time")
      ? parseFloat(params.get("diorama-time"))
      : null,
  };

  function resize() {
    if (!state.needsResize) return;
    state.needsResize = false;
    const rect = canvas.getBoundingClientRect();
    const dpr =
      Math.min(window.devicePixelRatio || 1, opts.maxPixelRatio) *
      state.quality;
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    if (w !== state.width || h !== state.height) {
      canvas.width = state.width = w;
      canvas.height = state.height = h;
      state.dirty = true;
    }
  }

  function uniforms(W, H) {
    const aspect = W / H;
    const narrow = 1 - smooth(clamp01((aspect - 0.7) / 0.6));
    const p = ov.p ?? state.p;
    const night = ov.night ?? state.night;

    // camera
    const cw = sampleCam(CAM_WIDE, p),
      cn = sampleCam(CAM_NARROW, p);
    const cam = {
      x: lerp(cw.x, cn.x, narrow),
      h: lerp(cw.h, cn.h, narrow),
      v: lerp(cw.v, cn.v, narrow),
    };
    // gentle mouse parallax (desktop only)
    cam.x += state.mx * 0.035;
    cam.h -= state.my * 0.02;

    // palette
    const tDay = piecewise(DAY_CURVE, p);
    const day = { ...sampleKeys(DAY, tDay) };
    const nt = { ...sampleKeys(NIGHT, p) };
    if (styleId === 1) {
      Object.assign(day, sampleKeys(CUTOUT_SKY_DAY, tDay), {
        sunDisc: hex("#f4e04d"),
      });
      Object.assign(nt, CUTOUT_SKY_NIGHT);
    }
    const m = (k) => mixVal(day[k], nt[k], night);

    const sunW = (1 - night) * 1.0;
    // on phones pull the sun and moon towards the middle so they stay in frame
    const inX = lerp(1, 0.28, narrow);
    const sun = [
      lerp(day.sun[0], -0.08, narrow),
      cam.v + day.sun[1],
      day.sun[2],
      sunW,
    ];
    const moon = [nt.moon[0] * inX, cam.v + nt.moon[1], nt.moon[2], night];
    // 2D light direction (towards the sun, or the moon at night)
    const ld = (s) => {
      const lx = s[0] * 0.9,
        ly = s[1] * 2.2 + 0.15;
      const l = Math.hypot(lx, ly);
      return [lx / l, ly / l];
    };
    const l0 = ld(day.sun),
      l1 = ld(nt.moon);
    let lx = lerp(l0[0], l1[0], night),
      ly = lerp(l0[1], l1[1], night);
    const ll = Math.hypot(lx, ly) || 1;
    lx /= ll;
    ly /= ll;

    // layout of props so the story also reads on a phone
    const endX = lerp(
      CAM_WIDE[CAM_WIDE.length - 1].x,
      CAM_NARROW[CAM_NARROW.length - 1].x,
      narrow,
    );
    const flagX = endX + lerp(0.6, 0.1, narrow) * 1.6;
    const katunX = endX + lerp(-0.55, -0.17, narrow) * 1.6;
    const bridgeX = lerp(-6.3, 0.3, narrow);
    const saddleX = lerp(-2.4, 0.4, narrow);
    const monasteryX = lerp(-0.75, 1.05, narrow);
    const edge = (aspect / 2) * 0.94;

    gl.uniform2f(loc.uRes, W, H);
    gl.uniform1f(loc.uTime, ov.time ?? state.time);
    gl.uniform3f(loc.uCam, cam.x, cam.h, cam.v);
    gl.uniform3fv(loc.uSkyTop, m("skyTop"));
    gl.uniform3fv(loc.uSkyMid, m("skyMid"));
    gl.uniform3fv(loc.uSkyHor, m("skyHor"));
    gl.uniform3fv(loc.uSunDisc, day.sunDisc);
    gl.uniform3fv(loc.uSunGlow, day.sunGlow);
    gl.uniform3fv(loc.uSunCol, m("sunCol"));
    gl.uniform3fv(loc.uAmb, m("amb"));
    gl.uniform3fv(loc.uHaze, m("haze"));
    gl.uniform3fv(loc.uFogCol, m("fog"));
    gl.uniform4f(loc.uSun, sun[0], sun[1], sun[2], sun[3]);
    gl.uniform4f(loc.uMoon, moon[0], moon[1], moon[2], moon[3]);
    gl.uniform2f(loc.uLight, lx, ly);
    gl.uniform4f(
      loc.uMisc,
      m("lights"),
      night,
      m("fogAmt"),
      m("hazeD") * cfg.haze,
    );
    gl.uniform4f(loc.uMisc2, m("backlit"), m("rim"), m("cloud"), night);
    gl.uniform4f(loc.uLayout, flagX, katunX, -edge, edge);
    gl.uniform4f(
      loc.uLayout2,
      bridgeX,
      saddleX,
      monasteryX,
      lerp(1, 0.6, narrow),
    );
    gl.uniform4f(loc.uStyle, cfg.flat, cfg.flatSky, cfg.cel, cfg.trees);
    // bridge length, power plant x, coal mine x, mountain height
    gl.uniform4f(
      loc.uLayout4,
      lerp(24, 13, narrow),
      lerp(2.2, 2.75, narrow),
      lerp(-2.8, -0.35, narrow),
      lerp(1, 0.85, narrow),
    );
    // power plant scale, plume scale, coal mine width
    gl.uniform4f(
      loc.uLayout5,
      lerp(1, 0.8, narrow),
      lerp(1, 0.75, narrow),
      lerp(1, 0.55, narrow),
      lerp(1.45, 1.0, narrow),
    );
    // Holy Trinity Monastery terrace height; size of the Njegoš Mausoleum (picture width / n)
    gl.uniform4f(
      loc.uLayout6,
      lerp(0.74, 0.7, narrow),
      lerp(66, 54, narrow),
      0,
      0,
    );
    // far mountains, placed in screen terms at the top of the page, then turned into world units
    const c0w = sampleCam(CAM_WIDE, 0),
      c0n = sampleCam(CAM_NARROW, 0);
    const c0 = {
      x: lerp(c0w.x, c0n.x, narrow),
      h: lerp(c0w.h, c0n.h, narrow),
      v: lerp(c0w.v, c0n.v, narrow),
    };
    const kx = aspect / 2 / 0.889; // 1 on a 16:9 screen
    const place = (k) => {
      const w = MTN_WIDE[k],
        n = MTN_NARROW[k];
      const ww = w.r - w.l;
      const lw = (w.l + w.a * ww) * kx - w.a * ww;
      const L = lerp(lw, n.l, narrow),
        R = lerp(lw + ww, n.r, narrow),
        Bv = lerp(w.b, n.b, narrow),
        S = lerp(w.s, n.s, narrow);
      const z = w.z;
      const xl = c0.x + L * z,
        xr = c0.x + R * z;
      const yb = c0.h + (Bv - c0.v) * z;
      return [xl, xr, yb, yb + (xr - xl) * MTN[k].aspect * S];
    };
    const dur = place("durmitor"),
      lju = place("ljubisnja"),
      lov = place("lovcen");
    gl.uniform1i(loc.uMtn, 2);
    const mtnFade = mtn.ready
      ? clamp01((performance.now() - mtn.readyAt) / 700)
      : 0;
    if (mtn.ready && mtnFade < 1) state.dirty = true; // keep drawing until the fade-in is done
    gl.uniform1f(loc.uMtnA, mtnFade);
    gl.uniform4fv(loc.uDurRect, MTN.durmitor.rect);
    gl.uniform4fv(loc.uLjuRect, MTN.ljubisnja.rect);
    gl.uniform4fv(loc.uLovRect, MTN.lovcen.rect);
    gl.uniform4fv(loc.uDurPos, dur);
    gl.uniform4fv(loc.uLjuPos, lju);
    gl.uniform4fv(loc.uLovPos, lov);
    const su = MTN.lovcen.summit;
    gl.uniform2f(
      loc.uMaus,
      lerp(lov[0], lov[1], su[0]),
      lerp(lov[3], lov[2], su[1]),
    );
    // flat styles: warm the landscape towards sunset, cool it down at night
    const warm = smooth(clamp01((tDay - 0.62) / 0.38));
    gl.uniform3fv(
      loc.uCelTint,
      mixVal(
        mixVal([1, 1, 1], [1.04, 0.92, 0.82], warm),
        [0.3, 0.35, 0.58],
        night,
      ),
    );
    return night;
  }

  function postUniforms(night, sw, sh) {
    gl.uniform1i(postLoc.uScene, 1);
    gl.uniform2f(postLoc.uRes, state.width, state.height);
    gl.uniform2f(postLoc.uSceneRes, sw, sh);
    gl.uniform3fv(postLoc.uInk, mixVal(hex(cfg.ink), hex(cfg.inkNight), night));
    gl.uniform4f(
      postLoc.uPost,
      cfg.outline || 2,
      cfg.shadow || 0,
      cfg.shadowAlpha || 0,
      state.time,
    );
    gl.uniform3f(
      postLoc.uGrade,
      cfg.sat || 1,
      cfg.contrast || 1,
      cfg.exposure || 1,
    );
    const pal =
      styleId === 2
        ? night > 0.5
          ? PAL_PIXEL_NIGHT
          : PAL_PIXEL_DAY
        : night > 0.5
          ? PAL_RISO_NIGHT
          : PAL_RISO_DAY;
    const flat = new Float32Array(32 * 3);
    pal.forEach((c, i) => flat.set(c, i * 3));
    gl.uniform3fv(postLoc.uPal, flat);
    gl.uniform1i(postLoc.uPalN, pal.length);
  }

  function draw() {
    resize();
    if (styleId === 0) {
      gl.viewport(0, 0, state.width, state.height);
      uniforms(state.width, state.height);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    } else {
      // 1) scene → texture (low-res for pixel art), 2) stylised post pass → canvas
      const px = cfg.pixel
        ? Math.max(2, Math.round((cfg.pixel * state.height) / 1080))
        : 1;
      const sw = Math.ceil(state.width / px),
        sh = Math.ceil(state.height / px);
      ensureFBO(sw, sh);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport(0, 0, sw, sh);
      gl.useProgram(prog);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      const night = uniforms(sw, sh);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, state.width, state.height);
      gl.useProgram(postProg);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, fboTex);
      postUniforms(night, sw, sh);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.activeTexture(gl.TEXTURE0);
    }
    state.dirty = false;
  }

  // ----- adaptive resolution: keep the page smooth on slower GPUs
  function adapt(dtMs, active) {
    if (!active || opts.fixedQuality) return;
    const ft = state.frameTimes;
    ft.push(dtMs);
    if (ft.length < 30) return;
    const avg = ft.reduce((a, b) => a + b, 0) / ft.length;
    ft.length = 0;
    const q = state.quality;
    if (avg > 24 && q > 0.5) state.quality = Math.max(0.5, q * 0.85);
    else if (avg < 17.5 && q < 1) state.quality = Math.min(1, q * 1.08);
    if (state.quality !== q) state.needsResize = true;
  }

  // ----- loop
  let raf = 0;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dtMs = state.last ? now - state.last : 16.7;
    state.last = now;
    const dt = Math.min(0.1, dtMs / 1000);

    // scroll smoothing (critically damped feel)
    const kScroll = 1 - Math.exp(-dt * 6.5);
    state.p += (state.pTarget - state.p) * kScroll;
    if (Math.abs(state.pTarget - state.p) < 1e-5) state.p = state.pTarget;
    // theme cross-fade
    const kNight = 1 - Math.exp(-dt * 2.6);
    state.night += (state.nightTarget - state.night) * kNight;
    if (Math.abs(state.nightTarget - state.night) < 1e-4)
      state.night = state.nightTarget;
    // mouse parallax easing
    state.mx += (state.mouseX - state.mx) * (1 - Math.exp(-dt * 3));
    state.my += (state.mouseY - state.my) * (1 - Math.exp(-dt * 3));

    const moving =
      state.p !== state.pTarget ||
      state.night !== state.nightTarget ||
      Math.abs(state.mouseX - state.mx) > 1e-3 ||
      Math.abs(state.mouseY - state.my) > 1e-3;

    if (reduceMotion.matches) {
      if (!moving && !state.dirty) return; // static unless something changes
    } else {
      state.time += dt;
      if (
        !moving &&
        !state.dirty &&
        now - state.lastDraw < 1000 / opts.idleFps - 1
      )
        return;
    }
    adapt(dtMs, moving);
    state.lastDraw = now;
    draw();
  }

  // ----- events
  const onScroll = () => readScroll();
  const onResize = () => {
    readScroll();
    state.dirty = true;
    state.needsResize = true;
  };
  const onPointer = (e) => {
    if (e.pointerType !== "mouse") return;
    state.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    state.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
  if (!reduceMotion.matches)
    window.addEventListener("pointermove", onPointer, { passive: true });
  const themeObserver = new MutationObserver(() => {
    state.nightTarget = isDark() ? 1 : 0;
  });
  themeObserver.observe(root, { attributes: true, attributeFilter: ["class"] });
  const ro = new ResizeObserver(() => {
    state.dirty = true;
    state.needsResize = true;
    readScroll();
  });
  ro.observe(document.body);
  ro.observe(canvas);

  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    cancelAnimationFrame(raf);
  });
  canvas.addEventListener("webglcontextrestored", () => {
    try {
      init();
      state.dirty = true;
      state.needsResize = true;
      raf = requestAnimationFrame(frame);
    } catch (err) {
      console.warn(err);
    }
  });

  raf = requestAnimationFrame(frame);

  const api = {
    set(o) {
      Object.assign(ov, o);
      state.dirty = true;
    },
    get state() {
      return state;
    },
    get mountainsReady() {
      return mtn.ready;
    },
    render() {
      draw();
    },
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      themeObserver.disconnect();
      ro.disconnect();
    },
  };
  window.__diorama = api;
  return api;
}
