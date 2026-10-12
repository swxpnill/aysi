await Promise.all(['Regular', 'Medium', 'SemiBold', 'Bold'].map(s => figma.loadFontAsync({ family: 'Geist', style: s })));
await loadLib();
const page = figma.root.children[1];
await figma.setCurrentPageAsync(page);
const F = n => page.children.find(c => c.name === n);
// ---- fixes from batch A
for (const n of ['Nav/Brokers', 'Nav/Products', 'Nav/Transporters']) { const ni = LIB['Sidebar'].children.find(c => c.name === n); const ic = ni && ni.findOne(x => x.type === 'INSTANCE'); if (ic) recolor(ic, 'nav/text-muted'); }
{ const k = F('02 · Dashboard') && F('02 · Dashboard').findOne(n => n.name === 'KPI/On-time dispatch rate'); if (k) setP(k, { Baseline: '64 of 70 due-dated · prior 93.5%' }); }
function navActive(sb, label) { const nav = sb.findOne(n => n.name === 'Nav/' + label); if (nav) { try { nav.setProperties({ State: 'Active' }); } catch (e) { } recolor(nav.findOne(x => x.type === 'INSTANCE'), 'nav/indicator'); } }

// ---- Orders: primary filters = All + Completed
async function ordersTabs(frame, active) {
  const tabs = frame.findOne(n => n.name === 'Tabs'); if (!tabs) { ERR.push('no tabs'); return; }
  for (const t of tabs.children.slice()) if (!['Tab/All', 'Tab/Completed'].includes(t.name)) t.remove();
  for (const t of tabs.children) { try { t.setProperties({ State: t.name === 'Tab/' + active ? 'Active' : 'Default' }); } catch (e) { } }
  const chip = frame.findOne(n => n.type === 'INSTANCE' && n.mainComponent && n.mainComponent.parent && n.mainComponent.parent.name === 'Filter chip' && n.mainComponent.name === 'State=Applied');
  if (chip) setP(chip, { Label: 'Plant: Nagpur Works' });
}
const OA = F('03 · Orders');
await ordersTabs(OA, 'All');
let OC = F('03 · Orders — Completed'); if (OC) OC.remove();
OC = OA.clone(); OC.name = '03 · Orders — Completed'; page.appendChild(OC); OC.x = 3080; OC.y = -1300;
await ordersTabs(OC, 'Completed');
{ const b = OC.findOne(n => n.name === 'Bulk action bar (2 selected)'); if (b) b.remove();
  const DONE = [['ORD-24817', 'Narmada Steel Traders', 'MS Channel 100×50', '42.00', '42.00', '09 Oct 2026'], ['ORD-24811', 'Vardhan Infra Projects', 'TMT Fe 550D · 16 mm', '80.00', '80.00', '08 Oct 2026'], ['ORD-24806', 'Kaveri Builders', 'TMT Fe 500 · 12 mm', '24.00', '23.62', '07 Oct 2026'], ['ORD-24799', 'Sahyadri Engineering', 'MS Angle 50×50×6', '15.00', '15.00', '06 Oct 2026'], ['ORD-24790', 'Ashoka Realty', 'Binding wire 18 G', '4.00', '4.00', '05 Oct 2026']];
  const rows = OC.findAll(n => n.type === 'INSTANCE' && n.name.startsWith('Row/'));
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]; if (i >= DONE.length) { row.visible = false; continue; }
    const d = DONE[i];
    try { row.setProperties({ State: 'Default' }); } catch (e) { }
    await txt(row, 'Order', d[0]); await txt(row, 'Customer', d[1]); await txt(row, 'Product', d[2]); await txt(row, 'Ordered MT', d[3]); await txt(row, 'Dispatched', d[4]); await txt(row, 'Progress value', '100%'); await txt(row, 'Ordered', d[5]);
    const fill = row.findOne(n => n.name === 'Fill'); if (fill) { try { fill.visible = true; fill.resize(72, 4); } catch (e) { } }
    const stg = row.findOne(n => n.name === 'Stage'); if (stg) { try { stg.setProperties({ Tone: 'Positive' }); } catch (e) { } setP(stg, { Label: d[0] === 'ORD-24806' ? 'Completed short' : 'Completed' }); }
    row.name = 'Row/' + d[0];
  }
  const pg = OC.findOne(n => n.name === 'Pagination' || (n.type === 'INSTANCE' && n.mainComponent && n.mainComponent.name === 'Pagination')); if (pg) await txt(pg, 'Summary', 'Showing 1–5 of 48 completed orders');
  const ttl = OC.findOne(n => n.name === 'Description'); if (ttl) ttl.characters = 'Orders whose status is Completed — fully dispatched, or closed short within tolerance. Cancelled orders are excluded.';
}
// empty state for the Completed filter (search with no match)
{
  let E = F('03 · Orders — Completed · empty'); if (E) E.remove();
  E = OC.clone(); E.name = '03 · Orders — Completed · empty'; page.appendChild(E); E.x = 4620; E.y = -1300;
  const tbl = E.findOne(n => n.name === 'Card/Orders table');
  if (tbl) { for (const c of tbl.children.slice()) if (!(c.type === 'INSTANCE' && c.mainComponent && c.mainComponent.name === 'Table header · Orders')) c.remove(); const es = inst('Empty state', tbl); es.layoutSizingHorizontal = 'FILL'; await txt(es, 'Title', 'No completed orders match “Rewa”'); await txt(es, 'Description', 'Completed shows only orders with status Completed. Try All, or clear the search.'); const a = es.findOne(n => n.name === 'Action'); if (a) setP(a, { Label: 'Clear search' }); }
  const sb = E.findOne(n => n.name === 'Search'); const st = sb && sb.findOne(n => n.type === 'TEXT'); if (st) { st.characters = 'Rewa'; st.fills = [P('text/primary')]; }
}
{ const lab = F('Row label · Orders states'); if (lab) lab.remove(); const t = await T(null, 'Orders · primary filter states (All · Completed · empty)', 'Display/Page title', 'text/primary', { name: 'Row label · Orders states' }); page.appendChild(t); place(t, 3080, -1400); }

// ---- Customers list (rebuilt)
const CU = await screen('06 · Customers', 6160, 0, 'Customers', 'Directory', 'Customers');
await pageHeader(CU.content, 'Customers', 'Everyone you sell to, what they have bought, and what they still have to lift.', async a => { btn(a, 'Secondary', 'Export', 'download'); btn(a, 'Primary', 'New customer', 'plus'); });
const ck = AL(CU.content, 'HORIZONTAL', { name: 'Summary', gap: 16 }); ck.layoutSizingHorizontal = 'FILL';
for (const [l, v, u, s] of [['Customers', '214', 'accounts', '206 active · 8 on hold'], ['With open orders', '38', 'customers', '68 open orders'], ['Order value · FY 26–27', '₹ 48.6', 'crore', 'Apr – Oct 2026'], ['Outstanding to lift', '2,112.65', 'MT', 'across 68 open orders']]) { const k = inst('KPI card|State=Default', ck); k.layoutSizingHorizontal = 'FILL'; setP(k, { Label: l, Value: v, Unit: u, Baseline: s, 'Show sparkline': false }); const d = k.findOne(n => n.name === 'Delta'); if (d) d.visible = false; k.name = 'Summary/' + l; }
const ct = AL(CU.content, 'HORIZONTAL', { name: 'Toolbar', gap: 8, align: 'CENTER' }); ct.layoutSizingHorizontal = 'FILL';
await searchBox(ct, 'Search name, code, GSTIN, contact or phone…', 360); chip(ct, 'Applied', 'Status: Active'); chip(ct, 'Default', 'City'); chip(ct, 'Default', 'Has open orders');
const csp = AL(ct, 'HORIZONTAL', { name: 'Spacer' }); csp.layoutSizingHorizontal = 'FILL';
await T(ct, 'Sort: Order value ↓', 'Button/Small', 'text/secondary', { name: 'Sort' });
const ctab = card(CU.content, 'Card/Customers table'); ctab.layoutSizingHorizontal = 'FILL';
await simpleTable(ctab, [['Customer', 'F', 'L', 'avatar'], ['Contact', 190, 'L', 'avatar2'], ['Location · GSTIN', 190, 'L', 'two'], ['Orders', 80, 'R'], ['Order value', 130, 'R'], ['To lift', 100, 'R'], ['Status', 110, 'L', 'badge'], ['', 36, 'R', 'chev']], [
  [['VI', 'Vardhan Infra Projects', 'CUS-0003'], ['Rohan Vardhan', '+91 98230 11420'], ['Nagpur, MH', '27AAFCV2210K1Z9'], '112', '₹ 6,84,20,000', '1,284.50', ['Positive', 'Active'], ''],
  [['KB', 'Kaveri Builders', 'CUS-0007'], ['Arjun Kulkarni', '+91 98220 41157'], ['Nagpur, MH', '27AAKCK4821M1Z5'], '46', '₹ 2,68,40,000', '412.60', ['Positive', 'Active'], ''],
  [['SE', 'Sahyadri Engineering', 'CUS-0011'], ['Nikhil Joshi', '+91 99700 52318'], ['Pune, MH', '27AADCS8812L1Z4'], '38', '₹ 1,92,75,000', '238.80', ['Positive', 'Active'], ''],
  [['SS', 'Shreeji Structurals', 'CUS-0014'], ['Meera Shah', '+91 98904 77012'], ['Amravati, MH', '27ABDFS0912P1Z2'], '21', '₹ 74,10,000', '96.00', ['Positive', 'Active'], ''],
  [['GC', 'Godavari Constructions', 'CUS-0019'], ['Farhan Shaikh', '+91 97654 20981'], ['Nanded, MH', '27AAGCG3301H1Z7'], '17', '₹ 58,90,000', '74.25', ['Warning', 'On hold'], ''],
  [['RC', 'Rewa Cements Pvt Ltd', 'CUS-0022'], ['Sanjay Tiwari', '+91 94250 66310'], ['Rewa, MP', '23AABCR6620E1Z3'], '9', '₹ 31,40,000', '33.00', ['Positive', 'Active'], ''],
  [['NS', 'Narmada Steel Traders', 'CUS-0025'], ['Vikram Patel', '+91 94251 30877'], ['Jabalpur, MP', '23AACFN7741Q1Z8'], '28', '₹ 1,12,60,000', '0.00', ['Neutral', 'No open orders'], '']], { rowH: 60 });
const cpg = inst('Pagination', ctab); cpg.layoutSizingHorizontal = 'FILL'; await txt(cpg, 'Summary', 'Showing 1–7 of 206 active customers');

// ---- Customer detail
const CD = await screen('06b · Customer detail', 7700, 0, 'Customers', 'Customers', 'Kaveri Builders');
const back = AL(CD.content, 'HORIZONTAL', { name: 'Back link', gap: 6, align: 'CENTER' }); icon(back, 'chevron-left', 16, 'text/link'); await T(back, 'All customers', 'Body/Small strong', 'text/link');
const hd = AL(CD.content, 'HORIZONTAL', { name: 'Profile header', gap: 16, align: 'CENTER' }); hd.layoutSizingHorizontal = 'FILL';
const av = inst('Avatar|Size=40', hd); setP(av, { Initials: 'KB' }); av.rescale(1.4);
const hdt = AL(hd, 'VERTICAL', { gap: 4 }); hdt.layoutSizingHorizontal = 'FILL';
const hn = AL(hdt, 'HORIZONTAL', { gap: 10, align: 'CENTER' }); await T(hn, 'Kaveri Builders', 'Display/Page title', 'text/primary'); badge(hn, 'Positive', 'Active');
await T(hdt, 'CUS-0007 · GSTIN 27AAKCK4821M1Z5 · Nagpur, Maharashtra · customer since Mar 2023', 'Body/Small', 'text/secondary', { tnum: true });
const ha = AL(hd, 'HORIZONTAL', { gap: 8, align: 'CENTER', name: 'Actions' }); btn(ha, 'Secondary', 'Edit customer', 'pencil'); btn(ha, 'Primary', 'New order', 'plus'); const hm = inst('Icon button|State=Default', ha); if (hm) hm.name = 'More actions';
const st = AL(CD.content, 'HORIZONTAL', { name: 'Stats', gap: 0, radius: 8, fill: 'bg/surface', stroke: 'border/default', clip: true }); st.layoutSizingHorizontal = 'FILL';
const STATS = [['Orders · lifetime', '46', '5 open'], ['Order value · FY 26–27', '₹ 2,68,40,000', 'Apr – Oct 2026'], ['Outstanding to lift', '412.60 MT', 'across 5 open orders'], ['On-time dispatch', '93.9%', '31 of 33 due-dated orders'], ['Last order', '08 Oct 2026', 'ORD-24819']];
for (let i = 0; i < STATS.length; i++) { const [l, v, s] = STATS[i]; const c = AL(st, 'VERTICAL', { gap: 4, pad: [16, 20, 16, 20], strokeSides: [0, i < STATS.length - 1 ? 1 : 0, 0, 0], stroke: 'border/subtle', name: 'Stat/' + l }); c.layoutSizingHorizontal = 'FILL'; await T(c, l, 'Caption/Default', 'text/tertiary'); await T(c, v, 'Numeric/Large', 'text/primary', { tnum: true }); await T(c, s, 'Caption/Default', 'text/secondary', { tnum: true }); }
const tb = AL(CD.content, 'HORIZONTAL', { name: 'Tabs', gap: 24, strokeSides: [0, 0, 1, 0], stroke: 'border/default' }); tb.layoutSizingHorizontal = 'FILL';
for (const [l, n, a] of [['Overview', null, 1], ['Orders', '46', 0], ['Shipments', '61', 0], ['Notes', '3', 0]]) { const t = inst('Tab|State=' + (a ? 'Active' : 'Default'), tb); setP(t, n ? { Label: l, Count: n, 'Show count': true } : { Label: l, 'Show count': false }); t.name = 'Tab/' + l; }
const cols = AL(CD.content, 'HORIZONTAL', { name: 'Columns', gap: 16, align: 'MIN' }); cols.layoutSizingHorizontal = 'FILL';
const lc = AL(cols, 'VERTICAL', { name: 'Primary column', gap: 16 }); lc.layoutSizingHorizontal = 'FILL';
const ao = card(lc, 'Card/Active orders'); ao.layoutSizingHorizontal = 'FILL';
const aoa = await cardHeader(ao, 'Active orders', '5 open · 412.60 MT to lift'); btn(aoa, 'Ghost', 'All orders', 'arrow-up-right', { size: 'Small', name: 'Button/Customer orders' });
await simpleTable(ao, [['Order', 104, 'L', 'num'], ['Product', 'F', 'L'], ['Balance', 110, 'R'], ['Due', 100, 'L', 'num'], ['Stage', 150, 'L', 'badge']], [['ORD-24819', 'TMT Fe 550D · 16 mm', '31.85 MT', '14 Oct', ['Info', 'Loading']], ['ORD-24815', 'TMT Fe 550D · 12 mm', '120.00 MT', '20 Oct', ['Neutral', 'Awaiting vehicle']], ['ORD-24803', 'MS Plate 10 mm', '64.75 MT', '09 Oct', ['Negative', '3 days overdue']]], { rowH: 48, firstLink: true });
const sh = card(lc, 'Card/Shipment performance'); sh.layoutSizingHorizontal = 'FILL';
const sha = await cardHeader(sh, 'Shipment history & dispatch performance', 'Last 6 months · on time = final dispatch on or before the due date');
const shb = AL(sh, 'HORIZONTAL', { name: 'Months', gap: 12, pad: [4, 20, 16, 20], align: 'MAX' }); shb.layoutSizingHorizontal = 'FILL';
for (const [m, n, ot] of [['May', 9, 9], ['Jun', 11, 10], ['Jul', 12, 11], ['Aug', 8, 8], ['Sep', 13, 12], ['Oct', 8, 7]]) { const c = AL(shb, 'VERTICAL', { gap: 6, align: 'CENTER', name: 'Month/' + m }); c.layoutSizingHorizontal = 'FILL'; await T(c, Math.round(ot / n * 100) + '%', 'Caption/Default', ot === n ? 'status/positive/fg' : 'text/secondary', { tnum: true }); const b = figma.createFrame(); b.name = 'Bar'; b.resize(28, n * 8); b.fills = [P('bg/surface-muted')]; b.cornerRadius = 4; b.layoutMode = 'VERTICAL'; b.primaryAxisAlignItems = 'MAX'; b.primaryAxisSizingMode = 'FIXED'; b.counterAxisSizingMode = 'FIXED'; c.appendChild(b); const f = R(b, 28, ot * 8, 'chart/series-1', { radius: 4, name: 'On time' }); await T(c, m, 'Chart/Axis', 'chart/axis'); await T(c, ot + '/' + n, 'Chart/Axis', 'text/tertiary', { tnum: true }); }
const shl = AL(sh, 'HORIZONTAL', { name: 'Legend', gap: 16, pad: [0, 20, 16, 20] }); shl.layoutSizingHorizontal = 'FILL';
for (const [tok, l] of [['chart/series-1', 'Dispatched on time'], ['bg/surface-muted', 'Dispatched late']]) { const r = AL(shl, 'HORIZONTAL', { gap: 6, align: 'CENTER' }); R(r, 10, 10, tok, { radius: 2 }); await T(r, l, 'Caption/Default', 'text/secondary'); }
const oh = card(lc, 'Card/Recent shipments'); oh.layoutSizingHorizontal = 'FILL';
await cardHeader(oh, 'Recent shipments', 'Loadings dispatched against this customer');
await simpleTable(oh, [['Loading', 110, 'L', 'num'], ['Vehicle', 140, 'L', 'num'], ['Order', 104, 'L', 'num'], ['Net MT', 100, 'R'], ['Dispatched', 'F', 'L', 'num'], ['Timeliness', 140, 'L', 'badge']], [['LD-55088', 'MH 31 CQ 7710', 'ORD-24819', '31.20', '09 Oct · 14:22', ['Positive', 'On time']], ['LD-55079', 'MH 12 RT 4418', 'ORD-24819', '28.50', '09 Oct · 12:48', ['Positive', 'On time']], ['LD-55041', 'MH 40 AK 0915', 'ORD-24803', '30.10', '07 Oct · 16:05', ['Negative', '1 day late']]], { rowH: 48, firstLink: true });
const rc = AL(cols, 'VERTICAL', { name: 'Side column', gap: 16, w: 352 });
async function infoCard(parent, title, rows, action) { const c = card(parent, 'Card/' + title); c.layoutSizingHorizontal = 'FILL'; const a = await cardHeader(c, title, null); if (action) btn(a, 'Ghost', action, 'pencil', { size: 'Small', name: 'Button/Edit ' + title }); const b = AL(c, 'VERTICAL', { gap: 0, pad: [0, 20, 8, 20], name: 'Fields' }); b.layoutSizingHorizontal = 'FILL'; for (const [l, v] of rows) { const r = AL(b, 'VERTICAL', { gap: 2, pad: [10, 0, 10, 0], strokeSides: [1, 0, 0, 0], stroke: 'border/subtle', name: 'Field/' + l }); r.layoutSizingHorizontal = 'FILL'; await T(r, l, 'Caption/Default', 'text/tertiary'); await T(r, v, 'Body/Small', 'text/primary', { fill: true, tnum: true }); } return c; }
await infoCard(rc, 'Contact', [['Primary contact', 'Arjun Kulkarni · Purchase manager'], ['Phone', '+91 98220 41157'], ['Email', 'purchase@kaveribuilders.in'], ['Other contacts', 'Smita Rao (accounts) · +91 98221 66403']], 'Edit');
await infoCard(rc, 'Company & addresses', [['Legal name', 'Kaveri Builders Pvt. Ltd.'], ['Billing address', '3rd floor, Shree Plaza, Dharampeth, Nagpur 440010'], ['Delivery sites', 'Site 4, Wardha Road, Nagpur · Butibori MIDC, Plot C-12'], ['PAN', 'AAKCK4821M']], 'Edit');
await infoCard(rc, 'Commercial', [['Payment terms', '30 days from dispatch'], ['Credit limit', '₹ 50,00,000 · ₹ 18,40,000 used'], ['Price list', 'Standard · Nagpur'], ['Broker', 'Mehta & Sons Brokerage']], 'Edit');
const notes = card(rc, 'Card/Notes'); notes.layoutSizingHorizontal = 'FILL';
const nta = await cardHeader(notes, 'Notes', '3 notes · visible to office staff'); btn(nta, 'Ghost', 'Add note', 'plus', { size: 'Small' });
const ntb = AL(notes, 'VERTICAL', { gap: 12, pad: [0, 20, 16, 20] }); ntb.layoutSizingHorizontal = 'FILL';
for (const [t, m] of [['Site 4 accepts trucks 08:00–18:00 only; call Arjun before dispatching after 16:00.', 'Priya R. · 02 Oct'], ['Prefers 12 m lengths for TMT; cut lengths need a separate order line.', 'Anil K. · 14 Sep']]) { const n = AL(ntb, 'VERTICAL', { gap: 4, pad: 12, radius: 6, fill: 'bg/surface-subtle', stroke: 'border/subtle' }); n.layoutSizingHorizontal = 'FILL'; await T(n, t, 'Body/Small', 'text/primary', { fill: true }); await T(n, m, 'Caption/Default', 'text/tertiary'); }
await infoCard(rc, 'Account', [['Customer code', 'CUS-0007'], ['Created', '14 Mar 2023 by Priya Raman'], ['Last edited', '02 Oct 2026 by Anil Kumar']], null);

await OC.screenshot({ scale: 0.3 });
await CU.f.screenshot({ scale: 0.4 });
await CD.f.screenshot({ scale: 0.4 });
return { customers: CU.f.id, detail: CD.f.id, completed: OC.id, errors: ERR.slice(0, 30), errCount: ERR.length };
