// ---------- v2 · A: Geist, navigation, removals, dashboard ----------
const NOTE = {};
// Geist swap for every text style (falls back to Inter if the family is missing)
const avail = (await figma.listAvailableFontsAsync()).filter(f => f.fontName.family === 'Geist').map(f => f.fontName.style);
NOTE.geistStyles = avail;
const GMAP = { 'Regular': 'Regular', 'Medium': 'Medium', 'Semi Bold': avail.includes('SemiBold') ? 'SemiBold' : 'Semi Bold', 'Bold': 'Bold' };
if (avail.length) {
  for (const st of new Set(Object.values(GMAP))) { if (avail.includes(st)) await figma.loadFontAsync({ family: 'Geist', style: st }); }
  for (const s of await figma.getLocalTextStylesAsync()) {
    const want = GMAP[s.fontName.style];
    if (s.fontName.family === 'Inter' && want && avail.includes(want)) { try { s.fontName = { family: 'Geist', style: want }; } catch (e) { ERR.push('style ' + s.name + ' ' + e.message); } }
  }
  NOTE.font = 'Geist';
} else NOTE.font = 'Inter (Geist unavailable)';
await loadLib();
const page = figma.root.children[1];
await figma.setCurrentPageAsync(page);
const F = n => page.children.find(c => c.name === n);

// ---- Sidebar: Operations (Dashboard, Orders) · Directory (Customers, Brokers, Products, Transporters) · Administration
{
  const sb = LIB['Sidebar'];
  const byName = n => sb.children.find(c => c.name === n);
  for (const n of ['Nav/Yard & weighbridge', 'Nav/Reports', 'Nav/Activity']) { const x = byName(n); if (x) x.remove(); }
  const gls = sb.children.filter(c => c.name === 'Group label');
  const dir = gls[1];
  if (dir) { const t = dir.findOne(n => n.type === 'TEXT'); if (t) t.characters = 'Directory'; }
  const cust = byName('Nav/Customers');
  if (cust && dir) sb.insertChild(sb.children.indexOf(dir) + 1, cust);
  let at = cust ? sb.children.indexOf(cust) + 1 : 0;
  for (const [label, ic] of [['Brokers', 'building'], ['Products', 'layers'], ['Transporters', 'truck']]) {
    if (byName('Nav/' + label)) { at = sb.children.indexOf(byName('Nav/' + label)) + 1; continue; }
    const ni = LIB['Nav item|State=Default'].createInstance(); sb.insertChild(at++, ni); ni.layoutSizingHorizontal = 'FILL'; ni.name = 'Nav/' + label;
    setP(ni, { Label: label, Icon: LIB['Icon/' + ic].id, 'Show count': false });
    recolor(ni.findOne(n => n.name === 'Icon'), 'nav/text-muted');
  }
  NOTE.nav = sb.children.filter(c => c.name.startsWith('Nav/') || c.name === 'Group label').map(c => c.name === 'Group label' ? '§' + (c.findOne(n => n.type === 'TEXT') || {}).characters : c.name.slice(4));
}
// ---- Remove Reports, Activity and Yard; re-flow rows
for (const n of ['05 · Yard & weighbridge', '07 · Reports', '08 · Activity']) { const f = F(n); if (f) f.remove(); }
const mv = (n, x, y) => { const f = F(n); if (f) { f.x = x; f.y = y; } };
mv('06 · Customers', 6160, 0); mv('09 · Settings', 7700, 1600); mv('10 · Users & access', 9240, 1600); mv('11 · Integrations', 10780, 1600);
{ const a = F('Row label · Desktop'); if (a && a.type === 'TEXT') a.characters = 'Desktop · 1440 — Operations & customers'; const b = F('Row label · Insights'); if (b && b.type === 'TEXT') b.characters = 'Desktop · 1440 — Directory & administration'; }

// ---- Dashboard v2
{ const old = F('02 · Dashboard'); if (old) old.remove(); }
const D = await screen('02 · Dashboard', 1540, 0, 'Dashboard', 'Operations', 'Dashboard');
await pageHeader(D.content, 'Dispatch overview', 'Nagpur Works · 05 – 11 Oct 2026 · as of 17:58 IST · illustrative sample data', async a => {
  const dr = inst('Date range trigger', a); await txt(dr, 'Range', '05 – 11 Oct 2026'); await txt(dr, 'Comparison', 'vs. prior 7 days'); if (dr) dr.name = 'Date range';
  btn(a, 'Secondary', 'Export', 'download'); btn(a, 'Primary', 'New order', 'plus');
});
const kr = AL(D.content, 'HORIZONTAL', { name: 'KPI row', gap: 16 }); kr.layoutSizingHorizontal = 'FILL';
async function kpi2(label, value, unit, outcome, dval, baseline, spark) {
  const k = inst('KPI card|State=Default', kr); k.layoutSizingHorizontal = 'FILL';
  setP(k, { Label: label, Value: value, Unit: unit, Baseline: baseline, 'Show sparkline': !!spark });
  const d = k.findOne(n => n.name === 'Delta');
  if (d) { if (outcome) { try { d.setProperties({ Outcome: outcome }); } catch (e) { } setP(d, { Value: dval }); } else d.visible = false; }
  if (spark && spark.length) { const c = k.findOne(n => n.name === 'Current period'); if (c) { try { c.vectorPaths = [{ windingRule: 'NONZERO', data: spark.map((p, i) => (i ? 'L ' : 'M ') + p[0] + ' ' + p[1]).join(' ') }]; } catch (e) { } } }
  k.name = 'KPI/' + label; return k;
}
await kpi2('Total orders', '128', 'orders', 'Favourable', '▲ 9.4%', 'vs. prior 7 days · 117', [[0, 22], [24, 20], [48, 21], [72, 17], [96, 18], [120, 14], [144, 15], [168, 12], [192, 13], [216, 9], [238, 8]]);
await kpi2('Active shipments', '22', 'vehicles', null, '', '9 loading · 3 ready · 1 held · 9 assigned', null);
await kpi2('On-time dispatch rate', '91.4', '%', 'Unfavourable', '▼ 2.1 pp', '64 of 70 due-dated orders · prior 93.5%', [[0, 8], [24, 9], [48, 8], [72, 10], [96, 9], [120, 11], [144, 12], [168, 11], [192, 13], [216, 14], [238, 15]]);
await kpi2('At-risk shipments', '7', 'orders', 'Unfavourable', '▲ 2', 'vs. yesterday 5 · plus 7 exceptions', null);

// chart row
const r2 = AL(D.content, 'HORIZONTAL', { name: 'Performance row', gap: 16, align: 'MIN' }); r2.layoutSizingHorizontal = 'FILL';
const cc = card(r2, 'Card/Dispatch volume'); cc.layoutSizingHorizontal = 'FILL';
const cca = await cardHeader(cc, 'Dispatched tonnage', 'Net MT that left the gate each day · same filters as the KPIs');
seg(cca, ['Day', 'Week'], 'Day');
const sumRow = AL(cc, 'HORIZONTAL', { name: 'Period summary', gap: 10, pad: [0, 20, 6, 20], align: 'CENTER' }); sumRow.layoutSizingHorizontal = 'FILL';
await T(sumRow, '10,798.70', 'Numeric/Large', 'text/primary', { tnum: true }); await T(sumRow, 'MT this period', 'Body/Small', 'text/tertiary');
delta(sumRow, 'Favourable', '▲ 6.9%'); await T(sumRow, 'vs. 10,104.80 MT on the same days last week', 'Caption/Default', 'text/tertiary', { tnum: true });
const lg = AL(cc, 'HORIZONTAL', { name: 'Legend', gap: 20, pad: [4, 20, 4, 20] }); lg.layoutSizingHorizontal = 'FILL';
legend(lg, 'Primary', 'This period'); legend(lg, 'Comparison', 'Prior 7 days');
const plotWrap = AL(cc, 'VERTICAL', { name: 'Plot', pad: [4, 20, 16, 12] }); plotWrap.layoutSizingHorizontal = 'FILL';
{
  const W = 728, H = 268, L = 52, Rr = 12, Tt = 12, B = 28, pw = W - L - Rr, ph = H - Tt - B, min = 1000, max = 2200;
  const fr = figma.createFrame(); fr.name = 'Line chart'; fr.fills = []; fr.resize(W, H); plotWrap.appendChild(fr); fr.clipsContent = false;
  const yv = v => Tt + ph - (v - min) / (max - min) * ph; const xv = i => L + i * pw / 6;
  for (let t = min; t <= max; t += 200) { R(fr, pw, 1, t === min ? 'border/default' : 'chart/grid', { x: L, y: Math.round(yv(t)), name: 'Grid ' + t }); const lt = await T(fr, t.toLocaleString('en-IN'), 'Chart/Axis', 'chart/axis', { tnum: true }); lt.textAutoResize = 'NONE'; lt.resize(L - 10, 14); lt.textAlignHorizontal = 'RIGHT'; lt.x = 0; lt.y = Math.round(yv(t) - 7); }
  const X = ['Mon 05', 'Tue 06', 'Wed 07', 'Thu 08', 'Fri 09', 'Sat 10', 'Sun 11'];
  for (let i = 0; i < 7; i++) { const t = await T(fr, X[i], 'Chart/Axis', 'chart/axis'); t.textAutoResize = 'NONE'; t.resize(48, 14); t.textAlignHorizontal = 'CENTER'; t.x = Math.round(xv(i) - 24); t.y = H - 18; }
  const yl = await T(fr, 'MT', 'Chart/Axis', 'chart/axis'); yl.x = 0; yl.y = 0;
  const prev = [1640.0, 1702.5, 1588.3, 1768.0, 1795.2, 1610.8, 1205.4];
  const cur = [1712.4, 1798.1, 1655.0, 1912.4, 1874.6, 1846.2];
  vec(fr, prev.map((v, i) => [xv(i), yv(v)]), 'chart/comparison', { sw: 1.5, dash: [4, 3], name: 'Prior 7 days' });
  const line = vec(fr, cur.map((v, i) => [xv(i), yv(v)]), 'chart/series-1', { sw: 2.25, name: 'This period' });
  // colour-matched shadow: same hue as the series, low opacity, restrained blur
  line.effects = [{ type: 'DROP_SHADOW', color: { r: 49 / 255, g: 87 / 255, b: 200 / 255, a: 0.22 }, offset: { x: 0, y: 6 }, radius: 10, spread: 0, visible: true, blendMode: 'NORMAL', showShadowBehindNode: false }];
  for (let i = 0; i < cur.length; i++) { const e = figma.createEllipse(); e.resize(7, 7); e.fills = [P('bg/surface')]; e.strokes = [P('chart/series-1')]; e.strokeWeight = 1.75; e.name = 'Point ' + X[i]; fr.appendChild(e); e.x = xv(i) - 3.5; e.y = yv(cur[i]) - 3.5; }
  const hx = xv(3);
  vec(fr, [[hx, Tt], [hx, Tt + ph]], 'border/strong', { sw: 1, dash: [2, 2], name: 'Hover rule' });
  const hp = figma.createEllipse(); hp.name = 'Hover point'; hp.resize(11, 11); hp.fills = [P('chart/series-1')]; hp.strokes = [P('bg/surface')]; hp.strokeWeight = 2.5; hp.effects = [{ type: 'DROP_SHADOW', color: { r: 49 / 255, g: 87 / 255, b: 200 / 255, a: 0.3 }, offset: { x: 0, y: 2 }, radius: 6, spread: 0, visible: true, blendMode: 'NORMAL', showShadowBehindNode: false }]; fr.appendChild(hp); hp.x = hx - 5.5; hp.y = yv(1912.4) - 5.5;
  const tip = inst('Tooltip|Type=Chart', fr); if (tip) { tip.x = hx + 14; tip.y = yv(1912.4) - 6; await txt(tip, 'Title', 'Thu, 08 Oct 2026'); tip.name = 'Tooltip (hover state)'; }
  const best = AL(fr, 'HORIZONTAL', { name: 'Annotation · period high', pad: [1, 6, 1, 6], radius: 4, fill: 'status/positive/bg' }); await T(best, 'Period high', 'Chart/Axis', 'status/positive/fg'); best.x = hx - 30; best.y = yv(1912.4) - 26;
  const sun = await T(fr, 'Sun 11 · not yet reported', 'Chart/Axis', 'text/tertiary', { name: 'Gap note' }); sun.x = xv(6) - 120; sun.y = yv(1450);
}
// order status overview
const os = card(r2, 'Card/Order status', { w: 352 });
const osa = await cardHeader(os, 'Order status', '68 open orders · 73 closed this period'); btn(osa, 'Ghost', 'Orders', 'arrow-up-right', { size: 'Small', name: 'Button/Open orders' });
const osb = AL(os, 'VERTICAL', { name: 'Body', gap: 14, pad: [4, 20, 20, 20] }); osb.layoutSizingHorizontal = 'FILL';
const OPEN = [['Awaiting vehicle', 24, 'chart/series-4'], ['Vehicle assigned', 9, 'chart/series-3'], ['Loading', 12, 'chart/series-1'], ['Part dispatched', 23, 'chart/series-2']];
const bar = figma.createFrame(); bar.name = 'Open-order mix'; bar.resize(312, 8); bar.cornerRadius = 4; bar.fills = []; bar.layoutMode = 'HORIZONTAL'; bar.itemSpacing = 2; bar.primaryAxisSizingMode = 'FIXED'; bar.counterAxisSizingMode = 'FIXED'; osb.appendChild(bar); bar.layoutSizingHorizontal = 'FILL'; bar.clipsContent = true;
for (const [n, v, tok] of OPEN) { const r = R(bar, 10, 8, tok, { name: n }); r.layoutGrow = v; }
const osl = AL(osb, 'VERTICAL', { name: 'Status list', gap: 0 }); osl.layoutSizingHorizontal = 'FILL';
async function srow(parent, n, v, tok, note) { const r = AL(parent, 'HORIZONTAL', { name: 'Status/' + n, gap: 10, align: 'CENTER', pad: [9, 0, 9, 0], strokeSides: [0, 0, 1, 0], stroke: 'border/subtle' }); r.layoutSizingHorizontal = 'FILL'; if (tok) R(r, 8, 8, tok, { radius: 2, name: 'Key' }); const l = await T(r, n, 'Body/Small', 'text/secondary'); l.layoutSizingHorizontal = 'FILL'; if (note) await T(r, note, 'Caption/Default', 'text/tertiary'); await T(r, String(v), 'Numeric/Medium', 'text/primary', { tnum: true }); icon(r, 'chevron-right', 14, 'text/disabled'); return r; }
for (const [n, v, tok] of OPEN) await srow(osl, n, v, tok);
await T(osb, 'Closed in period', 'Label/Overline', 'text/tertiary');
const osc = AL(osb, 'VERTICAL', { name: 'Closed list', gap: 0 }); osc.layoutSizingHorizontal = 'FILL';
await srow(osc, 'Completed', 70, null, 'status = Completed'); await srow(osc, 'Cancelled', 3, null, 'not counted as completed');

// needs attention: at-risk vs exceptions, mutually exclusive
const na = card(D.content, 'Card/Needs attention'); na.layoutSizingHorizontal = 'FILL';
const naa = await cardHeader(na, 'Needs attention', 'Each order appears in one list only. Exceptions take precedence over risk.');
btn(naa, 'Ghost', 'View all in Orders', 'arrow-up-right', { size: 'Small', name: 'Button/Attention in orders' });
const nab = AL(na, 'HORIZONTAL', { name: 'Lists', gap: 0, strokeSides: [1, 0, 0, 0], stroke: 'border/subtle', align: 'MIN' }); nab.layoutSizingHorizontal = 'FILL';
const LISTS = [
  ['At risk', '7', 'warning', 'Open, due within 2 days, and the remaining balance has no vehicle assigned.', [['ORD-24812', 'Ashoka Realty', '6.50 MT unassigned', 'Due tomorrow', 'Warning'], ['ORD-24822', 'Shreeji Structurals', '18.00 MT unassigned', 'Due 12 Oct', 'Warning'], ['ORD-24809', 'Sahyadri Engineering', '23.80 MT unassigned', 'Due 13 Oct', 'Warning']]],
  ['Exceptions', '7', 'negative', 'Past due with a balance still to dispatch, or a loading held on a weight exception.', [['ORD-24798', 'Rewa Cements Pvt Ltd', '33.00 MT outstanding', '4 days overdue', 'Negative'], ['ORD-24817', 'Narmada Steel Traders', 'LD-55094 +0.38 MT over tolerance', 'Held on weight', 'Negative'], ['ORD-24805', 'Godavari Constructions', '28.00 MT outstanding', '2 days overdue', 'Negative']]]
];
for (let li = 0; li < LISTS.length; li++) {
  const [title, count, tone, rule, rows] = LISTS[li];
  const col = AL(nab, 'VERTICAL', { name: 'List/' + title, gap: 0, pad: [16, 20, 12, 20], strokeSides: li === 0 ? [0, 1, 0, 0] : [0, 0, 0, 0], stroke: 'border/subtle' }); col.layoutSizingHorizontal = 'FILL';
  const h = AL(col, 'HORIZONTAL', { gap: 8, align: 'CENTER', name: 'Header' }); h.layoutSizingHorizontal = 'FILL';
  const ic = AL(h, 'HORIZONTAL', { w: 24, h: 24, radius: 6, fill: 'status/' + tone + '/bg', align: 'CENTER', justify: 'CENTER' }); icon(ic, tone === 'warning' ? 'clock' : 'alert', 14, 'status/' + tone + '/fg');
  const ht = await T(h, title, 'Heading/Card', 'text/primary'); await T(h, count, 'Numeric/Medium', 'status/' + tone + '/fg', { tnum: true });
  const sp = AL(h, 'HORIZONTAL', { name: 'Spacer' }); sp.layoutSizingHorizontal = 'FILL';
  await T(h, 'View ' + count, 'Button/Small', 'text/link', { name: 'Link/' + title });
  await T(col, rule, 'Caption/Default', 'text/tertiary', { fill: true, name: 'Eligibility rule' });
  const lst = AL(col, 'VERTICAL', { gap: 0, pad: [8, 0, 0, 0], name: 'Rows' }); lst.layoutSizingHorizontal = 'FILL';
  for (const [o, c, d, when, bt] of rows) {
    const r = AL(lst, 'HORIZONTAL', { name: 'Row/' + o, gap: 12, align: 'CENTER', pad: [10, 0, 10, 0], strokeSides: [0, 0, 1, 0], stroke: 'border/subtle' }); r.layoutSizingHorizontal = 'FILL';
    await T(r, o, 'Body/Small strong', 'accent/text', { tnum: true, w: 92 });
    const tx = AL(r, 'VERTICAL', { gap: 0 }); tx.layoutSizingHorizontal = 'FILL'; await T(tx, c, 'Body/Small', 'text/primary'); await T(tx, d, 'Caption/Default', 'text/tertiary', { tnum: true });
    badge(r, bt, when); icon(r, 'chevron-right', 14, 'text/disabled');
  }
}
// active shipments
const as = card(D.content, 'Card/Active shipments'); as.layoutSizingHorizontal = 'FILL';
const asa = await cardHeader(as, 'Active shipments', '22 vehicles between assignment and gate-out · most recently changed first');
btn(asa, 'Ghost', 'View all', 'arrow-up-right', { size: 'Small', name: 'Button/All shipments' });
await simpleTable(as, [['Vehicle', 150, 'L', 'num'], ['Loading', 110, 'L', 'num'], ['Order · customer', 'F', 'L'], ['Stage', 170, 'L', 'badge'], ['Quantity', 120, 'R'], ['Updated', 110, 'L', 'num']], [
  ['MH 40 BG 2291', 'LD-55102', 'ORD-24819 · Kaveri Builders', ['Info', 'Loading · Bay 3'], '31.85 MT', '17:20'],
  ['MH 40 CT 5531', 'LD-55094', 'ORD-24817 · Narmada Steel Traders', ['Negative', 'Held on weight'], '27.48 MT', '16:58'],
  ['MH 32 Q 6620', 'LD-55093', 'ORD-24805 · Godavari Constructions', ['Positive', 'Ready to dispatch'], '30.94 MT', '16:41'],
  ['MH 49 AT 0442', 'LD-55101', 'ORD-24809 · Sahyadri Engineering', ['Neutral', 'Vehicle assigned'], '28.00 MT', '15:12']], { rowH: 48 });

await D.f.screenshot({ scale: 0.45 });
const sbShot = LIB['Sidebar']; await sbShot.screenshot({ scale: 0.6 });
return { NOTE, dashboard: D.f.id, h: Math.round(D.f.height), errors: ERR.slice(0, 30), errCount: ERR.length };
