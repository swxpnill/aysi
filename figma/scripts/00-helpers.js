// ---------- shared helpers v2 ----------
const ERR = [];
const safe = async (label, fn) => { try { return await fn(); } catch (e) { ERR.push(label + ': ' + String((e && e.message) || e).slice(0, 220)); return null; } };
await Promise.all(['Regular', 'Medium', 'Semi Bold', 'Bold'].map(s => figma.loadFontAsync({ family: 'Inter', style: s })));
const VARS = {}; for (const v of await figma.variables.getLocalVariablesAsync()) VARS[v.name] = v;
const TS = {}; for (const s of await figma.getLocalTextStylesAsync()) TS[s.name] = s;
const ES = {}; for (const s of await figma.getLocalEffectStylesAsync()) ES[s.name] = s;
const hexToRgb = h => { h = h.replace('#', ''); return { r: parseInt(h.slice(0, 2), 16) / 255, g: parseInt(h.slice(2, 4), 16) / 255, b: parseInt(h.slice(4, 6), 16) / 255 }; };
function P(token, opacity) {
  if (token && token[0] === '#') { const p = { type: 'SOLID', color: hexToRgb(token) }; if (opacity != null) p.opacity = opacity; return p; }
  const v = VARS[token];
  const base = { type: 'SOLID', color: { r: 0, g: 0, b: 0 } };
  if (opacity != null) base.opacity = opacity;
  if (!v) { ERR.push('missing token ' + token); return base; }
  return figma.variables.setBoundVariableForPaint(base, 'color', v);
}
async function fx(node, name) { if (ES[name]) await node.setEffectStyleIdAsync(ES[name].id); else ERR.push('missing effect ' + name); }
function tnum(t) { try { if (typeof t.setRangeOpenTypeFeatures === 'function') t.setRangeOpenTypeFeatures(0, t.characters.length, { TNUM: true }); } catch (e) { } }
async function T(parent, chars, style, color, opts) {
  opts = opts || {};
  const t = figma.createText();
  if (TS[style]) await t.setTextStyleIdAsync(TS[style].id); else ERR.push('missing style ' + style);
  t.characters = String(chars);
  t.fills = [P(color || 'text/primary')];
  if (opts.tnum) tnum(t);
  t.name = opts.name || String(chars).slice(0, 40);
  if (parent) parent.appendChild(t);
  if (opts.w) { t.textAutoResize = 'HEIGHT'; t.resize(opts.w, Math.max(t.height, 1)); }
  else if (opts.fill && parent && parent.layoutMode && parent.layoutMode !== 'NONE') { t.textAutoResize = 'HEIGHT'; t.layoutSizingHorizontal = 'FILL'; }
  if (opts.align) t.textAlignHorizontal = opts.align;
  if (opts.trunc) { try { t.textAutoResize = 'NONE'; t.textTruncation = 'ENDING'; t.maxLines = 1; } catch (e) { } }
  return t;
}
function cfg(f, parent, o) {
  o = o || {};
  if (o.name) f.name = o.name;
  f.fills = o.fill ? [P(o.fill, o.fillOpacity)] : [];
  if (o.gap != null) f.itemSpacing = o.gap;
  const p = o.pad;
  if (p != null) { if (typeof p === 'number') { f.paddingTop = f.paddingBottom = f.paddingLeft = f.paddingRight = p; } else { f.paddingTop = p[0]; f.paddingRight = p[1]; f.paddingBottom = p[2]; f.paddingLeft = p[3]; } }
  if (o.radius != null) f.cornerRadius = o.radius;
  if (o.stroke) { f.strokes = [P(o.stroke)]; f.strokeWeight = o.sw || 1; f.strokeAlign = 'INSIDE'; }
  if (o.strokeSides) { f.strokeTopWeight = o.strokeSides[0]; f.strokeRightWeight = o.strokeSides[1]; f.strokeBottomWeight = o.strokeSides[2]; f.strokeLeftWeight = o.strokeSides[3]; }
  if (o.align) f.counterAxisAlignItems = o.align;
  if (o.justify) f.primaryAxisAlignItems = o.justify;
  if (parent) parent.appendChild(f);
  if (o.w != null || o.h != null) { f.resize(o.w != null ? o.w : Math.max(f.width, 1), o.h != null ? o.h : Math.max(f.height, 1)); f.layoutSizingHorizontal = o.w != null ? 'FIXED' : 'HUG'; f.layoutSizingVertical = o.h != null ? 'FIXED' : 'HUG'; }
  if (o.fillW && parent && parent.layoutMode && parent.layoutMode !== 'NONE') f.layoutSizingHorizontal = 'FILL';
  if (o.fillH && parent && parent.layoutMode && parent.layoutMode !== 'NONE') f.layoutSizingVertical = 'FILL';
  f.clipsContent = o.clip != null ? o.clip : false;
  if (o.opacity != null) f.opacity = o.opacity;
  return f;
}
function AL(parent, dir, o) { const f = figma.createAutoLayout(dir || 'HORIZONTAL'); f.name = (dir === 'VERTICAL' ? 'Stack' : 'Row'); return cfg(f, parent, o); }
function C(name, dir, o) { const c = figma.createComponent(); c.layoutMode = dir || 'HORIZONTAL'; c.primaryAxisSizingMode = 'AUTO'; c.counterAxisSizingMode = 'AUTO'; return cfg(c, null, Object.assign({}, o || {}, { name })); }
function R(parent, w, h, color, o) {
  o = o || {};
  const r = figma.createRectangle(); r.resize(Math.max(w, 0.01), Math.max(h, 0.01));
  r.fills = color ? [P(color, o.opacity)] : [];
  if (o.radius != null) r.cornerRadius = o.radius;
  r.name = o.name || 'Rect';
  if (parent) parent.appendChild(r);
  if (o.x != null) r.x = o.x; if (o.y != null) r.y = o.y;
  if (o.fillW && parent && parent.layoutMode !== 'NONE') r.layoutSizingHorizontal = 'FILL';
  return r;
}
function place(node, x, y) { node.x = x; node.y = y; return node; }
// library lookup (components live on page 0)
const LIB = {}; const LIBSET = {};
async function loadLib() {
  const p0 = figma.root.children[0];
  await p0.loadAsync();
  for (const n of p0.findAllWithCriteria({ types: ['COMPONENT_SET'] })) LIBSET[n.name] = n;
  for (const n of p0.findAllWithCriteria({ types: ['COMPONENT'] })) { if (n.parent && n.parent.type === 'COMPONENT_SET') LIB[n.parent.name + '|' + n.name] = n; else LIB[n.name] = n; }
}
function recolor(node, token) {
  if (!node) return;
  const vs = node.findAllWithCriteria ? node.findAllWithCriteria({ types: ['VECTOR', 'ELLIPSE', 'RECTANGLE', 'LINE', 'POLYGON', 'BOOLEAN_OPERATION'] }) : [];
  for (const v of vs) { if (v.strokes && v.strokes.length) v.strokes = [P(token)]; }
}
function icon(parent, name, size, token) {
  const comp = LIB['Icon/' + name];
  if (!comp) { ERR.push('no icon ' + name); const r = R(parent, size || 20, size || 20, null, { name: 'Icon/missing' }); return r; }
  const inst = comp.createInstance();
  if (parent) parent.appendChild(inst);
  if (size && size !== 20) inst.rescale(size / 20);
  if (token) recolor(inst, token);
  inst.name = 'Icon';
  return inst;
}
function inst(key, parent) {
  const c = LIB[key];
  if (!c) { ERR.push('no component ' + key); return null; }
  const i = c.createInstance(); if (parent) parent.appendChild(i); return i;
}
// set props by prefix match (TEXT/BOOLEAN/INSTANCE_SWAP keys carry #id suffix)
function setP(i, obj) {
  if (!i) return;
  const keys = Object.keys(i.componentProperties || {});
  const out = {};
  for (const [k, v] of Object.entries(obj)) { const real = keys.find(x => x === k || x.split('#')[0] === k); if (real) out[real] = v; else ERR.push('no prop ' + k + ' on ' + i.name); }
  try { i.setProperties(out); } catch (e) { ERR.push('setProperties ' + i.name + ': ' + String(e.message || e).slice(0, 120)); }
}
async function setText(node, layerName, value) {
  const t = node.findOne(n => n.type === 'TEXT' && n.name === layerName);
  if (!t) { ERR.push('no text layer ' + layerName); return null; }
  t.characters = String(value);
  return t;
}
function makeSet(comps, name, parent, o) {
  o = o || {};
  const set = figma.combineAsVariants(comps, parent || figma.currentPage);
  set.name = name;
  set.layoutMode = 'HORIZONTAL'; set.layoutWrap = 'WRAP';
  set.itemSpacing = o.gap != null ? o.gap : 16; set.counterAxisSpacing = o.gap != null ? o.gap : 16;
  set.paddingTop = set.paddingBottom = set.paddingLeft = set.paddingRight = 24;
  set.counterAxisAlignItems = 'MIN';
  set.primaryAxisSizingMode = 'FIXED';
  set.resize(o.w || 1200, Math.max(set.height, 10));
  set.counterAxisSizingMode = 'AUTO';
  set.fills = [P(o.bg || 'bg/surface')]; set.cornerRadius = 8; set.strokes = [P('border/default')]; set.dashPattern = [4, 4];
  if (o.desc) set.description = o.desc;
  return set;
}
function bindProp(set, propName, type, def, layerName, field) {
  let key;
  try { key = set.addComponentProperty(propName, type, def); } catch (e) { ERR.push('addProp ' + propName + ': ' + String(e.message || e).slice(0, 100)); return null; }
  for (const v of set.children) {
    const nodes = v.findAll(n => n.name === layerName);
    for (const n of nodes) { try { const refs = Object.assign({}, n.componentPropertyReferences || {}); refs[field] = key; n.componentPropertyReferences = refs; } catch (e) { ERR.push('ref ' + propName + ': ' + String(e.message || e).slice(0, 100)); } }
  }
  return key;
}
async function libSection(parent, title, desc) {
  const s = AL(parent, 'VERTICAL', { name: 'Section/' + title, gap: 16 }); s.layoutSizingHorizontal = 'FILL';
  await T(s, title, 'Heading/Section', 'text/primary');
  if (desc) await T(s, desc, 'Body/Small', 'text/secondary', { w: 900 });
  return s;
}
