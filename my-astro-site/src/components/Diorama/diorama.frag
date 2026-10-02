// =====================================================================
//  Pljevlja, Montenegro — parallax diorama
//  One full-screen fragment shader. Every layer is procedural (no image
//  assets), so it stays sharp on any screen and weighs a few KB.
//
//  World space:  x = left/right, y = height above the Ćehotina valley
//  floor, z = distance from the camera. A layer at depth z sees
//  x = camX + u*z and y = camH + (v - horizon)*z, which gives true
//  perspective parallax when the camera moves with the page scroll.
//
//  uStyle.x blends every surface from painterly shading to the flat
//  cut-out palette; outlines and shadows are added in diorama-post.frag.
// =====================================================================

uniform vec2  uRes;
uniform float uTime;
uniform vec3  uCam;      // x: camera x, y: camera height, z: horizon (screen v)
uniform sampler2D uNoise;

uniform vec3 uSkyTop;
uniform vec3 uSkyMid;
uniform vec3 uSkyHor;
uniform vec3 uSunDisc;
uniform vec3 uSunGlow;
uniform vec3 uSunCol;    // direct light (sun or moon)
uniform vec3 uAmb;       // sky light
uniform vec3 uHaze;      // aerial perspective colour
uniform vec3 uFogCol;    // valley mist colour
uniform vec4 uSun;       // xy: screen pos (u,v) · z: radius · w: strength
uniform vec4 uMoon;      // xy: screen pos (u,v) · z: radius · w: strength
uniform vec2 uLight;     // 2D light direction (x: towards sun side, y: up)
uniform vec4 uMisc;      // x: town lights · y: stars · z: valley fog · w: haze density
uniform vec4 uMisc2;     // x: backlight · y: rim strength · z: cloud cover · w: night
uniform vec4 uLayout;    // x: flag x · y: katun x · z/w: foreground pine anchors (screen u)
uniform vec4 uLayout2;   // x: Tara bridge x · y: mid-ridge saddle x · z: monastery x · w: foreground scale
uniform vec4 uStyle;     // x: flat/cel shading amount · y: flat sky · z: cel threshold · w: tree scale
uniform vec4 uLayout4;  // x: bridge length · y: power plant x · z: coal mine x · w: unused
// far mountains: painted panoramas in one texture atlas (Durmitor, Ljubišnja, Lovćen)
uniform sampler2D uMtn;
uniform float uMtnA;       // fade-in once the texture has loaded
uniform vec4 uDurRect;     // atlas rect (u0, v0, u1, v1)
uniform vec4 uLjuRect;
uniform vec4 uLovRect;
uniform vec4 uDurPos;      // world: x left, x right, y bottom, y top (at the layer depth)
uniform vec4 uLjuPos;
uniform vec4 uLovPos;
uniform vec2 uMaus;        // Njegoš Mausoleum on Jezerski vrh (world x, y at Lovćen's depth)
uniform vec4 uLayout6;     // x: Holy Trinity Monastery terrace height · y: mausoleum size (picture width / y)
uniform vec4 uLayout5;   // x: power plant scale · y: plume scale · z: coal mine width scale · w: monastery scale
uniform vec3 uCelTint;   // cel-shading light colour (day / night)

float gU, gV, gPx, gT;
// 1 when the current pixel is a small detail (windows…) that the cut-out pass draws without ink lines
float gDet = 0.0;

// ---------------------------------------------------------------------
//  Utilities
// ---------------------------------------------------------------------
float sat(float x) { return clamp(x, 0.0, 1.0); }

float h11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
float h21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec2 h22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}

// 1D value noise with analytic derivative
vec2 n1(float x) {
  float i = floor(x), f = x - i;
  float a = h11(i), b = h11(i + 1.0);
  float s = f * f * (3.0 - 2.0 * f);
  return vec2(a + (b - a) * s, (b - a) * 6.0 * f * (1.0 - f));
}
vec2 fbm1(float x, float seed) {
  vec2 s = vec2(0.0); float a = 0.5, f = 1.0;
  for (int i = 0; i < 5; i++) {
    vec2 n = n1(x * f + seed + float(i) * 17.13);
    s += a * vec2(n.x, n.y * f);
    a *= 0.5; f *= 2.03;
  }
  return s * 1.0322581;
}
vec2 fbm1s(float x, float seed) {        // 3-octave, cheaper
  vec2 s = vec2(0.0); float a = 0.5, f = 1.0;
  for (int i = 0; i < 3; i++) {
    vec2 n = n1(x * f + seed + float(i) * 17.13);
    s += a * vec2(n.x, n.y * f);
    a *= 0.5; f *= 2.03;
  }
  return s * 1.1428571;
}
vec2 fbm1lo(float x, float seed) {      // first two octaves of fbm1: the smooth shape
  vec2 s = vec2(0.0); float a = 0.5, f = 1.0;
  for (int i = 0; i < 2; i++) {
    vec2 n = n1(x * f + seed + float(i) * 17.13);
    s += a * vec2(n.x, n.y * f);
    a *= 0.5; f *= 2.03;
  }
  return s * 1.0322581;
}
vec2 ridged1(float x, float seed) {      // sharp limestone peaks
  vec2 s = vec2(0.0); float a = 0.5, f = 1.0;
  for (int i = 0; i < 5; i++) {
    vec2 n = n1(x * f + seed + float(i) * 11.7);
    float v = n.x * 2.0 - 1.0;
    float sg = v < 0.0 ? -1.0 : 1.0;
    float r = 1.0 - abs(v);
    float dr = -sg * 2.0 * n.y * f;
    s += a * vec2(r * r, 2.0 * r * dr);
    a *= 0.5; f *= 2.1;
  }
  return s * 1.0322581;
}

// 2D value noise from a 256² random texture (smooth-sampler trick: 1 fetch)
float noise2(vec2 x) {
  vec2 i = floor(x); vec2 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return texture(uNoise, (i + f + 0.5) / 256.0).r;
}
// designed flat colours for the cut-out style (sRGB 0-255) and a picker
vec3 c255(float r, float g, float b) { return vec3(r, g, b) / 255.0; }
vec3 FC(vec3 painterly, vec3 flatCol) { return mix(painterly, flatCol, uStyle.x); }
// texture-only noise: fades to a constant in the flat styles
float tn(vec2 x) { return mix(noise2(x), 0.5, uStyle.x); }
const mat2 M2 = mat2(0.8, 0.6, -0.6, 0.8);
float fbm2(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { s += a * noise2(p); p = M2 * p * 2.02 + vec2(13.1, 7.7); a *= 0.5; }
  return s * 1.0322581;
}
float fbm2s(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) { s += a * noise2(p); p = M2 * p * 2.02 + vec2(13.1, 7.7); a *= 0.5; }
  return s * 1.1428571;
}

// smoothstep / gaussian with derivatives: (value, d/dx)
vec2 ssd(float a, float b, float x) {
  float t = sat((x - a) / (b - a));
  return vec2(t * t * (3.0 - 2.0 * t), 6.0 * t * (1.0 - t) / (b - a));
}
vec2 gss(float x, float c, float w) {
  float d = (x - c) / w; float g = exp(-d * d);
  return vec2(g, -2.0 * d / w * g);
}

float aa(float sd, float pw) { return sat(0.5 - sd / pw); }
float sdBox(vec2 p, vec2 c, vec2 hs) {
  vec2 d = abs(p - c) - hs;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}
float sdSeg(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = sat(dot(pa, ba) / dot(ba, ba));
  return length(pa - ba * h);
}

// camera → layer world position
vec2 world(float z) { return vec2(uCam.x + gU * z, uCam.y + (gV - uCam.z) * z); }

// premultiplied "over" inside a layer
vec4 over(vec4 dst, vec3 c, float a) { return vec4(c * a + dst.rgb * (1.0 - a), a + dst.a * (1.0 - a)); }
vec4 overP(vec4 dst, vec4 src) { return vec4(src.rgb + dst.rgb * (1.0 - src.a), src.a + dst.a * (1.0 - src.a)); }

// ---------------------------------------------------------------------
//  Lighting & atmosphere
// ---------------------------------------------------------------------
vec3 light(vec3 alb, float direct) {
  vec3 pl = alb * (uAmb + uSunCol * direct);
  if (uStyle.x < 0.001) return pl;
  vec3 cel = alb * uCelTint * mix(0.88, 1.0, step(uStyle.z, direct));
  return mix(pl, cel, uStyle.x);
}
float slopeLight(float dh) {
  vec2 n = normalize(vec2(-dh, 1.0));
  return sat(dot(n, uLight)) * (1.0 - 0.6 * uMisc2.x);
}
// Facet light near a ridge line, relaxing to a neutral value deeper inside
// the silhouette (so a column never inherits the ridge's slope all the way down)
float bodyLight(float dhLow, float depth, float band) {
  float neutral = 0.42 * (1.0 - 0.6 * uMisc2.x) * (0.55 + 0.45 * uLight.y);
  return mix(slopeLight(dhLow), neutral, smoothstep(0.0, band, depth));
}
// rim light on silhouette edges facing the sun / moon
vec3 rim(float sd, float w) {
  float r = smoothstep(-w, 0.0, sd);
  r *= r;
  float dv = max(abs(gV - uSun.y) - 0.06, 0.0);
  float s = exp(-abs(gU - uSun.x) * 4.2 - dv * 4.5) * uSun.w;
  float m = exp(-abs(gU - uMoon.x) * 2.4) * uMoon.w * 0.4;
  return r * (uSunGlow * s + vec3(0.62, 0.72, 0.95) * m) * uMisc2.y * 0.42 * (1.0 - uStyle.x);
}
// aerial perspective + drifting valley mist
vec3 atmos(vec3 c, vec2 p, float z) {
  c = mix(c, uHaze, 1.0 - exp(-z * uMisc.w));
  float fh = 0.3 + z * 0.032;
  float dens = uMisc.z * exp(-max(p.y + 0.05, 0.0) / fh) * (1.0 - exp(-z * 0.11));
  float n = noise2(vec2(p.x * 0.9 / fh + gT * 0.05, p.y * 2.2 / fh + 7.0 * z));
  dens *= (0.55 + 0.9 * n) * (1.0 - uStyle.x);
  return mix(c, uFogCol, sat(dens));
}

// ---------------------------------------------------------------------
//  Vegetation shapes (approximate signed distances, world units)
// ---------------------------------------------------------------------
float sdConifer(vec2 p, float cx, float by, float h, float w, float tiers) {
  float dx = abs(p.x - cx);
  float t = sat((p.y - by) / h);
  float tt = sat((t - 0.08) / 0.92);
  float s = fract(tt * tiers);
  s = s * smoothstep(1.0, 0.82, s);                 // soften the tier steps
  float width = w * (1.0 - tt) * (0.74 + 0.26 * (1.0 - s)) + w * 0.03;
  width *= 0.84 + 0.3 * h11(floor(tt * tiers) * 7.13 + cx * 31.7 + step(cx, p.x) * 3.1);
  float fol = max((dx - width) * 0.86, max(by + h * 0.07 - p.y, p.y - by - h));
  float trunk = max(dx - w * 0.1, max(by - h * 0.05 - p.y, p.y - by - h * 0.25));
  return min(fol, trunk);
}
float sdRoundTree(vec2 p, float cx, float by, float h, float w) {
  vec2 q = (p - vec2(cx, by + h - w * 1.05)) / vec2(1.0, 1.12);
  float c = length(q) - w;
  c = min(c, length(p - vec2(cx - w * 0.45, by + h - w * 1.35)) - w * 0.7);
  c = min(c, length(p - vec2(cx + w * 0.5, by + h - w * 1.3)) - w * 0.66);
  float trunk = max(abs(p.x - cx) - w * 0.12, max(by - p.y, p.y - by - h * 0.5));
  return min(c, trunk);
}
float sdPoplar(vec2 p, float cx, float by, float h, float w) {
  vec2 q = (p - vec2(cx, by + h * 0.56)) / vec2(w, h * 0.46);
  float c = (length(q) - 1.0) * w;
  float trunk = max(abs(p.x - cx) - w * 0.14, max(by - p.y, p.y - by - h * 0.2));
  return min(c, trunk);
}

// A row of trees standing on a ridge line of height hx (at the pixel's x).
// Returns sd; out: shade (-1 shadow side .. +1 sun side), kind (0 conifer, 1 round)
float treeRow(vec2 p, float hx, float cw, float hmin, float hmax, float seed, float roundFrac,
              out float shade, out float kind) {
  float TS = max(uStyle.w, 1.0);
  cw *= TS; hmin *= TS; hmax *= TS;
  float c = floor(p.x / cw);
  float best = 1e5; shade = 0.0; kind = 0.0;
  for (int k = -1; k <= 1; k++) {
    float ci = c + float(k);
    float r1 = h11(ci * 1.37 + seed), r2 = h11(ci * 2.71 + seed * 1.3), r3 = h11(ci * 0.93 + seed * 2.1);
    if (r3 < 0.1) continue;
    float cx = (ci + 0.5) * cw + (r1 - 0.5) * cw * 0.7;
    float th = mix(hmin, hmax, r2 * r2);
    float by = hx - th * 0.15;
    float sd;
    float kd = 0.0;
    if (r3 < 0.1 + roundFrac) {
      sd = sdRoundTree(p, cx, by, th * 0.72, th * 0.3);
      kd = 1.0;
    } else {
      sd = sdConifer(p, cx, by, th, th * mix(0.2, 0.28, r1), 4.0 + floor(r2 * 3.0));
    }
    if (sd < best) {
      best = sd; kind = kd;
      shade = clamp((p.x - cx) / (th * 0.25), -1.0, 1.0);
    }
  }
  return best;
}

// painterly canopy texture for the inside of forested slopes (~0.85..1.1 multiplier):
// jittered little tree crowns, lit on the sun side, plus broad brushy value patches
float canopy(vec2 p, float s, float seed) {
  vec2 q = p / s;
  q.x += 0.5 * mod(floor(q.y), 2.0);
  vec2 c = floor(q), f = fract(q);
  vec2 r2 = h22(c + seed);
  float cx = 0.5 + (r2.x - 0.5) * 0.7;
  float top = 0.8 + 0.35 * r2.y;
  float fy = f.y / top;
  float w = 0.46 * (1.0 - fy) + 0.05;
  float d = abs(f.x - cx) - w;
  float inside = smoothstep(0.12, -0.12, d) * step(fy, 1.0) * step(0.18, r2.y);
  float side = clamp((f.x - cx) / (w + 0.03), -1.0, 1.0) * sign(uLight.x);
  float v = mix(0.9, 1.0 + 0.08 * side, inside) * (0.96 + 0.08 * r2.x);
  float patchy = noise2(p / (s * 9.0) + seed);
  return mix(v * (0.9 + 0.2 * patchy), 1.0, uStyle.x);
}

// ---------------------------------------------------------------------
//  SKY
// ---------------------------------------------------------------------
vec3 stars(float e) {
  vec3 acc = vec3(0.0);
  vec2 sp = vec2(gU, e);
  for (int i = 0; i < 2; i++) {
    float sc = i == 0 ? 95.0 : 42.0;
    vec2 q = sp * sc + float(i) * 37.0;
    vec2 c = floor(q), f = fract(q) - 0.5;
    float r = h21(c);
    float thr = i == 0 ? 0.86 : 0.955;
    if (r > thr) {
      vec2 o = (h22(c) - 0.5) * 0.6;
      float d = length(f - o) * sc * gPx * 900.0 / sc;   // ~pixel-ish distance
      float b = (r - thr) / (1.0 - thr);
      float tw = 0.7 + 0.3 * sin(gT * (1.3 + r * 3.1) + r * 40.0);
      float sz = i == 0 ? 0.075 : 0.11;
      float s = smoothstep(sz, 0.0, length(f - o)) * (0.35 + b) * tw;
      vec3 sc3 = mix(vec3(0.75, 0.85, 1.0), vec3(1.0, 0.9, 0.78), h11(r * 91.0));
      acc += sc3 * s * (i == 0 ? 0.8 : 1.35);
    }
  }
  // Milky Way
  float band = exp(-pow((e - 0.42 - gU * 0.32) * 3.0, 2.0));
  float mw = fbm2(vec2(gU * 5.0 + 3.0, e * 5.0 - gU * 2.0));
  float mw2 = fbm2s(vec2(gU * 14.0, e * 14.0));
  acc += vec3(0.5, 0.56, 0.85) * band * smoothstep(0.38, 0.85, mw) * 0.2;
  acc += vec3(0.8, 0.8, 1.0) * band * smoothstep(0.62, 0.9, mw2) * 0.1;
  // shooting star (every ~11 s)
  float slot = floor(gT / 11.0);
  float ph = fract(gT / 11.0) * 11.0;
  if (ph < 0.9) {
    vec2 s0 = vec2((h11(slot * 3.1) - 0.5) * 1.6, 0.45 + h11(slot * 7.3) * 0.3);
    vec2 dir = normalize(vec2(-0.8 + h11(slot) * 0.3, -0.35));
    vec2 head = s0 + dir * ph * 0.55;
    float d = sdSeg(vec2(gU, e), head, head - dir * 0.12);
    float along = sat(dot(vec2(gU, e) - (head - dir * 0.12), dir) / 0.12);
    acc += vec3(1.0, 0.95, 0.85) * smoothstep(gPx * 2.2, 0.0, d) * along * sin(ph / 0.9 * 3.14159) * 1.2;
  }
  return acc * smoothstep(0.0, 0.22, e);
}

vec4 clouds(float e) {
  if (e < -0.02 || e > 0.9) return vec4(0.0);
  float par = uCam.y * 0.01;
  vec2 q = vec2(gU * 1.05 + gT * 0.0045, (e + par) * 3.3);
  // cumulus band
  float band = smoothstep(0.04, 0.16, e) * smoothstep(0.72, 0.42, e);
  float cov = uMisc2.z;
  vec4 res = vec4(0.0);
  if (band > 0.0) {
    float n = fbm2(q * 1.55 + vec2(0.0, 3.0));
    float d = smoothstep(0.64 - cov, 0.86 - cov, n) * band;
    if (d > 0.002) {
      vec2 lo = vec2(uLight.x, uLight.y) * 0.075;
      float n2 = fbm2((q + lo) * 1.55 + vec2(0.0, 3.0));
      float lit = sat(0.55 + (n - n2) * 7.0);
      float edge = 1.0 - smoothstep(0.0, 0.5, d);
      vec3 cShadow = mix(uSkyMid, uAmb * 1.35, 0.55) * 0.92;
      vec3 cLit = mix(vec3(1.0), uSunGlow * 1.15, 0.3 + 0.45 * uMisc2.x);
      cLit = mix(cLit, vec3(0.34, 0.39, 0.55), uMisc2.w * 0.85);
      vec3 c = mix(cShadow, cLit, lit);
      // silver lining near the sun
      float sp = exp(-length(vec2(gU, gV) - uSun.xy) * 3.0) * uSun.w;
      c += uSunGlow * edge * sp * 0.9;
      res = vec4(c, d * mix(0.92, 0.6, uMisc2.w));
    }
  }
  // high cirrus streaks — they light up at golden hour
  float cb = smoothstep(0.25, 0.45, e) * smoothstep(0.95, 0.6, e);
  if (cb > 0.0) {
    float n3 = fbm2(vec2(gU * 0.55 + gT * 0.002, e * 13.0 + gU * 1.5));
    float ci = smoothstep(0.6, 0.85, n3) * cb * 0.28;
    vec3 cc = mix(vec3(1.0), uSunGlow, 0.25 + 0.6 * uMisc2.x);
    cc = mix(cc, vec3(0.45, 0.5, 0.7), uMisc2.w);
    res.rgb = mix(cc, res.rgb, res.a);
    res.a = res.a + ci * (1.0 - res.a);
  }
  return res;
}

vec3 sky() {
  float e = gV - uCam.z;
  float t = sat(e / 0.72);
  vec3 col = mix(uSkyHor, uSkyMid, smoothstep(0.0, 0.42, t));
  col = mix(col, uSkyTop, smoothstep(0.32, 1.0, t));
  if (e < 0.0) col = mix(uSkyHor, uHaze, sat(-e * 5.0));
  // sun glow and warm horizon band
  vec2 ds = vec2(gU, gV) - uSun.xy;
  float rs = length(ds);
  col += uSunGlow * uSun.w * (0.5 * exp(-rs * 4.5) + 0.45 * exp(-rs * 14.0));
  col += uSunGlow * uSun.w * 0.28 * exp(-abs(e) * 8.0) * exp(-abs(gU - uSun.x) * 1.1);
  // moon glow
  vec2 dm = vec2(gU, gV) - uMoon.xy;
  float rm = length(dm);
  col += vec3(0.5, 0.62, 0.95) * uMoon.w * (0.16 * exp(-rm * 6.0) + 0.16 * exp(-rm * 24.0));
  if (uMisc.y > 0.01) col += stars(e) * uMisc.y;
  // moon disc (bright full moon with soft maria)
  if (uMoon.w > 0.01) {
    float disc = smoothstep(uMoon.z + gPx * 1.5, uMoon.z - gPx * 1.5, rm);
    float m = fbm2s(dm / uMoon.z * 2.2 + 11.0);
    vec3 mc = vec3(0.96, 0.95, 0.9) * (0.8 + 0.3 * smoothstep(0.35, 0.7, m));
    col = mix(col, mc, disc * uMoon.w);
  }
  // sun disc
  float disc = smoothstep(uSun.z + gPx * 1.5, uSun.z - gPx * 1.5, rs);
  col = mix(col, uSunDisc, disc * uSun.w);
  vec4 cl = clouds(e);
  col = mix(col, cl.rgb, cl.a);
  return col;
}


// ---------------------------------------------------------------------
//  FLAT SKY (cut-out / cartoon styles) — mirrors the site's own art:
//  a yellow sun with translucent aura rings, a cratered moon, outlined clouds
// ---------------------------------------------------------------------
float aaS(float d) { return sat(0.5 - d / gPx); }

vec3 starsFlat(float e) {
  vec3 acc = vec3(0.0);
  vec2 sp = vec2(gU, e);
  // tiny dots
  vec2 q = sp * 70.0;
  vec2 c = floor(q), f = fract(q) - 0.5;
  float r = h21(c + 4.0);
  if (r > 0.9) {
    vec2 o = (h22(c) - 0.5) * 0.6;
    float tw = 0.65 + 0.35 * sin(gT * (1.2 + r * 3.0) + r * 30.0);
    acc += vec3(1.0) * smoothstep(0.1, 0.03, length(f - o)) * tw;
  }
  // four-point sparkles like the site's star icons
  vec2 q2 = sp * 13.0;
  vec2 c2 = floor(q2), f2 = fract(q2) - 0.5;
  float r2 = h21(c2 + 11.0);
  if (r2 > 0.8) {
    vec2 o = (h22(c2 + 3.0) - 0.5) * 0.45;
    vec2 d = abs(f2 - o) * 13.0 / 0.012;             // in sparkle-size units
    float s = 0.55 + 0.45 * sin(gT * (0.8 + r2 * 1.5) + r2 * 20.0);
    float star = sqrt(d.x) + sqrt(d.y);               // astroid: four sharp points
    acc += vec3(1.0, 0.98, 0.85) * smoothstep(1.5, 1.0, star / (0.6 + 0.6 * s));
  }
  return acc * smoothstep(0.02, 0.12, e);
}

vec4 cloudsFlat(float e) {
  if (e < 0.05 || e > 0.9) return vec4(0.0);
  vec2 P = vec2(gU, e + uCam.y * 0.012);
  float d = 1e5, under = 0.0;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    // hand-placed so the hero headline and the sun start clear; they drift right slowly
    float x0 = i == 0 ? -0.72 : (i == 1 ? 0.2 : (i == 2 ? 1.05 : (i == 3 ? -1.6 : 1.8)));
    float e0 = i == 0 ? 0.5 : (i == 1 ? 0.6 : (i == 2 ? 0.47 : (i == 3 ? 0.55 : 0.52)));
    float s = i == 0 ? 0.062 : (i == 1 ? 0.05 : (i == 2 ? 0.07 : (i == 3 ? 0.058 : 0.066)));
    float cx = mod(x0 + 1.85 + (gT - 12.0) * (0.0045 + 0.0012 * fi), 3.7) - 1.85;
    // …and let them sink as the view tilts down so a few stay in frame
    float cy = e0 - (uCam.z - 0.26) * 0.45;
    vec2 q = P - vec2(cx, cy);
    if (abs(q.x) > s * 3.2 || abs(q.y) > s * 2.2) continue;
    float c = length(q / vec2(2.4, 0.62)) - s;                       // flat base
    c = min(c, length(q - vec2(-1.15 * s, 0.35 * s)) - 0.72 * s);
    c = min(c, length(q - vec2(-0.1 * s, 0.75 * s)) - 0.95 * s);
    c = min(c, length(q - vec2(1.0 * s, 0.45 * s)) - 0.75 * s);
    c = min(c, length(q - vec2(1.75 * s, 0.05 * s)) - 0.5 * s);
    if (c < d) { d = c; under = smoothstep(-0.1 * s, -0.45 * s, q.y); }
  }
  float a = aaS(d);
  if (a <= 0.0) return vec4(0.0);
  vec3 c = mix(vec3(1.0), vec3(0.88, 0.92, 0.97), under);
  c = mix(c, vec3(0.2, 0.26, 0.45), uMisc2.w * 0.85);
  return vec4(c, a);
}

vec3 skyFlat(out float cloudA) {
  float e = gV - uCam.z;
  vec3 col = uSkyTop;
  col = mix(col, uSkyMid, step(e, 0.26));
  col = mix(col, uSkyHor, step(e, 0.11));
  if (uMisc.y > 0.01) col += starsFlat(e) * uMisc.y;
  // sun + aura rings (as in the site's Sun component)
  vec2 ds = vec2(gU, gV) - uSun.xy;
  float rs = length(ds);
  if (uSun.w > 0.01) {
    float R = uSun.z * 1.7;
    for (int i = 3; i >= 1; i--) col = mix(col, uSunDisc, 0.16 * uSun.w * aaS(rs - R * (1.0 + 0.42 * float(i))));
    col = mix(col, uSunDisc, uSun.w * aaS(rs - R));
  }
  // moon + rings + craters (as in the site's Moon component)
  vec2 dm = vec2(gU, gV) - uMoon.xy;
  float rm = length(dm);
  if (uMoon.w > 0.01) {
    float Rm = uMoon.z * 1.35;
    for (int i = 3; i >= 1; i--) col = mix(col, vec3(0.92), 0.1 * uMoon.w * aaS(rm - Rm * (1.0 + 0.42 * float(i))));
    vec3 mc = vec3(1.0, 1.0, 0.93);
    float cr = min(min(length(dm - Rm * vec2(0.28, 0.22)) - Rm * 0.16, length(dm - Rm * vec2(-0.3, -0.12)) - Rm * 0.22), length(dm - Rm * vec2(0.18, -0.42)) - Rm * 0.12);
    mc = mix(mc, vec3(0.85, 0.85, 0.745), aaS(cr));
    col = mix(col, mc, uMoon.w * aaS(rm - Rm));
  }
  vec4 cl = cloudsFlat(e);
  cloudA = cl.a;
  return mix(col, cl.rgb, cl.a);
}

// ---------------------------------------------------------------------
//  LAYERS  (each returns premultiplied colour + coverage)
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
//  FAR MOUNTAINS — Durmitor, Ljubišnja and Lovćen are painted offline from
//  eroded terrain models (mountains.webp) and placed here as billboards
// ---------------------------------------------------------------------
vec4 mtnSample(vec2 p, vec4 rect, vec4 pos) {
  float u = (p.x - pos.x) / (pos.y - pos.x);
  float v = (pos.w - p.y) / (pos.w - pos.z);           // 0 at the top of the picture
  if (u <= 0.0 || u >= 1.0 || v <= 0.0) return vec4(0.0);
  // below the picture the bottom row simply continues, so the nearer hills always close the gap
  v = min(v, 1.0 - 0.5 / ((rect.w - rect.y) * 1024.0));
  return texture(uMtn, vec2(mix(rect.x, rect.z, u), mix(rect.y, rect.w, v))) * uMtnA;
}
// colour a painted texel like the rest of the scene: day / sunset / night tint, a little haze
vec4 mtnShade(vec4 t, vec2 p, float z) {
  if (t.a <= 0.002) return vec4(0.0);
  vec3 alb = t.rgb / t.a;
  vec3 c = light(alb, 0.62);
  c = atmos(c, p, z * 0.3);
  gDet = 1.0;                                           // painted detail: no ink lines inside
  return vec4(c * t.a, t.a);
}

vec4 layerDurmitor() {
  float z = 110.0; vec2 p = world(z);
  if (p.y > uDurPos.w) return vec4(0.0);
  return mtnShade(mtnSample(p, uDurRect, uDurPos), p, z);
}

vec4 layerLjubisnja() {
  float z = 52.0; vec2 p = world(z);
  if (p.y > uLjuPos.w) return vec4(0.0);
  return mtnShade(mtnSample(p, uLjuRect, uLjuPos), p, z);
}

// fill + a thin ink edge, for the small, crisp landmarks drawn on the mountains
vec4 inked(vec4 acc, float sd, vec3 col, float pl, vec3 ink) {
  float a = aa(sd, pl);
  if (a > 0.0) acc = over(acc, col, a);
  float ln = aa(abs(sd + 0.6 * pl) - 0.6 * pl, pl);
  if (ln > 0.0) acc = over(acc, ink, ln);
  return acc;
}
// trapezoid: top edge at y0 from xl0 to xr0, bottom edge at y1 from xl1 to xr1
float sdTrap(vec2 q, float y0, float y1, float xl0, float xr0, float xl1, float xr1) {
  float t = (q.y - y1) / (y0 - y1);
  float xl = mix(xl1, xl0, t), xr = mix(xr1, xr0, t);
  float sl = (xl0 - xl1) / (y0 - y1), sr = (xr0 - xr1) / (y0 - y1);
  float dl = (xl - q.x) / sqrt(1.0 + sl * sl), dr = (q.x - xr) / sqrt(1.0 + sr * sr);
  return max(max(dl, dr), max(q.y - y0, y1 - q.y));
}

// The Njegoš Mausoleum (Ivan Meštrović, 1974) on the levelled top of Jezerski vrh:
// two massive granite wings, the dark entrance with the two caryatids, the chapel's
// dark granite gable rising behind them, all on a walled terrace that the long
// stairway climbs to.  Drawn in local units (the terrace is about 3.4 wide).
vec4 mausoleum(vec2 q, float pl) {
  vec4 acc = vec4(0.0);
  float night = uMisc2.w;
  vec3 ink = mix(c255(38.0, 52.0, 79.0), c255(4.0, 8.0, 26.0), night);
  float sideL = uLight.x > 0.0 ? 1.0 : -1.0;
  vec3 flood = vec3(1.0, 0.86, 0.62) * uMisc.x * 0.28;
  vec3 stoneL = light(FC(vec3(0.86, 0.84, 0.8), c255(236.0, 232.0, 222.0)), 0.55) + flood;
  vec3 stoneM = light(FC(vec3(0.74, 0.73, 0.71), c255(206.0, 204.0, 198.0)), 0.55) + flood * 0.8;
  vec3 stoneS = light(FC(vec3(0.58, 0.6, 0.64), c255(164.0, 170.0, 186.0)), 0.55) + flood * 0.6;
  vec3 granite = light(FC(vec3(0.34, 0.37, 0.44), c255(92.0, 102.0, 126.0)), 0.55) + flood * 0.4;
  vec3 dark = FC(vec3(0.16, 0.17, 0.2), c255(40.0, 44.0, 58.0));
  vec3 warm = vec3(1.0, 0.78, 0.46) * uMisc.x;

  // the summit rock under the terrace, in the painting's rock colours (lit / shaded face)
  float rock = sdTrap(q, -0.62, -2.0, -1.42, 1.52, -2.25, 2.4);
  float ra = aa(rock, pl);
  if (ra > 0.0) {
    float litFace = step(0.0, (q.x - 0.12 - (q.y + 0.62) * -0.18) * sideL);
    vec3 rc = mix(FC(vec3(0.6, 0.62, 0.68), c255(182.0, 188.0, 203.0)), FC(vec3(0.84, 0.82, 0.78), c255(227.0, 221.0, 210.0)), litFace);
    acc = over(acc, light(rc, 0.62), ra);
  }
  // the stairway arriving at the terrace
  float st = sdTrap(q, -0.02, -1.25, -0.2, 0.2, 0.2, 0.42);
  acc = inked(acc, st, stoneL, pl, ink);
  if (st < 0.0) acc.rgb = mix(acc.rgb, stoneM * acc.a, step(0.72, fract(q.y * 7.0)) * 0.6);

  // terrace: a walled platform, its retaining walls following the rock down
  float ter = sdTrap(q, 0.0, -0.78, -1.66, 1.66, -1.5, 1.56);
  acc = inked(acc, ter, stoneM, pl, ink);
  if (ter < 0.0) {
    float cope = step(-0.07, q.y);                                        // coping stones on top
    float joint = step(0.82, fract(q.y * 4.2 + 0.5)) * (1.0 - cope);
    vec3 c = mix(stoneM, stoneS, joint * 0.55);
    c = mix(c, stoneL, cope);
    acc.rgb = mix(acc.rgb, c * acc.a, step(0.0, -ter - 1.2 * pl));
  }
  // re-draw the stair over the terrace's front wall (it runs through the wall to the door)
  float st2 = sdTrap(q, 0.02, -0.78, -0.2, 0.2, -0.14, 0.3);
  acc = inked(acc, st2, stoneL, pl, ink);
  if (st2 < -1.2 * pl) acc.rgb = mix(acc.rgb, stoneM * acc.a, step(0.72, fract(q.y * 7.0)) * 0.6);

  // chapel gable rising behind the wings (dark granite), with a light coping
  float gable = max(abs(q.x) - 0.52 * (1.0 - (q.y - 0.94) / 0.44), max(0.8 - q.y, q.y - 1.38));
  acc = inked(acc, gable, granite, pl, ink);
  // central, recessed front wall of the chapel
  float cen = sdBox(q, vec2(0.0, 0.47), vec2(0.43, 0.47));
  acc = inked(acc, cen, granite, pl, ink);
  // the entrance: a dark opening with the two granite caryatids and a light lintel
  float door = sdBox(q, vec2(0.0, 0.31), vec2(0.22, 0.31));
  vec3 doorC = dark + warm * 1.1;
  acc = inked(acc, door, doorC, pl, ink);
  for (int i = 0; i < 2; i++) {
    float cx = i == 0 ? -0.105 : 0.105;
    float body = sdBox(q, vec2(cx, 0.24), vec2(0.036, 0.24));
    float head = length(q - vec2(cx, 0.52)) - 0.042;
    float fig = min(body, head);
    float a = aa(fig, pl);
    if (a > 0.0) acc = over(acc, stoneM, a);
  }
  float lintel = sdBox(q, vec2(0.0, 0.66), vec2(0.28, 0.045));
  acc = inked(acc, lintel, stoneL, pl, ink);
  // the two massive stone wings with coursed granite blocks and a cornice
  for (int i = 0; i < 2; i++) {
    float sgn = i == 0 ? -1.0 : 1.0;
    float cx = sgn * 0.83;
    float wing = sdBox(q, vec2(cx, 0.45), vec2(0.4, 0.45));
    // the wing turned away from the light is a shade darker
    vec3 face = sgn * sideL > 0.0 ? stoneL : mix(stoneL, stoneM, 0.55);
    acc = inked(acc, wing, face, pl, ink);
    if (wing < -1.2 * pl) {
      float row = floor(q.y / 0.225);
      float jx = fract((q.x - cx) / 0.4 + 0.5 * mod(row, 2.0));
      float jy = fract(q.y / 0.225);
      float joint = max(step(0.93, jy), step(0.95, jx));
      acc.rgb = mix(acc.rgb, stoneS * acc.a, joint * 0.5);
    }
    float corn = sdBox(q, vec2(cx, 0.93), vec2(0.44, 0.045));
    acc = inked(acc, corn, stoneM, pl, ink);
  }
  return acc;
}

// Lovćen, with the Njegoš Mausoleum on the levelled top of Jezerski vrh
vec4 layerLovcen() {
  float z = 130.0; vec2 p = world(z); float pw = gPx * z;
  if (p.y > uLovPos.w + 6.0) return vec4(0.0);
  vec4 acc = mtnShade(mtnSample(p, uLovRect, uLovPos), p, z);
  float s = (uLovPos.y - uLovPos.x) / uLayout6.y;       // local unit: the terrace is 3.4 wide
  vec2 q = (p - uMaus) / s;
  if (abs(q.x) < 2.3 && q.y > -2.0 && q.y < 1.5) {
    vec4 m = mausoleum(q, pw / s);
    if (m.a > 0.0) {
      vec3 c = atmos(m.rgb / m.a, p, z * 0.3);
      acc = overP(acc, vec4(c * m.a, m.a));
      gDet = 1.0;
    }
  }
  return acc;
}

// ---------------------------------------------------------------------
//  TARA CANYON and the Đurđevića Tara bridge (1937–40): a 365 m concrete
//  deck on five open-spandrel arches, the main one spanning 116 m, 172 m
//  above the turquoise Tara. Local units are fractions of the deck length.
// ---------------------------------------------------------------------
// canyon cross-section at the bridge: (local height below the road, slope) for a = |x|
vec2 canyonNear(float a) {
  if (a > 0.475) return vec2(0.004, 0.0);
  if (a > 0.455) return vec2(mix(-0.11, 0.004, (a - 0.455) / 0.02), 0.114 / 0.02);
  if (a > 0.165) return vec2(mix(-0.215, -0.11, (a - 0.165) / 0.29), 0.105 / 0.29);
  vec2 s = ssd(0.02, 0.165, a);
  return vec2(mix(-0.47, -0.215, s.x), 0.255 * s.y);
}
// one open-spandrel arch (local units): parabolic rib + vertical columns up to the deck
float archSd(vec2 q, float cx, float a, float ys, float yc, float t0, float t1, float colStep) {
  float u = (q.x - cx) / a;
  if (abs(u) > 1.1) return 1e5;
  float uu = clamp(u, -1.0, 1.0);
  float yl = ys + (yc - ys) * (1.0 - uu * uu);
  float dy = -2.0 * (yc - ys) * uu / a;
  float th = mix(t0, t1, uu * uu);
  float sd = (abs(q.y - yl) - th * 0.5) / sqrt(1.0 + dy * dy);
  sd = max(sd, abs(q.x - cx) - a);
  float k = floor((q.x - cx) / colStep + 0.5);
  float xk = cx + k * colStep;
  float uk = (xk - cx) / a;
  float yk = ys + (yc - ys) * (1.0 - uk * uk) + mix(t0, t1, uk * uk) * 0.5;
  if (abs(k) >= 1.0 && abs(uk) < 0.92 && yk < -0.02) {
    sd = min(sd, sdBox(q, vec2(xk, (yk - 0.015) * 0.5), vec2(colStep * 0.15, (-0.015 - yk) * 0.5)));
  }
  return sd;
}
float pierSd(vec2 q, float px, float bottom) {
  float hw = 0.0065 + 0.028 * max(-q.y - 0.02, 0.0);
  return max(abs(q.x - px) - hw, max(q.y + 0.012, bottom - q.y));
}
// the bridge itself; q: local position (road surface at y = 0), pl: pixel size (local)
vec4 bridgeTara(vec2 q, float pl) {
  float ax = abs(q.x);
  if (ax > 0.5 + pl * 2.0 || q.y > 0.04 || q.y < -0.32) return vec4(0.0);
  vec2 qs = vec2(ax, q.y);
  float deck = sdBox(q, vec2(0.0, -0.0075), vec2(0.5, 0.0075));
  deck = min(deck, sdBox(q, vec2(0.0, 0.0055), vec2(0.5, 0.0019)));          // parapet
  float lx = (fract(q.x / 0.125 + 0.5) - 0.5) * 0.125;                       // lamp posts
  float lamp = max(abs(lx) - 0.0009, max(-q.y, q.y - 0.024));
  lamp = min(lamp, sdBox(vec2(lx, q.y), vec2(0.0, 0.0245), vec2(0.0028, 0.0013)));
  lamp = max(lamp, ax - 0.47);
  float arches = archSd(q, 0.0, 0.159, -0.19, -0.024, 0.012, 0.021, 0.0265);   // the 116 m main arch
  arches = min(arches, archSd(qs, 0.232, 0.073, -0.152, -0.026, 0.009, 0.014, 0.0243));
  arches = min(arches, archSd(qs, 0.378, 0.073, -0.098, -0.026, 0.009, 0.014, 0.0243));
  float piers = min(pierSd(qs, 0.159, -0.3), min(pierSd(qs, 0.305, -0.26), pierSd(qs, 0.451, -0.2)));
  float sd = min(min(deck, lamp), min(arches, piers));
  float a = aa(sd, pl);
  if (a <= 0.0) return vec4(0.0);
  vec3 lit = FC(vec3(0.88, 0.86, 0.8), c255(242.0, 238.0, 226.0));
  vec3 shd = FC(vec3(0.62, 0.6, 0.57), c255(198.0, 193.0, 182.0));
  // shaded: the underside of the deck, pier faces turned away, the lower half of the ribs
  float under = step(deck, min(arches, piers)) * step(q.y, -0.0075);
  float pierShade = step(piers, min(deck, arches)) * step(0.0, (q.x - (floor(q.x / 0.146 + 0.5) * 0.146)) * sign(uLight.x));
  vec3 alb = mix(lit, shd, max(under, pierShade * 0.7));
  vec3 c = light(alb, 0.5 * (1.0 - 0.5 * uMisc2.x) + 0.1);
  // lamps glow along the deck at night
  float lh = length(vec2(lx, q.y - 0.0245)) / max(pl, 1e-5);
  c += vec3(1.0, 0.82, 0.5) * uMisc.x * step(ax, 0.47) * smoothstep(3.5, 0.0, lh) * 1.5;
  return vec4(c * a, a);
}

vec4 layerTara() {
  float z = 30.0; vec2 p = world(z); float pw = gPx * z;
  float L = uLayout4.x, xc = uLayout2.x, yd = 5.0;
  float TS = max(uStyle.w, 1.0);
  if (p.y > yd + 1.4 + 0.6 * TS) return vec4(0.0);
  vec2 q = vec2(p.x - xc, p.y - yd) / L;
  float pl = pw / L;
  float ax = abs(q.x), sg = q.x < 0.0 ? -1.0 : 1.0;
  bool fromRight = uLight.x > 0.0;
  // near terrain: a forested plateau; below the bridge, the canyon walls
  vec2 f1 = fbm1(p.x / 7.0, 63.0);
  vec2 f2 = fbm1s(p.x / 2.2, 29.0);
  float plat = 0.35 + 0.8 * f1.x + 0.18 * f2.x;
  float dplat = 0.8 * f1.y / 7.0 + 0.18 * f2.y / 2.2;
  vec2 rb = ssd(0.5, 0.95, ax);
  vec2 cn = canyonNear(ax);
  float h, dh;
  if (ax > 0.475) {
    h = yd + L * 0.004 + plat * rb.x;
    dh = dplat * rb.x + plat * rb.y / L * sg;
  } else {
    h = yd + L * cn.x;
    dh = cn.y * sg;
  }
  float sdT = (p.y - h) / sqrt(1.0 + dh * dh);
  float sd = sdT, shade = 0.0, kind = 0.0;
  bool treeZone = ax > 0.19 && (ax < 0.445 || ax > 0.5);
  if (treeZone && p.y > h - 0.1 && p.y < h + 0.62 * TS) {
    float st = treeRow(p, h, 0.3, 0.3, 0.56, 7.0, 0.15, shade, kind);
    sd = min(sd, st);
  }
  vec4 acc = vec4(0.0);
  // the gorge running away from us, seen through the arches
  if (ax < 0.5 && sd > -pw) {
    float yb = -0.02;
    float ba = aa((q.y - yb) * L, pw);
    if (ba > 0.0) {
      // the forested walls of the canyon beyond the bridge, deeper = darker,
      // with the gorge narrowing to the river far below
      float gEdge = 0.02 + 0.139 * sat((q.y + 0.42) / 0.23);
      float inGorge = step(ax, gEdge) * step(q.y, -0.19);
      float litWall = fromRight ? step(q.x, 0.0) : step(0.0, q.x);
      vec3 far = FC(vec3(0.2, 0.33, 0.27) * canopy(p, 0.25, 4.0), c255(64.0, 136.0, 104.0));
      vec3 wall = mix(FC(vec3(0.14, 0.25, 0.22), c255(50.0, 110.0, 92.0)), FC(vec3(0.26, 0.4, 0.3), c255(78.0, 142.0, 108.0)), litWall);
      vec3 bc = mix(far, wall, inGorge);
      float meander = 0.012 * sin((q.y + 0.37) * 42.0) * sat((-0.37 - q.y) * 12.0);
      float river = step(q.y, -0.37) * step(abs(q.x - meander), 0.008 + (-0.37 - q.y) * 0.33);
      vec3 riverC = FC(mix(vec3(0.1, 0.6, 0.57), uSkyHor, 0.2), c255(64.0, 212.0, 206.0));
      float rapids = step(0.9, fract(q.y * 60.0 + 0.3 * sin(q.x * 200.0))) * step(ax, 0.006 + (-0.37 - q.y) * 0.2);
      riverC = mix(riverC, vec3(0.85, 0.96, 0.96), rapids * (1.0 - uStyle.x));
      bc = mix(bc, riverC, river);
      vec3 cB = light(bc, 0.34 + 0.1 * uLight.y);
      cB = atmos(cB, p, z * 1.5);
      acc = vec4(cB * ba, ba);
    }
  }
  acc = overP(acc, bridgeTara(q, pl));
  float a = aa(sd, pw);
  if (a > 0.0) {
    float cp = canopy(p, 0.3, 9.0);
    vec3 forest = FC(mix(vec3(0.17, 0.3, 0.21), vec3(0.24, 0.36, 0.2), kind * 0.8) * cp, mix(c255(46.0, 132.0, 80.0), c255(74.0, 160.0, 84.0), kind));
    // canyon rock: cliffs along the gorge edge under the main arch and at each rim
    float below = (h - p.y) / L;
    float rock = (1.0 - step(0.17, ax)) * step(below, 0.07);
    rock = max(rock, step(0.452, ax) * step(ax, 0.478) * step(-0.115, q.y));
    rock *= step(sdT, 0.0) * (1.0 - step(0.0, sd - sdT - 1e-4) * 0.0);
    float litWall = fromRight ? step(q.x, 0.0) : step(0.0, q.x);
    vec3 rockC = mix(FC(vec3(0.5, 0.42, 0.42), c255(168.0, 132.0, 128.0)), FC(vec3(0.74, 0.62, 0.56), c255(216.0, 178.0, 160.0)), litWall);
    float bed = step(0.86, fract(q.y * 38.0 + 0.3 * sin(q.x * 40.0)));
    rockC *= 1.0 - 0.08 * bed;
    // the Tara at the bottom of the gorge
    float meander = 0.012 * sin((q.y + 0.37) * 42.0);
    float riv = step(abs(q.x - meander), 0.008 + (-0.37 - q.y) * 0.33) * step(q.y, -0.44) * step(-0.5, q.y);
    vec3 alb = mix(forest, rockC, rock);
    alb = mix(alb, FC(vec3(0.12, 0.62, 0.58), c255(52.0, 200.0, 196.0)), riv);
    float dLow = ax > 0.475 ? 0.8 * fbm1lo(p.x / 7.0, 63.0).y / 7.0 : dh;
    vec3 c = light(alb, bodyLight(dLow, h - p.y, 0.8) + 0.1 + shade * sign(uLight.x) * 0.08);
    c = atmos(c, p, z);
    c += rim(sd, pw * 2.5);
    acc = overP(acc, vec4(c * a, a));
  }
  return acc;
}

// Flock of birds drifting across the morning sky
vec4 layerBirds() {
  if (uSun.w < 0.05) return vec4(0.0);
  float z = 22.0; vec2 p = world(z); float pw = gPx * z;
  float fx = -26.0 + mod(gT * 1.45 + 14.0, 58.0);
  float fy = 16.4 + 0.5 * sin(gT * 0.23);
  if (abs(p.x - fx) > 4.5 || abs(p.y - fy) > 2.0) return vec4(0.0);
  float sd = 1e5;
  for (int i = 0; i < 7; i++) {
    float fi = float(i);
    float k = fi - 3.0;
    vec2 o = vec2(-abs(k) * 0.62 + (h11(fi * 3.7) - 0.5) * 0.35, -abs(k) * 0.3 + (h11(fi * 5.1) - 0.5) * 0.3);
    o.y += 0.08 * sin(gT * 1.3 + fi);
    vec2 c = vec2(fx, fy) + o;
    float s = 0.3 * (0.85 + 0.3 * h11(fi * 1.9));
    float fl = sin(gT * 7.5 + fi * 1.7);
    vec2 q = (p - c) / s; q.x = abs(q.x);
    vec2 m = vec2(0.5, 0.12 + fl * 0.32);
    vec2 t = vec2(1.0, -0.05 + fl * 0.55);
    float d = min(sdSeg(q, vec2(0.0), m), sdSeg(q, m, t)) - 0.055;
    sd = min(sd, d * s);
  }
  float a = aa(sd, pw) * 0.85;
  if (a <= 0.0) return vec4(0.0);
  vec3 c = atmos(vec3(0.12, 0.14, 0.18), p, z * 0.6);
  return vec4(c * a, a);
}

// Mid ridge — dense black pine & spruce, with a saddle opening the view to the canyon
vec4 layerMid() {
  float z = 10.0; vec2 p = world(z); float pw = gPx * z;
  if (p.y > 3.3) return vec4(0.0);
  vec2 f1 = fbm1(p.x / 3.2, 77.0);
  vec2 f2 = fbm1s(p.x / 0.9, 13.0);
  vec2 g = gss(p.x, uLayout2.y, 1.7);
  float h = 1.45 + 0.75 * f1.x + 0.14 * f2.x - 1.0 * g.x;
  float dh = 0.75 * f1.y / 3.2 + 0.14 * f2.y / 0.9 - 1.0 * g.y;
  float sd = (p.y - h) / sqrt(1.0 + dh * dh);
  float shade = 0.0; float kind = 0.0;
  if (p.y > h - 0.06 && p.y < h + 0.3 * max(uStyle.w, 1.0)) {
    float st = treeRow(p, h, 0.085, 0.1, 0.24, 11.0, 0.22, shade, kind);
    sd = min(sd, st);
  }
  float a = aa(sd, pw);
  if (a <= 0.0) return vec4(0.0);
  float cp = canopy(p, 0.085, 3.0);
  vec3 alb = FC(mix(vec3(0.15, 0.29, 0.21), vec3(0.24, 0.36, 0.2), kind * 0.8) * cp, mix(c255(44.0, 138.0, 75.0), c255(74.0, 168.0, 79.0), kind));
  float meadow = smoothstep(0.6 + 0.08 * uStyle.x, 0.8 + 0.06 * uStyle.x, fbm2s(p * vec2(0.9, 2.2) + 4.0)) * smoothstep(h - 0.08, h - 0.4, p.y);
  alb = mix(alb, FC(vec3(0.4, 0.5, 0.27), c255(124.0, 207.0, 90.0)), mix(meadow * 0.45, step(0.5, meadow), uStyle.x));
  float dLow = 0.75 * fbm1lo(p.x / 3.2, 77.0).y / 3.2 - 1.0 * g.y;
  vec3 c = light(alb, bodyLight(dLow, h - p.y, 0.45) + 0.06 + shade * sign(uLight.x) * 0.1);
  c = atmos(c, p, z);
  c += rim(sd, pw * 2.5);
  return vec4(c * a, a);
}

// Hills around the Pljevlja basin
vec2 hillsBase(float x) {
  vec2 f1 = fbm1(x / 2.2, 91.0);
  vec2 f2 = fbm1s(x / 0.6, 33.0);
  vec2 g1 = gss(x, uLayout2.z + 0.05, 1.15);      // monastery hill
  vec2 g2 = gss(x, 6.0, 2.2);
  vec2 g3 = gss(x, uLayout4.z, 1.0 * uLayout5.z);  // the hill the Potrlica mine eats into
  float h = 0.4 + 0.3 * f1.x + 0.05 * f2.x + 0.46 * g1.x + 0.3 * g2.x + 0.55 * g3.x;
  float dh = 0.3 * f1.y / 2.2 + 0.05 * f2.y / 0.6 + 0.46 * g1.y + 0.3 * g2.y + 0.55 * g3.y;
  return vec2(h, dh);
}
// the mine levels the hilltop into a flat far rim
vec2 hillsH(float x) {
  vec2 hb = hillsBase(x);
  float dx = (x - uLayout4.z) / uLayout5.z;
  if (abs(dx) > 1.1) return hb;
  float flat_ = hillsBase(uLayout4.z).x - 0.03;
  vec2 k = ssd(1.1, 0.9, abs(dx));
  return vec2(mix(hb.x, flat_, k.x), hb.y * (1.0 - k.x) + (flat_ - hb.x) * k.y / uLayout5.z * sign(dx));
}

// Potrlica open-pit coal mine, seen across the valley: a big bare scar in the
// hillside, the near rim stepping down into the pit, the far wall showing its
// benches, a lignite seam and the yellow machines. Returns (colour, coverage).
vec4 coalMine(vec2 p, float pw, float h) {
  float MS = uLayout5.z;
  float dx = (p.x - uLayout4.z) / MS;
  if (abs(dx) > 1.6) return vec4(0.0);
  float hm = hillsBase(uLayout4.z).x - 0.03;
  float y0 = hm - 0.52;                               // the pit floor
  vec3 spoil = FC(vec3(0.7, 0.64, 0.56), c255(204.0, 188.0, 164.0));
  vec3 face = FC(vec3(0.6, 0.57, 0.54), c255(168.0, 162.0, 156.0));
  vec3 top = FC(vec3(0.8, 0.77, 0.72), c255(206.0, 198.0, 184.0));
  vec3 coal = FC(vec3(0.14, 0.13, 0.15), c255(52.0, 50.0, 58.0));
  // bare overburden around the pit, with a ragged edge against the forest
  float ragged = 0.06 * (abs(fract(p.y * 9.0 + dx) - 0.5) - 0.25);
  float bare = step(abs(dx), 1.45 - (h - p.y) * 0.7 + ragged) * step(p.y, h - 0.012) * step(h - p.y, 0.78 + 0.08 * (abs(fract(dx * 3.0) - 0.5) - 0.25));
  if (bare <= 0.0) return vec4(0.0);
  vec3 col = spoil;
  float W = 1.05;
  float t = abs(dx) / W;
  float st = floor(t * 4.0) / 4.0;
  float rimY = mix(y0, h, st * st * 0.4 + st * 0.6);   // the stepped near rim
  if (abs(dx) < W && p.y > rimY) {
    float bh = 0.095;
    float k = floor((p.y - y0) / bh);
    float fy = fract((p.y - y0) / bh);
    col = fy > 0.7 ? top : face;
    if (k == 1.0 && fy > 0.15 && fy < 0.62) col = coal;          // the lignite seam
    if (p.y > h - 0.1) col = mix(col, spoil, 0.8);
  } else if (abs(dx) < W) {
    // the near rim: dumped spoil in terraces
    col = mix(spoil, top, step(0.72, fract((p.y - y0) / 0.08)));
  }
  // machines on the benches: a bucket excavator and a dump truck
  vec2 e = p - vec2(uLayout4.z - 0.2 * MS, y0 + 0.16 + 0.004);
  float exc = sdBox(e, vec2(0.0, 0.026), vec2(0.07, 0.022));
  exc = min(exc, sdBox(e, vec2(0.045, 0.066), vec2(0.024, 0.02)));
  exc = min(exc, sdSeg(e, vec2(-0.03, 0.04), vec2(-0.15, 0.1)) - 0.009);
  exc = min(exc, sdSeg(e, vec2(-0.15, 0.1), vec2(-0.19, 0.03)) - 0.008);
  exc = min(exc, sdBox(e, vec2(-0.19, 0.018), vec2(0.024, 0.018)));
  vec2 tq = p - vec2(uLayout4.z + 0.22 * MS, y0 + 0.08 + 0.004);
  float truck = sdBox(tq, vec2(-0.01, 0.034), vec2(0.07, 0.024));
  truck = min(truck, sdBox(tq, vec2(0.08, 0.03), vec2(0.022, 0.02)));
  float wheels = min(length(tq - vec2(-0.045, 0.01)) - 0.014, length(tq - vec2(0.065, 0.01)) - 0.014);
  vec3 yellow = FC(vec3(0.9, 0.72, 0.2), c255(248.0, 196.0, 40.0));
  col = mix(col, yellow, aa(min(exc, truck), pw));
  col = mix(col, coal, aa(wheels, pw));
  return vec4(col, 1.0);
}
vec4 layerHills() {
  float z = 6.5; vec2 p = world(z); float pw = gPx * z;
  if (p.y > 1.95) return vec4(0.0);
  vec2 hh = hillsH(p.x);
  float h = hh.x, dh = hh.y;
  float sdT = (p.y - h) / sqrt(1.0 + dh * dh);
  float sd = sdT; float shade = 0.0; float kind = 0.0;
  float mx = uLayout2.z;
  float clearing = smoothstep(1.3, 1.55, abs(p.x - uLayout4.z) / uLayout5.z);
  if (p.y > h - 0.05 && p.y < h + 0.22 * max(uStyle.w, 1.0) && clearing > 0.5) {
    float st = treeRow(p, h, 0.06, 0.08, 0.17, 19.0, 0.4, shade, kind);
    sd = min(sd, st);
  }
  vec4 acc = vec4(0.0);
  float a = aa(sd, pw);
  if (a > 0.0) {
    float cp = canopy(p, 0.06, 7.0);
    float meadow = smoothstep(0.52 + 0.08 * uStyle.x, 0.72 + 0.06 * uStyle.x, fbm2s(p * vec2(1.4, 3.2) + 3.0));
    meadow *= step(sdT, 0.0) * smoothstep(h - 0.03, h - 0.12, p.y);
    vec3 alb = FC(mix(vec3(0.17, 0.3, 0.2), vec3(0.27, 0.39, 0.2), kind) * cp, mix(c255(47.0, 143.0, 71.0), c255(82.0, 178.0, 79.0), kind));
    alb = mix(alb, FC(vec3(0.46, 0.56, 0.29) * (0.92 + 0.16 * tn(p * vec2(6.0, 14.0))), c255(139.0, 214.0, 94.0)), mix(sat(meadow) * 0.8, step(0.5, meadow), uStyle.x));
    vec4 mine = coalMine(p, pw, h);
    alb = mix(alb, mine.rgb, mine.a * step(sdT, 0.0));
    float dLow = 0.3 * fbm1lo(p.x / 2.2, 91.0).y / 2.2 + 0.46 * gss(p.x, uLayout2.z + 0.05, 1.15).y + 0.3 * gss(p.x, 6.0, 2.2).y;
    vec3 c = light(alb, bodyLight(dLow, h - p.y, 0.3) + 0.05 + shade * sign(uLight.x) * 0.1);
    c = atmos(c, p, z);
    c += rim(sd, pw * 2.5);
    acc = vec4(c * a, a);
  }
  return acc;
}

// ---------------------------------------------------------------------
//  TE PLJEVLJA — the coal power station: a 250 m chimney banded red and
//  white, the hyperbolic cooling tower with its plume, the boiler house
// ---------------------------------------------------------------------
vec4 layerPlant() {
  float z = 6.0; vec2 p = world(z); float pw = gPx * z;
  float X0 = uLayout4.y;                          // chimney axis
  float S = uLayout5.x;
  float yb = 0.2 + 0.05 * sin(X0 * 0.8) + 0.02 * sin(X0 * 2.3 + 2.0) + 0.012 * X0 * X0;
  // work in the plant's own (scaled) frame
  pw /= S;
  float x = (p.x - X0) / S;
  float y = (p.y - yb) / S;
  if (x < -1.75 || x > 1.2 || y > 3.6) return vec4(0.0);
  bool fromRight = uLight.x > 0.0;
  vec4 acc = vec4(0.0);

  // steam plume from the cooling tower: puffs rising and swelling, drifting with the wind
  float tcx = -0.95, tH = 0.82;
  float plume = 1e5, under = 0.0;
  if (x > -1.6 && x < 0.9 && y > tH - 0.1) {
    float PS = uLayout5.y;
    vec2 lp = vec2(x, y);
    for (int i = 0; i < 7; i++) {
      float fi = float(i);
      float t = fract(gT * 0.045 + fi / 7.0);
      vec2 c = vec2(tcx + t * 0.9 * PS + 0.06 * sin(t * 7.0 + fi * 2.0), tH + 0.1 + t * 1.25 * PS);
      float r = (0.17 + 0.3 * t * PS) * smoothstep(1.0, 0.82, t) * (0.9 + 0.2 * h11(fi * 3.3));
      float d = length(lp - c) - r;
      d = min(d, length(lp - c - vec2(r * 0.75, -r * 0.25)) - r * 0.62);
      if (d < plume) { plume = d; under = smoothstep(c.y + r * 0.1, c.y - r * 0.6, y); }
    }
    // the column leaving the tower mouth
    plume = min(plume, (length((vec2(x - tcx, y - tH - 0.06)) / vec2(1.0, 0.8)) - 0.19) * 0.8);
  }
  float pa = aa(plume, pw);
  if (pa > 0.0) {
    vec3 sc = mix(FC(vec3(0.95, 0.95, 0.96), c255(255.0, 255.0, 255.0)), FC(vec3(0.78, 0.8, 0.86), c255(214.0, 224.0, 236.0)), under);
    sc = light(sc, 0.5) + vec3(0.06, 0.06, 0.08) * uMisc2.w;
    acc = vec4(sc * pa, pa);
  }

  // cooling tower (hyperboloid of revolution)
  float t = y / tH;
  float hw = 0.19 * sqrt(1.0 + pow((t - 0.72) / 0.589, 2.0));
  float tower = max(abs(x - tcx) - hw, max(-y - 0.25, y - tH));
  // chimney: tapering concrete shaft, banded near the top
  float cH = 1.75;
  float cw = mix(0.066, 0.036, sat(y / cH));
  float chim = max(abs(x) - cw, max(-y - 0.25, y - cH));
  // boiler house + stair tower, turbine hall, coal conveyor
  float boiler = sdBox(vec2(x, y), vec2(-0.4, 0.2), vec2(0.2, 0.42));
  float stair = sdBox(vec2(x, y), vec2(-0.62, 0.22), vec2(0.035, 0.44));
  float hall = sdBox(vec2(x, y), vec2(-0.2, 0.0), vec2(0.5, 0.26));
  vec2 ca = vec2(0.02, 0.42), cb = vec2(0.95, 0.04);
  float conv = sdSeg(vec2(x, y), ca, cb) - 0.018;
  conv = min(conv, sdBox(vec2(x, y), vec2(0.5, 0.12), vec2(0.012, 0.12)));
  float build = min(min(boiler, stair), min(hall, conv));
  float sd = min(min(tower, chim), build);
  float a = aa(sd, pw);
  if (a > 0.0) {
    vec3 alb;
    float dir = 0.5;
    if (chim <= min(tower, build)) {
      float band = step(cH * 0.7, y) * step(0.5, fract((y - cH * 0.7) / (cH * 0.3) * 3.5));
      alb = mix(FC(vec3(0.86, 0.86, 0.85), c255(236.0, 236.0, 234.0)), FC(vec3(0.8, 0.12, 0.1), c255(222.0, 52.0, 42.0)), band);
      float side = (fromRight ? 1.0 : -1.0) * x / cw;
      dir = 0.5 - 0.3 * step(side, -0.2);
    } else if (tower <= build) {
      float side = (fromRight ? 1.0 : -1.0) * (x - tcx) / hw;
      alb = FC(vec3(0.72, 0.72, 0.74), c255(204.0, 206.0, 212.0));
      alb = mix(alb, FC(vec3(0.56, 0.57, 0.62), c255(162.0, 166.0, 180.0)), step(side, -0.25));
      // diagonal legs at the foot
      float leg = step(y, 0.055) * step(0.5, fract((x - tcx) * 26.0 + y * 16.0 * sign(fract((x - tcx) * 13.0) - 0.5)));
      alb = mix(alb, FC(vec3(0.3, 0.3, 0.34), c255(88.0, 92.0, 104.0)), leg);
      // weathering streaks
      alb *= 1.0 - 0.06 * step(0.8, fract((x - tcx) * 40.0)) * (1.0 - uStyle.x * 0.5);
    } else {
      float isHall = step(hall, min(boiler, stair)) * step(hall, conv);
      float isConv = step(conv, min(boiler, min(stair, hall)));
      alb = FC(vec3(0.84, 0.86, 0.88), c255(236.0, 239.0, 243.0));
      alb = mix(alb, FC(vec3(0.72, 0.74, 0.78), c255(206.0, 212.0, 222.0)), isHall);
      alb = mix(alb, FC(vec3(0.62, 0.62, 0.64), c255(186.0, 188.0, 194.0)), isConv);
      // ribbon windows on the boiler house, a row along the hall
      float rib = step(abs(fract((y - 0.3) / 0.075) - 0.5), 0.17) * step(0.28, y) * step(y, 0.58) * step(abs(x + 0.4), 0.17) * step(boiler, 0.0);
      float hw2 = step(abs(y - 0.16), 0.03) * step(0.5, fract(x * 22.0)) * step(hall, 0.0) * isHall;
      float win = max(rib, hw2);
      alb = mix(alb, FC(vec3(0.24, 0.3, 0.4), c255(96.0, 124.0, 162.0) * uCelTint), win);
      acc.rgb += vec3(0.0);
      gDet = step(0.5, win);
      vec3 cb2 = light(alb, 0.5);
      cb2 += mix(vec3(0.85, 0.9, 1.0), vec3(1.0, 0.8, 0.5), step(0.5, fract(x * 3.0))) * win * uMisc.x * 1.1;
      acc = overP(acc, vec4(atmos(cb2, p, z) * a, a));
      return acc;
    }
    vec3 c = light(alb, dir);
    // aviation lights on the chimney at night
    float blink = step(0.0, sin(gT * 3.2));
    float al = min(length(vec2(x, y - cH + 0.02)), length(vec2(abs(x) - cw * 0.9, y - cH * 0.68)));
    c += vec3(1.0, 0.15, 0.1) * smoothstep(0.03, 0.0, al) * uMisc.x * (0.5 + 0.5 * blink) * 2.0;
    c = atmos(c, p, z);
    acc = overP(acc, vec4(c * a, a));
  }
  return acc;
}

// ---------------------------------------------------------------------
//  MANASTIR SVETE TROJICE — the Holy Trinity Monastery above Pljevlja:
//  the white church with its drum and grey dome, the stone bell tower with
//  its tall spire, and the konaks with white arcades, dark wooden galleries
//  and orange tile roofs, on a terrace below grey limestone cliffs
// ---------------------------------------------------------------------
float monHill(float x) {                       // hillside silhouette (local units, terrace at y = 0)
  float h = 1.05 * exp(-pow((x + 0.15) / 1.35, 2.0)) + 0.18 * exp(-pow((x - 1.2) / 0.6, 2.0));
  h += 0.05 * sin(x * 5.3 + 1.0) + 0.025 * sin(x * 13.0);
  return h - 0.55 + 0.35 * exp(-pow(x / 1.9, 2.0));
}
// hipped tile roof over a wall from x0 to x1 whose top is at y0
float hipRoof(vec2 q, float x0, float x1, float y0, float rh, float over) {
  float cx = 0.5 * (x0 + x1), hw = 0.5 * (x1 - x0) + over;
  float t = sat((q.y - y0) / rh);
  float w = mix(hw, max(hw - rh * 1.6, 0.02), t);
  return max((abs(q.x - cx) - w) * 0.85, max(y0 - 0.012 - q.y, q.y - y0 - rh));
}
vec4 layerMonastery() {
  float z = 6.2; vec2 p = world(z); float pw = gPx * z;
  float S = uLayout5.w;
  vec2 q = (p - vec2(uLayout2.z, uLayout6.x)) / S;
  float pl = pw / S;
  if (abs(q.x) > 2.9 || q.y < -1.3 || q.y > 1.35) return vec4(0.0);
  bool fromRight = uLight.x > 0.0;
  float sideL = fromRight ? 1.0 : -1.0;
  vec4 acc = vec4(0.0);

  // ---- the hillside: forest, limestone cliffs behind the monastery, a slope down to town
  float hh = monHill(q.x);
  float sdH = q.y - hh;
  float shade = 0.0, kind = 0.0;
  float trees = 1e5;
  if (q.y > hh - 0.06 && q.y < hh + 0.26 * max(uStyle.w, 1.0)) trees = treeRow(q, hh, 0.07, 0.09, 0.2, 29.0, 0.35, shade, kind);
  float sd = min(sdH, trees);
  float a = aa(sd, pl);
  if (a > 0.0) {
    // forest over the hill, a tree line along its top
    vec3 alb = FC(mix(vec3(0.17, 0.3, 0.2), vec3(0.27, 0.39, 0.2), kind), mix(c255(52.0, 146.0, 78.0), c255(84.0, 176.0, 82.0), kind));
    alb = mix(alb, FC(vec3(0.14, 0.26, 0.18), c255(42.0, 124.0, 70.0)), step(sdH, -0.05) * (1.0 - 0.0 * kind));
    // the limestone cliff the monastery stands under: a band with a ragged, craggy top,
    // cut into faces by vertical fissures, lit on one side
    float cx = q.x + 0.05;
    float crag = abs(fract(cx * 5.2 + 0.3) - 0.5) * 2.0;
    float cliffTop = 0.5 + 0.1 * sin(cx * 4.1 + 1.0) + 0.05 * sin(cx * 11.3) + 0.09 * (1.0 - crag) * h11(floor(cx * 5.2 + 0.3) + 7.0);
    cliffTop = min(cliffTop, hh - 0.14);
    float span = 1.32 + 0.08 * sin(q.y * 9.0);
    float cliff = step(abs(cx), span) * step(-0.02, q.y) * step(q.y, cliffTop) * step(sdH, 0.0);
    float fx = cx * 4.3 + 0.18 * sin(q.y * 6.0);
    float cell = floor(fx);
    float fr = fract(fx);
    float lit = step(0.5, h11(cell * 3.7 + 1.0));
    vec3 rockL = FC(vec3(0.8, 0.78, 0.72), c255(230.0, 226.0, 214.0));
    vec3 rockM = FC(vec3(0.68, 0.67, 0.66), c255(200.0, 198.0, 194.0));
    vec3 rockS = FC(vec3(0.55, 0.56, 0.6), c255(166.0, 168.0, 176.0));
    vec3 rock = mix(rockM, rockL, lit);
    rock = mix(rock, rockS, step(fr, 0.16));                                   // shadowed side of each face
    rock = mix(rock, rockS, step(0.94, fract(q.y * 3.2 + 0.2 * sin(cx * 7.0))) * 0.7);   // ledges
    alb = mix(alb, rock, cliff);
    // a lawn in front of the monastery and on the slope below it
    float lawn = step(abs(q.x + 0.05), 1.18 - q.y * 0.9 + 0.04 * sin(q.y * 23.0 + q.x * 3.0)) * step(q.y, 0.0) * step(sdH, 0.0);
    alb = mix(alb, FC(vec3(0.42, 0.55, 0.27), c255(124.0, 204.0, 90.0)), lawn);
    vec3 c = light(alb, 0.42 + shade * sign(uLight.x) * 0.08);
    c = atmos(c, p, z);
    acc = vec4(c * a, a);
    // bushes and small trees clinging to the top of the cliff
    float bush = 1e5;
    float bc = floor(cx / 0.13);
    for (int k = -1; k <= 1; k++) {
      float ci = bc + float(k);
      float bx = (ci + 0.5) * 0.13 - 0.05 + (h11(ci * 5.1) - 0.5) * 0.06;
      if (abs(bx + 0.05) > 1.28 || h11(ci * 2.3) < 0.35) continue;
      float bxc = bx + 0.05;
      float bcr = abs(fract(bxc * 5.2 + 0.3) - 0.5) * 2.0;
      float top = min(0.5 + 0.1 * sin(bxc * 4.1 + 1.0) + 0.05 * sin(bxc * 11.3) + 0.09 * (1.0 - bcr) * h11(floor(bxc * 5.2 + 0.3) + 7.0), monHill(bx) - 0.14);
      float r = 0.035 + 0.03 * h11(ci * 7.7);
      bush = min(bush, length((q - vec2(bx, top + r * 0.4)) / vec2(1.25, 1.0)) - r);
    }
    float ba2 = aa(bush, pl);
    if (ba2 > 0.0) acc = over(acc, atmos(light(FC(vec3(0.2, 0.36, 0.2), c255(62.0, 150.0, 76.0)), 0.45), p, z), ba2 * a);
  }

  // ---- buildings, painted back to front so nothing cuts into the church
  vec4 bld = vec4(0.0);
  float det = 0.0;
  vec3 white = FC(vec3(0.95, 0.93, 0.88), c255(252.0, 250.0, 244.0));
  vec3 whiteSh = FC(vec3(0.84, 0.83, 0.8), c255(226.0, 226.0, 228.0));
  vec3 glass = FC(vec3(0.24, 0.26, 0.3), c255(70.0, 96.0, 140.0));
  vec3 warmL = vec3(1.0, 0.76, 0.42) * uMisc.x * 1.25;
  vec3 metalL = FC(vec3(0.62, 0.64, 0.68), c255(178.0, 186.0, 200.0));
  vec3 metalD = FC(vec3(0.46, 0.48, 0.53), c255(126.0, 134.0, 152.0));
  vec3 stoneC = FC(vec3(0.78, 0.72, 0.6), c255(222.0, 206.0, 176.0));
  vec3 stoneM = FC(vec3(0.66, 0.6, 0.5), c255(190.0, 172.0, 144.0));
  vec3 gold = FC(vec3(0.86, 0.7, 0.32), c255(244.0, 196.0, 48.0));

  // konaks: white ground floor (arcades on the left one), dark wooden gallery above, tile roof
  for (int kk = 0; kk < 2; kk++) {
    bool left = kk == 0;
    float x0 = left ? -1.06 : 0.45, x1 = left ? -0.34 : 0.87;
    float yTop = left ? 0.23 : 0.2, gal = left ? 0.12 : 0.11;
    float cx = 0.5 * (x0 + x1), hw = 0.5 * (x1 - x0);
    float wall = sdBox(q, vec2(cx, yTop * 0.5), vec2(hw, yTop * 0.5));
    float a = aa(wall, pl);
    if (a > 0.0) {
      vec3 col = white;
      float d = 0.0;
      if (q.y > gal) {
        col = FC(vec3(0.38, 0.26, 0.18), c255(112.0, 74.0, 50.0));
        float wx = fract((q.x - x0) / 0.055) - 0.5;
        d = step(abs(wx), 0.28) * step(abs(q.y - (gal + yTop) * 0.5), (yTop - gal) * 0.28);
        col = mix(col, FC(vec3(0.9, 0.86, 0.76), c255(246.0, 236.0, 210.0)), d);
        col = mix(col, FC(vec3(0.3, 0.2, 0.14), c255(86.0, 56.0, 38.0)), step(abs(q.y - gal - 0.006), 0.006));
      } else if (left) {
        float ax = (fract((q.x - x0) / 0.09) - 0.5) * 0.09;
        float arch = max(abs(ax) - 0.027, q.y - 0.07);
        arch = min(arch, length(vec2(ax, q.y - 0.07)) - 0.027);
        arch = max(arch, -q.y);
        col = mix(col, FC(vec3(0.5, 0.46, 0.4), c255(150.0, 134.0, 114.0)), smoothstep(pl, -pl, arch));
      } else {
        float wx = fract((q.x - x0) / 0.07) - 0.5;
        d = step(abs(wx), 0.18) * step(abs(q.y - 0.055), 0.022);
        col = mix(col, glass, d);
      }
      bld = over(bld, light(col, 0.55) + warmL * d, a);
      det = mix(det, d, a);
    }
    float roof = hipRoof(q, x0, x1, yTop, left ? 0.13 : 0.12, left ? 0.05 : 0.045);
    float ar = aa(roof, pl);
    if (ar > 0.0) {
      float sideR = step(0.0, (q.x - cx) * sideL);
      vec3 col = mix(FC(vec3(0.62, 0.28, 0.18), c255(214.0, 76.0, 48.0)), FC(vec3(0.72, 0.34, 0.2), c255(238.0, 104.0, 62.0)), sideR);
      col *= 1.0 - 0.07 * step(0.82, fract(q.y * 60.0)) * (1.0 - uStyle.x * 0.4);
      bld = over(bld, light(col, 0.55), ar);
      det = mix(det, 0.0, ar);
    }
  }

  // ---- the church of the Holy Trinity, seen from the west: drum and dome behind the gable
  {
    float W = 0.21, H0 = 0.3, GH = 0.14;                      // half-width, wall height, gable height
    // drum (its foot is hidden by the gable) with a cornice, then the lead dome, lantern and cross
    float drum = sdBox(q, vec2(0.0, 0.47), vec2(0.084, 0.13));
    float corn = sdBox(q, vec2(0.0, 0.603), vec2(0.093, 0.009));
    float a = aa(min(drum, corn), pl);
    if (a > 0.0) {
      float lit = step(0.0, q.x * sideL);
      vec3 col = mix(whiteSh, white, lit);
      float d = 0.0;
      if (drum < corn) {
        float wx = q.x - clamp(floor(q.x / 0.046 + 0.5), -1.0, 1.0) * 0.046;
        float w = max(abs(wx) - 0.011, abs(q.y - 0.505) - 0.042);
        w = min(w, length(vec2(wx, q.y - 0.547)) - 0.011 + step(q.y, 0.547) * 1e3);
        d = smoothstep(pl, -pl, w) * step(abs(q.x), 0.07);
        col = mix(col, glass, d);
      } else {
        col = mix(metalD, metalL, lit);
      }
      bld = over(bld, light(col, 0.55) + warmL * d, a);
      det = mix(det, d, a);
    }
    float dome = max(length((q - vec2(0.0, 0.612)) / vec2(0.09, 0.085)) - 1.0, 0.612 - q.y) * 0.085;
    float lant = sdBox(q, vec2(0.0, 0.708), vec2(0.011, 0.014));
    float crs = min(sdBox(q, vec2(0.0, 0.76), vec2(0.0055, 0.042)), sdBox(q, vec2(0.0, 0.776), vec2(0.021, 0.0055)));
    a = aa(min(dome, lant), pl);
    if (a > 0.0) {
      float lit = step(0.0, (q.x - 0.012) * sideL);
      bld = over(bld, light(mix(metalD, metalL, lit), 0.55), a);
      det = mix(det, 0.0, a);
    }
    a = aa(crs, pl);
    if (a > 0.0) { bld = over(bld, light(gold, 0.6), a); det = mix(det, 1.0, a); }

    // the west front: wall + gable
    float gy = H0 + GH * (1.0 - abs(q.x) / W);                 // top of the gable at this x
    float front = max(abs(q.x) - W, max(-q.y, q.y - max(gy, H0)));
    front = max(front, (q.y - gy) * W / sqrt(W * W + GH * GH));
    a = aa(front, pl);
    if (a > 0.0) {
      vec3 col = white;
      float d = 0.0;
      // stone plinth
      col = mix(col, stoneC, step(q.y, 0.026));
      // round window in the gable
      float ocu = length(q - vec2(0.0, H0 + GH * 0.42)) - 0.021;
      col = mix(col, glass, smoothstep(pl, -pl, ocu));
      d = max(d, smoothstep(pl, -pl, ocu));
      // the Holy Trinity fresco across the upper wall: blue ground, three haloed figures, red frame
      float fr = sdBox(q, vec2(0.0, 0.245), vec2(0.155, 0.043));
      if (fr < pl) {
        float fm = smoothstep(pl, -pl, fr);
        vec3 fc = FC(vec3(0.2, 0.32, 0.6), c255(48.0, 88.0, 168.0));
        float fx = q.x - clamp(floor(q.x / 0.075 + 0.5), -1.0, 1.0) * 0.075;
        float robe = max(abs(fx) - 0.019 + (q.y - 0.206) * 0.12, max(0.206 - q.y, q.y - 0.262));
        float halo = length(vec2(fx, q.y - 0.268)) - 0.014;
        fc = mix(fc, FC(vec3(0.82, 0.55, 0.3), c255(214.0, 150.0, 82.0)), smoothstep(pl, -pl, robe));
        fc = mix(fc, gold, smoothstep(pl, -pl, halo));
        fc = mix(FC(vec3(0.7, 0.24, 0.2), c255(190.0, 60.0, 50.0)), fc, smoothstep(-0.006 - pl, -0.006 + pl, -fr));
        col = mix(col, fc, fm);
        d = max(d, step(fr, -0.006));
      }
      // arched door with a small fresco lunette, and a narrow window each side
      float door = max(abs(q.x) - 0.042, max(0.026 - q.y, q.y - 0.125));
      door = min(door, max(length(q - vec2(0.0, 0.125)) - 0.042, 0.125 - q.y));
      col = mix(col, FC(vec3(0.42, 0.28, 0.18), c255(122.0, 80.0, 52.0)), smoothstep(pl, -pl, door));
      float wx = abs(q.x) - 0.132;
      float win = max(abs(wx) - 0.016, abs(q.y - 0.105) - 0.04);
      win = min(win, length(vec2(wx, q.y - 0.145)) - 0.016 + step(q.y, 0.145) * 1e3);
      float wm = smoothstep(pl, -pl, win);
      col = mix(col, glass, wm);
      d = max(d, wm);
      bld = over(bld, light(col, 0.56) + warmL * d + vec3(1.0, 0.88, 0.66) * uMisc.x * 0.2, a);
      det = mix(det, d, a);
    }
    // metal roof edge along the gable, with eaves
    float slope = GH / W;
    float yE = H0 + GH - slope * abs(q.x);
    float band = (abs(q.y - yE - 0.013) - 0.013) / sqrt(1.0 + slope * slope);
    band = max(band, abs(q.x) - (W + 0.032));
    a = aa(band, pl);
    if (a > 0.0) {
      float lit = step(0.0, q.x * sideL);
      bld = over(bld, light(mix(metalD, metalL, lit), 0.55), a);
      det = mix(det, 0.0, a);
    }
  }

  // ---- stone bell tower with arched belfry openings and a tall lead spire
  {
    float tx = q.x - 0.37;
    float shaft = sdBox(q, vec2(0.37, 0.25), vec2(0.064, 0.25));
    float a = aa(shaft, pl);
    if (a > 0.0) {
      float row = floor(q.y / 0.028);
      float bx = fract(tx / 0.05 + 0.5 * mod(row, 2.0));
      float by = fract(q.y / 0.028);
      vec3 col = mix(stoneC, stoneM, max(step(0.9, bx), step(0.86, by)) * (1.0 - 0.3 * uStyle.x));
      col *= step(0.0, tx * sideL) * 0.1 + 0.9;
      float ox = abs(tx) - 0.027;
      float arch = max(abs(ox) - 0.017, abs(q.y - 0.405) - 0.036);
      arch = min(arch, length(vec2(ox, q.y - 0.441)) - 0.017 + step(q.y, 0.441) * 1e3);
      float am = smoothstep(pl, -pl, arch);
      col = mix(col, c255(52.0, 48.0, 50.0), am);
      bld = over(bld, light(col, 0.55) + warmL * am * 0.5, a);
      det = mix(det, 1.0, a);
    }
    float corn = sdBox(q, vec2(0.37, 0.506), vec2(0.074, 0.009));
    float spire = max(abs(tx) - 0.074 * (1.0 - sat((q.y - 0.515) / 0.22)), max(0.513 - q.y, q.y - 0.735));
    a = aa(min(corn, spire), pl);
    if (a > 0.0) {
      float lit = step(0.0, tx * sideL);
      bld = over(bld, light(mix(metalD, metalL, lit), 0.55), a);
      det = mix(det, 0.0, a);
    }
    float crs = min(sdBox(q, vec2(0.37, 0.77), vec2(0.004, 0.038)), sdBox(q, vec2(0.37, 0.782), vec2(0.017, 0.004)));
    a = aa(crs, pl);
    if (a > 0.0) { bld = over(bld, light(gold, 0.6), a); det = mix(det, 1.0, a); }
  }

  // ---- trees: a spruce between the left konak and the church, a cypress on the right
  {
    float sp = sdConifer(q, -0.29, -0.02, 0.5, 0.05, 6.0);
    float cy = sdPoplar(q, 0.93, -0.02, 0.3, 0.035);
    float a = aa(min(sp, cy), pl);
    if (a > 0.0) {
      float cxT = sp < cy ? -0.29 : 0.93;
      vec3 col = FC(vec3(0.16, 0.3, 0.2), c255(40.0, 124.0, 70.0));
      bld = over(bld, light(col, 0.35 + 0.15 * sign(q.x - cxT) * sideL), a);
      det = mix(det, 0.0, a);
    }
  }

  // ---- stone terrace wall with steps, in front of everything
  {
    float wall = sdBox(q, vec2(-0.08, -0.07), vec2(1.12, 0.07));
    float stairs = sdBox(vec2(q.x - 0.72, q.y + 0.04 - (q.x - 0.72) * 0.9), vec2(0.0), vec2(0.09, 0.03));
    float a = aa(min(wall, stairs), pl);
    if (a > 0.0) {
      float row = floor(q.y / 0.028);
      float bx = fract(q.x / 0.05 + 0.5 * mod(row, 2.0));
      float by = fract(q.y / 0.028);
      vec3 col = mix(stoneC, stoneM, max(step(0.9, bx), step(0.86, by)) * (1.0 - 0.3 * uStyle.x));
      bld = over(bld, light(col, 0.55), a);
      det = mix(det, 1.0, a);
    }
  }

  if (bld.a > 0.0) {
    vec3 c = bld.rgb / bld.a;
    c *= mix(0.86, 1.0, sat((q.y + 0.14) / 0.06));
    c = atmos(c, p, z);
    acc = overP(acc, vec4(c * bld.a, bld.a));
    gDet = step(0.5, det) * step(0.5, bld.a);
  }
  return acc;
}

// ---------------------------------------------------------------------
//  TOWN
// ---------------------------------------------------------------------
// windows: returns (mask, lit) for a wall rectangle
vec2 windows(float x, float y, float w, float hh, float seed) {
  float cols = max(1.0, floor(w * 2.0 / 0.06));
  float cw = w * 2.0 / cols;
  float rows = max(1.0, floor((hh - 0.03) / 0.065));
  float ch = (hh - 0.03) / rows;
  float ix = floor((x + w) / cw), iy = floor((y - 0.02) / ch);
  float fx = fract((x + w) / cw) - 0.5, fy = fract((y - 0.02) / ch) - 0.5;
  if (iy < 0.0 || iy >= rows || ix < 0.0 || ix >= cols) return vec2(0.0);
  float m = step(abs(fx), 0.2) * step(abs(fy), 0.24);
  float lit = step(0.42, h21(vec2(ix, iy) + seed * 7.1));
  return vec2(m, lit);
}

// One house of a town row (premultiplied colour). Houses may overlap their neighbours.
vec4 house(vec2 p, float pw, float cell, float cw, float base, float seed, float density) {
  float r1 = h11(cell * 1.31 + seed), r2 = h11(cell * 2.17 + seed * 1.7);
  float r3 = h11(cell * 3.07 + seed * 2.3), r4 = h11(cell * 4.41 + seed * 0.7);
  float cx = (cell + 0.5) * cw + (r1 - 0.5) * cw * 0.45;
  base += (h11(cell * 8.3 + seed) - 0.5) * 0.035;
  float x = p.x - cx, y = p.y - base;
  if (y > 0.4 || y < -0.03 || abs(x) > cw) return vec4(0.0);
  if (r4 > density) {
    // no house here: a garden tree or a poplar
    float sd = r2 > 0.5 ? sdPoplar(p, cx, base, mix(0.2, 0.32, r3), 0.034) : sdRoundTree(p, cx, base, mix(0.11, 0.17, r3), 0.052);
    float a = aa(sd, pw);
    if (a <= 0.0) return vec4(0.0);
    float sh = clamp((p.x - cx) / 0.05, -1.0, 1.0) * sign(uLight.x);
    vec3 cc = light(FC(vec3(0.22, 0.35, 0.19) * (0.88 + 0.24 * tn(p * 70.0)), r2 > 0.5 ? c255(47.0, 143.0, 71.0) : c255(86.0, 184.0, 79.0)), 0.28 + 0.2 * sh);
    return vec4(cc * a, a);
  }
  float w = cw * mix(0.36, 0.58, r2);
  float hh = mix(0.08, 0.2, r3 * r3 * r3) + step(0.93, r3) * 0.05;
  float rh = mix(0.045, 0.09, r1) * (0.75 + w * 1.6);
  float sdW = max(abs(x) - w, max(-y, y - hh));
  float ry = y - hh;
  float ew = w + 0.017;
  float topF = r2 > 0.22 ? mix(0.18, 0.45, r3) : 0.03;     // mostly hipped roofs, a few gable ends
  float rhw = ew * mix(1.0, topF, sat(ry / rh));
  float sdR = max((abs(x) - rhw) * 0.8, max(-ry + 0.004, ry - rh));
  float chim = r4 < 0.4 ? sdBox(vec2(x, y), vec2(w * (r1 * 1.2 - 0.6), hh + rh * 0.72), vec2(0.011, rh * 0.42)) : 1e5;
  float sd = min(min(sdW, sdR), chim);
  float a = aa(sd, pw);
  if (a <= 0.0) return vec4(0.0);
  float wsel = h11(cell * 6.13 + seed);
  vec3 wall = wsel < 0.3 ? vec3(0.94, 0.9, 0.82) : (wsel < 0.5 ? vec3(0.9, 0.83, 0.7) : (wsel < 0.7 ? vec3(0.96, 0.94, 0.9) : (wsel < 0.85 ? vec3(0.88, 0.76, 0.62) : vec3(0.93, 0.82, 0.78))));
  vec3 wallF = wsel < 0.3 ? c255(255.0, 244.0, 220.0) : (wsel < 0.5 ? c255(255.0, 227.0, 168.0) : (wsel < 0.7 ? c255(255.0, 255.0, 255.0) : (wsel < 0.85 ? c255(255.0, 215.0, 207.0) : c255(214.0, 236.0, 255.0))));
  wall = FC(wall, wallF);
  float rsel = h11(cell * 7.77 + seed);
  vec3 roof = rsel < 0.45 ? vec3(0.66, 0.29, 0.18) : (rsel < 0.7 ? vec3(0.52, 0.25, 0.18) : (rsel < 0.85 ? vec3(0.46, 0.31, 0.23) : vec3(0.37, 0.37, 0.4)));
  vec3 roofF = rsel < 0.5 ? c255(236.0, 96.0, 54.0) : (rsel < 0.78 ? c255(210.0, 66.0, 44.0) : (rsel < 0.92 ? c255(176.0, 88.0, 58.0) : c255(107.0, 111.0, 122.0)));
  roof = FC(roof, roofF);
  float isRoof = step(min(sdR, chim), sdW);
  gDet = 0.0;
  float sside = sign(uLight.x) * sign(x);
  float dirWall = (0.46 + 0.08 * sside) * (1.0 - 0.72 * uMisc2.x);
  float dirRoof = (0.48 + 0.34 * sside * (1.0 - topF)) * (0.45 + 0.55 * uLight.y);
  vec3 c;
  if (isRoof > 0.5) {
    float tiles = mix(0.9 + 0.12 * step(0.5, fract(ry * 70.0)) + 0.08 * noise2(vec2(x * 90.0, y * 20.0)), 1.0, uStyle.x);
    c = light(roof * tiles, dirRoof);
    c += rim(max(sdR, -0.02), 0.012) * 0.6;
  } else {
    c = light(wall, dirWall);
    c *= mix(0.78, 1.0, sat(y / 0.045));                  // grounding shadow
    c *= 1.0 - 0.25 * smoothstep(hh - 0.02, hh, y);          // eave shadow
    vec2 wn = windows(x, y, w, hh, cell + seed);
    vec3 glass = FC(mix(vec3(0.18, 0.2, 0.25), uSkyMid * 0.55, 0.35), c255(58.0, 90.0, 140.0) * uCelTint);
    vec3 warm = mix(vec3(1.0, 0.7, 0.36), vec3(1.0, 0.86, 0.56), h11(cell * 7.7));
    c = mix(c, glass, wn.x * 0.8);
    c += warm * wn.x * wn.y * uMisc.x * 1.3;
    gDet = step(0.5, wn.x);
  }
  return vec4(c * a, a);
}

// Row of overlapping houses: current cell + nearest neighbour, drawn by priority
vec4 houseRow(vec2 p, float pw, float z, float base, float cw, float seed, float s0, float s1, float density) {
  float c0 = floor(p.x / cw);
  float c1 = c0 + (fract(p.x / cw) < 0.5 ? -1.0 : 1.0);
  float x0 = (c0 + 0.5) * cw, x1 = (c1 + 0.5) * cw;
  bool k0 = !(x0 > s0 && x0 < s1), k1 = !(x1 > s0 && x1 < s1);
  gDet = 0.0;
  vec4 a = k0 ? house(p, pw, c0, cw, base, seed, density) : vec4(0.0);
  float da = a.a > 0.0 ? gDet : 0.0;
  gDet = 0.0;
  vec4 b = k1 ? house(p, pw, c1, cw, base, seed, density) : vec4(0.0);
  float db = b.a > 0.0 ? gDet : 0.0;
  float pa = h11(c0 * 9.1 + seed), pb = h11(c1 * 9.1 + seed);
  vec4 back = pa > pb ? b : a;
  vec4 front = pa > pb ? a : b;
  gDet = front.a > 0.5 ? (pa > pb ? da : db) : (pa > pb ? db : da);
  return vec4(front.rgb + back.rgb * (1.0 - front.a), front.a + back.a * (1.0 - front.a));
}

// Yugoslav-era apartment blocks (4–12 floors), the white slabs that stand out
// over Pljevlja's red roofs; some were given hipped roofs in later years
vec4 blockRow(vec2 p, float pw, float base, float cw, float seed) {
  float cell = floor(p.x / cw);
  vec4 acc = vec4(0.0);
  float dAcc = 0.0;
  for (int k = 0; k <= 1; k++) {
    float ci = cell + float(k) - (fract(p.x / cw) < 0.5 ? 1.0 : 0.0);
    float r1 = h11(ci * 1.7 + seed), r2 = h11(ci * 2.9 + seed), r3 = h11(ci * 4.3 + seed), r4 = h11(ci * 5.9 + seed);
    if (r3 > 0.62) continue;
    float cx = (ci + 0.5) * cw + (r1 - 0.5) * cw * 0.3;
    float x = p.x - cx, y = p.y - base;
    float floors = floor(mix(4.0, 9.0, r1 * r1)) + (r4 > 0.9 ? 4.0 : 0.0);
    float fh = 0.034;
    float hh = floors * fh + 0.02;
    float w = mix(0.1, 0.2, r2);
    if (r4 > 0.9) w = 0.075;                                  // a slim tower
    float hipped = step(0.62, r2) * step(r4, 0.9);
    float rh = hipped * 0.05;
    if (abs(x) > w + 0.03 || y > hh + rh + 0.02 || y < -0.05) continue;
    float body = max(abs(x) - w, max(-y - 0.05, y - hh));
    float roof = hipped > 0.5 ? max((abs(x) - (w + 0.012) * mix(1.0, 0.35, sat((y - hh) / rh))) * 0.8, max(hh - y, y - hh - rh))
                              : sdBox(vec2(x, y), vec2(0.0, hh + 0.007), vec2(w + 0.006, 0.007));
    float sd = min(body, roof);
    float a = aa(sd, pw);
    if (a <= 0.0) continue;
    float wsel = r3 / 0.62;
    vec3 wall = FC(wsel < 0.35 ? vec3(0.9, 0.9, 0.88) : (wsel < 0.6 ? vec3(0.92, 0.86, 0.72) : (wsel < 0.8 ? vec3(0.9, 0.8, 0.74) : vec3(0.84, 0.86, 0.9))),
                   wsel < 0.35 ? c255(248.0, 247.0, 242.0) : (wsel < 0.6 ? c255(255.0, 232.0, 186.0) : (wsel < 0.8 ? c255(255.0, 212.0, 192.0) : c255(222.0, 230.0, 242.0))));
    vec3 c;
    float det = 0.0;
    if (roof < body) {
      c = light(hipped > 0.5 ? FC(vec3(0.6, 0.28, 0.2), c255(222.0, 84.0, 56.0)) : FC(vec3(0.5, 0.5, 0.52), c255(150.0, 152.0, 162.0)), 0.5);
    } else {
      float sside = sign(uLight.x) * sign(x);
      c = light(wall, (0.46 + 0.06 * sside) * (1.0 - 0.7 * uMisc2.x));
      c *= mix(0.84, 1.0, sat(y / 0.05));
      // windows in a grid, balconies stacked in a vertical band
      float colW = 0.042;
      float ix = floor((x + w) / colW), iy = floor(y / fh);
      float fx = fract((x + w) / colW) - 0.5, fy = fract(y / fh) - 0.5;
      float inside = step(abs(x), w - 0.014) * step(0.0, y - 0.004) * step(y, hh - 0.014);
      float win = step(abs(fx), 0.26) * step(abs(fy), 0.24) * inside;
      float lit = step(0.45, h21(vec2(ix, iy) + ci * 3.3 + seed));
      // pale glass on the white slabs keeps the facades calm in the cut-out look
      vec3 glass = FC(mix(vec3(0.2, 0.22, 0.27), uSkyMid * 0.55, 0.35), c255(84.0, 122.0, 178.0) * uCelTint);
      c = mix(c, glass, win * 0.9);
      det = step(0.5, win);
      c += mix(vec3(1.0, 0.74, 0.42), vec3(0.85, 0.9, 1.0), step(0.8, h21(vec2(iy, ix) + seed))) * win * lit * uMisc.x * 1.1;
    }
    // the building found first stays in front
    if (acc.a < 0.5 && a > 0.5) dAcc = det;
    acc = overP(vec4(c * a, a), acc);
  }
  gDet = dAcc;
  return acc;
}

// The Husein-paša mosque (1569), its 42 m minaret and the 25 m Sahat-kula
vec4 landmarks(vec2 p, float pw, float base) {
  float x0 = 2.25;           // minaret axis
  float x = p.x - x0, y = p.y - base;
  if (x < -1.05 || x > 0.75 || y > 1.05 || y < -0.02) return vec4(0.0);
  vec3 stone = FC(vec3(0.95, 0.93, 0.87), c255(255.0, 255.0, 255.0));
  vec3 lead = FC(vec3(0.44, 0.46, 0.5), c255(122.0, 132.0, 148.0));
  vec4 acc = vec4(0.0);
  float sideSign = sign(uLight.x);
  float dirWall = 0.45 * (1.0 - 0.7 * uMisc2.x);

  // ---- mosque (to the left of the minaret), drawn in a scaled frame ----
  float S = 0.82;
  vec2 mq = vec2(x + 0.3, y) / S;
  float mx = mq.x, my = mq.y;
  float hall = sdBox(mq, vec2(0.0, 0.1), vec2(0.18, 0.1));
  float drum = sdBox(mq, vec2(0.0, 0.214), vec2(0.155, 0.02));
  float dome = max(length((mq - vec2(0.0, 0.232)) / vec2(1.0, 0.8)) - 0.162, -(my - 0.232));
  float alem1 = min(sdBox(mq, vec2(0.0, 0.39), vec2(0.0035, 0.03)), length(vec2(mx, my - 0.425)) - 0.008);
  // portico with three small domes
  float px = mx + 0.32;
  float porch = sdBox(vec2(px, my), vec2(0.0, 0.065), vec2(0.14, 0.065));
  float arches = 1e5;
  for (int i = -1; i <= 1; i++) {
    float ax = float(i) * 0.093;
    float ar = max(max(abs(px - ax) - 0.03, -my), my - 0.07);
    ar = min(ar, length(vec2(px - ax, my - 0.07)) - 0.03);
    arches = min(arches, ar);
  }
  float pdomes = 1e5;
  for (int i = -1; i <= 1; i++) {
    float ax = float(i) * 0.093;
    pdomes = min(pdomes, max(length((vec2(px - ax, my - 0.13)) / vec2(1.0, 0.85)) - 0.042, -(my - 0.13)));
  }
  float mosqueWalls = min(min(hall, drum), porch);
  mosqueWalls = mosqueWalls * S;
  float mosqueLead = min(dome, pdomes) * S;
  alem1 *= S;
  arches *= S;
  dome *= S;

  // ---- minaret (drawn smaller: the monastery is the landmark that should stand out) ----
  const float MS = 0.7;
  float xo = x, yo = y;
  x /= MS; y /= MS;
  float ax = abs(x);
  float mn = sdBox(vec2(x, y), vec2(0.0, 0.05), vec2(0.046, 0.05));              // square base
  mn = min(mn, max(ax - mix(0.046, 0.034, sat((y - 0.1) / 0.03)), max(0.1 - y, y - 0.135)));
  mn = min(mn, sdBox(vec2(x, y), vec2(0.0, 0.38), vec2(0.033, 0.25)));           // shaft
  float cor = max(ax - mix(0.033, 0.052, sat((y - 0.6) / 0.04)), max(0.6 - y, y - 0.64));
  mn = min(mn, cor);                                                             // muqarnas corbel
  mn = min(mn, sdBox(vec2(x, y), vec2(0.0, 0.653), vec2(0.054, 0.014)));          // šerefe balcony
  mn = min(mn, sdBox(vec2(x, y), vec2(0.0, 0.715), vec2(0.027, 0.05)));           // upper shaft
  float cone = max(ax - 0.031 * (1.0 - sat((y - 0.765) / 0.155)), max(0.765 - y, y - 0.92));
  float alem = sdBox(vec2(x, y), vec2(0.0, 0.945), vec2(0.0035, 0.028));
  float cres = max(length(vec2(x, y - 0.985)) - 0.013, -(length(vec2(x + 0.006, y - 0.99)) - 0.011));
  alem = min(alem, cres);
  mn *= MS; cone *= MS; alem *= MS; cor *= MS;
  x = xo; y = yo; ax = abs(x);
  alem = min(alem, alem1 - 0.0);  // (mosque finial reuses gold)

  // ---- Sahat-kula clock tower (to the right) ----
  float tx = x - 0.45;
  float shaft = sdBox(vec2(tx, y), vec2(0.0, 0.22), vec2(0.042, 0.22));          // stone shaft
  float belfry = sdBox(vec2(tx, y), vec2(0.0, 0.49), vec2(0.047, 0.05));          // white belfry
  belfry = min(belfry, sdBox(vec2(tx, y), vec2(0.0, 0.547), vec2(0.056, 0.008))); // cornice
  float tower = min(shaft, belfry);
  float try_ = y - 0.555;
  float troof = max(abs(tx) - 0.06 * (1.0 - try_ / 0.09), max(-try_, try_ - 0.09));
  troof = min(troof, sdBox(vec2(tx, y), vec2(0.0, 0.668), vec2(0.0035, 0.024)));   // the iron cross on top
  troof = min(troof, sdBox(vec2(tx, y), vec2(0.0, 0.676), vec2(0.013, 0.0035)));
  float clock = length(vec2(tx, y - 0.39)) - 0.025;

  float whiteSd = min(min(mosqueWalls, mn), tower);
  float leadSd = min(min(mosqueLead, cone), troof);
  float sd = min(min(whiteSd, leadSd), alem);
  float a = aa(sd, pw);
  if (a <= 0.0) return vec4(0.0);

  // colour selection
  vec3 alb = stone;
  float shadeX = 0.0;
  if (leadSd < whiteSd && leadSd < alem) alb = lead;
  if (alem < whiteSd && alem < leadSd) alb = FC(vec3(0.86, 0.7, 0.32), c255(244.0, 196.0, 48.0));
  if (shaft < mn && shaft < mosqueWalls && shaft < belfry && whiteSd <= leadSd) alb = FC(vec3(0.84, 0.76, 0.62), c255(228.0, 204.0, 162.0));
  // cylindrical shading on the minaret shaft & domes
  if (mn < 0.0 || cone < 0.0) shadeX = clamp(x / 0.035, -1.0, 1.0);
  if (dome < 0.0) shadeX = clamp(mx / 0.15, -1.0, 1.0);
  float cyl = 0.5 + 0.5 * shadeX * sideSign;
  vec3 c = light(alb, dirWall * (0.6 + 0.8 * cyl) + 0.05);
  c *= mix(0.84, 1.0, sat(y / 0.05));
  // two rows of arched windows on the prayer hall
  float wqx = (fract((mx + 0.18) / 0.06) - 0.5) * 0.06;
  float winS = max(abs(wqx) - 0.012, abs(my - 0.06) - 0.024);
  winS = min(winS, length(vec2(wqx, max(my - 0.084, 0.0))) - 0.012 + step(my, 0.084) * 1e3);
  winS = min(winS, max(abs(wqx) - 0.01, abs(my - 0.145) - 0.018));
  float winM = smoothstep(pw / S, -pw / S, winS) * step(hall, 0.0) * step(abs(mx), 0.15);
  c = mix(c, light(FC(vec3(0.28, 0.26, 0.25), c255(84.0, 122.0, 178.0) * uCelTint), 0.2), winM * 0.8);
  c += vec3(1.0, 0.78, 0.46) * winM * uMisc.x * 0.95;
  gDet = step(0.5, winM);
  // porch arches: shaded openings, warm lamplight at night
  float archM = smoothstep(pw, -pw, arches) * step(mosqueWalls, 0.0);
  c = mix(c, light(vec3(0.3, 0.27, 0.24), 0.15), archM * 0.85);
  c += vec3(1.0, 0.75, 0.42) * archM * uMisc.x * 0.9;
  // belfry opening with a round arch
  float arch = max(abs(tx) - 0.015, abs(y - 0.482) - 0.03);
  arch = min(arch, length(vec2(tx, y - 0.512)) - 0.015);
  float archO = smoothstep(pw, -pw, arch) * step(belfry, 0.0);
  c = mix(c, light(vec3(0.22, 0.2, 0.2), 0.2), archO);
  c += vec3(1.0, 0.8, 0.5) * archO * uMisc.x * 0.8;
  // clock face
  float face = smoothstep(pw, -pw, clock);
  c = mix(c, vec3(0.95, 0.93, 0.85), face);
  float hands = min(sdSeg(vec2(tx, y - 0.39), vec2(0.0), vec2(0.0, 0.017)), sdSeg(vec2(tx, y - 0.39), vec2(0.0), vec2(0.012, -0.004)));
  c = mix(c, vec3(0.1), smoothstep(pw * 1.2, 0.0, hands - 0.002) * face);
  // night: floodlit minaret & mosque, glowing clock
  float flood = (1.0 - sat(y / 1.1)) * 0.6 + 0.4;
  if (alb != lead) c += vec3(1.0, 0.86, 0.62) * uMisc.x * 0.16 * flood * (0.7 + 0.3 * cyl);
  c += vec3(1.0, 0.9, 0.65) * face * uMisc.x * 0.9;
  return vec4(c * a, a);
}

// Hotel "Pljevlja" in the centre: a row of steep, tall zinc gables with
// dormer windows over a white two-storey base with a red ground floor
vec4 hotel(vec2 p, float pw, float hx, float base) {
  float x = p.x - hx, y = p.y - base;
  if (abs(x) > 0.3 || y < -0.03 || y > 0.4) return vec4(0.0);
  float walls = sdBox(vec2(x, y), vec2(0.0, 0.035), vec2(0.23, 0.06));
  float roof = 1e5;
  for (int i = -1; i <= 1; i++) {
    float gx = float(i) * 0.14;
    float gh = i == 0 ? 0.29 : 0.23;
    float ry = y - 0.08;
    roof = min(roof, max((abs(x - gx) - 0.088 * (1.0 - ry / gh)) * 0.9, max(-ry, ry - gh)));
  }
  float sd = min(walls, roof);
  float a = aa(sd, pw);
  if (a <= 0.0) return vec4(0.0);
  vec3 c;
  if (roof < walls) {
    float gx = floor(x / 0.14 + 0.5) * 0.14;
    float side = sign(x - gx) * sign(uLight.x);
    vec3 zinc = mix(FC(vec3(0.42, 0.44, 0.5), c255(112.0, 118.0, 134.0)), FC(vec3(0.56, 0.58, 0.64), c255(150.0, 156.0, 172.0)), step(0.0, side));
    // two rows of small dormers
    float dx = fract((x - gx) / 0.05 + 0.5) - 0.5;
    float dm = step(abs(dx), 0.22) * (step(abs(y - 0.14), 0.012) + step(abs(y - 0.2), 0.011) * step(abs(x - gx), 0.04));
    vec3 glass = FC(vec3(0.22, 0.24, 0.3), c255(64.0, 96.0, 146.0) * uCelTint);
    c = light(mix(zinc, glass, dm), 0.5);
    c += vec3(1.0, 0.8, 0.5) * dm * uMisc.x * 1.2;
    gDet = step(0.5, dm);
  } else {
    vec3 wall = mix(FC(vec3(0.92, 0.9, 0.86), c255(250.0, 248.0, 240.0)), FC(vec3(0.72, 0.18, 0.16), c255(214.0, 52.0, 46.0)), step(y, 0.032));
    float wx = fract(x / 0.045) - 0.5;
    float win = step(abs(wx), 0.22) * step(abs(y - 0.064), 0.013) * step(abs(x), 0.21);
    win += step(abs(wx), 0.28) * step(abs(y - 0.016), 0.012) * step(abs(x), 0.2);
    vec3 glass = FC(vec3(0.22, 0.24, 0.3), c255(64.0, 96.0, 146.0) * uCelTint);
    c = light(mix(wall, glass, sat(win)), 0.5);
    c += vec3(1.0, 0.82, 0.55) * sat(win) * uMisc.x * 1.2;
    gDet = step(0.5, win);
  }
  return vec4(c * a, a);
}

float baseBlocks(float x) { return 0.22 + 0.05 * sin(x * 0.8) + 0.02 * sin(x * 2.3 + 2.0) + 0.012 * x * x; }
float baseBack(float x)   { return 0.14 + 0.045 * sin(x * 0.7 + 1.0) + 0.018 * sin(x * 2.1) + 0.008 * x * x; }
float baseMain(float x)   { return 0.07 + 0.03 * sin(x * 1.1) + 0.012 * sin(x * 2.7 + 1.0); }
float baseFront(float x)  { return -0.01 + 0.02 * sin(x * 1.6 + 1.0) + 0.01 * sin(x * 3.1); }

vec4 townGround(vec2 p, float pw, float base, float k) {
  float ga = aa(p.y - base, pw);
  if (ga <= 0.0) return vec4(0.0);
  vec3 g = FC(vec3(0.35, 0.43, 0.26) * (0.88 + 0.24 * tn(p * vec2(k, k * 4.0))), c255(124.0, 200.0, 90.0));
  return vec4(light(g, 0.32) * ga, ga);
}
vec4 townTrees(vec2 p, float pw, float base, float cw, float hmin, float hmax, float seed) {
  if (p.y > base + hmax * max(uStyle.w, 1.0) + 0.02) return vec4(0.0);
  float sh = 0.0, kd = 0.0;
  float st = treeRow(p, base, cw, hmin, hmax, seed, 0.7, sh, kd);
  float ta = aa(st, pw);
  if (ta <= 0.0) return vec4(0.0);
  vec3 c = light(FC(mix(vec3(0.17, 0.3, 0.19), vec3(0.24, 0.36, 0.2), kd) * (0.9 + 0.2 * tn(p * 60.0)), mix(c255(47.0, 143.0, 71.0), c255(86.0, 184.0, 79.0), kd)), 0.28 + 0.16 * sh * sign(uLight.x));
  return vec4(c * ta, ta);
}

vec4 layerTownBlocks() {
  float z = 5.7; vec2 p = world(z); float pw = gPx * z;
  if (p.y > 0.7) return vec4(0.0);
  float base = baseBlocks(p.x);
  vec4 acc = townGround(p, pw, base, 6.0);
  vec4 e = blockRow(p, pw, base - 0.01, 0.5, 3.0);
  float d = e.a > 0.5 ? gDet : 0.0;
  acc = overP(acc, e);
  e = townTrees(p, pw, base, 0.085, 0.05, 0.13, 23.0);
  if (e.a > 0.5) d = 0.0;
  acc = overP(acc, e);
  gDet = d;
  if (acc.a <= 0.0) return vec4(0.0);
  vec3 c = atmos(acc.rgb / acc.a, p, z);
  return vec4(c * acc.a, acc.a);
}

vec4 layerTownBack() {
  float z = 5.0; vec2 p = world(z); float pw = gPx * z;
  if (p.y > 0.62) return vec4(0.0);
  float base = baseBack(p.x);
  vec4 acc = townGround(p, pw, base, 8.0);
  acc = overP(acc, townTrees(p, pw, base, 0.1, 0.1, 0.2, 31.0));
  vec4 e = houseRow(p, pw, z, base - 0.008, 0.2, 5.0, 1.65, 2.85, 0.84);
  gDet = e.a > 0.5 ? gDet : 0.0;
  acc = overP(acc, e);
  if (acc.a <= 0.0) return vec4(0.0);
  vec3 c = atmos(acc.rgb / acc.a, p, z);
  return vec4(c * acc.a, acc.a);
}

vec4 layerTownMain() {
  float z = 4.3; vec2 p = world(z); float pw = gPx * z;
  if (p.y > 1.14) return vec4(0.0);
  float base = baseMain(p.x);
  vec4 acc = townGround(p, pw, base, 10.0);
  acc = overP(acc, townTrees(p, pw, base, 0.12, 0.1, 0.22, 37.0));
  vec4 e = houseRow(p, pw, z, base - 0.005, 0.23, 9.0, 0.45, 3.05, 0.8);
  float d = e.a > 0.5 ? gDet : 0.0;
  acc = overP(acc, e);
  gDet = 0.0;
  e = hotel(p, pw, 0.78, baseMain(0.78) - 0.004);
  if (e.a > 0.5) d = gDet;
  acc = overP(acc, e);
  gDet = 0.0;
  e = landmarks(p, pw, baseMain(2.25) - 0.004);
  if (e.a > 0.5) d = gDet;
  acc = overP(acc, e);
  gDet = d;
  if (acc.a <= 0.0) return vec4(0.0);
  vec3 c = atmos(acc.rgb / acc.a, p, z);
  return vec4(c * acc.a, acc.a);
}

vec4 layerTownFront() {
  float z = 3.75; vec2 p = world(z); float pw = gPx * z;
  if (p.y > 0.45) return vec4(0.0);
  float base = baseFront(p.x);
  vec4 acc = townGround(p, pw, base, 12.0);
  acc = overP(acc, townTrees(p, pw, base, 0.13, 0.09, 0.2, 43.0));
  vec4 e = houseRow(p, pw, z, base - 0.005, 0.26, 13.0, 1.75, 2.55, 0.66);
  gDet = e.a > 0.5 ? gDet : 0.0;
  acc = overP(acc, e);
  if (acc.a <= 0.0) return vec4(0.0);
  vec3 c = atmos(acc.rgb / acc.a, p, z);
  return vec4(c * acc.a, acc.a);
}

// The Ćehotina river winding past the town, lined with willows & poplars
vec4 layerRiver() {
  float z = 3.2; vec2 p = world(z); float pw = gPx * z;
  if (p.y > 0.3) return vec4(0.0);
  float top = -0.035 + 0.02 * sin(p.x * 1.3) + 0.008 * sin(p.x * 3.7);
  float bank = top - 0.095 - 0.02 * sin(p.x * 2.1 + 1.0);
  vec4 acc = vec4(0.0);
  // far bank trees
  float sh = 0.0; float kind = 0.0;
  float st = 1e5;
  if (p.y > top - 0.02 && p.y < top + 0.28) {
    float c = floor(p.x / 0.16);
    for (int k = -1; k <= 1; k++) {
      float ci = c + float(k);
      float r1 = h11(ci * 5.3), r2 = h11(ci * 8.1);
      if (r1 < 0.35 || (ci * 0.16 > 1.4 && ci * 0.16 < 3.0 && r1 < 0.8)) continue;
      float cx = (ci + 0.5) * 0.16 + (r2 - 0.5) * 0.06;
      float d = r2 > 0.5 ? sdPoplar(p, cx, top - 0.01, mix(0.16, 0.26, r1), 0.028) : sdRoundTree(p, cx, top - 0.01, mix(0.08, 0.13, r1), 0.042);
      if (d < st) { st = d; sh = clamp((p.x - cx) / 0.04, -1.0, 1.0); }
    }
  }
  float ta = aa(st, pw);
  // water surface
  float wsd = max(p.y - top, bank - p.y);
  float wa = aa(wsd, pw);
  // near bank (grass) below the water
  float bsd = p.y - bank;
  float ba = aa(bsd, pw);
  if (ba > 0.0) {
    vec3 g = light(FC(vec3(0.32, 0.44, 0.22) * (0.85 + 0.3 * tn(p * vec2(14.0, 60.0))), c255(108.0, 194.0, 74.0)), 0.35);
    acc = vec4(g * ba, ba);
  }
  if (wa > 0.0) {
    float e = sat((top - p.y) / max(top - bank, 0.01));
    vec3 refl = mix(uSkyMid, uSkyTop, 0.2 + 0.55 * e);
    vec3 wc = mix(refl, vec3(0.08, 0.3, 0.33), 0.42 + 0.15 * e);
    // far bank & trees mirrored in the water
    wc = mix(wc, vec3(0.08, 0.15, 0.11) * (uAmb * 1.4 + uSunCol * 0.2), 0.55 * smoothstep(0.35, 0.0, e));
    float ripple = tn(vec2(p.x * 40.0 + gT * 0.25, p.y * 420.0 - gT * 0.4));
    float lines = smoothstep(0.55, 0.8, tn(vec2(p.x * 7.0 + gT * 0.1, p.y * 900.0)));
    wc *= 0.9 + 0.14 * ripple;
    wc = mix(wc, refl * 1.15 + 0.04, lines * 0.35);
    float glint = smoothstep(0.7, 0.9, noise2(vec2(p.x * 60.0 + gT * 0.8, p.y * 400.0 - gT * 0.5)));
    glint *= exp(-abs(gU - uSun.x) * 3.0) * uSun.w;
    wc += uSunDisc * glint * 0.8;
    float mg = smoothstep(0.75, 0.92, ripple) * exp(-abs(gU - uMoon.x) * 3.0) * uMoon.w;
    wc += vec3(0.75, 0.82, 1.0) * mg * 0.5;
    float streak = smoothstep(0.55, 0.95, noise2(vec2(p.x * 16.0, p.y * 3.0 + gT * 0.3))) * smoothstep(0.35, 0.75, noise2(vec2(p.x * 2.5, 5.0)));
    wc += vec3(1.0, 0.74, 0.42) * streak * uMisc.x * 0.5;
    wc = FC(wc, mix(c255(30.0, 150.0, 240.0), c255(140.0, 210.0, 255.0), step(0.78, e)) * uCelTint + vec3(1.0, 0.8, 0.45) * streak * uMisc.x * 0.6);
    acc = over(acc, wc, wa);
  }
  if (ta > 0.0) {
    vec3 tc = light(FC(vec3(0.22, 0.36, 0.19) * (0.9 + 0.2 * tn(p * 70.0)), c255(47.0, 143.0, 71.0)), 0.25 + 0.2 * sh * sign(uLight.x));
    acc = over(acc, tc, ta);
  }
  // street lamps along the embankment
  float lx = fract(p.x / 0.42) - 0.5;
  float ld = length(vec2(lx * 0.42, p.y - (top + 0.05)));
  float lamp = exp(-ld / 0.007) * uMisc.x;
  float post = aa(max(abs(lx * 0.42) - 0.0025, max(top - p.y, p.y - top - 0.05)), pw);
  acc = over(acc, vec3(0.1, 0.1, 0.12), post * 0.9);
  if (acc.a <= 0.0 && lamp < 0.003) return vec4(0.0);
  vec3 c = acc.a > 0.0 ? atmos(acc.rgb / acc.a, p, z) * acc.a : vec3(0.0);
  c += vec3(1.0, 0.72, 0.38) * lamp * 1.4;
  return vec4(c, acc.a);
}

// ---------------------------------------------------------------------
//  MEADOW — katun, sheep, haystacks and the flag of Montenegro
// ---------------------------------------------------------------------
float meadowH(float x) { return 0.42 + 0.045 * sin(x * 1.1 + 0.5) + 0.02 * sin(x * 3.3); }

// simplified golden double-headed eagle for the flag (local coords, unit ~ flag height)
float eagle(vec2 q) {
  q.x = abs(q.x);
  float body = length((q - vec2(0.0, -0.02)) / vec2(0.55, 1.0)) - 0.11;
  float neck = sdSeg(q, vec2(0.0, 0.05), vec2(0.07, 0.16)) - 0.025;
  float head = length(q - vec2(0.085, 0.18)) - 0.04;
  float crown = sdBox(q, vec2(0.0, 0.25), vec2(0.045, 0.03));
  // wing: fan of feathers
  float wing = 1e5;
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    vec2 a = vec2(0.06, 0.02 + fi * 0.02);
    vec2 b = vec2(0.34 - fi * 0.035, 0.24 - fi * 0.1);
    wing = min(wing, sdSeg(q, a, b) - 0.028);
  }
  float tail = sdBox(q, vec2(0.0, -0.17), vec2(0.06 - (q.y + 0.2) * 0.0, 0.05));
  float legs = sdSeg(q, vec2(0.04, -0.1), vec2(0.12, -0.2)) - 0.018;
  return min(min(min(body, neck), min(head, crown)), min(min(wing, tail), legs));
}

vec4 flag(vec2 p, float pw, float fx, float gy) {
  float poleH = 0.5;
  vec2 q = p - vec2(fx, gy);
  if (q.x < -0.03 || q.x > 0.32 || q.y < -0.01 || q.y > poleH + 0.03) return vec4(0.0);
  vec4 acc = vec4(0.0);
  float pole = max(abs(q.x) - 0.0045, max(-q.y, q.y - poleH));
  pole = min(pole, length(q - vec2(0.0, poleH + 0.006)) - 0.009);
  // waving cloth
  float fw = 0.25, fh = 0.125;
  float lx = q.x - 0.004;
  float t = sat(lx / fw);
  float wave = sin(lx * 22.0 - gT * 4.2) * 0.011 * t + sin(lx * 9.0 - gT * 2.3) * 0.006 * t;
  float ly = q.y - (poleH - fh) - wave;
  float cloth = max(max(-lx, lx - fw * (1.0 - 0.04 * sin(gT * 3.0) * t)), max(-ly, ly - fh));
  float ca = aa(cloth, pw);
  if (ca > 0.0) {
    float border = 0.0105;
    float inner = max(max(border - lx, lx - fw + border), max(border - ly, ly - fh + border));
    vec3 col = inner < 0.0 ? FC(vec3(0.78, 0.07, 0.12), c255(224.0, 38.0, 47.0)) : FC(vec3(0.86, 0.68, 0.24), c255(244.0, 196.0, 48.0));
    // coat of arms
    vec2 eq = (vec2(lx - fw * 0.5, ly - fh * 0.5)) / (fh * 0.8);
    float ea = eagle(eq) * fh * 0.8;
    col = mix(col, vec3(0.9, 0.72, 0.27), smoothstep(pw, -pw, ea) * step(inner, 0.0));
    float ripple = 0.8 + 0.35 * cos(lx * 22.0 - gT * 4.2) * t;
    col = light(col, 0.45 * ripple * (1.0 - 0.5 * uMisc2.x) + 0.1) + col * uMisc2.w * 0.08;
    acc = over(acc, col, ca);
  }
  float pa = aa(pole, pw);
  acc = over(acc, light(vec3(0.42, 0.34, 0.26), 0.3), pa * (1.0 - ca * step(0.0, q.x - 0.004)));
  return acc;
}

vec4 katun(vec2 p, float pw, float kx, float gy) {
  vec2 q = p - vec2(kx, gy);
  if (abs(q.x) > 0.26 || q.y < -0.02 || q.y > 0.5) return vec4(0.0);
  float walls = sdBox(q, vec2(0.0, 0.055), vec2(0.12, 0.055));
  float ry = q.y - 0.07;
  float roof = max(abs(q.x) - 0.165 * (1.0 - ry / 0.24), max(-ry, ry - 0.24));
  float chim = sdBox(q, vec2(0.06, 0.25), vec2(0.014, 0.05));
  float sd = min(min(walls, roof), chim);
  float a = aa(sd, pw);
  vec4 acc = vec4(0.0);
  if (a > 0.0) {
    vec3 wood = FC(vec3(0.45, 0.31, 0.2) * (0.85 + 0.25 * step(0.5, fract(q.y * 90.0))), c255(156.0, 107.0, 66.0) * (0.94 + 0.08 * step(0.5, fract(q.y * 45.0))));
    float srow = floor(q.y * 44.0);
    float scol = floor(q.x * 24.0 + srow * 0.5);
    float joint = smoothstep(0.82, 0.95, fract(q.x * 24.0 + srow * 0.5));
    vec3 shingles = vec3(0.31, 0.23, 0.18) * (0.9 + 0.1 * smoothstep(0.1, 0.4, fract(q.y * 44.0))) * (1.0 - 0.12 * joint) * (0.88 + 0.24 * h21(vec2(srow, scol)));
    vec3 alb = roof < walls ? FC(shingles, c255(107.0, 74.0, 50.0)) : wood;
    float side = roof < walls ? 0.5 + 0.35 * sign(q.x) * sign(uLight.x) : 0.35;
    vec3 c = light(alb, side * (1.0 - 0.6 * uMisc2.x) + 0.05);
    // door & window (warm light at night)
    float door = sdBox(q, vec2(-0.04, 0.035), vec2(0.022, 0.035));
    float win = sdBox(q, vec2(0.055, 0.06), vec2(0.018, 0.016));
    float dm = smoothstep(pw, -pw, door), wm = smoothstep(pw, -pw, win);
    c = mix(c, vec3(0.12, 0.08, 0.06), dm * 0.8);
    c = mix(c, vec3(0.15, 0.13, 0.12), wm);
    c += vec3(1.0, 0.66, 0.3) * (wm * 1.6 + dm * 0.5) * uMisc.x;
    acc = vec4(c * a, a);
  }
  // chimney smoke
  vec2 sq = q - vec2(0.06, 0.3);
  if (sq.y > 0.0 && sq.y < 0.55 && abs(sq.x) < 0.35) {
    float drift = sq.y * sq.y * 1.2 + sq.y * 0.25;
    float n = fbm2s(vec2((sq.x - drift) * 14.0, sq.y * 7.0 - gT * 0.5));
    float width = 0.03 + sq.y * 0.22;
    float s = smoothstep(width, 0.0, abs(sq.x - drift + (n - 0.5) * 0.08));
    s *= smoothstep(0.55, 0.1, sq.y) * smoothstep(0.0, 0.04, sq.y) * smoothstep(0.3, 0.75, n) * 0.3;
    vec3 sc = mix(uAmb * 1.7 + uSunCol * 0.3, uFogCol, 0.4);
    acc = over(acc, sc, s * (1.0 - acc.a));
  }
  return acc;
}

vec4 sheep(vec2 p, float pw, float sx, float gy, float seed, float dir) {
  vec2 q = p - vec2(sx, gy);
  q.x *= dir;
  if (abs(q.x) > 0.09 || q.y < -0.01 || q.y > 0.09) return vec4(0.0);
  float graze = 0.5 + 0.5 * sin(gT * 0.9 + seed * 6.0);
  float body = length((q - vec2(0.0, 0.043)) / vec2(1.0, 0.68)) - 0.034;
  body = min(body, length(q - vec2(-0.02, 0.05)) - 0.024);
  vec2 hp = vec2(0.043, 0.042 - graze * 0.02);
  float head = length((q - hp) / vec2(1.25, 1.0)) - 0.011;
  float legs = 1e5;
  for (int i = 0; i < 4; i++) {
    float lx = -0.022 + float(i) * 0.015;
    legs = min(legs, sdBox(q, vec2(lx, 0.012), vec2(0.0028, 0.012)));
  }
  float wool = body, dark = min(head, legs);
  float sd = min(wool, dark);
  float a = aa(sd, pw);
  if (a <= 0.0) return vec4(0.0);
  vec3 alb = wool < dark ? FC(vec3(0.93, 0.9, 0.84) * (0.88 + 0.2 * tn(q * 300.0)), c255(255.0, 255.0, 255.0)) : FC(vec3(0.16, 0.14, 0.13), c255(35.0, 31.0, 32.0));
  float top = sat((q.y - 0.03) / 0.04);
  vec3 c = light(alb, (0.3 + 0.4 * top) * (1.0 - 0.5 * uMisc2.x) + 0.05);
  return vec4(c * a, a);
}

vec4 haystack(vec2 p, float pw, float hx, float gy, float s) {
  vec2 q = (p - vec2(hx, gy)) / s;
  if (abs(q.x) > 0.8 || q.y < -0.05 || q.y > 1.5) return vec4(0.0);
  float t = sat(q.y / 1.05);
  float w = 0.55 * sqrt(1.0 - t) * (1.0 - 0.15 * t);
  float stack = max(abs(q.x) - w, max(-q.y, q.y - 1.05));
  float pole = max(abs(q.x) - 0.025, max(-q.y, q.y - 1.35));
  float sd = min(stack, pole) * s;
  float a = aa(sd, pw);
  if (a <= 0.0) return vec4(0.0);
  vec3 hay = vec3(0.76, 0.62, 0.34) * (0.85 + 0.25 * tn(vec2(q.x * 30.0, q.y * 8.0)));
  vec3 alb = stack < pole ? FC(hay, c255(244.0, 197.0, 66.0)) : FC(vec3(0.35, 0.27, 0.2), c255(107.0, 74.0, 50.0));
  float side = 0.5 + 0.5 * clamp(q.x / 0.5, -1.0, 1.0) * sign(uLight.x);
  vec3 c = light(alb, (0.25 + 0.45 * side) * (1.0 - 0.55 * uMisc2.x) + 0.05);
  return vec4(c * a, a);
}

vec4 layerMeadow() {
  float z = 1.6; vec2 p = world(z); float pw = gPx * z;
  if (p.y > 1.35) return vec4(0.0);
  float h = meadowH(p.x);
  float dh = 0.045 * 1.1 * cos(p.x * 1.1 + 0.5) + 0.02 * 3.3 * cos(p.x * 3.3);
  // grass blades on the crest
  float blades = 0.006 * noise2(vec2(p.x * 260.0, 1.0)) + 0.004 * noise2(vec2(p.x * 700.0, 3.0));
  float sd = (p.y - h - blades) / sqrt(1.0 + dh * dh);
  vec4 acc = vec4(0.0);
  float a = aa(sd, pw);
  float kx = uLayout.y, fx = uLayout.x;
  if (a > 0.0) {
    float n = tn(p * vec2(6.0, 22.0));
    vec3 alb = FC(mix(vec3(0.33, 0.49, 0.2), vec3(0.5, 0.58, 0.25), n) * (0.86 + 0.2 * tn(p * vec2(34.0, 110.0))), c255(134.0, 217.0, 90.0));
    // brushy strokes following the slope
    alb *= 0.93 + 0.12 * tn(vec2(p.x * 14.0 - p.y * 6.0, p.y * 70.0));
    // trodden footpath from the katun door down towards us
    float ky = meadowH(kx);
    float t = max(ky - p.y, 0.0);
    float pathX = kx - 0.035 + t * 1.25 + 0.05 * sin(t * 9.0);
    float pw2 = 0.012 + t * 0.13;
    float path = smoothstep(pw2, pw2 * 0.55, abs(p.x - pathX + (noise2(p * 40.0) - 0.5) * 0.012)) * step(p.y, ky - 0.012);
    alb = mix(alb, FC(vec3(0.62, 0.52, 0.37) * (0.85 + 0.3 * tn(p * vec2(50.0, 90.0))), c255(217.0, 183.0, 126.0)), mix(path * 0.85, step(0.5, path), uStyle.x));
    // wildflowers
    vec2 fq = p * vec2(95.0, 180.0);
    vec2 fc = floor(fq); vec2 ff = fract(fq) - 0.5;
    float fr = h21(fc);
    float fl = step(0.93, fr) * smoothstep(0.3, 0.1, length(ff)) * smoothstep(h - 0.25, h - 0.02, p.y) * (1.0 - path) * (1.0 - uStyle.x);
    vec3 fcol = fr > 0.975 ? vec3(0.96, 0.84, 0.28) : (fr > 0.955 ? vec3(0.96, 0.95, 0.9) : vec3(0.74, 0.44, 0.8));
    alb = mix(alb, fcol, fl);
    float depthShade = mix(0.74, 1.0, smoothstep(h - 0.4, h, p.y));
    vec3 c = light(alb, bodyLight(dh, h - p.y, 0.15) * 0.9 + 0.12) * depthShade;
    // warm light caught by the grass tips at golden hour
    c += uSunGlow * uMisc2.x * 0.12 * smoothstep(0.55, 0.85, noise2(p * vec2(3.0, 14.0))) * (1.0 - uMisc2.w) * (1.0 - uStyle.x);
    c += rim(sd, pw * 2.0) * 0.8;
    acc = vec4(c * a, a);
  }
  // junipers and limestone rocks
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float bx = i == 0 ? kx - 0.32 : (i == 1 ? kx + 0.78 : (i == 2 ? fx - 0.36 : fx + 0.25));
    float by = meadowH(bx) - 0.01;
    float bs = i == 1 ? 0.05 : 0.065;
    if (i == 2) {
      float rock = length((p - vec2(bx, by)) / vec2(1.6, 1.0)) - 0.028;
      rock = max(rock, by - 0.004 - p.y);
      float ra = aa(rock, pw);
      vec3 rc = light(FC(vec3(0.72, 0.71, 0.68) * (0.85 + 0.25 * tn(p * 120.0)), c255(216.0, 214.0, 207.0)), 0.3 + 0.3 * sat((p.y - by) / 0.03));
      acc = over(acc, rc, ra);
    } else {
      float bsd = min(length(p - vec2(bx, by + bs * 0.55)) - bs * 0.62, length(p - vec2(bx + bs * 0.55, by + bs * 0.35)) - bs * 0.45);
      bsd = min(bsd, length(p - vec2(bx - bs * 0.5, by + bs * 0.3)) - bs * 0.42);
      bsd = max(bsd, by - p.y);
      float ba = aa(bsd, pw);
      float bl = sat((p.x - bx) / bs) * sign(uLight.x) * 0.5 + 0.5;
      vec3 bc = light(FC(vec3(0.13, 0.24, 0.15) * (0.85 + 0.3 * tn(p * 90.0)), c255(47.0, 143.0, 71.0)), 0.18 + 0.2 * bl);
      acc = over(acc, bc, ba);
    }
  }
  // props (drawn over the grass)
  vec4 k = katun(p, pw, kx, meadowH(kx) - 0.012);
  acc = over(acc, k.a > 0.0 ? k.rgb / k.a : vec3(0.0), k.a);
  vec4 hs = haystack(p, pw, kx + 0.36, meadowH(kx + 0.36) - 0.005, 0.1);
  acc = over(acc, hs.a > 0.0 ? hs.rgb / hs.a : vec3(0.0), hs.a);
  vec4 hs2 = haystack(p, pw, fx + 0.42, meadowH(fx + 0.42) - 0.005, 0.085);
  acc = over(acc, hs2.a > 0.0 ? hs2.rgb / hs2.a : vec3(0.0), hs2.a);
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float sx = mix(kx + 0.5, fx - 0.1, (fi + 0.5) / 5.0) + (h11(fi * 7.3) - 0.5) * 0.12;
    vec4 s = sheep(p, pw, sx, meadowH(sx) - 0.004, fi, h11(fi * 3.9) > 0.5 ? 1.0 : -1.0);
    acc = over(acc, s.a > 0.0 ? s.rgb / s.a : vec3(0.0), s.a);
  }
  vec4 f = flag(p, pw, fx, meadowH(fx) - 0.01);
  acc = over(acc, f.a > 0.0 ? f.rgb / f.a : vec3(0.0), f.a);
  if (acc.a <= 0.0) return vec4(0.0);
  vec3 c = atmos(acc.rgb / acc.a, p, z);
  return vec4(c * acc.a, acc.a);
}

// ---------------------------------------------------------------------
//  FOREGROUND — framing pines & grass (near-silhouettes)
// ---------------------------------------------------------------------
vec4 layerForeground() {
  float z = 1.0; vec2 p = world(z); float pw = gPx * z;
  if (p.y > 1.2) return vec4(0.0);
  float xl = uCam.x + uLayout.z;
  float xr = uCam.x + uLayout.w;
  float gy = 0.2 + 0.03 * sin(p.x * 2.0);
  float grass = 0.012 * noise2(vec2(p.x * 180.0, 0.0)) + 0.01 * noise2(vec2(p.x * 520.0, 1.0));
  float sd = p.y - gy - grass;
  float shade = 0.0;
  float fs = uLayout2.w;
  float t1 = sdConifer(p, xl - 0.05 * fs, gy - 0.02, 0.95 * fs, 0.17 * fs, 8.0);
  float t2 = sdConifer(p, xl + 0.15 * fs, gy - 0.02, 0.6 * fs, 0.12 * fs, 6.0);
  float t3 = sdConifer(p, xr + 0.04 * fs, gy - 0.02, 0.85 * fs, 0.16 * fs, 8.0);
  float t4 = sdConifer(p, xr - 0.16 * fs, gy - 0.02, 0.42 * fs, 0.09 * fs, 5.0);
  float trees = min(min(t1, t2), min(t3, t4));
  if (trees < sd) {
    if (t1 < 0.0) shade = (p.x - (xl - 0.05 * fs)) / (0.17 * fs);
    else if (t2 < 0.0) shade = (p.x - (xl + 0.15 * fs)) / (0.12 * fs);
    else if (t3 < 0.0) shade = (p.x - (xr + 0.04 * fs)) / (0.16 * fs);
    else if (t4 < 0.0) shade = (p.x - (xr - 0.16 * fs)) / (0.09 * fs);
  }
  sd = min(sd, trees);
  float a = aa(sd, pw);
  if (a <= 0.0) return vec4(0.0);
  vec3 alb = FC(vec3(0.1, 0.16, 0.12) * (0.85 + 0.3 * tn(p * vec2(30.0, 60.0))), c255(27.0, 107.0, 58.0));
  vec3 c = light(alb, 0.12 + 0.12 * clamp(shade, -1.0, 1.0) * sign(uLight.x));
  c += rim(sd, pw * 2.2) * 0.9;
  c = mix(c, uHaze, 0.04);
  return vec4(c * a, a);
}

// ---------------------------------------------------------------------
//  Particles in front: fireflies at night, drifting pollen in golden light
// ---------------------------------------------------------------------
vec3 particles() {
  vec3 acc = vec3(0.0);
  float night = uMisc2.w * smoothstep(2.1, 1.25, uCam.y);
  if (gV > 0.62 || uCam.y > 2.2) return acc;
  vec2 q = vec2(gU, gV) * vec2(7.0, 7.0);
  vec2 c = floor(q);
  vec2 f = fract(q);
  float r = h21(c + 3.0);
  if (r > 0.55) {
    vec2 o = vec2(0.5) + 0.32 * vec2(sin(gT * (0.3 + r * 0.4) + r * 20.0), cos(gT * (0.25 + r * 0.3) + r * 11.0));
    float d = length((f - o) / 7.0);
    float pulse = 0.5 + 0.5 * sin(gT * (1.2 + r * 1.6) + r * 30.0);
    float ff = exp(-d / 0.0022) * pulse * night;
    ff += smoothstep(0.0028, 0.0, d) * pulse * night;
    acc += vec3(0.85, 1.0, 0.45) * ff * 0.9;
    float dust = smoothstep(0.002, 0.0, d) * (1.0 - night) * uMisc2.x * 0.35 * (1.0 - uStyle.x);
    acc += uSunGlow * dust;
  }
  // fireflies live low, over the meadow
  float low = smoothstep(0.62, 0.3, gV);
  return acc * low;
}

// ---------------------------------------------------------------------
void main() {
  gU = (gl_FragCoord.x - 0.5 * uRes.x) / uRes.y;
  gV = gl_FragCoord.y / uRes.y;
  gPx = 1.0 / uRes.y;
  gT = uTime;

  // front-to-back compositing; `id` remembers the nearest opaque layer
  // (used by the stylised post passes for outlines and hard shadows)
  vec3 C = vec3(0.0);
  float T = 1.0;
  float id = 0.0;
  vec4 L;
  float det = 0.0;
  gDet = 0.0; L = layerForeground(); if (L.a > 0.5) { id = 1.0; det = gDet; } C += T * L.rgb; T *= 1.0 - L.a;
  if (T > 0.002) { gDet = 0.0; L = layerMeadow(); if (id < 0.5 && L.a > 0.5) { id = 2.0; det = gDet; } C += T * L.rgb; T *= 1.0 - L.a; }
  if (T > 0.002) { gDet = 0.0; L = layerRiver(); if (id < 0.5 && L.a > 0.5) { id = 3.0; det = gDet; } C += T * L.rgb; T *= 1.0 - L.a; }
  if (T > 0.002) { gDet = 0.0; L = layerTownFront(); if (id < 0.5 && L.a > 0.5) { id = 4.0; det = gDet; } C += T * L.rgb; T *= 1.0 - L.a; }
  if (T > 0.002) { gDet = 0.0; L = layerTownMain(); if (id < 0.5 && L.a > 0.5) { id = 5.0; det = gDet; } C += T * L.rgb; T *= 1.0 - L.a; }
  if (T > 0.002) { gDet = 0.0; L = layerTownBack(); if (id < 0.5 && L.a > 0.5) { id = 6.0; det = gDet; } C += T * L.rgb; T *= 1.0 - L.a; }
  if (T > 0.002) { gDet = 0.0; L = layerTownBlocks(); if (id < 0.5 && L.a > 0.5) { id = 7.0; det = gDet; } C += T * L.rgb; T *= 1.0 - L.a; }
  if (T > 0.002) { gDet = 0.0; L = layerPlant(); if (id < 0.5 && L.a > 0.5) { id = 8.0; det = gDet; } C += T * L.rgb; T *= 1.0 - L.a; }
  if (T > 0.002) { gDet = 0.0; L = layerMonastery(); if (id < 0.5 && L.a > 0.5) { id = 9.0; det = gDet; } C += T * L.rgb; T *= 1.0 - L.a; }
  if (T > 0.002) { gDet = 0.0; L = layerHills(); if (id < 0.5 && L.a > 0.5) { id = 10.0; det = gDet; } C += T * L.rgb; T *= 1.0 - L.a; }
  if (T > 0.002) { gDet = 0.0; L = layerMid(); if (id < 0.5 && L.a > 0.5) { id = 11.0; det = gDet; } C += T * L.rgb; T *= 1.0 - L.a; }
  if (T > 0.002) { gDet = 0.0; L = layerBirds(); if (id < 0.5 && L.a > 0.5) { id = 12.0; det = gDet; } C += T * L.rgb; T *= 1.0 - L.a; }
  if (T > 0.002) { gDet = 0.0; L = layerTara(); if (id < 0.5 && L.a > 0.5) { id = 13.0; det = gDet; } C += T * L.rgb; T *= 1.0 - L.a; }
  if (T > 0.002) { gDet = 0.0; L = layerLjubisnja(); if (id < 0.5 && L.a > 0.5) { id = 14.0; det = gDet; } C += T * L.rgb; T *= 1.0 - L.a; }
  if (T > 0.002) { gDet = 0.0; L = layerDurmitor(); if (id < 0.5 && L.a > 0.5) { id = 15.0; det = gDet; } C += T * L.rgb; T *= 1.0 - L.a; }
  if (T > 0.002) { gDet = 0.0; L = layerLovcen(); if (id < 0.5 && L.a > 0.5) { id = 16.0; det = gDet; } C += T * L.rgb; T *= 1.0 - L.a; }
  if (T > 0.002) {
    if (uStyle.y > 0.5) {
      float ca;
      vec3 s = skyFlat(ca);
      if (id < 0.5 && ca > 0.5) id = 20.0;
      C += T * s;
    } else {
      C += T * sky();
    }
  }

  float soft = 1.0 - uStyle.x;
  // sun bloom scattering over everything
  vec2 ds = vec2(gU, gV) - uSun.xy;
  float rs = length(ds);
  C += uSunGlow * uSun.w * 0.16 * exp(-rs * 3.2) * (0.4 + 0.6 * uMisc2.x) * soft;
  // soft crepuscular rays fanning out from the sun
  if (uSun.w > 0.01 && soft > 0.01) {
    float ang = atan(ds.y, ds.x);
    float ray = n1(ang * 6.0 + 40.0 + gT * 0.02).x * n1(ang * 13.0 - gT * 0.03 + 7.0).x;
    ray = smoothstep(0.15, 0.7, ray);
    float down = 0.25 + 0.75 * smoothstep(0.1, -0.9, ds.y / max(rs, 1e-4));
    C += uSunGlow * uSun.w * ray * down * exp(-rs * 1.8) * smoothstep(0.05, 0.3, rs) * (0.035 + 0.06 * uMisc2.x) * soft;
  }
  C += particles();

  // painterly finish: soft vignette, paper grain, dithering
  vec2 sv = gl_FragCoord.xy / uRes - 0.5;
  C *= 1.0 - 0.22 * dot(sv, sv) * soft;
  float grain = h21(gl_FragCoord.xy) - 0.5;
  C += grain * 0.018 * soft;
  C += (h21(gl_FragCoord.xy * 1.37 + 7.0) - 0.5) / 255.0;
  fragColor = vec4(C, (id + 100.0 * det) / 255.0);
}
