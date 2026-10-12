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
const tr = { type: 'DISSOLVE', easing: { type: 'EASE_OUT' }, duration: 0.18 };
async function react(node, actions, trig) { if (!node || actions.some(a => !a)) return; try { await node.setReactionsAsync([{ trigger: trig || { type: 'ON_CLICK' }, actions }]); } catch (e) { ERR.push('react ' + node.name + ' ' + String(e.message).slice(0, 80)); } }
const go = (dest, nav) => { const d = typeof dest === 'string' ? F(dest) : dest; if (!d) { ERR.push('no dest ' + dest); return null; } return { type: 'NODE', destinationId: d.id, navigation: nav || 'NAVIGATE', transition: tr, preserveScrollPosition: false }; };
// ---------- v3 · B: order-detail layout fixes, repo-truth corrections, chart + orders states ----------
try { await Promise.all(['Regular', 'Medium', 'Semi Bold', 'Bold'].map(s => figma.loadFontAsync({ family: 'Inter', style: s }))); } catch (e) { }
const LOG = [];
async function setChars(t, v) { if (!t) return; try { await figma.loadFontAsync(t.fontName); } catch (e) { } t.characters = v; }
const txts = (root, pred) => root.findAll(n => n.type === 'TEXT' && pred(n.characters));
const fix = (w) => (n) => { n.resize(w, n.height); n.layoutSizingHorizontal = 'FIXED'; };
// 1 · Order detail fixes (both states)
for (const fname of ['04 · Order detail', '04b · Order detail — vehicle requested']) {
  const f = F(fname); if (!f) { ERR.push('no ' + fname); continue; }
  const meta = f.findOne(n => n.name === 'Meta'); if (meta) { meta.layoutWrap = 'WRAP'; meta.layoutSizingHorizontal = 'FILL'; meta.counterAxisSpacing = 6; }
  const pc = f.findOne(n => n.name === 'Card/Products');
  if (pc) {
    const codes = { '1': 'PRD-TMT550-16', '2': 'PRD-TMT550-12' };
    for (const row of pc.findAll(n => n.name.startsWith('Line/'))) { const k = row.name.split('/')[1]; const len = row.findOne(n => n.name === 'Td/Length'); const lt = len && len.findOne(n => n.type === 'TEXT'); const sub = row.findOne(n => n.name === 'Td/Product').findAll(n => n.type === 'TEXT')[1]; if (sub) await setChars(sub, codes[k] + ' · ' + (lt ? lt.characters : '12 m') + ' lengths · HSN 7214'); if (len) len.remove(); }
    const th = pc.findOne(n => n.name === 'Th/Length'); const tot = pc.findOne(n => n.name === 'Totals');
    if (th) { th.remove(); if (tot && tot.children[2]) tot.children[2].remove(); }
    const W = { '#': 28, 'Ordered': 80, 'Dispatched': 92, 'Balance': 80, 'Rate ₹/MT': 88, 'Line value': 108 };
    for (const [k, w] of Object.entries(W)) for (const n of pc.findAll(n => n.name === 'Th/' + k || n.name === 'Td/' + k)) fix(w)(n);
    if (tot) { const tw = [28, null, 80, 92, 80, 88, 108]; tot.children.forEach((c, i) => { if (tw[i]) fix(tw[i])(c); }); }
  }
  const vc = f.findOne(n => n.name === 'Card/Vehicles & transporters');
  if (vc) { const W = { Loading: 92, Vehicle: 120, Driver: 140, 'Net MT': 72, Status: 112 }; for (const [k, w] of Object.entries(W)) for (const n of vc.findAll(n => n.name === 'Th/' + k || n.name === 'Td/' + k)) fix(w)(n); }
}
{ const v = F('Overlay · Request vehicle — validation'); const tf = v && v.findAll(n => n.type === 'INSTANCE' && n.mainComponent && n.mainComponent.parent && n.mainComponent.parent.name === 'Text field')[0]; if (tf) setP(tf, { 'Helper text': 'Exceeds the 31.85 MT balance' }); const nb = v && v.findAll(n => n.type === 'INSTANCE' && n.mainComponent && n.mainComponent.parent && n.mainComponent.parent.name === 'Text field')[1]; if (nb) setP(nb, { 'Helper text': 'For your records only' }); }
for (const n of ['Overlay · Request vehicle', 'Overlay · Request vehicle — sending', 'Overlay · Request vehicle — already asked', 'Overlay · Request vehicle — no phone', 'Overlay · Request vehicle — failed']) { const v = F(n); const nb = v && v.findAll(x => x.type === 'INSTANCE' && x.mainComponent && x.mainComponent.parent && x.mainComponent.parent.name === 'Text field')[1]; if (nb) setP(nb, { 'Helper text': 'For your records only' }); }
try { const ids = ['01 · Sign in', '02 · Dashboard', '04 · Order detail', '06 · Customers'].map(F); const names = ['A · Sign in → dashboard', 'B · Dashboard → orders → order detail', 'C · Order detail → request vehicle → sent / failed', 'D · Directory: customers, brokers, products, transporters']; page.flowStartingPoints = ids.map((n, i) => ({ nodeId: n.id, name: names[i] })); } catch (e) { ERR.push('flows ' + e.message); }

// 2 · Directory pages — remove fields that do not exist in the Foundry schema
async function dropField(fname, label) { const f = F(fname); const n = f && f.findOne(x => x.name === 'Field/' + label); if (n) { n.remove(); LOG.push('removed ' + label + ' @ ' + fname); } else ERR.push('field ' + label + ' not in ' + fname); }
async function relabel(fname, label, newLabel, newValue) { const f = F(fname); const n = f && f.findOne(x => x.name === 'Field/' + label); if (!n) { ERR.push('field ' + label + ' not in ' + fname); return; } const t = n.findAll(x => x.type === 'TEXT'); await setChars(t[0], newLabel); if (newValue != null) await setChars(t[1], newValue); n.name = 'Field/' + newLabel; LOG.push('relabel ' + label + ' → ' + newLabel); }
async function swapText(fname, from, to) { const f = F(fname); if (!f) return; for (const t of txts(f, c => c.includes(from))) { await setChars(t, t.characters.split(from).join(to)); LOG.push(fname + ': ' + from + ' → ' + to); } }
async function statusTo(fname, from, tone, label) { const f = F(fname); const b = f && f.findOne(n => n.name === 'Badge/' + from); if (!b) return; try { b.setProperties({ Tone: tone }); } catch (e) { ERR.push('tone ' + e.message); } setP(b, { Label: label }); b.name = 'Badge/' + label; LOG.push(fname + ': badge ' + from + ' → ' + label); }
// customers: no code, PAN, legal name, price list, notes; one ship-to address
const CD = '06b · Customer detail';
for (const l of ['Customer code', 'Legal name', 'PAN', 'Price list', 'Broker']) await dropField(CD, l);
await relabel(CD, 'Delivery sites', 'Ship to', 'Site 4, Wardha Road, Nagpur 440022');
await relabel(CD, 'Billing address', 'Address', '3rd floor, Shree Plaza, Dharampeth, Nagpur, MH 440010');
{ const f = F(CD); const nc = f && f.findOne(n => n.name === 'Card/Notes'); if (nc) { nc.remove(); LOG.push('removed customer Notes card'); } const nt = f && f.findOne(n => n.name === 'Tab/Notes'); if (nt) { nt.remove(); LOG.push('removed customer Notes tab'); } }
await swapText(CD, 'CUS-0007 · ', 'Builder · ');
{ const BT = { 'CUS-0003': 'Infrastructure', 'CUS-0007': 'Builder', 'CUS-0011': 'Fabricator', 'CUS-0014': 'Fabricator', 'CUS-0019': 'Contractor', 'CUS-0022': 'Trader', 'CUS-0025': 'Trader' }; const f = F('06 · Customers'); if (f) for (const t of txts(f, c => /^CUS-\d+$/.test(c))) { await setChars(t, BT[t.characters] || 'Customer'); } LOG.push('customer list: codes → business type'); }
await statusTo('06 · Customers', 'On hold', 'Neutral', 'Inactive');
// brokers: no code, no email, no legal-name column (PAN, notes and phones are real)
const BD = '07b · Broker detail';
await swapText(BD, 'BRK-001 · ', 'Commission agent · '); for (const l of ['Legal name', 'Email']) await dropField(BD, l);
{ const f = F('07 · Brokers'); if (f) for (const t of txts(f, c => /^BRK-\d+$/.test(c))) { await setChars(t, 'Commission agent'); } }
// transporters: name, contact, phone, address, GSTIN, notes only
const TD = '09b · Transporter detail';
await swapText(TD, 'TRN-002 · ', ''); for (const l of ['Legal name', 'Usual lanes', 'PAN', 'Email']) await dropField(TD, l);
await relabel(TD, 'Base', 'Address', null);
{ const f = F('09 · Transporters'); if (f) { for (const t of txts(f, c => /^TRN-\d+$/.test(c))) t.remove(); const th = f.findOne(n => n.name === 'Th/Base'); if (th) { const t = th.findOne(n => n.type === 'TEXT'); if (t) await setChars(t, 'City'); } } LOG.push('transporter list: codes removed'); }
await statusTo('09 · Transporters', 'Under review', 'Neutral', 'Inactive');
// products: rate lives on the order line, not the product; HSN is a real column
{ const f = F('08 · Products'); if (f) { const th = f.findOne(n => n.name === 'Th/Base rate'); if (th) { await setChars(th.findOne(n => n.type === 'TEXT'), 'HSN'); th.name = 'Th/HSN'; } const H = ['7214', '7214', '7214', '7216', '7216', '7208', '7217', '7214']; let i = 0; for (const td of f.findAll(n => n.name === 'Td/Base rate')) { const t = td.findOne(n => n.type === 'TEXT'); if (t) await setChars(t, H[i] || '7214'); td.name = 'Td/HSN'; i++; } LOG.push('products: Base rate → HSN (' + i + ' rows)'); await swapText('08 · Products', 'rates visible to Owner and office roles only', 'rates are set per order line'); } }
{ const d = F('Overlay · Product detail'); if (d) { const sec = d.findOne(n => n.name === 'Section/Commercial'); if (sec) { for (const r of sec.children.filter(c => c.type !== 'TEXT')) { const ts = r.findAll(n => n.type === 'TEXT'); if (ts[0] && /Base rate|GST/.test(ts[0].characters)) r.remove(); else if (ts[0] && ts[0].characters === 'HSN code') await setChars(ts[1], '7214'); } await setChars(sec.findOne(n => n.type === 'TEXT'), 'TAX'); sec.name = 'Section/Tax'; }
  const spec = d.findOne(n => n.name === 'Section/Specification'); if (spec) for (const r of spec.children.filter(c => c.type !== 'TEXT')) { const ts = r.findAll(n => n.type === 'TEXT'); if (ts[0] && ts[0].characters === 'Standard') { await setChars(ts[0], 'Std. weight'); await setChars(ts[1], '1.58 kg / m'); } if (ts[0] && ts[0].characters === 'Unit of sale') await setChars(ts[1], 'MT (company weight unit)'); }
  LOG.push('product drawer: base rate + GST removed'); } }
// stale "Open yard" links on tablet / mobile (the yard screen was removed)
for (const pg of figma.root.children.slice(1)) { await pg.loadAsync(); for (const t of pg.findAll(n => n.type === 'TEXT' && /Open yard/.test(n.characters))) { let p = t.parent; while (p && p.type !== 'INSTANCE' && p.type !== 'PAGE') p = p.parent; if (p && p.type === 'INSTANCE') { setP(p, { Label: 'Open orders' }); p.name = 'Button/Open orders'; try { await p.setReactionsAsync([]); } catch (e) { } } else await setChars(t, t.characters.replace('Open yard', 'Open orders')); LOG.push('Open yard → Open orders @ ' + pg.name); } }

// 3 · States boards: dashboard chart (loading / empty / error) and orders list (loading / error)
clear('Row label · Data states'); { const t = await T(null, 'Data states · dashboard chart and orders list', 'Display/Page title', 'text/primary', { name: 'Row label · Data states' }); page.appendChild(t); place(t, 0, -5300); }
async function stateBody(c, kind, ctx) {
  const b = AL(c, 'VERTICAL', { name: 'State/' + kind, gap: 10, pad: [0, 20, 20, 20], align: 'CENTER', justify: 'CENTER', h: ctx.h }); b.layoutSizingHorizontal = 'FILL';
  if (kind === 'Loading') { b.counterAxisAlignItems = 'MIN'; b.primaryAxisAlignItems = 'MAX'; const bars = AL(b, 'HORIZONTAL', { gap: 10, align: 'MAX', name: 'Skeleton' }); bars.layoutSizingHorizontal = 'FILL'; const hs = [0.42, 0.6, 0.35, 0.72, 0.55, 0.8, 0.48, 0.66, 0.38, 0.7, 0.58, 0.5, 0.62, 0.45]; for (const k of hs) { const r = R(bars, 20, Math.round((ctx.h - 70) * k), 'bg/surface-muted', { radius: 4, name: 'Skeleton bar' }); r.layoutSizingHorizontal = 'FILL'; } const l = AL(b, 'HORIZONTAL', { gap: 8, align: 'CENTER' }); await T(l, 'Loading dispatch data…', 'Caption/Default', 'text/tertiary'); return b; }
  icon(b, kind === 'Empty' ? 'chart' : 'x-circle', 24, kind === 'Empty' ? 'text/tertiary' : 'status/negative/fg');
  await T(b, ctx.title, 'Body/Strong', 'text/primary', { align: 'CENTER' }); const d = await T(b, ctx.desc, 'Body/Small', 'text/secondary', { align: 'CENTER', w: 420 });
  const a = AL(b, 'HORIZONTAL', { gap: 8, pad: [6, 0, 0, 0] }); btn(a, 'Secondary', ctx.action, kind === 'Empty' ? 'calendar' : 'refresh', { size: 'Small', name: 'Button/' + ctx.action });
  return b;
}
{ clear('Dashboard · chart states'); const B = AL(page, 'HORIZONTAL', { name: 'Dashboard · chart states', gap: 24, pad: 40, fill: 'bg/canvas', align: 'MIN' }); place(B, 0, -5200);
  const src = F('02 · Dashboard') && F('02 · Dashboard').findOne(n => n.name === 'Card/Dispatch volume');
  for (const [kind, ctx] of [['Loading', {}], ['Empty', { title: 'No dispatches in this range', desc: 'Nothing left the gate between 06 and 12 Oct for the selected company. Widen the range or clear filters.', action: 'Change range' }], ['Error', { title: 'Couldn’t load dispatch data', desc: 'The request timed out. No numbers are shown rather than stale ones. Try again, or check Integrations if it keeps failing.', action: 'Retry' }]]) {
    const W = AL(B, 'VERTICAL', { gap: 10, name: 'Chart · ' + kind }); await T(W, kind, 'Label/Overline', 'text/tertiary');
    let c; if (src) { c = src.clone(); W.appendChild(c); const keep = c.findOne(n => n.name === 'Card header'); for (const ch of c.children.slice()) if (ch !== keep) ch.remove(); const acts = keep && keep.findOne(n => n.name === 'Actions'); if (acts && kind !== 'Loading') acts.opacity = kind === 'Error' ? 0.4 : 1; } else { c = card(W, 'Card/Dispatch volume'); await cardHeader(c, 'Dispatched tonnage', 'Net MT that left the gate each day'); }
    c.name = 'Card/Dispatch volume · ' + kind; c.layoutSizingHorizontal = 'FIXED'; c.resize(760, c.height); c.layoutSizingVertical = 'HUG';
    const sb = await stateBody(c, kind, Object.assign({ h: 300 }, ctx));
  }
  const ch = B.findOne(n => n.name === 'Button/Change range'); if (ch && F('Overlay · Date range')) await react(ch, [go('Overlay · Date range', 'OVERLAY')]);
  const rt = B.findOne(n => n.name === 'Button/Retry'); if (rt) await react(rt, [go('02 · Dashboard')]);
}
async function ordersState(name, x, kind) {
  clear(name); const O = F('03 · Orders'); if (!O) { ERR.push('no orders'); return null; }
  const f = O.clone(); f.name = name; page.appendChild(f); place(f, x, -5200);
  const rows = f.findAll(n => n.name.startsWith('Row/ORD-')); if (!rows.length) { ERR.push('no order rows'); return f; }
  const tbl = rows[0].parent;
  if (kind === 'Loading') {
    for (const r of rows) { const h = r.height; const ws = r.children.map(c => c.width); const i = tbl.children.indexOf(r); r.remove();
      const nr = AL(null, 'HORIZONTAL', { name: 'Row/skeleton', pad: [0, 12, 0, 12], align: 'CENTER', fill: 'bg/surface', strokeSides: [0, 0, 1, 0], stroke: 'border/subtle' }); tbl.insertChild(i, nr); nr.layoutSizingHorizontal = 'FILL'; nr.resize(nr.width, h); nr.layoutSizingVertical = 'FIXED';
      for (const w of ws) { const c = AL(nr, 'HORIZONTAL', { pad: [0, 8, 0, 8], align: 'CENTER' }); c.resize(Math.max(w, 1), 20); c.layoutSizingHorizontal = 'FIXED'; if (w > 40) R(c, Math.round((w - 16) * 0.6), 10, 'bg/surface-muted', { radius: 4, name: 'Skeleton' }); } }
    const ts = f.findOne(n => n.name === 'Pagination'); if (ts) ts.opacity = 0.4; }
  else { const idx = tbl.children.indexOf(rows[0]); for (const r of rows) r.remove(); const pg = f.findOne(n => n.name === 'Pagination'); if (pg) pg.remove();
    const b = AL(null, 'VERTICAL', { name: 'State/Error', gap: 10, pad: [56, 24, 56, 24], align: 'CENTER', fill: 'bg/surface' }); tbl.insertChild(idx, b); b.layoutSizingHorizontal = 'FILL';
    icon(b, 'x-circle', 24, 'status/negative/fg'); await T(b, 'Couldn’t load orders', 'Body/Strong', 'text/primary'); await T(b, 'The server didn’t respond. Your tab, search and filters are kept — retry to load them again.', 'Body/Small', 'text/secondary', { align: 'CENTER', w: 440 });
    const a = AL(b, 'HORIZONTAL', { gap: 8, pad: [6, 0, 0, 0] }); const r = btn(a, 'Secondary', 'Retry', 'refresh', { size: 'Small', name: 'Button/Retry' }); if (r) await react(r, [go('03 · Orders')]);
    const t = inst('Toast|Tone=Error', f); if (t) { t.layoutPositioning = 'ABSOLUTE'; t.x = 1440 - 32 - 380; t.y = 80; setP(t, { Title: 'Orders didn’t load', Description: 'Stays here until it is resolved or dismissed.', Action: 'Retry', 'Show action': true }); t.name = 'Toast · persistent error'; } }
  return f;
}
const OL = await ordersState('03 · Orders — loading', 2620, 'Loading');
const OE = await ordersState('03 · Orders — error', 4160, 'Error');

// 4 · Look
const od = F('04 · Order detail'); await od.screenshot({ scale: 0.5 });
const side = od.findOne(n => n.name === 'Side column'); if (side) await side.screenshot({ scale: 1 });
{ const dl = F('Overlay · Request vehicle — validation').findOne(n => n.name === 'Dialog'); if (dl) await dl.screenshot({ scale: 0.8 }); }
await F('Dashboard · chart states').screenshot({ scale: 0.3 });
if (OE) await OE.screenshot({ scale: 0.3 }); if (OL) await OL.screenshot({ scale: 0.25 });
await F('06b · Customer detail').screenshot({ scale: 0.3 });
return { log: LOG, errors: [...new Set(ERR)].slice(0, 40), errCount: ERR.length };
