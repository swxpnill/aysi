async function orderRow(parent, r, st) {
  const row = inst('Table row · Orders|State=' + (st || 'Default'), parent); if (!row) return null; row.layoutSizingHorizontal = 'FILL';
  await txt(row, 'Order', r[0]); await txt(row, 'Customer', r[1]); await txt(row, 'Product', r[2]); await txt(row, 'Ordered MT', r[3]); await txt(row, 'Dispatched', r[4]); await txt(row, 'Progress value', Math.round(r[5] * 100) + '%'); await txt(row, 'Ordered', r[6]);
  const fill = row.findOne(n => n.name === 'Fill'); if (fill) { try { fill.resize(Math.max(72 * r[5], 0.01), 4); fill.visible = r[5] > 0; } catch (e) { } }
  const stg = row.findOne(n => n.name === 'Stage'); if (stg) { try { stg.setProperties({ Tone: r[7] }); } catch (e) { ERR.push('tone ' + e.message); } setP(stg, { Label: r[8] }); }
  row.name = 'Row/' + r[0];
  return row;
}
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
      await T(c, v, i === 0 && o.firstLink ? 'Body/Small strong' : (a === 'R' ? 'Numeric/Table' : 'Body/Small'), i === 0 && o.firstLink ? 'accent/text' : (i === 1 ? 'text/primary' : 'text/secondary'), { tnum: a === 'R' || kind === 'num' });
    }
  }
}
function tabsRow(parent, items, active) {
  const r = AL(parent, 'HORIZONTAL', { name: 'Tabs', gap: 24, strokeSides: [0, 0, 1, 0], stroke: 'border/default' }); r.layoutSizingHorizontal = 'FILL';
  for (const [l, n] of items) { const t = inst('Tab|State=' + (l === active ? 'Active' : 'Default'), r); setP(t, n != null ? { Label: l, Count: n, 'Show count': true } : { Label: l, 'Show count': false }); if (t) t.name = 'Tab/' + l; }
  return r;
}
function chip(parent, st, label) { const c = inst('Filter chip|State=' + st, parent); setP(c, { Label: label }); return c; }
async function searchBox(parent, ph, w) { const s = AL(parent, 'HORIZONTAL', { name: 'Search', gap: 8, pad: [0, 12, 0, 12], radius: 6, fill: 'bg/surface', stroke: 'border/default', align: 'CENTER', w: w || 300, h: 36 }); icon(s, 'search', 16, 'text/tertiary'); await T(s, ph, 'Body/Small', 'text/tertiary'); return s; }

// ================= ORDERS =================
const O = await screen('03 · Orders', 3080, 0, 'Orders', 'Operations', 'Orders');
await pageHeader(O.content, 'Orders', 'Every order raised at Nagpur Works, and how far it has travelled.', async a => { btn(a, 'Secondary', 'Import', 'upload'); btn(a, 'Secondary', 'Export', 'download'); btn(a, 'Primary', 'New order', 'plus'); });
tabsRow(O.content, [['All', '128'], ['Outstanding', '74'], ['Overdue', '6'], ['Completed', '48'], ['Cancelled', null]], 'All');
const tool = AL(O.content, 'HORIZONTAL', { name: 'Toolbar', gap: 8, align: 'CENTER' }); tool.layoutSizingHorizontal = 'FILL';
await searchBox(tool, 'Search by order, customer or product…', 300);
chip(tool, 'Applied', 'Stage: Loading, Awaiting vehicle'); chip(tool, 'Default', 'Customer'); chip(tool, 'Default', 'Product');
const tsp = AL(tool, 'HORIZONTAL', { name: 'Spacer' }); tsp.layoutSizingHorizontal = 'FILL';
const odr = inst('Date range trigger', tool); await txt(odr, 'Range', '01 – 10 Oct 2026'); { const cmp = odr && odr.findOne(n => n.name === 'Comparison'); if (cmp) cmp.visible = false; }
btn(tool, 'Ghost', 'Columns', 'sliders', { size: 'Small' });
const bulk = AL(O.content, 'HORIZONTAL', { name: 'Bulk action bar (2 selected)', gap: 8, pad: [6, 8, 6, 14], radius: 6, fill: 'accent/subtle', stroke: 'accent/border', align: 'CENTER' }); bulk.layoutSizingHorizontal = 'FILL';
const bl = await T(bulk, '2 orders selected · 184.00 MT', 'Body/Small strong', 'accent/text', { tnum: true }); bl.layoutSizingHorizontal = 'FILL';
btn(bulk, 'Ghost', 'Assign vehicle', 'truck', { size: 'Small' }); btn(bulk, 'Ghost', 'Export', 'download', { size: 'Small' }); const cxl = btn(bulk, 'Ghost', 'Cancel orders', 'trash', { size: 'Small', name: 'Button/Cancel orders' }); recolor(cxl.findOne(n => n.name === 'Icon'), 'status/negative/fg'); await txt(cxl, 'Label', 'Cancel orders'); const lab = cxl.findOne(n => n.name === 'Label'); if (lab) lab.fills = [P('status/negative/fg')];
btn(bulk, 'Ghost', 'Clear', 'x', { size: 'Small' });
const ot = card(O.content, 'Card/Orders table'); ot.layoutSizingHorizontal = 'FILL';
const oth = inst('Table header · Orders', ot); oth.layoutSizingHorizontal = 'FILL';
const OR = [['ORD-24822', 'Shreeji Structurals', 'MS Angle 50×50×6', '18.00', '0.00', 0, '10 Oct 2026', 'Neutral', 'Awaiting vehicle'], ['ORD-24821', 'Vardhan Infra Projects', 'TMT Fe 550D · 12 mm', '64.00', '32.40', 0.51, '10 Oct 2026', 'Positive', 'Part dispatched'], ['ORD-24819', 'Kaveri Builders', 'TMT Fe 550D · 16 mm', '120.00', '88.15', 0.73, '08 Oct 2026', 'Info', 'Loading'], ['ORD-24817', 'Narmada Steel Traders', 'MS Channel 100×50', '42.00', '42.00', 1, '09 Oct 2026', 'Positive', 'Completed'], ['ORD-24812', 'Ashoka Realty', 'Binding wire 18 G', '6.50', '0.00', 0, '08 Oct 2026', 'Neutral', 'Awaiting vehicle'], ['ORD-24809', 'Sahyadri Engineering', 'TMT Fe 500 · 10 mm', '75.00', '51.20', 0.68, '08 Oct 2026', 'Info', 'At weighbridge'], ['ORD-24805', 'Godavari Constructions', 'MS Plate 10 mm', '28.00', '0.00', 0, '07 Oct 2026', 'Warning', 'Overdue'], ['ORD-24801', 'Vardhan Infra Projects', 'TMT Fe 550D · 20 mm', '96.00', '41.60', 0.43, '07 Oct 2026', 'Info', 'Loading'], ['ORD-24798', 'Rewa Cements Pvt Ltd', 'MS Angle 65×65×6', '33.00', '0.00', 0, '06 Oct 2026', 'Warning', 'Overdue']];
for (let i = 0; i < OR.length; i++) await orderRow(ot, OR[i], (i === 1 || i === 2) ? 'Selected' : i === 5 ? 'Hover' : 'Default');
const pgn = inst('Pagination', ot); pgn.layoutSizingHorizontal = 'FILL';

// ================= ORDER DETAIL =================
const OD = await screen('04 · Order detail', 4620, 0, 'Orders', 'Orders', 'ORD-24819');
const back = AL(OD.content, 'HORIZONTAL', { name: 'Back link', gap: 6, align: 'CENTER' }); icon(back, 'chevron-left', 16, 'text/link'); await T(back, 'All orders', 'Body/Small strong', 'text/link');
const odph = await pageHeader(OD.content, 'ORD-24819', 'Raised 08 Oct 2026, 10:12 by Anil Kumar · Nagpur Works', async a => { btn(a, 'Secondary', 'Download PDF', 'file'); btn(a, 'Secondary', 'Edit', 'pencil'); btn(a, 'Primary', 'Assign vehicle', 'truck'); const m = inst('Icon button|State=Default', a); if (m) m.name = 'More actions'; });
{ const tt = odph.children[0]; const t0 = tt.children[0]; const tr = AL(null, 'HORIZONTAL', { name: 'Title row', gap: 12, align: 'CENTER' }); tt.insertChild(0, tr); tr.appendChild(t0); badge(tr, 'Info', 'Loading · 73% dispatched'); }
const stepC = card(OD.content, 'Card/Progress', { pad: [20, 24, 20, 24], gap: 0 }); stepC.layoutSizingHorizontal = 'FILL'; stepC.layoutMode = 'HORIZONTAL';
const STEPS = [['Order raised', '08 Oct · 10:12', 'done'], ['Vehicle assigned', '08 Oct · 15:40', 'done'], ['At gate', '09 Oct · 08:05', 'done'], ['Loading', 'Bay 3 · 62% of LD-55102', 'current'], ['Dispatched', 'Pending', 'todo']];
for (let i = 0; i < STEPS.length; i++) {
  const [n, m, s] = STEPS[i];
  const st = AL(stepC, 'VERTICAL', { name: 'Step/' + n, gap: 10 }); st.layoutSizingHorizontal = 'FILL';
  const line = AL(st, 'HORIZONTAL', { name: 'Track', gap: 8, align: 'CENTER' }); line.layoutSizingHorizontal = 'FILL';
  const dot = AL(line, 'HORIZONTAL', { name: 'Marker', w: 20, h: 20, radius: 10, align: 'CENTER', justify: 'CENTER', fill: s === 'done' ? 'accent/default' : s === 'current' ? 'bg/surface' : 'bg/surface-muted', stroke: s === 'current' ? 'accent/default' : s === 'todo' ? 'border/default' : null, sw: 2 });
  if (s === 'done') icon(dot, 'check', 12, 'text/inverse'); if (s === 'current') R(dot, 8, 8, 'accent/default', { radius: 4 });
  if (i < STEPS.length - 1) { const ln = R(line, 10, 2, s === 'done' ? 'accent/default' : 'border/default', { radius: 1 }); ln.layoutSizingHorizontal = 'FILL'; }
  await T(st, n, 'Body/Small strong', s === 'todo' ? 'text/tertiary' : 'text/primary');
  await T(st, m, 'Caption/Default', s === 'current' ? 'accent/text' : 'text/tertiary', { tnum: true });
}
const two = AL(OD.content, 'HORIZONTAL', { name: 'Columns', gap: 16, align: 'MIN' }); two.layoutSizingHorizontal = 'FILL';
const lc = AL(two, 'VERTICAL', { name: 'Primary column', gap: 16 }); lc.layoutSizingHorizontal = 'FILL';
const sumC = card(lc, 'Card/Summary'); sumC.layoutSizingHorizontal = 'FILL';
await cardHeader(sumC, 'TMT Fe 550D · 16 mm', 'Fe 550D thermo-mechanically treated bar · IS 1786');
const stats = AL(sumC, 'HORIZONTAL', { name: 'Stats', pad: [4, 20, 16, 20], gap: 0 }); stats.layoutSizingHorizontal = 'FILL';
for (const [l, v, u] of [['Ordered', '120.00', 'MT'], ['Dispatched', '88.15', 'MT'], ['Balance', '31.85', 'MT'], ['Order value', '₹ 70,08,000', '']]) { const s = AL(stats, 'VERTICAL', { name: 'Stat/' + l, gap: 4, pad: [0, 16, 0, 0] }); s.layoutSizingHorizontal = 'FILL'; await T(s, l, 'Caption/Default', 'text/tertiary'); const vr = AL(s, 'HORIZONTAL', { gap: 4, align: 'BASELINE', name: 'Value' }); await T(vr, v, 'Numeric/Large', 'text/primary', { tnum: true }); if (u) await T(vr, u, 'Body/Small', 'text/tertiary'); }
const pbar = AL(sumC, 'VERTICAL', { name: 'Progress', gap: 8, pad: [0, 20, 20, 20] }); pbar.layoutSizingHorizontal = 'FILL';
const track = figma.createFrame(); track.name = 'Track'; track.resize(600, 6); track.cornerRadius = 3; track.fills = [P('bg/surface-muted')]; pbar.appendChild(track); track.layoutSizingHorizontal = 'FILL'; track.layoutMode = 'HORIZONTAL'; track.primaryAxisSizingMode = 'FIXED'; track.counterAxisSizingMode = 'FIXED';
const tf = R(track, 10, 6, 'accent/default', { radius: 3, name: 'Fill' }); tf.layoutGrow = 73; const tr2 = R(track, 10, 6, null, { name: 'Remainder' }); tr2.layoutGrow = 27;
await T(pbar, '73% dispatched across 3 vehicles · 1 vehicle loading now', 'Caption/Default', 'text/secondary', { tnum: true });
const det = AL(sumC, 'HORIZONTAL', { name: 'Details', pad: [16, 20, 20, 20], gap: 24, strokeSides: [1, 0, 0, 0], stroke: 'border/subtle' }); det.layoutSizingHorizontal = 'FILL'; det.layoutWrap = 'WRAP'; det.counterAxisSpacing = 16;
for (const [l, v] of [['Rate', '₹ 58,400 / MT'], ['Broker', 'Mehta & Sons Brokerage'], ['Delivery', 'Site 4, Wardha Road, Nagpur'], ['Payment terms', '30 days from dispatch']]) { const d = AL(det, 'VERTICAL', { gap: 2, w: 240, name: 'Detail/' + l }); await T(d, l, 'Caption/Default', 'text/tertiary'); await T(d, v, 'Body/Small strong', 'text/primary', { tnum: true }); }
const ldC = card(lc, 'Card/Loadings'); ldC.layoutSizingHorizontal = 'FILL';
const lda = await cardHeader(ldC, 'Loadings against this order', '4 loadings · 88.15 MT net dispatched');
btn(lda, 'Secondary', 'Add loading', 'plus', { size: 'Small' });
await simpleTable(ldC, [['Vehicle', 'F', 'L'], ['Reference', 110, 'L', 'num'], ['Status', 130, 'L', 'badge'], ['Net MT', 90, 'R'], ['Bay / time', 150, 'L', 'num']], [['MH 40 BG 2291', 'LD-55102', ['Info', 'Loading'], '—', 'Bay 3 · 62%'], ['MH 31 CQ 7710', 'LD-55088', ['Positive', 'Dispatched'], '31.20', '09 Oct · 14:22'], ['MH 12 RT 4418', 'LD-55079', ['Positive', 'Dispatched'], '28.50', '09 Oct · 12:48'], ['MH 49 AT 0442', 'LD-55071', ['Positive', 'Dispatched'], '28.45', '09 Oct · 11:05']]);
const rc = AL(two, 'VERTICAL', { name: 'Side column', gap: 16, w: 352 });
const cuC = card(rc, 'Card/Customer'); cuC.layoutSizingHorizontal = 'FILL';
const cua = await cardHeader(cuC, 'Customer', null); btn(cua, 'Ghost', 'Open', 'arrow-up-right', { size: 'Small' });
const cuh = AL(cuC, 'HORIZONTAL', { name: 'Identity', gap: 12, pad: [0, 20, 16, 20], align: 'CENTER' }); cuh.layoutSizingHorizontal = 'FILL';
const cav = inst('Avatar|Size=40', cuh); setP(cav, { Initials: 'KB' });
const cun = AL(cuh, 'VERTICAL', { gap: 0, name: 'Name' }); await T(cun, 'Kaveri Builders', 'Body/Strong', 'text/primary'); await T(cun, 'GSTIN 27AAKCK4821M1Z5', 'Caption/Default', 'text/tertiary', { tnum: true });
const cud = AL(cuC, 'VERTICAL', { name: 'Fields', gap: 0, pad: [0, 20, 8, 20] }); cud.layoutSizingHorizontal = 'FILL';
for (const [l, v] of [['Contact', 'Arjun Kulkarni'], ['Phone', '+91 98220 41157'], ['City', 'Nagpur, MH'], ['Outstanding', '412.60 MT across 5 orders']]) { const r = AL(cud, 'HORIZONTAL', { name: 'Field/' + l, pad: [10, 0, 10, 0], strokeSides: [1, 0, 0, 0], stroke: 'border/subtle', justify: 'SPACE_BETWEEN' }); r.layoutSizingHorizontal = 'FILL'; await T(r, l, 'Body/Small', 'text/tertiary'); await T(r, v, 'Body/Small strong', 'text/primary', { tnum: true }); }
const acC = card(rc, 'Card/Order activity'); acC.layoutSizingHorizontal = 'FILL';
await cardHeader(acC, 'Activity', 'Most recent first');
const acl = AL(acC, 'VERTICAL', { name: 'Timeline', gap: 16, pad: [0, 20, 20, 20] }); acl.layoutSizingHorizontal = 'FILL';
for (const [ic, tok, t, m] of [['truck', 'accent/text', 'LD-55102 started loading at Bay 3', '17:20 · Rakesh S.'], ['scale', 'status/positive/fg', 'LD-55088 weighed out · 31.20 MT net', '09 Oct 14:22 · Weighbridge 1'], ['alert', 'status/warning/fg', 'Rate revised to ₹ 58,400 / MT', '08 Oct 16:02 · Priya R.'], ['package', 'text/secondary', 'Order raised · 120.00 MT', '08 Oct 10:12 · Anil K.']]) { const r = AL(acl, 'HORIZONTAL', { gap: 12, align: 'MIN', name: 'Event' }); r.layoutSizingHorizontal = 'FILL'; const w = AL(r, 'HORIZONTAL', { w: 28, h: 28, radius: 14, fill: 'bg/surface-muted', align: 'CENTER', justify: 'CENTER', name: 'Icon well' }); icon(w, ic, 14, tok); const tx = AL(r, 'VERTICAL', { gap: 2, name: 'Text' }); tx.layoutSizingHorizontal = 'FILL'; await T(tx, t, 'Body/Small', 'text/primary', { fill: true }); await T(tx, m, 'Caption/Default', 'text/tertiary', { tnum: true }); }

// ================= YARD =================
const Y = await screen('05 · Yard & weighbridge', 6160, 0, 'Yard & weighbridge', 'Operations', 'Yard & weighbridge');
await pageHeader(Y.content, 'Yard & weighbridge', 'Every vehicle on site and the stage it has reached. Updates every 30 seconds.', async a => { badge(a, 'Positive', 'Live · 17:58'); btn(a, 'Secondary', 'Weighbridge log', 'scale'); btn(a, 'Primary', 'Register arrival', 'plus'); });
const yb = inst('Banner|Tone=Negative', Y.content); yb.layoutSizingHorizontal = 'FILL'; setP(yb, { Message: 'Weighbridge 2 stopped reporting at 17:42. Loaded vehicles are being routed to Weighbridge 1.', Action: 'View device' });
const board = AL(Y.content, 'HORIZONTAL', { name: 'Board', gap: 16, align: 'MIN' }); board.layoutSizingHorizontal = 'FILL';
const COLSY = [['Reported at gate', 6, 'chart/series-4', [['MH 31 CQ 7710', 'Kaveri Builders', 'LD-55099', 'Arrived 14:53 · Gate 2', ['Warning', 'Waiting 3h 05m']], ['MH 40 AK 1180', 'Ashoka Realty', 'LD-55104', 'Arrived 15:51 · Gate 1', ['Neutral', 'Waiting 2h 07m']]]], ['Weighbridge · empty', 4, 'chart/series-3', [['MH 49 AT 0442', 'Sahyadri Engineering', 'LD-55101', 'Tare 11.24 T · WB 1', ['Info', 'Weighing']]]], ['Loading at bay', 9, 'chart/series-1', [['MH 40 BG 2291', 'Vardhan Infra Projects', 'LD-55102', 'Bay 3 · 62% loaded', ['Info', 'Loading'], 0.62], ['MH 27 X 9031', 'Rewa Cements', 'LD-55097', 'Bay 1 · 88% loaded', ['Info', 'Loading'], 0.88]]], ['Weighbridge · loaded', 3, 'chart/series-2', [['MH 40 CT 5531', 'Narmada Steel Traders', 'LD-55094', 'Net 27.48 T · limit 27.10 ± 0.25', ['Negative', 'Over tolerance +0.38 MT']], ['MH 32 Q 6620', 'Godavari Constructions', 'LD-55093', 'Gross 42.18 T · Net 30.94 T', ['Positive', 'Within tolerance']]]]];
for (const [name, count, tok, items] of COLSY) {
  const col = AL(board, 'VERTICAL', { name: 'Column/' + name, gap: 10, pad: 12, radius: 8, fill: 'bg/surface-muted' }); col.layoutSizingHorizontal = 'FILL';
  const ch = AL(col, 'HORIZONTAL', { name: 'Column header', gap: 8, align: 'CENTER', pad: [2, 4, 4, 4] }); ch.layoutSizingHorizontal = 'FILL';
  R(ch, 8, 8, tok, { radius: 2, name: 'Key' }); const cl = await T(ch, name, 'Body/Small strong', 'text/primary'); cl.layoutSizingHorizontal = 'FILL'; await T(ch, String(count), 'Numeric/Medium', 'text/secondary', { tnum: true });
  for (const it of items) {
    const c = AL(col, 'VERTICAL', { name: 'Vehicle/' + it[0], gap: 8, pad: 14, radius: 8, fill: 'bg/surface', stroke: it[4][0] === 'Negative' ? 'status/negative/border' : 'border/default' }); c.layoutSizingHorizontal = 'FILL';
    await fx(c, 'Elevation/1 · Card');
    const top = AL(c, 'HORIZONTAL', { gap: 8, align: 'CENTER', name: 'Top' }); top.layoutSizingHorizontal = 'FILL';
    const pl = await T(top, it[0], 'Body/Strong', 'text/primary', { tnum: true }); pl.layoutSizingHorizontal = 'FILL'; await T(top, it[2], 'Caption/Default', 'text/tertiary', { tnum: true });
    await T(c, it[1], 'Body/Small', 'text/secondary');
    await T(c, it[3], 'Caption/Default', 'text/tertiary', { tnum: true });
    if (it[5]) { const t = figma.createFrame(); t.name = 'Bay progress'; t.resize(200, 4); t.cornerRadius = 2; t.fills = [P('bg/surface-muted')]; t.layoutMode = 'HORIZONTAL'; t.primaryAxisSizingMode = 'FIXED'; t.counterAxisSizingMode = 'FIXED'; c.appendChild(t); t.layoutSizingHorizontal = 'FILL'; const f1 = R(t, 10, 4, 'accent/default', { radius: 2 }); f1.layoutGrow = Math.round(it[5] * 100); const f2 = R(t, 10, 4, null); f2.layoutGrow = 100 - Math.round(it[5] * 100); }
    badge(c, it[4][0], it[4][1]);
    if (it[4][0] === 'Negative') { const ar = AL(c, 'HORIZONTAL', { gap: 8, name: 'Actions' }); btn(ar, 'Secondary', 'Review weight', null, { size: 'Small' }); btn(ar, 'Ghost', 'Re-weigh', null, { size: 'Small' }); }
  }
  if (count > items.length) { const more = btn(col, 'Ghost', 'Show ' + (count - items.length) + ' more', 'chevron-down', { size: 'Small' }); more.layoutSizingHorizontal = 'FILL'; }
}
const cl2 = card(Y.content, 'Card/Completed loadings'); cl2.layoutSizingHorizontal = 'FILL';
const cla = await cardHeader(cl2, 'Completed loadings', 'Today · 41 loadings · 1,846.20 MT net'); btn(cla, 'Ghost', 'Export', 'download', { size: 'Small' });
await simpleTable(cl2, [['Reference', 120, 'L', 'num'], ['Vehicle', 140, 'L', 'num'], ['Customer', 'F', 'L'], ['Gross T', 100, 'R'], ['Net MT', 100, 'R'], ['Status', 150, 'L', 'badge'], ['Weighed out', 120, 'L', 'num']], [['LD-55093', 'MH 32 Q 6620', 'Godavari Constructions', '42.18', '30.94', ['Positive', 'Dispatched'], '17:12'], ['LD-55090', 'MH 40 BG 1902', 'Narmada Steel Traders', '38.70', '27.10', ['Positive', 'Dispatched'], '16:40'], ['LD-55088', 'MH 31 CQ 7710', 'Kaveri Builders', '43.05', '31.20', ['Positive', 'Dispatched'], '14:22']], { firstLink: true });

await O.f.screenshot({ scale: 0.4 });
await OD.f.screenshot({ scale: 0.4 });
await Y.f.screenshot({ scale: 0.4 });
return { orders: O.f.id, detail: OD.f.id, yard: Y.f.id, errors: ERR.slice(0, 40), errCount: ERR.length };
