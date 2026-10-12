// ---------- 5. Cover & Foundations (page 0) ----------
const page = figma.currentPage;
for (const n of page.children.slice()) if (n.name === 'Cover' || n.name === 'Foundations') n.remove();
const resolveHex = tok => { const row = SEM.find(r => r[0] === tok); return row ? PRIM[row[1]] : PRIM[tok]; };
const lum = h => { const c = _hex(h); const f = x => x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
const contrast = (a, b) => { const A = lum(a), B = lum(b); return (Math.max(A, B) + 0.05) / (Math.min(A, B) + 0.05); };

async function logo(parent, size, onDark) {
  const m = figma.createFrame(); m.name = 'Logo/Mark'; m.resize(size, size); m.cornerRadius = size * 0.25; m.fills = [P('accent/default')]; m.clipsContent = true;
  const u = size / 32;
  const b1 = R(m, 16 * u, 4 * u, 'text/inverse', { radius: 1 * u, x: 8 * u, y: 9 * u });
  const b2 = R(m, 12 * u, 4 * u, 'text/inverse', { radius: 1 * u, x: 8 * u, y: 15 * u, opacity: 0.8 });
  const b3 = R(m, 8 * u, 4 * u, 'text/inverse', { radius: 1 * u, x: 8 * u, y: 21 * u, opacity: 0.6 });
  if (parent) parent.appendChild(m);
  return m;
}

// Cover
const cover = figma.createFrame(); cover.name = 'Cover'; cover.resize(1600, 960); cover.fills = [P('nav/bg')]; page.appendChild(cover); place(cover, 0, 0);
cover.layoutMode = 'VERTICAL'; cover.paddingTop = 96; cover.paddingLeft = 112; cover.paddingRight = 112; cover.paddingBottom = 80; cover.itemSpacing = 0; cover.primaryAxisAlignItems = 'SPACE_BETWEEN'; cover.primaryAxisSizingMode = 'FIXED'; cover.counterAxisSizingMode = 'FIXED';
const cTop = AL(cover, 'VERTICAL', { gap: 40, name: 'Masthead' });
const brand = AL(cTop, 'HORIZONTAL', { gap: 12, align: 'CENTER', name: 'Brand' });
await logo(brand, 36);
await T(brand, 'Foundry', 'Heading/Section', 'nav/text-active');
const titleBlock = AL(cTop, 'VERTICAL', { gap: 16, name: 'Title' });
await T(titleBlock, 'Product design system · v2.0', 'Label/Overline', 'nav/indicator');
const ct = await T(titleBlock, 'Enterprise Operations Console', 'Display/Page title', 'nav/text-active', { w: 900 }); ct.fontSize = 56; ct.lineHeight = { value: 64, unit: 'PIXELS' }; ct.letterSpacing = { value: -1.6, unit: 'PIXELS' };
const cs = await T(titleBlock, 'Orders, weighbridge, yard and dispatch for steel plants — redesigned as a precise, restrained analytics console. Light theme, tokenised, responsive and prototype-connected.', 'Body/Default', 'nav/text', { w: 720 }); cs.fontSize = 18; cs.lineHeight = { value: 28, unit: 'PIXELS' };
const idx = AL(cover, 'HORIZONTAL', { gap: 0, name: 'Index', w: 1376, align: 'MIN' });
const pages = [['00', 'Foundations & Components', 'Variables, type, elevation, data-viz rules, component library with variants & states'], ['01', 'Desktop screens', 'Sign in, dashboard, orders, order detail, yard, customers, reports, activity, settings, users, integrations'], ['02', 'Overlays, Responsive & Flows', 'Modals, drawers, menus, toasts, empty/loading/error states, tablet 834 & mobile 390 layouts, interaction map']];
for (const [no, name, d] of pages) {
  const col = AL(idx, 'VERTICAL', { gap: 6, pad: [20, 20, 0, 0], name: 'Index/' + no, strokeSides: [1, 0, 0, 0], stroke: 'nav/bg-active' });
  col.layoutSizingHorizontal = 'FILL';
  await T(col, no, 'Numeric/Medium', 'nav/indicator', { tnum: true });
  await T(col, name, 'Body/Strong', 'nav/text-active', { w: 420 });
  await T(col, d, 'Caption/Default', 'nav/text-muted', { w: 420 });
}
const foot = AL(cover, 'HORIZONTAL', { name: 'Footer', w: 1376, justify: 'SPACE_BETWEEN' });
await T(foot, 'Prepared Oct 2026 · Ready for developer handoff', 'Caption/Default', 'nav/text-muted');
await T(foot, 'All figures, names and organisations shown are illustrative sample data — not live data.', 'Caption/Default', 'nav/text-muted');

// Foundations
const F = AL(page, 'VERTICAL', { name: 'Foundations', gap: 72, pad: [80, 96, 96, 96], fill: 'bg/canvas', w: 1600 });
place(F, 0, 1060);
async function sectionHead(parent, over, title, desc) {
  const h = AL(parent, 'VERTICAL', { gap: 8, name: 'Section header' }); h.layoutSizingHorizontal = 'FILL';
  await T(h, over, 'Label/Overline', 'accent/text');
  await T(h, title, 'Display/Page title', 'text/primary');
  if (desc) await T(h, desc, 'Body/Default', 'text/secondary', { w: 820 });
  return h;
}
const card = (parent, name, o) => { const c = AL(parent, 'VERTICAL', Object.assign({ name, fill: 'bg/surface', stroke: 'border/default', radius: 8, pad: 24, gap: 16 }, o || {})); return c; };
await sectionHead(F, 'Foundations', 'A quiet interface where the numbers do the talking', 'Neutral surfaces, one disciplined accent, and semantic colour reserved for business meaning. Every value below is a Figma variable or style — nothing on the product pages is hard-coded.');

// Colour
const colSec = AL(F, 'VERTICAL', { gap: 24, name: 'Colour' }); colSec.layoutSizingHorizontal = 'FILL';
await sectionHead(colSec, 'Colour', 'Semantic colour tokens', 'Primitives (hidden from publishing) → Semantic aliases. Contrast is measured against bg/surface (#FFFFFF). Text tokens meet WCAG 2.2 AA (4.5:1); disabled text is exempt by definition.');
const groups = [['Surfaces', ['bg/canvas', 'bg/surface', 'bg/surface-subtle', 'bg/surface-muted', 'bg/hover', 'bg/selected', 'bg/inverse']], ['Text & border', ['text/primary', 'text/secondary', 'text/tertiary', 'text/disabled', 'border/default', 'border/subtle', 'border/strong']], ['Accent', ['accent/default', 'accent/hover', 'accent/pressed', 'accent/subtle', 'accent/border', 'accent/text', 'border/focus']], ['Status', ['status/positive/fg', 'status/negative/fg', 'status/warning/fg', 'status/info/fg', 'status/neutral/fg', 'status/critical/fg', 'status/critical/solid']], ['Status tints', ['status/positive/bg', 'status/negative/bg', 'status/warning/bg', 'status/info/bg', 'status/neutral/bg', 'status/critical/bg', 'status/positive/border']], ['Data visualisation', ['chart/series-1', 'chart/series-2', 'chart/series-3', 'chart/series-4', 'chart/comparison', 'chart/target', 'chart/grid']], ['Navigation', ['nav/bg', 'nav/bg-hover', 'nav/bg-active', 'nav/text', 'nav/text-muted', 'nav/text-active', 'nav/indicator']]];
for (const [g, toks] of groups) {
  const row = AL(colSec, 'VERTICAL', { gap: 12, name: 'Group/' + g }); row.layoutSizingHorizontal = 'FILL';
  await T(row, g, 'Heading/Card', 'text/primary');
  const sw = AL(row, 'HORIZONTAL', { gap: 16, name: 'Swatches' }); sw.layoutSizingHorizontal = 'FILL';
  for (const tok of toks) {
    const c = AL(sw, 'VERTICAL', { name: tok, fill: 'bg/surface', stroke: 'border/default', radius: 8, gap: 0, clip: true }); c.layoutSizingHorizontal = 'FILL';
    const chip = R(c, 10, 72, tok, { name: 'Swatch' }); chip.layoutSizingHorizontal = 'FILL';
    const meta = AL(c, 'VERTICAL', { gap: 2, pad: [10, 12, 12, 12], name: 'Meta' }); meta.layoutSizingHorizontal = 'FILL';
    await T(meta, tok, 'Label/Default', 'text/primary', { fill: true });
    const hx = resolveHex(tok);
    const cr = contrast(hx, '#FFFFFF');
    const isText = tok.startsWith('text/') || tok.endsWith('/fg') || tok.startsWith('accent/default') || tok.startsWith('chart/series');
    await T(meta, hx + (isText ? '  ·  ' + cr.toFixed(1) + ':1' : ''), 'Caption/Default', 'text/tertiary', { fill: true, tnum: true });
  }
}

// Semantic rules
const ruleSec = AL(F, 'VERTICAL', { gap: 24, name: 'Semantic meaning' }); ruleSec.layoutSizingHorizontal = 'FILL';
await sectionHead(ruleSec, 'Meaning over direction', 'Colour encodes business outcome, never arrow direction', 'Each metric declares its polarity (higher-is-better, lower-is-better, or neutral). Deltas always pair colour with an arrow, a sign and a label, so meaning survives colour-blindness and greyscale printing.');
const rules = AL(ruleSec, 'VERTICAL', { name: 'Rules table', fill: 'bg/surface', stroke: 'border/default', radius: 8, clip: true }); rules.layoutSizingHorizontal = 'FILL';
const RULES = [['Metric', 'Polarity', 'Change', 'Rendered as', 'Why', 'head'], ['Dispatched tonnage', 'Higher is better', '▲ 8.4%', 'Positive', 'More steel shipped against plan', 'positive'], ['Weighbridge variance > tolerance', 'Lower is better', '▲ 0.6 pp', 'Negative', 'An increase is a quality problem', 'negative'], ['Freight cost per MT', 'Lower is better', '▼ 3.1%', 'Positive', 'Falling cost is favourable', 'positive'], ['Average yard dwell', 'Lower is better', '0.0%', 'Neutral', 'Unchanged values carry no judgement', 'neutral'], ['Gate scans (Gate 3)', 'Higher is better', '—', 'No data', 'Missing data is never shown as 0% change', 'neutral'], ['Open orders', 'Neutral', '▲ 4', 'Neutral', 'Volume is context, not performance', 'neutral']];
for (const r of RULES) {
  const head = r[5] === 'head';
  const row = AL(rules, 'HORIZONTAL', { name: head ? 'Header' : 'Row/' + r[0], pad: [head ? 10 : 14, 24, head ? 10 : 14, 24], gap: 24, align: 'CENTER', fill: head ? 'bg/surface-subtle' : 'bg/surface', strokeSides: [0, 0, 1, 0], stroke: 'border/subtle' }); row.layoutSizingHorizontal = 'FILL';
  const widths = [300, 180, 140, 160];
  for (let i = 0; i < 5; i++) {
    if (head) { const t = await T(row, r[i], 'Label/Overline', 'text/tertiary', i < 4 ? { w: widths[i] } : {}); if (i === 4) { t.textAutoResize = 'HEIGHT'; t.layoutSizingHorizontal = 'FILL'; } continue; }
    if (i === 2 || i === 3) {
      const tone = r[5];
      const wrap = AL(row, 'HORIZONTAL', { name: 'Cell', w: widths[i] });
      const b = AL(wrap, 'HORIZONTAL', { name: 'Badge', pad: [2, 8, 2, 8], radius: 4, fill: 'status/' + tone + '/bg', gap: 4, align: 'CENTER' });
      await T(b, i === 2 ? r[2] : r[3], 'Label/Default', 'status/' + tone + '/fg', { tnum: true });
      continue;
    }
    const t = await T(row, r[i], i === 0 ? 'Body/Small strong' : 'Body/Small', i === 0 ? 'text/primary' : 'text/secondary', i < 4 ? { w: widths[i] } : {});
    if (i === 4) { t.textAutoResize = 'HEIGHT'; t.layoutSizingHorizontal = 'FILL'; }
  }
}

// Typography
const typeSec = AL(F, 'VERTICAL', { gap: 24, name: 'Typography' }); typeSec.layoutSizingHorizontal = 'FILL';
await sectionHead(typeSec, 'Typography', 'Inter, with tabular figures for every number', 'Inter was chosen over Geist and IBM Plex Sans for its tall x-height at 12–14 px, unambiguous 1/l/I and 0/O, complete weight range and tabular-figure support — essential when tonnages and rupee values sit in aligned columns. Weights are capped at Semi Bold; hierarchy comes from size, colour and space.');
const typeCard = card(typeSec, 'Type ramp', { gap: 0, pad: 0, clip: true }); typeCard.layoutSizingHorizontal = 'FILL';
const SAMPLES = { 'Display/Page title': 'Dispatch overview', 'Heading/Section': 'Orders awaiting vehicles', 'Heading/Card': 'Dispatched today', 'Body/Default': 'Every order raised at Nagpur Works, and how far it has travelled.', 'Body/Strong': 'Vardhan Infra Projects', 'Body/Small': 'TMT Fe 550D · 16 mm · Bay 3', 'Body/Small strong': 'ORD-24819', 'Label/Default': 'Organisation name', 'Label/Overline': 'Recent activity', 'Caption/Default': 'Updated 17:58 IST · Illustrative data', 'Numeric/KPI': '1,846.20 MT', 'Numeric/Large': '₹ 70,08,000', 'Numeric/Medium': '412.60 MT', 'Numeric/Table': '120.00   88.15   31.85', 'Chart/Axis': '0   400   800   1,200', 'Button/Default': 'Create order', 'Button/Small': 'Export CSV' };
for (const [name, style, size, lh, ls] of TYPE) {
  const row = AL(typeCard, 'HORIZONTAL', { name: name, pad: [16, 24, 16, 24], gap: 24, align: 'CENTER', strokeSides: [0, 0, 1, 0], stroke: 'border/subtle' }); row.layoutSizingHorizontal = 'FILL';
  await T(row, name, 'Label/Default', 'text/secondary', { w: 200 });
  const s = await T(row, SAMPLES[name] || name, name, 'text/primary', { tnum: name.startsWith('Numeric') || name.startsWith('Chart') }); s.textAutoResize = 'HEIGHT'; s.layoutSizingHorizontal = 'FILL';
  await T(row, style + ' · ' + size + '/' + lh + ' · ' + (ls > 0 ? '+' : '') + ls + 'px', 'Caption/Default', 'text/tertiary', { w: 220, align: 'RIGHT', tnum: true });
}

// Spacing, radius, elevation
const sre = AL(F, 'VERTICAL', { gap: 24, name: 'Spacing, radius & elevation' }); sre.layoutSizingHorizontal = 'FILL';
await sectionHead(sre, 'Space & depth', 'A 4-point grid, modest radii, and shadows that whisper', 'Cards use an 8 px radius and a hairline border; elevation is reserved for things that float above the page. Desktop uses a 12-column grid, 24 px gutters and 32 px page margins.');
const sreRow = AL(sre, 'HORIZONTAL', { gap: 24, name: 'Row', align: 'MIN' }); sreRow.layoutSizingHorizontal = 'FILL';
const spC = card(sreRow, 'Spacing'); spC.layoutSizingHorizontal = 'FILL';
await T(spC, 'Spacing', 'Heading/Card');
for (const s of [2, 4, 8, 12, 16, 20, 24, 32, 40, 48]) { const r = AL(spC, 'HORIZONTAL', { gap: 12, align: 'CENTER', name: 'space/' + s }); await T(r, 'space/' + s, 'Caption/Default', 'text/secondary', { w: 72, tnum: true }); R(r, s * 3, 8, 'accent/border', { radius: 2 }); }
const raC = card(sreRow, 'Radius'); raC.layoutSizingHorizontal = 'FILL';
await T(raC, 'Radius', 'Heading/Card');
const raRow = AL(raC, 'HORIZONTAL', { gap: 16, name: 'Radii' });
for (const [n, v] of [['sm · 4', 4], ['md · 6', 6], ['lg · 8', 8], ['xl · 12', 12]]) { const c = AL(raRow, 'VERTICAL', { gap: 8, name: n }); const b = R(c, 64, 64, 'bg/surface-muted', { radius: v }); b.strokes = [P('border/strong')]; await T(c, n, 'Caption/Default', 'text/secondary', { tnum: true }); }
await T(raC, 'sm — badges, checkboxes · md — buttons, inputs · lg — cards, menus · xl — dialogs & drawers. Pills (full) only for avatars and toggles.', 'Caption/Default', 'text/tertiary', { w: 300 });
const elC = card(sreRow, 'Elevation', { fill: 'bg/canvas' }); elC.layoutSizingHorizontal = 'FILL';
await T(elC, 'Elevation', 'Heading/Card');
const elRow = AL(elC, 'VERTICAL', { gap: 16, name: 'Levels' }); elRow.layoutSizingHorizontal = 'FILL';
for (const n of ['Elevation/1 · Card', 'Elevation/2 · Raised', 'Elevation/3 · Popover', 'Elevation/4 · Modal', 'Focus/Ring']) { const b = AL(elRow, 'HORIZONTAL', { name: n, fill: 'bg/surface', radius: 8, pad: [14, 16, 14, 16], stroke: n.startsWith('Focus') ? 'border/focus' : 'border/default' }); b.layoutSizingHorizontal = 'FILL'; await fx(b, n); await T(b, n, 'Label/Default', 'text/secondary'); }

// Data viz rules
const dv = AL(F, 'VERTICAL', { gap: 24, name: 'Data visualisation' }); dv.layoutSizingHorizontal = 'FILL';
await sectionHead(dv, 'Data visualisation', 'Charts that can be trusted at a glance', null);
const dvRow = AL(dv, 'HORIZONTAL', { gap: 24, name: 'Rules', align: 'MIN' }); dvRow.layoutSizingHorizontal = 'FILL';
const DV = [['One primary colour', 'The measured series is always chart/series-1. A rising line is not green and a falling line is not red — performance colour appears only in labelled deltas against a declared baseline.'], ['Comparison is quiet', 'Prior period and benchmarks use chart/comparison as a 1.5 px dashed line. Targets and thresholds use chart/target, dashed, with an inline label.'], ['Honest axes', 'Bar charts start at zero. Line charts may zoom but always show the axis range. Gridlines are horizontal only, 1 px, chart/grid. Units live in the axis title, not every tick.'], ['Gaps stay gaps', 'Missing intervals break the line and are annotated "No data" — never interpolated, never drawn as zero.']];
for (const [h, b] of DV) { const c = card(dvRow, h); c.layoutSizingHorizontal = 'FILL'; await T(c, h, 'Heading/Card'); const t = await T(c, b, 'Body/Small', 'text/secondary', { fill: true }); }

await figma.viewport.scrollAndZoomIntoView([cover]);
return { pageIds, textStyles: Object.keys(textStyleIds).length, cover: cover.id, foundations: F.id, foundationsH: Math.round(F.height), errors: ERR.slice(0, 30), errCount: ERR.length };
