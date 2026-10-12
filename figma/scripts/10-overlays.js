function field(parent, st, label, value, helper) { const f = inst('Text field|State=' + st, parent); if (!f) return null; f.layoutSizingHorizontal = 'FILL'; setP(f, helper ? { Label: label, Value: value, 'Helper text': helper, 'Show helper': true } : { Label: label, Value: value, 'Show helper': false }); f.name = 'Field/' + label; return f; }
async function selectField(parent, label, value, st) { const g = AL(parent, 'VERTICAL', { gap: 6, name: 'Select/' + label }); g.layoutSizingHorizontal = 'FILL'; await T(g, label, 'Label/Default', 'text/secondary'); const s = inst('Select|State=' + (st || 'Default'), g); s.layoutSizingHorizontal = 'FILL'; setP(s, { Value: value }); return g; }
const OVY = 3400;
clear('Row label · Overlays');
const rl3 = await T(null, 'Overlays · modals, drawers, popovers, menus & toasts (prototype destinations)', 'Display/Page title', 'text/primary', { name: 'Row label · Overlays' }); page.appendChild(rl3); place(rl3, 0, OVY - 96);
let ovx = 0;
function overlay(name, scrim) {
  clear(name);
  const f = figma.createFrame(); f.name = name; f.resize(1440, 900); f.fills = []; f.clipsContent = true; page.appendChild(f); place(f, ovx, OVY); ovx += 1540;
  const d = R(f, 1440, 900, scrim ? 'bg/scrim' : 'bg/surface', { name: 'Dismiss area', opacity: scrim ? 0.48 : 0.001, x: 0, y: 0 });
  return f;
}
async function modal(parent, w, title, desc, foot, primary, danger) {
  const m = AL(parent, 'VERTICAL', { name: 'Dialog', w, radius: 12, fill: 'bg/surface', clip: true, gap: 0 });
  await fx(m, 'Elevation/4 · Modal');
  const h = inst('Modal header', m); h.layoutSizingHorizontal = 'FILL'; await txt(h, 'Title', title); await txt(h, 'Description', desc);
  const b = AL(m, 'VERTICAL', { name: 'Body', gap: 16, pad: [4, 24, 24, 24] }); b.layoutSizingHorizontal = 'FILL';
  const f = inst('Modal footer', m); f.layoutSizingHorizontal = 'FILL'; await txt(f, 'Footnote', foot || '');
  const pa = f.findOne(n => n.name === 'Primary action');
  if (pa && danger) { try { pa.swapComponent(LIB['Button|Variant=Danger, State=Default, Size=Medium']); } catch (e) { ERR.push('swap ' + e.message); } }
  if (pa) setP(pa, { Label: primary[1], 'Show icon': false });
  const sa = f.findOne(n => n.name === 'Secondary action'); if (sa) setP(sa, { Label: primary[0], 'Show icon': false });
  return { m, b, f };
}
function center(node) { node.x = Math.round((1440 - node.width) / 2); node.y = Math.round((900 - node.height) / 2); }

// 1 Assign vehicle
{
  const f = overlay('Overlay · Assign vehicle', true);
  const { m, b } = await modal(f, 560, 'Assign vehicle', 'ORD-24819 · Kaveri Builders · TMT Fe 550D 16 mm · 31.85 MT balance', 'Driver receives a gate pass on WhatsApp', ['Cancel', 'Assign vehicle']);
  await selectField(b, 'Vehicle', 'MH 12 RT 4418 · 32 T capacity · at gate');
  const r = AL(b, 'HORIZONTAL', { gap: 16, name: 'Row' }); r.layoutSizingHorizontal = 'FILL';
  await selectField(r, 'Loading bay', 'Bay 2 · free from 18:10'); field(r, 'Filled', 'Planned quantity (MT)', '31.85', 'Balance on order: 31.85 MT');
  field(b, 'Default', 'Driver mobile', '+91 ••••• ••157');
  const ban = inst('Banner|Tone=Info', b); ban.layoutSizingHorizontal = 'FILL'; setP(ban, { Message: 'Bay 3 is busy until 18:05 with LD-55102. Bay 2 is the earliest free bay.', 'Show action': false });
  center(m);
}
// 2 Assign vehicle — validation error
{
  const f = overlay('Overlay · Assign vehicle — error', true);
  const { m, b, f: ft } = await modal(f, 560, 'Assign vehicle', 'ORD-24819 · Kaveri Builders · TMT Fe 550D 16 mm · 31.85 MT balance', 'Fix 1 error to continue', ['Cancel', 'Assign vehicle']);
  await selectField(b, 'Vehicle', 'MH 12 RT 4418 · 32 T capacity · at gate');
  const r = AL(b, 'HORIZONTAL', { gap: 16, name: 'Row' }); r.layoutSizingHorizontal = 'FILL';
  await selectField(r, 'Loading bay', 'Bay 2 · free from 18:10'); field(r, 'Error', 'Planned quantity (MT)', '36.00', 'Exceeds the 31.85 MT balance by 4.15 MT.');
  field(b, 'Default', 'Driver mobile', '+91 ••••• ••157');
  const pa = ft.findOne(n => n.name === 'Primary action'); if (pa) { try { pa.swapComponent(LIB['Button|Variant=Primary, State=Disabled, Size=Medium']); setP(pa, { Label: 'Assign vehicle', 'Show icon': false }); } catch (e) { } }
  center(m);
}
// 3 Cancel order (destructive)
{
  const f = overlay('Overlay · Cancel order', true);
  const { m, b } = await modal(f, 480, 'Cancel ORD-24822?', 'Shreeji Structurals · MS Angle 50×50×6 · 18.00 MT', 'This can’t be undone', ['Keep order', 'Cancel order'], true);
  const w = AL(b, 'HORIZONTAL', { gap: 12, pad: 14, radius: 8, fill: 'status/negative/bg', stroke: 'status/negative/border', align: 'MIN', name: 'Consequences' }); w.layoutSizingHorizontal = 'FILL';
  icon(w, 'alert', 18, 'status/negative/fg'); await T(w, 'The customer is notified, the reserved 18.00 MT is released to stock, and any assigned vehicle is unassigned.', 'Body/Small', 'text/primary', { fill: true });
  await selectField(b, 'Reason', 'Customer request');
  field(b, 'Focus', 'Type ORD-24822 to confirm', 'ORD-24822');
  center(m);
}
// 4 Export
{
  const f = overlay('Overlay · Export orders', true);
  const { m, b } = await modal(f, 480, 'Export orders', '128 orders · 01 – 10 Oct 2026 · current filters applied', 'Large exports are emailed when ready', ['Cancel', 'Export']);
  await T(b, 'Format', 'Label/Default', 'text/secondary');
  const rg = AL(b, 'VERTICAL', { gap: 10, name: 'Format options' });
  for (const [l, s] of [['CSV — for spreadsheets and BI tools', 'Selected'], ['Excel (.xlsx) — formatted, one sheet per plant', 'Unselected'], ['PDF — print-ready dispatch register', 'Unselected']]) { const ro = inst('Radio|State=' + s, rg); setP(ro, { Label: l }); }
  await selectField(b, 'Columns', 'All visible columns (9)');
  const cb = inst('Checkbox|State=Checked', b); setP(cb, { Label: 'Include loadings for each order' });
  center(m);
}
// 5 Disconnect integration
{
  const f = overlay('Overlay · Disconnect integration', true);
  const { m, b } = await modal(f, 480, 'Disconnect SAP S/4HANA?', 'Orders and invoices will stop syncing in both directions.', 'You can reconnect at any time', ['Cancel', 'Disconnect'], true);
  const l = AL(b, 'VERTICAL', { gap: 10, name: 'Impact' }); l.layoutSizingHorizontal = 'FILL';
  for (const t of ['New orders raised in SAP will no longer appear in Foundry', 'Dispatch confirmations will queue locally (up to 7 days)', 'Stored credentials are deleted immediately']) { const r = AL(l, 'HORIZONTAL', { gap: 10, align: 'CENTER' }); r.layoutSizingHorizontal = 'FILL'; icon(r, 'x-circle', 16, 'status/negative/fg'); await T(r, t, 'Body/Small', 'text/primary', { fill: true }); }
  center(m);
}
// 6 Connect integration — setup step 2 of 3 with test success
{
  const f = overlay('Overlay · Connect integration', true);
  const { m, b } = await modal(f, 560, 'Connect Tally Prime', 'Step 2 of 3 · Credentials', 'Credentials are encrypted at rest', ['Back', 'Continue']);
  const st = AL(b, 'HORIZONTAL', { gap: 8, name: 'Steps', align: 'CENTER' }); st.layoutSizingHorizontal = 'FILL';
  for (const [i, l, s] of [[1, 'Permissions', 'done'], [2, 'Credentials', 'current'], [3, 'Mapping', 'todo']]) { const s1 = AL(st, 'HORIZONTAL', { gap: 8, align: 'CENTER', name: 'Step ' + i }); const d = AL(s1, 'HORIZONTAL', { w: 20, h: 20, radius: 10, align: 'CENTER', justify: 'CENTER', fill: s === 'todo' ? 'bg/surface-muted' : 'accent/default' }); if (s === 'done') icon(d, 'check', 12, 'text/inverse'); else await T(d, String(i), 'Caption/Default', s === 'todo' ? 'text/tertiary' : 'text/inverse'); await T(s1, l, 'Body/Small strong', s === 'todo' ? 'text/tertiary' : 'text/primary'); if (i < 3) { const ln = R(st, 24, 1, 'border/default'); } }
  field(b, 'Filled', 'Server URL', 'https://tally.vardhanispat.local:9000');
  const r = AL(b, 'HORIZONTAL', { gap: 16, name: 'Row' }); r.layoutSizingHorizontal = 'FILL';
  field(r, 'Filled', 'Company', 'Vardhan Ispat Ltd. (2026–27)'); field(r, 'Filled', 'API key', '••••••••••••3f9a');
  const ok = AL(b, 'HORIZONTAL', { gap: 10, pad: 12, radius: 6, fill: 'status/positive/bg', stroke: 'status/positive/border', align: 'CENTER', name: 'Test result' }); ok.layoutSizingHorizontal = 'FILL';
  icon(ok, 'check-circle', 16, 'status/positive/fg'); await T(ok, 'Connection test passed · 214 ledgers found · 142 ms', 'Body/Small', 'text/primary', { fill: true, tnum: true });
  center(m);
}
// 7 Notifications panel (popover anchored to bell)
{
  const f = overlay('Overlay · Notifications', false);
  const p = AL(f, 'VERTICAL', { name: 'Notifications panel', w: 400, radius: 8, fill: 'bg/surface', stroke: 'border/default', clip: true });
  await fx(p, 'Elevation/3 · Popover');
  const h = AL(p, 'HORIZONTAL', { name: 'Header', pad: [14, 16, 10, 16], align: 'CENTER' }); h.layoutSizingHorizontal = 'FILL';
  const ht = await T(h, 'Notifications', 'Heading/Card', 'text/primary'); ht.layoutSizingHorizontal = 'FILL'; await T(h, 'Mark all as read', 'Button/Small', 'text/link');
  const tb = AL(p, 'HORIZONTAL', { name: 'Tabs', gap: 20, pad: [0, 16, 0, 16], strokeSides: [0, 0, 1, 0], stroke: 'border/default' }); tb.layoutSizingHorizontal = 'FILL';
  for (const [l, n, a] of [['Unread', '3', true], ['All', null, false]]) { const t = inst('Tab|State=' + (a ? 'Active' : 'Default'), tb); setP(t, n ? { Label: l, Count: n, 'Show count': true } : { Label: l, 'Show count': false }); }
  for (const [ic, tok, t, d, unread] of [['scale', 'status/negative/fg', 'LD-55094 is over tolerance by +0.38 MT', 'Weighbridge 1 · 16:58 · needs approval', true], ['x-circle', 'status/negative/fg', 'Weighbridge 2 stopped reporting', 'Device WB-02 · 17:42', true], ['clock', 'status/warning/fg', '6 orders are past their dispatch date', 'Oldest ORD-24798 · 4 days', true], ['users', 'text/secondary', 'Meera Shah accepted your invite', 'Shreeji Structurals · 15:52', false]]) {
    const r = AL(p, 'HORIZONTAL', { name: 'Notification/' + t, gap: 12, pad: [12, 16, 12, 16], align: 'MIN', fill: unread ? 'bg/surface' : 'bg/surface', strokeSides: [0, 0, 1, 0], stroke: 'border/subtle' }); r.layoutSizingHorizontal = 'FILL';
    const w = AL(r, 'HORIZONTAL', { w: 28, h: 28, radius: 14, fill: 'bg/surface-muted', align: 'CENTER', justify: 'CENTER' }); icon(w, ic, 14, tok);
    const tx = AL(r, 'VERTICAL', { gap: 2 }); tx.layoutSizingHorizontal = 'FILL'; await T(tx, t, unread ? 'Body/Small strong' : 'Body/Small', 'text/primary', { fill: true }); await T(tx, d, 'Caption/Default', 'text/tertiary', { tnum: true });
    if (unread) { const u = figma.createEllipse(); u.name = 'Unread'; u.resize(8, 8); u.fills = [P('accent/default')]; r.appendChild(u); }
  }
  const ftr = AL(p, 'HORIZONTAL', { name: 'Footer', pad: [10, 16, 10, 16], justify: 'CENTER', fill: 'bg/surface-subtle' }); ftr.layoutSizingHorizontal = 'FILL'; await T(ftr, 'View all activity', 'Button/Small', 'text/link');
  p.x = 1440 - 32 - 400 - 44; p.y = 60;
}
// 8 Date range popover
{
  const f = overlay('Overlay · Date range', false);
  const p = AL(f, 'VERTICAL', { name: 'Date range popover', w: 600, radius: 8, fill: 'bg/surface', stroke: 'border/default', clip: true });
  await fx(p, 'Elevation/3 · Popover');
  const body = AL(p, 'HORIZONTAL', { name: 'Body', gap: 0 }); body.layoutSizingHorizontal = 'FILL';
  const pre = AL(body, 'VERTICAL', { name: 'Presets', gap: 2, pad: 8, w: 180, strokeSides: [0, 1, 0, 0], stroke: 'border/default' }); pre.layoutSizingVertical = 'FILL';
  for (const [l, s] of [['Today', 0], ['Yesterday', 0], ['This week', 1], ['Last 7 days', 0], ['This month', 0], ['Last quarter', 0], ['Custom range', 0]]) { const mi = inst('Menu item|State=' + (s ? 'Selected' : 'Default'), pre); mi.layoutSizingHorizontal = 'FILL'; setP(mi, { Label: l, 'Show icon': false }); const mt = mi.findOne(n => n.name === 'Meta'); if (mt) mt.visible = !!s; }
  const cal = AL(body, 'VERTICAL', { name: 'Calendar', gap: 8, pad: 16 }); cal.layoutSizingHorizontal = 'FILL';
  const mh = AL(cal, 'HORIZONTAL', { name: 'Month', align: 'CENTER' }); mh.layoutSizingHorizontal = 'FILL'; icon(mh, 'chevron-left', 16, 'text/secondary'); const mt = await T(mh, 'October 2026', 'Heading/Card', 'text/primary', { align: 'CENTER' }); mt.layoutSizingHorizontal = 'FILL'; icon(mh, 'chevron-right', 16, 'text/secondary');
  const dows = AL(cal, 'HORIZONTAL', { name: 'Weekdays' }); dows.layoutSizingHorizontal = 'FILL';
  for (const d of ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']) { const c = AL(dows, 'HORIZONTAL', { justify: 'CENTER', h: 20 }); c.layoutSizingHorizontal = 'FILL'; await T(c, d, 'Caption/Default', 'text/tertiary'); }
  const days = [28, 29, 30].concat(Array.from({ length: 31 }, (_, i) => i + 1)).concat([1]);
  for (let w = 0; w < 5; w++) {
    const row = AL(cal, 'HORIZONTAL', { name: 'Week ' + (w + 1), gap: 0 }); row.layoutSizingHorizontal = 'FILL';
    for (let i = 0; i < 7; i++) {
      const idx = w * 7 + i; const d = days[idx]; const other = idx < 3 || idx > 33; const inRange = !other && d >= 5 && d <= 11; const edge = !other && (d === 5 || d === 11);
      const c = AL(row, 'HORIZONTAL', { name: 'Day ' + d, h: 34, justify: 'CENTER', align: 'CENTER', fill: inRange && !edge ? 'accent/subtle' : null }); c.layoutSizingHorizontal = 'FILL';
      const pill = AL(c, 'HORIZONTAL', { w: 32, h: 32, radius: 6, justify: 'CENTER', align: 'CENTER', fill: edge ? 'accent/default' : null, stroke: (!other && d === 10) ? 'accent/default' : null });
      await T(pill, String(d), 'Body/Small', edge ? 'text/inverse' : other ? 'text/disabled' : inRange ? 'accent/text' : 'text/primary', { tnum: true });
    }
  }
  const ft = AL(p, 'HORIZONTAL', { name: 'Footer', gap: 8, pad: [12, 16, 12, 16], align: 'CENTER', fill: 'bg/surface-subtle', strokeSides: [1, 0, 0, 0], stroke: 'border/default' }); ft.layoutSizingHorizontal = 'FILL';
  const cmp = AL(ft, 'HORIZONTAL', { gap: 8, align: 'CENTER' }); cmp.layoutSizingHorizontal = 'FILL'; await T(cmp, 'Compare to', 'Body/Small', 'text/secondary'); const s = inst('Select|State=Default', cmp); setP(s, { Value: 'Prior week' });
  btn(ft, 'Secondary', 'Cancel', null, { size: 'Small' }); btn(ft, 'Primary', 'Apply', null, { size: 'Small' });
  p.x = 1440 - 32 - 600 - 250; p.y = 150;
}
// 9 Filter drawer
{
  const f = overlay('Overlay · Filter drawer', true);
  const d = AL(f, 'VERTICAL', { name: 'Drawer', w: 420, h: 900, fill: 'bg/surface', clip: true });
  await fx(d, 'Elevation/4 · Modal');
  const h = inst('Modal header', d); h.layoutSizingHorizontal = 'FILL'; await txt(h, 'Title', 'Filter orders'); await txt(h, 'Description', '3 filters applied · 41 of 128 orders match');
  const b = AL(d, 'VERTICAL', { name: 'Body', gap: 24, pad: [8, 24, 24, 24] }); b.layoutSizingHorizontal = 'FILL'; b.layoutSizingVertical = 'FILL';
  const g1 = AL(b, 'VERTICAL', { gap: 10, name: 'Stage' }); g1.layoutSizingHorizontal = 'FILL'; await T(g1, 'Stage', 'Label/Overline', 'text/tertiary');
  for (const [l, on] of [['Awaiting vehicle', 1], ['At gate', 0], ['Loading', 1], ['At weighbridge', 0], ['Part dispatched', 0], ['Overdue', 1]]) { const c = inst('Checkbox|State=' + (on ? 'Checked' : 'Unchecked'), g1); setP(c, { Label: l }); }
  await selectField(b, 'Customer', 'Any customer'); await selectField(b, 'Product', 'TMT Fe 550D (all sizes)');
  const g2 = AL(b, 'VERTICAL', { gap: 10, name: 'Quantity' }); g2.layoutSizingHorizontal = 'FILL'; await T(g2, 'Ordered quantity (MT)', 'Label/Overline', 'text/tertiary');
  const qr = AL(g2, 'HORIZONTAL', { gap: 12 }); qr.layoutSizingHorizontal = 'FILL'; field(qr, 'Filled', 'Min', '10.00'); field(qr, 'Default', 'Max', 'No limit');
  const ft = AL(d, 'HORIZONTAL', { name: 'Footer', gap: 8, pad: [16, 24, 16, 24], align: 'CENTER', fill: 'bg/surface-subtle', strokeSides: [1, 0, 0, 0], stroke: 'border/default' }); ft.layoutSizingHorizontal = 'FILL';
  const cl = await T(ft, 'Clear all', 'Button/Default', 'text/link'); cl.layoutSizingHorizontal = 'FILL'; btn(ft, 'Primary', 'Show 41 orders', null);
  d.x = 1440 - 420; d.y = 0;
}
// 10 Row action menu
{
  const f = overlay('Overlay · Row menu', false);
  const mn = AL(f, 'VERTICAL', { name: 'Menu', w: 248, pad: 4, gap: 0, radius: 8, fill: 'bg/surface', stroke: 'border/default' });
  await fx(mn, 'Elevation/3 · Popover');
  for (const [l, ic, st] of [['Open order', 'arrow-up-right', 'Hover'], ['Assign vehicle', 'truck', 'Default'], ['Download PDF', 'file', 'Default'], ['Duplicate', 'layers', 'Default'], ['—', null, null], ['Cancel order', 'trash', 'Destructive']]) {
    if (l === '—') { const dv = R(mn, 10, 1, 'border/subtle', { name: 'Divider' }); dv.layoutSizingHorizontal = 'FILL'; continue; }
    const mi = inst('Menu item|State=' + st, mn); mi.layoutSizingHorizontal = 'FILL'; setP(mi, { Label: l, Icon: LIB['Icon/' + ic].id }); mi.name = 'Menu/' + l;
    recolor(mi.findOne(n => n.name === 'Icon'), st === 'Destructive' ? 'status/negative/fg' : 'text/secondary');
    const mt = mi.findOne(n => n.name === 'Meta'); if (mt) mt.visible = false;
  }
  mn.x = 1440 - 32 - 248 - 20; mn.y = 360;
}
// 11 Toasts (result feedback)
for (const [name, tone, title, desc] of [['Overlay · Toast · Vehicle assigned', 'Success', 'Vehicle assigned', 'MH 12 RT 4418 → Bay 2 for ORD-24819. Gate pass sent.'], ['Overlay · Toast · Settings saved', 'Success', 'Settings saved', 'Alert thresholds now apply to all 3 plants.'], ['Overlay · Toast · Export started', 'Info', 'Export started', 'orders.csv will download when ready (about 10 s).'], ['Overlay · Toast · Disconnected', 'Warning', 'SAP S/4HANA disconnected', 'Dispatch confirmations will queue for 7 days.']]) {
  clear(name);
  const t = inst('Toast|Tone=' + tone, page); setP(t, { Title: title, Description: desc }); t.name = name; place(t, ovx, OVY); ovx += 440;
}
const shots = page.children.filter(n => n.name && n.name.startsWith('Overlay · ') && n.type === 'FRAME').slice(0, 10);
for (const s of shots.slice(0, 6)) await s.screenshot({ scale: 0.22 });
return { overlays: shots.map(s => s.name + ' ' + s.id), errors: ERR.slice(0, 40), errCount: ERR.length };
