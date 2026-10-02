// Skin manager: switches the whole design of the site at runtime.
//
// How it stays fast:
// - The interface of every skin is plain CSS keyed to <html data-skin="...">, all in one small
//   stylesheet, so switching the UI is a single attribute change (no reload, no FOUC).
//   Web fonts are declared with @font-face, so the browser downloads a font only when a
//   visible element of the active skin uses it.
// - Each background scene is its own lazily loaded JS chunk (import.meta.glob). Only the
//   active skin's code is ever downloaded, and nothing at all for the default WebGL diorama.
// - A scene is rendered once into 2-6 depth layers (SVG images or canvases). Scrolling then
//   only changes `transform` on those GPU-composited layers inside one requestAnimationFrame,
//   so there is no per-frame painting or JS drawing.
// - Rendered scenes are cached as blob URLs / canvases, so switching back is instant.
// - The WebGL diorama is mounted only while it is active and is destroyed (render loop
//   stopped, GL context released) when you switch away.
// - "original" is the site's own PixiJS background (BackgroundCanvas.astro): the manager mounts
//   nothing for it, and BackgroundCanvas pauses itself while another design is active.
import { SKINS, SKIN_IDS, DEFAULT_SKIN } from "./registry.js";

const loaders = import.meta.glob("./scenes/[a-z]*.js");
const W = 1440;
const H = 1800;
const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const cache = new Map(); // id -> Promise<layer descriptors>
let current = null; // { id, el, layers, dispose }
let token = 0;
let diorama = null;

// ---------------------------------------------------------------- background host
const host = document.createElement("div");
host.id = "skin-bg";
host.setAttribute("aria-hidden", "true");
document.body.prepend(host);

// ---------------------------------------------------------------- scroll + layout
// On phones the browser toolbar shows and hides while you scroll, which changes innerHeight and
// fires `resize` many times per scroll. Sizing the layers from the *large* viewport (100lvh) keeps
// them stable, so those resizes don't re-layout and re-rasterise every full-screen layer mid-scroll.
const lvhProbe = document.createElement("div");
lvhProbe.style.cssText =
  "position:fixed;top:0;left:0;width:0;height:100vh;height:100lvh;visibility:hidden;pointer-events:none";
document.body.appendChild(lvhProbe);
const small = window.matchMedia("(max-width: 767px)");
// background art does not need retina sharpness; this caps GPU memory per layer on 3x phones
const MAX_DPR = 1.5;

let vw = 0,
  vh = 0,
  scale = 1,
  travel = 0,
  docRange = 1,
  ticking = false;
function measure() {
  vw = window.innerWidth;
  vh = Math.max(lvhProbe.offsetHeight, window.innerHeight);
  scale = Math.max(vw / W, vh / 1000);
  travel = Math.max(0, H * scale - vh);
  docRange = Math.max(
    1,
    document.documentElement.scrollHeight - window.innerHeight,
  );
  if (current && current.layers) for (const l of current.layers) size(l);
  update();
}
function size(l) {
  const w = W * scale,
    h = H * scale;
  Object.assign(l.el.style, {
    width: `${w}px`,
    height: `${h}px`,
    left: `${(vw - w) / 2}px`,
  });
}
function update() {
  ticking = false;
  if (!current || !current.layers) return;
  const p = Math.min(1, Math.max(0, window.scrollY / docRange));
  for (const l of current.layers) {
    if (l.kind === "O") continue;
    l.el.style.transform = `translate3d(0,${(-p * travel * l.factor).toFixed(1)}px,0)`;
  }
}
const onScroll = () => {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(update);
  }
};
window.addEventListener("scroll", onScroll, { passive: true });
let lastW = window.innerWidth,
  lastLvh = 0;
window.addEventListener(
  "resize",
  () =>
    requestAnimationFrame(() => {
      // toolbar show/hide only changes innerHeight: nothing to re-measure
      if (window.innerWidth === lastW && lvhProbe.offsetHeight === lastLvh)
        return;
      lastW = window.innerWidth;
      lastLvh = lvhProbe.offsetHeight;
      measure();
    }),
  { passive: true },
);
new ResizeObserver(() => {
  docRange = Math.max(
    1,
    document.documentElement.scrollHeight - window.innerHeight,
  );
  onScroll();
}).observe(document.body);

// ---------------------------------------------------------------- scene building
async function buildScene(id) {
  const [mod, common] = await Promise.all([
    loaders[`./scenes/${id}.js`](),
    import("./scenes/common.js"),
  ]);
  const res = await mod.default();
  if (typeof res !== "string") return res; // raster skins already return canvases
  return Promise.all(
    common.splitLayers(res).map(async (l) => {
      const url = URL.createObjectURL(
        new Blob([l.svg], { type: "image/svg+xml" }),
      );
      return { kind: l.kind, factor: l.factor, blend: l.blend, url };
    }),
  );
}
// Raster skins hold full-size canvases, so keep only the last few of them in memory.
const MAX_RASTER_CACHE = 3;
function getScene(id) {
  if (!cache.has(id)) {
    cache.set(
      id,
      buildScene(id).catch((e) => {
        cache.delete(id);
        throw e;
      }),
    );
    cache.get(id).then(
      (descs) => {
        if (!descs.some((d) => d.canvas)) return;
        const raster = [];
        for (const [k, p] of cache) if (k !== id) raster.push([k, p]);
        Promise.all(
          raster.map(([k, p]) =>
            p.then(
              (ds) => (ds.some((d) => d.canvas) ? k : null),
              () => null,
            ),
          ),
        ).then((ks) => {
          const evict = ks.filter((k) => k && (!current || current.id !== k));
          while (evict.length > MAX_RASTER_CACHE - 1)
            cache.delete(evict.shift());
        });
      },
      () => {},
    );
  }
  return cache.get(id);
}
async function mountScene(id, descs) {
  const el = document.createElement("div");
  el.className = "skin-scene";
  const meta = SKINS.find((s) => s.id === id) || {};
  if (meta.pixelated) el.classList.add("is-pixelated");
  const layers = [];
  // blend-mode texture overlays are subtle but cost a full-screen blend per frame: skip them on phones
  const isSmall = small.matches;
  for (const d of descs) {
    if (isSmall && d.kind === "O" && d.blend && d.blend !== "normal") continue;
    let node;
    if (d.canvas) {
      // reuse the cached canvas when it is free, otherwise draw a copy
      node = d.canvas.isConnected ? cloneCanvas(d.canvas) : d.canvas;
    } else if (isSmall) {
      // An SVG <img> is rasterised at full device resolution: on a 3x phone that is ~65 MB of
      // GPU memory per layer, and 5-7 such layers make scrolling stutter. Draw it once into a
      // canvas at a capped pixel ratio instead.
      node = await rasterizeSvg(d.url);
    } else {
      node = new Image();
      node.decoding = "async";
      node.alt = "";
      node.src = d.url;
    }
    node.className = "skin-layer";
    if (d.blend && d.blend !== "normal") node.style.mixBlendMode = d.blend;
    const l = { el: node, kind: d.kind, factor: d.factor };
    layers.push(l);
    el.appendChild(node);
  }
  await Promise.all(
    layers.map((l) => (l.el.decode ? l.el.decode().catch(() => {}) : null)),
  );
  return { el, layers };
}
async function rasterizeSvg(url) {
  const img = new Image();
  img.src = url;
  await img.decode();
  const r = Math.min(window.devicePixelRatio || 1, MAX_DPR);
  const s = Math.max(window.innerWidth / W, lvhProbe.offsetHeight / 1000) * r;
  const c = document.createElement("canvas");
  c.width = Math.round(W * s);
  c.height = Math.round(H * s);
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  return c;
}
function cloneCanvas(c) {
  const n = document.createElement("canvas");
  n.width = c.width;
  n.height = c.height;
  n.getContext("2d").drawImage(c, 0, 0);
  return n;
}

// ---------------------------------------------------------------- the WebGL diorama
async function mountDioramaSkin() {
  const canvas = document.createElement("canvas");
  canvas.id = "diorama";
  canvas.setAttribute("aria-hidden", "true");
  const { mountDiorama } = await import("../Diorama/diorama.js");
  const el = document.createElement("div");
  el.className = "skin-scene";
  el.appendChild(canvas);
  return {
    el,
    layers: null,
    start() {
      diorama = mountDiorama(canvas);
    },
    dispose() {
      if (diorama) diorama.destroy();
      diorama = null;
      window.__diorama = null;
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      const lose = gl && gl.getExtension("WEBGL_lose_context");
      if (lose) lose.loseContext();
      root.classList.remove("diorama-ready", "diorama-fallback");
    },
  };
}

// ---------------------------------------------------------------- switching
function applyAttributes(id) {
  root.dataset.skin = id;
  root.classList.toggle("skin-on", id !== "original");
  const meta = SKINS.find((s) => s.id === id) || {};
  root.classList.toggle("skin-dark", !!meta.dark);
}

export async function setSkin(id, { persist = true } = {}) {
  if (!SKIN_IDS.includes(id)) id = DEFAULT_SKIN;
  if (current && current.id === id) return;
  const my = ++token;
  applyAttributes(id);
  if (persist) {
    try {
      localStorage.setItem("skin", id);
    } catch (e) {
      /* private mode */
    }
  }
  window.dispatchEvent(new CustomEvent("skinchange", { detail: { id } }));
  root.classList.add("skin-loading");
  try {
    const next =
      id === "original"
        ? {
            el: Object.assign(document.createElement("div"), {
              className: "skin-scene",
            }),
            layers: [],
          }
        : id === "diorama"
          ? await mountDioramaSkin()
          : await mountScene(id, await getScene(id));
    if (my !== token) {
      if (next.dispose) next.dispose();
      return;
    }
    next.id = id;
    next.el.style.opacity = "0";
    host.appendChild(next.el);
    const prev = current;
    current = next;
    if (next.start) next.start();
    measure();
    requestAnimationFrame(() => {
      next.el.style.opacity = "1";
    });
    if (prev) {
      const done = () => {
        if (prev.dispose) prev.dispose();
        prev.el.remove();
      };
      if (reduceMotion.matches) done();
      else setTimeout(done, 520);
    }
  } catch (err) {
    console.warn("[skins] could not render", id, err);
  } finally {
    if (my === token) root.classList.remove("skin-loading");
  }
}

export function currentSkin() {
  return root.dataset.skin || DEFAULT_SKIN;
}

// warm the cache for a skin the user is likely to pick next (hover in the picker)
export function prefetch(id) {
  if (
    id === "diorama" ||
    id === "original" ||
    !SKIN_IDS.includes(id) ||
    cache.has(id)
  )
    return;
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 200));
  idle(() => getScene(id).catch(() => {}));
}

// first paint: the head script already set data-skin, so the UI is styled; render the scene now
measure();
setSkin(currentSkin(), { persist: false });
