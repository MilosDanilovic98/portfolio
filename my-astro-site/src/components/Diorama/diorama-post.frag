// =====================================================================
//  Stylised post passes for the diorama.
//  STYLE 1 = cut-out cartoon · 2 = pixel art · 3 = risograph print
//  The scene pass stores colour in RGB and the nearest layer id in A.
// =====================================================================
uniform sampler2D uScene;
uniform vec2 uRes;        // output size (px)
uniform vec2 uSceneRes;   // scene texture size (px)
uniform vec3 uInk;        // outline / shadow ink
uniform vec4 uPost;       // x: outline px @1080p · y: shadow px @1080p · z: shadow strength · w: time
uniform vec3 uPal[32];
uniform int uPalN;
uniform vec3 uGrade;      // x: saturation · y: contrast · z: exposure

vec3 grade(vec3 c) {
  c *= uGrade.z;
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(vec3(l), c, uGrade.x);
  return clamp((c - 0.5) * uGrade.y + 0.5, 0.0, 1.0);
}

vec4 S(vec2 px) { return texture(uScene, px / uSceneRes); }
// nearer layers have smaller ids; clouds (20) sit just in front of the sky (0)
// ids >= 100 carry a "detail" flag (windows and the like: no ink lines inside a layer)
float ID(vec4 s) {
  float i = floor(s.a * 255.0 + 0.5);
  i = i > 99.5 ? i - 100.0 : i;
  return i < 0.5 ? 99.0 : (i > 19.5 ? 60.0 : i);
}
float DET(vec4 s) { return step(99.5, floor(s.a * 255.0 + 0.5)); }
float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

#if STYLE == 1
// ---------------------------------------------------------------------
//  Brutalist cut-out: every layer is a flat sticker with a thick ink
//  outline and a hard offset shadow — the same language as the cards.
// ---------------------------------------------------------------------
void main() {
  vec2 p = gl_FragCoord.xy;
  float k = uRes.y / 1080.0;
  vec4 c = S(p);
  float id = ID(c);
  vec3 col = grade(c.rgb);
  // hard shadow cast down-right by any nearer layer
  vec2 so = vec2(uPost.y, -uPost.y) * k;
  float ids = ID(S(p - so));
  if (ids < id) col = mix(col, uInk, uPost.z * (id > 59.0 ? 0.55 : 1.0));
  // outlines on layer edges and on colour edges inside a layer
  // thicker lines up front, finer ones in the distance
  float near = id > 59.0 ? 0.85 : 1.0 - (id - 1.0) / 16.0;
  float w = uPost.x * k * mix(0.45, 1.1, near);
  float edge = 0.0;
  float det = DET(c);
  for (int i = 0; i < 8; i++) {
    float a = float(i) * 0.7853982;
    vec4 n = S(p + vec2(cos(a), sin(a)) * w);
    float nid = ID(n);
    if (nid != id) edge = 1.0;
    else if (id < 59.0 && det + DET(n) < 0.5 && length(n.rgb - c.rgb) > 0.22) edge = 1.0;
  }
  col = mix(col, uInk, edge);
  gl_FragColor_OUT = vec4(col, 1.0);
}
#elif STYLE == 2
// ---------------------------------------------------------------------
//  Pixel art: low-res scene, limited palette, ordered dithering,
//  1-px ink outlines around the nearer shapes.
// ---------------------------------------------------------------------
float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
void main() {
  vec2 sp = floor(gl_FragCoord.xy * uSceneRes / uRes);
  vec4 c = texture(uScene, (sp + 0.5) / uSceneRes);
  float id = ID(c);
  vec3 q = grade(c.rgb) + (bayer4(sp) - 0.47) * 0.085;
  vec3 best = q;
  float bd = 1e9;
  for (int i = 0; i < 32; i++) {
    if (i >= uPalN) break;
    vec3 d = q - uPal[i];
    float e = dot(d, d);
    if (e < bd) { bd = e; best = uPal[i]; }
  }
  float edge = 0.0;
  for (int i = 0; i < 4; i++) {
    vec2 o = i == 0 ? vec2(1.0, 0.0) : (i == 1 ? vec2(-1.0, 0.0) : (i == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0)));
    float nid = ID(texture(uScene, (sp + o + 0.5) / uSceneRes));
    if (nid > id && id < 59.0) edge = 1.0;
  }
  best = mix(best, uInk, edge * 0.9);
  gl_FragColor_OUT = vec4(best, 1.0);
}
#else
// ---------------------------------------------------------------------
//  Risograph print: flat inks on paper, halftone screens for the in-between
//  tones, slightly mis-registered ink outlines and paper grain.
// ---------------------------------------------------------------------
void main() {
  vec2 p = gl_FragCoord.xy;
  float k = uRes.y / 1080.0;
  vec4 c = S(p);
  vec3 A = vec3(1.0), B = vec3(1.0);
  float dA = 1e9, dB = 1e9;
  for (int i = 0; i < 32; i++) {
    if (i >= uPalN) break;
    float d = distance(grade(c.rgb), uPal[i]);
    if (d < dA) { dB = dA; B = A; dA = d; A = uPal[i]; }
    else if (d < dB) { dB = d; B = uPal[i]; }
  }
  float t = dA / max(dA + dB, 1e-4);               // share of the second ink (0..0.5)
  float cell = 5.5 * k;
  vec2 q = mat2(0.7071, -0.7071, 0.7071, 0.7071) * p / cell;
  vec2 f = fract(q) - 0.5;
  float r = sqrt(t / 3.14159);
  vec3 col = length(f) < r ? B : A;
  // mis-registered ink outline (layer edges only)
  vec2 mo = vec2(1.6, -1.2) * k;
  float id = ID(S(p - mo));
  float w = uPost.x * k;
  float edge = 0.0;
  for (int i = 0; i < 6; i++) {
    float a = float(i) * 1.0471976;
    if (ID(S(p - mo + vec2(cos(a), sin(a)) * w)) != id) edge = 1.0;
  }
  col = mix(col, col * uInk * 1.6, edge * 0.85);
  // paper grain
  float g = hash(floor(p / max(k, 1.0)));
  col *= 0.95 + 0.05 * g;
  gl_FragColor_OUT = vec4(col, 1.0);
}
#endif
