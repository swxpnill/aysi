async function kpi(parent, label, value, unit, outcome, dval, baseline, o) {
  o = o || {};
  const k = inst('KPI card|State=' + (o.state || 'Default'), parent);
  if (!k) return null;
  k.layoutSizingHorizontal = 'FILL';
  setP(k, { Label: label, Value: value, Unit: unit, Baseline: baseline, 'Show sparkline': !!o.spark });
  const d = k.findOne(n => n.name === 'Delta');
  if (d) { try { d.setProperties({ Outcome: outcome }); } catch (e) { ERR.push('delta outcome ' + e.message); } setP(d, { Value: dval }); }
  k.name = 'KPI/' + label;
  return k;
}
// ---- QA fixes on earlier screens ----
{ const od = page.children.find(n => n.name === '04 · Order detail'); const sc = od && od.findOne(n => n.name === 'Card/Progress'); if (sc) { sc.primaryAxisSizingMode = 'FIXED'; sc.layoutSizingHorizontal = 'FILL'; sc.itemSpacing = 16; } else ERR.push('no progress card'); }
{ const db = page.children.find(n => n.name === '02 · Dashboard'); const tn = db && db.findOne(n => n.name === 'Today note'); if (tn) { tn.y = tn.y + 18; } const tl = db && db.findOne(n => n.name === 'Target label'); if (tl) { tl.x = tl.x - 96; } }

// ================= CUSTOMERS =================
const CU = await screen('06 · Customers', 7700, 0, 'Customers', 'Operations', 'Customers');
await pageHeader(CU.content, 'Customers', 'The parties you sell to, and what each still has to lift.', async a => { btn(a, 'Secondary', 'Export', 'download'); btn(a, 'Primary', 'Add customer', 'plus'); });
const ck = AL(CU.content, 'HORIZONTAL', { name: 'KPI row', gap: 16 }); ck.layoutSizingHorizontal = 'FILL';
await kpi(ck, 'Active customers', '214', 'accounts', 'Favourable', '▲ 9', 'added this month');
await kpi(ck, 'Outstanding to lift', '2,112.65', 'MT', 'Unchanged', '▲ 4.2%', 'vs. last week · volume, not performance');
await kpi(ck, 'With open orders', '38', 'customers', 'Unchanged', '0.0%', 'vs. last week 38');
await kpi(ck, 'Dormant > 90 days', '17', 'customers', 'Unfavourable', '▲ 3', 'vs. last month 14');
tabsRow(CU.content, [['All', '214'], ['With balance', '38'], ['Dormant', '17']], 'All');
const ctool = AL(CU.content, 'HORIZONTAL', { name: 'Toolbar', gap: 8, align: 'CENTER' }); ctool.layoutSizingHorizontal = 'FILL';
await searchBox(ctool, 'Search by name, GSTIN or contact…', 320); chip(ctool, 'Default', 'City'); chip(ctool, 'Default', 'Balance');
const ctab = card(CU.content, 'Card/Customers table'); ctab.layoutSizingHorizontal = 'FILL';
await simpleTable(ctab, [['Customer', 'F', 'L', 'avatar'], ['GSTIN', 180, 'L', 'num'], ['Primary contact', 170, 'L'], ['Outstanding MT', 140, 'R'], ['Open orders', 110, 'R'], ['Last order', 120, 'L', 'num'], ['', 40, 'R', 'menu']], [
  [['VI', 'Vardhan Infra Projects', 'Nagpur, MH'], '27AAFCV2210K1Z9', 'Rohan Vardhan', '1,284.50', '12', '10 Oct 2026', ''],
  [['KB', 'Kaveri Builders', 'Nagpur, MH'], '27AAKCK4821M1Z5', 'Arjun Kulkarni', '412.60', '5', '08 Oct 2026', ''],
  [['SE', 'Sahyadri Engineering', 'Pune, MH'], '27AADCS8812L1Z4', 'Nikhil Joshi', '238.80', '3', '08 Oct 2026', ''],
  [['SS', 'Shreeji Structurals', 'Amravati, MH'], '27ABDFS0912P1Z2', 'Meera Shah', '96.00', '2', '10 Oct 2026', ''],
  [['GC', 'Godavari Constructions', 'Nanded, MH'], '27AAGCG3301H1Z7', 'Farhan Shaikh', '74.25', '2', '07 Oct 2026', ''],
  [['RC', 'Rewa Cements Pvt Ltd', 'Rewa, MP'], '23AABCR6620E1Z3', 'Sanjay Tiwari', '33.00', '1', '06 Oct 2026', ''],
  [['AR', 'Ashoka Realty', 'Wardha, MH'], '27AAHCA5530R1Z1', 'Sunita Rao', '6.50', '1', '08 Oct 2026', ''],
  [['NS', 'Narmada Steel Traders', 'Jabalpur, MP'], '23AACFN7741Q1Z8', 'Vikram Patel', '0.00', '0', '09 Oct 2026', '']], { rowH: 60 });
const cpg = inst('Pagination', ctab); cpg.layoutSizingHorizontal = 'FILL'; await txt(cpg, 'Summary', 'Showing 1–8 of 214 customers');

// ================= REPORTS =================
clear('Row label · Insights');
const rl2 = await T(null, 'Desktop · 1440 — Insights & Administration', 'Display/Page title', 'text/primary', { name: 'Row label · Insights' }); page.appendChild(rl2); place(rl2, 0, 1504);
const RP = await screen('07 · Reports', 0, 1600, 'Reports', 'Insights', 'Reports');
await pageHeader(RP.content, 'Reports', 'Quarterly trends across dispatch, weighbridge accuracy and customer volume.', async a => { const dr = inst('Date range trigger', a); await txt(dr, 'Range', 'Jul – Sep 2026'); await txt(dr, 'Comparison', 'vs. Apr – Jun'); btn(a, 'Secondary', 'Schedule', 'clock'); btn(a, 'Primary', 'Export report', 'download'); });
tabsRow(RP.content, [['Dispatch', null], ['Weighbridge', null], ['Customers', null], ['Freight', null]], 'Dispatch');
const rk = AL(RP.content, 'HORIZONTAL', { name: 'KPI row', gap: 16 }); rk.layoutSizingHorizontal = 'FILL';
await kpi(rk, 'Dispatched in Q2 FY27', '1,52,840.60', 'MT', 'Favourable', '▲ 6.8%', 'vs. Q1 1,43,108.20');
await kpi(rk, 'On-time dispatch', '91.4', '%', 'Unfavourable', '▼ 2.1 pp', 'vs. Q1 93.5% · target 95%');
await kpi(rk, 'Over-tolerance loads', '0.8', '%', 'Favourable', '▼ 0.3 pp', 'vs. Q1 1.1% · lower is better');
await kpi(rk, 'Gate 3 scans', '—', 'scans', 'No data', '— No data', 'Scanner commissioned 02 Oct', { state: 'No data' });
// weekly bar chart
const bc = card(RP.content, 'Card/Weekly dispatch'); bc.layoutSizingHorizontal = 'FILL';
const bca = await cardHeader(bc, 'Weekly dispatch', 'Net MT per week · Q2 FY27 (Jul – Sep 2026) · bars start at zero');
seg(bca, ['Weekly', 'Monthly'], 'Weekly');
const blg = AL(bc, 'HORIZONTAL', { name: 'Legend', gap: 20, pad: [0, 20, 8, 20] }); blg.layoutSizingHorizontal = 'FILL';
legend(blg, 'Primary', 'Net MT dispatched'); legend(blg, 'Comparison', 'Q1 weekly average · 11,008 MT');
{
  const W = 1088, H = 280, L = 56, Tt = 10, B = 28, pw = W - L - 12, ph = H - Tt - B;
  const fr = figma.createFrame(); fr.name = 'Bar chart'; fr.resize(W, H); fr.fills = []; const pwrap = AL(bc, 'VERTICAL', { name: 'Plot', pad: [8, 20, 20, 20] }); pwrap.layoutSizingHorizontal = 'FILL'; pwrap.appendChild(fr);
  const max = 14000; const yv = v => Tt + ph - v / max * ph;
  for (let t = 0; t <= max; t += 2000) { R(fr, pw, 1, t === 0 ? 'border/strong' : 'chart/grid', { x: L, y: Math.round(yv(t)) }); const lt = await T(fr, t.toLocaleString('en-IN'), 'Chart/Axis', 'chart/axis', { tnum: true }); lt.textAutoResize = 'NONE'; lt.resize(L - 10, 14); lt.textAlignHorizontal = 'RIGHT'; lt.x = 0; lt.y = Math.round(yv(t) - 7); }
  const vals = [11240, 11880, 12020, 11610, 12410, 12260, 8420, 12590, 12730, 11960, 12880, 12150, 11080];
  const bw = pw / vals.length;
  for (let i = 0; i < vals.length; i++) {
    const x = L + i * bw + bw * 0.22, w = bw * 0.56, y = yv(vals[i]);
    const b = R(fr, w, Tt + ph - y, 'chart/series-1', { x, y, name: 'Bar W' + (27 + i) }); b.topLeftRadius = 3; b.topRightRadius = 3; if (i === 10) b.fills = [P('accent/hover')];
    const xl = await T(fr, 'W' + (27 + i), 'Chart/Axis', 'chart/axis'); xl.textAutoResize = 'NONE'; xl.resize(bw, 14); xl.textAlignHorizontal = 'CENTER'; xl.x = L + i * bw; xl.y = H - 18;
  }
  const avgY = yv(11008); const av = figma.createVector(); av.vectorPaths = [{ windingRule: 'NONZERO', data: 'M ' + L + ' ' + avgY.toFixed(1) + ' L ' + (L + pw) + ' ' + avgY.toFixed(1) }]; av.strokes = [P('chart/comparison')]; av.strokeWeight = 1.5; av.dashPattern = [4, 3]; av.name = 'Q1 average'; fr.appendChild(av);
  const ann = AL(fr, 'HORIZONTAL', { name: 'Annotation', pad: [2, 6, 2, 6], radius: 4, fill: 'bg/surface-muted' }); await T(ann, 'W33 · planned mill shutdown, 2 days', 'Chart/Axis', 'text/secondary'); ann.x = L + 6 * bw - 30; ann.y = yv(8420) - 26;
  const tip = inst('Tooltip|Type=Simple', fr); if (tip) { await txt(tip, 'Text', 'W37 · 12,880 MT · +17.0% vs Q1 avg'); tip.x = L + 10 * bw - 60; tip.y = yv(12880) - 34; tip.name = 'Tooltip (hover W37)'; }
}
const rr = AL(RP.content, 'HORIZONTAL', { name: 'Breakdown row', gap: 16, align: 'MIN' }); rr.layoutSizingHorizontal = 'FILL';
const pc = card(rr, 'Card/By product'); pc.layoutSizingHorizontal = 'FILL';
await cardHeader(pc, 'Dispatch by product', 'Share of net MT · Q2 FY27');
const pl = AL(pc, 'VERTICAL', { name: 'Bars', gap: 14, pad: [4, 20, 20, 20] }); pl.layoutSizingHorizontal = 'FILL';
for (const [n, pct, mt] of [['TMT Fe 550D', 58, '88,647.5'], ['TMT Fe 500', 17, '25,982.9'], ['MS Angles', 11, '16,812.5'], ['MS Channels', 7, '10,698.8'], ['MS Plates', 5, '7,642.0'], ['Binding wire', 2, '3,056.9']]) {
  const r = AL(pl, 'VERTICAL', { gap: 6, name: 'Product/' + n }); r.layoutSizingHorizontal = 'FILL';
  const top = AL(r, 'HORIZONTAL', { gap: 8 }); top.layoutSizingHorizontal = 'FILL'; const l = await T(top, n, 'Body/Small', 'text/primary'); l.layoutSizingHorizontal = 'FILL'; await T(top, mt + ' MT', 'Numeric/Table', 'text/secondary', { tnum: true }); await T(top, pct + '%', 'Numeric/Medium', 'text/primary', { tnum: true });
  const tr = figma.createFrame(); tr.name = 'Track'; tr.resize(400, 6); tr.cornerRadius = 3; tr.fills = [P('bg/surface-muted')]; tr.layoutMode = 'HORIZONTAL'; tr.primaryAxisSizingMode = 'FIXED'; tr.counterAxisSizingMode = 'FIXED'; r.appendChild(tr); tr.layoutSizingHorizontal = 'FILL';
  const f1 = R(tr, 10, 6, 'chart/series-1', { radius: 3 }); f1.layoutGrow = pct; const f2 = R(tr, 10, 6, null); f2.layoutGrow = 100 - pct;
}
const tcu = card(rr, 'Card/Top customers', { w: 560 });
await cardHeader(tcu, 'Top customers by volume', 'Net MT · change vs. Q1');
await simpleTable(tcu, [['Customer', 'F', 'L'], ['Net MT', 110, 'R'], ['Change', 150, 'L', 'delta']], [['Vardhan Infra Projects', '18,420.5', ['Favourable', '▲ 12.4%']], ['Kaveri Builders', '12,880.0', ['Favourable', '▲ 4.1%']], ['Sahyadri Engineering', '9,214.3', ['Unfavourable', '▼ 6.0%']], ['Godavari Constructions', '7,902.8', ['Unchanged', '0.0%']], ['Rewa Cements Pvt Ltd', '6,410.2', ['No data', '— New in Q2']]], { rowH: 48 });

// ================= ACTIVITY =================
const AC = await screen('08 · Activity', 1540, 1600, 'Activity', 'Insights', 'Activity');
await pageHeader(AC.content, 'Activity', 'Everything that happened at Nagpur Works, newest first. Retained for 24 months.', async a => { btn(a, 'Secondary', 'Export log', 'download'); });
tabsRow(AC.content, [['All', null], ['Orders', null], ['Yard', null], ['Weighbridge', null], ['Access', null]], 'All');
const atool = AL(AC.content, 'HORIZONTAL', { name: 'Toolbar', gap: 8, align: 'CENTER' }); atool.layoutSizingHorizontal = 'FILL';
await searchBox(atool, 'Search by reference, vehicle or person…', 320); chip(atool, 'Default', 'Performed by'); chip(atool, 'Default', 'Type');
const acols = AL(AC.content, 'HORIZONTAL', { name: 'Columns', gap: 16, align: 'MIN' }); acols.layoutSizingHorizontal = 'FILL';
const feed = card(acols, 'Card/Feed'); feed.layoutSizingHorizontal = 'FILL';
const DAYS = [['Today · Sat 10 Oct', [['17:42', 'x-circle', 'status/negative/fg', 'Weighbridge 2 stopped reporting', 'Device WB-02 · last reading 17:41:58', 'System', ['Negative', 'Device offline']], ['17:20', 'truck', 'accent/text', 'LD-55102 started loading at Bay 3', 'MH 40 BG 2291 · Vardhan Infra Projects', 'Rakesh S.', null], ['16:58', 'scale', 'status/negative/fg', 'LD-55094 over tolerance by +0.38 MT', 'Net 27.48 T against 27.10 T ± 0.25 T', 'Weighbridge 1', ['Negative', 'Over tolerance']], ['16:02', 'package', 'text/secondary', 'ORD-24822 raised · 18.00 MT', 'Shreeji Structurals · MS Angle 50×50×6', 'Anil K.', null], ['15:40', 'users', 'text/secondary', 'Meera Shah invited as Viewer', 'Shreeji Structurals · customer portal', 'Priya R.', ['Info', 'Access']]]], ['Yesterday · Fri 09 Oct', [['14:22', 'scale', 'status/positive/fg', 'LD-55088 weighed out · 31.20 MT net', 'MH 31 CQ 7710 · Kaveri Builders', 'Weighbridge 1', ['Positive', 'Within tolerance']], ['09:12', 'shield', 'text/secondary', 'Role changed: Rakesh S. → Gate operator', 'Previously Viewer', 'Priya R.', ['Info', 'Access']]]]];
for (const [day, items] of DAYS) {
  const dh = AL(feed, 'HORIZONTAL', { name: 'Day/' + day, pad: [10, 20, 10, 20], fill: 'bg/surface-subtle', strokeSides: [0, 0, 1, 0], stroke: 'border/subtle' }); dh.layoutSizingHorizontal = 'FILL';
  await T(dh, day, 'Label/Overline', 'text/tertiary');
  for (const [t, ic, tok, title, det, who, bdg] of items) {
    const r = AL(feed, 'HORIZONTAL', { name: 'Event/' + t, gap: 14, pad: [14, 20, 14, 20], align: 'MIN', strokeSides: [0, 0, 1, 0], stroke: 'border/subtle' }); r.layoutSizingHorizontal = 'FILL';
    await T(r, t, 'Numeric/Table', 'text/tertiary', { tnum: true, w: 44 });
    const w = AL(r, 'HORIZONTAL', { w: 28, h: 28, radius: 14, fill: 'bg/surface-muted', align: 'CENTER', justify: 'CENTER', name: 'Icon well' }); icon(w, ic, 14, tok);
    const tx = AL(r, 'VERTICAL', { gap: 2, name: 'Text' }); tx.layoutSizingHorizontal = 'FILL';
    const tl = AL(tx, 'HORIZONTAL', { gap: 8, align: 'CENTER', name: 'Title row' }); await T(tl, title, 'Body/Small strong', 'text/primary'); if (bdg) badge(tl, bdg[0], bdg[1]);
    await T(tx, det, 'Caption/Default', 'text/secondary', { tnum: true });
    await T(r, who, 'Caption/Default', 'text/tertiary');
  }
}
const side = AL(acols, 'VERTICAL', { name: 'Side column', gap: 16, w: 352 });
const att = card(side, 'Card/Needs attention'); att.layoutSizingHorizontal = 'FILL';
await cardHeader(att, 'Needs attention', '3 open alerts');
const al = AL(att, 'VERTICAL', { name: 'Alerts', gap: 10, pad: [0, 16, 16, 16] }); al.layoutSizingHorizontal = 'FILL';
for (const [tone, ic, t, d, act] of [['negative', 'scale', 'LD-55094 over tolerance', '+0.38 MT · Narmada Steel Traders', 'Review'], ['warning', 'clock', '6 orders overdue', 'Oldest: ORD-24798, 4 days', 'Open list'], ['negative', 'x-circle', 'Weighbridge 2 offline', 'Since 17:42 · 16 min', 'View device']]) {
  const a = AL(al, 'HORIZONTAL', { gap: 10, pad: 12, radius: 6, fill: 'status/' + tone + '/bg', stroke: 'status/' + tone + '/border', align: 'MIN', name: 'Alert/' + t }); a.layoutSizingHorizontal = 'FILL';
  icon(a, ic, 16, 'status/' + tone + '/fg');
  const tx = AL(a, 'VERTICAL', { gap: 2 }); tx.layoutSizingHorizontal = 'FILL'; await T(tx, t, 'Body/Small strong', 'text/primary'); await T(tx, d, 'Caption/Default', 'text/secondary', { tnum: true });
  await T(a, act, 'Button/Small', 'status/' + tone + '/fg');
}
const subs = card(side, 'Card/Your notifications'); subs.layoutSizingHorizontal = 'FILL';
const sa = await cardHeader(subs, 'Your notifications', 'Delivered in-app and by email'); btn(sa, 'Ghost', 'Edit', 'pencil', { size: 'Small' });
const sl = AL(subs, 'VERTICAL', { name: 'Toggles', gap: 12, pad: [0, 20, 20, 20] }); sl.layoutSizingHorizontal = 'FILL';
for (const [l, on] of [['Weight variance alerts', true], ['Overdue orders digest', true], ['Device health', true], ['New customer sign-ups', false]]) { const tg = inst('Toggle|State=' + (on ? 'On' : 'Off'), sl); setP(tg, { Label: l }); }

await CU.f.screenshot({ scale: 0.4 });
await RP.f.screenshot({ scale: 0.4 });
await AC.f.screenshot({ scale: 0.4 });
return { customers: CU.f.id, reports: RP.f.id, activity: AC.f.id, errors: ERR.slice(0, 40), errCount: ERR.length };
