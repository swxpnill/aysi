const ERR = [];
await Promise.all(['Regular', 'Medium', 'SemiBold', 'Bold'].map(s => figma.loadFontAsync({ family: 'Geist', style: s })));
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
function setP(i, obj) {
  if (!i) return;
  const keys = Object.keys(i.componentProperties || {});
  const out = {};
  for (const [k, v] of Object.entries(obj)) { const real = keys.find(x => x === k || x.split('#')[0] === k); if (real) out[real] = v; else ERR.push('no prop ' + k + ' on ' + i.name); }
  try { i.setProperties(out); } catch (e) { ERR.push('setProperties ' + i.name + ': ' + String(e.message || e).slice(0, 120)); }
}
await loadLib();
const page = figma.root.children[1];
await figma.setCurrentPageAsync(page);
const F = n => page.children.find(c => c.name === n);
async function txt(node, layer, value) {
  if (!node) return;
  const t = node.findOne(n => n.type === 'TEXT' && n.name === layer);
  if (!t) { ERR.push('no layer ' + layer + ' in ' + node.name); return; }
  t.characters = String(value);
}
function clear(name) { for (const n of page.children.slice()) if (n.name === name) n.remove(); }
async function screen(name, x, y, navLabel, section, pageTitle, o) {
  o = o || {};
  clear(name);
  const f = figma.createFrame(); f.name = name; page.appendChild(f); place(f, x, y);
  f.resize(1440, 900); f.fills = [P('bg/canvas')];
  f.layoutMode = 'HORIZONTAL'; f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'AUTO'; f.itemSpacing = 0; f.clipsContent = true; f.counterAxisAlignItems = 'MIN';
  const sb = LIB['Sidebar'].createInstance(); f.appendChild(sb); sb.layoutSizingVertical = 'FILL';
  const nav = sb.findOne(n => n.name === 'Nav/' + navLabel);
  if (nav) { try { nav.setProperties({ State: 'Active' }); } catch (e) { ERR.push('nav active ' + e.message); } recolor(nav.findOne(n => n.type === 'INSTANCE'), 'nav/indicator'); }
  const main = AL(f, 'VERTICAL', { name: 'Main', gap: 0 }); main.layoutSizingHorizontal = 'FILL';
  try { main.minHeight = o.minH || 900; } catch (e) { }
  const tb = LIB['Top bar'].createInstance(); main.appendChild(tb); tb.layoutSizingHorizontal = 'FILL';
  await txt(tb, 'Section', section); await txt(tb, 'Page', pageTitle);
  const content = AL(main, 'VERTICAL', { name: 'Content', gap: 24, pad: [28, 32, 48, 32] }); content.layoutSizingHorizontal = 'FILL';
  return { f, content, sb, tb, main };
}
function btn(parent, variant, label, ic, o) {
  o = o || {};
  const b = inst('Button|Variant=' + variant + ', State=' + (o.state || 'Default') + ', Size=' + (o.size || 'Medium'), parent);
  if (!b) return null;
  const props = { Label: label, 'Show icon': !!ic };
  if (ic) props.Icon = LIB['Icon/' + ic].id;
  setP(b, props);
  if (ic) recolor(b.findOne(n => n.name === 'Icon'), variant === 'Primary' || variant === 'Danger' ? 'text/inverse' : variant === 'Ghost' ? 'text/secondary' : 'text/primary');
  b.name = o.name || ('Button/' + label);
  return b;
}
function card(parent, name, o) { o = o || {}; const c = AL(parent, 'VERTICAL', Object.assign({ name, fill: 'bg/surface', stroke: 'border/default', radius: 8, gap: 0, clip: true }, o)); return c; }
async function cardHeader(parent, title, sub, o) {
  o = o || {};
  const h = AL(parent, 'HORIZONTAL', { name: 'Card header', pad: o.pad || [18, 20, 14, 20], gap: 12, align: 'CENTER' }); h.layoutSizingHorizontal = 'FILL';
  const t = AL(h, 'VERTICAL', { name: 'Titles', gap: 2 }); t.layoutSizingHorizontal = 'FILL';
  await T(t, title, 'Heading/Card', 'text/primary', { name: 'Title' });
  if (sub) await T(t, sub, 'Caption/Default', 'text/tertiary', { name: 'Subtitle', fill: true });
  const a = AL(h, 'HORIZONTAL', { name: 'Actions', gap: 8, align: 'CENTER' });
  return a;
}
function badge(parent, tone, label) { const b = inst('Badge|Tone=' + tone, parent); setP(b, { Label: label }); if (b) b.name = 'Badge/' + label; return b; }
async function simpleTable(parent, cols, rows, o) {
  o = o || {};
  const h = AL(parent, 'HORIZONTAL', { name: 'Table header', pad: [0, 12, 0, 12], align: 'CENTER', h: 40, fill: 'bg/surface-subtle', strokeSides: [0, 0, 1, 0], stroke: 'border/default' }); h.layoutSizingHorizontal = 'FILL';
  for (const [l, w, a] of cols) { const c = AL(h, 'HORIZONTAL', { name: 'Th/' + l, w: w === 'F' ? null : w, pad: [0, 8, 0, 8], justify: a === 'R' ? 'MAX' : 'MIN' }); if (w === 'F') { c.layoutSizingHorizontal = 'FILL'; } await T(c, l, 'Label/Overline', 'text/tertiary'); }
  for (const r of rows) {
    const row = AL(parent, 'HORIZONTAL', { name: 'Row/' + r[0], pad: [0, 12, 0, 12], align: 'CENTER', h: o.rowH || 52, fill: 'bg/surface', strokeSides: [0, 0, 1, 0], stroke: 'border/subtle' }); row.layoutSizingHorizontal = 'FILL';
    for (let i = 0; i < cols.length; i++) {
      const [l, w, a, kind] = cols[i]; const v = r[i];
      const c = AL(row, 'HORIZONTAL', { name: 'Td/' + l, w: w === 'F' ? null : w, gap: 8, align: 'CENTER', pad: [0, 8, 0, 8], justify: a === 'R' ? 'MAX' : 'MIN' }); if (w === 'F') c.layoutSizingHorizontal = 'FILL'; else { c.resize(w, 20); c.layoutSizingHorizontal = 'FIXED'; c.layoutSizingVertical = 'HUG'; }
      if (kind === 'badge') { badge(c, v[0], v[1]); continue; }
      if (kind === 'delta') { delta(c, v[0], v[1]); continue; }
      if (kind === 'avatar') { const av = inst('Avatar|Size=32', c); setP(av, { Initials: v[0] }); const tt = AL(c, 'VERTICAL', { name: 'Name', gap: 0 }); await T(tt, v[1], 'Body/Small strong', 'text/primary'); if (v[2]) await T(tt, v[2], 'Caption/Default', 'text/tertiary'); continue; }
      if (kind === 'menu') { icon(c, 'more', 16, 'text/tertiary'); continue; }
      if (kind === 'chev') { icon(c, 'chevron-right', 16, 'text/disabled'); continue; }
      if (kind === 'two' || kind === 'avatar2') { const tt = AL(c, 'VERTICAL', { name: 'Two-line', gap: 0 }); await T(tt, v[0], 'Body/Small', 'text/primary', { tnum: true }); await T(tt, v[1], 'Caption/Default', 'text/tertiary', { tnum: true }); continue; }
      await T(c, v, i === 0 && o.firstLink ? 'Body/Small strong' : (a === 'R' ? 'Numeric/Table' : 'Body/Small'), i === 0 && o.firstLink ? 'accent/text' : (i === 1 ? 'text/primary' : 'text/secondary'), { tnum: a === 'R' || kind === 'num' });
    }
  }
}
function twoCols(parent) { const cols = AL(parent, 'HORIZONTAL', { name: 'Columns', gap: 16, align: 'MIN' }); cols.layoutSizingHorizontal = 'FILL'; const l = AL(cols, 'VERTICAL', { name: 'Primary column', gap: 16 }); l.layoutSizingHorizontal = 'FILL'; const r = AL(cols, 'VERTICAL', { name: 'Side column', gap: 16, w: 384 }); return [l, r]; }
// ---------- v3 · A: Order detail workspace + Request vehicle flow (fields verified against swxpnill/Order) ----------
const dot = (p, tok) => { const e = figma.createEllipse(); e.resize(8, 8); e.fills = [P(tok)]; p.appendChild(e); return e; };
async function eyebrowCard(parent, label, ic, tint) {
  const c = card(parent, 'Card/' + label); c.layoutSizingHorizontal = 'FILL';
  const h = AL(c, 'HORIZONTAL', { name: 'Eyebrow', gap: 8, pad: [12, 20, 12, 20], align: 'CENTER', fill: tint || 'bg/surface-subtle', strokeSides: [0, 0, 1, 0], stroke: 'border/subtle' }); h.layoutSizingHorizontal = 'FILL';
  icon(h, ic, 16, tint === 'accent/subtle' ? 'accent/text' : 'text/secondary');
  const t = await T(h, label, 'Label/Overline', tint === 'accent/subtle' ? 'accent/text' : 'text/secondary'); t.layoutSizingHorizontal = 'FILL';
  const a = AL(h, 'HORIZONTAL', { name: 'Actions', gap: 8, align: 'CENTER' });
  const b = AL(c, 'VERTICAL', { name: 'Body', gap: 0, pad: [14, 20, 16, 20] }); b.layoutSizingHorizontal = 'FILL';
  return { c, h, a, b };
}
async function kv(parent, l, v, o) { o = o || {}; const r = AL(parent, 'HORIZONTAL', { gap: 12, pad: [7, 0, 7, 0], align: 'MIN', name: 'Field/' + l }); r.layoutSizingHorizontal = 'FILL'; await T(r, l, 'Body/Small', 'text/tertiary', { w: 112 }); const t = await T(r, v, o.strong ? 'Body/Small strong' : 'Body/Small', o.tone || 'text/primary', { tnum: true }); t.textAutoResize = 'HEIGHT'; t.layoutSizingHorizontal = 'FILL'; return r; }
async function partyTitle(b, name, sub, badgeArgs) { const r = AL(b, 'HORIZONTAL', { gap: 10, align: 'CENTER', pad: [0, 0, 8, 0], name: 'Identity' }); r.layoutSizingHorizontal = 'FILL'; const tt = AL(r, 'VERTICAL', { gap: 2 }); tt.layoutSizingHorizontal = 'FILL'; await T(tt, name, 'Body/Strong', 'text/primary'); await T(tt, sub, 'Caption/Default', 'text/tertiary', { tnum: true }); if (badgeArgs) badge(r, badgeArgs[0], badgeArgs[1]); }

async function orderDetail(name, x, y, state) {
  const S = await screen(name, x, y, 'Orders', 'Orders', 'ORD-24819');
  const C = S.content; C.itemSpacing = 20;
  const back = AL(C, 'HORIZONTAL', { name: 'Back link', gap: 6, align: 'CENTER' }); icon(back, 'chevron-left', 16, 'text/link'); await T(back, 'Orders', 'Body/Small strong', 'text/link');
  // A · compact header
  const hd = AL(C, 'HORIZONTAL', { name: 'Order header', gap: 16, align: 'MAX' }); hd.layoutSizingHorizontal = 'FILL';
  const ht = AL(hd, 'VERTICAL', { gap: 8 }); ht.layoutSizingHorizontal = 'FILL';
  const tr = AL(ht, 'HORIZONTAL', { gap: 10, align: 'CENTER', name: 'Title row' });
  await T(tr, 'ORD-24819', 'Display/Page title', 'text/primary', { tnum: true }); badge(tr, 'Info', 'Part dispatched'); badge(tr, 'Neutral', 'Stage · Created');
  const meta = AL(ht, 'HORIZONTAL', { gap: 18, name: 'Meta', align: 'CENTER' });
  for (const [ic, l, v] of [['calendar', 'Ordered', '08 Oct 2026'], ['clock', 'Deliver by', '14 Oct 2026'], ['users', 'Raised by', 'Anil Kumar · 08 Oct, 10:12']]) { const m = AL(meta, 'HORIZONTAL', { gap: 6, align: 'CENTER', name: 'Meta/' + l }); icon(m, ic, 14, 'text/tertiary'); await T(m, l, 'Body/Small', 'text/tertiary'); await T(m, v, 'Body/Small strong', 'text/primary', { tnum: true }); }
  const co = AL(meta, 'HORIZONTAL', { gap: 6, align: 'CENTER', pad: [2, 8, 2, 6], radius: 4, fill: 'accent/subtle', name: 'Meta/Company' }); icon(co, 'building', 14, 'accent/text'); await T(co, 'Nagpur Works · NGP', 'Label/Default', 'accent/text');
  const ha = AL(hd, 'HORIZONTAL', { gap: 8, align: 'CENTER', name: 'Actions' }); btn(ha, 'Secondary', 'Edit order', 'pencil'); btn(ha, 'Secondary', 'Delivery note', 'file'); btn(ha, 'Primary', state === 'requested' ? 'Chase vehicle' : 'Request vehicle', 'truck', { name: 'Button/Request vehicle' }); const mm = inst('Icon button|State=Default', ha); if (mm) mm.name = 'More actions';
  // quantities strip
  const st = AL(C, 'HORIZONTAL', { name: 'Quantities', radius: 8, fill: 'bg/surface', stroke: 'border/default', clip: true }); st.layoutSizingHorizontal = 'FILL';
  const Q = [['Ordered', '120.00', 'MT', null], ['Dispatched', '88.15', 'MT', '73% · 3 vehicles'], ['Balance', '31.85', 'MT', state === 'requested' ? 'vehicle requested' : 'no vehicle yet'], ['Order value', '₹ 70,08,000', '', '2 lines · rates on lines'], ['Tolerance', '± 0.50', '%', 'per loading']];
  for (let i = 0; i < Q.length; i++) { const [l, v, u, s] = Q[i]; const c = AL(st, 'VERTICAL', { gap: 4, pad: [14, 20, 14, 20], strokeSides: [0, i < Q.length - 1 ? 1 : 0, 0, 0], stroke: 'border/subtle', name: 'Qty/' + l }); c.layoutSizingHorizontal = 'FILL'; await T(c, l, 'Caption/Default', 'text/tertiary'); const vr = AL(c, 'HORIZONTAL', { gap: 4, align: 'BASELINE' }); await T(vr, v, 'Numeric/Large', 'text/primary', { tnum: true }); if (u) await T(vr, u, 'Body/Small', 'text/tertiary'); if (s) await T(c, s, 'Caption/Default', l === 'Balance' ? (state === 'requested' ? 'status/info/fg' : 'status/warning/fg') : 'text/secondary'); }
  const [L, Rc] = twoCols(C);
  // B · products table
  const pc = card(L, 'Card/Products'); pc.layoutSizingHorizontal = 'FILL';
  const pa = await cardHeader(pc, 'Products', '2 order lines · quantities in MT · rates visible to Owner and office roles'); pa.remove();
  const PCOL = [['#', 36, 'L'], ['Product', 'F', 'L'], ['Length', 84, 'L'], ['Ordered', 92, 'R'], ['Dispatched', 96, 'R'], ['Balance', 88, 'R'], ['Rate ₹/MT', 100, 'R'], ['Line value', 120, 'R']];
  const ph = AL(pc, 'HORIZONTAL', { name: 'Table header', pad: [0, 12, 0, 12], align: 'CENTER', h: 40, fill: 'bg/surface-subtle', strokeSides: [1, 0, 1, 0], stroke: 'border/default' }); ph.layoutSizingHorizontal = 'FILL';
  for (const [l, w, a] of PCOL) { const c = AL(ph, 'HORIZONTAL', { name: 'Th/' + l, w: w === 'F' ? null : w, pad: [0, 8, 0, 8], justify: a === 'R' ? 'MAX' : 'MIN' }); if (w === 'F') c.layoutSizingHorizontal = 'FILL'; await T(c, l, 'Label/Overline', 'text/tertiary'); }
  const LINES = [['1', 'TMT Fe 550D · 16 mm', 'TMT-550D-16 · HSN 7214', '12 m', '80.00', '64.15', '15.85', '58,400', '46,72,000'], ['2', 'TMT Fe 550D · 12 mm', 'TMT-550D-12 · HSN 7214', '12 m', '40.00', '24.00', '16.00', '58,400', '23,36,000']];
  for (const r of LINES) { const row = AL(pc, 'HORIZONTAL', { name: 'Line/' + r[0], pad: [0, 12, 0, 12], align: 'CENTER', h: 56, strokeSides: [0, 0, 1, 0], stroke: 'border/subtle' }); row.layoutSizingHorizontal = 'FILL';
    for (let i = 0; i < PCOL.length; i++) { const [l, w, a] = PCOL[i]; const c = AL(row, 'HORIZONTAL', { name: 'Td/' + l, pad: [0, 8, 0, 8], justify: a === 'R' ? 'MAX' : 'MIN', align: 'CENTER' }); if (w === 'F') c.layoutSizingHorizontal = 'FILL'; else { c.resize(w, 20); c.layoutSizingHorizontal = 'FIXED'; c.layoutSizingVertical = 'HUG'; }
      if (i === 1) { const tt = AL(c, 'VERTICAL', { gap: 1 }); await T(tt, r[1], 'Body/Small strong', 'accent/text', { name: 'Link/Product' }); await T(tt, r[2], 'Caption/Default', 'text/tertiary', { tnum: true }); continue; }
      const idx = i === 0 ? 0 : i + 1; await T(c, r[idx], a === 'R' ? 'Numeric/Table' : 'Body/Small', i === 5 ? 'text/primary' : 'text/secondary', { tnum: true }); } }
  const tot = AL(pc, 'HORIZONTAL', { name: 'Totals', pad: [0, 12, 0, 12], align: 'CENTER', h: 48, fill: 'bg/surface-subtle' }); tot.layoutSizingHorizontal = 'FILL';
  for (let i = 0; i < PCOL.length; i++) { const [l, w, a] = PCOL[i]; const c = AL(tot, 'HORIZONTAL', { pad: [0, 8, 0, 8], justify: a === 'R' ? 'MAX' : 'MIN' }); if (w === 'F') c.layoutSizingHorizontal = 'FILL'; else { c.resize(w, 20); c.layoutSizingHorizontal = 'FIXED'; c.layoutSizingVertical = 'HUG'; } const v = ['', 'Total', '', '120.00', '88.15', '31.85', '', '₹ 70,08,000'][i]; if (v) await T(c, v, i === 1 ? 'Body/Small strong' : 'Numeric/Medium', 'text/primary', { tnum: true }); }
  // F · vehicles & transporters (from loadings)
  const vc = card(L, 'Card/Vehicles & transporters'); vc.layoutSizingHorizontal = 'FILL';
  const va = await cardHeader(vc, 'Vehicles & transporters', '3 loadings · each loading carries its vehicle, driver and transporter'); btn(va, 'Ghost', 'Commit a vehicle', 'plus', { size: 'Small', name: 'Button/Commit vehicle' });
  await simpleTable(vc, [['Loading', 100, 'L', 'num'], ['Vehicle', 128, 'L', 'num'], ['Transporter', 'F', 'L', 'two'], ['Driver', 150, 'L', 'two'], ['Net MT', 84, 'R'], ['Status', 120, 'L', 'badge']], [
    ['LD-55088', 'MH 31 CQ 7710', ['Om Sai Roadlines', 'Bilty 4471'], ['Sanjay Pawar', '+91 98221 40177'], '31.20', ['Positive', 'Dispatched']],
    ['LD-55079', 'MH 12 RT 4418', ['Om Sai Roadlines', 'Bilty 4466'], ['Ravi Shinde', '+91 99702 10433'], '28.50', ['Positive', 'Dispatched']],
    ['LD-55071', 'MH 49 AT 0442', ['Shree Ganesh Transport', 'Bilty 1180'], ['Mahesh Gawande', '+91 97644 22190'], '28.45', ['Positive', 'Dispatched']]], { rowH: 56, firstLink: true });
  const vnote = AL(vc, 'HORIZONTAL', { name: 'Balance note', gap: 8, pad: [12, 20, 14, 20], align: 'CENTER', fill: state === 'requested' ? 'status/info/bg' : 'status/warning/bg' }); vnote.layoutSizingHorizontal = 'FILL';
  icon(vnote, state === 'requested' ? 'info' : 'alert', 16, state === 'requested' ? 'status/info/fg' : 'status/warning/fg');
  const vt = await T(vnote, state === 'requested' ? '31.85 MT balance — a vehicle has been requested from Mehta & Sons. It is not assigned until a loading is committed.' : '31.85 MT balance has no vehicle. Request one from the broker, or commit a vehicle already at the gate.', 'Body/Small', 'text/primary'); vt.textAutoResize = 'HEIGHT'; vt.layoutSizingHorizontal = 'FILL';
  // G · activity (simple)
  const ac = card(L, 'Card/Activity'); ac.layoutSizingHorizontal = 'FILL';
  const aa = await cardHeader(ac, 'Activity', 'Order events, newest first'); aa.remove();
  const al = AL(ac, 'VERTICAL', { name: 'Events', gap: 0, pad: [0, 20, 12, 20] }); al.layoutSizingHorizontal = 'FILL';
  const EV = (state === 'requested' ? [['Vehicle requested from Mehta & Sons Brokerage · 31.85 MT · WhatsApp', 'Today 17:58 · Priya R.', 'accent/default']] : []).concat([['Dispatched 31.20 MT · LD-55088', '09 Oct 14:22 · Weighbridge 1', 'status/positive/fg'], ['Dispatched 28.50 MT · LD-55079', '09 Oct 12:48 · Weighbridge 1', 'status/positive/fg'], ['Dispatched 28.45 MT · LD-55071', '09 Oct 11:05 · Weighbridge 1', 'status/positive/fg'], ['Order edited · rate ₹ 58,200 → ₹ 58,400 / MT', '08 Oct 16:02 · Priya R.', 'border/strong'], ['Order raised · 120.00 MT', '08 Oct 10:12 · Anil K.', 'border/strong']]).slice(0, 5);
  for (const [t, m, tok] of EV) { const r = AL(al, 'HORIZONTAL', { gap: 12, pad: [9, 0, 9, 0], align: 'CENTER', strokeSides: [0, 0, 1, 0], stroke: 'border/subtle', name: 'Event' }); r.layoutSizingHorizontal = 'FILL'; dot(r, tok); const tt = await T(r, t, 'Body/Small', 'text/primary', { tnum: true }); tt.layoutSizingHorizontal = 'FILL'; await T(r, m, 'Caption/Default', 'text/tertiary', { tnum: true }); }
  // Request vehicle card (right column, first)
  const rq = await eyebrowCard(Rc, 'Vehicle request', 'truck', state === 'requested' ? 'status/info/bg' : 'status/warning/bg');
  if (state === 'requested') {
    badge(rq.a, 'Warning', 'Waiting');
    await partyTitle(rq.b, 'Mehta & Sons Brokerage', 'Asked on WhatsApp · +91 98220 13344', null);
    await kv(rq.b, 'Quantity', '31.85 MT', { strong: true }); await kv(rq.b, 'Needed by', '13 Oct 2026 · for your records'); await kv(rq.b, 'Sent', 'Today 17:58 by Priya R. · 1 send');
    const ar = AL(rq.b, 'HORIZONTAL', { gap: 8, pad: [10, 0, 0, 0], name: 'Request actions' }); btn(ar, 'Secondary', 'Chase again', 'refresh', { size: 'Small' }); btn(ar, 'Secondary', 'They replied', 'check', { size: 'Small' }); btn(ar, 'Ghost', 'Cancel', 'x', { size: 'Small', name: 'Button/Cancel request' });
    await T(rq.b, 'A request is not an assignment. The stage moves when a vehicle is committed to a loading.', 'Caption/Default', 'text/tertiary', { fill: true });
  } else {
    badge(rq.a, 'Neutral', 'None open');
    await T(rq.b, '31.85 MT still needs a vehicle.', 'Body/Strong', 'text/primary');
    await T(rq.b, 'The request goes to Mehta & Sons Brokerage on WhatsApp — the order’s broker decides who is asked, not the sender.', 'Body/Small', 'text/secondary', { fill: true });
    const sp = AL(rq.b, 'VERTICAL', { pad: [12, 0, 4, 0] }); sp.layoutSizingHorizontal = 'FILL';
    const b = btn(sp, 'Primary', 'Request vehicle', 'truck', { name: 'Button/Request vehicle (card)' }); b.layoutSizingHorizontal = 'FILL';
    await T(rq.b, 'Last request: none on this order.', 'Caption/Default', 'text/tertiary');
  }
  // E · our company
  const oc = await eyebrowCard(Rc, 'Our company', 'building', 'accent/subtle');
  await partyTitle(oc.b, 'Nagpur Works', 'Company code NGP · Vardhan Ispat Ltd.', ['Info', 'Fulfilling']);
  await kv(oc.b, 'Role', 'Loads, weighs and dispatches this order'); await kv(oc.b, 'Address', 'Plot 14, MIDC Hingna, Nagpur, MH 440016'); await kv(oc.b, 'Map', 'Open location', { tone: 'text/link' });
  // C · customer
  const cu = await eyebrowCard(Rc, 'Customer', 'users'); btn(cu.a, 'Ghost', 'View customer', 'arrow-up-right', { size: 'Small', name: 'Button/View customer' });
  await partyTitle(cu.b, 'Kaveri Builders', 'Builder · GSTIN 27AAKCK4821M1Z5', ['Positive', 'Active']);
  await kv(cu.b, 'Contact', 'Arjun Kulkarni'); await kv(cu.b, 'Phone', '+91 98220 41157'); await kv(cu.b, 'Email', 'purchase@kaveribuilders.in'); await kv(cu.b, 'Ship to', 'Site 4, Wardha Road, Nagpur'); await kv(cu.b, 'Payment terms', '30 days from dispatch');
  // D · broker
  const br = await eyebrowCard(Rc, 'Broker', 'message'); btn(br.a, 'Ghost', 'View broker', 'arrow-up-right', { size: 'Small', name: 'Button/View broker' });
  await partyTitle(br.b, 'Mehta & Sons Brokerage', 'Commission agent · GSTIN 27AAJFM4410Q1Z6', ['Positive', 'Active']);
  await kv(br.b, 'Contact', 'Rajesh Mehta'); await kv(br.b, 'Phone', '+91 98220 13344'); await kv(br.b, 'Commission', '₹ 50 per MT · on this order'); await kv(br.b, 'Receives', 'Vehicle requests for this order');
  return S;
}
// keep inbound prototype links: remember every reaction that targets the old order detail
const OLD = page.children.find(c => c.name === '04 · Order detail'); const INB = [];
if (OLD) for (const n of page.findAll(n => n.reactions && n.reactions.length && !(n.id === OLD.id || (function(x){ while (x) { if (x.id === OLD.id) return true; x = x.parent; } return false; })(n)))) if (n.reactions.some(r => (r.actions || [r.action]).some(a => a && a.destinationId === OLD.id))) INB.push(n);
const OD = await orderDetail('04 · Order detail', 4620, 0, 'default');
const OD2 = await orderDetail('04b · Order detail — vehicle requested', 4620, -3200, 'requested');
{ const t = inst('Toast|Tone=Success', OD2.f); if (t) { t.layoutPositioning = 'ABSOLUTE'; t.x = 1440 - 32 - 380; t.y = 80; setP(t, { Title: 'Vehicle requested', Description: 'Mehta & Sons Brokerage was asked for 31.85 MT on WhatsApp.', Action: 'View request', 'Show action': true }); t.name = 'Toast · request sent'; } }
{ clear('Row label · Order detail states'); const t = await T(null, 'Order detail · states (default, vehicle requested, card empty states)', 'Display/Page title', 'text/primary', { name: 'Row label · Order detail states' }); page.appendChild(t); place(t, 4620, -3300); }

// Card states board: empty / ineligible states, verified against the service's failure codes
{ clear('Order detail · card states'); const B = AL(page, 'HORIZONTAL', { name: 'Order detail · card states', gap: 24, pad: 40, fill: 'bg/canvas', align: 'MIN' }); place(B, 6160, -3200); B.layoutWrap = 'WRAP'; B.resize(1440, 100); B.layoutSizingHorizontal = 'FIXED'; B.counterAxisSpacing = 24;
  const col = () => { const c = AL(B, 'VERTICAL', { gap: 16, w: 432 }); return c; };
  const c1 = col();
  const b1 = await eyebrowCard(c1, 'Broker', 'message'); await T(b1.b, 'No broker assigned', 'Body/Strong', 'text/primary'); await T(b1.b, 'Direct sale. Vehicle requests for this order go to the customer, Kaveri Builders.', 'Body/Small', 'text/secondary', { fill: true });
  const b2 = await eyebrowCard(c1, 'Customer', 'users'); await T(b2.b, 'No customer on this order', 'Body/Strong', 'text/primary'); await T(b2.b, 'Broker-only order (allowed since 0087). The broker is the counterparty; nothing else is shown here.', 'Body/Small', 'text/secondary', { fill: true });
  const c2 = col();
  const v1 = card(c2, 'Card/Vehicles · empty'); v1.layoutSizingHorizontal = 'FILL'; const v1a = await cardHeader(v1, 'Vehicles & transporters', 'No loadings yet'); v1a.remove(); const v1b = AL(v1, 'VERTICAL', { gap: 10, pad: [0, 20, 20, 20], align: 'CENTER' }); v1b.layoutSizingHorizontal = 'FILL'; await T(v1b, 'No vehicle assigned', 'Body/Strong', 'text/primary'); await T(v1b, 'Ask the broker for a vehicle, or commit one already at the gate.', 'Body/Small', 'text/secondary'); btn(v1b, 'Secondary', 'Request vehicle', 'truck', { size: 'Small' });
  const r2 = await eyebrowCard(c2, 'Vehicle request', 'truck'); badge(r2.a, 'Neutral', 'Not needed'); await T(r2.b, 'This order is completed. It does not need a vehicle.', 'Body/Small', 'text/secondary', { fill: true }); const rb = AL(r2.b, 'VERTICAL', { pad: [12, 0, 0, 0] }); rb.layoutSizingHorizontal = 'FILL'; const dis = btn(rb, 'Primary', 'Request vehicle', 'truck', { state: 'Disabled' }); dis.layoutSizingHorizontal = 'FILL';
  const c3 = col();
  for (const [lab, tone, body] of [['Confirmed', 'Info', 'Mehta & Sons replied on 13 Oct, 09:12. Waiting for the vehicle to reach the gate.'], ['Vehicle arrived', 'Positive', 'Fulfilled by loading LD-55107 · MH 40 BG 2291.'], ['No reply', 'Neutral', 'Expired after 48 h with no answer. Request again to chase.']]) { const e = await eyebrowCard(c3, 'Vehicle request', 'truck'); badge(e.a, tone, lab); await T(e.b, body, 'Body/Small', 'text/secondary', { fill: true }); }
}

// Request vehicle overlays — fields match the real form: Quantity (company unit), Needed by (optional, records only), message preview, fixed recipient
async function rvModal(name, x, mode) {
  clear(name);
  const f = figma.createFrame(); f.name = name; f.resize(1440, 900); f.fills = []; f.clipsContent = true; page.appendChild(f); place(f, x, 3400);
  const sc = R(f, 1440, 900, 'bg/scrim', { name: 'Dismiss area', opacity: 0.48 }); sc.x = 0; sc.y = 0;
  const m = AL(f, 'VERTICAL', { name: 'Dialog', w: 560, radius: 12, fill: 'bg/surface', clip: true });
  const h = inst('Modal header', m); h.layoutSizingHorizontal = 'FILL'; await txt(h, 'Title', 'Request a vehicle'); await txt(h, 'Description', 'ORD-24819 · Kaveri Builders · TMT Fe 550D · balance 31.85 MT');
  const b = AL(m, 'VERTICAL', { name: 'Body', gap: 16, pad: [4, 24, 24, 24] }); b.layoutSizingHorizontal = 'FILL';
  const to = AL(b, 'HORIZONTAL', { name: 'Sending to', gap: 12, pad: 12, radius: 8, fill: 'bg/surface-subtle', stroke: 'border/subtle', align: 'CENTER' }); to.layoutSizingHorizontal = 'FILL';
  const av = inst('Avatar|Size=32', to); setP(av, { Initials: 'MS' }); const tt = AL(to, 'VERTICAL', { gap: 1 }); tt.layoutSizingHorizontal = 'FILL'; await T(tt, 'Sending to Mehta & Sons Brokerage · broker', 'Body/Small strong', 'text/primary'); await T(tt, mode === 'nophone' ? 'No usable phone number on file' : 'WhatsApp · +91 98220 13344', 'Caption/Default', mode === 'nophone' ? 'status/negative/fg' : 'text/tertiary', { tnum: true });
  if (mode === 'duplicate') { const bn = inst('Banner|Tone=Warning', b); bn.layoutSizingHorizontal = 'FILL'; setP(bn, { Message: 'Mehta & Sons Brokerage was already asked on 12 Oct by Priya Raman. Chase or cancel that request instead.', Action: 'Chase again', 'Show action': true }); }
  if (mode === 'nophone') { const bn = inst('Banner|Tone=Negative', b); bn.layoutSizingHorizontal = 'FILL'; setP(bn, { Message: 'Mehta & Sons Brokerage has no usable phone number. Add one before asking for a vehicle.', Action: 'Edit broker', 'Show action': true }); }
  if (mode === 'failed') { const bn = inst('Banner|Tone=Negative', b); bn.layoutSizingHorizontal = 'FILL'; setP(bn, { Message: 'WhatsApp isn’t connected for this workspace. The owner can connect it on the WhatsApp page, then send the request. Nothing was recorded.', 'Show action': false }); }
  const row = AL(b, 'HORIZONTAL', { gap: 16, name: 'Row', align: 'MIN' }); row.layoutSizingHorizontal = 'FILL';
  const qty = inst('Text field|State=' + (mode === 'invalid' ? 'Error' : mode === 'sending' ? 'Disabled' : 'Filled'), row); qty.layoutSizingHorizontal = 'FILL';
  setP(qty, mode === 'invalid' ? { Label: 'Quantity (MT)', Value: '36.00', 'Helper text': 'More than the 31.85 MT balance. A request is for one truck-load.', 'Show helper': true } : { Label: 'Quantity (MT)', Value: '31.85', 'Helper text': 'One truck-load · balance 31.85 MT', 'Show helper': true });
  const nb = inst('Text field|State=' + (mode === 'sending' ? 'Disabled' : 'Filled'), row); nb.layoutSizingHorizontal = 'FILL'; setP(nb, { Label: 'Needed by · optional', Value: '13 Oct 2026', 'Helper text': 'Kept on the request; not in the message', 'Show helper': true });
  const mg = AL(b, 'VERTICAL', { name: 'Message preview', gap: 6 }); mg.layoutSizingHorizontal = 'FILL'; await T(mg, 'Message', 'Label/Default', 'text/secondary');
  const bubble = AL(mg, 'VERTICAL', { gap: 4, pad: 12, radius: 8, fill: 'status/positive/bg', stroke: 'status/positive/border' }); bubble.layoutSizingHorizontal = 'FILL';
  await T(bubble, 'Namaste Rajesh ji — Nagpur Works needs a vehicle for ORD-24819 (Kaveri Builders): 31.85 MT TMT Fe 550D. Please reply with the vehicle number. — Vardhan Ispat', 'Body/Small', 'text/primary', { fill: true, tnum: true });
  await T(mg, 'Approved template · sent exactly as shown', 'Caption/Default', 'text/tertiary');
  const ft = inst('Modal footer', m); ft.layoutSizingHorizontal = 'FILL'; await txt(ft, 'Footnote', mode === 'sending' ? 'Sending… do not close this window' : 'Who is asked is set by the order');
  const pa = ft.findOne(n => n.name === 'Primary action'); const sa = ft.findOne(n => n.name === 'Secondary action');
  const disabled = mode === 'invalid' || mode === 'duplicate' || mode === 'nophone';
  if (pa) { try { pa.swapComponent(LIB['Button|Variant=Primary, State=' + (mode === 'sending' ? 'Loading' : disabled ? 'Disabled' : 'Default') + ', Size=Medium']); } catch (e) { } setP(pa, { Label: mode === 'sending' ? 'Sending…' : mode === 'failed' ? 'Try again' : 'Send via WhatsApp' }); }
  if (sa) setP(sa, { Label: 'Cancel', 'Show icon': false });
  m.x = Math.round((1440 - m.width) / 2); m.y = Math.round((900 - m.height) / 2);
  return f;
}
const RV = [['Overlay · Request vehicle', 'default'], ['Overlay · Request vehicle — validation', 'invalid'], ['Overlay · Request vehicle — sending', 'sending'], ['Overlay · Request vehicle — already asked', 'duplicate'], ['Overlay · Request vehicle — no phone', 'nophone'], ['Overlay · Request vehicle — failed', 'failed']];
let rx = 20600; const rvf = {};
for (const [n, mode] of RV) { rvf[n] = await rvModal(n, rx, mode); rx += 1540; }

// Wiring: Request vehicle → modal → validation / sending → success (updated detail) or failure
const tr = { type: 'DISSOLVE', easing: { type: 'EASE_OUT' }, duration: 0.18 };
async function react(node, actions, trig) { if (!node || actions.some(a => !a)) return; try { await node.setReactionsAsync([{ trigger: trig || { type: 'ON_CLICK' }, actions }]); } catch (e) { ERR.push('react ' + node.name + ' ' + String(e.message).slice(0, 80)); } }
const go = (dest, nav) => { const d = typeof dest === 'string' ? F(dest) : dest; if (!d) { ERR.push('no dest ' + dest); return null; } return { type: 'NODE', destinationId: d.id, navigation: nav || 'NAVIGATE', transition: tr, preserveScrollPosition: false }; };
for (const n of ['Button/Request vehicle', 'Button/Request vehicle (card)']) await react(OD.f.findOne(x => x.name === n), [go('Overlay · Request vehicle', 'OVERLAY')]);
await react(OD.f.findOne(x => x.name === 'Button/View customer'), [go('06b · Customer detail')]);
await react(OD.f.findOne(x => x.name === 'Button/View broker'), [go('07b · Broker detail')]);
await react(OD2.f.findOne(x => x.name === 'Button/View customer'), [go('06b · Customer detail')]);
await react(OD2.f.findOne(x => x.name === 'Button/View broker'), [go('07b · Broker detail')]);
for (const f of [OD.f, OD2.f]) { await react(f.findOne(x => x.name === 'Back link'), [go('03 · Orders')]); for (const r of f.findAll(x => x.name.startsWith('Row/LD-'))) await react(r, [go('09b · Transporter detail')]); for (const p of f.findAll(x => x.name === 'Link/Product')) await react(p, [go('Overlay · Product detail', 'OVERLAY')]); }
await react(OD2.f.findOne(x => x.name === 'Button/Request vehicle'), [go('Overlay · Request vehicle — already asked', 'OVERLAY')]);
for (const n of Object.keys(rvf)) { const f = rvf[n]; await react(f.findOne(x => x.name === 'Dismiss area'), [{ type: 'CLOSE' }]); await react(f.findOne(x => x.name === 'Close'), [{ type: 'CLOSE' }]); await react(f.findOne(x => x.name === 'Secondary action'), [{ type: 'CLOSE' }]); }
const RVd = rvf['Overlay · Request vehicle'];
await react(RVd.findOne(x => x.name === 'Primary action'), [go('Overlay · Request vehicle — sending', 'SWAP')]);
const qf = RVd.findAll(x => x.type === 'INSTANCE' && x.mainComponent && x.mainComponent.parent && x.mainComponent.parent.name === 'Text field')[0]; await react(qf, [go('Overlay · Request vehicle — validation', 'SWAP')]);
await react(rvf['Overlay · Request vehicle — validation'].findAll(x => x.type === 'INSTANCE' && x.mainComponent && x.mainComponent.parent && x.mainComponent.parent.name === 'Text field')[0], [go('Overlay · Request vehicle', 'SWAP')]);
// sending resolves after 1.2 s to success (navigate to updated detail); failure shown via the dialog's own footnote frame
try { await rvf['Overlay · Request vehicle — sending'].setReactionsAsync([{ trigger: { type: 'AFTER_TIMEOUT', timeout: 1.2 }, actions: [go(OD2.f)] }]); } catch (e) { ERR.push('timeout ' + e.message); }
await react(rvf['Overlay · Request vehicle — failed'].findOne(x => x.name === 'Primary action'), [go('Overlay · Request vehicle — sending', 'SWAP')]);
for (const s of ['Overlay · Request vehicle — already asked']) { const bn = rvf[s].findOne(x => x.name === 'Action'); if (bn) await react(bn, [go(OD2.f)]); }
// restore inbound links onto the rebuilt frame
let relinked = 0; for (const n of INB) { try { const rs = n.reactions.map(r => { const acts = (r.actions || [r.action]).map(a => a && a.destinationId === OLD.id ? Object.assign({}, a, { destinationId: OD.f.id }) : a); const o = { trigger: r.trigger, actions: acts }; return o; }); await n.setReactionsAsync(rs); relinked++; } catch (e) { ERR.push('relink ' + n.name + ' ' + String(e.message).slice(0, 60)); } }
const NAV = { Dashboard: '02 · Dashboard', Orders: '03 · Orders', Customers: '06 · Customers', Brokers: '07 · Brokers', Products: '08 · Products', Transporters: '09 · Transporters', Settings: '09 · Settings', 'Users & access': '10 · Users & access', Integrations: '11 · Integrations' };
for (const f of [OD.f, OD2.f]) { for (const [l, d] of Object.entries(NAV)) { const n = f.findOne(x => x.name === 'Nav/' + l); if (n && F(d)) await react(n, [go(d)]); } const nb = f.findOne(x => x.name === 'Notifications'); if (nb && F('Overlay · Notifications')) await react(nb, [go('Overlay · Notifications', 'OVERLAY')]); }
for (const f of [OD.f, OD2.f]) { const cv = f.findOne(x => x.name === 'Button/Commit vehicle'); if (cv && F('Overlay · Assign vehicle')) await react(cv, [go('Overlay · Assign vehicle', 'OVERLAY')]); }
try { const fl = page.flowStartingPoints.filter(x => !x.name.startsWith('B ·')); fl.splice(1, 0, { nodeId: OD.f.id, name: 'B · Order detail → request vehicle → sent / failed' }); page.flowStartingPoints = fl; } catch (e) { ERR.push('flows ' + e.message); }
await OD.f.screenshot({ scale: 0.4 }); await OD2.f.screenshot({ scale: 0.3 });
for (const n of ['Overlay · Request vehicle', 'Overlay · Request vehicle — validation', 'Overlay · Request vehicle — already asked']) await rvf[n].screenshot({ scale: 0.3 });
await F('Order detail · card states').screenshot({ scale: 0.35 });
return { relinked, inbound: INB.length, od: OD.f.id, od2: OD2.f.id, errors: ERR.slice(0, 30), errCount: ERR.length };
