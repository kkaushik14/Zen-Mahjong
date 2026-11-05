/* Native development plugin. ASSETS is injected by bundle.cjs. */
const OWNER = 'zen-mahjong-moonlit-v3';
const ORIGINAL = 'lsPHWqjJBItMCFnjKg3Gy2';
let busy = false;
const hex = value => ({ r: parseInt(value.slice(0, 2), 16) / 255,
  g: parseInt(value.slice(2, 4), 16) / 255, b: parseInt(value.slice(4, 6), 16) / 255 });

async function build() {
  if (figma.fileKey === ORIGINAL) throw new Error('This is the original file. Open the V3 duplicate first.');
  if (!/Moonlit.*V3/i.test(figma.root.name)) throw new Error('Rename the duplicate to Zen Mahjong - Moonlit Garden V3 first.');
  await figma.loadAllPagesAsync();
  const page = figma.root.children.find(p => /(?:^|\s)Screens$/.test(p.name));
  if (!page) throw new Error('The duplicate must include the existing Screens page.');
  await figma.setCurrentPageAsync(page);
  if (page.getPluginData('v3Organized') !== 'yes') throw new Error('Run the organization pass first.');
  const componentPage = figma.root.children.find(p => /Components$/.test(p.name));
  const foundationPage = figma.root.children.find(p => /Foundations$/.test(p.name));
  await figma.setCurrentPageAsync(componentPage);
  const existing = componentPage.children.find(n => n.getPluginData('owner') === OWNER);
  if (existing) {
    figma.currentPage.selection = [existing];
    figma.viewport.scrollAndZoomIntoView([existing]);
    throw new Error('V3 already exists (' + existing.getPluginData('status') + '). No duplicate was built. Ask for review or a targeted repair.');
  }
  const font = { family: 'Inter', style: 'Regular' };
  const display = { family: 'Cormorant Garamond', style: 'Medium' };
  const available = await figma.listAvailableFontsAsync();
  for (const f of [font, display]) {
    if (!available.some(a => a.fontName.family === f.family && a.fontName.style === f.style)) throw new Error('Required font unavailable: ' + f.family + ' ' + f.style);
    await figma.loadFontAsync(f);
  }
  const sourceLibrary = componentPage.children.find(n => n.name === '01 Gameplay and Shared Components');
  await figma.setCurrentPageAsync(page);
  const sourceGroups = page.children.filter(n => ['01 Gameplay Screens', '02 App Screens and Popups'].includes(n.name));
  const sourceScreens = sourceGroups.flatMap(n => n.children).filter(n => n.type === 'FRAME');
  if (!sourceLibrary || sourceScreens.length < 10) throw new Error('The V2 foundation is incomplete. Nothing changed.');
  const texts = sourceScreens.flatMap(n => n.findAllWithCriteria({ types: ['TEXT'] }));
  const fonts = new Map();
  for (const t of texts) for (const s of t.getStyledTextSegments(['fontName'])) fonts.set(JSON.stringify(s.fontName), s.fontName);
  for (const f of fonts.values()) await figma.loadFontAsync(f);
  const created = [];
  await figma.setCurrentPageAsync(componentPage);
  const top = componentPage.children.find(n => n.name === '04 Home Screen Components / Ready for build') || figma.createFrame();
  if (top.parent !== componentPage) componentPage.appendChild(top);
  top.name = '04 Home Screen Components'; top.setPluginData('owner', OWNER); top.setPluginData('status', 'Building');
  top.resize(4240, 900); top.x = 80; top.y = 80; top.fills = []; top.clipsContent = false; created.push(top.id);
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  let collection = collections.find(c => c.name === 'Zen Mahjong / Moonlit V3');
  if (!collection) collection = figma.variables.createVariableCollection('Zen Mahjong / Moonlit V3');
  const local = await figma.variables.getLocalVariablesAsync();
  const colors = { ink: '2A1A12', light: 'FFF6EC', ivory: 'FAE8D5', jade: '2F765A',
    gold: 'B99A58', shadow: '350E01', cool: '12262E', sage: '627065', orange: 'A03C12' };
  const vars = {};
  for (const [name, value] of Object.entries(colors)) {
    let v = local.find(v => v.variableCollectionId === collection.id && v.name === 'color/' + name);
    if (!v) {
      v = figma.variables.createVariable('color/' + name, collection, 'COLOR');
      const compatible = local.find(v => v.name === 'color/' + name && v.resolvedType === 'COLOR');
      v.setValueForMode(collection.defaultModeId, compatible ? { type: 'VARIABLE_ALIAS', id: compatible.id } : hex(value));
      v.scopes = ['TEXT_FILL', 'FRAME_FILL', 'SHAPE_FILL', 'STROKE_COLOR'];
    }
    vars[name] = v;
  }
  for (const [name, value, scopes] of [['space/16', 16, ['GAP']], ['space/8', 8, ['GAP']], ['radius/8', 8, ['CORNER_RADIUS']], ['touch/48', 48, ['WIDTH_HEIGHT']]]) {
    if (!local.some(v => v.variableCollectionId === collection.id && v.name === name)) {
      const v = figma.variables.createVariable(name, collection, 'FLOAT'); v.scopes = scopes; v.setValueForMode(collection.defaultModeId, value);
    }
  }
  const paint = name => figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: hex(colors[name]) }, 'color', vars[name]);
  function frame(parent, name, x, y, w, h, component = false) {
    const n = component ? figma.createComponent() : figma.createFrame(); parent.appendChild(n);
    n.name = name; n.resize(w, h); n.x = x; n.y = y; n.fills = []; n.clipsContent = false; created.push(n.id); return n;
  }
  function text(parent, name, value, x, y, w, size = 16, color = 'ink', heading = false) {
    const n = figma.createText(); parent.appendChild(n); n.name = name; n.fontName = heading ? display : font;
    n.fontSize = size; n.characters = value; n.letterSpacing = { unit: 'PIXELS', value: 0 };
    n.lineHeight = { unit: 'PIXELS', value: Math.ceil(size * 1.3) }; n.textAutoResize = 'HEIGHT'; n.resize(w, n.height);
    n.x = x; n.y = y; n.fills = [paint(color)]; created.push(n.id); return n;
  }
  function property(m, n, name, value) { n.componentPropertyReferences = { characters: m.addComponentProperty(name, 'TEXT', value) }; }
  function instance(parent, m, x, y, w = m.width, h = m.height, name = m.name) {
    const n = m.createInstance(); parent.appendChild(n); n.resize(w, h); n.x = x; n.y = y; n.name = name; created.push(n.id); return n;
  }
  function set(n, name, value) { const k = Object.keys(n.componentProperties).find(k => k.startsWith(name + '#')); if (k) n.setProperties({ [k]: value }); }
  const hashes = {};
  for (const [key, bytes] of Object.entries(ASSETS)) hashes[key] = figma.createImage(figma.base64Decode(bytes)).hash;
  function image(parent, key, name, x, y, w, h, crop) {
    const n = figma.createRectangle(); parent.appendChild(n); n.name = name; n.resize(w, h); n.x = x; n.y = y;
    n.fills = [{ type: 'IMAGE', imageHash: hashes[key], scaleMode: crop ? 'CROP' : 'FILL',
      ...(crop ? { imageTransform: [[crop[2] / 1448, 0, crop[0] / 1448], [0, crop[3] / 1086, crop[1] / 1086]] } : {}) }];
    n.constraints = { horizontal: 'SCALE', vertical: 'SCALE' }; created.push(n.id); return n;
  }
  function rect(parent, name, x, y, w, h, color) { const n = frame(parent, name, x, y, w, h); n.fills = [paint(color)]; n.cornerRadius = 8; return n; }
  function surface(parent, key, name, w, h, crop, left, right) {
    // Only the quiet center stretches; illustrated ends retain their aspect ratio.
    const [x, y, cw, ch] = crop, scale = h / ch;
    const lw = left * scale, rw = right * scale;
    const parts = [
      [0, lw, [x, y, left, ch], 'MIN'],
      [lw, w - lw - rw, [x + left, y, cw - left - right, ch], 'STRETCH'],
      [w - rw, rw, [x + cw - right, y, right, ch], 'MAX']
    ];
    for (const [px, pw, part, constraint] of parts) {
      const n = image(parent, key, name + ' / ' + constraint, px, 0, pw, h, part);
      n.constraints = { horizontal: constraint, vertical: 'SCALE' };
    }
  }
  function dot(parent, x, y, filled) {
    const n = figma.createEllipse(); parent.appendChild(n); n.resize(8, 8); n.x = x; n.y = y;
    n.fills = filled ? [paint('jade')] : []; n.strokes = [paint(filled ? 'jade' : 'gold')]; n.strokeWeight = 1.5; created.push(n.id); return n;
  }
  const lib = top;
  const bg = frame(lib, 'V3/Background/Moonlit Garden', 0, 0, 195, 422, true);
  image(bg, 'moonlit-garden', 'User garden artwork', 0, 0, 195, 422);
  const logo = frame(lib, 'V3/Brand/Zen Mahjong', 240, 0, 196, 148, true);
  image(logo, 'home-materials-alpha', 'User brand artwork', 0, 0, 196, 148, [324, 20, 764, 573]);
  const avatar = frame(lib, 'V3/Navigation/Profile', 480, 0, 48, 48, true);
  image(avatar, 'home-materials-alpha', 'Avatar artwork', 0, 0, 48, 48, [60, 138, 235, 215]);
  const gear = frame(lib, 'V3/Navigation/Settings', 560, 0, 48, 48, true);
  image(gear, 'home-materials-alpha', 'Gear artwork', 0, 0, 48, 48, [1170, 321, 230, 198]);
  const currency = frame(lib, 'V3/HUD/Currency', 650, 0, 136, 48, true);
  image(currency, 'home-materials-alpha', 'Currency artwork', 0, 0, 136, 48, [1060, 151, 355, 129]);
  const balance = text(currency, 'Balance', '1,250', 46, 14, 49, 14, 'light'); property(currency, balance, 'Balance', '1,250');
  const add = frame(currency, 'Add currency / 48px hit target', 88, 0, 48, 48);
  const continueVariants = [];
  for (const [i, state] of ['Default', 'Pressed', 'Disabled'].entries()) {
    const m = frame(lib, 'State=' + state, 900 + i * 370, 0, 342, 86, true);
    surface(m, 'home-materials-alpha', 'Marble and branches', 342, 86, [100, 563, 1270, 506], 300, 240);
    const row = frame(m, 'Label group', 64, 22, 235, 44); row.layoutMode = 'HORIZONTAL'; row.itemSpacing = 12;
    row.primaryAxisSizingMode = 'FIXED'; row.counterAxisSizingMode = 'FIXED'; row.counterAxisAlignItems = 'CENTER';
    const glyph = text(row, 'Play icon', '▶', 0, 0, 22, 22, 'orange'); glyph.textAutoResize = 'WIDTH_AND_HEIGHT';
    const label = text(row, 'Label', 'Continue', 0, 0, 190, 29, 'ink', true); property(m, label, 'Label', 'Continue');
    row.constraints = { horizontal: 'CENTER', vertical: 'CENTER' };
    if (state === 'Pressed') { const shade = rect(m, 'Pressed treatment', 16, 16, 310, 54, 'shadow'); shade.opacity = .12; }
    if (state === 'Disabled') m.opacity = .42;
    continueVariants.push(m);
  }
  const continueSet = figma.combineAsVariants(continueVariants, lib); continueSet.name = 'V3/Home/Primary Action';
  continueSet.x = 900; continueSet.y = 0; continueSet.resize(1120, 118);
  continueVariants.forEach((m, i) => { m.x = 8 + i * 370; m.y = 8; });
  const menu = {};
  const kinds = ['Daily Challenge', 'Streak', 'Journey', 'Achievements'];
  for (const [i, kind] of kinds.entries()) {
    const m = frame(lib, 'V3/Home/' + kind, 240 + i * 390, 480, 326, i < 2 ? 90 : 78, true);
    const crop = i === 0 ? [18, 127, 783, 364] : i === 1 ? [811, 137, 616, 376] : i === 2 ? [12, 541, 745, 334] : [783, 545, 646, 334];
    surface(m, 'menu-materials-alpha', 'User organic surface', m.width, m.height, crop, i < 2 ? 140 : i === 2 ? 340 : 240, 80);
    const x = i < 2 ? 30 : 92, w = i < 2 ? 232 : 170, color = i < 2 ? 'light' : 'ink';
    const title = text(m, 'Title', kind, x, 18, w, 24, color, true); property(m, title, 'Title', kind);
    const statusValue = ['2 of 4 completed', '3 consecutive days', 'Stage 3', '5 of 24 unlocked'][i];
    const status = text(m, 'Status', statusValue, x, 49, w, 13, color); property(m, status, 'Status', statusValue);
    const arrow = text(m, 'Arrow', '›', 285, 28, 22, 25, color); arrow.textAlignHorizontal = 'CENTER';
    if (i < 2) { for (let j = 0; j < 4; j++) dot(m, 30 + j * 16, 73, j < (i === 0 ? 2 : 3)); }
    menu[kind] = m;
  }
  const progressVariants = [];
  for (const [i, state] of ['In Progress', 'Completed', 'Claimable'].entries()) {
    const m = menu['Daily Challenge'].clone(); lib.appendChild(m); m.name = 'State=' + state;
    const status = m.findOne(n => n.name === 'Status' && n.type === 'TEXT');
    status.characters = ['2 of 4 completed', '4 of 4 completed', 'Reward ready to claim'][i];
    m.description = state === 'Claimable' ? 'Visual specimen only. Availability and reward rules must come from product logic.' : 'Explicit progress label, independent of glow.';
    if (i > 0) for (const d of m.children.filter(n => n.type === 'ELLIPSE')) d.fills = [paint('jade')];
    progressVariants.push(m); created.push(m.id);
  }
  const progressSet = figma.combineAsVariants(progressVariants, lib); progressSet.name = 'V3/Home/Daily Status'; progressSet.x = 240; progressSet.y = 650; progressSet.resize(1060, 122);
  progressVariants.forEach((m, i) => { m.x = 8 + i * 348; m.y = 8; });
  // Existing screens and component IDs stay intact; this pass only adds Home.
  await figma.setCurrentPageAsync(page);
  for (const n of page.children) n.y += 1140;
  const screenGroup = figma.createSection(); page.appendChild(screenGroup); screenGroup.name = '00 Home Screens / Moonlit Garden'; screenGroup.x = 0; screenGroup.y = 0; screenGroup.resizeWithoutConstraints(2620, 1060); screenGroup.fills = []; created.push(screenGroup.id);
  const screenMap = new Map(), named = {};
  const originals = sourceScreens.filter(n => !n.name.startsWith('Home /'));
  for (const source of originals) {
    const n = source;
    const baseName = source.name.split(' /')[0];
    if (!named[baseName] || source.name === 'Gameplay / 390 x 844') named[baseName] = n;
  }
  function home(w, h, col, first = false, daily = '2 of 4 completed') {
    const f = frame(screenGroup, 'Home / ' + w + ' x ' + h + (first ? ' / First Play' : ''), col * 510, 0, w, h);
    f.clipsContent = true; instance(f, bg, 0, 0, w, h, 'Garden');
    const wash = rect(f, 'HUD readability wash', 0, 0, w, 116, 'cool'); wash.opacity = .38; wash.cornerRadius = 0;
    const header = frame(f, 'HUD / Safe top 56', 16, 56, w - 32, 52);
    instance(header, avatar, 0, 0, 48, 48, 'Profile');
    text(header, 'Level', 'Lv. 12', 54, 6, 56, 15, 'light');
    rect(header, 'Level track', 54, 31, 48, 5, 'cool'); rect(header, 'Level progress', 54, 31, 29, 5, 'jade');
    instance(header, currency, w - 32 - 196, 0, 136, 48, 'Currency');
    instance(header, gear, w - 80, 0, 48, 48, 'Settings');
    instance(f, logo, (w - 196) / 2, 124, 196, 148, 'Zen Mahjong');
    const list = frame(f, 'Destinations', 16, 278, w - 32, 376); list.layoutMode = 'VERTICAL'; list.itemSpacing = 8;
    list.primaryAxisSizingMode = 'AUTO'; list.counterAxisSizingMode = 'FIXED';
    for (const kind of kinds) {
      const n = instance(list, menu[kind], 0, 0, w - 32, menu[kind].height, kind);
      n.layoutSizingHorizontal = 'FILL';
      if (kind === 'Daily Challenge') set(n, 'Status', daily);
      const title = n.findOne(c => c.name === 'Title' && c.type === 'TEXT');
      const status = n.findOne(c => c.name === 'Status' && c.type === 'TEXT');
      if (title) title.constraints = { horizontal: 'STRETCH', vertical: 'MIN' };
      if (status) status.constraints = { horizontal: 'STRETCH', vertical: 'MIN' };
      const arrow = n.findOne(c => c.name === 'Arrow'); if (arrow) arrow.constraints = { horizontal: 'MAX', vertical: 'CENTER' };
    }
    const button = instance(f, continueVariants[0], 24, h - 118, w - 48, 86, 'Continue');
    if (first) set(button, 'Label', 'Play');
    button.constraints = { horizontal: 'STRETCH', vertical: 'MAX' };
    return f;
  }
  const homes = [[390, 844], [360, 800], [412, 915], [430, 932]].map(([w, h], i) => home(w, h, i));
  const primaryHome = homes[0];
  const firstHome = home(390, 844, 4, true, 'Today\'s garden awaits');
  for (const n of sourceScreens.filter(n => n.name.startsWith('Home /'))) screenMap.set(n.id, primaryHome.id);
  async function link(n, target) {
    if (!n || !target) return;
    const action = { type: 'NODE', destinationId: target.id, navigation: 'NAVIGATE', transition: null, preserveScrollPosition: false };
    await n.setReactionsAsync([{ trigger: { type: 'ON_CLICK' }, action, actions: [action] }]);
  }
  for (const h of [...homes, firstHome]) {
    for (const [from, to] of [['Profile', 'Profile'], ['Settings', 'Settings'], ['Continue', 'Gameplay'], ['Streak', 'Streaks'], ['Achievements', 'Achievements']]) await link(h.findOne(n => n.name === from && n.type === 'INSTANCE'), named[to]);
  }
  for (const n of sourceScreens) {
    for (const c of [n, ...n.findAll(() => true)]) {
      if (!('reactions' in c) || !c.reactions.length) continue;
      const reactions = JSON.parse(JSON.stringify(c.reactions));
      let changed = false;
      for (const r of reactions) {
        for (const a of [r.action, ...(r.actions || [])].filter(Boolean)) {
          if (a.type === 'NODE' && screenMap.has(a.destinationId)) { a.destinationId = screenMap.get(a.destinationId); changed = true; }
        }
      }
      if (changed) await c.setReactionsAsync(reactions);
    }
  }
  await figma.setCurrentPageAsync(foundationPage);
  const specimen = foundationPage.children.find(n => n.name === 'Production / Foundations' && n.type === 'FRAME' && !n.children.length);
  if (specimen) {
    specimen.name = '00 Foundations / Palette and Typography'; specimen.resize(1440, 1000); specimen.fills = [];
    text(specimen, 'Heading', 'Zen Mahjong / Moonlit Garden', 40, 40, 1200, 36, 'ink', true);
    text(specimen, 'Direction', 'Moonlit Home · Autumn Gameplay · Ivory Marble · Organic Controls', 40, 98, 1300, 18);
    for (const [i, name] of Object.keys(colors).entries()) {
      rect(specimen, 'Color / ' + name, 40 + (i % 5) * 260, 172 + Math.floor(i / 5) * 140, 220, 82, name);
      text(specimen, 'Token / ' + name, 'color/' + name, 40 + (i % 5) * 260, 264 + Math.floor(i / 5) * 140, 220, 14);
    }
    text(specimen, 'Display specimen', 'A quieter garden', 40, 500, 1000, 32, 'ink', true);
    text(specimen, 'Body specimen', 'Inter / Progress, counts and controls', 40, 560, 1000, 16);
    text(specimen, 'Layout rules', '48px touch targets · 16px page margins · 32px bottom reserve · 8px component gaps', 40, 620, 1300, 16);
    text(specimen, 'Provenance', 'User-supplied artwork and in-house composition. Design study, not production certification.', 40, 690, 1300, 16);
  }
  const report = { owner: OWNER, sectionId: top.id, productionFinal: false,
    status: 'Built; visual QA pending', screens: screenGroup.children.map(n => ({ id: n.id, name: n.name, width: n.width, height: n.height })),
    components: lib.findAllWithCriteria({ types: ['COMPONENT'] }).map(n => ({ id: n.id, name: n.name })),
    createdNodeIds: created, pending: ['Actual rendered review', 'Daily Challenge and Journey detail destinations', 'Final ZIP and editable FIG backup'] };
  top.setPluginData('report', JSON.stringify(report)); top.setPluginData('status', report.status);
  screenGroup.setPluginData('owner', OWNER); screenGroup.setPluginData('report', JSON.stringify(report));
  await figma.setCurrentPageAsync(page);
  page.flowStartingPoints = [...page.flowStartingPoints, { nodeId: primaryHome.id, name: 'Moonlit Garden V3' }];
  figma.currentPage.selection = [primaryHome]; figma.viewport.scrollAndZoomIntoView([primaryHome]);
  return report;
}

figma.showUI('<body style="font:14px system-ui;padding:20px"><h2>Moonlit Garden V3</h2><p id="file"></p><p>Add Home components and Home screens to the organized V3 file. Existing screens remain in place.</p><button id="build">Build Home</button><pre id="status" style="white-space:pre-wrap"></pre><script>onmessage=e=>{const m=e.data.pluginMessage;if(!m)return;if(m.type==="file")document.getElementById("file").textContent="Open file: "+m.name;if(m.type==="status")document.getElementById("status").textContent=m.text;};document.getElementById("build").onclick=()=>{document.getElementById("build").disabled=true;parent.postMessage({pluginMessage:{type:"build"}},"*");};</script>', { width: 430, height: 310 });
figma.ui.postMessage({ type: 'file', name: figma.root.name });
figma.ui.onmessage = async m => {
  if (m.type !== 'build' || busy) return; busy = true;
  figma.ui.postMessage({ type: 'status', text: 'Building editable V3 layers...' });
  try {
    const report = await build();
    figma.ui.postMessage({ type: 'status', text: 'Built ' + report.screens.length + ' screens. Visual review is still required. Keep this file open and report completion in chat.' });
  } catch (e) { figma.ui.postMessage({ type: 'status', text: 'Stopped: ' + e.message }); }
  busy = false;
};
