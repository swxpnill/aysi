// ---------- Components B: composites ----------
await loadLib();
const page = figma.currentPage;
for (const n of page.children.slice()) if (n.name === 'Component library · Composites') n.remove();
const lib = AL(page, 'VERTICAL', { name: 'Component library · Composites', gap: 56, pad: [80, 96, 96, 96], fill: 'bg/canvas', w: 1600 });
place(lib, 3400, 0);
const hdr = AL(lib, 'VERTICAL', { gap: 8, name: 'Header' }); hdr.layoutSizingHorizontal = 'FILL';
await T(hdr, 'Components', 'Label/Overline', 'accent/text');
await T(hdr, 'Composites & patterns', 'Display/Page title');
await T(hdr, 'Shell, data and overlay building blocks assembled from the primitives. Screens use instances of these; overrides are limited to text, icon swaps and variant switches.', 'Body/Default', 'text/secondary', { w: 900 });

function vec(parent, w, h, pts, token, o) {
  o = o || {};
  const v = figma.createVector();
  v.name = o.name || 'Line';
  const d = pts.map((p, i) => (i ? 'L ' : 'M ') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  v.vectorPaths = [{ windingRule: 'NONZERO', data: d }];
  v.strokes = [P(token)]; v.strokeWeight = o.sw || 1.5; v.fills = []; v.strokeCap = 'ROUND'; v.strokeJoin = 'ROUND';
  if (o.dash) v.dashPattern = o.dash;
  if (parent) parent.appendChild(v);
  return v;
}
const LOGO = (parent, size) => { const m = figma.createFrame(); m.name = 'Logo/Mark'; m.resize(size, size); m.cornerRadius = size * 0.25; m.fills = [P('accent/default')]; const u = size / 32; R(m, 16 * u, 4 * u, 'text/inverse', { radius: u, x: 8 * u, y: 9 * u }); R(m, 12 * u, 4 * u, 'text/inverse', { radius: u, x: 8 * u, y: 15 * u, opacity: 0.8 }); R(m, 8 * u, 4 * u, 'text/inverse', { radius: u, x: 8 * u, y: 21 * u, opacity: 0.6 }); parent.appendChild(m); return m; };

// ---- Nav item ----
const shellSec = await libSection(lib, 'Application shell', 'Ink sidebar (248 px) gives the product a confident frame while keeping the canvas calm. Nav items: Default, Hover, Active, Focus. Top bar holds breadcrumb, global search (⌘K), help, notifications and account.');
const navs = [];
for (const [st, bg, fg, ic] of [['Default', null, 'nav/text', 'nav/text-muted'], ['Hover', 'nav/bg-hover', 'nav/text-active', 'nav/text'], ['Active', 'nav/bg-active', 'nav/text-active', 'nav/indicator'], ['Focus', null, 'nav/text-active', 'nav/text']]) {
  const c = C('State=' + st, 'HORIZONTAL', { pad: [8, 10, 8, 10], gap: 12, radius: 6, fill: bg, align: 'CENTER', w: 224, h: 36 });
  if (st === 'Focus') { c.strokes = [P('nav/indicator')]; c.strokeWeight = 1.5; c.strokeAlign = 'INSIDE'; }
  const i = icon(c, 'dashboard', 18, ic); i.name = 'Icon';
  const l = await T(c, 'Dashboard', 'Body/Strong', fg, { name: 'Label' }); l.layoutSizingHorizontal = 'FILL';
  const cnt = AL(c, 'HORIZONTAL', { name: 'Count', pad: [0, 6, 0, 6], radius: 999, fill: st === 'Active' ? 'accent/default' : 'nav/bg-active' });
  await T(cnt, '74', 'Label/Default', 'nav/text-active', { name: 'Count value', tnum: true });
  navs.push(c);
}
const navSet = makeSet(navs, 'Nav item', shellSec, { w: 1100, bg: 'nav/bg' });
bindProp(navSet, 'Label', 'TEXT', 'Nav item', 'Label', 'characters');
bindProp(navSet, 'Icon', 'INSTANCE_SWAP', LIB['Icon/dashboard'].id, 'Icon', 'mainComponent');
bindProp(navSet, 'Show count', 'BOOLEAN', false, 'Count', 'visible');
bindProp(navSet, 'Count', 'TEXT', '0', 'Count value', 'characters');
const NAVDEF = LIBSET['Nav item'] = navSet;
const navDefault = navs[0];

// ---- Sidebar ----
const sb = C('Sidebar', 'VERTICAL', { pad: [20, 12, 16, 12], gap: 4, fill: 'nav/bg', w: 248, h: 1024 });
sb.primaryAxisSizingMode = 'FIXED';
shellSec.appendChild(sb);
const brand = AL(sb, 'HORIZONTAL', { name: 'Brand', gap: 10, align: 'CENTER', pad: [0, 8, 16, 8] }); brand.layoutSizingHorizontal = 'FILL';
LOGO(brand, 28);
await T(brand, 'Foundry', 'Heading/Section', 'nav/text-active');
const plant = AL(sb, 'HORIZONTAL', { name: 'Plant switcher', gap: 10, align: 'CENTER', pad: [8, 10, 8, 10], radius: 6, fill: 'nav/bg-hover', stroke: 'nav/bg-active' }); plant.layoutSizingHorizontal = 'FILL';
icon(plant, 'building', 18, 'nav/text');
const pt = AL(plant, 'VERTICAL', { name: 'Plant', gap: 0 }); pt.layoutSizingHorizontal = 'FILL';
await T(pt, 'Nagpur Works', 'Body/Small strong', 'nav/text-active', { name: 'Plant name' });
await T(pt, 'Vardhan Ispat Ltd.', 'Caption/Default', 'nav/text-muted', { name: 'Organisation' });
icon(plant, 'chevron-down', 16, 'nav/text-muted');
const groupsNav = [['Operations', [['Dashboard', 'dashboard', null], ['Orders', 'package', '74'], ['Yard & weighbridge', 'truck', '22'], ['Customers', 'users', null]]], ['Insights', [['Reports', 'chart', null], ['Activity', 'activity', null]]], ['Administration', [['Settings', 'settings', null], ['Users & access', 'shield', null], ['Integrations', 'plug', null]]]];
for (const [g, items] of groupsNav) {
  const gl = AL(sb, 'HORIZONTAL', { name: 'Group label', pad: [20, 10, 6, 10] }); gl.layoutSizingHorizontal = 'FILL';
  await T(gl, g, 'Label/Overline', 'nav/text-muted');
  for (const [label, ic, count] of items) {
    const ni = navDefault.createInstance(); sb.appendChild(ni); ni.layoutSizingHorizontal = 'FILL'; ni.name = 'Nav/' + label;
    const props = { Label: label, Icon: LIB['Icon/' + ic].id, 'Show count': !!count };
    if (count) props.Count = count;
    setP(ni, props);
    recolor(ni.findOne(n => n.name === 'Icon'), 'nav/text-muted');
  }
}
const spacer = AL(sb, 'VERTICAL', { name: 'Spacer' }); spacer.layoutSizingHorizontal = 'FILL'; spacer.layoutSizingVertical = 'FILL';
const user = AL(sb, 'HORIZONTAL', { name: 'Account', gap: 10, align: 'CENTER', pad: [12, 8, 0, 8], strokeSides: [1, 0, 0, 0], stroke: 'nav/bg-active' }); user.layoutSizingHorizontal = 'FILL';
const av = inst('Avatar|Size=32', user); setP(av, { Initials: 'PR' });
const ut = AL(user, 'VERTICAL', { name: 'User', gap: 0 }); ut.layoutSizingHorizontal = 'FILL';
await T(ut, 'Priya Raman', 'Body/Small strong', 'nav/text-active', { name: 'User name' });
await T(ut, 'Dispatch manager', 'Caption/Default', 'nav/text-muted', { name: 'Role' });
icon(user, 'logout', 16, 'nav/text-muted');
sb.description = 'App sidebar. In screens set the matching Nav/* instance to State=Active. Collapses to a drawer below 1024 px.';

// ---- Top bar ----
const tb = C('Top bar', 'HORIZONTAL', { pad: [0, 32, 0, 32], gap: 16, fill: 'bg/surface', align: 'CENTER', w: 1192, h: 64, strokeSides: [0, 0, 1, 0], stroke: 'border/default' });
tb.primaryAxisSizingMode = 'FIXED';
shellSec.appendChild(tb);
const bc = AL(tb, 'HORIZONTAL', { name: 'Breadcrumb', gap: 8, align: 'CENTER' }); bc.layoutSizingHorizontal = 'FILL';
await T(bc, 'Operations', 'Body/Small', 'text/tertiary', { name: 'Section' });
icon(bc, 'chevron-right', 14, 'text/disabled');
await T(bc, 'Dashboard', 'Body/Small strong', 'text/primary', { name: 'Page' });
const search = AL(tb, 'HORIZONTAL', { name: 'Search', gap: 8, pad: [0, 8, 0, 12], radius: 6, fill: 'bg/canvas', stroke: 'border/default', align: 'CENTER', w: 320, h: 36 });
icon(search, 'search', 16, 'text/tertiary');
const sp = await T(search, 'Search orders, vehicles, customers…', 'Body/Small', 'text/tertiary', { name: 'Placeholder' }); sp.layoutSizingHorizontal = 'FILL';
const kbd = AL(search, 'HORIZONTAL', { name: 'Shortcut', pad: [1, 6, 1, 6], radius: 4, fill: 'bg/surface', stroke: 'border/default' });
await T(kbd, '⌘K', 'Caption/Default', 'text/tertiary');
const tbActions = AL(tb, 'HORIZONTAL', { name: 'Actions', gap: 4, align: 'CENTER' });
const help = inst('Icon button|State=Default', tbActions); setP(help, { Icon: LIB['Icon/help'].id }); help.name = 'Help';
const bellWrap = figma.createFrame(); bellWrap.name = 'Notifications'; bellWrap.resize(36, 36); bellWrap.fills = []; tbActions.appendChild(bellWrap);
const bell = inst('Icon button|State=Default', bellWrap); setP(bell, { Icon: LIB['Icon/bell'].id }); bell.x = 0; bell.y = 0;
const dot = figma.createEllipse(); dot.name = 'Unread dot'; dot.resize(8, 8); dot.fills = [P('status/negative/fg')]; dot.strokes = [P('bg/surface')]; dot.strokeWeight = 2; dot.strokeAlign = 'OUTSIDE'; bellWrap.appendChild(dot); dot.x = 21; dot.y = 8;
R(tbActions, 1, 24, 'border/default', { name: 'Divider' });
const tav = inst('Avatar|Size=32', tbActions); setP(tav, { Initials: 'PR' });
tb.description = 'Global top bar. Breadcrumb Section/Page are text overrides. Bell opens the Notifications panel overlay; ⌘K opens command search.';

// ---- KPI card ----
const dataSec = await libSection(lib, 'Data display', 'KPI cards are clickable (open the metric detail). Each shows label, value with unit, a polarity-aware delta with its baseline, and an optional sparkline. Loading and No-data states are first-class.');
const kpis = [];
const spark = [[0, 22], [24, 20], [48, 23], [72, 16], [96, 18], [120, 12], [144, 14], [168, 9], [192, 11], [216, 6], [238, 8]];
const sparkPrev = [[0, 24], [24, 23], [48, 21], [72, 22], [96, 19], [120, 20], [144, 17], [168, 18], [192, 15], [216, 16], [238, 14]];
for (const st of ['Default', 'Hover', 'Selected', 'Loading', 'No data']) {
  const c = C('State=' + st, 'VERTICAL', { pad: 20, gap: 12, radius: 8, fill: 'bg/surface', stroke: st === 'Selected' ? 'accent/default' : st === 'Hover' ? 'border/strong' : 'border/default', w: 272 });
  if (st === 'Selected') c.strokeWeight = 1.5;
  await fx(c, st === 'Hover' ? 'Elevation/2 · Raised' : 'Elevation/1 · Card');
  const h = AL(c, 'HORIZONTAL', { name: 'Header', gap: 8, align: 'CENTER' }); h.layoutSizingHorizontal = 'FILL';
  const lab = await T(h, 'Dispatched today', 'Body/Small', 'text/secondary', { name: 'Label' }); lab.layoutSizingHorizontal = 'FILL';
  const ii = icon(h, 'info', 16, 'text/tertiary'); ii.name = 'Info';
  if (st === 'Loading') {
    const sk = AL(c, 'VERTICAL', { name: 'Skeleton', gap: 10 }); sk.layoutSizingHorizontal = 'FILL';
    R(sk, 140, 28, 'bg/surface-muted', { radius: 4, name: 'Value skeleton' });
    R(sk, 100, 14, 'bg/surface-muted', { radius: 4, name: 'Delta skeleton' });
    const s3 = R(sk, 232, 32, 'bg/surface-muted', { radius: 4, name: 'Spark skeleton' }); s3.layoutSizingHorizontal = 'FILL';
    kpis.push(c); continue;
  }
  const vr = AL(c, 'HORIZONTAL', { name: 'Value row', gap: 6, align: 'BASELINE' });
  await T(vr, st === 'No data' ? '—' : '1,846.20', 'Numeric/KPI', st === 'No data' ? 'text/tertiary' : 'text/primary', { name: 'KPI value', tnum: true });
  await T(vr, 'MT', 'Body/Small', 'text/tertiary', { name: 'Unit' });
  const fr = AL(c, 'HORIZONTAL', { name: 'Comparison', gap: 8, align: 'CENTER' }); fr.layoutSizingHorizontal = 'FILL';
  const d = inst(st === 'No data' ? 'Delta|Outcome=No data' : 'Delta|Outcome=Favourable', fr); if (d) { d.name = 'Delta'; setP(d, { Value: st === 'No data' ? '— No data' : '▲ 8.4%' }); }
  await T(fr, st === 'No data' ? 'Weighbridge 2 offline since 14:20' : 'vs. yesterday 1,703.10', 'Caption/Default', 'text/tertiary', { name: 'Baseline', tnum: true });
  const chart = figma.createFrame(); chart.name = 'Sparkline'; chart.resize(232, 32); chart.fills = []; c.appendChild(chart); chart.layoutSizingHorizontal = 'FILL';
  if (st !== 'No data') { vec(chart, 232, 32, sparkPrev, 'chart/comparison', { sw: 1, dash: [3, 3], name: 'Prior period' }); vec(chart, 232, 32, spark, 'chart/series-1', { sw: 1.5, name: 'Current period' }); }
  else { const nd = R(chart, 232, 1, 'border/default', { y: 16, name: 'No data rule' }); nd.dashPattern = [3, 3]; }
  kpis.push(c);
}
const kpiSet = makeSet(kpis, 'KPI card', dataSec, { w: 1408, bg: 'bg/canvas', desc: 'Click → metric detail. Delta outcome follows metric polarity. Value uses Numeric/KPI with tabular figures.' });
bindProp(kpiSet, 'Label', 'TEXT', 'Metric', 'Label', 'characters');
bindProp(kpiSet, 'Value', 'TEXT', '0', 'KPI value', 'characters');
bindProp(kpiSet, 'Unit', 'TEXT', 'MT', 'Unit', 'characters');
bindProp(kpiSet, 'Baseline', 'TEXT', 'vs. yesterday', 'Baseline', 'characters');
bindProp(kpiSet, 'Show sparkline', 'BOOLEAN', true, 'Sparkline', 'visible');

// Card header + legend
const ch = C('Card header', 'HORIZONTAL', { pad: [20, 20, 16, 24], gap: 12, align: 'CENTER', w: 760, fill: 'bg/surface' });
dataSec.appendChild(ch);
const cht = AL(ch, 'VERTICAL', { name: 'Titles', gap: 2 }); cht.layoutSizingHorizontal = 'FILL';
await T(cht, 'Dispatch volume', 'Heading/Card', 'text/primary', { name: 'Title' });
await T(cht, 'Net MT per day · Nagpur Works', 'Caption/Default', 'text/tertiary', { name: 'Subtitle' });
const chA = AL(ch, 'HORIZONTAL', { name: 'Actions', gap: 8, align: 'CENTER' });
const segTrack = AL(chA, 'HORIZONTAL', { name: 'Range', pad: 2, radius: 6, fill: 'bg/surface-muted', gap: 2 });
for (const [l, s] of [['Week', true], ['Month', false], ['Quarter', false]]) { const sg = inst('Segment|Selected=' + (s ? 'True' : 'False'), segTrack); setP(sg, { Label: l }); }
const mo = inst('Icon button|State=Default', chA); mo.name = 'More';
ch.description = 'Header for any card / chart container. Title, subtitle and an actions slot (segmented range, menu).';
const legs = [];
for (const [s, tok, dash, txt] of [['Primary', 'chart/series-1', null, 'This week'], ['Comparison', 'chart/comparison', [3, 3], 'Prior week'], ['Target', 'chart/target', [4, 3], 'Daily target']]) {
  const c = C('Series=' + s, 'HORIZONTAL', { gap: 6, align: 'CENTER' });
  const k = figma.createFrame(); k.name = 'Key'; k.resize(16, 8); k.fills = []; c.appendChild(k);
  const ln = vec(k, 16, 8, [[0, 4], [16, 4]], tok, { sw: 2, dash }); ln.x = 0; ln.y = 4;
  await T(c, txt, 'Caption/Default', 'text/secondary', { name: 'Label' });
  legs.push(c);
}
const legSet = makeSet(legs, 'Legend item', dataSec, { w: 600 });
bindProp(legSet, 'Label', 'TEXT', 'Series', 'Label', 'characters');

// Table header + row
const tableSec = await libSection(lib, 'Table', 'Dense 48 px rows, right-aligned tabular figures, sticky header on surface-subtle. Row states: Default, Hover, Selected (with checkbox), Focus. Whole row opens the record; checkbox and overflow menu stop propagation.');
const COLS = [['', 40, 'L'], ['Order', 108, 'L'], ['Customer', 196, 'L'], ['Product', 176, 'L'], ['Ordered MT', 92, 'R'], ['Dispatched', 92, 'R'], ['Progress', 132, 'L'], ['Ordered', 104, 'L'], ['Stage', 124, 'L'], ['', 36, 'R']];
const th = C('Table header · Orders', 'HORIZONTAL', { pad: [0, 12, 0, 12], align: 'CENTER', w: 1128, h: 40, fill: 'bg/surface-subtle', strokeSides: [0, 0, 1, 0], stroke: 'border/default' });
th.primaryAxisSizingMode = 'FIXED';
tableSec.appendChild(th);
for (const [label, w, a] of COLS) {
  const cell = AL(th, 'HORIZONTAL', { name: 'Th/' + (label || 'blank'), w, gap: 4, align: 'CENTER', justify: a === 'R' ? 'MAX' : 'MIN', pad: [0, 8, 0, 8] });
  if (label === '' && w === 40) { inst('Checkbox|State=Unchecked', cell) && setP(cell.children[0], { 'Show label': false }); continue; }
  if (label) { await T(cell, label, 'Label/Overline', 'text/tertiary'); if (label === 'Ordered') icon(cell, 'chevron-down', 12, 'text/tertiary'); }
}
const rows = [];
for (const st of ['Default', 'Hover', 'Selected']) {
  const c = C('State=' + st, 'HORIZONTAL', { pad: [0, 12, 0, 12], align: 'CENTER', w: 1128, h: 52, fill: st === 'Default' ? 'bg/surface' : st === 'Hover' ? 'bg/hover' : 'bg/selected', strokeSides: [0, 0, 1, 0], stroke: 'border/subtle' });
  c.primaryAxisSizingMode = 'FIXED';
  const vals = ['', 'ORD-24819', 'Kaveri Builders', 'TMT Fe 550D · 16 mm', '120.00', '88.15', '73%', '08 Oct 2026', 'Loading', ''];
  for (let i = 0; i < COLS.length; i++) {
    const [label, w, a] = COLS[i];
    const cell = AL(c, 'HORIZONTAL', { name: 'Td/' + (label || (i === 0 ? 'select' : 'menu')), w, gap: 8, align: 'CENTER', justify: a === 'R' ? 'MAX' : 'MIN', pad: [0, 8, 0, 8] });
    if (i === 0) { const cb = inst(st === 'Selected' ? 'Checkbox|State=Checked' : 'Checkbox|State=Unchecked', cell); setP(cb, { 'Show label': false }); continue; }
    if (i === 9) { icon(cell, 'more', 16, 'text/tertiary'); continue; }
    if (i === 6) {
      const bar = figma.createFrame(); bar.name = 'Bar'; bar.resize(72, 4); bar.cornerRadius = 2; bar.fills = [P('bg/surface-muted')]; cell.appendChild(bar);
      R(bar, 72 * 0.73, 4, 'accent/default', { radius: 2, name: 'Fill' });
      await T(cell, vals[i], 'Numeric/Table', 'text/secondary', { name: 'Progress value', tnum: true });
      continue;
    }
    if (i === 8) { const b = inst('Badge|Tone=Info', cell); setP(b, { Label: 'Loading' }); b.name = 'Stage'; continue; }
    const style = i === 1 ? 'Body/Small strong' : (a === 'R' ? 'Numeric/Table' : 'Body/Small');
    const t = await T(cell, vals[i], style, i === 1 ? 'accent/text' : i === 2 ? 'text/primary' : 'text/secondary', { name: label, tnum: a === 'R' || i === 7, fill: i === 2 || i === 3 });
    if (i === 2 || i === 3) { try { t.textTruncation = 'ENDING'; t.maxLines = 1; } catch (e) { } }
  }
  rows.push(c);
}
const rowSet = makeSet(rows, 'Table row · Orders', tableSec, { w: 1200, gap: 0, desc: 'Click row → Order detail. Override cell text per record; switch State for hover/selection demos.' });

// ---- Overlay parts ----
const ovSec = await libSection(lib, 'Overlay parts & patterns', 'Dialogs = Modal header + content + Modal footer inside an xl-radius surface with Elevation/4 over a 48% scrim. Primary action sits right; destructive dialogs use the Danger button and name the object being destroyed.');
const mh = C('Modal header', 'HORIZONTAL', { pad: [20, 20, 16, 24], gap: 16, align: 'MIN', w: 560, fill: 'bg/surface' });
ovSec.appendChild(mh);
const mht = AL(mh, 'VERTICAL', { name: 'Titles', gap: 4 }); mht.layoutSizingHorizontal = 'FILL';
await T(mht, 'Assign vehicle', 'Heading/Section', 'text/primary', { name: 'Title' });
await T(mht, 'ORD-24819 · Kaveri Builders · 31.85 MT balance', 'Body/Small', 'text/secondary', { name: 'Description', fill: true });
const mclose = inst('Icon button|State=Default', mh); setP(mclose, { Icon: LIB['Icon/x'].id }); mclose.name = 'Close';
mh.description = 'Dialog / drawer header. Close (Esc) returns focus to the trigger.';
const mf = C('Modal footer', 'HORIZONTAL', { pad: [16, 24, 16, 24], gap: 8, align: 'CENTER', justify: 'MAX', w: 560, fill: 'bg/surface-subtle', strokeSides: [1, 0, 0, 0], stroke: 'border/default' });
mf.primaryAxisSizingMode = 'FIXED';
ovSec.appendChild(mf);
const mfl = AL(mf, 'HORIZONTAL', { name: 'Meta', gap: 6, align: 'CENTER' }); mfl.layoutSizingHorizontal = 'FILL';
await T(mfl, 'Changes are logged to Activity', 'Caption/Default', 'text/tertiary', { name: 'Footnote' });
const cancel = inst('Button|Variant=Secondary, State=Default, Size=Medium', mf); setP(cancel, { Label: 'Cancel', 'Show icon': false }); cancel.name = 'Secondary action';
const conf = inst('Button|Variant=Primary, State=Default, Size=Medium', mf); setP(conf, { Label: 'Assign vehicle', 'Show icon': false }); conf.name = 'Primary action';
mf.description = 'Dialog footer: optional footnote left, Secondary then Primary right. Swap Primary → Danger for destructive confirmations.';
// Empty state
const es = C('Empty state', 'VERTICAL', { pad: [48, 32, 48, 32], gap: 16, align: 'CENTER', w: 560, fill: 'bg/surface' });
ovSec.appendChild(es);
const eic = AL(es, 'HORIZONTAL', { name: 'Icon well', w: 48, h: 48, radius: 24, fill: 'bg/surface-muted', align: 'CENTER', justify: 'CENTER' });
icon(eic, 'search', 22, 'text/tertiary');
const est = AL(es, 'VERTICAL', { name: 'Text', gap: 4, align: 'CENTER' });
await T(est, 'No orders match these filters', 'Heading/Section', 'text/primary', { name: 'Title', align: 'CENTER' });
await T(est, 'Try widening the date range or clearing “Stage: Overdue”. Filters are saved per user.', 'Body/Small', 'text/secondary', { name: 'Description', w: 380, align: 'CENTER' });
const esb = inst('Button|Variant=Secondary, State=Default, Size=Medium', es); setP(esb, { Label: 'Clear filters', 'Show icon': false }); esb.name = 'Action';
es.description = 'Empty, no-results and first-run states. Never show an empty chart axis without this message.';
// Filter chip + date range trigger
const chips = [];
for (const st of ['Default', 'Applied', 'Hover']) {
  const c = C('State=' + st, 'HORIZONTAL', { pad: [5, 8, 5, 10], gap: 6, radius: 6, align: 'CENTER', fill: st === 'Applied' ? 'accent/subtle' : st === 'Hover' ? 'bg/hover' : 'bg/surface', stroke: st === 'Applied' ? 'accent/border' : 'border/default' });
  if (st !== 'Applied') icon(c, 'plus', 14, 'text/tertiary');
  await T(c, st === 'Applied' ? 'Stage: Overdue' : 'Customer', 'Button/Small', st === 'Applied' ? 'accent/text' : 'text/secondary', { name: 'Label' });
  if (st === 'Applied') { const x = icon(c, 'x', 14, 'accent/text'); x.name = 'Remove'; }
  chips.push(c);
}
const chipSet = makeSet(chips, 'Filter chip', ovSec, { w: 700 });
bindProp(chipSet, 'Label', 'TEXT', 'Filter', 'Label', 'characters');
const dr = C('Date range trigger', 'HORIZONTAL', { pad: [8, 10, 8, 12], gap: 8, radius: 6, align: 'CENTER', fill: 'bg/surface', stroke: 'border/default', h: 36 });
dr.counterAxisSizingMode = 'FIXED';
ovSec.appendChild(dr);
icon(dr, 'calendar', 16, 'text/secondary');
await T(dr, '04 – 10 Oct 2026', 'Button/Small', 'text/primary', { name: 'Range', tnum: true });
await T(dr, 'vs. prior week', 'Caption/Default', 'text/tertiary', { name: 'Comparison' });
icon(dr, 'chevron-down', 16, 'text/tertiary');
dr.description = 'Opens the Date range popover (presets + calendar + comparison selector). Changing it updates every KPI and chart on the page.';

await lib.screenshot({ scale: 0.3 });
return { lib: lib.id, h: Math.round(lib.height), sidebar: sb.id, topbar: tb.id, errors: ERR.slice(0, 40), errCount: ERR.length };
