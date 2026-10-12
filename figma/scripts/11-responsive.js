await loadLib();
const page = figma.root.children[2];
await figma.setCurrentPageAsync(page);
function vec(parent, pts, token, o) {
  o = o || {};
  const v = figma.createVector(); v.name = o.name || 'Line';
  v.vectorPaths = [{ windingRule: 'NONZERO', data: pts.map((p, i) => (i ? 'L ' : 'M ') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ') + (o.close ? ' Z' : '') }];
  if (o.area) { v.fills = [o.area]; v.strokes = []; } else { v.strokes = [P(token)]; v.strokeWeight = o.sw || 1.5; v.fills = []; v.strokeCap = 'ROUND'; v.strokeJoin = 'ROUND'; }
  if (o.dash) v.dashPattern = o.dash;
  if (parent) parent.appendChild(v); return v;
}
async function txt(node, layer, value) { if (!node) return; const t = node.findOne(n => n.type === 'TEXT' && n.name === layer); if (!t) { ERR.push('no layer ' + layer); return; } t.characters = String(value); }
function clear(name) { for (const n of page.children.slice()) if (n.name === name) n.remove(); }
function btn(parent, variant, label, ic, o) {
  o = o || {};
  const b = inst('Button|Variant=' + variant + ', State=' + (o.state || 'Default') + ', Size=' + (o.size || 'Medium'), parent);
  if (!b) return null;
  const props = { Label: label, 'Show icon': !!ic }; if (ic) props.Icon = LIB['Icon/' + ic].id; setP(b, props);
  if (ic) recolor(b.findOne(n => n.name === 'Icon'), variant === 'Primary' || variant === 'Danger' ? 'text/inverse' : variant === 'Ghost' ? 'text/secondary' : 'text/primary');
  if (o.touch) { b.resize(b.width, 44); }
  if (o.fill) b.layoutSizingHorizontal = 'FILL';
  b.name = o.name || ('Button/' + label); return b;
}
function card(parent, name, o) { o = o || {}; const c = AL(parent, 'VERTICAL', Object.assign({ name, fill: 'bg/surface', stroke: 'border/default', radius: 8, gap: 0, clip: true }, o)); c.layoutSizingHorizontal = 'FILL'; return c; }
async function cardHeader(parent, title, sub) { const h = AL(parent, 'HORIZONTAL', { name: 'Card header', pad: [16, 16, 12, 16], gap: 12, align: 'CENTER' }); h.layoutSizingHorizontal = 'FILL'; const t = AL(h, 'VERTICAL', { name: 'Titles', gap: 2 }); t.layoutSizingHorizontal = 'FILL'; await T(t, title, 'Heading/Card', 'text/primary'); if (sub) await T(t, sub, 'Caption/Default', 'text/tertiary', { fill: true }); return AL(h, 'HORIZONTAL', { name: 'Actions', gap: 8, align: 'CENTER' }); }
function badge(parent, tone, label) { const b = inst('Badge|Tone=' + tone, parent); setP(b, { Label: label }); return b; }
function seg(parent, labels, sel) { const tr = AL(parent, 'HORIZONTAL', { name: 'Segmented', pad: 2, radius: 6, fill: 'bg/surface-muted', gap: 2 }); for (const l of labels) { const s = inst('Segment|Selected=' + (l === sel ? 'True' : 'False'), tr); setP(s, { Label: l }); } return tr; }
async function kpi(parent, label, value, unit, outcome, dval, baseline, spark) {
  const k = inst('KPI card|State=Default', parent); if (!k) return null; k.layoutSizingHorizontal = 'FILL';
  setP(k, { Label: label, Value: value, Unit: unit, Baseline: baseline, 'Show sparkline': !!spark });
  const d = k.findOne(n => n.name === 'Delta'); if (d) { try { d.setProperties({ Outcome: outcome }); } catch (e) { } setP(d, { Value: dval }); }
  return k;
}
async function miniChart(parent, W, H) {
  const fr = figma.createFrame(); fr.name = 'Line chart'; fr.fills = []; fr.resize(W, H); parent.appendChild(fr);
  const L = 40, Tt = 6, B = 22, pw = W - L - 8, ph = H - Tt - B; const min = 1000, max = 2200;
  const yv = v => Tt + ph - (v - min) / (max - min) * ph; const xv = i => L + i * pw / 6;
  for (const t of [1200, 1600, 2000]) { R(fr, pw, 1, 'chart/grid', { x: L, y: Math.round(yv(t)) }); const lt = await T(fr, t.toLocaleString('en-IN'), 'Chart/Axis', 'chart/axis', { tnum: true }); lt.textAutoResize = 'NONE'; lt.resize(L - 6, 14); lt.textAlignHorizontal = 'RIGHT'; lt.x = 0; lt.y = Math.round(yv(t) - 7); }
  const xs = ['M', 'T', 'W', 'T', 'F', 'S', 'S']; for (let i = 0; i < 7; i++) { const t = await T(fr, xs[i], 'Chart/Axis', 'chart/axis'); t.textAutoResize = 'NONE'; t.resize(16, 14); t.textAlignHorizontal = 'CENTER'; t.x = xv(i) - 8; t.y = H - 16; }
  vec(fr, [[L, yv(1800)], [L + pw, yv(1800)]], 'chart/target', { sw: 1, dash: [4, 4], name: 'Target' });
  const prev = [1640, 1702.5, 1588.3, 1768, 1795.2, 1610.8, 1205.4], cur = [1712.4, 1798.1, 1655, 1912.4, 1874.6, 1846.2];
  vec(fr, prev.map((v, i) => [xv(i), yv(v)]), 'chart/comparison', { sw: 1.25, dash: [4, 3], name: 'Prior week' });
  const pts = cur.map((v, i) => [xv(i), yv(v)]);
  vec(fr, pts.concat([[pts[pts.length - 1][0], Tt + ph], [pts[0][0], Tt + ph]]), null, { close: true, name: 'Area', area: { type: 'GRADIENT_LINEAR', gradientTransform: [[0, 1, 0], [-1, 0, 1]], gradientStops: [{ position: 0, color: { r: 0.192, g: 0.341, b: 0.784, a: 0.14 } }, { position: 1, color: { r: 0.192, g: 0.341, b: 0.784, a: 0 } }] } });
  vec(fr, pts, 'chart/series-1', { sw: 2, name: 'This week' });
  return fr;
}
// device frame
function device(name, x, w, h, o) {
  clear(name);
  const f = figma.createFrame(); f.name = name; f.resize(w, h); f.fills = [P('bg/canvas')]; page.appendChild(f); place(f, x, o && o.y || 0);
  f.layoutMode = 'VERTICAL'; f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED'; f.itemSpacing = 0; f.clipsContent = true;
  return f;
}
async function appBar(parent, title, o) {
  o = o || {};
  const b = AL(parent, 'HORIZONTAL', { name: 'App bar', pad: [0, o.pad || 16, 0, o.pad || 8], gap: 4, align: 'CENTER', h: 56, fill: o.dark ? 'nav/bg' : 'bg/surface', strokeSides: [0, 0, 1, 0], stroke: o.dark ? 'nav/bg-active' : 'border/default' }); b.layoutSizingHorizontal = 'FILL';
  const m = inst('Icon button|State=Default', b); setP(m, { Icon: LIB['Icon/' + (o.back ? 'chevron-left' : 'menu')].id }); m.resize(44, 44); m.name = o.back ? 'Back' : 'Menu';
  if (!o.back) { const lg = figma.createFrame(); lg.name = 'Logo/Mark'; lg.resize(24, 24); lg.cornerRadius = 6; lg.fills = [P('accent/default')]; R(lg, 12, 3, 'text/inverse', { radius: 1, x: 6, y: 7 }); R(lg, 9, 3, 'text/inverse', { radius: 1, x: 6, y: 11, opacity: 0.8 }); R(lg, 6, 3, 'text/inverse', { radius: 1, x: 6, y: 15, opacity: 0.6 }); b.appendChild(lg); }
  const t = await T(b, title, 'Heading/Section', 'text/primary', { name: 'Title' }); t.layoutSizingHorizontal = 'FILL';
  for (const ic of (o.actions || ['search', 'bell'])) { const a = inst('Icon button|State=Default', b); setP(a, { Icon: LIB['Icon/' + ic].id }); a.resize(44, 44); a.name = 'Action/' + ic; }
  return b;
}
async function tabBar(parent, active) {
  const tb = AL(parent, 'HORIZONTAL', { name: 'Tab bar', pad: [6, 8, 22, 8], fill: 'bg/surface', strokeSides: [1, 0, 0, 0], stroke: 'border/default' }); tb.layoutSizingHorizontal = 'FILL';
  for (const [l, ic] of [['Dashboard', 'dashboard'], ['Orders', 'package'], ['Yard', 'truck'], ['Reports', 'chart'], ['More', 'menu']]) { const it = AL(tb, 'VERTICAL', { name: 'Tab/' + l, gap: 2, align: 'CENTER', pad: [6, 0, 4, 0] }); it.layoutSizingHorizontal = 'FILL'; try { it.minHeight = 48; } catch (e) { } icon(it, ic, 22, l === active ? 'accent/default' : 'text/tertiary'); await T(it, l, 'Caption/Default', l === active ? 'accent/text' : 'text/tertiary'); }
  return tb;
}
async function orderCard(parent, id, cust, prod, qty, pct, tone, stage) {
  const c = AL(parent, 'VERTICAL', { name: 'Order card/' + id, gap: 8, pad: 14, radius: 8, fill: 'bg/surface', stroke: 'border/default' }); c.layoutSizingHorizontal = 'FILL';
  const t = AL(c, 'HORIZONTAL', { gap: 8, align: 'CENTER' }); t.layoutSizingHorizontal = 'FILL'; const i = await T(t, id, 'Body/Small strong', 'accent/text', { tnum: true }); i.layoutSizingHorizontal = 'FILL'; badge(t, tone, stage);
  await T(c, cust, 'Body/Strong', 'text/primary');
  const m = AL(c, 'HORIZONTAL', { gap: 8, align: 'CENTER' }); m.layoutSizingHorizontal = 'FILL'; const p = await T(m, prod, 'Caption/Default', 'text/secondary'); p.layoutSizingHorizontal = 'FILL'; await T(m, qty, 'Numeric/Table', 'text/primary', { tnum: true });
  const tr = figma.createFrame(); tr.name = 'Progress'; tr.resize(100, 4); tr.cornerRadius = 2; tr.fills = [P('bg/surface-muted')]; tr.layoutMode = 'HORIZONTAL'; tr.primaryAxisSizingMode = 'FIXED'; tr.counterAxisSizingMode = 'FIXED'; c.appendChild(tr); tr.layoutSizingHorizontal = 'FILL';
  if (pct > 0) { const a = R(tr, 10, 4, 'accent/default', { radius: 2 }); a.layoutGrow = pct; } const b = R(tr, 10, 4, null); b.layoutGrow = 100 - pct;
  return c;
}

clear('Responsive header');
const hdr = AL(page, 'VERTICAL', { name: 'Responsive header', gap: 8, w: 1400 }); place(hdr, 0, -260);
await T(hdr, 'Responsive', 'Label/Overline', 'accent/text');
await T(hdr, 'Tablet 834 & mobile 390 — the hierarchy is re-composed, not shrunk', 'Display/Page title', 'text/primary');
await T(hdr, '≥ 1280: ink sidebar + 12-col grid, 4-up KPIs, full tables.  768–1279: sidebar becomes an app bar + navigation drawer, KPIs 2-up, tables become card lists, dialogs stay centred (max 560).  < 768: bottom tab bar, KPIs stacked with the most important first, charts limited to 7 points, dialogs become bottom sheets, every target ≥ 44 px, no horizontal scroll.', 'Body/Default', 'text/secondary', { w: 1100 });

// ---------- TABLET · Dashboard ----------
const TD = device('Tablet · Dashboard', 0, 834, 1194);
await appBar(TD, 'Dispatch overview', { actions: ['search', 'bell'] });
const tdc = AL(TD, 'VERTICAL', { name: 'Content', gap: 16, pad: 24 }); tdc.layoutSizingHorizontal = 'FILL';
const tdh = AL(tdc, 'HORIZONTAL', { gap: 8, align: 'CENTER', name: 'Header' }); tdh.layoutSizingHorizontal = 'FILL';
const tdt = AL(tdh, 'VERTICAL', { gap: 2 }); tdt.layoutSizingHorizontal = 'FILL'; await T(tdt, 'Nagpur Works', 'Heading/Section', 'text/primary'); await T(tdt, 'As of 17:58 IST · Illustrative data', 'Caption/Default', 'text/tertiary');
const tdr = inst('Date range trigger', tdh); await txt(tdr, 'Range', '05 – 11 Oct'); btn(tdh, 'Primary', 'New order', 'plus');
for (const pair of [[['Orders raised today', '128', 'orders', 'Favourable', '▲ 12.3%', 'vs. yesterday 114'], ['Dispatched today', '1,846.20', 'MT', 'Favourable', '▲ 8.4%', 'vs. yesterday 1,703.10']], [['Average yard dwell', '2h 14m', 'per vehicle', 'Unfavourable', '▲ 9.0%', 'vs. 7-day avg 2h 03m'], ['Freight cost per MT', '₹ 1,184', 'avg.', 'Favourable', '▼ 3.1%', 'vs. Sep ₹ 1,222']]]) { const r = AL(tdc, 'HORIZONTAL', { gap: 16, name: 'KPI row' }); r.layoutSizingHorizontal = 'FILL'; for (const k of pair) await kpi(r, ...k, true); }
const tcc = card(tdc, 'Card/Dispatch volume'); const tca = await cardHeader(tcc, 'Dispatch volume', 'Net MT per day'); seg(tca, ['Week', 'Month'], 'Week');
const tpl = AL(tcc, 'VERTICAL', { pad: [0, 16, 16, 8] }); tpl.layoutSizingHorizontal = 'FILL'; await miniChart(tpl, 754, 220);
const tyc = card(tdc, 'Card/Vehicles on site'); const tya = await cardHeader(tyc, 'Vehicles on site · 22', 'Live · updated 17:58'); btn(tya, 'Ghost', 'Open yard', 'arrow-up-right', { size: 'Small' });
const tyr = AL(tyc, 'HORIZONTAL', { gap: 12, pad: [0, 16, 16, 16] }); tyr.layoutSizingHorizontal = 'FILL';
for (const [n, v, tok] of [['At gate', 6, 'chart/series-4'], ['WB · empty', 4, 'chart/series-3'], ['Loading', 9, 'chart/series-1'], ['WB · loaded', 3, 'chart/series-2']]) { const s = AL(tyr, 'VERTICAL', { gap: 6, pad: 12, radius: 6, fill: 'bg/surface-subtle', stroke: 'border/subtle' }); s.layoutSizingHorizontal = 'FILL'; R(s, 24, 4, tok, { radius: 2 }); await T(s, String(v), 'Numeric/Large', 'text/primary', { tnum: true }); await T(s, n, 'Caption/Default', 'text/secondary'); }

// ---------- TABLET · Orders ----------
const TO = device('Tablet · Orders', 934, 834, 1194);
await appBar(TO, 'Orders', { actions: ['search', 'bell'] });
const toc = AL(TO, 'VERTICAL', { name: 'Content', gap: 16, pad: 24 }); toc.layoutSizingHorizontal = 'FILL';
const tot = AL(toc, 'HORIZONTAL', { gap: 20, name: 'Tabs', strokeSides: [0, 0, 1, 0], stroke: 'border/default' }); tot.layoutSizingHorizontal = 'FILL';
for (const [l, n, a] of [['All', '128', 1], ['Outstanding', '74', 0], ['Overdue', '6', 0], ['Completed', '48', 0]]) { const t = inst('Tab|State=' + (a ? 'Active' : 'Default'), tot); setP(t, { Label: l, Count: n, 'Show count': true }); }
const tof = AL(toc, 'HORIZONTAL', { gap: 8, align: 'CENTER', name: 'Toolbar' }); tof.layoutSizingHorizontal = 'FILL';
const tos = AL(tof, 'HORIZONTAL', { gap: 8, pad: [0, 12, 0, 12], h: 44, radius: 6, fill: 'bg/surface', stroke: 'border/default', align: 'CENTER', name: 'Search' }); tos.layoutSizingHorizontal = 'FILL'; icon(tos, 'search', 16, 'text/tertiary'); await T(tos, 'Search orders…', 'Body/Default', 'text/tertiary');
btn(tof, 'Secondary', 'Filters · 2', 'filter', { touch: true }); btn(tof, 'Primary', 'New order', 'plus', { touch: true });
const tog = AL(toc, 'HORIZONTAL', { gap: 16, name: 'Order cards' }); tog.layoutSizingHorizontal = 'FILL'; tog.layoutWrap = 'WRAP'; tog.counterAxisSpacing = 16;
for (const o of [['ORD-24822', 'Shreeji Structurals', 'MS Angle 50×50×6', '18.00 MT', 0, 'Neutral', 'Awaiting vehicle'], ['ORD-24821', 'Vardhan Infra Projects', 'TMT Fe 550D · 12 mm', '64.00 MT', 51, 'Positive', 'Part dispatched'], ['ORD-24819', 'Kaveri Builders', 'TMT Fe 550D · 16 mm', '120.00 MT', 73, 'Info', 'Loading'], ['ORD-24817', 'Narmada Steel Traders', 'MS Channel 100×50', '42.00 MT', 100, 'Positive', 'Completed'], ['ORD-24809', 'Sahyadri Engineering', 'TMT Fe 500 · 10 mm', '75.00 MT', 68, 'Info', 'At weighbridge'], ['ORD-24805', 'Godavari Constructions', 'MS Plate 10 mm', '28.00 MT', 0, 'Warning', 'Overdue']]) { const c = await orderCard(tog, ...o); c.layoutSizingHorizontal = 'FIXED'; c.resize(385, c.height); c.layoutSizingVertical = 'HUG'; }

// ---------- MOBILE · Dashboard ----------
const MD = device('Mobile · Dashboard', 1868, 390, 1300);
await appBar(MD, 'Overview', { actions: ['bell'] });
const mdc = AL(MD, 'VERTICAL', { name: 'Content', gap: 12, pad: [16, 16, 16, 16] }); mdc.layoutSizingHorizontal = 'FILL'; mdc.layoutSizingVertical = 'FILL';
const mdh = AL(mdc, 'HORIZONTAL', { gap: 8, align: 'CENTER' }); mdh.layoutSizingHorizontal = 'FILL'; const mdt = await T(mdh, 'Nagpur Works · 17:58', 'Caption/Default', 'text/tertiary'); mdt.layoutSizingHorizontal = 'FILL'; const mdr = inst('Date range trigger', mdh); await txt(mdr, 'Range', 'This week'); { const c = mdr && mdr.findOne(n => n.name === 'Comparison'); if (c) c.visible = false; }
const mb = inst('Banner|Tone=Warning', mdc); mb.layoutSizingHorizontal = 'FILL'; setP(mb, { Message: '6 orders overdue for dispatch', Action: 'Review' });
await kpi(mdc, 'Dispatched today', '1,846.20', 'MT', 'Favourable', '▲ 8.4%', 'vs. yesterday 1,703.10', true);
const mk = AL(mdc, 'HORIZONTAL', { gap: 12, name: 'Compact KPIs' }); mk.layoutSizingHorizontal = 'FILL';
for (const [l, v, d, tone] of [['Orders today', '128', '▲ 12.3%', 'Favourable'], ['Yard dwell', '2h 14m', '▲ 9.0%', 'Unfavourable']]) { const c = AL(mk, 'VERTICAL', { gap: 6, pad: 14, radius: 8, fill: 'bg/surface', stroke: 'border/default', name: 'Compact KPI/' + l }); c.layoutSizingHorizontal = 'FILL'; await T(c, l, 'Caption/Default', 'text/secondary'); await T(c, v, 'Numeric/Large', 'text/primary', { tnum: true }); const dd = inst('Delta|Outcome=' + tone, c); setP(dd, { Value: d }); }
const mcc = card(mdc, 'Card/Dispatch volume'); await cardHeader(mcc, 'Dispatch · this week', 'Net MT/day · target 1,800'); const mpl = AL(mcc, 'VERTICAL', { pad: [0, 12, 12, 4] }); mpl.layoutSizingHorizontal = 'FILL'; await miniChart(mpl, 340, 170);
const myc = card(mdc, 'Card/Yard'); const mya = await cardHeader(myc, 'Vehicles on site', '22 vehicles · 1 waiting > 3 h'); btn(mya, 'Ghost', 'Open', 'chevron-right', { size: 'Small' });
await tabBar(MD, 'Dashboard');

// ---------- MOBILE · Orders ----------
const MO = device('Mobile · Orders', 2358, 390, 1300);
await appBar(MO, 'Orders', { actions: ['search', 'plus'] });
const moc = AL(MO, 'VERTICAL', { name: 'Content', gap: 12, pad: 16 }); moc.layoutSizingHorizontal = 'FILL'; moc.layoutSizingVertical = 'FILL';
const mch = AL(moc, 'HORIZONTAL', { gap: 8, name: 'Chips (scrolls horizontally inside its own row)', clip: true }); mch.layoutSizingHorizontal = 'FILL';
for (const [st, l] of [['Applied', 'Outstanding · 74'], ['Default', 'Overdue'], ['Default', 'Loading'], ['Default', 'Customer']]) { const c = inst('Filter chip|State=' + st, mch); setP(c, { Label: l }); c.resize(c.width, 36); }
for (const o of [['ORD-24805', 'Godavari Constructions', 'MS Plate 10 mm', '28.00 MT', 0, 'Warning', 'Overdue'], ['ORD-24819', 'Kaveri Builders', 'TMT Fe 550D · 16 mm', '120.00 MT', 73, 'Info', 'Loading'], ['ORD-24821', 'Vardhan Infra Projects', 'TMT Fe 550D · 12 mm', '64.00 MT', 51, 'Positive', 'Part dispatched'], ['ORD-24822', 'Shreeji Structurals', 'MS Angle 50×50×6', '18.00 MT', 0, 'Neutral', 'Awaiting vehicle'], ['ORD-24809', 'Sahyadri Engineering', 'TMT Fe 500 · 10 mm', '75.00 MT', 68, 'Info', 'At weighbridge']]) await orderCard(moc, ...o);
await tabBar(MO, 'Orders');

// ---------- MOBILE · Order detail ----------
const MOD = device('Mobile · Order detail', 2848, 390, 1300);
await appBar(MOD, 'ORD-24819', { back: true, actions: ['more'] });
const mdd = AL(MOD, 'VERTICAL', { name: 'Content', gap: 12, pad: 16 }); mdd.layoutSizingHorizontal = 'FILL'; mdd.layoutSizingVertical = 'FILL';
const mdh2 = AL(mdd, 'VERTICAL', { gap: 6 }); mdh2.layoutSizingHorizontal = 'FILL'; badge(mdh2, 'Info', 'Loading · 73% dispatched'); await T(mdh2, 'Kaveri Builders', 'Display/Page title', 'text/primary'); await T(mdh2, 'TMT Fe 550D · 16 mm · raised 08 Oct', 'Body/Small', 'text/secondary');
const msg = AL(mdd, 'HORIZONTAL', { gap: 12, name: 'Stats' }); msg.layoutSizingHorizontal = 'FILL'; msg.layoutWrap = 'WRAP'; msg.counterAxisSpacing = 12;
for (const [l, v] of [['Ordered', '120.00 MT'], ['Dispatched', '88.15 MT'], ['Balance', '31.85 MT'], ['Value', '₹ 70,08,000']]) { const s = AL(msg, 'VERTICAL', { gap: 2, pad: 12, radius: 8, fill: 'bg/surface', stroke: 'border/default', w: 173 }); await T(s, l, 'Caption/Default', 'text/tertiary'); await T(s, v, 'Numeric/Medium', 'text/primary', { tnum: true }); }
const vst = card(mdd, 'Card/Progress'); await cardHeader(vst, 'Progress', null);
const vsl = AL(vst, 'VERTICAL', { gap: 0, pad: [0, 16, 16, 16] }); vsl.layoutSizingHorizontal = 'FILL';
for (const [n, m, s] of [['Order raised', '08 Oct · 10:12', 'done'], ['Vehicle assigned', '08 Oct · 15:40', 'done'], ['At gate', '09 Oct · 08:05', 'done'], ['Loading', 'Bay 3 · 62% of LD-55102', 'current'], ['Dispatched', 'Pending', 'todo']]) { const r = AL(vsl, 'HORIZONTAL', { gap: 12, align: 'MIN', pad: [0, 0, 14, 0] }); r.layoutSizingHorizontal = 'FILL'; const d = AL(r, 'HORIZONTAL', { w: 20, h: 20, radius: 10, align: 'CENTER', justify: 'CENTER', fill: s === 'done' ? 'accent/default' : s === 'current' ? 'bg/surface' : 'bg/surface-muted', stroke: s === 'current' ? 'accent/default' : s === 'todo' ? 'border/default' : null, sw: 2 }); if (s === 'done') icon(d, 'check', 12, 'text/inverse'); const tx = AL(r, 'VERTICAL', { gap: 0 }); tx.layoutSizingHorizontal = 'FILL'; await T(tx, n, 'Body/Small strong', s === 'todo' ? 'text/tertiary' : 'text/primary'); await T(tx, m, 'Caption/Default', s === 'current' ? 'accent/text' : 'text/tertiary', { tnum: true }); }
const sab = AL(MOD, 'HORIZONTAL', { name: 'Sticky action bar', gap: 8, pad: [12, 16, 28, 16], fill: 'bg/surface', strokeSides: [1, 0, 0, 0], stroke: 'border/default' }); sab.layoutSizingHorizontal = 'FILL';
btn(sab, 'Secondary', 'PDF', 'file', { touch: true }); btn(sab, 'Primary', 'Assign vehicle', 'truck', { touch: true, fill: true });

// ---------- MOBILE · Navigation drawer ----------
const MN = device('Mobile · Navigation drawer', 3338, 390, 844);
MN.layoutMode = 'NONE'; MN.fills = [P('bg/canvas')];
R(MN, 390, 844, 'bg/scrim', { opacity: 0.48, name: 'Scrim (tap to close)', x: 0, y: 0 });
const dr = inst('Sidebar', MN); dr.resize(300, 844); dr.x = 0; dr.y = 0; dr.name = 'Drawer · Sidebar';
{ const nav = dr.findOne(n => n.name === 'Nav/Dashboard'); if (nav) { try { nav.setProperties({ State: 'Active' }); } catch (e) { } recolor(nav.findOne(n => n.name === 'Icon'), 'nav/indicator'); } }

// ---------- MOBILE · Assign vehicle bottom sheet ----------
const MS = device('Mobile · Assign vehicle sheet', 3828, 390, 844);
MS.layoutMode = 'NONE';
R(MS, 390, 844, 'bg/scrim', { opacity: 0.48, name: 'Scrim (tap to close)', x: 0, y: 0 });
const sh = AL(MS, 'VERTICAL', { name: 'Bottom sheet', w: 390, gap: 16, pad: [8, 16, 32, 16], fill: 'bg/surface' }); sh.topLeftRadius = 16; sh.topRightRadius = 16;
await fx(sh, 'Elevation/4 · Modal');
const hd = AL(sh, 'HORIZONTAL', { justify: 'CENTER' }); hd.layoutSizingHorizontal = 'FILL'; R(hd, 36, 4, 'border/strong', { radius: 2, name: 'Grabber' });
const sht = AL(sh, 'VERTICAL', { gap: 2 }); sht.layoutSizingHorizontal = 'FILL'; await T(sht, 'Assign vehicle', 'Heading/Section', 'text/primary'); await T(sht, 'ORD-24819 · 31.85 MT balance', 'Body/Small', 'text/secondary', { tnum: true });
for (const [l, v] of [['Vehicle', 'MH 12 RT 4418 · 32 T'], ['Loading bay', 'Bay 2 · free from 18:10']]) { const g = AL(sh, 'VERTICAL', { gap: 6 }); g.layoutSizingHorizontal = 'FILL'; await T(g, l, 'Label/Default', 'text/secondary'); const s = inst('Select|State=Default', g); s.layoutSizingHorizontal = 'FILL'; s.resize(s.width, 44); setP(s, { Value: v }); }
const qf = inst('Text field|State=Filled', sh); qf.layoutSizingHorizontal = 'FILL'; setP(qf, { Label: 'Planned quantity (MT)', Value: '31.85', 'Helper text': 'Balance on order: 31.85 MT', 'Show helper': true });
btn(sh, 'Primary', 'Assign vehicle', null, { touch: true, fill: true }); btn(sh, 'Ghost', 'Cancel', null, { touch: true, fill: true });
sh.x = 0; sh.y = 844 - sh.height;

for (const f of [TD, TO, MD, MO, MOD, MN, MS]) await f.screenshot({ scale: f.width > 500 ? 0.3 : 0.4 });
return { frames: [TD, TO, MD, MO, MOD, MN, MS].map(f => f.name + ' ' + f.id), errors: ERR.slice(0, 40), errCount: ERR.length };
