// ================= SIGN IN =================
clear('Row label · Desktop');
const rowLab = await T(null, 'Desktop · 1440 — Operations', 'Display/Page title', 'text/primary', { name: 'Row label · Desktop' }); page.appendChild(rowLab); place(rowLab, 0, -96);
clear('01 · Sign in');
const si = figma.createFrame(); si.name = '01 · Sign in'; page.appendChild(si); place(si, 0, 0); si.resize(1440, 960); si.fills = [P('bg/surface')];
si.layoutMode = 'HORIZONTAL'; si.primaryAxisSizingMode = 'FIXED'; si.counterAxisSizingMode = 'FIXED'; si.clipsContent = true;
const left = AL(si, 'VERTICAL', { name: 'Brand panel', pad: [56, 64, 48, 64], fill: 'nav/bg', w: 600, justify: 'SPACE_BETWEEN' }); left.layoutSizingVertical = 'FILL'; left.primaryAxisSizingMode = 'FIXED';
const lb = AL(left, 'HORIZONTAL', { name: 'Brand', gap: 10, align: 'CENTER' });
{ const m = figma.createFrame(); m.name = 'Logo/Mark'; m.resize(32, 32); m.cornerRadius = 8; m.fills = [P('accent/default')]; R(m, 16, 4, 'text/inverse', { radius: 1, x: 8, y: 9 }); R(m, 12, 4, 'text/inverse', { radius: 1, x: 8, y: 15, opacity: 0.8 }); R(m, 8, 4, 'text/inverse', { radius: 1, x: 8, y: 21, opacity: 0.6 }); lb.appendChild(m); }
await T(lb, 'Foundry', 'Heading/Section', 'nav/text-active');
const lmid = AL(left, 'VERTICAL', { name: 'Statement', gap: 20 }); lmid.layoutSizingHorizontal = 'FILL';
await T(lmid, 'Operations console', 'Label/Overline', 'nav/indicator');
const h1 = await T(lmid, 'Every tonne, accounted for.', 'Display/Page title', 'nav/text-active', { w: 440 }); h1.fontSize = 40; h1.lineHeight = { value: 48, unit: 'PIXELS' }; h1.letterSpacing = { value: -1, unit: 'PIXELS' };
await T(lmid, 'Orders, weighbridge and yard in one quiet, precise console for the people who move steel.', 'Body/Default', 'nav/text', { w: 420 });
const feats = AL(lmid, 'VERTICAL', { name: 'Capabilities', gap: 14, pad: [12, 0, 0, 0] });
for (const f of ['Orders, gate and loading bays in one live view', 'Weighbridge readings reconciled against each order', 'Role-based access with a complete audit trail']) { const r = AL(feats, 'HORIZONTAL', { gap: 12, align: 'CENTER', name: 'Capability' }); const w = AL(r, 'HORIZONTAL', { w: 24, h: 24, radius: 12, fill: 'nav/bg-active', align: 'CENTER', justify: 'CENTER', name: 'Tick' }); icon(w, 'check', 14, 'nav/indicator'); await T(r, f, 'Body/Default', 'nav/text-active'); }
await T(left, '© 2026 Foundry · Privacy · Terms · Status', 'Caption/Default', 'nav/text-muted');
const right = AL(si, 'VERTICAL', { name: 'Form panel', align: 'CENTER', justify: 'CENTER', fill: 'bg/surface' }); right.layoutSizingHorizontal = 'FILL'; right.layoutSizingVertical = 'FILL'; right.primaryAxisSizingMode = 'FIXED';
const form = AL(right, 'VERTICAL', { name: 'Sign-in form', gap: 20, w: 400 });
const fh = AL(form, 'VERTICAL', { name: 'Heading', gap: 6 }); fh.layoutSizingHorizontal = 'FILL';
await T(fh, 'Sign in to Foundry', 'Display/Page title', 'text/primary');
await T(fh, 'Use your work email or employee ID.', 'Body/Default', 'text/secondary');
const em = inst('Text field|State=Filled', form); em.layoutSizingHorizontal = 'FILL'; setP(em, { Label: 'Email or employee ID', Value: 'priya.raman@vardhanispat.in', 'Show helper': false }); em.name = 'Field/Email';
const pwRow = AL(form, 'VERTICAL', { name: 'Password group', gap: 6 }); pwRow.layoutSizingHorizontal = 'FILL';
const pw = inst('Text field|State=Focus', pwRow); pw.layoutSizingHorizontal = 'FILL'; setP(pw, { Label: 'Password', Value: '••••••••••••', 'Show helper': false }); pw.name = 'Field/Password';
const pwm = AL(form, 'HORIZONTAL', { name: 'Options', justify: 'SPACE_BETWEEN', align: 'CENTER' }); pwm.layoutSizingHorizontal = 'FILL';
const keep = inst('Checkbox|State=Checked', pwm); setP(keep, { Label: 'Keep me signed in' });
await T(pwm, 'Forgot password?', 'Body/Strong', 'text/link', { name: 'Link/Forgot' });
const sbtn = btn(form, 'Primary', 'Sign in', null, { name: 'Button/Sign in' }); sbtn.layoutSizingHorizontal = 'FILL';
const orr = AL(form, 'HORIZONTAL', { name: 'Divider', gap: 12, align: 'CENTER' }); orr.layoutSizingHorizontal = 'FILL';
const d1 = R(orr, 10, 1, 'border/default'); d1.layoutSizingHorizontal = 'FILL'; await T(orr, 'or', 'Caption/Default', 'text/tertiary'); const d2 = R(orr, 10, 1, 'border/default'); d2.layoutSizingHorizontal = 'FILL';
const sso = btn(form, 'Secondary', 'Continue with company SSO', 'shield', { name: 'Button/SSO' }); sso.layoutSizingHorizontal = 'FILL';
const nf = AL(form, 'HORIZONTAL', { name: 'Footer', gap: 6, justify: 'CENTER' }); nf.layoutSizingHorizontal = 'FILL';
await T(nf, 'New to Foundry?', 'Body/Small', 'text/secondary'); await T(nf, 'Create an organisation', 'Body/Small strong', 'text/link', { name: 'Link/Register' });

// ================= DASHBOARD =================
const D = await screen('02 · Dashboard', 1540, 0, 'Dashboard', 'Operations', 'Dashboard');
await pageHeader(D.content, 'Dispatch overview', 'Nagpur Works · As of 17:58 IST, Sat 10 Oct 2026 · Illustrative sample data', async a => {
  const dr = inst('Date range trigger', a); await txt(dr, 'Range', '05 – 11 Oct 2026'); if (dr) dr.name = 'Date range';
  btn(a, 'Secondary', 'Export', 'download');
  btn(a, 'Primary', 'Create order', 'plus');
});
const ban = inst('Banner|Tone=Warning', D.content); ban.layoutSizingHorizontal = 'FILL'; setP(ban, { Message: '6 orders are past their promised dispatch date. Review them before the 18:00 shift change.', Action: 'Review overdue' }); ban.name = 'Banner/Overdue';
const kr = AL(D.content, 'HORIZONTAL', { name: 'KPI row', gap: 16 }); kr.layoutSizingHorizontal = 'FILL';
await kpi(kr, 'Orders raised today', '128', 'orders', 'Favourable', '▲ 12.3%', 'vs. yesterday 114', { spark: [[0, 24], [24, 22], [48, 20], [72, 22], [96, 17], [120, 18], [144, 14], [168, 15], [192, 11], [216, 9], [238, 7]] });
await kpi(kr, 'Dispatched today', '1,846.20', 'MT', 'Favourable', '▲ 8.4%', 'vs. yesterday 1,703.10');
await kpi(kr, 'Average yard dwell', '2h 14m', 'per vehicle', 'Unfavourable', '▲ 9.0%', 'vs. 7-day avg 2h 03m', { spark: [[0, 20], [24, 19], [48, 21], [72, 18], [96, 17], [120, 16], [144, 15], [168, 14], [192, 12], [216, 9], [238, 8]] });
await kpi(kr, 'Freight cost per MT', '₹ 1,184', 'avg.', 'Favourable', '▼ 3.1%', 'vs. Sep ₹ 1,222', { spark: [[0, 8], [24, 9], [48, 10], [72, 12], [96, 11], [120, 14], [144, 15], [168, 17], [192, 18], [216, 20], [238, 22]] });
const r2 = AL(D.content, 'HORIZONTAL', { name: 'Charts row', gap: 16, align: 'MIN' }); r2.layoutSizingHorizontal = 'FILL';
const cc = card(r2, 'Card/Dispatch volume'); cc.layoutSizingHorizontal = 'FILL';
const cca = await cardHeader(cc, 'Dispatch volume', 'Net MT dispatched per day · Nagpur Works');
seg(cca, ['Week', 'Month', 'Quarter'], 'Week');
const ccm = inst('Icon button|State=Default', cca); if (ccm) ccm.name = 'More';
const lg = AL(cc, 'HORIZONTAL', { name: 'Legend', gap: 20, pad: [0, 20, 8, 20] }); lg.layoutSizingHorizontal = 'FILL';
legend(lg, 'Primary', 'This week'); legend(lg, 'Comparison', 'Prior week'); legend(lg, 'Target', 'Daily target');
const plotWrap = AL(cc, 'VERTICAL', { name: 'Plot', pad: [8, 20, 16, 12] }); plotWrap.layoutSizingHorizontal = 'FILL';
const cur = [1712.4, 1798.1, 1655.0, 1912.4, 1874.6, 1846.2, null];
const prev = [1640.0, 1702.5, 1588.3, 1768.0, 1795.2, 1610.8, 1205.4];
const ch = await lineChart(plotWrap, 728, 268, { name: 'Line chart', min: 1000, max: 2200, step: 200, fmt: v => v.toLocaleString('en-IN'), x: ['Mon 05', 'Tue 06', 'Wed 07', 'Thu 08', 'Fri 09', 'Sat 10', 'Sun 11'], target: 1800, targetLabel: 'Target 1,800 MT', series: [{ vals: prev, token: 'chart/comparison', dash: [4, 3], sw: 1.5, name: 'Prior week' }, { vals: cur, token: 'chart/series-1', sw: 2, area: true, dots: true, name: 'This week' }] });
// hover state annotation on Thu
{ const hx = ch.xv(3); const hl = vec(ch.fr, [[hx, ch.Tt], [hx, ch.Tt + ch.ph]], 'border/strong', { sw: 1, dash: [2, 2], name: 'Hover rule' });
  const pnt = figma.createEllipse(); pnt.name = 'Hover point'; pnt.resize(10, 10); pnt.fills = [P('chart/series-1')]; pnt.strokes = [P('bg/surface')]; pnt.strokeWeight = 2; ch.fr.appendChild(pnt); pnt.x = hx - 5; pnt.y = ch.yv(1912.4) - 5;
  const tip = inst('Tooltip|Type=Chart', ch.fr); if (tip) { tip.x = hx + 12; tip.y = ch.yv(1912.4) - 10; await txt(tip, 'Title', 'Thu, 08 Oct 2026'); tip.name = 'Tooltip (hover state)'; }
  const today = AL(ch.fr, 'HORIZONTAL', { name: 'Today note', pad: [1, 6, 1, 6], radius: 4, fill: 'bg/surface-muted' }); await T(today, 'Today · to 17:58', 'Chart/Axis', 'text/secondary'); today.x = ch.xv(5) - 40; today.y = ch.yv(1846.2) + 14;
  const sun = await T(ch.fr, 'Not yet reported', 'Chart/Axis', 'text/tertiary', { name: 'Gap note' }); sun.x = ch.xv(6) - 70; sun.y = ch.yv(1450); }
const yc = card(r2, 'Card/Vehicles on site', { w: 352 });
const yca = await cardHeader(yc, 'Vehicles on site', 'Live · updated 17:58');
const ylink = btn(yca, 'Ghost', 'Open yard', 'arrow-up-right', { size: 'Small' });
const ybody = AL(yc, 'VERTICAL', { name: 'Body', gap: 16, pad: [4, 20, 20, 20] }); ybody.layoutSizingHorizontal = 'FILL';
const ytot = AL(ybody, 'HORIZONTAL', { name: 'Total', gap: 8, align: 'BASELINE' });
await T(ytot, '22', 'Numeric/KPI', 'text/primary', { tnum: true }); await T(ytot, 'vehicles in 4 stages', 'Body/Small', 'text/tertiary');
const stages = [['Reported at gate', 6, 'chart/series-4'], ['Weighbridge · empty', 4, 'chart/series-3'], ['Loading at bay', 9, 'chart/series-1'], ['Weighbridge · loaded', 3, 'chart/series-2']];
const stack = figma.createFrame(); stack.name = 'Stage bar'; stack.resize(312, 8); stack.cornerRadius = 4; stack.fills = []; stack.layoutMode = 'HORIZONTAL'; stack.itemSpacing = 2; stack.primaryAxisSizingMode = 'FIXED'; stack.counterAxisSizingMode = 'FIXED'; ybody.appendChild(stack); stack.layoutSizingHorizontal = 'FILL'; stack.clipsContent = true;
for (const [n, v, tok] of stages) { const r = R(stack, 312 * v / 22 - 2, 8, tok, { name: n }); r.layoutGrow = v; }
const yl = AL(ybody, 'VERTICAL', { name: 'Stage list', gap: 0 }); yl.layoutSizingHorizontal = 'FILL';
for (const [n, v, tok] of stages) { const r = AL(yl, 'HORIZONTAL', { name: 'Stage/' + n, gap: 10, align: 'CENTER', pad: [10, 0, 10, 0], strokeSides: [0, 0, 1, 0], stroke: 'border/subtle' }); r.layoutSizingHorizontal = 'FILL'; R(r, 8, 8, tok, { radius: 2, name: 'Key' }); const l = await T(r, n, 'Body/Small', 'text/secondary'); l.layoutSizingHorizontal = 'FILL'; await T(r, String(v), 'Numeric/Medium', 'text/primary', { tnum: true }); }
const yfoot = AL(ybody, 'HORIZONTAL', { name: 'Dwell note', gap: 8, align: 'CENTER', pad: [10, 12, 10, 12], radius: 6, fill: 'status/warning/bg' }); yfoot.layoutSizingHorizontal = 'FILL';
icon(yfoot, 'clock', 16, 'status/warning/fg'); const yft = await T(yfoot, 'MH 31 CQ 7710 has waited 3h 05m at Gate 2', 'Caption/Default', 'text/primary'); yft.layoutSizingHorizontal = 'FILL';
// outstanding orders table
const tc = card(D.content, 'Card/Outstanding orders'); tc.layoutSizingHorizontal = 'FILL';
const tca = await cardHeader(tc, 'Outstanding orders', '74 open · oldest first · click a row to open the order');
seg(tca, ['All', 'Overdue', 'Awaiting vehicle'], 'All');
btn(tca, 'Ghost', 'View all orders', 'arrow-up-right', { size: 'Small' });
const thd = inst('Table header · Orders', tc); thd.layoutSizingHorizontal = 'FILL';
const ORD = [['ORD-24798', 'Rewa Cements Pvt Ltd', 'MS Angle 65×65×6', '33.00', '0.00', 0, '06 Oct 2026', 'Warning', 'Overdue'], ['ORD-24801', 'Vardhan Infra Projects', 'TMT Fe 550D · 20 mm', '96.00', '41.60', 0.43, '07 Oct 2026', 'Info', 'Loading'], ['ORD-24805', 'Godavari Constructions', 'MS Plate 10 mm', '28.00', '0.00', 0, '07 Oct 2026', 'Neutral', 'Awaiting vehicle'], ['ORD-24819', 'Kaveri Builders', 'TMT Fe 550D · 16 mm', '120.00', '88.15', 0.73, '08 Oct 2026', 'Info', 'Loading'], ['ORD-24821', 'Vardhan Infra Projects', 'TMT Fe 550D · 12 mm', '64.00', '32.40', 0.51, '10 Oct 2026', 'Positive', 'Part dispatched']];
async function orderRow(parent, r, st) {
  const row = inst('Table row · Orders|State=' + (st || 'Default'), parent); if (!row) return null; row.layoutSizingHorizontal = 'FILL';
  await txt(row, 'Order', r[0]); await txt(row, 'Customer', r[1]); await txt(row, 'Product', r[2]); await txt(row, 'Ordered MT', r[3]); await txt(row, 'Dispatched', r[4]); await txt(row, 'Progress value', Math.round(r[5] * 100) + '%'); await txt(row, 'Ordered', r[6]);
  const fill = row.findOne(n => n.name === 'Fill'); if (fill) { try { fill.resize(Math.max(72 * r[5], 0.01), 4); fill.visible = r[5] > 0; } catch (e) { } }
  const stg = row.findOne(n => n.name === 'Stage'); if (stg) { try { stg.setProperties({ Tone: r[7] }); } catch (e) { ERR.push('tone ' + e.message); } setP(stg, { Label: r[8] }); }
  row.name = 'Row/' + r[0];
  return row;
}
for (let i = 0; i < ORD.length; i++) await orderRow(tc, ORD[i], i === 3 ? 'Hover' : 'Default');
const tfoot = AL(tc, 'HORIZONTAL', { name: 'Footer', pad: [12, 20, 12, 20], justify: 'SPACE_BETWEEN', align: 'CENTER' }); tfoot.layoutSizingHorizontal = 'FILL';
await T(tfoot, 'Showing 5 of 74 outstanding orders · 2,112.65 MT to lift', 'Caption/Default', 'text/tertiary', { tnum: true });
await T(tfoot, 'Hover state shown on ORD-24819', 'Caption/Default', 'text/tertiary');

await si.screenshot({ scale: 0.35 });
await D.f.screenshot({ scale: 0.45 });
return { signIn: si.id, dashboard: D.f.id, dashH: Math.round(D.f.height), errors: ERR.slice(0, 40), errCount: ERR.length };
