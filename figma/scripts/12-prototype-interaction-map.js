const F = n => page.children.find(c => c.name === n);
let ok = 0;
const tr = { type: 'DISSOLVE', easing: { type: 'EASE_OUT' }, duration: 0.18 };
async function react(node, actions, trigger) {
  if (!node) { ERR.push('missing source'); return; }
  try { await node.setReactionsAsync([{ trigger: trigger || { type: 'ON_CLICK' }, actions }]); ok++; } catch (e) { ERR.push('react ' + node.name + ': ' + String(e.message || e).slice(0, 120)); }
}
function go(dest, nav) { const d = typeof dest === 'string' ? F(dest) : dest; if (!d) { ERR.push('no dest ' + dest); return null; } return { type: 'NODE', destinationId: d.id, navigation: nav || 'NAVIGATE', transition: tr, preserveScrollPosition: false }; }
async function link(scope, name, dest, nav) { const s = typeof scope === 'string' ? F(scope) : scope; if (!s) { ERR.push('no scope ' + scope); return; } const n = s.name === name ? s : s.findOne(x => x.name === name); if (!n) { ERR.push('no node ' + name + ' in ' + s.name); return; } const a = go(dest, nav); if (a) await react(n, [a]); }
async function close(scope, name) { const s = F(scope); const n = s && s.findOne(x => x.name === name); if (!n) { ERR.push('no close ' + name + ' in ' + scope); return; } await react(n, [{ type: 'CLOSE' }]); }

// wrap toasts in frames so they can be overlay destinations, auto-dismiss after 4 s
for (const n of page.children.slice()) {
  if (n.type === 'INSTANCE' && n.name.startsWith('Overlay · Toast')) {
    const fr = figma.createFrame(); fr.name = n.name; fr.fills = []; fr.resize(n.width, n.height); page.appendChild(fr); fr.x = n.x; fr.y = n.y; fr.clipsContent = false;
    fr.appendChild(n); n.x = 0; n.y = 0; n.name = 'Toast';
    await react(fr, [{ type: 'CLOSE' }], { type: 'AFTER_TIMEOUT', timeout: 4 });
  }
}
const SCREENS = ['02 · Dashboard', '03 · Orders', '04 · Order detail', '05 · Yard & weighbridge', '06 · Customers', '07 · Reports', '08 · Activity', '09 · Settings', '10 · Users & access', '11 · Integrations'];
const NAVMAP = { 'Nav/Dashboard': '02 · Dashboard', 'Nav/Orders': '03 · Orders', 'Nav/Yard & weighbridge': '05 · Yard & weighbridge', 'Nav/Customers': '06 · Customers', 'Nav/Reports': '07 · Reports', 'Nav/Activity': '08 · Activity', 'Nav/Settings': '09 · Settings', 'Nav/Users & access': '10 · Users & access', 'Nav/Integrations': '11 · Integrations' };
for (const s of SCREENS) {
  const f = F(s); if (!f) { ERR.push('no screen ' + s); continue; }
  for (const [nn, dest] of Object.entries(NAVMAP)) if (dest !== s) await link(f, nn, dest);
  await link(f, 'Notifications', 'Overlay · Notifications', 'OVERLAY');
}
// Sign in
await link('01 · Sign in', 'Button/Sign in', '02 · Dashboard');
// Dashboard
await link('02 · Dashboard', 'KPI/Dispatched today', '07 · Reports');
await link('02 · Dashboard', 'KPI/Orders raised today', '03 · Orders');
await link('02 · Dashboard', 'Date range', 'Overlay · Date range', 'OVERLAY');
await link('02 · Dashboard', 'Button/Export', 'Overlay · Export orders', 'OVERLAY');
await link('02 · Dashboard', 'Button/Create order', '03 · Orders');
await link('02 · Dashboard', 'Banner/Overdue', '03 · Orders');
await link('02 · Dashboard', 'Button/Open yard', '05 · Yard & weighbridge');
await link('02 · Dashboard', 'Button/View all orders', '03 · Orders');
for (const r of ['Row/ORD-24798', 'Row/ORD-24801', 'Row/ORD-24805', 'Row/ORD-24819', 'Row/ORD-24821']) await link('02 · Dashboard', r, '04 · Order detail');
// Orders
for (const r of ['Row/ORD-24822', 'Row/ORD-24821', 'Row/ORD-24819', 'Row/ORD-24817', 'Row/ORD-24812', 'Row/ORD-24809', 'Row/ORD-24805', 'Row/ORD-24801', 'Row/ORD-24798']) await link('03 · Orders', r, '04 · Order detail');
await link('03 · Orders', 'Button/Export', 'Overlay · Export orders', 'OVERLAY');
await link('03 · Orders', 'Button/Assign vehicle', 'Overlay · Assign vehicle', 'OVERLAY');
await link('03 · Orders', 'Button/Cancel orders', 'Overlay · Cancel order', 'OVERLAY');
await link('03 · Orders', 'Button/Columns', 'Overlay · Filter drawer', 'OVERLAY');
{ const o = F('03 · Orders'); const tb = o && o.findOne(n => n.name === 'Toolbar'); const chip = tb && tb.children.find(c => c.type === 'INSTANCE' && c.mainComponent && c.mainComponent.parent && c.mainComponent.parent.name === 'Filter chip'); if (chip) await react(chip, [go('Overlay · Filter drawer', 'OVERLAY')]); const dr = tb && tb.children.find(c => c.type === 'INSTANCE' && c.mainComponent && c.mainComponent.name === 'Date range trigger'); if (dr) await react(dr, [go('Overlay · Date range', 'OVERLAY')]); }
// Order detail
await link('04 · Order detail', 'Button/Assign vehicle', 'Overlay · Assign vehicle', 'OVERLAY');
await link('04 · Order detail', 'Back link', '03 · Orders');
await link('04 · Order detail', 'Button/Open', '06 · Customers');
await link('04 · Order detail', 'More actions', 'Overlay · Row menu', 'OVERLAY');
// Yard, reports, integrations
await link('05 · Yard & weighbridge', 'Button/Review weight', '08 · Activity');
await link('07 · Reports', 'Button/Export report', 'Overlay · Toast · Export started', 'OVERLAY');
await link('11 · Integrations', 'More/SAP S/4HANA', 'Overlay · Disconnect integration', 'OVERLAY');
await link('11 · Integrations', 'Button/Connect Tally Prime', 'Overlay · Connect integration', 'OVERLAY');
await link('11 · Integrations', 'Button/Connect GPS fleet tracking', 'Overlay · Connect integration', 'OVERLAY');
// Overlays: dismissal + results
const OVS = ['Overlay · Assign vehicle', 'Overlay · Assign vehicle — error', 'Overlay · Cancel order', 'Overlay · Export orders', 'Overlay · Disconnect integration', 'Overlay · Connect integration', 'Overlay · Notifications', 'Overlay · Date range', 'Overlay · Filter drawer', 'Overlay · Row menu'];
for (const o of OVS) { await close(o, 'Dismiss area'); const f = F(o); const c = f && f.findOne(n => n.name === 'Close'); if (c) await react(c, [{ type: 'CLOSE' }]); const sa = f && f.findOne(n => n.name === 'Secondary action'); if (sa) await react(sa, [{ type: 'CLOSE' }]); }
async function primaryTo(o, actions) { const f = F(o); const p = f && f.findOne(n => n.name === 'Primary action'); if (p) await react(p, actions); else ERR.push('no primary ' + o); }
await primaryTo('Overlay · Assign vehicle', [{ type: 'CLOSE' }, go('Overlay · Toast · Vehicle assigned', 'OVERLAY')]);
await primaryTo('Overlay · Cancel order', [{ type: 'CLOSE' }]);
await primaryTo('Overlay · Export orders', [go('Overlay · Toast · Export started', 'SWAP')]);
await primaryTo('Overlay · Disconnect integration', [go('Overlay · Toast · Disconnected', 'SWAP')]);
await primaryTo('Overlay · Connect integration', [{ type: 'CLOSE' }]);
{ const f = F('Overlay · Assign vehicle'); const q = f && f.findOne(n => n.name === 'Field/Planned quantity (MT)'); if (q) await react(q, [go('Overlay · Assign vehicle — error', 'SWAP')]); }
await link('Overlay · Date range', 'Button/Apply', '02 · Dashboard'); await close('Overlay · Date range', 'Button/Cancel');
await close('Overlay · Filter drawer', 'Button/Show 41 orders');
await link('Overlay · Row menu', 'Menu/Open order', '04 · Order detail');
await link('Overlay · Row menu', 'Menu/Assign vehicle', 'Overlay · Assign vehicle', 'SWAP');
await link('Overlay · Row menu', 'Menu/Cancel order', 'Overlay · Cancel order', 'SWAP');
await link('Overlay · Notifications', 'Notification/LD-55094 is over tolerance by +0.38 MT', '05 · Yard & weighbridge');
await link('Overlay · Notifications', 'Notification/6 orders are past their dispatch date', '03 · Orders');
await link('Overlay · Notifications', 'Notification/Weighbridge 2 stopped reporting', '11 · Integrations');
await link('Overlay · Notifications', 'Footer', '08 · Activity');
try { page.flowStartingPoints = [{ nodeId: F('01 · Sign in').id, name: 'A · Sign in → daily review' }, { nodeId: F('02 · Dashboard').id, name: 'B · Dashboard → order → assign vehicle' }, { nodeId: F('11 · Integrations').id, name: 'C · Integrations' }]; } catch (e) { ERR.push('flows ' + e.message); }

// ---------- Interaction map (documentation) ----------
clear('Interaction map');
const M = AL(page, 'VERTICAL', { name: 'Interaction map', gap: 24, pad: [64, 72, 72, 72], fill: 'bg/canvas', w: 2400, radius: 0 }); place(M, 0, 4500);
await T(M, 'Interaction map', 'Label/Overline', 'accent/text');
await T(M, 'Trigger → open state → action → validation → result → feedback → updated state → dismissal', 'Display/Page title', 'text/primary');
await T(M, 'Every flow below is wired in the prototype (flows A–C). Business logic — saving, syncing, weighing, permission checks — is represented by prototype states only; the right-hand column states what engineering must implement. No backend is connected.', 'Body/Default', 'text/secondary', { w: 1400 });
const COLS = [['Flow', 220], ['Trigger', 260], ['Open state', 220], ['User action', 240], ['Validation', 260], ['Result & feedback', 300], ['Updated state', 260], ['Dismissal / next', 220], ['Implementation note', 'F']];
const tbl = AL(M, 'VERTICAL', { name: 'Flow table', fill: 'bg/surface', stroke: 'border/default', radius: 8, clip: true }); tbl.layoutSizingHorizontal = 'FILL';
const hr = AL(tbl, 'HORIZONTAL', { name: 'Header', pad: [12, 16, 12, 16], gap: 16, fill: 'bg/surface-subtle', strokeSides: [0, 0, 1, 0], stroke: 'border/default' }); hr.layoutSizingHorizontal = 'FILL';
for (const [l, w] of COLS) { const t = await T(hr, l, 'Label/Overline', 'text/tertiary', w === 'F' ? {} : { w }); if (w === 'F') { t.textAutoResize = 'HEIGHT'; t.layoutSizingHorizontal = 'FILL'; } }
const FLOWS = [
  ['KPI drill-down', 'Click a KPI card (Dashboard)', 'Card shows Hover / Focus state', 'Click or Enter', '—', 'Navigates to Reports with the metric pre-selected', 'Reports tab + date range inherited', 'Back / breadcrumb', 'Route /reports?metric=dispatched&range=…'],
  ['Date range', 'Date range trigger', 'Popover: presets + calendar + comparison', 'Pick preset or range, choose comparison, Apply', 'End ≥ start; max 24 months; comparison must be equal length', 'All KPIs, deltas and charts re-query', 'Trigger label + every delta baseline update', 'Esc, click outside, Cancel', 'Single page-level filter state; debounce 300 ms; skeletons while loading'],
  ['Open order', 'Click a table row (Dashboard, Orders)', 'Row Hover state', 'Click, Enter on focused row', '—', 'Order detail opens', 'Breadcrumb Orders › ORD-…', 'Back link returns with scroll + filters preserved', 'Checkbox and ⋯ menu stop propagation'],
  ['Assign vehicle', 'Assign vehicle (Order detail, bulk bar, row menu)', 'Dialog with vehicle, bay, quantity, driver', 'Select vehicle & bay, enter quantity', 'Quantity ≤ balance; vehicle not already loading; bay free', 'Success toast; gate pass sent', 'Stepper moves to “Vehicle assigned”; Loadings table gains row', 'Cancel / Esc / ✕ restores focus to trigger', 'POST /loadings; optimistic UI with rollback on 409'],
  ['Validation error', 'Quantity exceeds balance', 'Field Error state + footer “Fix 1 error”', 'Edit value', 'Inline message names the limit and the difference', 'Primary re-enables when valid', '—', '—', 'Validate on blur and on submit; never only on submit'],
  ['Cancel order', 'Cancel orders (bulk bar / row menu)', 'Destructive dialog naming the order', 'Choose reason, type order ID', 'Typed ID must match exactly', 'Order moves to Cancelled; customer notified', 'Row removed from Outstanding; Activity logged', 'Keep order / Esc', 'Soft delete; reversible by Admin for 24 h'],
  ['Filters', 'Filter chip or Columns', 'Right drawer with stage, customer, product, quantity', 'Toggle filters', 'Min ≤ max', 'Table updates; result count in button', 'Applied chips show in toolbar', 'Show results / Esc', 'Filters persisted per user in URL'],
  ['Export', 'Export (Dashboard, Orders, Reports)', 'Export dialog (format, columns)', 'Choose format & columns', '≤ 100k rows inline, else emailed', 'Info toast “Export started”', '—', 'Auto-dismiss 4 s', 'Async job; email link when > 10 s'],
  ['Notifications', 'Bell (top bar)', 'Popover, Unread tab', 'Click a notification', '—', 'Navigates to the record (yard, orders, device)', 'Item marked read; badge count decrements', 'Click outside / Esc', 'Websocket push; mark-read on open'],
  ['Disconnect integration', '⋯ on a connected integration', 'Destructive dialog listing consequences', 'Confirm Disconnect', 'Admin role required', 'Warning toast', 'Card → Not connected', 'Cancel / Esc', 'Revoke token server-side; queue outbound events 7 days'],
  ['Connect integration', 'Connect (Integrations)', '3-step setup dialog', 'Enter credentials, Test connection', 'Test must pass before Continue', 'Success state inline; step 3 mapping', 'Card → Connected, last sync time', 'Back / Cancel', 'Secrets write-only; never echoed back'],
  ['Save settings', 'Edit any setting', 'Unsaved-changes bar appears', 'Save changes', 'Field-level validation (e.g. GSTIN 15 chars)', 'Success toast “Settings saved”', 'Bar disappears', 'Discard reverts all fields', 'PATCH /workspace; block navigation with unsaved changes']
];
for (const f of FLOWS) {
  const r = AL(tbl, 'HORIZONTAL', { name: 'Flow/' + f[0], pad: [14, 16, 14, 16], gap: 16, align: 'MIN', strokeSides: [0, 0, 1, 0], stroke: 'border/subtle' }); r.layoutSizingHorizontal = 'FILL';
  for (let i = 0; i < COLS.length; i++) { const [l, w] = COLS[i]; const t = await T(r, f[i], i === 0 ? 'Body/Small strong' : 'Body/Small', i === 0 ? 'text/primary' : i === 8 ? 'text/tertiary' : 'text/secondary', w === 'F' ? {} : { w }); if (w === 'F') { t.textAutoResize = 'HEIGHT'; t.layoutSizingHorizontal = 'FILL'; } }
}
const leg = AL(M, 'HORIZONTAL', { name: 'Prototype notes', gap: 24 }); leg.layoutSizingHorizontal = 'FILL';
for (const [h, b] of [['How to run', 'Present from “01 · Desktop screens”. Flow A starts at Sign in, Flow B at the Dashboard, Flow C at Integrations. Sidebar navigation and the bell are live on every screen.'], ['Overlays', 'Dialogs, drawer and popovers are full-viewport frames with their own scrim or transparent click-catcher (“Dismiss area”) so clicking outside closes them. Toasts auto-dismiss after 4 s.'], ['Not simulated', 'Typing, live data refresh, sorting, pagination and permission enforcement are documented above but not executed by Figma.']]) { const c = AL(leg, 'VERTICAL', { gap: 6, pad: 20, radius: 8, fill: 'bg/surface', stroke: 'border/default' }); c.layoutSizingHorizontal = 'FILL'; await T(c, h, 'Heading/Card'); await T(c, b, 'Body/Small', 'text/secondary', { fill: true }); }
await M.screenshot({ scale: 0.25 });
return { reactions: ok, errors: ERR.slice(0, 50), errCount: ERR.length };
