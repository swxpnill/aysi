// ---------- screen helpers ----------
await loadLib();
const page = figma.root.children[1];
await figma.setCurrentPageAsync(page);
function vec(parent, pts, token, o) {
  o = o || {};
  const v = figma.createVector();
  v.name = o.name || 'Line';
  const d = pts.map((p, i) => (i ? 'L ' : 'M ') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ') + (o.close ? ' Z' : '');
  v.vectorPaths = [{ windingRule: 'NONZERO', data: d }];
  if (o.area) { v.fills = [o.area]; v.strokes = []; } else { v.strokes = [P(token)]; v.strokeWeight = o.sw || 1.5; v.fills = []; v.strokeCap = 'ROUND'; v.strokeJoin = 'ROUND'; }
  if (o.dash) v.dashPattern = o.dash;
  if (parent) parent.appendChild(v);
  return v;
}
async function txt(node, layer, value) {
  if (!node) return;
  const t = node.findOne(n => n.type === 'TEXT' && n.name === layer);
  if (!t) { ERR.push('no layer ' + layer + ' in ' + node.name); return; }
  t.characters = String(value);
}
function clear(name) { for (const n of page.children.slice()) if (n.name === name) n.remove(); }
async function screen(name, x, y, navLabel, section, pageTitle, o) {
  o = o || {};
  clear(name);
  const f = figma.createFrame(); f.name = name; page.appendChild(f); place(f, x, y);
  f.resize(1440, 900); f.fills = [P('bg/canvas')];
  f.layoutMode = 'HORIZONTAL'; f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'AUTO'; f.itemSpacing = 0; f.clipsContent = true; f.counterAxisAlignItems = 'MIN';
  const sb = LIB['Sidebar'].createInstance(); f.appendChild(sb); sb.layoutSizingVertical = 'FILL';
  const nav = sb.findOne(n => n.name === 'Nav/' + navLabel);
  if (nav) { try { nav.setProperties({ State: 'Active' }); } catch (e) { ERR.push('nav active ' + e.message); } recolor(nav.findOne(n => n.name === 'Icon'), 'nav/indicator'); }
  const main = AL(f, 'VERTICAL', { name: 'Main', gap: 0 }); main.layoutSizingHorizontal = 'FILL';
  try { main.minHeight = o.minH || 900; } catch (e) { }
  const tb = LIB['Top bar'].createInstance(); main.appendChild(tb); tb.layoutSizingHorizontal = 'FILL';
  await txt(tb, 'Section', section); await txt(tb, 'Page', pageTitle);
  const content = AL(main, 'VERTICAL', { name: 'Content', gap: 24, pad: [28, 32, 48, 32] }); content.layoutSizingHorizontal = 'FILL';
  return { f, content, sb, tb, main };
}
async function pageHeader(parent, title, desc, buildActions) {
  const r = AL(parent, 'HORIZONTAL', { name: 'Page header', gap: 24, align: 'MAX' }); r.layoutSizingHorizontal = 'FILL';
  const tt = AL(r, 'VERTICAL', { name: 'Titles', gap: 4 }); tt.layoutSizingHorizontal = 'FILL';
  await T(tt, title, 'Display/Page title', 'text/primary', { name: 'Title' });
  if (desc) await T(tt, desc, 'Body/Default', 'text/secondary', { name: 'Description', fill: true });
  if (buildActions) { const a = AL(r, 'HORIZONTAL', { name: 'Actions', gap: 8, align: 'CENTER' }); await buildActions(a); }
  return r;
}
function btn(parent, variant, label, ic, o) {
  o = o || {};
  const b = inst('Button|Variant=' + variant + ', State=' + (o.state || 'Default') + ', Size=' + (o.size || 'Medium'), parent);
  if (!b) return null;
  const props = { Label: label, 'Show icon': !!ic };
  if (ic) props.Icon = LIB['Icon/' + ic].id;
  setP(b, props);
  if (ic) recolor(b.findOne(n => n.name === 'Icon'), variant === 'Primary' || variant === 'Danger' ? 'text/inverse' : variant === 'Ghost' ? 'text/secondary' : 'text/primary');
  b.name = o.name || ('Button/' + label);
  return b;
}
function card(parent, name, o) { o = o || {}; const c = AL(parent, 'VERTICAL', Object.assign({ name, fill: 'bg/surface', stroke: 'border/default', radius: 8, gap: 0, clip: true }, o)); return c; }
async function cardHeader(parent, title, sub, o) {
  o = o || {};
  const h = AL(parent, 'HORIZONTAL', { name: 'Card header', pad: o.pad || [18, 20, 14, 20], gap: 12, align: 'CENTER' }); h.layoutSizingHorizontal = 'FILL';
  const t = AL(h, 'VERTICAL', { name: 'Titles', gap: 2 }); t.layoutSizingHorizontal = 'FILL';
  await T(t, title, 'Heading/Card', 'text/primary', { name: 'Title' });
  if (sub) await T(t, sub, 'Caption/Default', 'text/tertiary', { name: 'Subtitle', fill: true });
  const a = AL(h, 'HORIZONTAL', { name: 'Actions', gap: 8, align: 'CENTER' });
  return a;
}
async function kpi(parent, label, value, unit, outcome, delta, baseline, o) {
  o = o || {};
  const k = inst('KPI card|State=' + (o.state || 'Default'), parent);
  if (!k) return null;
  k.layoutSizingHorizontal = 'FILL';
  setP(k, { Label: label, Value: value, Unit: unit, Baseline: baseline, 'Show sparkline': o.spark !== false });
  const d = k.findOne(n => n.name === 'Delta');
  if (d) { try { d.setProperties({ Outcome: outcome }); } catch (e) { ERR.push('delta outcome ' + e.message); } setP(d, { Value: delta }); }
  if (o.spark && o.spark.length) {
    const cur = k.findOne(n => n.name === 'Current period');
    if (cur) { try { const d2 = o.spark.map((p, i) => (i ? 'L ' : 'M ') + p[0] + ' ' + p[1]).join(' '); cur.vectorPaths = [{ windingRule: 'NONZERO', data: d2 }]; } catch (e) { } }
  }
  k.name = 'KPI/' + label;
  return k;
}
function badge(parent, tone, label) { const b = inst('Badge|Tone=' + tone, parent); setP(b, { Label: label }); if (b) b.name = 'Badge/' + label; return b; }
function delta(parent, outcome, value) { const d = inst('Delta|Outcome=' + outcome, parent); setP(d, { Value: value }); return d; }
function legend(parent, series, label) { const l = inst('Legend item|Series=' + series, parent); setP(l, { Label: label }); return l; }
function seg(parent, labels, sel) { const tr = AL(parent, 'HORIZONTAL', { name: 'Segmented', pad: 2, radius: 6, fill: 'bg/surface-muted', gap: 2 }); for (const l of labels) { const s = inst('Segment|Selected=' + (l === sel ? 'True' : 'False'), tr); setP(s, { Label: l }); if (s) s.name = 'Segment/' + l; } return tr; }
// Line chart: series = [{vals, token, dash, area, name}], labels on x, y range
async function lineChart(parent, W, H, o) {
  const fr = figma.createFrame(); fr.name = o.name || 'Line chart'; fr.fills = []; fr.resize(W, H); parent.appendChild(fr); fr.clipsContent = false;
  const L = 52, Rr = 12, Tt = 8, B = 28; const pw = W - L - Rr, ph = H - Tt - B;
  const yv = v => Tt + ph - (v - o.min) / (o.max - o.min) * ph;
  const xv = i => L + (o.x.length === 1 ? 0 : i * pw / (o.x.length - 1));
  for (let t = o.min; t <= o.max + 0.001; t += o.step) {
    const y = yv(t);
    const g = R(fr, pw, 1, 'chart/grid', { x: L, y: Math.round(y), name: 'Grid ' + t });
    const lt = await T(fr, o.fmt ? o.fmt(t) : String(t), 'Chart/Axis', 'chart/axis', { tnum: true, name: 'Y ' + t }); lt.textAlignHorizontal = 'RIGHT'; lt.textAutoResize = 'NONE'; lt.resize(L - 10, 14); lt.x = 0; lt.y = Math.round(y - 7);
  }
  for (let i = 0; i < o.x.length; i++) { const t = await T(fr, o.x[i], 'Chart/Axis', 'chart/axis', { name: 'X ' + o.x[i] }); t.textAutoResize = 'NONE'; t.resize(48, 14); t.textAlignHorizontal = 'CENTER'; t.x = Math.round(xv(i) - 24); t.y = H - 18; }
  if (o.target != null) { const ty = yv(o.target); const tl = vec(fr, [[L, ty], [L + pw, ty]], 'chart/target', { sw: 1.25, dash: [4, 4], name: 'Target' }); const lab = AL(fr, 'HORIZONTAL', { name: 'Target label', pad: [1, 6, 1, 6], radius: 4, fill: 'status/warning/bg' }); await T(lab, o.targetLabel, 'Chart/Axis', 'status/warning/fg', { tnum: true }); lab.x = L + pw - lab.width; lab.y = ty - 20; }
  for (const s of o.series) {
    const pts = []; s.vals.forEach((v, i) => { if (v != null) pts.push([xv(i), yv(v)]); });
    if (s.area) { const ap = pts.concat([[pts[pts.length - 1][0], Tt + ph], [pts[0][0], Tt + ph]]); const a = vec(fr, ap, null, { close: true, name: s.name + ' area', area: { type: 'GRADIENT_LINEAR', gradientTransform: [[0, 1, 0], [-1, 0, 1]], gradientStops: [{ position: 0, color: { r: 0.192, g: 0.341, b: 0.784, a: 0.14 } }, { position: 1, color: { r: 0.192, g: 0.341, b: 0.784, a: 0 } }] } }); }
    vec(fr, pts, s.token, { sw: s.sw || 2, dash: s.dash, name: s.name });
    if (s.dots) for (const p of pts) { const e = figma.createEllipse(); e.resize(6, 6); e.fills = [P('bg/surface')]; e.strokes = [P(s.token)]; e.strokeWeight = 1.5; e.name = 'Point'; fr.appendChild(e); e.x = p[0] - 3; e.y = p[1] - 3; }
  }
  return { fr, xv, yv, L, Tt, ph, pw };
}
