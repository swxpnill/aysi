// ---------- v2 · D: notifications, prototype, interaction map ----------
const NOTE = { links: 0 };
// 1. Toast component gains an optional action link (property-driven)
{
  const any = LIB['Toast|Tone=Success']; const set = any && any.parent;
  if (set && !Object.keys(set.componentPropertyDefinitions).some(k => k.startsWith('Action'))) {
    const kA = set.addComponentProperty('Action', 'TEXT', 'View');
    const kS = set.addComponentProperty('Show action', 'BOOLEAN', false);
    for (const v of set.children) {
      const tx = v.findOne(n => n.name === 'Text'); if (!tx) continue;
      const a = await T(tx, 'View', 'Button/Small', 'accent/text', { name: 'Action' });
      a.componentPropertyReferences = { characters: kA, visible: kS };
    }
    set.description = 'Contextual notification. Success/Info auto-dismiss after 5 s; Warning after 8 s unless it carries an action; Error never auto-dismisses. Critical operational issues are also written to the notification centre and stay there until acknowledged.';
  }
}
const F = n => page.children.find(c => c.name === n);
// 2. Notification stack (placement + three live examples)
{
  clear('Overlay · Notification stack');
  const f = figma.createFrame(); f.name = 'Overlay · Notification stack'; f.resize(1440, 900); f.fills = []; f.clipsContent = false; page.appendChild(f); place(f, 19000, 3400);
  const stack = AL(f, 'VERTICAL', { name: 'Toast region (aria-live=polite · errors assertive)', gap: 12 }); stack.x = 1440 - 32 - 380; stack.y = 64 + 16;
  for (const [tone, title, desc, act] of [['Warning', 'ORD-24812 is at risk', 'Due tomorrow · 6.50 MT has no vehicle assigned.', 'Open order'], ['Success', 'Order ORD-24823 created', 'Kaveri Builders · TMT Fe 550D 16 mm · 40.00 MT', 'View order'], ['Error', 'SAP S/4HANA sync failed', 'Last success 17:55 · 3 orders not imported. Kept in notifications until resolved.', 'View integration']]) {
    const t = inst('Toast|Tone=' + tone, stack); setP(t, { Title: title, Description: desc, Action: act, 'Show action': true }); t.name = 'Toast/' + tone;
  }
  const spec = AL(f, 'VERTICAL', { name: 'Placement spec', gap: 6, pad: 16, radius: 8, fill: 'bg/surface', stroke: 'accent/border', w: 380 }); spec.x = 1440 - 32 - 380; spec.y = 560;
  await T(spec, 'Placement', 'Label/Overline', 'accent/text');
  await T(spec, 'Top-right, 16 px below the 64 px top bar and 32 px from the edge — clear of page titles, primary actions and chart controls. Newest on top, max 3 visible; older ones collapse into the bell count. 240 ms slide-in from the right, 160 ms fade-out; reduced-motion users get the fade only.', 'Body/Small', 'text/secondary', { fill: true });
}
// 3. Notification centre: persistent home for critical items
{
  const f = F('Overlay · Notifications'); const p = f && f.findOne(n => n.name === 'Notifications panel');
  if (p) {
    const ft = p.findOne(n => n.name === 'Footer'); const ftt = ft && ft.findOne(n => n.type === 'TEXT'); if (ftt) ftt.characters = 'Notification settings';
    const first = p.findAll(n => n.name.startsWith('Notification/'));
    const map = [['LD-55094 is over tolerance by +0.38 MT', 'ORD-24817 · held on weight · needs approval'], ['Weighbridge 2 stopped reporting', 'Device WB-02 · 17:42 · stays here until resolved'], ['6 orders are past their dispatch date', 'Oldest ORD-24798 · 4 days · exceptions list']];
    for (let i = 0; i < Math.min(first.length, 3); i++) { const ts = first[i].findAll(n => n.type === 'TEXT'); if (ts[0]) ts[0].characters = map[i][0]; if (ts[1]) ts[1].characters = map[i][1]; first[i].name = 'Notification/' + map[i][0]; }
    if (!p.findOne(n => n.name === 'Persistence note')) { const note = AL(null, 'HORIZONTAL', { name: 'Persistence note', gap: 8, pad: [8, 16, 8, 16], fill: 'status/warning/bg', align: 'CENTER' }); p.insertChild(2, note); note.layoutSizingHorizontal = 'FILL'; icon(note, 'info', 14, 'status/warning/fg'); await T(note, 'Critical items stay here until someone acknowledges them.', 'Caption/Default', 'text/primary'); }
  }
}
// 4. Prototype wiring
const tr = { type: 'DISSOLVE', easing: { type: 'EASE_OUT' }, duration: 0.18 };
async function react(node, actions) { if (!node) return; try { await node.setReactionsAsync([{ trigger: { type: 'ON_CLICK' }, actions }]); NOTE.links++; } catch (e) { ERR.push('react ' + node.name + ': ' + String(e.message || e).slice(0, 90)); } }
function go(dest, nav) { const d = F(dest); if (!d) { ERR.push('no dest ' + dest); return null; } return { type: 'NODE', destinationId: d.id, navigation: nav || 'NAVIGATE', transition: tr, preserveScrollPosition: false }; }
async function link(scope, sel, dest, nav) { const s = typeof scope === 'string' ? F(scope) : scope; if (!s) { ERR.push('no scope ' + scope); return; } const nodes = typeof sel === 'function' ? s.findAll(sel) : [s.findOne(n => n.name === sel)].filter(Boolean); if (!nodes.length) { ERR.push('no node ' + sel + ' in ' + s.name); return; } const a = go(dest, nav); if (a) for (const n of nodes) await react(n, [a]); }
const SCREENS = ['02 · Dashboard', '03 · Orders', '03 · Orders — Completed', '03 · Orders — Completed · empty', '04 · Order detail', '06 · Customers', '06b · Customer detail', '07 · Brokers', '07b · Broker detail', '08 · Products', '09 · Transporters', '09b · Transporter detail', '09 · Settings', '10 · Users & access', '11 · Integrations'];
const NAV = { Dashboard: '02 · Dashboard', Orders: '03 · Orders', Customers: '06 · Customers', Brokers: '07 · Brokers', Products: '08 · Products', Transporters: '09 · Transporters', Settings: '09 · Settings', 'Users & access': '10 · Users & access', Integrations: '11 · Integrations' };
for (const s of SCREENS) { const f = F(s); if (!f) { ERR.push('no screen ' + s); continue; } for (const [l, d] of Object.entries(NAV)) if (d !== s) await link(f, 'Nav/' + l, d); await link(f, 'Notifications', 'Overlay · Notifications', 'OVERLAY'); }
const isRow = p => n => n.name.startsWith('Row/' + p);
// dashboard
await link('02 · Dashboard', 'KPI/Total orders', '03 · Orders'); await link('02 · Dashboard', 'KPI/Active shipments', '03 · Orders'); await link('02 · Dashboard', 'KPI/On-time dispatch rate', '03 · Orders — Completed'); await link('02 · Dashboard', 'KPI/At-risk shipments', '03 · Orders');
await link('02 · Dashboard', isRow('ORD-'), '04 · Order detail'); await link('02 · Dashboard', isRow('MH '), '04 · Order detail');
for (const n of ['Link/At risk', 'Link/Exceptions', 'Button/Attention in orders', 'Button/Open orders', 'Button/All shipments', 'Button/New order', 'Status/Awaiting vehicle', 'Status/Vehicle assigned', 'Status/Loading', 'Status/Part dispatched', 'Status/Cancelled']) await link('02 · Dashboard', n, '03 · Orders');
await link('02 · Dashboard', 'Status/Completed', '03 · Orders — Completed');
await link('02 · Dashboard', 'Date range', 'Overlay · Date range', 'OVERLAY'); await link('02 · Dashboard', 'Button/Export', 'Overlay · Export orders', 'OVERLAY');
// orders filters
await link('03 · Orders', 'Tab/Completed', '03 · Orders — Completed'); await link('03 · Orders — Completed', 'Tab/All', '03 · Orders'); await link('03 · Orders — Completed', 'Search', '03 · Orders — Completed · empty');
await link('03 · Orders — Completed · empty', 'Tab/All', '03 · Orders'); await link('03 · Orders — Completed · empty', n => n.name === 'Action' && n.type === 'INSTANCE', '03 · Orders — Completed');
await link('03 · Orders — Completed', isRow('ORD-'), '04 · Order detail');
await link('04 · Order detail', 'Button/Open', '06b · Customer detail');
// directory
await link('06 · Customers', isRow(''), '06b · Customer detail'); await link('06b · Customer detail', 'Back link', '06 · Customers'); await link('06b · Customer detail', isRow('ORD-'), '04 · Order detail'); await link('06b · Customer detail', 'Button/Customer orders', '03 · Orders'); await link('06b · Customer detail', isRow('LD-'), '04 · Order detail');
await link('07 · Brokers', isRow(''), '07b · Broker detail'); await link('07b · Broker detail', 'Back link', '07 · Brokers'); await link('07b · Broker detail', isRow('ORD-'), '04 · Order detail'); await link('07b · Broker detail', n => ['Row/Kaveri Builders', 'Row/Shreeji Structurals', 'Row/Ashoka Realty'].includes(n.name), '06b · Customer detail'); await link('07b · Broker detail', n => n.name === 'Row/Om Sai Roadlines' || n.name === 'Row/Shree Ganesh Transport', '09b · Transporter detail');
await link('08 · Products', isRow(''), 'Overlay · Product detail', 'OVERLAY');
{ const pd = F('Overlay · Product detail'); if (pd) { await react(pd.findOne(n => n.name === 'Dismiss area'), [{ type: 'CLOSE' }]); await react(pd.findOne(n => n.name === 'Close'), [{ type: 'CLOSE' }]); } }
await link('Overlay · Product detail', 'Button/View orders', '03 · Orders');
await link('09 · Transporters', isRow(''), '09b · Transporter detail'); await link('09b · Transporter detail', 'Back link', '09 · Transporters'); await link('09b · Transporter detail', isRow('LD-'), '04 · Order detail');
// notification centre destinations
await link('Overlay · Notifications', 'Notification/LD-55094 is over tolerance by +0.38 MT', '04 · Order detail');
await link('Overlay · Notifications', 'Notification/6 orders are past their dispatch date', '03 · Orders');
await link('Overlay · Notifications', 'Notification/Weighbridge 2 stopped reporting', '11 · Integrations');
await link('Overlay · Notifications', 'Footer', '09 · Settings');
// toasts in the stack point at their records
await link('Overlay · Notification stack', 'Toast/Warning', '04 · Order detail'); await link('Overlay · Notification stack', 'Toast/Success', '04 · Order detail'); await link('Overlay · Notification stack', 'Toast/Error', '11 · Integrations');
try { page.flowStartingPoints = [{ nodeId: F('01 · Sign in').id, name: 'A · Sign in → dashboard' }, { nodeId: F('02 · Dashboard').id, name: 'B · Dashboard → exceptions → order → assign vehicle' }, { nodeId: F('06 · Customers').id, name: 'C · Directory: customers, brokers, products, transporters' }]; } catch (e) { ERR.push('flows ' + e.message); }

// 5. Interaction map v2 — routes, KPI definitions, notification rules
clear('Interaction map');
const M = AL(page, 'VERTICAL', { name: 'Interaction map', gap: 32, pad: [64, 72, 72, 72], fill: 'bg/canvas', w: 2900 }); place(M, 0, 4500);
await T(M, 'Interaction map · v2', 'Label/Overline', 'accent/text');
await T(M, 'Routes, KPI definitions and notification rules', 'Display/Page title', 'text/primary');
await T(M, 'Navigation: Dashboard · Orders · Customers · Brokers · Products · Transporters, then Settings, Users & access and Integrations. Reports, Activity and the Yard board are removed; their routes are retired and nothing links to them. All figures in the file are illustrative sample data.', 'Body/Default', 'text/secondary', { w: 1600 });
async function table(title, cols, rows) {
  const sec = AL(M, 'VERTICAL', { gap: 12, name: 'Section/' + title }); sec.layoutSizingHorizontal = 'FILL'; await T(sec, title, 'Heading/Section', 'text/primary');
  const tb = AL(sec, 'VERTICAL', { name: 'Table', fill: 'bg/surface', stroke: 'border/default', radius: 8, clip: true }); tb.layoutSizingHorizontal = 'FILL';
  const hr = AL(tb, 'HORIZONTAL', { pad: [12, 16, 12, 16], gap: 16, fill: 'bg/surface-subtle', strokeSides: [0, 0, 1, 0], stroke: 'border/default' }); hr.layoutSizingHorizontal = 'FILL';
  for (const [l, w] of cols) { const t = await T(hr, l, 'Label/Overline', 'text/tertiary', w === 'F' ? {} : { w }); if (w === 'F') { t.textAutoResize = 'HEIGHT'; t.layoutSizingHorizontal = 'FILL'; } }
  for (const r of rows) { const rr = AL(tb, 'HORIZONTAL', { pad: [12, 16, 12, 16], gap: 16, align: 'MIN', strokeSides: [0, 0, 1, 0], stroke: 'border/subtle', name: 'Row/' + r[0] }); rr.layoutSizingHorizontal = 'FILL'; for (let i = 0; i < cols.length; i++) { const [l, w] = cols[i]; const t = await T(rr, r[i], i === 0 ? 'Body/Small strong' : 'Body/Small', i === 0 ? 'text/primary' : 'text/secondary', w === 'F' ? {} : { w }); if (w === 'F') { t.textAutoResize = 'HEIGHT'; t.layoutSizingHorizontal = 'FILL'; } } }
}
await table('KPI definitions (dashboard and every list summary use the same rules and the same date-range filter)', [['KPI', 260], ['Definition', 900], ['Comparison shown', 520], ['Drill-down', 'F']], [
  ['Total orders', 'Orders raised (order date) inside the selected range, all statuses except drafts.', 'Same-length prior period; volume — shown with a neutral-to-favourable delta, never a target.', 'Orders · All, range applied'],
  ['Active shipments', 'Loadings with status Vehicle assigned, Loading, Loaded or Held — vehicles between assignment and gate-out. Not range-bound: it is a live count.', 'Status breakdown instead of a delta (no honest prior value exists for a live count).', 'Orders · All, stage = in progress'],
  ['On-time dispatch rate', 'Orders whose final dispatch fell inside the range and which had a due date: share whose final dispatch date ≤ due date. Delivery is not tracked, so this is measured at gate-out and labelled “dispatch”, not “delivery”. Orders without a due date are excluded and counted in the caption.', 'Percentage-point change vs. prior period; lower is unfavourable.', 'Orders · Completed'],
  ['At-risk shipments', 'Open orders (Confirmed or Part dispatched) due within 2 days whose remaining balance has no vehicle assigned. Excludes anything already counted as an exception.', 'Count vs. yesterday; higher is unfavourable. Exceptions are counted separately beside it.', 'Orders · All, “At risk” filter'],
  ['Exceptions (not a KPI tile)', 'Open orders past their due date with a balance > 0, plus orders with a loading held on a weight exception. An order matching both is counted once.', 'None — every item is listed.', 'Order detail']]);
await table('Notification rules', [['Event', 300], ['Channel', 360], ['Severity & lifetime', 480], ['De-duplication', 420], ['Destination', 'F']], [
  ['Order becomes at risk', 'Warning toast + notification centre', 'Warning · 8 s, or until dismissed when it carries “Open order”', 'One per order per state change (order id + “at-risk”); cleared when a vehicle is assigned', 'Order detail'],
  ['Order passes its due date with a balance', 'Notification centre (persistent) + one error toast', 'Error · stays until acknowledged', 'One per order; re-raised only if it is re-opened', 'Orders, exceptions'],
  ['Loading held on a weight exception', 'Notification centre (persistent) + error toast to approvers', 'Error · stays until the exception is approved or rejected', 'One per loading', 'Order detail → loading'],
  ['Integration sync fails', 'Notification centre (persistent) + error toast to admins', 'Error · stays until a sync succeeds', 'One per integration while failing; count shown, not repeated', 'Integrations'],
  ['Order created / updated / vehicle assigned', 'Success toast to the person who acted', 'Success · 5 s', 'None needed — only after the server confirms the write', 'Order detail via “View order”'],
  ['Customer, broker, product or transporter form invalid', 'Inline, next to the field', 'Validation · until corrected', 'n/a', 'Stays on the form — no toast, no banner']]);
await table('Routes and record mapping', [['Trigger', 420], ['Destination', 420], ['Mapping rule', 'F']], [
  ['Dashboard KPI', 'Orders (filtered) or Orders · Completed', 'Filters carried in the URL (?range=&status=&risk=) so back / forward and shared links reproduce the view'],
  ['Order row (any list)', 'Order detail /orders/:orderId', 'By order id, never by row position'],
  ['Customer row / customer link on an order', 'Customer detail /customers/:customerId', 'Customer id; brokers and transporters are separate entities and never resolve here'],
  ['Broker row / broker on an order', 'Broker detail /brokers/:brokerId', 'Broker id; associated orders = orders.broker_id'],
  ['Transporter row / transporter on a loading', 'Transporter detail /transporters/:transporterId', 'Transporter id taken from the loading; shipments listed by loading'],
  ['Product row', 'Product detail drawer ?product=:productId', 'Drawer over the list keeps the list’s search and filters'],
  ['Notification or toast', 'The affected record', 'Each notification stores its record type + id; clicking marks it read']]);
await M.screenshot({ scale: 0.2 });
await F('Overlay · Notification stack').screenshot({ scale: 0.4 });
return { NOTE, errors: ERR.slice(0, 40), errCount: ERR.length };
