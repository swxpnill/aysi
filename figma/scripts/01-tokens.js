// ---------- 1. Pages ----------
const PAGE_NAMES = ['00 · Foundations & Components', '01 · Desktop screens', '02 · Overlays, Responsive & Flows'];
const pageIds = {};
for (let i = 0; i < 3; i++) { let p = figma.root.children[i]; if (!p) p = figma.createPage(); p.name = PAGE_NAMES[i]; pageIds[PAGE_NAMES[i]] = p.id; }

// ---------- 2. Variables ----------
const _hex = h => { h = h.replace('#', ''); return { r: parseInt(h.slice(0, 2), 16) / 255, g: parseInt(h.slice(2, 4), 16) / 255, b: parseInt(h.slice(4, 6), 16) / 255 }; };
const existingCols = await figma.variables.getLocalVariableCollectionsAsync();
for (const c of existingCols) if (['Primitives', 'Semantic', 'Dimension'].includes(c.name)) c.remove();
const prim = figma.variables.createVariableCollection('Primitives');
prim.renameMode(prim.modes[0].modeId, 'Value');
prim.hiddenFromPublishing = true;
const PRIM = {
  'gray/0': '#FFFFFF', 'gray/25': '#FCFCFD', 'gray/50': '#F6F8FB', 'gray/75': '#F7F8FA', 'gray/100': '#F0F2F6', 'gray/150': '#E9ECF1', 'gray/200': '#E4E7EC', 'gray/300': '#D0D5DD', 'gray/400': '#98A2B3', 'gray/500': '#667085', 'gray/600': '#525C6E', 'gray/700': '#344054', 'gray/800': '#1D2939', 'gray/900': '#172033', 'gray/950': '#0E1422',
  'blue/50': '#EEF2FC', 'blue/100': '#DCE4F8', 'blue/200': '#C9D5F5', 'blue/300': '#9DB2EC', 'blue/400': '#7F9BEA', 'blue/500': '#4A6FD6', 'blue/600': '#3157C8', 'blue/700': '#2747A8', 'blue/800': '#1F3A8A',
  'green/50': '#EAF6F0', 'green/200': '#BFE3D2', 'green/500': '#2E9E73', 'green/600': '#16845B', 'green/700': '#10694A',
  'red/50': '#FCEEEF', 'red/200': '#F2C6CB', 'red/500': '#D45663', 'red/600': '#C43D4B', 'red/700': '#A3303D', 'red/900': '#7E1F2B',
  'amber/50': '#FDF4E7', 'amber/200': '#F1D6AE', 'amber/500': '#C98424', 'amber/600': '#A86412', 'amber/700': '#8A510D',
  'teal/50': '#E7F4F5', 'teal/600': '#0E7C86', 'violet/50': '#F1EEFB', 'violet/600': '#7357C7',
  'ink/950': '#0B1120', 'ink/900': '#0F1626', 'ink/800': '#18223A', 'ink/700': '#222E4A', 'ink/600': '#2C3A5A', 'ink/300': '#7C879E', 'ink/200': '#A7B1C4', 'ink/100': '#D5DBE7'
};
const pv = {};
const pm = prim.modes[0].modeId;
for (const [k, h] of Object.entries(PRIM)) { const v = figma.variables.createVariable(k, prim, 'COLOR'); v.setValueForMode(pm, _hex(h)); v.scopes = []; pv[k] = v; }
const sem = figma.variables.createVariableCollection('Semantic');
sem.renameMode(sem.modes[0].modeId, 'Light');
const sm = sem.modes[0].modeId;
const SURF = ['FRAME_FILL', 'SHAPE_FILL'], TXT = ['TEXT_FILL'], STK = ['STROKE_COLOR'], ANY = ['FRAME_FILL', 'SHAPE_FILL', 'TEXT_FILL', 'STROKE_COLOR'];
const SEM = [
  ['bg/canvas', 'gray/50', SURF, 'Page background behind cards'], ['bg/surface', 'gray/0', SURF, 'Cards, tables, panels'], ['bg/surface-subtle', 'gray/25', SURF, 'Table headers, nested panels'], ['bg/surface-muted', 'gray/100', SURF, 'Wells, inactive segments, skeletons'], ['bg/hover', 'gray/75', SURF, 'Row & item hover'], ['bg/selected', 'blue/50', SURF, 'Selected row / item'], ['bg/inverse', 'gray/900', SURF, 'Tooltips, inverse surfaces'], ['bg/scrim', 'gray/950', SURF, 'Modal scrim (use at 48%)'],
  ['border/default', 'gray/200', STK.concat(SURF), 'Card & input borders'], ['border/subtle', 'gray/150', STK.concat(SURF), 'Dividers inside cards'], ['border/strong', 'gray/300', STK.concat(SURF), 'Hovered inputs, emphasis'], ['border/focus', 'blue/600', STK, 'Focus ring'],
  ['text/primary', 'gray/900', TXT.concat(['SHAPE_FILL']), 'Headings, values, body'], ['text/secondary', 'gray/600', TXT.concat(['SHAPE_FILL']), 'Labels, supporting copy'], ['text/tertiary', 'gray/500', TXT.concat(['SHAPE_FILL']), 'Metadata, axis labels (≥4.5:1 on surface)'], ['text/disabled', 'gray/400', TXT.concat(['SHAPE_FILL']), 'Disabled text only'], ['text/inverse', 'gray/0', TXT.concat(['SHAPE_FILL']), 'Text on accent & inverse'], ['text/link', 'blue/600', TXT, 'Links'],
  ['accent/default', 'blue/600', ANY, 'Primary actions, primary series'], ['accent/hover', 'blue/700', ANY, ''], ['accent/pressed', 'blue/800', ANY, ''], ['accent/subtle', 'blue/50', ANY, 'Selected/active tint'], ['accent/border', 'blue/200', ANY, ''], ['accent/text', 'blue/700', ANY, 'Accent text on subtle tint'],
  ['status/positive/fg', 'green/600', ANY, 'Favourable vs. baseline'], ['status/positive/bg', 'green/50', ANY, ''], ['status/positive/border', 'green/200', ANY, ''],
  ['status/negative/fg', 'red/600', ANY, 'Unfavourable vs. baseline'], ['status/negative/bg', 'red/50', ANY, ''], ['status/negative/border', 'red/200', ANY, ''],
  ['status/warning/fg', 'amber/600', ANY, 'Needs attention'], ['status/warning/bg', 'amber/50', ANY, ''], ['status/warning/border', 'amber/200', ANY, ''],
  ['status/info/fg', 'blue/700', ANY, 'Informational'], ['status/info/bg', 'blue/50', ANY, ''], ['status/info/border', 'blue/200', ANY, ''],
  ['status/neutral/fg', 'gray/600', ANY, 'Unchanged / no judgement'], ['status/neutral/bg', 'gray/100', ANY, ''], ['status/neutral/border', 'gray/200', ANY, ''],
  ['status/critical/fg', 'red/900', ANY, 'Blocking / destructive'], ['status/critical/solid', 'red/700', ANY, 'Destructive buttons'], ['status/critical/bg', 'red/50', ANY, ''],
  ['chart/series-1', 'blue/600', ANY, 'Primary measure — always this colour'], ['chart/series-2', 'teal/600', ANY, ''], ['chart/series-3', 'violet/600', ANY, ''], ['chart/series-4', 'amber/500', ANY, ''], ['chart/comparison', 'gray/400', ANY, 'Prior period / benchmark (dashed)'], ['chart/target', 'amber/600', ANY, 'Targets & thresholds (dashed)'], ['chart/grid', 'gray/150', ANY, 'Gridlines'], ['chart/axis', 'gray/500', ANY, 'Axis labels'],
  ['nav/bg', 'ink/900', ANY, 'Sidebar'], ['nav/bg-hover', 'ink/800', ANY, ''], ['nav/bg-active', 'ink/700', ANY, ''], ['nav/border', 'ink/800', ANY, ''], ['nav/text', 'ink/200', ANY, ''], ['nav/text-muted', 'ink/300', ANY, ''], ['nav/text-active', 'gray/0', ANY, ''], ['nav/indicator', 'blue/400', ANY, '']
];
for (const [name, ref, scopes, desc] of SEM) { const v = figma.variables.createVariable(name, sem, 'COLOR'); v.setValueForMode(sm, figma.variables.createVariableAlias(pv[ref])); v.scopes = scopes; if (desc) v.description = desc; try { v.setVariableCodeSyntax('WEB', 'var(--' + name.replace(/\//g, '-') + ')'); } catch (e) { } }
const dim = figma.variables.createVariableCollection('Dimension');
dim.renameMode(dim.modes[0].modeId, 'Default');
const dm = dim.modes[0].modeId;
const DIM = { 'space/2': [2, ['GAP', 'WIDTH_HEIGHT']], 'space/4': [4, ['GAP']], 'space/8': [8, ['GAP']], 'space/12': [12, ['GAP']], 'space/16': [16, ['GAP']], 'space/20': [20, ['GAP']], 'space/24': [24, ['GAP']], 'space/32': [32, ['GAP']], 'space/40': [40, ['GAP']], 'space/48': [48, ['GAP']], 'radius/sm': [4, ['CORNER_RADIUS']], 'radius/md': [6, ['CORNER_RADIUS']], 'radius/lg': [8, ['CORNER_RADIUS']], 'radius/xl': [12, ['CORNER_RADIUS']], 'radius/full': [999, ['CORNER_RADIUS']], 'size/control-sm': [32, ['WIDTH_HEIGHT']], 'size/control-md': [36, ['WIDTH_HEIGHT']], 'size/control-lg': [40, ['WIDTH_HEIGHT']], 'size/touch-min': [44, ['WIDTH_HEIGHT']] };
for (const [k, [val, sc]] of Object.entries(DIM)) { const v = figma.variables.createVariable(k, dim, 'FLOAT'); v.setValueForMode(dm, val); v.scopes = sc; }

// ---------- 3. Text styles ----------
for (const s of await figma.getLocalTextStylesAsync()) s.remove();
await Promise.all(['Regular', 'Medium', 'Semi Bold', 'Bold'].map(st => figma.loadFontAsync({ family: 'Inter', style: st })));
const TYPE = [
  ['Display/Page title', 'Semi Bold', 24, 32, -0.4, 'ORIGINAL', 'Page H1'],
  ['Heading/Section', 'Semi Bold', 16, 24, -0.15, 'ORIGINAL', 'Section & modal titles'],
  ['Heading/Card', 'Semi Bold', 14, 20, -0.05, 'ORIGINAL', 'Card titles'],
  ['Body/Default', 'Regular', 14, 20, 0, 'ORIGINAL', 'Body copy'],
  ['Body/Strong', 'Medium', 14, 20, 0, 'ORIGINAL', 'Emphasis, nav items'],
  ['Body/Small', 'Regular', 13, 18, 0, 'ORIGINAL', 'Dense UI, table cells'],
  ['Body/Small strong', 'Medium', 13, 18, 0, 'ORIGINAL', 'Primary table cell'],
  ['Label/Default', 'Medium', 12, 16, 0.1, 'ORIGINAL', 'Form labels, badges'],
  ['Label/Overline', 'Semi Bold', 11, 16, 0.6, 'UPPER', 'Eyebrows, table headers'],
  ['Caption/Default', 'Regular', 12, 16, 0, 'ORIGINAL', 'Helper text, metadata'],
  ['Numeric/KPI', 'Semi Bold', 28, 36, -0.6, 'ORIGINAL', 'KPI values — tabular figures'],
  ['Numeric/Large', 'Semi Bold', 20, 28, -0.3, 'ORIGINAL', 'Secondary figures'],
  ['Numeric/Medium', 'Medium', 14, 20, 0, 'ORIGINAL', 'Inline figures'],
  ['Numeric/Table', 'Regular', 13, 18, 0, 'ORIGINAL', 'Right-aligned table figures'],
  ['Chart/Axis', 'Regular', 11, 14, 0, 'ORIGINAL', 'Axis ticks & annotations'],
  ['Button/Default', 'Medium', 14, 20, 0, 'ORIGINAL', 'Buttons md/lg'],
  ['Button/Small', 'Medium', 13, 18, 0, 'ORIGINAL', 'Buttons sm, segmented']
];
const textStyleIds = {};
for (const [name, style, size, lh, ls, tcase, desc] of TYPE) {
  const s = figma.createTextStyle(); s.name = name; s.fontName = { family: 'Inter', style }; s.fontSize = size; s.lineHeight = { value: lh, unit: 'PIXELS' }; s.letterSpacing = { value: ls, unit: 'PIXELS' }; s.textCase = tcase; s.description = desc; textStyleIds[name] = s.id;
}
// ---------- 4. Effect styles ----------
for (const s of await figma.getLocalEffectStylesAsync()) s.remove();
const sh = (y, r, s, a) => ({ type: 'DROP_SHADOW', color: { r: 16 / 255, g: 24 / 255, b: 40 / 255, a }, offset: { x: 0, y }, radius: r, spread: s, visible: true, blendMode: 'NORMAL', showShadowBehindNode: false });
const EFX = [
  ['Elevation/1 · Card', [sh(1, 2, 0, 0.05)], 'Resting cards'],
  ['Elevation/2 · Raised', [sh(1, 3, 0, 0.08), sh(1, 2, -1, 0.05)], 'Hovered cards, sticky headers'],
  ['Elevation/3 · Popover', [sh(12, 24, -6, 0.12), sh(4, 8, -2, 0.06)], 'Menus, popovers, date pickers'],
  ['Elevation/4 · Modal', [sh(24, 48, -12, 0.22), sh(8, 16, -4, 0.06)], 'Dialogs & drawers'],
  ['Focus/Ring', [{ type: 'DROP_SHADOW', color: { r: 49 / 255, g: 87 / 255, b: 200 / 255, a: 0.28 }, offset: { x: 0, y: 0 }, radius: 0, spread: 3, visible: true, blendMode: 'NORMAL', showShadowBehindNode: false }], 'Keyboard focus — 3px accent halo'],
  ['Focus/Ring · Danger', [{ type: 'DROP_SHADOW', color: { r: 196 / 255, g: 61 / 255, b: 75 / 255, a: 0.24 }, offset: { x: 0, y: 0 }, radius: 0, spread: 3, visible: true, blendMode: 'NORMAL', showShadowBehindNode: false }], 'Focus on invalid fields']
];
for (const [name, effects, desc] of EFX) { const s = figma.createEffectStyle(); s.name = name; s.effects = effects; s.description = desc; }
