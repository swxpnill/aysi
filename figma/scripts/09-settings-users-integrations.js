function field(parent, st, label, value, helper) { const f = inst('Text field|State=' + st, parent); if (!f) return null; f.layoutSizingHorizontal = 'FILL'; setP(f, helper ? { Label: label, Value: value, 'Helper text': helper, 'Show helper': true } : { Label: label, Value: value, 'Show helper': false }); f.name = 'Field/' + label; return f; }
async function selectField(parent, label, value) { const g = AL(parent, 'VERTICAL', { gap: 6, name: 'Select/' + label }); g.layoutSizingHorizontal = 'FILL'; await T(g, label, 'Label/Default', 'text/secondary'); const s = inst('Select|State=Default', g); s.layoutSizingHorizontal = 'FILL'; setP(s, { Value: value }); return g; }
async function formCard(parent, title, desc) { const c = card(parent, 'Card/' + title); c.layoutSizingHorizontal = 'FILL'; const h = AL(c, 'VERTICAL', { name: 'Header', gap: 4, pad: [20, 24, 0, 24] }); h.layoutSizingHorizontal = 'FILL'; await T(h, title, 'Heading/Section', 'text/primary'); if (desc) await T(h, desc, 'Body/Small', 'text/secondary', { fill: true }); const b = AL(c, 'VERTICAL', { name: 'Body', gap: 20, pad: [20, 24, 24, 24] }); b.layoutSizingHorizontal = 'FILL'; return { c, b }; }
function row2(parent) { const r = AL(parent, 'HORIZONTAL', { gap: 16, name: 'Row', align: 'MIN' }); r.layoutSizingHorizontal = 'FILL'; return r; }

// ================= SETTINGS =================
const ST = await screen('09 · Settings', 3080, 1600, 'Settings', 'Administration', 'Workspace settings');
await pageHeader(ST.content, 'Workspace settings', 'Identity, units and how Foundry reaches your team. Changes apply to every plant.', null);
const sc = AL(ST.content, 'HORIZONTAL', { name: 'Settings layout', gap: 32, align: 'MIN' }); sc.layoutSizingHorizontal = 'FILL';
const snav = AL(sc, 'VERTICAL', { name: 'Settings nav', gap: 2, w: 208 });
for (const [l, on] of [['Workspace', true], ['Plants', false], ['Units & formats', false], ['Notifications', false], ['Users & access', false], ['Integrations', false], ['Billing', false], ['Danger zone', false]]) { const m = inst('Menu item|State=' + (on ? 'Selected' : 'Default'), snav); m.layoutSizingHorizontal = 'FILL'; setP(m, { Label: l, 'Show icon': false }); const mt = m.findOne(n => n.name === 'Meta'); if (mt) mt.visible = false; m.name = 'Settings nav/' + l; }
const sf = AL(sc, 'VERTICAL', { name: 'Forms', gap: 16 }); sf.layoutSizingHorizontal = 'FILL';
const ws = await formCard(sf, 'Workspace', 'Shown on invoices, dispatch notes and the customer portal.');
const w1 = row2(ws.b); field(w1, 'Filled', 'Organisation name', 'Vardhan Ispat Ltd.'); field(w1, 'Error', 'GSTIN', '27AABCV9921F1Z', 'GSTIN must be 15 characters — 1 missing.');
const w2 = row2(ws.b); field(w2, 'Focus', 'Workspace address', 'vardhan-ispat', '.foundry.io — changing this breaks existing links.'); field(w2, 'Default', 'Registered office', 'Plot 14, MIDC Hingna, Nagpur 440016');
const un = await formCard(sf, 'Units & formats', 'How weights, numbers and times are displayed and exported.');
const u1 = row2(un.b); await selectField(u1, 'Weight unit', 'Metric tonnes (MT)'); await selectField(u1, 'Number format', 'Indian · 1,00,000.00');
const u2 = row2(un.b); await selectField(u2, 'Time zone', 'Asia/Kolkata · IST (UTC+5:30)'); field(u2, 'Filled', 'Weighbridge tolerance', '± 0.25 MT per load', 'Loads outside tolerance raise an alert and need approval.');
const nt = await formCard(sf, 'Alerts', 'Sent in-app, by email and to gate staff on WhatsApp.');
for (const [l, d, on] of [['Weight variance alerts', 'Notify when a net weight exceeds tolerance', true], ['Daily summary email', 'A brief at 08:00 IST of yesterday’s dispatch', true], ['WhatsApp staff messages', 'Send loading updates to gate staff', false]]) { const r = AL(nt.b, 'HORIZONTAL', { gap: 16, align: 'CENTER', name: 'Pref/' + l }); r.layoutSizingHorizontal = 'FILL'; const tx = AL(r, 'VERTICAL', { gap: 2 }); tx.layoutSizingHorizontal = 'FILL'; await T(tx, l, 'Body/Strong', 'text/primary'); await T(tx, d, 'Body/Small', 'text/secondary'); const tg = inst('Toggle|State=' + (on ? 'On' : 'Off'), r); setP(tg, { 'Show label': false }); }
const dz = card(sf, 'Card/Danger zone', { stroke: 'status/negative/border' }); dz.layoutSizingHorizontal = 'FILL';
const dzr = AL(dz, 'HORIZONTAL', { gap: 16, pad: 24, align: 'CENTER', name: 'Body' }); dzr.layoutSizingHorizontal = 'FILL';
const dzt = AL(dzr, 'VERTICAL', { gap: 4 }); dzt.layoutSizingHorizontal = 'FILL'; await T(dzt, 'Delete workspace', 'Heading/Section', 'status/negative/fg'); await T(dzt, 'Permanently removes 3 plants, 12,480 orders and all weighbridge records. Exports remain available for 30 days.', 'Body/Small', 'text/secondary', { fill: true });
btn(dzr, 'Danger', 'Delete workspace…', 'trash', { name: 'Button/Delete workspace' });
const sbar = AL(ST.content, 'HORIZONTAL', { name: 'Unsaved changes bar', gap: 12, pad: [12, 16, 12, 20], radius: 8, fill: 'bg/inverse', align: 'CENTER' }); sbar.layoutSizingHorizontal = 'FILL';
await fx(sbar, 'Elevation/3 · Popover');
icon(sbar, 'info', 16, 'nav/indicator'); const sbt = await T(sbar, 'You have 2 unsaved changes · GSTIN needs fixing before you can save', 'Body/Small', 'text/inverse'); sbt.layoutSizingHorizontal = 'FILL';
btn(sbar, 'Ghost', 'Discard', null, { size: 'Small' }); const sv = btn(sbar, 'Primary', 'Save changes', null, { size: 'Small', state: 'Disabled' });
{ const dl = sbar.findOne(n => n.name === 'Button/Discard'); const l = dl && dl.findOne(n => n.name === 'Label'); if (l) l.fills = [P('nav/text')]; }

// ================= USERS & ACCESS =================
const UA = await screen('10 · Users & access', 4620, 1600, 'Users & access', 'Administration', 'Users & access');
await pageHeader(UA.content, 'Users & access', 'Who can see and change what at Vardhan Ispat Ltd. Every change is written to Activity.', async a => { btn(a, 'Secondary', 'Export', 'download'); btn(a, 'Primary', 'Invite people', 'plus'); });
tabsRow(UA.content, [['Members', '24'], ['Pending invites', '2'], ['Roles', '5']], 'Members');
const utool = AL(UA.content, 'HORIZONTAL', { name: 'Toolbar', gap: 8, align: 'CENTER' }); utool.layoutSizingHorizontal = 'FILL';
await searchBox(utool, 'Search people…', 280); chip(utool, 'Default', 'Role'); chip(utool, 'Default', 'Plant'); chip(utool, 'Default', 'Status');
const ut = card(UA.content, 'Card/Members'); ut.layoutSizingHorizontal = 'FILL';
await simpleTable(ut, [['Person', 'F', 'L', 'avatar'], ['Role', 180, 'L'], ['Plants', 160, 'L'], ['Last active', 130, 'L', 'num'], ['Status', 130, 'L', 'badge'], ['', 40, 'R', 'menu']], [
  [['PR', 'Priya Raman', 'priya.raman@vardhanispat.in'], 'Admin', 'All plants', 'Now', ['Positive', 'Active'], ''],
  [['AK', 'Anil Kumar', 'anil.kumar@vardhanispat.in'], 'Order manager', 'Nagpur Works', '12 min ago', ['Positive', 'Active'], ''],
  [['RS', 'Rakesh Sharma', 'rakesh.s@vardhanispat.in'], 'Gate operator', 'Nagpur Works', '38 min ago', ['Positive', 'Active'], ''],
  [['NV', 'Neha Verma', 'neha.verma@vardhanispat.in'], 'Weighbridge operator', 'Nagpur, Wardha', '2 h ago', ['Positive', 'Active'], ''],
  [['MS', 'Meera Shah', 'meera@shreejistructurals.in'], 'Viewer · customer', 'Portal only', '—', ['Info', 'Invited'], ''],
  [['FA', 'Farhan Ali', 'farhan.ali@vardhanispat.in'], 'Weighbridge operator', 'Nagpur Works', '19 Sep 2026', ['Neutral', 'Suspended'], '']], { rowH: 60 });
const pm = card(UA.content, 'Card/Role permissions'); pm.layoutSizingHorizontal = 'FILL';
const pma = await cardHeader(pm, 'Role permissions', 'What each role can do. Custom roles are available on the Enterprise plan.'); btn(pma, 'Secondary', 'Edit roles', 'pencil', { size: 'Small' });
const ROLES = ['Admin', 'Order manager', 'Gate operator', 'Weighbridge op.', 'Viewer'];
const CAPS = [['View dashboards & reports', [1, 1, 1, 1, 1]], ['Create and edit orders', [1, 1, 0, 0, 0]], ['Assign vehicles & bays', [1, 1, 1, 0, 0]], ['Record weighbridge readings', [1, 0, 0, 1, 0]], ['Approve over-tolerance loads', [1, 1, 0, 0, 0]], ['Manage users, settings & billing', [1, 0, 0, 0, 0]]];
const ph = AL(pm, 'HORIZONTAL', { name: 'Matrix header', pad: [0, 20, 0, 20], h: 40, align: 'CENTER', fill: 'bg/surface-subtle', strokeSides: [1, 0, 1, 0], stroke: 'border/default' }); ph.layoutSizingHorizontal = 'FILL';
const ph0 = AL(ph, 'HORIZONTAL', { name: 'Capability' }); ph0.layoutSizingHorizontal = 'FILL'; await T(ph0, 'Capability', 'Label/Overline', 'text/tertiary');
for (const r of ROLES) { const c = AL(ph, 'HORIZONTAL', { w: 132, justify: 'CENTER', name: 'Role/' + r }); await T(c, r, 'Label/Overline', 'text/tertiary'); }
for (const [cap, vals] of CAPS) { const r = AL(pm, 'HORIZONTAL', { name: 'Cap/' + cap, pad: [0, 20, 0, 20], h: 44, align: 'CENTER', strokeSides: [0, 0, 1, 0], stroke: 'border/subtle' }); r.layoutSizingHorizontal = 'FILL'; const c0 = AL(r, 'HORIZONTAL', { name: 'Capability' }); c0.layoutSizingHorizontal = 'FILL'; await T(c0, cap, 'Body/Small', 'text/primary'); for (const v of vals) { const c = AL(r, 'HORIZONTAL', { w: 132, justify: 'CENTER', name: 'Cell' }); if (v) icon(c, 'check', 16, 'status/positive/fg'); else await T(c, '—', 'Body/Small', 'text/disabled'); } }

// ================= INTEGRATIONS =================
const IN = await screen('11 · Integrations', 6160, 1600, 'Integrations', 'Administration', 'Integrations');
await pageHeader(IN.content, 'Integrations', 'Connect Foundry to the systems your plant already runs on. Credentials are encrypted and never shown again.', async a => { btn(a, 'Secondary', 'Request an integration', 'message'); });
tabsRow(IN.content, [['All', '6'], ['Connected', '3'], ['Needs attention', '1'], ['Available', '2']], 'All');
const grid = AL(IN.content, 'HORIZONTAL', { name: 'Integration grid', gap: 16 }); grid.layoutSizingHorizontal = 'FILL'; grid.layoutWrap = 'WRAP'; grid.counterAxisSpacing = 16;
const INTS = [['SA', 'SAP S/4HANA', 'ERP · orders & invoicing', 'Two-way sync of sales orders, deliveries and invoices.', 'Connected', 'Last sync 17:55 · 1,284 records', 'chart/series-1'], ['EW', 'E-way bill (GST)', 'Compliance', 'Generate e-way bills automatically when a load is weighed out.', 'Connected', 'Last bill 17:12 · LD-55093', 'chart/series-2'], ['WA', 'WhatsApp Business', 'Messaging', 'Send loading and gate updates to drivers and gate staff.', 'Connected', '214 messages this week', 'chart/series-2'], ['WB', 'Weighbridge controllers', 'Hardware · 2 devices', 'Stream readings from WB-01 and WB-02 over the plant network.', 'Error', 'WB-02 offline since 17:42', 'chart/series-4'], ['TP', 'Tally Prime', 'Accounting', 'Post dispatch invoices and customer balances to Tally.', 'Available', 'Not connected', 'chart/series-3'], ['GP', 'GPS fleet tracking', 'Logistics', 'Show live ETA for vehicles assigned to an order.', 'Available', 'Not connected', 'chart/series-3']];
for (const [mono, name, cat, desc, status, meta, tok] of INTS) {
  const c = AL(grid, 'VERTICAL', { name: 'Integration/' + name, gap: 14, pad: 20, radius: 8, fill: 'bg/surface', stroke: status === 'Error' ? 'status/negative/border' : 'border/default', w: 365 });
  const top = AL(c, 'HORIZONTAL', { gap: 12, align: 'CENTER', name: 'Top' }); top.layoutSizingHorizontal = 'FILL';
  const lg = AL(top, 'HORIZONTAL', { w: 40, h: 40, radius: 8, fill: 'bg/surface-muted', stroke: 'border/default', align: 'CENTER', justify: 'CENTER', name: 'Monogram' }); await T(lg, mono, 'Body/Strong', 'text/secondary');
  const nm = AL(top, 'VERTICAL', { gap: 0 }); nm.layoutSizingHorizontal = 'FILL'; await T(nm, name, 'Body/Strong', 'text/primary'); await T(nm, cat, 'Caption/Default', 'text/tertiary');
  badge(top, status === 'Connected' ? 'Positive' : status === 'Error' ? 'Negative' : 'Neutral', status === 'Error' ? 'Needs attention' : status === 'Available' ? 'Not connected' : 'Connected');
  await T(c, desc, 'Body/Small', 'text/secondary', { fill: true });
  const ft = AL(c, 'HORIZONTAL', { gap: 8, align: 'CENTER', name: 'Footer', pad: [12, 0, 0, 0], strokeSides: [1, 0, 0, 0], stroke: 'border/subtle' }); ft.layoutSizingHorizontal = 'FILL';
  const mt = await T(ft, meta, 'Caption/Default', status === 'Error' ? 'status/negative/fg' : 'text/tertiary', { tnum: true }); mt.layoutSizingHorizontal = 'FILL';
  if (status === 'Connected') { btn(ft, 'Secondary', 'Configure', null, { size: 'Small', name: 'Button/Configure ' + name }); const m = inst('Icon button|State=Default', ft); if (m) m.name = 'More/' + name; }
  else if (status === 'Error') btn(ft, 'Primary', 'Reconnect', 'refresh', { size: 'Small', name: 'Button/Reconnect ' + name });
  else btn(ft, 'Secondary', 'Connect', 'plug', { size: 'Small', name: 'Button/Connect ' + name });
}
const help = AL(IN.content, 'HORIZONTAL', { name: 'API note', gap: 12, pad: [14, 16, 14, 16], radius: 8, fill: 'bg/surface', stroke: 'border/default', align: 'CENTER' }); help.layoutSizingHorizontal = 'FILL';
icon(help, 'layers', 18, 'text/secondary'); const ht = await T(help, 'Building something custom? Use the REST API and webhooks — keys are managed per plant under Settings → Developers.', 'Body/Small', 'text/secondary'); ht.layoutSizingHorizontal = 'FILL'; btn(help, 'Ghost', 'API docs', 'external', { size: 'Small' });

await ST.f.screenshot({ scale: 0.4 });
await UA.f.screenshot({ scale: 0.4 });
await IN.f.screenshot({ scale: 0.4 });
return { settings: ST.f.id, users: UA.f.id, integrations: IN.f.id, errors: ERR.slice(0, 40), errCount: ERR.length };
