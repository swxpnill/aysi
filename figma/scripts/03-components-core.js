// ---------- Components A: icons + core controls ----------
const page = figma.currentPage;
for (const n of page.children.slice()) if (n.name === 'Component library') n.remove();
const lib = AL(page, 'VERTICAL', { name: 'Component library', gap: 56, pad: [80, 96, 96, 96], fill: 'bg/canvas', w: 1600 });
place(lib, 1700, 0);
const hdr = AL(lib, 'VERTICAL', { gap: 8, name: 'Header' }); hdr.layoutSizingHorizontal = 'FILL';
await T(hdr, 'Components', 'Label/Overline', 'accent/text');
await T(hdr, 'Component library', 'Display/Page title');
await T(hdr, 'Every control is a variant set with explicit states (default, hover, focus, active/selected, disabled, loading, error) and exposed properties for labels, icons and toggles. All fills, strokes and text use semantic variables.', 'Body/Default', 'text/secondary', { w: 900 });

// ---- Icons ----
const S = (inner) => '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#525C6E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
const ICONS = {
  'dashboard': '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  'package': '<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
  'truck': '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  'scale': '<path d="M12 3v18"/><path d="M5 7h14"/><path d="M5 7l-3 7a3 3 0 0 0 6 0z"/><path d="M19 7l-3 7a3 3 0 0 0 6 0z"/><path d="M8 21h8"/>',
  'users': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  'building': '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
  'chart': '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  'activity': '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  'bell': '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  'settings': '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  'search': '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  'plus': '<path d="M5 12h14M12 5v14"/>',
  'chevron-down': '<path d="M6 9l6 6 6-6"/>',
  'chevron-right': '<path d="M9 18l6-6-6-6"/>',
  'chevron-left': '<path d="M15 18l-6-6 6-6"/>',
  'arrow-up-right': '<path d="M7 7h10v10M7 17L17 7"/>',
  'calendar': '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  'filter': '<path d="M3 6h18M7 12h10M10 18h4"/>',
  'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
  'upload': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  'more': '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  'x': '<path d="M18 6L6 18M6 6l12 12"/>',
  'check': '<path d="M20 6L9 17l-5-5"/>',
  'alert': '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/>',
  'info': '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  'check-circle': '<circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/>',
  'x-circle': '<circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>',
  'clock': '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  'pin': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  'plug': '<path d="M12 22v-5"/><path d="M9 8V2M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8z"/>',
  'shield': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  'logout': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>',
  'menu': '<path d="M4 6h16M4 12h16M4 18h16"/>',
  'trash': '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  'pencil': '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/>',
  'mail': '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 6L2 7"/>',
  'lock': '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  'eye': '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  'refresh': '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  'external': '<path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  'file': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
  'message': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  'help': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/>',
  'sliders': '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  'layers': '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>'
};
const iconSec = await libSection(lib, 'Icons · 20 px, 1.5 px stroke', 'One outline family (Lucide geometry) at a 24-unit grid rendered at 20 px. Stroke colour is overridden per instance with text or status tokens; instances scale to 16 px inside dense controls.');
const iconGrid = AL(iconSec, 'HORIZONTAL', { name: 'Icon grid', gap: 12, pad: 24, fill: 'bg/surface', stroke: 'border/default', radius: 8 }); iconGrid.layoutSizingHorizontal = 'FILL'; iconGrid.layoutWrap = 'WRAP'; iconGrid.counterAxisSpacing = 12;
for (const [name, inner] of Object.entries(ICONS)) {
  await safe('icon ' + name, async () => {
    const svg = figma.createNodeFromSvg(S(inner));
    const comp = figma.createComponent(); comp.name = 'Icon/' + name; comp.resize(20, 20); comp.fills = []; comp.clipsContent = false;
    for (const ch of svg.children.slice()) comp.appendChild(ch);
    svg.remove();
    for (const v of comp.findAllWithCriteria({ types: ['VECTOR', 'ELLIPSE', 'RECTANGLE', 'LINE', 'POLYGON', 'BOOLEAN_OPERATION', 'GROUP'] })) { try { v.constraints = { horizontal: 'SCALE', vertical: 'SCALE' }; } catch (e) { } }
    recolor(comp, 'text/secondary');
    comp.description = 'Outline icon · 20 px · override stroke colour per use';
    const cell = AL(iconGrid, 'VERTICAL', { name: 'Cell/' + name, gap: 8, pad: [12, 8, 10, 8], align: 'CENTER', w: 96 });
    cell.appendChild(comp);
    await T(cell, name, 'Caption/Default', 'text/tertiary');
    LIB['Icon/' + name] = comp;
  });
}

// ---- Buttons ----
const btnSec = await libSection(lib, 'Button', 'Variant × State × Size. Properties: Label (text), Show icon (boolean), Icon (instance swap). Loading keeps width stable and disables interaction. One primary button per view.');
const BV = {
  Primary: { Default: ['accent/default', null, 'text/inverse'], Hover: ['accent/hover', null, 'text/inverse'], Focus: ['accent/default', null, 'text/inverse', 'Focus/Ring'], Disabled: ['bg/surface-muted', null, 'text/disabled'], Loading: ['accent/hover', null, 'text/inverse'] },
  Secondary: { Default: ['bg/surface', 'border/default', 'text/primary'], Hover: ['bg/hover', 'border/strong', 'text/primary'], Focus: ['bg/surface', 'border/focus', 'text/primary', 'Focus/Ring'], Disabled: ['bg/surface-subtle', 'border/subtle', 'text/disabled'], Loading: ['bg/surface', 'border/default', 'text/secondary'] },
  Ghost: { Default: [null, null, 'text/secondary'], Hover: ['bg/surface-muted', null, 'text/primary'], Focus: [null, 'border/focus', 'text/primary', 'Focus/Ring'], Disabled: [null, null, 'text/disabled'], Loading: [null, null, 'text/secondary'] },
  Danger: { Default: ['status/critical/solid', null, 'text/inverse'], Hover: ['status/critical/fg', null, 'text/inverse'], Focus: ['status/critical/solid', null, 'text/inverse', 'Focus/Ring · Danger'], Disabled: ['bg/surface-muted', null, 'text/disabled'], Loading: ['status/critical/fg', null, 'text/inverse'] }
};
const btns = [];
for (const size of ['Medium', 'Small']) for (const [variant, states] of Object.entries(BV)) for (const [state, [bg, bd, fg, ring]] of Object.entries(states)) {
  await safe('btn ' + variant + state, async () => {
    const md = size === 'Medium';
    const c = C('Variant=' + variant + ', State=' + state + ', Size=' + size, 'HORIZONTAL', { pad: md ? [8, 14, 8, 14] : [6, 12, 6, 12], gap: md ? 8 : 6, radius: 6, fill: bg, stroke: bd, align: 'CENTER', justify: 'CENTER' });
    c.resize(10, md ? 36 : 32); c.primaryAxisSizingMode = 'AUTO'; c.counterAxisSizingMode = 'FIXED';
    if (ring) await fx(c, ring);
    if (state === 'Loading') {
      const sp = figma.createEllipse(); sp.name = 'Spinner'; sp.resize(14, 14); sp.arcData = { startingAngle: 0, endingAngle: 4.6, innerRadius: 0.78 }; sp.fills = [P(fg)]; c.appendChild(sp);
    }
    if (state !== 'Loading') { const ic = icon(c, 'plus', 16, fg); ic.name = 'Icon'; }
    await T(c, variant === 'Danger' ? 'Delete' : variant === 'Primary' ? 'Create order' : variant === 'Secondary' ? 'Export' : 'Cancel', md ? 'Button/Default' : 'Button/Small', fg, { name: 'Label' });
    btns.push(c);
  });
}
const btnSet = makeSet(btns, 'Button', btnSec, { w: 1408, desc: 'Buttons. Primary for the single main action, Secondary for supporting actions, Ghost for low-emphasis/tertiary, Danger for destructive confirmation only.' });
bindProp(btnSet, 'Label', 'TEXT', 'Button', 'Label', 'characters');
bindProp(btnSet, 'Show icon', 'BOOLEAN', true, 'Icon', 'visible');
bindProp(btnSet, 'Icon', 'INSTANCE_SWAP', LIB['Icon/plus'].id, 'Icon', 'mainComponent');

// Icon button
const ibs = [];
for (const [state, bg, bd, fg, ring] of [['Default', null, null, 'text/secondary'], ['Hover', 'bg/surface-muted', null, 'text/primary'], ['Focus', null, 'border/focus', 'text/primary', 'Focus/Ring'], ['Active', 'accent/subtle', null, 'accent/text'], ['Disabled', null, null, 'text/disabled']]) {
  const c = C('State=' + state, 'HORIZONTAL', { radius: 6, fill: bg, stroke: bd, align: 'CENTER', justify: 'CENTER' });
  c.resize(36, 36); c.primaryAxisSizingMode = 'FIXED'; c.counterAxisSizingMode = 'FIXED';
  if (ring) await fx(c, ring);
  const ic = icon(c, 'more', 20, fg); ic.name = 'Icon';
  ibs.push(c);
}
const ibSet = makeSet(ibs, 'Icon button', btnSec, { w: 600, desc: '36 × 36 hit area (44 × 44 on touch layouts). Always paired with a tooltip / aria-label.' });
bindProp(ibSet, 'Icon', 'INSTANCE_SWAP', LIB['Icon/more'].id, 'Icon', 'mainComponent');

// ---- Form fields ----
const formSec = await libSection(lib, 'Form fields', 'Label above, helper or error below. Error states add an icon and text — never colour alone. Focus uses the border/focus token plus the Focus/Ring effect.');
const fieldStates = { Default: ['bg/surface', 'border/default', 'text/tertiary', 'Enter organisation name', null], Hover: ['bg/surface', 'border/strong', 'text/tertiary', 'Enter organisation name', null], Focus: ['bg/surface', 'border/focus', 'text/primary', 'Vardhan Ispat', 'Focus/Ring'], Filled: ['bg/surface', 'border/default', 'text/primary', 'Vardhan Ispat Ltd.', null], Error: ['bg/surface', 'status/negative/fg', 'text/primary', '27AABCV9921F1Z', null], Disabled: ['bg/surface-muted', 'border/subtle', 'text/disabled', 'vardhan-ispat', null] };
const fields = [];
for (const [state, [bg, bd, fg, val, ring]] of Object.entries(fieldStates)) {
  const c = C('State=' + state, 'VERTICAL', { gap: 6, w: 320 });
  await T(c, state === 'Error' ? 'GSTIN' : 'Organisation name', 'Label/Default', state === 'Disabled' ? 'text/disabled' : 'text/secondary', { name: 'Label' });
  const box = AL(c, 'HORIZONTAL', { name: 'Field', pad: [8, 12, 8, 12], gap: 8, radius: 6, fill: bg, stroke: bd, align: 'CENTER', h: 36 }); box.layoutSizingHorizontal = 'FILL';
  if (ring) await fx(box, ring);
  const li = icon(box, 'search', 16, 'text/tertiary'); li.name = 'Leading icon'; li.visible = false;
  const v = await T(box, val, 'Body/Default', fg, { name: 'Value' }); v.layoutSizingHorizontal = 'FILL';
  if (state === 'Error') icon(box, 'alert', 16, 'status/negative/fg');
  const help = AL(c, 'HORIZONTAL', { name: 'Helper', gap: 6, align: 'CENTER' });
  await T(help, state === 'Error' ? 'GSTIN must be 15 characters — 1 missing.' : 'Shown on invoices and dispatch notes.', 'Caption/Default', state === 'Error' ? 'status/negative/fg' : 'text/tertiary', { name: 'Helper text' });
  fields.push(c);
}
const fieldSet = makeSet(fields, 'Text field', formSec, { w: 1408, desc: 'Single-line input. Value layer shows placeholder (text/tertiary) or entered value (text/primary).' });
bindProp(fieldSet, 'Label', 'TEXT', 'Label', 'Label', 'characters');
bindProp(fieldSet, 'Value', 'TEXT', 'Value', 'Value', 'characters');
bindProp(fieldSet, 'Helper text', 'TEXT', 'Helper', 'Helper text', 'characters');
bindProp(fieldSet, 'Show helper', 'BOOLEAN', true, 'Helper', 'visible');
bindProp(fieldSet, 'Show leading icon', 'BOOLEAN', false, 'Leading icon', 'visible');

// Select
const sels = [];
for (const [state, bg, bd, fg, ring] of [['Default', 'bg/surface', 'border/default', 'text/primary'], ['Hover', 'bg/surface', 'border/strong', 'text/primary'], ['Open', 'bg/surface', 'border/focus', 'text/primary', 'Focus/Ring'], ['Disabled', 'bg/surface-muted', 'border/subtle', 'text/disabled']]) {
  const c = C('State=' + state, 'HORIZONTAL', { pad: [8, 10, 8, 12], gap: 8, radius: 6, fill: bg, stroke: bd, align: 'CENTER', w: 240, h: 36 });
  if (ring) await fx(c, ring);
  const v = await T(c, 'Metric tonnes (MT)', 'Body/Default', fg, { name: 'Value' }); v.layoutSizingHorizontal = 'FILL';
  const ch = icon(c, state === 'Open' ? 'chevron-down' : 'chevron-down', 16, state === 'Disabled' ? 'text/disabled' : 'text/tertiary'); if (state === 'Open') ch.rotation = 180;
  sels.push(c);
}
const selSet = makeSet(sels, 'Select', formSec, { w: 1100, desc: 'Dropdown trigger. Opens Menu (Elevation/3) anchored 4 px below, matching trigger width.' });
bindProp(selSet, 'Value', 'TEXT', 'Select…', 'Value', 'characters');

// Checkbox, Toggle, Radio
const cbs = [];
for (const st of ['Unchecked', 'Checked', 'Indeterminate', 'Disabled']) {
  const c = C('State=' + st, 'HORIZONTAL', { gap: 8, align: 'CENTER' });
  const box = AL(c, 'HORIZONTAL', { name: 'Box', w: 16, h: 16, radius: 4, align: 'CENTER', justify: 'CENTER', fill: st === 'Checked' || st === 'Indeterminate' ? 'accent/default' : st === 'Disabled' ? 'bg/surface-muted' : 'bg/surface', stroke: st === 'Unchecked' ? 'border/strong' : st === 'Disabled' ? 'border/default' : null });
  if (st === 'Checked') icon(box, 'check', 12, 'text/inverse');
  if (st === 'Indeterminate') R(box, 8, 2, 'text/inverse', { radius: 1 });
  await T(c, 'Keep me signed in', 'Body/Default', st === 'Disabled' ? 'text/disabled' : 'text/primary', { name: 'Label' });
  cbs.push(c);
}
const cbSet = makeSet(cbs, 'Checkbox', formSec, { w: 800 });
bindProp(cbSet, 'Label', 'TEXT', 'Label', 'Label', 'characters');
bindProp(cbSet, 'Show label', 'BOOLEAN', true, 'Label', 'visible');
const tgs = [];
for (const st of ['On', 'Off', 'Disabled']) {
  const c = C('State=' + st, 'HORIZONTAL', { gap: 10, align: 'CENTER' });
  const tr = figma.createFrame(); tr.name = 'Track'; tr.resize(32, 18); tr.cornerRadius = 9; tr.fills = [P(st === 'On' ? 'accent/default' : st === 'Off' ? 'border/strong' : 'bg/surface-muted')]; c.appendChild(tr);
  const k = figma.createEllipse(); k.name = 'Knob'; k.resize(14, 14); k.fills = [P(st === 'Disabled' ? 'bg/surface' : 'text/inverse')]; tr.appendChild(k); k.x = st === 'On' ? 16 : 2; k.y = 2;
  await T(c, 'Weight variance alerts', 'Body/Default', st === 'Disabled' ? 'text/disabled' : 'text/primary', { name: 'Label' });
  tgs.push(c);
}
const tgSet = makeSet(tgs, 'Toggle', formSec, { w: 800, desc: 'Immediate-effect settings only. For deferred saves use Checkbox.' });
bindProp(tgSet, 'Label', 'TEXT', 'Label', 'Label', 'characters');
bindProp(tgSet, 'Show label', 'BOOLEAN', true, 'Label', 'visible');
const rds = [];
for (const st of ['Selected', 'Unselected', 'Disabled']) {
  const c = C('State=' + st, 'HORIZONTAL', { gap: 8, align: 'CENTER' });
  const o = figma.createFrame(); o.name = 'Radio'; o.resize(16, 16); o.cornerRadius = 8; o.fills = [P(st === 'Disabled' ? 'bg/surface-muted' : 'bg/surface')]; o.strokes = [P(st === 'Selected' ? 'accent/default' : 'border/strong')]; o.strokeWeight = st === 'Selected' ? 5 : 1; o.strokeAlign = 'INSIDE'; c.appendChild(o);
  await T(c, 'Metric tonnes (MT)', 'Body/Default', st === 'Disabled' ? 'text/disabled' : 'text/primary', { name: 'Label' });
  rds.push(c);
}
const rdSet = makeSet(rds, 'Radio', formSec, { w: 800 });
bindProp(rdSet, 'Label', 'TEXT', 'Label', 'Label', 'characters');

// ---- Status & data ----
const statSec = await libSection(lib, 'Status, deltas & identity', 'Badges describe state; Delta describes performance against a declared baseline. Both pair colour with a glyph and words.');
const TONES = { Positive: 'positive', Negative: 'negative', Warning: 'warning', Info: 'info', Neutral: 'neutral', Critical: 'critical' };
const TONE_LABEL = { Positive: 'Dispatched', Negative: 'Over tolerance', Warning: 'Overdue', Info: 'Loading', Neutral: 'Draft', Critical: 'Blocked' };
const badges = [];
for (const [tone, key] of Object.entries(TONES)) {
  const c = C('Tone=' + tone, 'HORIZONTAL', { pad: [2, 8, 2, 6], gap: 6, radius: 4, fill: 'status/' + key + '/bg', align: 'CENTER' });
  const d = figma.createEllipse(); d.name = 'Dot'; d.resize(6, 6); d.fills = [P(key === 'critical' ? 'status/critical/solid' : 'status/' + key + '/fg')]; c.appendChild(d);
  await T(c, TONE_LABEL[tone], 'Label/Default', 'status/' + key + '/fg', { name: 'Label' });
  badges.push(c);
}
const badgeSet = makeSet(badges, 'Badge', statSec, { w: 1000 });
bindProp(badgeSet, 'Label', 'TEXT', 'Status', 'Label', 'characters');
bindProp(badgeSet, 'Show dot', 'BOOLEAN', true, 'Dot', 'visible');
const deltas = [];
for (const [o, key, txt] of [['Favourable', 'positive', '▲ 12.0%'], ['Unfavourable', 'negative', '▲ 0.6 pp'], ['Unchanged', 'neutral', '0.0%'], ['No data', 'neutral', '— No data']]) {
  const c = C('Outcome=' + o, 'HORIZONTAL', { pad: [1, 6, 1, 6], gap: 4, radius: 4, fill: o === 'No data' ? null : 'status/' + key + '/bg', align: 'CENTER' });
  await T(c, txt, 'Label/Default', o === 'No data' ? 'text/tertiary' : 'status/' + key + '/fg', { name: 'Value', tnum: true });
  deltas.push(c);
}
const deltaSet = makeSet(deltas, 'Delta', statSec, { w: 1000, desc: 'Outcome is set from the metric polarity, not from the sign. Example: error rate ▲ = Unfavourable; freight cost ▼ = Favourable. Missing comparison = No data (never 0%).' });
bindProp(deltaSet, 'Value', 'TEXT', '▲ 0.0%', 'Value', 'characters');
const avs = [];
for (const [sz, s, st] of [['32', 32, 'Label/Default'], ['24', 24, 'Caption/Default'], ['40', 40, 'Body/Strong']]) {
  const c = C('Size=' + sz, 'HORIZONTAL', { w: s, h: s, radius: s / 2, fill: 'accent/subtle', align: 'CENTER', justify: 'CENTER' });
  await T(c, 'PR', st, 'accent/text', { name: 'Initials' });
  avs.push(c);
}
const avSet = makeSet(avs, 'Avatar', statSec, { w: 600 });
bindProp(avSet, 'Initials', 'TEXT', 'PR', 'Initials', 'characters');

// ---- Navigation primitives ----
const navSec = await libSection(lib, 'Tabs, segmented control, menu & pagination', null);
const tabs = [];
for (const [st, fg, bar] of [['Default', 'text/secondary', null], ['Hover', 'text/primary', 'border/strong'], ['Active', 'text/primary', 'accent/default'], ['Disabled', 'text/disabled', null]]) {
  const c = C('State=' + st, 'HORIZONTAL', { pad: [10, 2, 10, 2], gap: 6, align: 'CENTER' });
  if (bar) { c.strokes = [P(bar)]; c.strokeTopWeight = 0; c.strokeLeftWeight = 0; c.strokeRightWeight = 0; c.strokeBottomWeight = 2; c.strokeAlign = 'INSIDE'; }
  await T(c, 'Outstanding', 'Body/Strong', fg, { name: 'Label' });
  const cnt = AL(c, 'HORIZONTAL', { name: 'Count', pad: [0, 6, 0, 6], radius: 999, fill: st === 'Active' ? 'accent/subtle' : 'bg/surface-muted' });
  await T(cnt, '74', 'Label/Default', st === 'Active' ? 'accent/text' : 'text/secondary', { name: 'Count value', tnum: true });
  tabs.push(c);
}
const tabSet = makeSet(tabs, 'Tab', navSec, { w: 800 });
bindProp(tabSet, 'Label', 'TEXT', 'Tab', 'Label', 'characters');
bindProp(tabSet, 'Count', 'TEXT', '0', 'Count value', 'characters');
bindProp(tabSet, 'Show count', 'BOOLEAN', true, 'Count', 'visible');
const segs = [];
for (const sel of ['True', 'False']) {
  const c = C('Selected=' + sel, 'HORIZONTAL', { pad: [5, 12, 5, 12], radius: 4, fill: sel === 'True' ? 'bg/surface' : null, align: 'CENTER' });
  if (sel === 'True') { await fx(c, 'Elevation/2 · Raised'); }
  await T(c, 'Week', 'Button/Small', sel === 'True' ? 'text/primary' : 'text/secondary', { name: 'Label' });
  segs.push(c);
}
const segSet = makeSet(segs, 'Segment', navSec, { w: 400, desc: 'Use inside a bg/surface-muted track with 2 px padding.' });
bindProp(segSet, 'Label', 'TEXT', 'Option', 'Label', 'characters');
const mis = [];
for (const [st, bg, fg, ic] of [['Default', null, 'text/primary', 'text/secondary'], ['Hover', 'bg/hover', 'text/primary', 'text/primary'], ['Selected', 'accent/subtle', 'accent/text', 'accent/text'], ['Destructive', null, 'status/negative/fg', 'status/negative/fg'], ['Disabled', null, 'text/disabled', 'text/disabled']]) {
  const c = C('State=' + st, 'HORIZONTAL', { pad: [8, 10, 8, 10], gap: 10, radius: 4, fill: bg, align: 'CENTER', w: 232 });
  const i = icon(c, st === 'Destructive' ? 'trash' : 'truck', 16, ic); i.name = 'Icon';
  const l = await T(c, st === 'Destructive' ? 'Cancel order' : 'Assign vehicle', 'Body/Default', fg, { name: 'Label' }); l.layoutSizingHorizontal = 'FILL';
  const sc = await T(c, st === 'Selected' ? '✓' : '⌘ A', 'Caption/Default', st === 'Selected' ? 'accent/text' : 'text/tertiary', { name: 'Meta' });
  mis.push(c);
}
const miSet = makeSet(mis, 'Menu item', navSec, { w: 1300 });
bindProp(miSet, 'Label', 'TEXT', 'Menu item', 'Label', 'characters');
bindProp(miSet, 'Show icon', 'BOOLEAN', true, 'Icon', 'visible');
bindProp(miSet, 'Icon', 'INSTANCE_SWAP', LIB['Icon/truck'].id, 'Icon', 'mainComponent');
bindProp(miSet, 'Meta', 'TEXT', '⌘ A', 'Meta', 'characters');

// Pagination
const pg = C('Pagination', 'HORIZONTAL', { pad: [12, 16, 12, 16], gap: 16, align: 'CENTER', w: 1000, justify: 'SPACE_BETWEEN', fill: 'bg/surface' });
navSec.appendChild(pg);
await T(pg, 'Showing 1–9 of 128 orders', 'Body/Small', 'text/secondary', { name: 'Summary', tnum: true });
const pgr = AL(pg, 'HORIZONTAL', { name: 'Pages', gap: 4, align: 'CENTER' });
const pb = async (txt, active, isIcon) => { const b = AL(pgr, 'HORIZONTAL', { name: 'Page ' + txt, w: 32, h: 32, radius: 6, align: 'CENTER', justify: 'CENTER', fill: active ? 'accent/subtle' : null, stroke: isIcon ? 'border/default' : null }); if (isIcon) icon(b, txt, 16, 'text/secondary'); else await T(b, txt, 'Button/Small', active ? 'accent/text' : 'text/secondary', { tnum: true }); };
await pb('chevron-left', false, true); await pb('1', true); await pb('2'); await pb('3'); await pb('…'); await pb('15'); await pb('chevron-right', false, true);
pg.description = 'Table footer pagination. Summary uses tabular figures.';

// Tooltip & Toast
const fbSec = await libSection(lib, 'Feedback', 'Tooltips explain, toasts confirm, banners persist. Toasts auto-dismiss after 6 s unless they contain an action; errors never auto-dismiss.');
const tts = [];
{
  const c = C('Type=Simple', 'HORIZONTAL', { pad: [6, 10, 6, 10], radius: 6, fill: 'bg/inverse' });
  await T(c, 'Download CSV', 'Caption/Default', 'text/inverse', { name: 'Text' });
  tts.push(c);
  const d = C('Type=Chart', 'VERTICAL', { pad: [10, 12, 10, 12], gap: 6, radius: 6, fill: 'bg/inverse', w: 220 });
  await T(d, 'Thu, 09 Oct 2026', 'Label/Default', 'text/inverse', { name: 'Title' });
  for (const [tok, name, val] of [['chart/series-1', 'Dispatched', '1,912.40 MT'], ['chart/comparison', 'Prior week', '1,768.00 MT']]) {
    const r = AL(d, 'HORIZONTAL', { name: 'Row/' + name, gap: 8, align: 'CENTER' }); r.layoutSizingHorizontal = 'FILL';
    R(r, 8, 2, tok, { radius: 1, name: 'Key' });
    const l = await T(r, name, 'Caption/Default', 'nav/text', { name: 'Series' }); l.layoutSizingHorizontal = 'FILL';
    await T(r, val, 'Caption/Default', 'text/inverse', { name: 'Value', tnum: true });
  }
  const dd = AL(d, 'HORIZONTAL', { name: 'Footer', pad: [6, 0, 0, 0], strokeSides: [1, 0, 0, 0], stroke: 'nav/bg-active' }); dd.layoutSizingHorizontal = 'FILL';
  await T(dd, '+8.2% vs prior week · favourable', 'Caption/Default', 'nav/indicator', { name: 'Delta', tnum: true });
  tts.push(d);
}
const ttSet = makeSet(tts, 'Tooltip', fbSec, { w: 700, bg: 'bg/canvas' });
const toasts = [];
for (const [tone, key, ic, title, body] of [['Success', 'positive', 'check-circle', 'Settings saved', 'Alert thresholds now apply to Nagpur Works.'], ['Error', 'negative', 'x-circle', 'Couldn’t assign vehicle', 'MH 40 BG 2291 is already loading at Bay 3.'], ['Warning', 'warning', 'alert', 'Net weight over tolerance', 'LD-55094 is +0.38 MT above the 0.25 MT limit.'], ['Info', 'info', 'info', 'Export started', 'We’ll email orders.csv when it’s ready.']]) {
  const c = C('Tone=' + tone, 'HORIZONTAL', { pad: [14, 14, 14, 16], gap: 12, radius: 8, fill: 'bg/surface', stroke: 'border/default', w: 380, align: 'MIN' });
  await fx(c, 'Elevation/3 · Popover');
  const i = icon(c, ic, 20, 'status/' + key + '/fg'); i.name = 'Icon';
  const tx = AL(c, 'VERTICAL', { name: 'Text', gap: 2 }); tx.layoutSizingHorizontal = 'FILL';
  await T(tx, title, 'Body/Strong', 'text/primary', { name: 'Title', fill: true });
  await T(tx, body, 'Body/Small', 'text/secondary', { name: 'Description', fill: true });
  const x = icon(c, 'x', 16, 'text/tertiary'); x.name = 'Close';
  toasts.push(c);
}
const toastSet = makeSet(toasts, 'Toast', fbSec, { w: 1300, bg: 'bg/canvas' });
bindProp(toastSet, 'Title', 'TEXT', 'Title', 'Title', 'characters');
bindProp(toastSet, 'Description', 'TEXT', 'Description', 'Description', 'characters');
const banners = [];
for (const [tone, key, ic, txt] of [['Warning', 'warning', 'alert', '6 orders are overdue for dispatch. Review before the 18:00 shift change.'], ['Info', 'info', 'info', 'Figures are illustrative sample data for design review.'], ['Negative', 'negative', 'x-circle', 'Weighbridge 2 stopped reporting at 17:42. Readings may be incomplete.']]) {
  const c = C('Tone=' + tone, 'HORIZONTAL', { pad: [10, 14, 10, 14], gap: 10, radius: 6, fill: 'status/' + key + '/bg', stroke: 'status/' + key + '/border', align: 'CENTER', w: 900 });
  const i = icon(c, ic, 16, 'status/' + key + '/fg'); i.name = 'Icon';
  const t = await T(c, txt, 'Body/Small', 'text/primary', { name: 'Message' }); t.layoutSizingHorizontal = 'FILL';
  await T(c, 'Review', 'Button/Small', 'status/' + key + '/fg', { name: 'Action' });
  banners.push(c);
}
const banSet = makeSet(banners, 'Banner', fbSec, { w: 1408, bg: 'bg/canvas' });
bindProp(banSet, 'Message', 'TEXT', 'Message', 'Message', 'characters');
bindProp(banSet, 'Action', 'TEXT', 'Review', 'Action', 'characters');
bindProp(banSet, 'Show action', 'BOOLEAN', true, 'Action', 'visible');

await lib.screenshot({ scale: 0.3 });
return { lib: lib.id, libH: Math.round(lib.height), icons: Object.keys(LIB).length, sets: [btnSet, ibSet, fieldSet, selSet, cbSet, tgSet, rdSet, badgeSet, deltaSet, avSet, tabSet, segSet, miSet, ttSet, toastSet, banSet].map(s => s.name + ':' + s.children.length), errors: ERR.slice(0, 40), errCount: ERR.length };
