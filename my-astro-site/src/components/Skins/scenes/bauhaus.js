/* Skin 'bauhaus' (generated from styles2.js:styleBauhaus by port.py) */
import { H, LAYER, W, bridge, regions, rnd, setSeed } from "./common.js";

export default function styleBauhaus() {
  const R = regions();
  const red = "#d6322d",
    yel = "#f2b632",
    blu = "#1f4e9c",
    blk = "#151515",
    cr = "#f1ebdd";
  const mul = 'style="mix-blend-mode:multiply"';
  let s = `<rect width="${W}" height="${H}" fill="${cr}"/>`;
  s += `<circle cx="1180" cy="200" r="120" fill="${yel}"/>`;
  s += LAYER;
  s += `<path d="M1300 640 A170 170 0 0 0 960 640 Z" fill="#9aa7b8" ${mul}/>`;
  s += `<polygon points="1080,640 1400,640 1240,330" fill="#9aa7b8" ${mul}/>`;
  s += `<polygon points="1080,640 1460,640 1190,250" fill="${blu}" ${mul}/>`;
  s += `<rect x="1098" y="452" width="64" height="18" fill="${blk}"/><rect x="1122" y="444" width="16" height="26" fill="${red}"/>`;
  s += `<polygon points="860,640 1100,640 960,330" fill="${blk}"/>`;
  s += `<polygon points="947.7,368 977.2,368 960,330" fill="${cr}"/><polygon points="1178.7,290 1217.7,290 1190,250" fill="${cr}"/>`;
  s += LAYER;
  s += `<line x1="0" y1="640" x2="${W}" y2="640" stroke="${blk}" stroke-width="6"/>`;
  for (let x = 30; x < 290; x += 46)
    s += `<circle cx="${x}" cy="676" r="16" fill="${blu}"/>`;
  for (let x = 920; x < 1440; x += 46)
    s += `<circle cx="${x}" cy="676" r="16" fill="${((x / 46) | 0) % 3 ? blu : blk}"/>`;
  s += `<polygon points="300,646 880,646 590,960" fill="${red}"/>`;
  const b = bridge();
  for (const a of b.arches)
    s += `<path d="M${a.cx - a.span} ${b.deck.y + 8} A${a.span} ${a.rise} 0 0 0 ${a.cx + a.span} ${b.deck.y + 8}" fill="none" stroke="${blk}" stroke-width="${a.span > 100 ? 10 : 6}"/>`;
  s += `<rect x="300" y="684" width="580" height="12" fill="${blk}"/>`;
  s += LAYER;
  s += `<path d="M-30 1110 A300 300 0 0 1 570 1110 Z" fill="${blu}"/>`;
  s += `<rect x="190" y="905" width="120" height="75" fill="${cr}"/><circle cx="250" cy="890" r="26" fill="${blk}"/><rect x="246" y="842" width="8" height="24" fill="${yel}"/><rect x="238" y="850" width="24" height="7" fill="${yel}"/>`;
  s += `<rect x="320" y="860" width="18" height="120" fill="${yel}"/><polygon points="314,860 344,860 329,820" fill="${red}"/>`;
  s += `<rect x="100" y="935" width="80" height="45" fill="${red}"/><rect x="230" y="950" width="40" height="30" fill="${blk}"/>`;
  s += `<rect x="380" y="1170" width="${W - 380}" height="300" fill="#e3dccb"/>`;
  setSeed(4);
  const cols = [red, yel, blu, blk, cr];
  for (let x = 800; x < 1420; x += 58)
    for (let row = 0; row < 3; row++) {
      const y = 1230 + row * 75,
        c = cols[Math.floor(rnd() * 4)];
      if (rnd() < 0.5)
        s += `<rect x="${x}" y="${y}" width="44" height="44" fill="${c}"/><polygon points="${x},${y} ${x + 44},${y} ${x + 22},${y - 22}" fill="${blk}"/>`;
      else s += `<circle cx="${x + 22}" cy="${y + 22}" r="22" fill="${c}"/>`;
    }
  s += `<polygon points="1160,1215 1220,1215 1208,1125 1172,1125" fill="${yel}"/>`;
  s += `<rect x="1244" y="1025" width="14" height="190" fill="${blk}"/>`;
  for (let k = 0; k < 4; k++)
    s += `<rect x="1244" y="${1030 + k * 26}" width="14" height="12" fill="${red}"/>`;
  s += `<circle cx="1200" cy="1060" r="28" fill="none" stroke="${blk}" stroke-width="4"/><circle cx="1150" cy="1020" r="20" fill="none" stroke="${blk}" stroke-width="4"/>`;
  s += `<rect y="1462" width="${W}" height="26" fill="${blu}"/>`;
  s += `<path d="M1440 1800 A360 360 0 0 0 1080 1440 L1440 1440 Z" fill="${red}" transform="translate(0,48)"/>`;
  for (let i = 0; i < 12; i++)
    for (let j = 0; j < 4; j++)
      s += `<circle cx="${80 + i * 40}" cy="${1580 + j * 40}" r="6" fill="${blk}"/>`;
  s += `<line x1="700" y1="1540" x2="700" y2="1800" stroke="${blk}" stroke-width="6"/><rect x="760" y="1600" width="140" height="140" fill="${yel}"/>`;
  return s;
}
