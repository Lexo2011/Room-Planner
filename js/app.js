/* Room Planner - floor plan + wall front view. No dependencies, all units are centimetres. */
(() => {
'use strict';

const $ = (s, el = document) => el.querySelector(s);
const svg = $('#canvas');
const STORAGE_KEY = 'room-planner.v1';

const THEMES = {
  light: {
    bg: '#f4f5f7', floor: '#ffffff', wall: '#3b4252', grid: '#e9ecf0', gridMajor: '#d3d8e0',
    text: '#2e3440', dim: '#5e6b7d', accent: '#2f6fed', warn: '#e5484d', halo: '#ffffff',
    itemStroke: '#3b4252', elevWall: '#fbfbfc', glass: '#d3e8f6', door: '#e8dccb'
  },
  dark: {
    bg: '#171a1f', floor: '#262b33', wall: '#aab3c2', grid: '#2e343d', gridMajor: '#3b424e',
    text: '#e4e7ec', dim: '#9aa3b2', accent: '#6c9dff', warn: '#ff6b70', halo: '#171a1f',
    itemStroke: '#11141a', elevWall: '#262b33', glass: '#35556b', door: '#6b5d4b'
  }
};

const WOOD = '#d9bf99', FABRIC = '#a9bbcf', KITCHEN = '#e6e2da', STEEL = '#c9ced6', BATH = '#dfeaf0';
const CATALOG = [
  { group: 'Living', items: [
    { type: 'sofa', name: 'Sofa', w: 200, d: 90, h: 80, color: FABRIC },
    { type: 'sofa', name: 'Armchair', w: 85, d: 85, h: 80, color: FABRIC },
    { type: 'box', name: 'Coffee table', w: 110, d: 60, h: 45, color: WOOD },
    { type: 'box', name: 'Dining table', w: 160, d: 90, h: 75, color: WOOD },
    { type: 'round', name: 'Round table', w: 110, d: 110, h: 75, color: WOOD },
    { type: 'chair', name: 'Chair', w: 45, d: 45, h: 90, color: '#c9a77c' },
    { type: 'box', name: 'TV unit', w: 160, d: 40, h: 50, color: WOOD, front: 'drawers' },
    { type: 'box', name: 'Bookshelf', w: 80, d: 30, h: 200, color: WOOD, front: 'shelves' },
    { type: 'box', name: 'Rug', w: 200, d: 140, h: 1, color: '#e3d5c8', flat: true },
    { type: 'plant', name: 'Plant', w: 40, d: 40, h: 120, color: '#9cc59a' }
  ] },
  { group: 'Bedroom', items: [
    { type: 'bed', name: 'Double bed', w: 160, d: 200, h: 50, color: '#d5dbe6' },
    { type: 'bed', name: 'Single bed', w: 90, d: 200, h: 50, color: '#d5dbe6' },
    { type: 'box', name: 'Nightstand', w: 45, d: 40, h: 50, color: WOOD, front: 'drawers' },
    { type: 'box', name: 'Wardrobe', w: 200, d: 60, h: 220, color: WOOD, front: 'cabinet' },
    { type: 'box', name: 'Dresser', w: 100, d: 45, h: 85, color: WOOD, front: 'drawers' },
    { type: 'box', name: 'Desk', w: 140, d: 70, h: 75, color: WOOD }
  ] },
  { group: 'Kitchen', items: [
    { type: 'box', name: 'Base cabinet', w: 60, d: 60, h: 86, color: KITCHEN, front: 'cabinet', plinth: 10 },
    { type: 'box', name: 'Drawer unit', w: 60, d: 60, h: 86, color: KITCHEN, front: 'drawers', plinth: 10 },
    { type: 'sink', name: 'Sink unit', w: 80, d: 60, h: 86, color: KITCHEN, front: 'cabinet', plinth: 10 },
    { type: 'hob', name: 'Cooker', w: 60, d: 60, h: 86, color: STEEL, front: 'oven', plinth: 10 },
    { type: 'box', name: 'Dishwasher', w: 60, d: 60, h: 86, color: STEEL, front: 'dishwasher', plinth: 10 },
    { type: 'box', name: 'Fridge', w: 60, d: 65, h: 180, color: STEEL, front: 'fridge' },
    { type: 'box', name: 'Tall cabinet', w: 60, d: 60, h: 210, color: KITCHEN, front: 'cabinet', plinth: 10 },
    { type: 'box', name: 'Countertop', w: 180, d: 62, h: 4, z: 86, color: '#b9a48c' },
    { type: 'box', name: 'Wall cabinet', w: 60, d: 35, h: 72, z: 146, color: KITCHEN, front: 'cabinet' },
    { type: 'box', name: 'Extractor hood', w: 60, d: 45, h: 30, z: 160, color: STEEL, front: 'hood' },
    { type: 'box', name: 'Wall shelf', w: 80, d: 25, h: 4, z: 150, color: WOOD },
    { type: 'box', name: 'Kitchen island', w: 180, d: 90, h: 90, color: KITCHEN, front: 'drawers', plinth: 10 }
  ] },
  { group: 'Bathroom', items: [
    { type: 'toilet', name: 'Toilet', w: 40, d: 65, h: 80, color: BATH },
    { type: 'basin', name: 'Washbasin', w: 60, d: 45, h: 85, color: BATH, front: 'cabinet' },
    { type: 'bathtub', name: 'Bathtub', w: 170, d: 75, h: 55, color: BATH },
    { type: 'shower', name: 'Shower', w: 90, d: 90, h: 200, color: BATH },
    { type: 'box', name: 'Washing machine', w: 60, d: 60, h: 85, color: STEEL, front: 'washer' }
  ] },
  { group: 'Other', items: [
    { type: 'box', name: 'Box', w: 100, d: 50, h: 50, color: '#d8d8d8' },
    { type: 'box', name: 'Radiator', w: 100, d: 10, h: 60, z: 12, color: '#eeeeee', front: 'shelves' },
    { type: 'box', name: 'Picture', w: 80, d: 3, h: 60, z: 130, color: '#f1e9d8', front: 'frame' },
    { type: 'box', name: 'Mirror', w: 60, d: 3, h: 90, z: 100, color: '#dcecf2', front: 'frame' }
  ] }
];

/* ---------- small helpers ---------- */
const f = n => Math.round(n * 100) / 100;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 9);
const fmt = cm => cm >= 100 ? (cm / 100).toFixed(2) + ' m' : Math.round(cm) + ' cm';
const cmStr = v => String(Math.round(v * 10) / 10);
const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
const dot = (a, b) => a.x * b.x + a.y * b.y;
const cross = (a, b) => a.x * b.y - a.y * b.x;

function signedArea(pts) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[(i + 1) % pts.length];
    a += p.x * q.y - q.x * p.y;
  }
  return a / 2;
}
function centroid(pts) {
  let a = 0, cx = 0, cy = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[(i + 1) % pts.length], k = p.x * q.y - q.x * p.y;
    a += k; cx += (p.x + q.x) * k; cy += (p.y + q.y) * k;
  }
  if (Math.abs(a) < 1e-6) return { x: pts[0].x, y: pts[0].y };
  return { x: cx / (3 * a), y: cy / (3 * a) };
}
function pointInPoly(p, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i], b = pts[j];
    if ((a.y > p.y) !== (b.y > p.y) && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

// A wall is edge i of a room polygon. u runs A->B, n points into the room,
// s tells whether A (s=1) or B (s=-1) is the left end when looking at the wall from inside.
function wallInfo(room, i) {
  const n = room.points.length, A = room.points[i], B = room.points[(i + 1) % n];
  const d = sub(B, A), L = Math.hypot(d.x, d.y) || 1e-6;
  const u = { x: d.x / L, y: d.y / L };
  const s = signedArea(room.points) >= 0 ? 1 : -1;
  return { A, B, L, u, s, n: { x: -u.y * s, y: u.x * s } };
}
function itemCorners(it) {
  const r = it.rot * Math.PI / 180, c = Math.cos(r), s = Math.sin(r), hw = it.w / 2, hd = it.d / 2;
  return [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].map(([x, y]) => ({ x: it.x + x * c - y * s, y: it.y + x * s + y * c }));
}
function aabb(it) {
  const cs = itemCorners(it), xs = cs.map(c => c.x), ys = cs.map(c => c.y);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}
// Footprint of an item as seen in the front view of wall W.
function projectItem(it, W) {
  let t0 = Infinity, t1 = -Infinity, d0 = Infinity;
  for (const c of itemCorners(it)) {
    const v = sub(c, W.A), t = dot(v, W.u), d = dot(v, W.n);
    t0 = Math.min(t0, t); t1 = Math.max(t1, t); d0 = Math.min(d0, d);
  }
  return { x: W.s > 0 ? t0 : W.L - t1, w: t1 - t0, dist: d0 };
}
function openingX(o, W) { return W.s > 0 ? o.offset : W.L - o.offset - o.width; }

function itemsOverlap(a, b) {
  if (a.flat || b.flat) return false;
  if (a.z + a.h <= b.z + 0.5 || b.z + b.h <= a.z + 0.5) return false;
  const A = itemCorners(a), B = itemCorners(b);
  for (const P of [A, B]) {
    for (let i = 0; i < 2; i++) {
      const e = sub(P[i + 1], P[i]), l = Math.hypot(e.x, e.y) || 1, ax = { x: -e.y / l, y: e.x / l };
      const pa = A.map(p => dot(p, ax)), pb = B.map(p => dot(p, ax));
      if (Math.max(...pa) <= Math.min(...pb) + 0.6 || Math.max(...pb) <= Math.min(...pa) + 0.6) return false;
    }
  }
  return true;
}
function collisions() {
  const out = new Set(), it = state.items;
  for (let i = 0; i < it.length; i++) for (let j = i + 1; j < it.length; j++) {
    if (itemsOverlap(it[i], it[j])) { out.add(it[i].id); out.add(it[j].id); }
  }
  return out;
}

/* ---------- state ---------- */
function blank() { return { settings: { grid: 10, snap: true, thick: true, wallT: 12 }, rooms: [], openings: [], items: [] }; }
function catDef(name) { for (const g of CATALOG) for (const d of g.items) if (d.name === name) return d; }
function mkItem(def, extra) {
  return Object.assign({ id: uid(), type: def.type, name: def.name, w: def.w, d: def.d, h: def.h, z: def.z || 0,
    rot: 0, x: 0, y: 0, color: def.color, front: def.front, plinth: def.plinth, flat: def.flat }, extra);
}
function demo() {
  const s = blank(), roomId = uid();
  s.rooms.push({ id: roomId, name: 'Kitchen', height: 250, points: [{ x: 0, y: 0 }, { x: 420, y: 0 }, { x: 420, y: 320 }, { x: 0, y: 320 }] });
  const put = (name, x, y, extra) => s.items.push(mkItem(catDef(name), Object.assign({ x, y }, extra)));
  put('Fridge', 30, 32.5);
  put('Base cabinet', 90, 30);
  put('Cooker', 150, 30);
  put('Drawer unit', 210, 30);
  put('Sink unit', 280, 30);
  put('Dishwasher', 350, 30);
  put('Base cabinet', 400, 30, { w: 40 });
  put('Countertop', 240, 31, { w: 360 });
  put('Wall cabinet', 90, 17.5);
  put('Extractor hood', 150, 22.5);
  put('Wall cabinet', 210, 17.5);
  put('Wall cabinet', 280, 17.5, { w: 80 });
  put('Wall cabinet', 350, 17.5);
  put('Wall cabinet', 400, 17.5, { w: 40 });
  put('Dining table', 220, 220, { w: 140, d: 80 });
  put('Chair', 185, 155);
  put('Chair', 255, 155);
  put('Chair', 185, 285, { rot: 180 });
  put('Chair', 255, 285, { rot: 180 });
  s.openings.push({ id: uid(), roomId, wall: 1, type: 'window', offset: 110, width: 120, height: 120, sill: 95 });
  s.openings.push({ id: uid(), roomId, wall: 2, type: 'door', offset: 20, width: 90, height: 205, sill: 0 });
  return s;
}
function sanitize(raw) {
  const s = blank();
  if (!raw || typeof raw !== 'object') throw new Error('Not a plan file');
  Object.assign(s.settings, raw.settings);
  s.settings.grid = clamp(+s.settings.grid || 10, 1, 200);
  s.settings.wallT = clamp(Number.isFinite(+s.settings.wallT) ? +s.settings.wallT : 12, 1, 100);
  s.settings.thick = s.settings.thick !== false;
  s.settings.snap = !!s.settings.snap;
  const num = (v, def) => Number.isFinite(+v) ? +v : def;
  for (const r of raw.rooms || []) {
    const pts = (r.points || []).map(p => ({ x: num(p.x, 0), y: num(p.y, 0) }));
    if (pts.length >= 3) s.rooms.push({ id: String(r.id || uid()), name: String(r.name || 'Room'), height: clamp(num(r.height, 250), 50, 1000), floor: r.floor, points: pts });
  }
  for (const it of raw.items || []) {
    s.items.push({ id: String(it.id || uid()), type: String(it.type || 'box'), name: String(it.name || 'Item'),
      x: num(it.x, 0), y: num(it.y, 0), w: Math.max(1, num(it.w, 50)), d: Math.max(1, num(it.d, 50)), h: Math.max(1, num(it.h, 50)),
      z: Math.max(0, num(it.z, 0)), rot: num(it.rot, 0), color: /^#[0-9a-f]{6}$/i.test(it.color) ? it.color : '#d8d8d8',
      front: it.front, plinth: it.plinth, flat: !!it.flat });
  }
  for (const o of raw.openings || []) {
    s.openings.push({ id: String(o.id || uid()), roomId: String(o.roomId), wall: num(o.wall, 0) | 0, type: o.type === 'door' ? 'door' : 'window',
      offset: num(o.offset, 0), width: Math.max(10, num(o.width, 90)), height: Math.max(10, num(o.height, 200)), sill: Math.max(0, num(o.sill, 0)), flip: !!o.flip });
  }
  return s;
}
function normalize() {
  state.openings = state.openings.filter(o => {
    const room = state.rooms.find(r => r.id === o.roomId);
    if (!room || o.wall < 0 || o.wall >= room.points.length) return false;
    const W = wallInfo(room, o.wall);
    o.width = Math.min(o.width, Math.floor(W.L));
    o.offset = f(clamp(o.offset, 0, W.L - o.width));
    o.height = Math.min(o.height, room.height);
    o.sill = o.type === 'door' ? 0 : clamp(o.sill, 0, room.height - o.height);
    return o.width >= 10;
  });
  for (const it of state.items) { it.x = f(it.x); it.y = f(it.y); it.z = f(it.z); it.rot = ((f(it.rot) % 360) + 360) % 360; }
  for (const r of state.rooms) for (const p of r.points) { p.x = f(p.x); p.y = f(p.y); }
}

let state;
// Drawn wall thickness in cm; 0 when the plan is set to thin wall lines.
const wallT = () => state.settings.thick ? state.settings.wallT : 0;
const ui = { mode: 'plan', sel: null, wall: { roomId: null, i: 0 }, depth: 80, measuring: false, measure: null };
const views = { plan: { x: 0, y: 0, s: 1, fitted: false }, wall: { x: 0, y: 0, s: 1, fitted: false } };
let history = [], hIndex = 0, pendingJoin = '';

function b64encode(str) {
  let bin = '';
  for (const b of new TextEncoder().encode(str)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64decode(s) {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
}
function snapshot() { return Object.assign({}, state, { ui: { mode: ui.mode, wall: ui.wall, depth: ui.depth } }); }
function adopt(raw) {
  state = sanitize(raw);
  normalize();
  if (raw.ui) {
    ui.mode = raw.ui.mode === 'wall' ? 'wall' : 'plan';
    if (raw.ui.wall) ui.wall = { roomId: raw.ui.wall.roomId, i: raw.ui.wall.i | 0 };
    if (Number.isFinite(+raw.ui.depth)) ui.depth = Math.max(0, +raw.ui.depth);
  }
  ui.sel = null;
  views.plan.fitted = views.wall.fitted = false;
}
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot())); } catch (e) { /* storage unavailable */ }
}
function load() {
  try {
    if (location.hash.startsWith('#join=')) {
      pendingJoin = normCode(location.hash.slice(6));
      window.history.replaceState(null, '', location.pathname + location.search);
    }
    if (location.hash.startsWith('#p=')) {
      adopt(JSON.parse(b64decode(location.hash.slice(3))));
      window.history.replaceState(null, '', location.pathname + location.search);
      return;
    }
  } catch (e) { toast('That share link could not be read.'); }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { adopt(JSON.parse(raw)); return; }
  } catch (e) { /* fall through to the example */ }
  adopt(demo());
}
function commit() {
  normalize();
  const json = JSON.stringify(state);
  if (json !== history[hIndex]) {
    history.splice(hIndex + 1);
    history.push(json);
    if (history.length > 150) history.shift();
    hIndex = history.length - 1;
  }
  save();
  pushChanges();
}
function revert() { state = JSON.parse(history[hIndex]); }
function timeTravel(dir) {
  if (hIndex + dir < 0 || hIndex + dir >= history.length) return;
  hIndex += dir;
  revert();
  if (ui.sel && !selected()) ui.sel = null;
  save();
  pushChanges();
  refresh();
}

/* ---------- selection ---------- */
function selected() {
  const s = ui.sel;
  if (!s) return null;
  if (s.kind === 'item') return state.items.find(i => i.id === s.id) || null;
  if (s.kind === 'opening') return state.openings.find(o => o.id === s.id) || null;
  const room = state.rooms.find(r => r.id === s.id);
  if (!room || (s.kind === 'wall' && s.i >= room.points.length)) return null;
  return room;
}
function select(sel) { ui.sel = sel; refresh(); }
function activeWall() {
  let room = state.rooms.find(r => r.id === ui.wall.roomId);
  if (!room) {
    room = state.rooms[0];
    if (!room) return null;
    ui.wall = { roomId: room.id, i: 0 };
  }
  if (ui.wall.i >= room.points.length) ui.wall.i = 0;
  return { room, i: ui.wall.i, W: wallInfo(room, ui.wall.i) };
}
function allWalls() {
  const out = [];
  for (const room of state.rooms) room.points.forEach((_, i) => out.push({ room, i }));
  return out;
}
function openWall(roomId, i) {
  ui.wall = { roomId, i };
  ui.mode = 'wall';
  views.wall.fitted = false;
  ui.measuring = false; ui.measure = null;
  save();
  refresh();
}
function elevItems(W) {
  const out = [];
  for (const it of state.items) {
    const p = projectItem(it, W);
    if (dot(sub(it, W.A), W.n) < -1 || p.dist > ui.depth || p.x >= W.L - 0.5 || p.x + p.w <= 0.5) continue;
    out.push(Object.assign({ it }, p));
  }
  return out.sort((a, b) => a.dist - b.dist);
}

/* ---------- editing operations ---------- */
function snapItem(it) {
  const g = state.settings.grid, thr = Math.max(3, 8 / views.plan.s);
  let bb = aabb(it);
  it.x += Math.round(bb.x0 / g) * g - bb.x0;
  it.y += Math.round(bb.y0 / g) * g - bb.y0;
  bb = aabb(it);
  let bx = thr, by = thr, sx = 0, sy = 0;
  for (const o of state.items) {
    if (o === it) continue;
    const ob = aabb(o);
    if (bb.y0 < ob.y1 + 50 && bb.y1 > ob.y0 - 50) {
      for (const [a, b] of [[bb.x0, ob.x1], [bb.x1, ob.x0], [bb.x0, ob.x0], [bb.x1, ob.x1]]) if (Math.abs(b - a) < bx) { bx = Math.abs(b - a); sx = b - a; }
    }
    if (bb.x0 < ob.x1 + 50 && bb.x1 > ob.x0 - 50) {
      for (const [a, b] of [[bb.y0, ob.y1], [bb.y1, ob.y0], [bb.y0, ob.y0], [bb.y1, ob.y1]]) if (Math.abs(b - a) < by) { by = Math.abs(b - a); sy = b - a; }
    }
  }
  it.x += sx; it.y += sy;
  for (const room of state.rooms) for (let i = 0; i < room.points.length; i++) {
    const W = wallInfo(room, i);
    let d0 = Infinity, t0 = Infinity, t1 = -Infinity;
    for (const c of itemCorners(it)) {
      const v = sub(c, W.A), t = dot(v, W.u);
      d0 = Math.min(d0, dot(v, W.n)); t0 = Math.min(t0, t); t1 = Math.max(t1, t);
    }
    if (t1 > 0 && t0 < W.L && Math.abs(d0) < thr) { it.x -= W.n.x * d0; it.y -= W.n.y * d0; }
  }
}
function snapEdges(pos, size, cands, thr) {
  let best = thr, res = pos;
  for (const c of cands) for (const off of [0, size]) {
    const dd = Math.abs(pos + off - c);
    if (dd < best) { best = dd; res = c - off; }
  }
  return res;
}
function viewCentre() {
  const r = svg.getBoundingClientRect(), v = views[ui.mode];
  return { x: v.x + r.width / v.s / 2, y: v.y + r.height / v.s / 2 };
}
function addItem(def) {
  const it = mkItem(def);
  const aw = ui.mode === 'wall' && activeWall();
  if (aw) {
    // Put it against the wall, in the first free slot from the left at its height.
    const W = aw.W;
    const busy = elevItems(W).filter(e => !e.it.flat && e.it.z < it.z + it.h - 0.5 && e.it.z + e.it.h > it.z + 0.5 && e.dist < it.d - 0.5).sort((a, b) => a.x - b.x);
    let x = 0;
    for (const b of busy) {
      if (x + it.w <= b.x + 0.5) break;
      x = Math.max(x, b.x + b.w);
    }
    if (x + it.w > W.L) x = Math.max(0, W.L - it.w);
    const t = W.s > 0 ? x + it.w / 2 : W.L - x - it.w / 2;
    it.rot = Math.atan2(W.u.y * W.s, W.u.x * W.s) * 180 / Math.PI;
    it.x = W.A.x + W.u.x * t + W.n.x * it.d / 2;
    it.y = W.A.y + W.u.y * t + W.n.y * it.d / 2;
  } else {
    const c = viewCentre(), g = state.settings.grid;
    it.x = Math.round(c.x / g) * g; it.y = Math.round(c.y / g) * g;
    while (state.items.some(o => Math.abs(o.x - it.x) < 1 && Math.abs(o.y - it.y) < 1)) { it.x += 20; it.y += 20; }
  }
  state.items.push(it);
  ui.sel = { kind: 'item', id: it.id };
  commit(); refresh();
}
function addRoom() {
  let x = 0;
  for (const r of state.rooms) for (const p of r.points) x = Math.max(x, p.x + 60);
  const room = { id: uid(), name: 'Room ' + (state.rooms.length + 1), height: 250,
    points: [{ x, y: 0 }, { x: x + 400, y: 0 }, { x: x + 400, y: 300 }, { x, y: 300 }] };
  state.rooms.push(room);
  ui.mode = 'plan';
  ui.sel = { kind: 'room', id: room.id };
  views.plan.fitted = false;
  commit(); refresh();
}
function targetWall() {
  if (ui.mode === 'wall') return activeWall();
  const s = ui.sel, obj = selected();
  if (obj && s.kind === 'wall') return { room: obj, i: s.i };
  if (obj && s.kind === 'room') return { room: obj, i: 0 };
  if (obj && s.kind === 'opening') return { room: state.rooms.find(r => r.id === obj.roomId), i: obj.wall };
  const c = viewCentre();
  let best = null, bd = Infinity;
  for (const w of allWalls()) {
    const W = wallInfo(w.room, w.i), t = clamp(dot(sub(c, W.A), W.u), 0, W.L);
    const d = Math.hypot(W.A.x + W.u.x * t - c.x, W.A.y + W.u.y * t - c.y);
    if (d < bd) { bd = d; best = w; }
  }
  return best;
}
function addOpening(type) {
  const tw = targetWall();
  if (!tw) return toast('Add a room first.');
  const W = wallInfo(tw.room, tw.i);
  const o = type === 'door'
    ? { type, width: 90, height: 205, sill: 0 }
    : { type, width: 120, height: 120, sill: 95 };
  o.width = Math.min(o.width, Math.floor(W.L));
  Object.assign(o, { id: uid(), roomId: tw.room.id, wall: tw.i, offset: (W.L - o.width) / 2 });
  state.openings.push(o);
  ui.sel = { kind: 'opening', id: o.id };
  commit(); refresh();
}
function setWallLength(room, i, L) {
  const W = wallInfo(room, i), n = room.points.length, delta = L - W.L;
  const moved = n >= 4 ? [(i + 1) % n, (i + 2) % n] : [(i + 1) % n];
  for (const k of moved) { room.points[k].x += W.u.x * delta; room.points[k].y += W.u.y * delta; }
}
function splitWall(room, i) {
  const W = wallInfo(room, i), t = W.L / 2;
  room.points.splice(i + 1, 0, { x: W.A.x + W.u.x * t, y: W.A.y + W.u.y * t });
  for (const o of state.openings) {
    if (o.roomId !== room.id) continue;
    if (o.wall > i) o.wall++;
    else if (o.wall === i && o.offset + o.width / 2 >= t) { o.wall = i + 1; o.offset -= t; }
  }
  if (ui.wall.roomId === room.id && ui.wall.i > i) ui.wall.i++;
}
function deleteCorner(room, i) {
  const n = room.points.length;
  if (n <= 3) return toast('A room needs at least three corners.');
  const prev = (i - 1 + n) % n;
  state.openings = state.openings.filter(o => o.roomId !== room.id || (o.wall !== i && o.wall !== prev));
  for (const o of state.openings) if (o.roomId === room.id && o.wall > i) o.wall--;
  room.points.splice(i, 1);
}
function deleteSelection() {
  const s = ui.sel, obj = selected();
  if (!obj) return;
  if (s.kind === 'item') state.items = state.items.filter(i => i !== obj);
  else if (s.kind === 'opening') state.openings = state.openings.filter(o => o !== obj);
  else if (s.kind === 'room') {
    state.rooms = state.rooms.filter(r => r !== obj);
    state.openings = state.openings.filter(o => o.roomId !== obj.id);
  } else return;
  ui.sel = null;
  commit(); refresh();
}
function duplicateSelection() {
  const it = selected();
  if (!it || ui.sel.kind !== 'item') return;
  const r = it.rot * Math.PI / 180;
  const copy = Object.assign({}, it, { id: uid(), x: it.x + Math.cos(r) * it.w, y: it.y + Math.sin(r) * it.w });
  state.items.push(copy);
  ui.sel = { kind: 'item', id: copy.id };
  commit(); refresh();
}
function rotateSelection(deg) {
  const it = selected();
  if (!it || ui.sel.kind !== 'item') return;
  it.rot += deg;
  commit(); refresh();
}
// Wall the given item most plausibly belongs to (used when switching to the wall view).
function wallNearItem(it) {
  let best = null, bd = Infinity;
  for (const w of allWalls()) {
    const W = wallInfo(w.room, w.i), p = projectItem(it, W);
    if (dot(sub(it, W.A), W.n) < 0 || p.x >= W.L || p.x + p.w <= 0) continue;
    if (p.dist < bd) { bd = p.dist; best = w; }
  }
  return best;
}

/* ---------- drawing ---------- */
function theme() {
  const t = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  return THEMES[t];
}
function label(x, y, txt, o) {
  const size = f(o.size);
  return `<text x="${f(x)}" y="${f(y)}" font-size="${size}" fill="${o.fill}" text-anchor="${o.anchor || 'middle'}" dominant-baseline="central"` +
    (o.bold ? ' font-weight="600"' : '') +
    (o.angle ? ` transform="rotate(${f(o.angle)} ${f(x)} ${f(y)})"` : '') +
    (o.halo ? ` stroke="${o.halo}" stroke-width="${f(size * 0.35)}" stroke-linejoin="round" paint-order="stroke"` : '') +
    ` pointer-events="none">${esc(txt)}</text>`;
}
function readableAngle(deg) {
  let a = ((deg % 180) + 180) % 180;
  if (a > 90) a -= 180;
  return a;
}
function itemLabel(it, cx, cy, w, h, s, angle) {
  const size = Math.min(12, 13 / s * 1.6, w / (it.name.length * 0.58), h * 0.6);
  if (size * s < 6.5) return '';
  return label(cx, cy, it.name, { size, fill: '#1f2430', angle });
}

function planSymbol(it, px) {
  const w = it.w, d = it.d, x = -w / 2, y = -d / 2;
  const st = `fill="none" stroke="rgba(0,0,0,.4)" stroke-width="${f(px(1))}"`;
  const wf = `fill="rgba(255,255,255,.55)" stroke="rgba(0,0,0,.4)" stroke-width="${f(px(1))}"`;
  const R = (a, b, c, e, r, style) => `<rect x="${f(a)}" y="${f(b)}" width="${f(Math.max(0, c))}" height="${f(Math.max(0, e))}" rx="${f(r || 0)}" ${style || st}/>`;
  const C = (a, b, r, style) => `<ellipse cx="${f(a)}" cy="${f(b)}" rx="${f(Math.max(0, r))}" ry="${f(Math.max(0, r))}" ${style || st}/>`;
  switch (it.type) {
    case 'bed': {
      const n = w >= 120 ? 2 : 1, gap = Math.min(10, w / 10), pw = (w - gap * (n + 1)) / n, ph = Math.min(40, d * 0.2);
      let o = '';
      for (let i = 0; i < n; i++) o += R(x + gap + i * (pw + gap), y + gap, pw, ph, 5, wf);
      return o + `<line x1="${f(x)}" x2="${f(x + w)}" y1="${f(y + d * 0.32)}" y2="${f(y + d * 0.32)}" ${st}/>`;
    }
    case 'sofa': {
      const a = Math.min(18, w * 0.12), b = Math.min(22, d * 0.28);
      return R(x, y, w, b, 3) + R(x, y, a, d, 3) + R(x + w - a, y, a, d, 3);
    }
    case 'chair': return R(x, y, w, d * 0.18, 2);
    case 'sink': {
      const bw = w * 0.5, bd = d * 0.58;
      let o = R(x + w * 0.1, y + d * 0.24, bw, bd, 4, wf) + C(x + w * 0.1 + bw / 2, y + d * 0.24 + bd / 2, 2.5) + C(x + w * 0.1 + bw / 2, y + d * 0.13, 3);
      for (let i = 1; i <= 4; i++) { const lx = x + w * 0.64 + i * w * 0.06; o += `<line x1="${f(lx)}" x2="${f(lx)}" y1="${f(y + d * 0.26)}" y2="${f(y + d * 0.8)}" ${st}/>`; }
      return o;
    }
    case 'hob': {
      let o = '';
      for (const [a, b, r] of [[0.28, 0.3, 0.13], [0.72, 0.3, 0.1], [0.28, 0.7, 0.1], [0.72, 0.7, 0.13]]) o += C(x + w * a, y + d * b, Math.min(w, d) * r);
      return o;
    }
    case 'basin': return `<ellipse cx="0" cy="${f(d * 0.06)}" rx="${f(w * 0.36)}" ry="${f(d * 0.3)}" ${wf}/>` + C(0, y + d * 0.14, 2.5);
    case 'toilet': return R(x, y, w, d * 0.27, 3) + `<ellipse cx="0" cy="${f(y + d * 0.64)}" rx="${f(w * 0.42)}" ry="${f(d * 0.34)}" ${wf}/>`;
    case 'bathtub': return R(x + 6, y + 6, w - 12, d - 12, Math.min(18, d / 3), wf) + C(x + Math.min(22, w * 0.15), 0, 3);
    case 'shower': return `<path d="M${f(x)} ${f(y)}L${f(x + w)} ${f(y + d)}M${f(x + w)} ${f(y)}L${f(x)} ${f(y + d)}" ${st}/>` + C(0, 0, 4, wf);
    case 'plant': return C(0, 0, Math.min(w, d) * 0.22) + C(0, 0, Math.min(w, d) * 0.36);
  }
  return '';
}

function frontSvg(it, x, y, w, h, px) {
  const st = `fill="none" stroke="rgba(0,0,0,.4)" stroke-width="${f(px(1))}"`;
  const R = (a, b, c, e) => `<rect x="${f(a)}" y="${f(b)}" width="${f(Math.max(0, c))}" height="${f(Math.max(0, e))}" ${st}/>`;
  const Ln = (a, b, c, e) => `<line x1="${f(a)}" y1="${f(b)}" x2="${f(c)}" y2="${f(e)}" ${st}/>`;
  let out = '';
  const pl = it.z < 1 && it.plinth ? Math.min(it.plinth, h / 3) : 0;
  if (pl) out += Ln(x, y + h - pl, x + w, y + h - pl);
  const fh = h - pl, m = Math.min(3, w / 8, fh / 8);
  switch (it.front) {
    case 'cabinet': {
      const n = w > 70 ? 2 : 1, dw = (w - m * (n + 1)) / n, hl = Math.min(12, fh / 4);
      for (let i = 0; i < n; i++) {
        const dx = x + m + i * (dw + m);
        const hx = n === 2 && i === 1 ? dx + Math.min(4, dw / 4) : dx + dw - Math.min(4, dw / 4);
        const hy = it.z > 100 ? y + fh - m - hl - 3 : y + m + 3;
        out += R(dx, y + m, dw, fh - 2 * m) + Ln(hx, hy, hx, hy + hl);
      }
      break;
    }
    case 'drawers': {
      const n = clamp(Math.round(fh / 26), 1, 5), dh = (fh - m * (n + 1)) / n, hw = Math.min(10, w / 5);
      for (let i = 0; i < n; i++) {
        const dy = y + m + i * (dh + m), hy = dy + Math.min(5, dh / 3);
        out += R(x + m, dy, w - 2 * m, dh) + Ln(x + w / 2 - hw, hy, x + w / 2 + hw, hy);
      }
      break;
    }
    case 'oven': {
      const strip = Math.min(12, fh / 5);
      out += Ln(x, y + strip, x + w, y + strip);
      for (let i = 1; i <= 4; i++) out += `<circle cx="${f(x + w * i / 5)}" cy="${f(y + strip / 2)}" r="${f(Math.min(2.5, strip / 3))}" ${st}/>`;
      out += R(x + m * 2, y + strip + m * 2, w - m * 4, fh - strip - m * 4) + Ln(x + m * 3, y + strip + m * 3.5, x + w - m * 3, y + strip + m * 3.5);
      break;
    }
    case 'fridge': {
      const sy = y + fh * 0.33, hx = x + w - Math.min(5, w / 6);
      out += Ln(x, sy, x + w, sy) + Ln(hx, sy - Math.min(22, fh / 6), hx, sy - 4) + Ln(hx, sy + 4, hx, sy + Math.min(30, fh / 5));
      break;
    }
    case 'dishwasher': {
      const strip = Math.min(10, fh / 5);
      out += Ln(x, y + strip, x + w, y + strip) + Ln(x + w * 0.25, y + strip + 5, x + w * 0.75, y + strip + 5);
      break;
    }
    case 'washer': {
      const strip = Math.min(10, fh / 5);
      out += Ln(x, y + strip, x + w, y + strip) + `<circle cx="${f(x + w / 2)}" cy="${f(y + strip + (fh - strip) / 2)}" r="${f(Math.min(w, fh - strip) * 0.32)}" ${st}/>`;
      break;
    }
    case 'shelves': {
      const n = Math.max(1, Math.round(h / 35));
      for (let i = 1; i < n; i++) out += Ln(x, y + h * i / n, x + w, y + h * i / n);
      break;
    }
    case 'hood': out += Ln(x, y + h * 0.65, x + w, y + h * 0.65); break;
    case 'frame': out += R(x + m, y + m, w - 2 * m, h - 2 * m); break;
  }
  return out;
}

function gridPath(vp, step) {
  let d = '';
  for (let x = Math.ceil(vp.x / step) * step; x < vp.x + vp.w; x += step) d += `M${x} ${f(vp.y)}v${f(vp.h)}`;
  for (let y = Math.ceil(vp.y / step) * step; y < vp.y + vp.h; y += step) d += `M${f(vp.x)} ${y}h${f(vp.w)}`;
  return d;
}

function renderPlan(s, o) {
  const T = o.T, I = o.interactive, px = n => n / s, sel = I ? ui.sel : null, selObj = I ? selected() : null;
  const wt = wallT(), thin = wt === 0, half = thin ? px(3.5) : 0;
  const pts = r => r.points.map(p => f(p.x) + ',' + f(p.y)).join(' ');
  let h = '';

  for (const r of state.rooms) h += `<polygon data-kind="room" data-id="${r.id}" points="${pts(r)}" fill="${r.floor || T.floor}"/>`;
  if (I) {
    const g = state.settings.grid, major = 100 * s >= 8 ? 100 : 1000;
    if (g * s >= 8 && g < major) h += `<path d="${gridPath(o.vp, g)}" stroke="${T.grid}" stroke-width="${f(px(1))}" fill="none" pointer-events="none"/>`;
    h += `<path d="${gridPath(o.vp, major)}" stroke="${T.gridMajor}" stroke-width="${f(px(1))}" fill="none" pointer-events="none"/>`;
  }
  // Walls: a thick outline clipped to the outside of the room, so the polygon is the inner face.
  for (const r of state.rooms) {
    const d = 'M' + r.points.map(p => f(p.x) + ' ' + f(p.y)).join('L') + 'Z';
    h += thin
      ? `<path d="${d}" fill="none" stroke="${T.wall}" stroke-width="${f(px(3))}" stroke-linejoin="round" pointer-events="none"/>`
      : `<clipPath id="wc-${r.id}"><path clip-rule="evenodd" d="M-1e5 -1e5H1e5V1e5H-1e5Z${d}"/></clipPath>` +
        `<path d="${d}" fill="none" stroke="${T.wall}" stroke-width="${wt * 2}" stroke-linejoin="miter" clip-path="url(#wc-${r.id})" pointer-events="none"/>`;
  }

  for (const r of state.rooms) {
    const c = centroid(r.points);
    h += label(c.x, c.y - px(8), r.name, { size: px(13), fill: T.text, bold: true }) +
      label(c.x, c.y + px(8), (Math.abs(signedArea(r.points)) / 1e4).toFixed(2) + ' m²', { size: px(11), fill: T.dim });
    for (let i = 0; i < r.points.length; i++) {
      const W = wallInfo(r, i), k = wt / 2;
      const a = { x: W.A.x - W.n.x * k, y: W.A.y - W.n.y * k }, b = { x: W.B.x - W.n.x * k, y: W.B.y - W.n.y * k };
      const isSel = sel && sel.kind === 'wall' && sel.id === r.id && sel.i === i;
      const isActive = I && ui.wall.roomId === r.id && ui.wall.i === i && ui.mode === 'wall';
      if (isSel || isActive) h += `<line x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}" stroke="${T.accent}" stroke-width="${f(thin ? px(5) : wt)}" pointer-events="none"/>`;
      if (I) h += `<line data-kind="wall" data-id="${r.id}" data-i="${i}" x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}" stroke="transparent" stroke-width="${f(Math.max(wt, px(16)))}" style="cursor:pointer"/>`;
      const off = wt + px(13), mx = (W.A.x + W.B.x) / 2 - W.n.x * off, my = (W.A.y + W.B.y) / 2 - W.n.y * off;
      if (W.L * s > 34) h += label(mx, my, fmt(W.L), { size: px(11), fill: isSel ? T.accent : T.dim, angle: readableAngle(Math.atan2(W.u.y, W.u.x) * 180 / Math.PI) });
    }
  }

  for (const op of state.openings) {
    const r = state.rooms.find(x => x.id === op.roomId);
    if (!r) continue;
    const W = wallInfo(r, op.wall), isSel = sel && sel.kind === 'opening' && sel.id === op.id;
    const P = (t, d) => ({ x: W.A.x + W.u.x * t + W.n.x * d, y: W.A.y + W.u.y * t + W.n.y * d });
    const q = [P(op.offset, half), P(op.offset + op.width, half), P(op.offset + op.width, -wt - half), P(op.offset, -wt - half)];
    const stroke = isSel ? T.accent : T.wall, sw = f(px(isSel ? 2 : 1.2));
    h += `<g data-kind="opening" data-id="${op.id}" style="cursor:move">` +
      `<polygon points="${q.map(p => f(p.x) + ',' + f(p.y)).join(' ')}" fill="${op.type === 'window' ? T.glass : (r.floor || T.floor)}" stroke="${stroke}" stroke-width="${sw}"/>`;
    if (op.type === 'window') {
      const a = P(op.offset, -wt / 2), b = P(op.offset + op.width, -wt / 2);
      h += `<line x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}" stroke="${stroke}" stroke-width="${sw}"/>`;
    } else {
      // Door leaf drawn open at 90 degrees with its swing arc.
      const hingeT = op.flip ? op.offset + op.width : op.offset, dir = op.flip ? -1 : 1;
      const hinge = P(hingeT, 0), leaf = P(hingeT, op.width), jamb = P(hingeT + dir * op.width, 0);
      const sweep = cross(W.n, { x: W.u.x * dir, y: W.u.y * dir }) > 0 ? 1 : 0;
      h += `<path d="M${f(hinge.x)} ${f(hinge.y)}L${f(leaf.x)} ${f(leaf.y)}A${op.width} ${op.width} 0 0 ${sweep} ${f(jamb.x)} ${f(jamb.y)}" fill="${T.accent}" fill-opacity=".06" stroke="${stroke}" stroke-width="${sw}"/>`;
    }
    h += '</g>';
  }

  const bad = collisions();
  const order = [...state.items].sort((a, b) => (b.flat ? 1 : 0) - (a.flat ? 1 : 0) || a.z - b.z);
  for (const it of order) {
    const isSel = sel && sel.kind === 'item' && sel.id === it.id;
    const stroke = bad.has(it.id) ? T.warn : isSel ? T.accent : T.itemStroke;
    const style = `fill="${it.color}" fill-opacity="${it.z > 0 ? 0.45 : 1}" stroke="${stroke}" stroke-width="${f(px(isSel || bad.has(it.id) ? 2 : 1.2))}"` +
      (it.z >= 120 ? ` stroke-dasharray="${f(px(5))} ${f(px(3))}"` : '');
    h += `<g data-kind="item" data-id="${it.id}" transform="translate(${f(it.x)} ${f(it.y)}) rotate(${f(it.rot)})" style="cursor:move">` +
      (it.type === 'round' || it.type === 'plant'
        ? `<ellipse rx="${f(it.w / 2)}" ry="${f(it.d / 2)}" ${style}/>`
        : `<rect x="${f(-it.w / 2)}" y="${f(-it.d / 2)}" width="${f(it.w)}" height="${f(it.d)}" rx="1.5" ${style}/>`) +
      planSymbol(it, px) +
      (it.front && it.d > 8 ? `<line x1="${f(-it.w / 2 + 2)}" x2="${f(it.w / 2 - 2)}" y1="${f(it.d / 2 - 2)}" y2="${f(it.d / 2 - 2)}" stroke="rgba(0,0,0,.3)" stroke-width="1.5"/>` : '') +
      '</g>';
    // Skip the label when something mounted higher (worktop, wall cabinet) sits on top of it.
    const covered = order.some(o => {
      if (o === it || o.flat || o.z <= it.z) return false;
      const b = aabb(o);
      return it.x >= b.x0 && it.x <= b.x1 && it.y >= b.y0 && it.y <= b.y1;
    });
    if (!covered || isSel) h += itemLabel(it, it.x, it.y, it.w, it.d, s, readableAngle(it.rot));
  }

  if (selObj && sel.kind === 'item') {
    const it = selObj, r = it.rot * Math.PI / 180, ax = { x: Math.cos(r), y: Math.sin(r) }, ay = { x: -ax.y, y: ax.x };
    // Clearance from each side of the item to the nearest wall.
    for (const [dir, half] of [[ax, it.w / 2], [{ x: -ax.x, y: -ax.y }, it.w / 2], [ay, it.d / 2], [{ x: -ay.x, y: -ay.y }, it.d / 2]]) {
      const o0 = { x: it.x + dir.x * half, y: it.y + dir.y * half };
      let best = Infinity;
      for (const room of state.rooms) for (let i = 0; i < room.points.length; i++) {
        const A = room.points[i], e = sub(room.points[(i + 1) % room.points.length], A), cr = cross(dir, e);
        if (Math.abs(cr) < 1e-9) continue;
        const ao = sub(A, o0), t = cross(ao, e) / cr, k = cross(ao, dir) / cr;
        if (t > 0.5 && k >= 0 && k <= 1 && t < best) best = t;
      }
      if (best < 2000) {
        const e = { x: o0.x + dir.x * best, y: o0.y + dir.y * best };
        h += `<line x1="${f(o0.x)}" y1="${f(o0.y)}" x2="${f(e.x)}" y2="${f(e.y)}" stroke="${T.accent}" stroke-width="${f(px(1))}" stroke-dasharray="${f(px(4))} ${f(px(3))}" pointer-events="none"/>` +
          label((o0.x + e.x) / 2, (o0.y + e.y) / 2, cmStr(best), { size: px(11), fill: T.accent, halo: T.halo });
      }
    }
    const hy = -it.d / 2 - px(24), q = px(6);
    h += `<g transform="translate(${f(it.x)} ${f(it.y)}) rotate(${f(it.rot)})">` +
      `<line x1="0" x2="0" y1="${f(-it.d / 2)}" y2="${f(hy)}" stroke="${T.accent}" stroke-width="${f(px(1.5))}"/>` +
      `<circle data-kind="rot" cx="0" cy="${f(hy)}" r="${f(px(7))}" fill="#fff" stroke="${T.accent}" stroke-width="${f(px(2))}" style="cursor:grab"/>` +
      `<rect data-kind="resize" x="${f(it.w / 2 - q)}" y="${f(it.d / 2 - q)}" width="${f(q * 2)}" height="${f(q * 2)}" fill="#fff" stroke="${T.accent}" stroke-width="${f(px(2))}" style="cursor:nwse-resize"/></g>`;
  }
  if (selObj && sel.kind === 'room') {
    const c = centroid(selObj.points), k = px(5);
    h += `<polygon points="${pts(selObj)}" fill="none" stroke="${T.accent}" stroke-width="${f(px(2))}" pointer-events="none"/>`;
    selObj.points.forEach((p, i) => {
      h += `<circle data-kind="corner" data-i="${i}" cx="${f(p.x)}" cy="${f(p.y)}" r="${f(px(7))}" fill="#fff" stroke="${T.accent}" stroke-width="${f(px(2))}" style="cursor:move"/>`;
    });
    h += `<g data-kind="roommove" style="cursor:move"><circle cx="${f(c.x)}" cy="${f(c.y - px(34))}" r="${f(px(11))}" fill="${T.accent}"/>` +
      `<path d="M${f(c.x - k)} ${f(c.y - px(34))}h${f(k * 2)}M${f(c.x)} ${f(c.y - px(34) - k)}v${f(k * 2)}" stroke="#fff" stroke-width="${f(px(2))}" stroke-linecap="round"/></g>`;
  }
  if (I && ui.measure) {
    const { a, b } = ui.measure, L = Math.hypot(b.x - a.x, b.y - a.y);
    h += `<line x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}" stroke="${T.warn}" stroke-width="${f(px(2))}" pointer-events="none"/>` +
      `<circle cx="${f(a.x)}" cy="${f(a.y)}" r="${f(px(3))}" fill="${T.warn}"/><circle cx="${f(b.x)}" cy="${f(b.y)}" r="${f(px(3))}" fill="${T.warn}"/>` +
      label((a.x + b.x) / 2, (a.y + b.y) / 2 - px(12), fmt(L), { size: px(13), fill: T.warn, halo: T.halo, bold: true });
  }
  return h;
}

function dimChain(edges, L, y, dir, s, T) {
  const px = n => n / s;
  const xs = [...new Set([0, L, ...edges].map(x => Math.round(clamp(x, 0, L) * 10) / 10))].sort((a, b) => a - b);
  let h = `<line x1="0" x2="${f(L)}" y1="${f(y)}" y2="${f(y)}" stroke="${T.dim}" stroke-width="${f(px(1))}"/>`;
  for (const x of xs) h += `<line x1="${f(x)}" x2="${f(x)}" y1="${f(y - px(4))}" y2="${f(y + px(4))}" stroke="${T.dim}" stroke-width="${f(px(1))}"/>`;
  for (let i = 0; i < xs.length - 1; i++) {
    const w = xs[i + 1] - xs[i], txt = cmStr(w);
    if (w * s >= txt.length * 6.5 + 4) h += label((xs[i] + xs[i + 1]) / 2, y + dir * px(11), txt, { size: px(10.5), fill: T.dim });
  }
  return h;
}

function renderElev(s, o) {
  const T = o.T, I = o.interactive, px = n => n / s, aw = activeWall();
  if (!aw) return label(0, 0, 'Add a room first, then pick one of its walls.', { size: px(14), fill: T.dim });
  const { room, W } = aw, H = room.height, L = W.L, sel = I ? ui.sel : null;
  let h = `<rect x="0" y="${-H}" width="${f(L)}" height="${H}" fill="${T.elevWall}" stroke="${T.wall}" stroke-width="${f(px(1.5))}"/>`;
  if (!I) h += label(L / 2, -H - px(48), `${room.name} – Wall ${aw.i + 1}`, { size: px(14), fill: T.text, bold: true });

  for (let z = 0; z <= H; z += 50) {
    h += `<line x1="${f(-px(6))}" x2="0" y1="${-z}" y2="${-z}" stroke="${T.dim}" stroke-width="${f(px(1))}"/>` +
      label(-px(10), -z, String(z), { size: px(10), fill: T.dim, anchor: 'end' });
  }

  const lowEdges = [], highEdges = [], snapX = [0, L];
  for (const op of state.openings) {
    if (op.roomId !== room.id || op.wall !== aw.i) continue;
    const x = openingX(op, W), y = -(op.sill + op.height), isSel = sel && sel.kind === 'opening' && sel.id === op.id;
    const stroke = isSel ? T.accent : T.wall, sw = f(px(isSel ? 2 : 1.2));
    (op.type === 'door' ? lowEdges : highEdges).push(x, x + op.width);
    snapX.push(x, x + op.width);
    h += `<g data-kind="eopening" data-id="${op.id}" style="cursor:move">` +
      `<rect x="${f(x)}" y="${f(y)}" width="${f(op.width)}" height="${f(op.height)}" fill="${op.type === 'window' ? T.glass : T.door}" stroke="${stroke}" stroke-width="${sw}"/>`;
    if (op.type === 'window') {
      h += `<rect x="${f(x + 5)}" y="${f(y + 5)}" width="${f(Math.max(0, op.width - 10))}" height="${f(Math.max(0, op.height - 10))}" fill="none" stroke="${stroke}" stroke-width="${f(px(1))}"/>` +
        (op.width > 100 ? `<line x1="${f(x + op.width / 2)}" x2="${f(x + op.width / 2)}" y1="${f(y + 5)}" y2="${f(y + op.height - 5)}" stroke="${stroke}" stroke-width="${f(px(1))}"/>` : '');
    } else {
      const hingeLeft = (W.s > 0) !== !!op.flip;
      h += `<circle cx="${f(hingeLeft ? x + op.width - 9 : x + 9)}" cy="${f(-Math.min(105, op.height / 2))}" r="3" fill="none" stroke="${stroke}" stroke-width="${f(px(1.2))}"/>`;
    }
    h += '</g>';
  }

  const bad = collisions(), shown = elevItems(W);
  for (const e of shown) {
    const it = e.it, y = -(it.z + it.h), isSel = sel && sel.kind === 'item' && sel.id === it.id;
    const stroke = bad.has(it.id) ? T.warn : isSel ? T.accent : T.itemStroke;
    (it.z > 1 ? highEdges : lowEdges).push(e.x, e.x + e.w);
    h += `<g data-kind="eitem" data-id="${it.id}" style="cursor:move"><title>${esc(it.name)}</title>` +
      `<rect x="${f(e.x)}" y="${f(y)}" width="${f(e.w)}" height="${f(it.h)}" fill="${it.color}" stroke="${stroke}" stroke-width="${f(px(isSel || bad.has(it.id) ? 2 : 1.2))}"/>` +
      frontSvg(it, e.x, y, e.w, it.h, px) + '</g>' +
      (isSel || !it.front ? itemLabel(it, e.x + e.w / 2, y + it.h / 2, e.w, it.h, s, 0) : '');
  }
  h += `<line x1="${f(-px(40))}" x2="${f(L + px(40))}" y1="0" y2="0" stroke="${T.wall}" stroke-width="${f(px(3))}" pointer-events="none"/>`;

  let below = px(24);
  if (lowEdges.length) { h += dimChain(lowEdges, L, below, 1, s, T); below += px(30); }
  h += dimChain([], L, below, 1, s, T);
  if (highEdges.length) h += dimChain(highEdges, L, -H - px(20), -1, s, T);
  const hx = L + px(24);
  h += `<line x1="${f(hx)}" x2="${f(hx)}" y1="0" y2="${-H}" stroke="${T.dim}" stroke-width="${f(px(1))}"/>` +
    `<path d="M${f(hx - px(4))} 0h${f(px(8))}M${f(hx - px(4))} ${-H}h${f(px(8))}" stroke="${T.dim}" stroke-width="${f(px(1))}"/>` +
    label(hx + px(11), -H / 2, cmStr(H), { size: px(10.5), fill: T.dim, angle: -90 });

  const cur = sel && sel.kind === 'item' && shown.find(e => e.it.id === sel.id);
  if (cur) {
    const it = cur.it, cx = cur.x + cur.w / 2, dash = `stroke="${T.accent}" stroke-width="${f(px(1))}" stroke-dasharray="${f(px(4))} ${f(px(3))}" pointer-events="none"`;
    if (it.z > 1) h += `<line x1="${f(cx)}" x2="${f(cx)}" y1="0" y2="${f(-it.z)}" ${dash}/>` + label(cx, -it.z / 2, cmStr(it.z), { size: px(11), fill: T.accent, halo: T.halo });
    const top = it.z + it.h;
    if (H - top > 1) h += `<line x1="${f(cx)}" x2="${f(cx)}" y1="${f(-top)}" y2="${-H}" ${dash}/>` + label(cx, -(top + H) / 2, cmStr(H - top), { size: px(11), fill: T.accent, halo: T.halo });
  }
  return h;
}

function planBounds() {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const grow = (p, m) => { x0 = Math.min(x0, p.x - m); y0 = Math.min(y0, p.y - m); x1 = Math.max(x1, p.x + m); y1 = Math.max(y1, p.y + m); };
  for (const r of state.rooms) for (const p of r.points) grow(p, wallT());
  for (const it of state.items) for (const c of itemCorners(it)) grow(c, 0);
  if (x0 === Infinity) return { x: 0, y: 0, w: 400, h: 300 };
  return { x: x0, y: y0, w: Math.max(50, x1 - x0), h: Math.max(50, y1 - y0) };
}
function elevBounds() {
  const aw = activeWall();
  if (!aw) return { x: -200, y: -150, w: 400, h: 300 };
  return { x: 0, y: -aw.room.height, w: aw.W.L, h: aw.room.height };
}
function fit() {
  const r = svg.getBoundingClientRect(), v = views[ui.mode];
  if (!r.width || !r.height) return;
  const b = ui.mode === 'plan' ? planBounds() : elevBounds();
  const padX = Math.min(70, r.width * 0.12), padY = Math.min(90, r.height * 0.16);
  v.s = clamp(Math.min((r.width - 2 * padX) / b.w, (r.height - 2 * padY) / b.h), 0.05, 20);
  v.x = b.x - (r.width / v.s - b.w) / 2;
  v.y = b.y - (r.height / v.s - b.h) / 2;
  v.fitted = true;
}

let raf = 0;
function render() { if (!raf) raf = requestAnimationFrame(draw); }
function draw() {
  raf = 0;
  const r = svg.getBoundingClientRect(), v = views[ui.mode], T = theme();
  if (!r.width) return;
  if (!v.fitted) fit();
  const ease = easeStep(), restore = shiftAnims(ease);
  const o = { T, interactive: true, vp: { x: v.x, y: v.y, w: r.width / v.s, h: r.height / v.s } };
  svg.innerHTML = `<rect width="100%" height="100%" fill="${T.bg}"/>` +
    `<g transform="translate(${f(-v.x * v.s)} ${f(-v.y * v.s)}) scale(${v.s})">${ui.mode === 'plan' ? renderPlan(v.s, o) : renderElev(v.s, o)}</g>` + remoteCursors(v, ease);
  for (const [c, obj, vals] of restore) setAnimVals(c, obj, vals);
  if (co.moving) render();
}
function exportSvg() {
  const b = ui.mode === 'plan' ? planBounds() : elevBounds();
  const s = clamp(1800 / b.w, 1, 6), m = 80 / s;
  const vb = { x: b.x - m, y: b.y - m, w: b.w + 2 * m, h: b.h + 2 * m };
  const o = { T: THEMES.light, interactive: false, vp: vb };
  const w = Math.round(vb.w * s), h = Math.round(vb.h * s);
  return { w, h, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${f(vb.x)} ${f(vb.y)} ${f(vb.w)} ${f(vb.h)}" font-family="system-ui, 'Segoe UI', Arial, sans-serif">` +
    `<rect x="${f(vb.x)}" y="${f(vb.y)}" width="${f(vb.w)}" height="${f(vb.h)}" fill="#fff"/>${ui.mode === 'plan' ? renderPlan(s, o) : renderElev(s, o)}</svg>` };
}

/* ---------- side panels and chrome ---------- */
function buildCatalog() {
  let h = `<details open><summary>Structure</summary>
    <button class="cat-item" data-act="addroom"><span class="sw"><i style="width:20px;height:15px;border-width:2px"></i></span><span class="nm">Room</span><span class="dm">4 &times; 3 m</span></button>
    <button class="cat-item" data-act="adddoor"><span class="sw"><i style="width:14px;height:20px;background:#e8dccb"></i></span><span class="nm">Door</span><span class="dm">90 &times; 205</span></button>
    <button class="cat-item" data-act="addwindow"><span class="sw"><i style="width:20px;height:16px;background:#d3e8f6"></i></span><span class="nm">Window</span><span class="dm">120 &times; 120</span></button>
  </details>`;
  CATALOG.forEach((g, gi) => {
    h += `<details ${g.group === 'Kitchen' || g.group === 'Living' ? 'open' : ''}><summary>${g.group}</summary>`;
    g.items.forEach((d, di) => {
      const k = 20 / Math.max(d.w, d.d);
      h += `<button class="cat-item" data-add="${gi},${di}" title="${d.w} wide, ${d.d} deep, ${d.h} high (cm)">` +
        `<span class="sw"><i style="width:${Math.max(3, d.w * k)}px;height:${Math.max(3, d.d * k)}px;background:${d.color}"></i></span>` +
        `<span class="nm">${d.name}</span><span class="dm">${d.w}&times;${d.d}</span></button>`;
    });
    h += '</details>';
  });
  $('#catalog').innerHTML = h;
}

const numField = (lbl, prop, val, extra = '') => `<label class="field"><span>${lbl}</span><input type="number" data-prop="${prop}" value="${f(val)}" step="1" ${extra}></label>`;
const textField = (lbl, prop, val) => `<label class="field wide"><span>${lbl}</span><input type="text" data-prop="${prop}" value="${esc(val)}"></label>`;

function buildPanel() {
  const s = ui.sel, obj = selected();
  let h = '';
  if (obj && s.kind === 'item') {
    h = `<h2>${esc(obj.name)}</h2><p class="sub">Furniture</p>` +
      (collisions().has(obj.id) ? '<p class="warn">Overlaps another item.</p>' : '') +
      textField('Name', 'name', obj.name) +
      '<h3>Size (cm)</h3>' + numField('Width', 'w', obj.w, 'min="1"') + numField('Depth', 'd', obj.d, 'min="1"') + numField('Height', 'h', obj.h, 'min="1"') +
      '<h3>Position</h3>' + numField('Above floor', 'z', obj.z, 'min="0"') + numField('Rotation (&deg;)', 'rot', obj.rot, 'step="5"') +
      `<h3>Look</h3><label class="field"><span>Colour</span><input type="color" data-prop="color" value="${obj.color}"></label>` +
      `<div class="btns"><button data-act="rotate">Rotate 90&deg;</button><button data-act="duplicate">Duplicate</button>` +
      (ui.mode === 'plan' ? '<button data-act="mode-wall">Front view</button>' : '') +
      `<button class="danger" data-act="delete">Delete</button></div>`;
  } else if (obj && s.kind === 'opening') {
    const room = state.rooms.find(r => r.id === obj.roomId), W = wallInfo(room, obj.wall);
    h = `<h2>${obj.type === 'door' ? 'Door' : 'Window'}</h2><p class="sub">${esc(room.name)} &middot; Wall ${obj.wall + 1}</p>` +
      numField('Width', 'width', obj.width, 'min="10"') + numField('Height', 'height', obj.height, 'min="10"') +
      (obj.type === 'window' ? numField('Sill height', 'sill', obj.sill, 'min="0"') : '') +
      numField('From left corner', 'left', openingX(obj, W), 'min="0"') +
      (obj.type === 'door' ? `<label class="field"><span>Hinge on other side</span><input type="checkbox" data-prop="flip" ${obj.flip ? 'checked' : ''}></label>` : '') +
      '<p class="sub">"Left" is as seen from inside the room.</p>' +
      `<div class="btns">${ui.mode === 'plan' ? '<button class="primary" data-act="mode-wall">Front view</button>' : ''}<button class="danger" data-act="delete">Delete</button></div>`;
  } else if (obj && s.kind === 'wall') {
    const W = wallInfo(obj, s.i);
    h = `<h2>Wall ${s.i + 1}</h2><p class="sub">${esc(obj.name)}</p>` +
      numField('Length (cm)', 'length', W.L, 'min="10"') +
      `<div class="btns"><button class="primary" data-act="mode-wall">Open front view</button></div>` +
      `<div class="btns"><button data-act="adddoor">Add door</button><button data-act="addwindow">Add window</button><button data-act="split">Add corner</button><button data-act="selroom">Select room</button></div>` +
      '<ul class="help"><li>Drag the wall to push it in or out.</li><li>Double-click it to open its front view.</li></ul>';
  } else if (obj && s.kind === 'room') {
    let per = 0;
    obj.points.forEach((_, i) => { per += wallInfo(obj, i).L; });
    h = `<h2>${esc(obj.name)}</h2><p class="sub">Room</p>` + textField('Name', 'name', obj.name) +
      numField('Ceiling height', 'height', obj.height, 'min="50"') +
      `<label class="field"><span>Floor colour</span><input type="color" data-prop="floor" value="${obj.floor || '#ffffff'}"></label>` +
      `<div class="stat"><span>Area</span><span>${(Math.abs(signedArea(obj.points)) / 1e4).toFixed(2)} m&sup2;</span></div>` +
      `<div class="stat"><span>Perimeter</span><span>${fmt(per)}</span></div>` +
      `<div class="btns"><button class="danger" data-act="delete">Delete room</button></div>` +
      '<ul class="help"><li>Drag a corner to reshape the room.</li><li>Double-click a corner to remove it.</li><li>Select a wall and use <em>Add corner</em> for L-shapes.</li><li>Drag the blue handle to move the room with its furniture.</li></ul>';
  } else if (ui.mode === 'wall') {
    const aw = activeWall();
    h = '<h2>Wall view</h2>' + (aw
      ? `<p class="sub">${esc(aw.room.name)} &middot; Wall ${aw.i + 1}</p>` +
        `<div class="stat"><span>Length</span><span>${fmt(aw.W.L)}</span></div><div class="stat"><span>Ceiling height</span><span>${fmt(aw.room.height)}</span></div>` +
        `<div class="stat"><span>Items shown</span><span>${elevItems(aw.W).length}</span></div>` +
        `<div class="btns"><button data-act="adddoor">Add door</button><button data-act="addwindow">Add window</button></div>`
      : '<p class="sub">No room yet.</p>') +
      '<ul class="help"><li>Click a catalog item: it is placed against this wall in the next free spot.</li><li>Drag left/right to slide along the wall, up/down to change the mounting height.</li><li>Hold <kbd>Ctrl</kbd> to keep the height, <kbd>Shift</kbd> to place freely without snapping.</li><li>Edges snap to neighbours, the floor and the ceiling.</li><li>Everything you move here moves in the floor plan too.</li></ul>';
  } else {
    let total = 0;
    h = '<h2>Plan</h2><p class="sub">Saved automatically in this browser.</p>';
    for (const r of state.rooms) {
      const a = Math.abs(signedArea(r.points)) / 1e4; total += a;
      h += `<div class="stat"><span>${esc(r.name)}</span><span>${a.toFixed(2)} m&sup2;</span></div>`;
    }
    h += `<div class="stat"><span><b>Total</b></span><span><b>${total.toFixed(2)} m&sup2;</b></span></div>` +
      `<div class="stat"><span>Furniture</span><span>${state.items.length} items</span></div>` +
      '<h3>Settings</h3>' + numField('Grid size (cm)', 'grid', state.settings.grid, 'min="1" max="200"') +
      `<label class="field"><span>Wall thickness</span><input type="checkbox" data-prop="thick" ${state.settings.thick ? 'checked' : ''}></label>` +
      (state.settings.thick ? numField('Thickness (cm)', 'wallT', state.settings.wallT, 'min="1" max="100"') : '') +
      '<h3>How to</h3><ul class="help"><li>Click a catalog entry to add it.</li><li>Click a room to reshape it, a wall to edit it.</li>' +
      '<li><b>Double-click a wall</b> to plan it in front view.</li><li>Drag empty space to pan, scroll to zoom.</li>' +
      '<li><kbd>R</kbd> rotate &middot; <kbd>Ctrl</kbd>+<kbd>D</kbd> duplicate &middot; <kbd>Del</kbd> delete &middot; arrows nudge</li><li>Hold <kbd>Shift</kbd> while dragging to ignore snapping.</li></ul>';
  }
  $('#panel').innerHTML = h;
}

function buildMinimap() {
  const el = $('#minimap'), aw = ui.mode === 'wall' && activeWall();
  el.toggleAttribute('hidden', !aw);
  if (!aw) return;
  const T = theme(), pts = aw.room.points, xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  const x0 = Math.min(...xs), y0 = Math.min(...ys), w = Math.max(...xs) - x0, hgt = Math.max(...ys) - y0, k = Math.max(w, hgt) / 30, pad = k * 4;
  el.setAttribute('viewBox', `${f(x0 - pad)} ${f(y0 - pad)} ${f(w + 2 * pad)} ${f(hgt + 2 * pad)}`);
  let h = `<polygon points="${pts.map(p => f(p.x) + ',' + f(p.y)).join(' ')}" fill="${T.floor}"/>`;
  pts.forEach((p, i) => {
    const q = pts[(i + 1) % pts.length];
    h += `<line data-mini="${i}" x1="${f(p.x)}" y1="${f(p.y)}" x2="${f(q.x)}" y2="${f(q.y)}" stroke="${i === aw.i ? T.accent : T.wall}" stroke-width="${f(i === aw.i ? k * 2.2 : k * 1.2)}" stroke-linecap="round"><title>Wall ${i + 1}</title></line>`;
  });
  // Arrow from inside the room towards the wall being viewed.
  const W = aw.W, m = { x: (W.A.x + W.B.x) / 2, y: (W.A.y + W.B.y) / 2 }, d = Math.min(k * 9, Math.max(w, hgt) / 3);
  const a = { x: m.x + W.n.x * d, y: m.y + W.n.y * d }, b = { x: m.x + W.n.x * k * 3, y: m.y + W.n.y * k * 3 };
  h += `<line x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}" stroke="${T.accent}" stroke-width="${f(k * 0.8)}"/>` +
    `<circle cx="${f(a.x)}" cy="${f(a.y)}" r="${f(k * 1.6)}" fill="${T.accent}"/>` +
    `<polygon points="${f(b.x - W.n.x * k * 1.5)},${f(b.y - W.n.y * k * 1.5)} ${f(b.x + W.u.x * k * 1.6 + W.n.x * k * 1.5)},${f(b.y + W.u.y * k * 1.6 + W.n.y * k * 1.5)} ${f(b.x - W.u.x * k * 1.6 + W.n.x * k * 1.5)},${f(b.y - W.u.y * k * 1.6 + W.n.y * k * 1.5)}" fill="${T.accent}"/>`;
  el.innerHTML = h;
}

const HINTS = {
  item: 'Drag to move · round handle rotates · square handle resizes · dashed lines show the distance to the walls',
  room: 'Drag a corner to reshape · double-click a corner to remove it · drag the blue handle to move the room',
  wall: 'Drag the wall to move it · double-click to plan it in front view',
  opening: 'Drag along the wall to reposition',
  plan: 'Drag to pan · scroll to zoom · click a room or wall to edit · double-click a wall for its front view',
  wallmode: 'Drag items along the wall, or up and down to change their height · Ctrl keeps the height · Shift ignores snapping',
  measure: 'Drag on the plan to measure a distance · Ctrl keeps it straight · Esc to finish'
};
function syncUi() {
  const wallMode = ui.mode === 'wall';
  $('#tabPlan').classList.toggle('active', !wallMode);
  $('#tabWall').classList.toggle('active', wallMode);
  $('#btnSnap').setAttribute('aria-pressed', !!state.settings.snap);
  $('#btnMeasure').setAttribute('aria-pressed', ui.measuring);
  $('#btnMeasure').disabled = wallMode;
  $('#btnUndo').disabled = hIndex <= 0;
  $('#btnRedo').disabled = hIndex >= history.length - 1;
  svg.classList.toggle('measuring', ui.measuring && !wallMode);
  $('#wallbar').hidden = !wallMode;
  if (wallMode) {
    const aw = activeWall();
    $('#wallSelect').innerHTML = allWalls().map(w => `<option value="${w.room.id}:${w.i}" ${aw && aw.room === w.room && aw.i === w.i ? 'selected' : ''}>${esc(w.room.name)} · Wall ${w.i + 1} (${fmt(wallInfo(w.room, w.i).L)})</option>`).join('');
    $('#depth').value = ui.depth;
  }
  $('#hint').textContent = ui.measuring && !wallMode ? HINTS.measure : wallMode ? HINTS.wallmode : (selected() && HINTS[ui.sel.kind]) || HINTS.plan;
  buildPanel();
  buildMinimap();
  syncCollabButton();
}
function refresh() { syncUi(); render(); }

let toastTimer = 0;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
}

/* ---------- property edits ---------- */
function applyProp(prop, el) {
  const s = ui.sel, obj = selected();
  const val = el.type === 'checkbox' ? el.checked : el.type === 'number' ? parseFloat(el.value) : el.value;
  if (el.type === 'number' && !Number.isFinite(val)) return refresh();
  if (!obj) {
    if (prop === 'grid') state.settings.grid = clamp(val, 1, 200);
    else if (prop === 'thick') state.settings.thick = val;
    else if (prop === 'wallT') state.settings.wallT = clamp(val, 1, 100);
  } else if (s.kind === 'item') {
    if (prop === 'name') obj.name = val.trim() || 'Item';
    else if (prop === 'color') obj.color = val;
    else if (prop === 'rot') obj.rot = val;
    else if (prop === 'z') obj.z = Math.max(0, val);
    else obj[prop] = Math.max(1, val);
  } else if (s.kind === 'opening') {
    const room = state.rooms.find(r => r.id === obj.roomId);
    if (prop === 'left') {
      const W = wallInfo(room, obj.wall);
      obj.offset = W.s > 0 ? val : W.L - val - obj.width;
    } else if (prop === 'flip') obj.flip = val;
    else obj[prop] = Math.max(prop === 'sill' ? 0 : 10, val);
  } else if (s.kind === 'room') {
    if (prop === 'name') obj.name = val.trim() || 'Room';
    else if (prop === 'height') obj.height = clamp(val, 50, 1000);
    else if (prop === 'floor') obj.floor = val;
  } else if (s.kind === 'wall' && prop === 'length') {
    setWallLength(obj, s.i, Math.max(10, val));
    views.plan.fitted = false;
  }
  commit(); refresh();
}

function copyText(text, done) {
  (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(() => toast(done), () => window.prompt('Copy this:', text));
}
function download(name, blob) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function zoomBy(k, cx, cy) {
  const r = svg.getBoundingClientRect(), v = views[ui.mode];
  if (cx === undefined) { cx = r.width / 2; cy = r.height / 2; }
  const wx = v.x + cx / v.s, wy = v.y + cy / v.s;
  v.s = clamp(v.s * k, 0.05, 20);
  v.x = wx - cx / v.s; v.y = wy - cy / v.s;
  render();
}
function stepWall(dir) {
  const walls = allWalls(), aw = activeWall();
  if (!aw) return;
  const k = walls.findIndex(w => w.room === aw.room && w.i === aw.i);
  const w = walls[(k + dir + walls.length) % walls.length];
  openWall(w.room.id, w.i);
}

function act(name) {
  const s = ui.sel, obj = selected();
  switch (name) {
    case 'mode-plan': ui.mode = 'plan'; save(); refresh(); break;
    case 'mode-wall': {
      let w = null;
      if (obj && s.kind === 'wall') w = { room: obj, i: s.i };
      else if (obj && s.kind === 'room') w = { room: obj, i: 0 };
      else if (obj && s.kind === 'opening') w = { room: state.rooms.find(r => r.id === obj.roomId), i: obj.wall };
      else if (obj && s.kind === 'item') w = wallNearItem(obj);
      if (!w) w = activeWall();
      if (!w) return toast('Add a room first.');
      if (s && s.kind !== 'item' && s.kind !== 'opening') ui.sel = null;
      openWall(w.room.id, w.i);
      break;
    }
    case 'undo': timeTravel(-1); break;
    case 'redo': timeTravel(1); break;
    case 'snap': state.settings.snap = !state.settings.snap; commit(); refresh(); break;
    case 'measure': ui.measuring = !ui.measuring; ui.measure = null; refresh(); break;
    case 'fit': fit(); render(); break;
    case 'zoomin': zoomBy(1.25); break;
    case 'zoomout': zoomBy(0.8); break;
    case 'prevwall': stepWall(-1); break;
    case 'nextwall': stepWall(1); break;
    case 'addroom': addRoom(); break;
    case 'adddoor': addOpening('door'); break;
    case 'addwindow': addOpening('window'); break;
    case 'rotate': rotateSelection(90); break;
    case 'duplicate': duplicateSelection(); break;
    case 'delete': deleteSelection(); break;
    case 'split': if (obj && s.kind === 'wall') { splitWall(obj, s.i); ui.sel = { kind: 'room', id: obj.id }; commit(); refresh(); } break;
    case 'selroom': if (obj) select({ kind: 'room', id: obj.id }); break;
    case 'new':
    case 'demo': {
      const next = name === 'demo' ? demo() : blank();
      if (name === 'new') next.rooms.push({ id: uid(), name: 'Room 1', height: 250, points: [{ x: 0, y: 0 }, { x: 400, y: 0 }, { x: 400, y: 300 }, { x: 0, y: 300 }] });
      state = next; ui.sel = null; ui.mode = 'plan'; ui.wall = { roomId: null, i: 0 };
      views.plan.fitted = views.wall.fitted = false;
      commit(); refresh();
      toast(name === 'demo' ? 'Example loaded. Undo brings your plan back.' : 'New plan. Undo brings the old one back.');
      break;
    }
    case 'save': download('room-plan.json', new Blob([JSON.stringify(snapshot(), null, 1)], { type: 'application/json' })); break;
    case 'open': $('#file').click(); break;
    case 'share': {
      copyText(location.href.split('#')[0] + '#p=' + b64encode(JSON.stringify(snapshot())), 'Share link copied. The whole plan is inside the link.');
      break;
    }
    case 'png': {
      const ex = exportSvg(), img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = ex.w; c.height = ex.h;
        c.getContext('2d').drawImage(img, 0, 0);
        c.toBlob(b => download(ui.mode === 'plan' ? 'floor-plan.png' : 'wall-view.png', b), 'image/png');
      };
      img.onerror = () => toast('Image export failed in this browser.');
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(ex.svg);
      break;
    }
    case 'print': $('#print').innerHTML = exportSvg().svg; window.print(); break;
    case 'collab': openCollab(); break;
    case 'co-host': coStart('host'); break;
    case 'co-join': coStart('guest'); break;
    case 'co-leave': leaveSession(); break;
    case 'co-close': $('#collab').close(); break;
    case 'co-copy': copyText(showCode(co.code), 'Project code copied.'); break;
    case 'co-link': copyText(location.href.split('#')[0] + '#join=' + co.code, 'Invite link copied.'); break;
    case 'theme': {
      const dark = theme() === THEMES.dark;
      document.documentElement.dataset.theme = dark ? 'light' : 'dark';
      try { localStorage.setItem(STORAGE_KEY + '.theme', dark ? 'light' : 'dark'); } catch (e) { /* ignore */ }
      refresh();
      break;
    }
  }
}

/* ---------- pointer interaction ---------- */
const ptrs = new Map();
let drag = null, pinch = null, lastDown = { t: 0, x: 0, y: 0, kind: '' }, spaceDown = false;

function toWorld(e) {
  const r = svg.getBoundingClientRect(), v = views[ui.mode];
  return { x: (e.clientX - r.left) / v.s + v.x, y: (e.clientY - r.top) / v.s + v.y };
}
const gridSnap = (v, on) => on ? Math.round(v / state.settings.grid) * state.settings.grid : Math.round(v);

svg.addEventListener('pointerdown', e => {
  svg.setPointerCapture(e.pointerId);
  ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  const v = views[ui.mode];
  if (ptrs.size === 2) {
    if (drag && drag.moved && drag.type !== 'pan') { revert(); syncUi(); }
    drag = null;
    const [a, b] = [...ptrs.values()], r = svg.getBoundingClientRect();
    const cx = (a.x + b.x) / 2 - r.left, cy = (a.y + b.y) / 2 - r.top;
    pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, s: v.s, wx: v.x + cx / v.s, wy: v.y + cy / v.s };
    return;
  }
  const pt = toWorld(e), el = e.target.closest('[data-kind]'), kind = el ? el.dataset.kind : '';
  const now = performance.now();
  const dbl = now - lastDown.t < 400 && Math.hypot(e.clientX - lastDown.x, e.clientY - lastDown.y) < 8 && lastDown.kind === kind;
  lastDown = { t: dbl ? 0 : now, x: e.clientX, y: e.clientY, kind };
  const base = { sx: e.clientX, sy: e.clientY, start: pt, moved: false, vx: v.x, vy: v.y };

  if (e.button === 1 || e.button === 2 || spaceDown) { drag = Object.assign(base, { type: 'pan' }); return; }
  if (ui.measuring && ui.mode === 'plan') {
    const on = state.settings.snap && !e.altKey && !e.shiftKey, p = { x: gridSnap(pt.x, on), y: gridSnap(pt.y, on) };
    ui.measure = { a: p, b: p };
    drag = Object.assign(base, { type: 'measure', moved: true });
    render();
    return;
  }
  const id = el && (el.dataset.id || (el.closest('[data-id]') || {}).dataset?.id);
  switch (kind) {
    case 'item': {
      const it = state.items.find(i => i.id === id);
      select({ kind: 'item', id });
      drag = Object.assign(base, { type: 'item', it, x0: it.x, y0: it.y });
      break;
    }
    case 'eitem': {
      const it = state.items.find(i => i.id === id), aw = activeWall();
      select({ kind: 'item', id });
      const xs = [0, aw.W.L], zs = [0, aw.room.height];
      for (const o of elevItems(aw.W)) if (o.it !== it) { xs.push(o.x, o.x + o.w); zs.push(o.it.z, o.it.z + o.it.h); }
      for (const o of state.openings) if (o.roomId === aw.room.id && o.wall === aw.i) { const x = openingX(o, aw.W); xs.push(x, x + o.width); }
      drag = Object.assign(base, { type: 'eitem', it, W: aw.W, p0: projectItem(it, aw.W), x0: it.x, y0: it.y, z0: it.z, xs, zs });
      break;
    }
    case 'opening':
    case 'eopening': {
      const o = state.openings.find(x => x.id === id), room = state.rooms.find(r => r.id === o.roomId), W = wallInfo(room, o.wall);
      select({ kind: 'opening', id });
      drag = Object.assign(base, { type: kind, o, W, room, off0: o.offset, sill0: o.sill, grab: dot(sub(pt, W.A), W.u) - o.offset });
      break;
    }
    case 'rot':
    case 'resize': {
      const it = selected(), r = it.rot * Math.PI / 180, c = Math.cos(r), sn = Math.sin(r);
      drag = Object.assign(base, { type: kind, it, anchor: { x: it.x + (-it.w / 2) * c - (-it.d / 2) * sn, y: it.y + (-it.w / 2) * sn + (-it.d / 2) * c } });
      break;
    }
    case 'corner': {
      const room = selected(), i = +el.dataset.i;
      if (dbl) { deleteCorner(room, i); commit(); refresh(); break; }
      drag = Object.assign(base, { type: 'corner', room, i });
      break;
    }
    case 'roommove': {
      const room = selected();
      drag = Object.assign(base, { type: 'room', room, pts: room.points.map(p => ({ x: p.x, y: p.y })),
        inside: state.items.filter(it => pointInPoly(it, room.points)).map(it => ({ it, x: it.x, y: it.y })) });
      break;
    }
    case 'wall': {
      const room = state.rooms.find(r => r.id === id), i = +el.dataset.i;
      if (dbl) { ui.sel = null; openWall(id, i); break; }
      select({ kind: 'wall', id, i });
      const W = wallInfo(room, i);
      drag = Object.assign(base, { type: 'wall', room, i, W, a0: { x: W.A.x, y: W.A.y }, b0: { x: W.B.x, y: W.B.y } });
      break;
    }
    case 'room':
      drag = Object.assign(base, { type: 'pan', click: () => select({ kind: 'room', id }) });
      break;
    default:
      drag = Object.assign(base, { type: 'pan', click: () => { ui.measure = null; select(null); } });
  }
});

svg.addEventListener('pointermove', e => {
  if (ptrs.has(e.pointerId)) ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  const v = views[ui.mode];
  if (pinch && ptrs.size === 2) {
    const [a, b] = [...ptrs.values()], r = svg.getBoundingClientRect();
    const cx = (a.x + b.x) / 2 - r.left, cy = (a.y + b.y) / 2 - r.top;
    v.s = clamp(pinch.s * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d, 0.05, 20);
    v.x = pinch.wx - cx / v.s; v.y = pinch.wy - cy / v.s;
    render();
    return;
  }
  const pt = toWorld(e);
  sendCursor(pt);
  $('#coords').textContent = ui.mode === 'plan'
    ? `x ${Math.round(pt.x)}  y ${Math.round(pt.y)} cm  ·  ${Math.round(v.s * 100)}%`
    : `${Math.round(pt.x)} cm along  ·  ${Math.round(-pt.y)} cm high  ·  ${Math.round(v.s * 100)}%`;
  const d = drag;
  if (!d) return;
  if (!d.moved) {
    if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 4) return;
    d.moved = true;
  }
  const dx = pt.x - d.start.x, dy = pt.y - d.start.y, on = state.settings.snap && !e.altKey && !e.shiftKey;
  switch (d.type) {
    case 'pan':
      v.x = d.vx - (e.clientX - d.sx) / v.s;
      v.y = d.vy - (e.clientY - d.sy) / v.s;
      break;
    case 'measure': {
      let b = { x: gridSnap(pt.x, on), y: gridSnap(pt.y, on) };
      if (e.ctrlKey) { if (Math.abs(b.x - ui.measure.a.x) > Math.abs(b.y - ui.measure.a.y)) b.y = ui.measure.a.y; else b.x = ui.measure.a.x; }
      ui.measure.b = b;
      break;
    }
    case 'item':
      d.it.x = d.x0 + dx; d.it.y = d.y0 + dy;
      if (on) snapItem(d.it);
      break;
    case 'eitem': {
      const thr = 8 / v.s;
      let ex = d.p0.x + dx, ez = d.z0 + (e.ctrlKey ? 0 : -dy);
      if (on) {
        ex = snapEdges(Math.round(ex), d.p0.w, d.xs, thr);
        ez = snapEdges(Math.round(ez), d.it.h, d.zs, thr);
      }
      if (ez < (on ? thr : 0)) ez = 0;
      const k = (ex - d.p0.x) * d.W.s;
      d.it.x = d.x0 + d.W.u.x * k; d.it.y = d.y0 + d.W.u.y * k; d.it.z = ez;
      break;
    }
    case 'opening': {
      const step = on ? 5 : 1;
      d.o.offset = clamp(Math.round((dot(sub(pt, d.W.A), d.W.u) - d.grab) / step) * step, 0, d.W.L - d.o.width);
      break;
    }
    case 'eopening': {
      const step = on ? 5 : 1;
      d.o.offset = clamp(Math.round((d.off0 + dx * d.W.s) / step) * step, 0, d.W.L - d.o.width);
      if (d.o.type === 'window' && !e.ctrlKey) d.o.sill = clamp(Math.round((d.sill0 - dy) / step) * step, 0, d.room.height - d.o.height);
      break;
    }
    case 'rot': {
      let a = Math.atan2(pt.y - d.it.y, pt.x - d.it.x) * 180 / Math.PI + 90;
      if (on) a = Math.round(a / 15) * 15;
      d.it.rot = ((a % 360) + 360) % 360;
      break;
    }
    case 'resize': {
      const r = d.it.rot * Math.PI / 180, c = Math.cos(r), sn = Math.sin(r), q = sub(pt, d.anchor), step = on ? 5 : 1;
      const w = Math.max(5, Math.round((q.x * c + q.y * sn) / step) * step), dp = Math.max(5, Math.round((-q.x * sn + q.y * c) / step) * step);
      d.it.w = w; d.it.d = dp;
      d.it.x = d.anchor.x + (w / 2) * c - (dp / 2) * sn;
      d.it.y = d.anchor.y + (w / 2) * sn + (dp / 2) * c;
      break;
    }
    case 'corner':
      d.room.points[d.i].x = gridSnap(pt.x, on);
      d.room.points[d.i].y = gridSnap(pt.y, on);
      break;
    case 'room': {
      const mx = gridSnap(dx, on), my = gridSnap(dy, on);
      d.room.points.forEach((p, i) => { p.x = d.pts[i].x + mx; p.y = d.pts[i].y + my; });
      for (const m of d.inside) { m.it.x = m.x + mx; m.it.y = m.y + my; }
      break;
    }
    case 'wall': {
      const k = gridSnap(dot({ x: dx, y: dy }, d.W.n), on), n = d.room.points.length;
      const A = d.room.points[d.i], B = d.room.points[(d.i + 1) % n];
      A.x = d.a0.x + d.W.n.x * k; A.y = d.a0.y + d.W.n.y * k;
      B.x = d.b0.x + d.W.n.x * k; B.y = d.b0.y + d.W.n.y * k;
      break;
    }
  }
  if (d.type !== 'pan' && d.type !== 'measure') pushLive();
  render();
});

function endPointer(e) {
  ptrs.delete(e.pointerId);
  if (ptrs.size < 2) pinch = null;
  const d = drag;
  if (!d) return;
  drag = null;
  if (!d.moved) { if (d.click) d.click(); return; }
  if (d.type === 'pan' || d.type === 'measure') return;
  commit(); refresh();
}
svg.addEventListener('pointerup', endPointer);
svg.addEventListener('pointerleave', () => sendCursor(null));
svg.addEventListener('pointercancel', endPointer);
svg.addEventListener('contextmenu', e => e.preventDefault());
svg.addEventListener('wheel', e => {
  e.preventDefault();
  const r = svg.getBoundingClientRect();
  zoomBy(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), e.clientX - r.left, e.clientY - r.top);
}, { passive: false });

/* ---------- other events ---------- */
document.addEventListener('click', e => {
  const menu = $('.menu');
  if (menu.open && (!menu.contains(e.target) || e.target.closest('.menu-list button'))) menu.open = false;
  const add = e.target.closest('[data-add]');
  if (add) { const [g, i] = add.dataset.add.split(','); addItem(CATALOG[g].items[i]); return; }
  const btn = e.target.closest('[data-act]');
  if (btn) { act(btn.dataset.act); return; }
  const mini = e.target.closest('[data-mini]');
  if (mini) openWall(ui.wall.roomId, +mini.dataset.mini);
});
$('#panel').addEventListener('change', e => {
  const el = e.target.closest('[data-prop]');
  if (el) applyProp(el.dataset.prop, el);
});
$('#wallSelect').addEventListener('change', e => {
  const [roomId, i] = e.target.value.split(':');
  openWall(roomId, +i);
});
$('#depth').addEventListener('change', e => {
  ui.depth = Math.max(0, parseFloat(e.target.value) || 0);
  save(); refresh();
});
$('#file').addEventListener('change', async e => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try {
    adopt(JSON.parse(await file.text()));
    commit(); refresh();
    toast('Plan loaded.');
  } catch (err) {
    revert();
    toast('That file is not a Room Planner plan.');
  }
});

document.addEventListener('keydown', e => {
  if (e.target.closest('input, select, textarea')) return;
  const k = e.key.toLowerCase(), mod = e.ctrlKey || e.metaKey, it = ui.sel && ui.sel.kind === 'item' ? selected() : null;
  if (k === ' ') { spaceDown = true; e.preventDefault(); }
  else if (mod && k === 'z') { e.preventDefault(); timeTravel(e.shiftKey ? 1 : -1); }
  else if (mod && k === 'y') { e.preventDefault(); timeTravel(1); }
  else if (mod && k === 'd') { e.preventDefault(); duplicateSelection(); }
  else if (mod) return;
  else if (k === 'delete' || k === 'backspace') { e.preventDefault(); deleteSelection(); }
  else if (k === 'escape') { ui.measuring = false; ui.measure = null; select(null); }
  else if (k === 'r') rotateSelection(e.shiftKey ? 15 : 90);
  else if (k === 'm') act('measure');
  else if (k === 'f') act('fit');
  else if (k === '+' || k === '=') zoomBy(1.25);
  else if (k === '-') zoomBy(0.8);
  else if (k.startsWith('arrow') && it) {
    e.preventDefault();
    const step = e.shiftKey ? 10 : 1, ax = k === 'arrowleft' ? -1 : k === 'arrowright' ? 1 : 0, ay = k === 'arrowup' ? -1 : k === 'arrowdown' ? 1 : 0;
    const aw = ui.mode === 'wall' && activeWall();
    if (aw) {
      it.x += aw.W.u.x * aw.W.s * ax * step; it.y += aw.W.u.y * aw.W.s * ax * step;
      it.z = Math.max(0, it.z - ay * step);
    } else { it.x += ax * step; it.y += ay * step; }
    commit(); refresh();
  }
});
document.addEventListener('keyup', e => { if (e.key === ' ') spaceDown = false; });
new ResizeObserver(render).observe(svg);
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', refresh);

/* ---------- working together (peer-to-peer via PeerJS) ---------- */
// One browser hosts the session under a project code; the others connect to it and it relays
// their changes. Edits travel as per-object patches, so people can move different things at once.
const PEER_LIB = 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';
const PEER_PREFIX = 'roomplanner-v1-';
const PEER_COLORS = ['#e5484d', '#0091ff', '#30a46c', '#f76b15', '#8e4ec6', '#d6409f', '#12a594', '#ad7f00'];
const SESSION_KEY = STORAGE_KEY + '.session';
const COLS = ['rooms', 'items', 'openings'];
const co = { role: null, status: '', code: '', peer: null, host: null, conns: new Map(), peers: new Map(),
  me: { id: '', name: '', color: PEER_COLORS[0] }, synced: null, attempt: 0, timer: 0, colorN: 1, lastCur: 0, lastLive: 0, liveDirty: false, anims: new Map(), animT: 0, moving: false };

function normCode(s) { return String(s).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6); }
function showCode(c) { return c.slice(0, 3) + '-' + c.slice(3); }
function newCode() {
  const abc = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let c = '';
  for (const b of crypto.getRandomValues(new Uint8Array(6))) c += abc[b % abc.length];
  return c;
}
function loadPeerLib() {
  if (window.Peer) return Promise.resolve();
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = PEER_LIB;
    s.onload = res;
    s.onerror = () => { s.remove(); rej(new Error('Could not load the connection library. Are you online?')); };
    document.head.appendChild(s);
  });
}

// co.synced remembers every object as the other side last saw it; a patch is whatever differs from that.
function markSynced() {
  co.synced = { settings: JSON.stringify(state.settings) };
  for (const c of COLS) co.synced[c] = new Map(state[c].map(o => [o.id, JSON.stringify(o)]));
}
function makePatch() {
  const p = { t: 'patch', up: {}, del: {} };
  let any = false;
  for (const c of COLS) {
    const seen = new Set(), m = co.synced[c];
    for (const o of state[c]) {
      seen.add(o.id);
      const js = JSON.stringify(o);
      if (m.get(o.id) !== js) { m.set(o.id, js); (p.up[c] = p.up[c] || []).push(js); any = true; }
    }
    for (const id of [...m.keys()]) if (!seen.has(id)) { m.delete(id); (p.del[c] = p.del[c] || []).push(id); any = true; }
  }
  const sj = JSON.stringify(state.settings);
  if (sj !== co.synced.settings) { co.synced.settings = sj; p.settings = sj; any = true; }
  return any ? p : null;
}
function applyPatch(p) {
  try {
    for (const c of COLS) {
      for (const js of (p.up && p.up[c]) || []) {
        const o = sanitize({ [c]: [JSON.parse(js)] })[c][0];
        if (!o) continue;
        // Update in place so an object someone here is dragging keeps its identity.
        const cur = state[c].find(x => x.id === o.id);
        if (cur) {
          const was = animVals(c, cur);
          for (const k of Object.keys(cur)) if (!(k in o)) delete cur[k];
          Object.assign(cur, o);
          glide(c, cur, was);
        } else state[c].push(o);
        co.synced[c].set(o.id, JSON.stringify(cur || o));
      }
      for (const id of (p.del && p.del[c]) || []) {
        state[c] = state[c].filter(x => x.id !== id);
        co.synced[c].delete(id);
      }
    }
    if (p.settings) {
      state.settings = sanitize({ settings: JSON.parse(p.settings) }).settings;
      co.synced.settings = JSON.stringify(state.settings);
    }
  } catch (e) { /* ignore a malformed patch */ }
  state.openings = state.openings.filter(o => {
    const room = state.rooms.find(r => r.id === o.roomId);
    return room && o.wall < room.points.length;
  });
}
function afterRemote(live) {
  if (ui.sel && !selected()) ui.sel = null;
  // Patches sent mid-drag only need a redraw; the closing patch does the bookkeeping.
  if (!live && (!drag || drag.type === 'pan' || drag.type === 'measure')) {
    history[hIndex] = JSON.stringify(state);
    save();
    if ($('#panel').contains(document.activeElement)) buildMinimap(); else syncUi();
  }
  render();
}

function sendAll(msg, except) {
  if (co.role === 'host') {
    for (const [id, c] of co.conns) if (id !== except && c.open) c.send(msg);
  } else if (co.host && co.host.open) co.host.send(msg);
}
function pushChanges(live) {
  if (!co.role || !co.synced) return;
  let p = makePatch();
  if (live) {
    if (!p) return;
    p.live = 1;
    co.liveDirty = true;
  } else {
    if (!p && co.liveDirty) p = { t: 'patch', up: {}, del: {} };
    co.liveDirty = false;
  }
  if (p) sendAll(p);
}
function pushLive() {
  const now = performance.now();
  if (now - co.lastLive < 40) return;
  co.lastLive = now;
  pushChanges(true);
}

// Remote changes arrive a few dozen times a second. Rather than jumping, objects and cursors are
// drawn with an offset from their true position that decays every frame.
function animVals(c, o) {
  return c === 'rooms' ? o.points.flatMap(q => [q.x, q.y]) : c === 'items' ? [o.x, o.y, o.z] : [o.offset, o.sill];
}
function setAnimVals(c, o, v) {
  if (c === 'rooms') o.points.forEach((q, i) => { q.x = v[2 * i]; q.y = v[2 * i + 1]; });
  else if (c === 'items') { o.x = v[0]; o.y = v[1]; o.z = v[2]; }
  else { o.offset = v[0]; o.sill = v[1]; }
}
function glide(c, o, was) {
  const key = c + ':' + o.id, now = animVals(c, o), old = co.anims.get(key);
  co.anims.delete(key);
  if (was.length !== now.length || (drag && (drag.it === o || drag.o === o || drag.room === o))) return;
  const d = now.map((v, i) => was[i] - v + (old && old.d.length === now.length ? old.d[i] : 0));
  const far = Math.max(...d.map(Math.abs));
  if (far < 0.05 || far > 400) return;
  co.anims.set(key, { c, id: o.id, d });
}
function easeStep() {
  const now = performance.now(), dt = Math.min(100, now - co.animT || 16);
  co.animT = now;
  co.moving = false;
  return Math.exp(-dt / 55);
}
// Moves gliding objects to where they should be drawn; draw() puts the real values back afterwards.
function shiftAnims(k) {
  const restore = [];
  for (const [key, a] of co.anims) {
    const o = state[a.c].find(x => x.id === a.id), real = o && animVals(a.c, o);
    a.d = a.d.map(v => v * k);
    if (!o || real.length !== a.d.length || Math.max(...a.d.map(Math.abs)) < 0.2) { co.anims.delete(key); continue; }
    restore.push([a.c, o, real]);
    setAnimVals(a.c, o, real.map((v, i) => v + a.d[i]));
    co.moving = true;
  }
  return restore;
}
function sendCursor(pt) {
  if (co.status !== 'live') return;
  const now = performance.now();
  if (pt && now - co.lastCur < 33) return;
  co.lastCur = now;
  const msg = { t: 'cur', x: pt ? f(pt.x) : null, y: pt ? f(pt.y) : null, mode: ui.mode, wr: ui.wall.roomId, wi: ui.wall.i };
  if (co.role === 'host') msg.from = co.me.id;
  sendAll(msg);
}
function cleanCur(m) {
  const ok = Number.isFinite(m.x) && Number.isFinite(m.y);
  return { x: ok ? m.x : null, y: ok ? m.y : null, mode: m.mode === 'wall' ? 'wall' : 'plan', wr: String(m.wr), wi: m.wi | 0 };
}
function remoteCursors(v, k) {
  let h = '';
  for (const p of co.peers.values()) {
    const c = p.cur;
    if (!c || c.x === null || c.mode !== ui.mode || (c.mode === 'wall' && (c.wr !== ui.wall.roomId || c.wi !== ui.wall.i))) { p.shown = null; continue; }
    // The drawn cursor chases the reported one; it jumps only when it first appears or is far off.
    const sh = p.shown, gap = sh ? Math.hypot(c.x - sh.x, c.y - sh.y) * v.s : Infinity;
    if (gap > 600 || gap < 0.3) p.shown = { x: c.x, y: c.y };
    else { sh.x = c.x + (sh.x - c.x) * k; sh.y = c.y + (sh.y - c.y) * k; co.moving = true; }
    const w = p.name.length * 6.4 + 12;
    h += `<g transform="translate(${f((p.shown.x - v.x) * v.s)} ${f((p.shown.y - v.y) * v.s)})" pointer-events="none">` +
      `<path d="M0 0V16L4.6 12.2L7.6 18.8L10.2 17.6L7.2 11.2H13Z" fill="${p.color}" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/>` +
      `<rect x="12" y="18" width="${f(w)}" height="17" rx="5" fill="${p.color}"/>` +
      `<text x="${f(12 + w / 2)}" y="27" font-size="11" fill="#fff" text-anchor="middle" dominant-baseline="central">${esc(p.name)}</text></g>`;
  }
  return h;
}

function sendPeers() {
  const list = [{ id: co.me.id, name: co.me.name, color: co.me.color }];
  for (const [id, p] of co.peers) list.push({ id, name: p.name, color: p.color });
  sendAll({ t: 'peers', list });
  syncCollab();
}
function onData(msg, conn) {
  if (!msg || typeof msg !== 'object') return;
  const from = conn.peer;
  if (co.role === 'host') {
    if (msg.t === 'hello') {
      co.peers.set(from, { name: String(msg.name || 'Guest').slice(0, 20), color: PEER_COLORS[co.colorN++ % PEER_COLORS.length] });
      conn.send({ t: 'init', state: JSON.stringify(state) });
      sendPeers();
    } else if (!co.peers.has(from)) return;
    else if (msg.t === 'patch') {
      applyPatch(msg);
      sendAll({ t: 'patch', up: msg.up, del: msg.del, settings: msg.settings, live: msg.live ? 1 : 0 }, from);
      afterRemote(msg.live);
    } else if (msg.t === 'cur') {
      const c = cleanCur(msg);
      co.peers.get(from).cur = c;
      sendAll(Object.assign({ t: 'cur', from }, c), from);
      render();
    }
    return;
  }
  if (conn !== co.host) return;
  if (msg.t === 'init') {
    try { adopt(JSON.parse(msg.state)); } catch (e) { leaveSession(); toast('The shared plan could not be read.'); return; }
    history = [JSON.stringify(state)]; hIndex = 0;
    markSynced();
    if (co.status !== 'live') toast('Connected. You are now editing the shared plan.');
    co.status = 'live'; co.attempt = 0;
    save(); syncCollab(); refresh();
  } else if (msg.t === 'peers' && Array.isArray(msg.list)) {
    const old = co.peers;
    co.peers = new Map();
    for (const p of msg.list) {
      const color = /^#[0-9a-f]{6}$/i.test(p.color) ? p.color : PEER_COLORS[0];
      if (p.id === co.me.id) co.me.color = color;
      else co.peers.set(String(p.id), Object.assign(old.get(p.id) || {}, { name: String(p.name || 'Guest').slice(0, 20), color }));
    }
    syncCollab(); render();
  } else if (!co.synced) return;
  else if (msg.t === 'patch') { applyPatch(msg); afterRemote(msg.live); }
  else if (msg.t === 'cur') {
    const p = co.peers.get(msg.from);
    if (p) { p.cur = cleanCur(msg); render(); }
  }
}

function dropGuest(id, conn) {
  if (co.role !== 'host' || co.conns.get(id) !== conn) return;
  co.conns.delete(id);
  co.peers.delete(id);
  sendPeers();
  render();
}
function connectToHost() {
  const conn = co.host = co.peer.connect(PEER_PREFIX + co.code, { reliable: true });
  conn.on('open', () => conn.send({ t: 'hello', name: co.me.name }));
  conn.on('data', m => onData(m, conn));
  conn.on('close', () => hostLost(conn));
  conn.on('error', () => hostLost(conn));
}
function hostLost(conn) {
  if (co.host !== conn || co.role !== 'guest') return;
  co.host = null;
  co.status = 'reconnecting';
  co.peers.clear();
  syncCollab(); render();
  retryHost();
}
function retryHost() {
  if (co.attempt >= 8) {
    leaveSession();
    toast('The session ended because the host is gone. You keep a copy of the plan.');
    return;
  }
  co.attempt++;
  clearTimeout(co.timer);
  co.timer = setTimeout(() => {
    if (co.role !== 'guest' || co.host) return;
    if (!co.peer || co.peer.destroyed) { co.peer = null; openPeer(); }
    else if (co.peer.disconnected) co.peer.reconnect();
    else connectToHost();
  }, 2500);
}
function openPeer() {
  const role = co.role;
  const peer = co.peer = role === 'host' ? new Peer(PEER_PREFIX + co.code) : new Peer();
  peer.on('open', id => {
    if (co.peer !== peer) return;
    co.me.id = id;
    if (role === 'guest') { if (!co.host) connectToHost(); return; }
    if (!co.synced) markSynced();
    co.status = 'live'; co.attempt = 0;
    syncCollab();
  });
  peer.on('connection', conn => {
    if (co.peer !== peer || role !== 'host') { conn.close(); return; }
    co.conns.set(conn.peer, conn);
    conn.on('data', m => onData(m, conn));
    conn.on('close', () => dropGuest(conn.peer, conn));
    conn.on('error', () => dropGuest(conn.peer, conn));
  });
  peer.on('disconnected', () => { if (co.peer === peer && !peer.destroyed) peer.reconnect(); });
  peer.on('error', err => {
    if (co.peer !== peer) return;
    if (err.type === 'peer-unavailable') {
      if (!co.host) return;
      co.host = null;
      if (co.status === 'reconnecting') retryHost();
      else { leaveSession(); toast('No session found for that code. The host has to keep the page open.'); }
    } else if (err.type === 'unavailable-id') {
      // Right after a reload the old registration can linger for a moment, so try a few times.
      co.peer = null;
      peer.destroy();
      if (co.attempt++ < 4) co.timer = setTimeout(() => { if (co.role === 'host' && !co.peer) openPeer(); }, 1500);
      else { leaveSession(); toast('That project code is in use. Start a new session.'); }
    } else if (co.status !== 'live') {
      leaveSession();
      toast('Could not connect (' + err.type + ').');
    }
  });
}
async function startSession(role, code, name, resumed) {
  leaveSession();
  Object.assign(co, { role, code, status: resumed ? 'reconnecting' : 'connecting' });
  co.me.name = name;
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ role, code, name })); } catch (e) { /* ignore */ }
  syncCollab();
  try { await loadPeerLib(); } catch (e) { leaveSession(); toast(e.message); return; }
  if (co.role !== role || co.code !== code || co.peer) return;
  openPeer();
}
function leaveSession() {
  clearTimeout(co.timer);
  const p = co.peer;
  Object.assign(co, { role: null, status: '', code: '', peer: null, host: null, synced: null, attempt: 0, colorN: 1 });
  co.me.color = PEER_COLORS[0];
  co.conns.clear();
  co.peers.clear();
  co.anims.clear();
  if (p) try { p.destroy(); } catch (e) { /* already gone */ }
  try { sessionStorage.removeItem(SESSION_KEY); } catch (e) { /* ignore */ }
  syncCollab();
  render();
}
function coStart(role) {
  const name = $('#coName').value.trim().slice(0, 20) || 'Guest';
  try { localStorage.setItem(STORAGE_KEY + '.name', name); } catch (e) { /* ignore */ }
  if (role === 'host') return startSession('host', newCode(), name, false);
  const code = normCode($('#coCode').value);
  if (code.length !== 6) return toast('Enter the 6-character project code.');
  startSession('guest', code, name, false);
}

function buildCollab() {
  let h, name = '';
  try { name = localStorage.getItem(STORAGE_KEY + '.name') || ''; } catch (e) { /* ignore */ }
  if (!co.role) {
    h = '<h2>Work together</h2><p class="sub">Edit one plan at the same time and see each other\'s cursors.</p>' +
      `<label class="field wide"><span>Your name</span><input type="text" id="coName" maxlength="20" value="${esc(name)}" placeholder="Guest"></label>` +
      '<div class="btns"><button class="primary" data-act="co-host">Start a session with this plan</button></div>' +
      '<h3>Or join a session</h3>' +
      '<div class="corow"><input type="text" id="coCode" placeholder="ABC-123" maxlength="9" autocomplete="off"><button data-act="co-join">Join</button></div>' +
      '<p class="sub">Joining replaces the plan open in this browser with the shared one. Save it to a file first if you want to keep it.</p>' +
      '<div class="btns"><button data-act="co-close">Close</button></div>';
  } else {
    const live = co.status === 'live';
    h = `<h2>${live ? 'Live session' : co.status === 'reconnecting' ? 'Reconnecting…' : 'Connecting…'}</h2>` +
      `<p class="sub">${co.role === 'host' ? 'You are hosting. Keep this page open; the session ends when you leave.' : 'You joined as a guest.'}</p>` +
      `<div class="cocode">${showCode(co.code)}</div>` +
      (live ? '<div class="btns"><button data-act="co-copy">Copy code</button><button data-act="co-link">Copy invite link</button></div><h3>People</h3>' +
        `<div class="coperson"><i style="background:${co.me.color}"></i>${esc(co.me.name)} (you)</div>` +
        [...co.peers.values()].map(p => `<div class="coperson"><i style="background:${p.color}"></i>${esc(p.name)}</div>`).join('') : '') +
      `<div class="btns"><button class="danger" data-act="co-leave">${live ? 'Leave session' : 'Cancel'}</button><button data-act="co-close">Close</button></div>`;
  }
  $('#collab').innerHTML = h;
}
function syncCollabButton() {
  const b = $('#btnCollab');
  b.textContent = !co.role ? 'Collaborate' : co.status === 'live' ? `Live · ${co.peers.size + 1}` : 'Connecting…';
  b.classList.toggle('active', co.status === 'live');
}
function syncCollab() {
  if ($('#collab').open) buildCollab();
  syncCollabButton();
}
function openCollab() {
  const dlg = $('#collab');
  if (dlg.open) return dlg.close();
  buildCollab();
  dlg.show();
}
function resumeCollab() {
  if (pendingJoin) {
    openCollab();
    $('#coCode').value = showCode(pendingJoin);
    return;
  }
  try {
    const s = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    if (s && s.code) startSession(s.role === 'host' ? 'host' : 'guest', normCode(s.code), String(s.name || 'Guest').slice(0, 20), true);
  } catch (e) { /* no session to resume */ }
}

/* ---------- start ---------- */
try {
  const t = localStorage.getItem(STORAGE_KEY + '.theme');
  if (t) document.documentElement.dataset.theme = t;
} catch (e) { /* ignore */ }
load();
history = [JSON.stringify(state)];
buildCatalog();
refresh();
resumeCollab();
})();
