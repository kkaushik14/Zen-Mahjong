const BUILD_KEY = "zen-mahjong-hifi-v1";

const C = {
  canvas: "#173C2F",
  canvasDeep: "#123127",
  canvasSoft: "#315B47",
  ivory: "#FBF7EB",
  ivoryDim: "#D8CDB4",
  paper: "#F3ECDD",
  ink: "#1D332B",
  inkSoft: "#5D6F66",
  jade: "#2F765A",
  jadePale: "#A7C8B2",
  gold: "#B99A58",
  goldPale: "#E8DDBD",
  red: "#A44332",
  line: "#D7CCB4",
  glass: "#29483D",
  white: "#FFFFFF",
  black: "#000000"
};

const rgba = (hex, opacity = 1) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255, a: opacity };
};
const solid = (hex, opacity = 1) => ({ type: "SOLID", color: rgba(hex), opacity });
const linear = (a, b) => ({
  type: "GRADIENT_LINEAR",
  gradientTransform: [[0.7, 0.7, -0.2], [-0.7, 0.7, 0.5]],
  gradientStops: [{ position: 0, color: rgba(a) }, { position: 1, color: rgba(b) }]
});
const shadow = (color = C.black, opacity = 0.16, y = 8, blur = 20) => ({
  type: "DROP_SHADOW", color: rgba(color, opacity), offset: { x: 0, y }, radius: blur, spread: 0, visible: true, blendMode: "NORMAL"
});

let fontDisplay;
let fontDisplaySemi;
let fontUI;
let fontUISemi;

async function chooseFonts() {
  const fonts = await figma.listAvailableFontsAsync();
  const has = (family, style) => fonts.some(f => f.fontName.family === family && f.fontName.style === style);
  const displayFamily = has("Cormorant Garamond", "Medium") ? "Cormorant Garamond" : (has("Playfair Display", "Regular") ? "Playfair Display" : "Inter");
  fontDisplay = { family: displayFamily, style: has(displayFamily, "Medium") ? "Medium" : "Regular" };
  fontDisplaySemi = { family: displayFamily, style: has(displayFamily, "SemiBold") ? "SemiBold" : (has(displayFamily, "Semi Bold") ? "Semi Bold" : fontDisplay.style) };
  fontUI = { family: "Inter", style: "Regular" };
  fontUISemi = { family: "Inter", style: "Semi Bold" };
  for (const f of [fontDisplay, fontDisplaySemi, fontUI, fontUISemi]) await figma.loadFontAsync(f);
}

function mark(node) {
  node.setPluginData("zen-build", BUILD_KEY);
  return node;
}

function clearGenerated(page) {
  for (const node of [...page.children]) {
    if (node.getPluginData("zen-build") === BUILD_KEY) node.remove();
  }
}

async function setupVariables() {
  const collectionName = "Zen Mahjong / Semantic";
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  let collection = collections.find(c => c.name === collectionName);
  if (!collection) collection = figma.variables.createVariableCollection(collectionName);
  const existing = await figma.variables.getLocalVariablesAsync();
  const byName = new Map(existing.filter(v => v.variableCollectionId === collection.id).map(v => [v.name, v]));
  const colors = {};
  const definitions = {
    "color/background/base": C.canvas,
    "color/background/deep": C.canvasDeep,
    "color/background/elevated": C.canvasSoft,
    "color/surface/ivory": C.ivory,
    "color/surface/subtle": C.paper,
    "color/surface/depth": C.ivoryDim,
    "color/surface/glass": C.glass,
    "color/text/on-dark/primary": C.ivory,
    "color/text/on-dark/secondary": C.goldPale,
    "color/text/on-light/primary": C.ink,
    "color/text/on-light/secondary": C.inkSoft,
    "color/accent/forest": C.canvasSoft,
    "color/accent/jade": C.jade,
    "color/accent/jade-soft": C.jadePale,
    "color/accent/gold": C.gold,
    "color/accent/gold-soft": C.goldPale,
    "color/accent/red": C.red,
    "color/border/subtle": C.line,
    "color/state/disabled": C.ivoryDim,
    "color/state/selected": C.gold
  };
  for (const [name, hex] of Object.entries(definitions)) {
    let v = byName.get(name);
    if (!v) v = figma.variables.createVariable(name, collection, "COLOR");
    v.scopes = ["ALL_FILLS", "STROKE_COLOR"];
    const color = rgba(hex); delete color.a;
    v.setValueForMode(collection.defaultModeId, color);
    colors[hex.toUpperCase()] = v;
  }
  for (const [name, value] of Object.entries({"space/4":4,"space/8":8,"space/12":12,"space/16":16,"space/24":24,"space/32":32,"space/48":48})) {
    let v = byName.get(name); if (!v) v = figma.variables.createVariable(name, collection, "FLOAT"); v.scopes = ["GAP"]; v.setValueForMode(collection.defaultModeId, value);
  }
  for (const [name, value] of Object.entries({"radius/tile":7,"radius/card":8,"radius/modal":12,"radius/pill":999})) {
    let v = byName.get(name); if (!v) v = figma.variables.createVariable(name, collection, "FLOAT"); v.scopes = ["CORNER_RADIUS"]; v.setValueForMode(collection.defaultModeId, value);
  }
  return { collection, colors };
}

async function setupStyles() {
  const textStyles = await figma.getLocalTextStylesAsync();
  const defs = [
    ["Zen Mahjong/Display/Game Title", fontDisplaySemi, 44, 48],
    ["Zen Mahjong/Heading/Large", fontDisplaySemi, 32, 38],
    ["Zen Mahjong/Heading/Medium", fontUISemi, 24, 30],
    ["Zen Mahjong/Body/Regular", fontUI, 15, 22],
    ["Zen Mahjong/Body/Small", fontUI, 13, 18],
    ["Zen Mahjong/Label/Control", fontUISemi, 12, 16],
    ["Zen Mahjong/Caption", fontUI, 10, 14]
  ];
  for (const [name, fontName, fontSize, lineHeight] of defs) {
    let s = textStyles.find(x => x.name === name); if (!s) s = figma.createTextStyle();
    s.name = name; s.fontName = fontName; s.fontSize = fontSize; s.lineHeight = { value: lineHeight, unit: "PIXELS" };
  }
  const effectStyles = await figma.getLocalEffectStylesAsync();
  const effects = [
    ["Zen Mahjong/Shadow/Tile", [shadow(C.black,0.16,4,8)]],
    ["Zen Mahjong/Shadow/Tile Selected", [shadow(C.black,0.26,8,14)]],
    ["Zen Mahjong/Shadow/Card", [shadow(C.black,0.13,8,20)]],
    ["Zen Mahjong/Shadow/Floating Dock", [shadow(C.black,0.24,12,28),{type:"BACKGROUND_BLUR",radius:18,visible:true}]]
  ];
  for (const [name, value] of effects) { let s=effectStyles.find(x=>x.name===name); if(!s)s=figma.createEffectStyle(); s.name=name; s.effects=value; }
}

function rgbHex(color) {
  const p = n => Math.round(n * 255).toString(16).padStart(2,"0");
  return ("#" + p(color.r) + p(color.g) + p(color.b)).toUpperCase();
}

function bindTree(root, colorVars) {
  const nodes = [root, ...root.findAll(() => true)];
  for (const node of nodes) {
    if ("fills" in node && Array.isArray(node.fills)) node.fills = node.fills.map(p => p.type === "SOLID" && colorVars[rgbHex(p.color)] ? figma.variables.setBoundVariableForPaint(p,"color",colorVars[rgbHex(p.color)]) : p);
    if ("strokes" in node && Array.isArray(node.strokes)) node.strokes = node.strokes.map(p => p.type === "SOLID" && colorVars[rgbHex(p.color)] ? figma.variables.setBoundVariableForPaint(p,"color",colorVars[rgbHex(p.color)]) : p);
  }
}

function ensurePage(name) {
  let page = figma.root.children.find(p => p.name === name);
  if (!page) { page = figma.createPage(); page.name = name; }
  return page;
}

function auto(name, dir = "VERTICAL", gap = 0, padding = 0) {
  const f = figma.createFrame();
  f.name = name;
  f.layoutMode = dir;
  f.primaryAxisSizingMode = "AUTO";
  f.counterAxisSizingMode = "AUTO";
  f.itemSpacing = gap;
  f.paddingTop = f.paddingRight = f.paddingBottom = f.paddingLeft = padding;
  f.fills = [];
  f.clipsContent = false;
  return f;
}

function box(name, w, h, fill = null, radius = 0) {
  const r = figma.createRectangle();
  r.name = name;
  r.resize(w, h);
  r.fills = fill ? [typeof fill === "string" ? solid(fill) : fill] : [];
  r.cornerRadius = radius;
  return r;
}

function circle(name, d, fill) {
  const e = figma.createEllipse();
  e.name = name;
  e.resize(d, d);
  e.fills = [typeof fill === "string" ? solid(fill) : fill];
  return e;
}

function txt(name, value, size, color = C.ink, font = fontUI, align = "LEFT") {
  const t = figma.createText();
  t.name = name;
  t.fontName = font;
  t.characters = value;
  t.fontSize = size;
  t.fills = [solid(color)];
  t.textAlignHorizontal = align;
  t.textAutoResize = "WIDTH_AND_HEIGHT";
  return t;
}

function fixedText(name, value, size, color, w, font = fontUI, align = "LEFT", lineHeight = null) {
  const t = txt(name, value, size, color, font, align);
  t.textAutoResize = "HEIGHT";
  t.resize(w, t.height);
  if (lineHeight) t.lineHeight = { value: lineHeight, unit: "PIXELS" };
  return t;
}

function add(parent, child) { parent.appendChild(child); return child; }
function setFillWidth(node) { node.layoutSizingHorizontal = "FILL"; return node; }

function screenBase(name, w = 390, h = 844) {
  const f = mark(figma.createFrame());
  f.name = name;
  f.resize(w, h);
  f.clipsContent = true;
  f.fills = [linear(C.canvas, C.canvasDeep)];

  const glow = circle("Sunlight / Wash", Math.round(w * 1.15), solid(C.ivory, 0.1));
  glow.x = -Math.round(w * 0.45); glow.y = -Math.round(h * 0.28); glow.effects = [{ type: "LAYER_BLUR", radius: 60, visible: true }];
  f.appendChild(glow);
  const leaf1 = figma.createEllipse(); leaf1.name = "Botanical Shadow 01"; leaf1.resize(150, 42); leaf1.rotation = -28; leaf1.x = -38; leaf1.y = 132; leaf1.fills = [solid(C.canvasDeep, 0.26)]; leaf1.effects = [{ type: "LAYER_BLUR", radius: 9, visible: true }]; f.appendChild(leaf1);
  const leaf2 = leaf1.clone(); leaf2.name = "Botanical Shadow 02"; leaf2.resize(110, 32); leaf2.rotation = 25; leaf2.x = w - 65; leaf2.y = 210; leaf2.opacity = 0.7; f.appendChild(leaf2);
  const hair = figma.createLine(); hair.name = "Botanical Stem"; hair.resize(250, 0); hair.rotation = 55; hair.x = w - 72; hair.y = 84; hair.strokes = [solid(C.jadePale, 0.13)]; hair.strokeWeight = 1; f.appendChild(hair);
  return f;
}

function createLotus(parent, cx, cy, scale = 1, color = C.goldPale) {
  const g = figma.createFrame(); g.name = "Lotus Mark"; g.resize(96 * scale, 72 * scale); g.fills = []; g.clipsContent = false; g.x = cx - g.width / 2; g.y = cy - g.height / 2;
  for (let i = 0; i < 5; i++) {
    const p = figma.createEllipse(); p.resize(22 * scale, 48 * scale); p.x = 37 * scale; p.y = 16 * scale; p.rotation = -52 + i * 26; p.fills = [solid(color, i === 2 ? 0.95 : 0.72)]; p.strokes = [solid(C.ivory, 0.18)]; p.strokeWeight = 1; g.appendChild(p);
  }
  parent.appendChild(g); if ("layoutMode" in parent && parent.layoutMode !== "NONE") g.layoutPositioning = "ABSOLUTE"; return g;
}

function pill(parent, label, x, y, fill, textColor = C.ivory, width = null) {
  const f = auto("Pill / " + label, "HORIZONTAL", 6, 8); f.cornerRadius = 999; f.fills = [solid(fill, 0.92)]; f.x = x; f.y = y;
  const t = txt("Label", label, 11, textColor, fontUISemi); f.appendChild(t);
  if (width) f.resize(width, f.height);
  parent.appendChild(f); if ("layoutMode" in parent && parent.layoutMode !== "NONE") f.layoutPositioning = "ABSOLUTE"; return f;
}

function makeComponent(name, w, h, fill = null, radius = 0) {
  const c = figma.createComponent(); c.name = name; c.resize(w, h); c.fills = fill ? [typeof fill === "string" ? solid(fill) : fill] : []; c.cornerRadius = radius; c.clipsContent = false; return c;
}

function addCenteredText(parent, value, size, color, font = fontUISemi) {
  const t = txt("Label", value, size, color, font, "CENTER"); t.x = (parent.width - t.width) / 2; t.y = (parent.height - t.height) / 2; parent.appendChild(t); return t;
}

function override(instance, name, value) {
  const n = instance.findOne(x => x.type === "TEXT" && x.name === name);
  if (n) n.characters = value;
}

function createArtworkComponent(label, motif, accent) {
  const c = makeComponent("Motif=" + label, 34, 44);
  c.fills = [];
  if (label === "Dots") {
    for (let i = 0; i < 6; i++) { const e = circle("Dot", 7, i % 3 === 0 ? C.red : (i % 2 ? C.jade : C.ink)); e.x = 3 + (i % 2) * 17; e.y = 5 + Math.floor(i / 2) * 14; c.appendChild(e); }
  } else if (label === "Bamboo") {
    for (let i = 0; i < 3; i++) { const r = box("Bamboo", 4, 31, C.jade, 2); r.x = 6 + i * 10; r.y = 7; c.appendChild(r); for (let j = 0; j < 3; j++) { const l = box("Joint", 7, 2, C.goldPale, 1); l.x = 4.5 + i * 10; l.y = 12 + j * 9; c.appendChild(l); } }
  } else if (label === "Lotus") {
    createLotus(c, 17, 23, 0.34, accent);
  } else {
    const t = txt("Motif", motif, label === "East" || label === "Red" ? 25 : 20, accent, fontDisplaySemi, "CENTER"); t.x = (34 - t.width) / 2; t.y = (44 - t.height) / 2 - 1; c.appendChild(t);
  }
  return c;
}

function createTileComponent(state, artworkComp) {
  const c = makeComponent("State=" + state, 46, 64);
  c.fills = [];
  const side = box("Tile Depth", 44, 60, state === "Disabled" ? C.inkSoft : C.canvasSoft, 7); side.x = 2; side.y = 4; c.appendChild(side);
  const face = box("Tile Face", 44, 59, state === "Disabled" ? C.ivoryDim : C.ivory, 7); face.strokes = [solid(state === "Selected" ? C.gold : C.line, state === "Blocked" ? 0.45 : 0.9)]; face.strokeWeight = state === "Selected" ? 1.5 : 0.7; face.effects = [shadow(C.black, state === "Selected" ? 0.26 : 0.15, state === "Selected" ? 8 : 4, state === "Selected" ? 12 : 7)]; face.x = state === "Pressed" ? 1 : 0; face.y = state === "Pressed" ? 2 : (state === "Selected" ? -2 : 0); face.opacity = state === "Blocked" ? 0.78 : (state === "Disabled" ? 0.52 : 1); c.appendChild(face);
  const art = artworkComp.createInstance(); art.name = "Artwork"; art.x = 5; art.y = state === "Selected" ? 5 : 7; art.opacity = state === "Blocked" ? 0.55 : 1; c.appendChild(art);
  if (["Hinted", "Matching"].includes(state)) { const halo = box("State Halo", 46, 61, null, 8); halo.strokes = [solid(state === "Hinted" ? C.gold : C.jadePale, 0.9)]; halo.strokeWeight = 2; halo.x = 0; halo.y = -1; c.appendChild(halo); }
  if (state === "Removing") c.opacity = 0.45;
  return c;
}

function createButtonComponent(kind, state) {
  const fill = kind === "Primary" ? (state === "Disabled" ? C.inkSoft : C.gold) : (state === "Disabled" ? C.glass : C.ivory);
  const c = makeComponent(`Type=${kind}, State=${state}`, 326, 52, fill, 8);
  c.strokes = [solid(kind === "Primary" ? C.goldPale : C.line, 0.75)]; c.strokeWeight = 1;
  c.effects = state === "Pressed" ? [] : [shadow(C.black, 0.14, 6, 14)];
  addCenteredText(c, kind === "Primary" ? "Continue" : "Home", 15, kind === "Primary" ? C.canvasDeep : C.ink);
  if (state === "Pressed") c.opacity = 0.88;
  if (state === "Disabled") c.opacity = 0.45;
  return c;
}

function createToggleComponent(on) {
  const c = makeComponent("State=" + (on ? "On" : "Off"), 48, 28, on ? C.jade : C.inkSoft, 14);
  const k = circle("Knob", 22, C.ivory); k.x = on ? 23 : 3; k.y = 3; k.effects = [shadow(C.black, 0.18, 2, 4)]; c.appendChild(k); return c;
}

function createHeaderComponent() {
  const c = makeComponent("Navigation / Screen Header", 342, 52); c.fills = [];
  const back = circle("Back Button", 44, solid(C.glass, 0.78)); back.strokes = [solid(C.ivory, 0.16)]; back.x = 0; back.y = 4; c.appendChild(back);
  const arr = txt("Back Icon", "‹", 30, C.ivory, fontUI); arr.x = 15; arr.y = 7; c.appendChild(arr);
  const title = txt("Title", "Screen title", 24, C.ivory, fontDisplaySemi, "CENTER"); title.x = (342 - title.width) / 2; title.y = 12; c.appendChild(title);
  return c;
}

function createMetricComponent() {
  const c = makeComponent("Stats / Metric", 158, 86, solid(C.ivory, 0.96), 8); c.strokes = [solid(C.line, 0.75)]; c.strokeWeight = 1;
  const v = txt("Value", "128", 25, C.ink, fontDisplaySemi); v.x = 16; v.y = 15; c.appendChild(v);
  const l = txt("Caption", "Boards completed", 11, C.inkSoft, fontUI); l.x = 16; l.y = 54; c.appendChild(l); return c;
}

function createAchievementComponent(state) {
  const c = makeComponent("State=" + state, 342, 106, solid(C.ivory, state === "Locked" ? 0.72 : 0.96), 8); c.strokes = [solid(state === "New" ? C.gold : C.line, 0.8)]; c.strokeWeight = state === "New" ? 1.5 : 1;
  const med = circle("Motif", 52, state === "Unlocked" || state === "New" ? C.goldPale : C.ivoryDim); med.x = 16; med.y = 18; c.appendChild(med);
  const glyph = txt("Glyph", state === "Locked" ? "○" : "✦", 22, state === "Locked" ? C.inkSoft : C.jade, fontDisplaySemi); glyph.x = 31; glyph.y = 31; c.appendChild(glyph);
  const title = txt("Title", "Quiet Beginning", 16, C.ink, fontUISemi); title.x = 84; title.y = 18; c.appendChild(title);
  const desc = fixedText("Description", "Complete 10 boards", 12, C.inkSoft, 220); desc.x = 84; desc.y = 43; c.appendChild(desc);
  const track = box("Progress Track", 220, 5, C.ivoryDim, 3); track.x = 84; track.y = 72; c.appendChild(track);
  const prog = box("Progress Fill", state === "Locked" ? 44 : (state === "In Progress" ? 155 : 220), 5, state === "Locked" ? C.inkSoft : C.jade, 3); prog.x = 84; prog.y = 72; c.appendChild(prog);
  const cap = txt("Progress", state === "Unlocked" || state === "New" ? "Unlocked" : (state === "In Progress" ? "7 / 10" : "2 / 10"), 10, C.inkSoft); cap.x = 84; cap.y = 83; c.appendChild(cap); return c;
}

function createDockActionComponent(label, symbol) {
  const c = makeComponent("Action=" + label, 70, 70); c.fills = [];
  const ring = circle("Touch Target", 42, solid(C.ivory, label === "Hint" ? 0.18 : 0.1)); ring.strokes = [solid(C.ivory, label === "Hint" ? 0.55 : 0.2)]; ring.x = 14; ring.y = 0; c.appendChild(ring);
  const ic = txt("Icon", symbol, 19, C.ivory, fontUISemi, "CENTER"); ic.x = (70 - ic.width) / 2; ic.y = 10; c.appendChild(ic);
  const lab = txt("Label", label, 11, C.ivory, fontUI, "CENTER"); lab.x = (70 - lab.width) / 2; lab.y = 50; c.appendChild(lab);
  if (label === "Hint") { const b = circle("Badge", 18, C.gold); b.x = 47; b.y = -3; c.appendChild(b); const n = txt("Count", "3", 10, C.canvasDeep, fontUISemi); n.x = 53; n.y = 0; c.appendChild(n); }
  return c;
}

function createSettingRowComponent(toggleComp) {
  const c = makeComponent("Settings / Row", 342, 64, solid(C.ivory, 0.96), 8);
  const title = txt("Title", "Ambient sound", 14, C.ink, fontUISemi); title.x = 16; title.y = 13; c.appendChild(title);
  const sub = txt("Description", "Quiet garden ambience", 11, C.inkSoft); sub.x = 16; sub.y = 36; c.appendChild(sub);
  const tog = toggleComp.createInstance(); tog.name = "Toggle"; tog.x = 278; tog.y = 18; c.appendChild(tog); return c;
}

async function createFoundations(page) {
  await figma.setCurrentPageAsync(page);
  clearGenerated(page);
  const f = mark(auto("HF / Foundations", "VERTICAL", 30, 38)); f.resize(1180, 720); f.x = 0; f.y = 900; f.fills = [solid(C.paper)]; f.cornerRadius = 12;
  add(f, txt("Title", "Zen Mahjong visual foundations", 42, C.ink, fontDisplaySemi));
  add(f, txt("Subtitle", "Quiet, tactile, botanical and deliberately restrained", 15, C.jade, fontUI));
  const colors = auto("Semantic colors", "HORIZONTAL", 14, 0); add(f, colors);
  for (const [name, value] of [["Canvas",C.canvas],["Deep",C.canvasDeep],["Ivory",C.ivory],["Jade",C.jade],["Gold",C.gold],["Red",C.red]]) { const sw = auto("Color / "+name,"VERTICAL",8,14); sw.resize(160,100); sw.fills=[solid(value)]; sw.cornerRadius=8; add(sw,txt("Name",name,12,[C.ivory,C.goldPale].includes(value)?C.ink:C.white,fontUISemi)); add(sw,txt("Hex",value,10,[C.ivory,C.goldPale].includes(value)?C.inkSoft:C.ivory)); add(colors,sw); }
  const type = auto("Typography", "HORIZONTAL", 48, 0); add(f, type);
  add(type, txt("Display", "Zen Mahjong", 48, C.ink, fontDisplaySemi));
  const sample = auto("Interface type", "VERTICAL", 8, 0); add(sample, txt("Heading", "A calmer board awaits", 24, C.ink, fontUISemi)); add(sample, txt("Body", "Breathe · Match · Be Present", 15, C.inkSoft)); add(sample, txt("Caption", "OFFLINE PROGRESS SAVED", 10, C.jade, fontUISemi)); add(type, sample);
  page.appendChild(f);
  return f;
}

async function createComponents(page) {
  await figma.setCurrentPageAsync(page);
  clearGenerated(page);
  const existingBottom = Math.max(0, ...page.children.map(n => n.y + n.height));
  const board = mark(auto("HF / Component Library", "VERTICAL", 32, 40)); board.resize(1440, 1900); board.x = 0; board.y = existingBottom + 180; board.fills=[solid(C.paper)]; board.cornerRadius=12; page.appendChild(board);
  add(board, txt("Title", "Zen Mahjong component library", 42, C.ink, fontDisplaySemi));
  add(board, txt("Subtitle", "Reusable components, semantic states and production-ready instances", 15, C.jade));

  const artwork = [];
  const motifs = [["Bamboo","","#2F765A"],["Lotus","","#A44332"],["Dots","","#2F765A"],["East","東","#1D332B"],["Red","中","#A44332"],["Crane","鶴","#315B47"],["Mountain","山","#A44332"],["Moon","月","#C2A45F"],["Torii","門","#1D332B"]];
  const artRow = auto("Tile artwork", "HORIZONTAL", 18, 0); add(board, artRow);
  for (const [label,motif,accent] of motifs) { const c=createArtworkComponent(label,motif,accent); artwork.push(c); artRow.appendChild(c); }
  const artworkSet = figma.combineAsVariants(artwork, board); artworkSet.name = "Game / Tile Artwork"; artworkSet.description = "Interchangeable Indo-Japanese tile motifs with a consistent optical scale.";

  const tileComps=[]; const states=["Default","Available","Blocked","Pressed","Selected","Hinted","Matching","Removing","Disabled"];
  for(const s of states) tileComps.push(createTileComponent(s, artwork[0]));
  const tileSet=figma.combineAsVariants(tileComps,board); tileSet.name="Game / Mahjong Tile"; tileSet.description="Physical ivory tile states. Selected uses elevation and a restrained gold edge, never neon.";

  const buttons=[]; for(const kind of ["Primary","Secondary"]) for(const state of ["Default","Pressed","Disabled"]) buttons.push(createButtonComponent(kind,state));
  const buttonSet=figma.combineAsVariants(buttons,board); buttonSet.name="Button / Action"; buttonSet.description="Mobile actions with calm tactile states and 52px touch height.";
  const toggles=[createToggleComponent(true),createToggleComponent(false)]; const toggleSet=figma.combineAsVariants(toggles,board); toggleSet.name="Control / Toggle";
  const achievements=["Locked","In Progress","Unlocked","New"].map(createAchievementComponent); const achievementSet=figma.combineAsVariants(achievements,board); achievementSet.name="Achievement / Card";
  const actions=[createDockActionComponent("Undo","↶"),createDockActionComponent("Hint","✦"),createDockActionComponent("Shuffle","⇄"),createDockActionComponent("More","•••")]; const actionSet=figma.combineAsVariants(actions,board); actionSet.name="Game / Bottom Action";
  const header=createHeaderComponent(); header.description="Shared back/title header for secondary screens."; board.appendChild(header);
  const metric=createMetricComponent(); metric.description="Compact lifetime statistic with editable value and caption."; board.appendChild(metric);
  const settings=createSettingRowComponent(toggles[0]); settings.description="Reusable settings row with nested toggle instance."; board.appendChild(settings);
  const menu=makeComponent("Navigation / Menu Button",48,48,solid(C.glass,0.82),24); menu.strokes=[solid(C.ivory,0.2)]; for(let i=0;i<3;i++){const l=box("Menu line",20,2,C.ivory,1);l.x=14;l.y=15+i*7;menu.appendChild(l);} board.appendChild(menu);
  const statusOn=makeComponent("State=Online",116,30,solid(C.glass,0.78),15); const dotOn=circle("Dot",7,C.jadePale);dotOn.x=12;dotOn.y=11;statusOn.appendChild(dotOn);const st1=txt("Label","Synced",11,C.ivory,fontUISemi);st1.x=28;st1.y=8;statusOn.appendChild(st1);
  const statusOff=statusOn.clone();statusOff.name="State=Offline";statusOff.findOne(n=>n.name==="Dot").fills=[solid(C.gold)];statusOff.findOne(n=>n.name==="Label").characters="Offline";
  const statusSet=figma.combineAsVariants([statusOn,statusOff],board);statusSet.name="Status / Connection";
  return { board, artwork, tileComps, buttons, toggles, achievements, actions, header, metric, settings, menu, statusOn, statusOff };
}

function addTitleBlock(screen, eyebrow, title, body, y=92) {
  const e=txt("Eyebrow",eyebrow.toUpperCase(),10,C.goldPale,fontUISemi);e.letterSpacing={value:1.5,unit:"PIXELS"};e.x=24;e.y=y;screen.appendChild(e);
  const h=fixedText("Screen Title",title,34,C.ivory,342,fontDisplaySemi,"LEFT",38);h.x=24;h.y=y+22;screen.appendChild(h);
  if(body){const b=fixedText("Body",body,13,C.ivoryDim,332,fontUI,"LEFT",19);b.x=24;b.y=y+67;screen.appendChild(b);} 
}

function makeButtonInstance(comp,label,x,y,w=342){const i=comp.createInstance();i.name="Button / "+label;i.x=x;i.y=y;i.resize(w,52);override(i,"Label",label);return i;}
function makeHeaderInstance(comp,title){const i=comp.createInstance();override(i,"Title",title);i.x=24;i.y=42;return i;}

function homeScreen(lib) {
  const s=screenBase("Home / Visual Design");
  const profile=circle("Profile",44,solid(C.ivory,0.14));profile.strokes=[solid(C.ivory,0.24)];profile.x=24;profile.y=42;s.appendChild(profile);const p=txt("Profile Symbol","静",18,C.ivory,fontDisplaySemi);p.x=37;p.y=53;s.appendChild(p);
  const menu=lib.menu.createInstance();menu.x=318;menu.y=42;s.appendChild(menu);
  addTitleBlock(s,"Welcome back","Zen Mahjong","Breathe · Match · Be Present",116);
  const garden=auto("Garden Hero","VERTICAL",6,18);garden.resize(342,228);garden.x=24;garden.y=235;garden.fills=[linear(C.ivory,C.goldPale)];garden.cornerRadius=8;garden.effects=[shadow(C.black,0.22,10,24)];s.appendChild(garden);
  add(garden,txt("Location","MOSS GARDEN",10,C.jade,fontUISemi)); add(garden,txt("Hero title","A quiet board is waiting",25,C.ink,fontDisplaySemi)); add(garden,fixedText("Hero body","Continue Garden 12 with your progress saved on this device.",12,C.inkSoft,280,fontUI,"LEFT",18));
  const motif=figma.createFrame();motif.resize(120,90);motif.fills=[];motif.x=203;motif.y=116;garden.appendChild(motif);createLotus(motif,60,46,0.75,C.red);
  const cta=makeButtonInstance(lib.buttons[0],"Continue",32,487,326);s.appendChild(cta);const sub=txt("CTA Caption","Resume your current board",11,C.ivoryDim,fontUI,"CENTER");sub.x=(390-sub.width)/2;sub.y=546;s.appendChild(sub);
  const daily=auto("Daily Challenge Card","VERTICAL",7,16);daily.resize(342,108);daily.x=24;daily.y=582;daily.fills=[solid(C.ivory,0.95)];daily.cornerRadius=8;s.appendChild(daily);add(daily,txt("Kicker","DAILY CHALLENGE · SEP 21",9,C.jade,fontUISemi));add(daily,txt("Title","Moon Garden",18,C.ink,fontDisplaySemi));add(daily,txt("Status","Easy · 12 min · 20 petals",11,C.inkSoft));pill(daily,"Not started",226,14,C.jade);
  const row=auto("Summary Row","HORIZONTAL",12,0);row.x=24;row.y=708;s.appendChild(row);for(const [a,b] of [["7 days","Current streak"],["Garden 12","Journey"]]){const card=auto("Summary","VERTICAL",4,14);card.resize(165,88);card.fills=[solid(C.glass,0.78)];card.cornerRadius=8;card.strokes=[solid(C.ivory,0.12)];add(card,txt("Value",a,20,C.ivory,fontDisplaySemi));add(card,txt("Caption",b,11,C.ivoryDim));row.appendChild(card);} return s;
}

function loadingScreen(lib, mode) {
  const s=screenBase("Loading / "+mode);createLotus(s,195,265,0.9,mode==="OfflineBlocked"?C.goldPale:C.ivory);
  const title=txt("Title","Zen Mahjong",42,C.ivory,fontDisplaySemi,"CENTER");title.x=(390-title.width)/2;title.y=332;s.appendChild(title);
  const tag=txt("Tagline","Breathe · Match · Be Present",14,C.goldPale,fontUI,"CENTER");tag.x=(390-tag.width)/2;tag.y=389;s.appendChild(tag);
  if(mode==="Online"){const status=txt("Status","Preparing your garden…",13,C.ivoryDim,fontUI,"CENTER");status.x=(390-status.width)/2;status.y=540;s.appendChild(status);const tr=box("Progress Track",160,3,C.inkSoft,2);tr.x=115;tr.y=578;s.appendChild(tr);const pr=box("Progress",104,3,C.gold,2);pr.x=115;pr.y=578;s.appendChild(pr);}
  else if(mode==="Offline"){const st=lib.statusOff.createInstance();st.x=137;st.y=512;s.appendChild(st);const body=fixedText("Body","Your progress stays on this device and will sync when you reconnect.",13,C.ivoryDim,300,fontUI,"CENTER",19);body.x=45;body.y=560;s.appendChild(body);}
  else {const h=fixedText("Heading","Internet needed for first setup",24,C.ivory,310,fontUISemi,"CENTER",30);h.x=40;h.y=493;s.appendChild(h);const b=fixedText("Body","Connect once to complete setup. After that, Mahjong can be played offline.",13,C.ivoryDim,300,fontUI,"CENTER",19);b.x=45;b.y=563;s.appendChild(b);const btn=makeButtonInstance(lib.buttons[0],"Try Again",32,650,326);s.appendChild(btn);} return s;
}

function gameplayScreen(lib,w=390,h=844,name="Gameplay / Main") {
  const s=screenBase(name,w,h);const title=txt("Game Title","Zen Mahjong",28,C.ivory,fontDisplaySemi);title.x=24;title.y=42;s.appendChild(title);const tag=txt("Tagline","Breathe · Match · Be Present",11,C.goldPale);tag.x=24;tag.y=76;s.appendChild(tag);const menu=lib.menu.createInstance();menu.x=w-72;menu.y=38;s.appendChild(menu);
  const boardW=Math.min(w-36,354), tileW=46, tileH=64, center=w/2;const board=figma.createFrame();board.name="Mahjong Board";board.resize(boardW,500);board.x=(w-boardW)/2;board.y=132;board.fills=[];board.clipsContent=false;s.appendChild(board);
  const motifs=lib.artwork;const positions=[];for(let r=0;r<6;r++){const count=r===0||r===5?4:(r===1||r===4?6:7);const y=26+r*66;for(let col=0;col<count;col++){const x=(boardW-count*44)/2+col*44+(r%2?1:0);positions.push([x,y,r,col]);}}
  positions.forEach((p,idx)=>{const state=idx%11===0?4:(idx%7===0?2:0);const inst=lib.tileComps[state].createInstance();inst.name="Tile / "+idx;inst.x=p[0];inst.y=p[1];const art=inst.findOne(n=>n.type==="INSTANCE"&&n.name==="Artwork");if(art)art.swapComponent(motifs[idx%motifs.length]);board.appendChild(inst);});
  const dock=figma.createFrame();dock.name="Game / Bottom Dock";dock.resize(w-32,112);dock.x=16;dock.y=h-136;dock.fills=[solid(C.glass,0.88)];dock.cornerRadius=34;dock.strokes=[solid(C.ivory,0.2)];dock.strokeWeight=1;dock.effects=[shadow(C.black,0.24,12,28),{type:"BACKGROUND_BLUR",radius:18,visible:true}];s.appendChild(dock);
  lib.actions.forEach((a,i)=>{const ins=a.createInstance();ins.x=12+i*((w-56)/4);ins.y=20;dock.appendChild(ins);});return s;
}

function secondaryBase(name,title,lib){const s=screenBase(name);s.appendChild(makeHeaderInstance(lib.header,title));return s;}
function metricInstance(lib,value,caption){const i=lib.metric.createInstance();override(i,"Value",value);override(i,"Caption",caption);return i;}

function profileScreen(lib){const s=secondaryBase("Profile / Visual Design","Profile",lib);const avatar=circle("Avatar",82,solid(C.goldPale,0.95));avatar.x=154;avatar.y=126;s.appendChild(avatar);const av=txt("Avatar Symbol","静",31,C.jade,fontDisplaySemi);av.x=176;av.y=146;s.appendChild(av);const nm=txt("Name","Kumar",26,C.ivory,fontDisplaySemi,"CENTER");nm.x=(390-nm.width)/2;nm.y=222;s.appendChild(nm);const stage=txt("Journey","Garden 12 · Moss Sanctuary",12,C.goldPale,fontUI,"CENTER");stage.x=(390-stage.width)/2;stage.y=258;s.appendChild(stage);const grid=auto("Stats Grid","HORIZONTAL",12,0);grid.layoutWrap="WRAP";grid.counterAxisSpacing=12;grid.resize(342,190);grid.x=24;grid.y=303;s.appendChild(grid);[["128","Boards"],["18h 24m","Play time"],["18 days","Best streak"],["24","Daily challenges"]].forEach(x=>grid.appendChild(metricInstance(lib,x[0],x[1])));const hi=auto("Latest Achievement","VERTICAL",6,16);hi.resize(342,104);hi.x=24;hi.y=519;hi.fills=[solid(C.ivory,0.96)];hi.cornerRadius=8;s.appendChild(hi);add(hi,txt("Kicker","LATEST ACHIEVEMENT",9,C.jade,fontUISemi));add(hi,txt("Title","Still Mind",19,C.ink,fontDisplaySemi));add(hi,txt("Body","Completed a board without hints",11,C.inkSoft));const b1=makeButtonInstance(lib.buttons[3],"Achievements",24,649,165);s.appendChild(b1);const b2=makeButtonInstance(lib.buttons[3],"Streak History",201,649,165);s.appendChild(b2);const st=lib.statusOn.createInstance();st.x=137;st.y=733;s.appendChild(st);return s;}

function settingsScreen(lib){const s=secondaryBase("Settings / Visual Design","Settings",lib);const labels=[["AUDIO","Music","Soft instrumental score"],["","Ambient sound","Garden atmosphere"],["","Sound effects","Tile and control feedback"],["GAMEPLAY","Haptics","Gentle tactile feedback"],["","Reduced motion","Simplify decorative motion"],["NOTIFICATIONS","Daily reminders","A quiet invitation to play"],["PRIVACY & DATA","Cloud sync","Keep progress up to date"]];let y=116;for(const [sec,title,desc] of labels){if(sec){const t=txt("Section",sec,10,C.goldPale,fontUISemi);t.letterSpacing={value:1.4,unit:"PIXELS"};t.x=24;t.y=y;s.appendChild(t);y+=24;}const row=lib.settings.createInstance();row.x=24;row.y=y;override(row,"Title",title);override(row,"Description",desc);s.appendChild(row);y+=70;}const foot=txt("Version","Zen Mahjong 1.0.0 · Privacy · Help",10,C.ivoryDim,fontUI,"CENTER");foot.x=(390-foot.width)/2;foot.y=806;s.appendChild(foot);return s;}

function completionScreen(lib){const s=screenBase("Level Completion / Visual Design");createLotus(s,195,136,0.7,C.goldPale);const h=txt("Title","Board complete",34,C.ivory,fontDisplaySemi,"CENTER");h.x=(390-h.width)/2;h.y=192;s.appendChild(h);const sub=txt("Board","Moss Garden · Board 12",12,C.goldPale,fontUI,"CENTER");sub.x=(390-sub.width)/2;sub.y=236;s.appendChild(sub);const stats=auto("Completion Stats","HORIZONTAL",12,0);stats.x=24;stats.y=282;s.appendChild(stats);stats.appendChild(metricInstance(lib,"08:42","Time"));stats.appendChild(metricInstance(lib,"1","Hint used"));const prog=auto("Progress Card","VERTICAL",10,18);prog.resize(342,132);prog.x=24;prog.y=390;prog.fills=[solid(C.ivory,0.96)];prog.cornerRadius=8;s.appendChild(prog);add(prog,txt("Kicker","JOURNEY PROGRESS",9,C.jade,fontUISemi));add(prog,txt("Title","Garden 12 → Garden 13",20,C.ink,fontDisplaySemi));const meter=figma.createFrame();meter.name="Progress Meter";meter.resize(306,7);meter.fills=[];meter.clipsContent=true;meter.cornerRadius=4;meter.appendChild(box("Track",306,7,C.ivoryDim,4));meter.appendChild(box("Fill",248,7,C.jade,4));prog.appendChild(meter);const reward=auto("Reward","HORIZONTAL",12,14);reward.resize(342,76);reward.x=24;reward.y=542;reward.fills=[solid(C.glass,0.82)];reward.cornerRadius=8;s.appendChild(reward);const coin=circle("Petal",36,C.gold);reward.appendChild(coin);add(reward,txt("Reward Text","+20 petals · Quiet Beginning unlocked",12,C.ivory,fontUISemi));const btn=makeButtonInstance(lib.buttons[0],"Continue",32,658,326);s.appendChild(btn);const home=makeButtonInstance(lib.buttons[3],"Home",32,722,326);s.appendChild(home);return s;}

function achievementsScreen(lib){const s=secondaryBase("Achievements / Visual Design","Achievements",lib);const count=txt("Count","24 / 60",34,C.ivory,fontDisplaySemi);count.x=24;count.y=118;s.appendChild(count);const cap=txt("Caption","achievements discovered",11,C.ivoryDim);cap.x=24;cap.y=158;s.appendChild(cap);const tr=box("Overall Track",342,7,C.inkSoft,4);tr.x=24;tr.y=188;s.appendChild(tr);const pr=box("Overall Progress",137,7,C.gold,4);pr.x=24;pr.y=188;s.appendChild(pr);const filters=auto("Filters","HORIZONTAL",8,0);filters.x=24;filters.y=217;s.appendChild(filters);for(const [l,f] of [["All",C.gold],["Journey",C.glass],["Mastery",C.glass],["Streak",C.glass]]){const p=auto("Filter","HORIZONTAL",0,9);p.cornerRadius=16;p.fills=[solid(f,0.9)];p.appendChild(txt("Label",l,10,l==="All"?C.canvasDeep:C.ivory,fontUISemi));filters.appendChild(p);}let y=272;[[lib.achievements[1],"Quiet Beginning","Complete 10 boards"],[lib.achievements[2],"Still Mind","Complete a board without hints"],[lib.achievements[0],"Bamboo Path","Complete a 14-day streak"],[lib.achievements[3],"Moon Garden","Complete 7 Daily Challenges"]].forEach(([comp,title,desc])=>{const i=comp.createInstance();i.x=24;i.y=y;override(i,"Title",title);override(i,"Description",desc);s.appendChild(i);y+=116;});return s;}

function streaksScreen(lib){const s=secondaryBase("Streaks / Visual Design","Streaks",lib);const hero=auto("Streak Hero","VERTICAL",8,20);hero.resize(342,168);hero.x=24;hero.y=116;hero.fills=[linear(C.ivory,C.goldPale)];hero.cornerRadius=8;s.appendChild(hero);add(hero,txt("Kicker","CURRENT STREAK",10,C.jade,fontUISemi));add(hero,txt("Value","7 days",42,C.ink,fontDisplaySemi));add(hero,txt("Body","One completed board each local day",11,C.inkSoft));createLotus(hero,278,86,0.55,C.red);const weekly=auto("Weekly Activity","VERTICAL",14,18);weekly.resize(342,130);weekly.x=24;weekly.y=306;weekly.fills=[solid(C.glass,0.82)];weekly.cornerRadius=8;s.appendChild(weekly);add(weekly,txt("Title","This week",16,C.ivory,fontUISemi));const days=auto("Days","HORIZONTAL",14,0);weekly.appendChild(days);["M","T","W","T","F","S","S"].forEach((d,i)=>{const col=auto("Day","VERTICAL",5,0);const e=circle("Status",26,i<6?C.jadePale:C.gold);col.appendChild(e);const l=txt("Label",d,9,C.ivory,fontUISemi,"CENTER");l.x=9;col.appendChild(l);days.appendChild(col);});const milestone=auto("Milestone","VERTICAL",8,18);milestone.resize(342,112);milestone.x=24;milestone.y=458;milestone.fills=[solid(C.ivory,0.96)];milestone.cornerRadius=8;s.appendChild(milestone);add(milestone,txt("Kicker","NEXT MILESTONE",9,C.jade,fontUISemi));add(milestone,txt("Title","10 days",24,C.ink,fontDisplaySemi));add(milestone,txt("Body","3 calm days to go",11,C.inkSoft));const cal=auto("Calendar","VERTICAL",12,18);cal.resize(342,202);cal.x=24;cal.y=592;cal.fills=[solid(C.ivory,0.96)];cal.cornerRadius=8;s.appendChild(cal);add(cal,txt("Title","September 2026",16,C.ink,fontUISemi));for(let r=0;r<4;r++){const row=auto("Week","HORIZONTAL",12,0);for(let d=0;d<7;d++){const n=r*7+d+1;const cell=figma.createFrame();cell.name="Calendar Day";cell.resize(28,28);cell.fills=[];cell.clipsContent=false;const day=circle("Day Surface",28,n<=21?(n===21?C.gold:C.jadePale):C.ivoryDim);cell.appendChild(day);const num=txt("Number",String(n),9,C.ink,fontUISemi,"CENTER");num.x=(28-num.width)/2;num.y=8;cell.appendChild(num);row.appendChild(cell);}cal.appendChild(row);}return s;}

async function createScreenPage(page, lib) {
  await figma.setCurrentPageAsync(page); clearGenerated(page);
  const screens=[loadingScreen(lib,"Online"),loadingScreen(lib,"Offline"),loadingScreen(lib,"OfflineBlocked"),homeScreen(lib),profileScreen(lib),settingsScreen(lib),completionScreen(lib),achievementsScreen(lib),streaksScreen(lib)];
  screens.forEach((s,i)=>{s.x=(i%5)*440;s.y=Math.floor(i/5)*920;page.appendChild(s);});
}

async function createGameplayPage(page,lib){await figma.setCurrentPageAsync(page);clearGenerated(page);const s=gameplayScreen(lib);s.x=0;s.y=0;page.appendChild(s);}
async function createResponsivePage(page,lib){await figma.setCurrentPageAsync(page);clearGenerated(page);const a=gameplayScreen(lib,360,800,"Gameplay / Compact 360");const b=gameplayScreen(lib,390,844,"Gameplay / Base 390");const c=gameplayScreen(lib,430,932,"Gameplay / Large 430");a.x=0;b.x=420;c.x=870;page.appendChild(a);page.appendChild(b);page.appendChild(c);}

async function createFlowPage(page){await figma.setCurrentPageAsync(page);clearGenerated(page);const f=mark(figma.createFrame());f.name="HF / Product Flow";f.resize(1500,1000);f.fills=[solid(C.paper)];page.appendChild(f);const title=txt("Title","Zen Mahjong player flow",42,C.ink,fontDisplaySemi);title.x=48;title.y=42;f.appendChild(title);const nodes=[["Launch",80,170],["Loading",300,170],["Home",540,170],["Gameplay",800,170],["Completion",1060,170],["Profile",410,430],["Settings",650,430],["Achievements",890,430],["Streaks",1130,430]];const boxes={};for(const [label,x,y] of nodes){const n=auto("Flow / "+label,"VERTICAL",5,16);n.resize(170,82);n.x=x;n.y=y;n.fills=[solid(label==="Home"||label==="Gameplay"?C.jade:C.ivory)];n.cornerRadius=8;n.strokes=[solid(C.line)];n.appendChild(txt("Title",label,17,label==="Home"||label==="Gameplay"?C.ivory:C.ink,fontUISemi));f.appendChild(n);boxes[label]=n;}const links=[["Launch","Loading"],["Loading","Home"],["Home","Gameplay"],["Gameplay","Completion"],["Completion","Gameplay"],["Home","Profile"],["Home","Settings"],["Home","Achievements"],["Home","Streaks"]];for(const [a,b] of links){const A=boxes[a],B=boxes[b];const l=figma.createLine();l.name=`${a} → ${b}`;const x1=A.x+A.width/2,y1=A.y+A.height/2,x2=B.x+B.width/2,y2=B.y+B.height/2;l.x=x1;l.y=y1;l.resize(Math.hypot(x2-x1,y2-y1),0);l.rotation=Math.atan2(y2-y1,x2-x1)*180/Math.PI;l.strokes=[solid(C.jade,0.7)];l.strokeWeight=2;f.insertChild(0,l);} }

async function createCover(page){await figma.setCurrentPageAsync(page);clearGenerated(page);const f=mark(figma.createFrame());f.name="HF / Cover";f.resize(1440,900);f.fills=[linear(C.canvas,C.canvasDeep)];page.appendChild(f);createLotus(f,720,230,1.35,C.goldPale);const t=txt("Title","Zen Mahjong",78,C.ivory,fontDisplaySemi,"CENTER");t.x=(1440-t.width)/2;t.y=338;f.appendChild(t);const sub=txt("Subtitle","Calm play, crafted with intention",22,C.goldPale,fontUI,"CENTER");sub.x=(1440-sub.width)/2;sub.y=438;f.appendChild(sub);const tag=auto("Tag","HORIZONTAL",0,12);tag.cornerRadius=20;tag.fills=[solid(C.glass,0.8)];tag.appendChild(txt("Label","MOBILE UI · COMPONENT SYSTEM · RESPONSIVE",11,C.ivory,fontUISemi));tag.x=(1440-tag.width)/2;tag.y=520;f.appendChild(tag);}

async function createHandoff(page){await figma.setCurrentPageAsync(page);clearGenerated(page);const f=mark(auto("HF / Handoff","VERTICAL",24,40));f.resize(1180,760);f.fills=[solid(C.paper)];page.appendChild(f);add(f,txt("Title","Implementation handoff",42,C.ink,fontDisplaySemi));add(f,fixedText("Intro","The visual system uses local Figma components, semantic state variants and responsive gameplay frames. Preserve the board as the dominant visual element and reduce atmosphere before shrinking tile readability.",15,C.inkSoft,920,fontUI,"LEFT",23));for(const [head,body] of [["Layout","Base frame 390 × 844. Minimum touch target 44 px. Board side margins 18–24 px. Bottom dock remains within the safe area."],["Tile behavior","Selected lifts 2–4 px with restrained gold illumination. Blocked reduces prominence without disappearing. Available never glows continuously."],["Motion","Press 80 ms. Selected elevation 150–180 ms. Pair removal 250–350 ms. Use slow, tactile easing and respect Reduced Motion."],["Accessibility","Do not rely on color alone. Maintain readable motif scale at 40–50 px. Keep critical labels at accessible contrast on sage surfaces."]]){const card=auto("Note / "+head,"VERTICAL",8,18);card.resize(920,100);card.fills=[solid(C.ivory)];card.cornerRadius=8;add(card,txt("Heading",head,18,C.ink,fontUISemi));add(card,fixedText("Body",body,13,C.inkSoft,860,fontUI,"LEFT",20));f.appendChild(card);} }

function flowPanel() {
  const f=figma.createFrame();f.name="Prototype Flow";f.resize(980,650);f.fills=[solid(C.paper)];f.cornerRadius=12;
  const title=txt("Title","Player journey",34,C.ink,fontDisplaySemi);title.x=36;title.y=30;f.appendChild(title);
  const nodes=[["Launch",44,126],["Loading",238,126],["Home",432,126],["Gameplay",626,126],["Complete",820,126],["Profile",238,354],["Settings",432,354],["Achievements",626,354],["Streaks",820,354]];const boxes={};
  for(const [label,x,y] of nodes){const n=figma.createFrame();n.name="Flow / "+label;n.resize(142,72);n.x=x;n.y=y;n.fills=[solid(label==="Home"||label==="Gameplay"?C.jade:C.ivory)];n.cornerRadius=8;n.strokes=[solid(C.line)];n.strokeWeight=1;const t=txt("Label",label,14,label==="Home"||label==="Gameplay"?C.ivory:C.ink,fontUISemi,"CENTER");t.x=(142-t.width)/2;t.y=26;n.appendChild(t);f.appendChild(n);boxes[label]=n;}
  const links=[["Launch","Loading"],["Loading","Home"],["Home","Gameplay"],["Gameplay","Complete"],["Home","Profile"],["Home","Settings"],["Home","Achievements"],["Home","Streaks"]];
  for(const [a,b] of links){const A=boxes[a],B=boxes[b],x1=A.x+A.width/2,y1=A.y+A.height/2,x2=B.x+B.width/2,y2=B.y+B.height/2;const l=figma.createLine();l.name=`${a} to ${b}`;l.x=x1;l.y=y1;l.resize(Math.hypot(x2-x1,y2-y1),0);l.rotation=Math.atan2(y2-y1,x2-x1)*180/Math.PI;l.strokes=[solid(C.jade,0.65)];l.strokeWeight=2;f.insertChild(0,l);}
  const note=fixedText("Note","Home remains the navigation root. Gameplay stays focused, and completion returns to either the next board or Home.",13,C.inkSoft,880,fontUI,"LEFT",20);note.x=44;note.y=550;f.appendChild(note);return f;
}

function handoffPanel(){const f=auto("Production Handoff","VERTICAL",20,32);f.resize(980,650);f.fills=[solid(C.paper)];f.cornerRadius=12;add(f,txt("Title","Production rules",34,C.ink,fontDisplaySemi));add(f,fixedText("Intro","Every screen is built from local component instances and follows the semantic foundation. The Mahjong board remains the dominant interaction surface.",14,C.inkSoft,850,fontUI,"LEFT",21));for(const [head,body] of [["Layout","390 × 844 base. 24 px screen margins. 44 px minimum touch targets. Safe-area aware header and dock."],["Contrast","Ink on ivory and ivory on canvas are primary text pairs. Gold is emphasis, never small body copy on ivory."],["Responsive","Reduce botanical atmosphere before tile scale. Preserve tile recognition and board reachability at 360 px."],["Motion","Press 80 ms, select 150–180 ms, removal 250–350 ms. Reduced Motion replaces travel with opacity."],["Accessibility","Selection combines lift, edge, and shadow. Status never depends on red or green alone."]]){const card=auto("Rule / "+head,"VERTICAL",6,14);card.resize(850,82);card.fills=[solid(C.ivory)];card.cornerRadius=8;add(card,txt("Heading",head,15,C.ink,fontUISemi));add(card,fixedText("Body",body,12,C.inkSoft,800,fontUI,"LEFT",18));f.appendChild(card);}return f;}

async function createProductionScreens(page,lib){
  await figma.setCurrentPageAsync(page);clearGenerated(page);
  const existingRight=Math.max(0,...page.children.map(n=>n.x+n.width));
  const root=mark(figma.createFrame());root.name="Production Design · Zen Mahjong";root.resize(2780,5660);root.x=existingRight+240;root.y=0;root.fills=[solid("#E7E8E4")];root.cornerRadius=12;root.clipsContent=false;page.appendChild(root);
  const cover=figma.createFrame();cover.name="Production Cover";cover.resize(2660,500);cover.x=60;cover.y=60;cover.fills=[linear(C.canvas,C.canvasDeep)];cover.cornerRadius=12;root.appendChild(cover);createLotus(cover,1330,145,0.95,C.goldPale);const ct=txt("Title","Zen Mahjong",64,C.ivory,fontDisplaySemi,"CENTER");ct.x=(2660-ct.width)/2;ct.y=228;cover.appendChild(ct);const cs=txt("Subtitle","Production mobile system · calm, tactile, botanical",18,C.goldPale,fontUI,"CENTER");cs.x=(2660-cs.width)/2;cs.y=318;cover.appendChild(cs);
  const headings=[["Gameplay foundation",60,610],["Core screens",60,1600],["Progress and preferences",60,2520],["Long-term engagement",60,3440],["Responsive validation",60,4360]];for(const [v,x,y] of headings){const t=txt("Section Label",v,26,C.ink,fontDisplaySemi);t.x=x;t.y=y;root.appendChild(t);}
  const game=gameplayScreen(lib);game.x=60;game.y=680;root.appendChild(game);const flow=flowPanel();flow.x=520;flow.y=680;root.appendChild(flow);const hand=handoffPanel();hand.x=1540;hand.y=680;root.appendChild(hand);
  const core=[loadingScreen(lib,"Online"),loadingScreen(lib,"Offline"),loadingScreen(lib,"OfflineBlocked"),homeScreen(lib)];core.forEach((s,i)=>{s.x=60+i*440;s.y=1660;root.appendChild(s);});
  const mid=[profileScreen(lib),settingsScreen(lib),completionScreen(lib)];mid.forEach((s,i)=>{s.x=60+i*440;s.y=2580;root.appendChild(s);});
  const long=[achievementsScreen(lib),streaksScreen(lib)];long.forEach((s,i)=>{s.x=60+i*440;s.y=3500;root.appendChild(s);});
  const compact=gameplayScreen(lib,360,800,"Gameplay / Compact 360");compact.x=60;compact.y=4420;root.appendChild(compact);const base=gameplayScreen(lib,390,844,"Gameplay / Base 390");base.x=470;base.y=4420;root.appendChild(base);const large=gameplayScreen(lib,430,932,"Gameplay / Large 430");large.x=910;large.y=4420;root.appendChild(large);
  const qa=auto("QA Checklist","VERTICAL",10,24);qa.resize(900,420);qa.x=1420;qa.y=4420;qa.fills=[solid(C.paper)];qa.cornerRadius=12;add(qa,txt("Title","Production QA",28,C.ink,fontDisplaySemi));for(const item of ["Semantic color variables applied","Component instances used across screens","44 px minimum touch targets","360 / 390 / 430 responsive frames","Selection visible without color alone","Offline, disabled and exception states present","No text overflow at mobile widths"]){const row=auto("Check","HORIZONTAL",10,0);row.appendChild(circle("Checkmark",16,C.jade));row.appendChild(txt("Item",item,13,C.ink,fontUI));qa.appendChild(row);}root.appendChild(qa);
  return root;
}

async function main(){
  await chooseFonts();
  const foundations=figma.root.children.find(p=>p.name==="01 Foundations")||figma.root.children[0];
  const components=figma.root.children.find(p=>p.name==="02 Components")||figma.root.children[1];
  const screens=figma.root.children.find(p=>p.name==="03 Screens")||figma.root.children[2];
  if(!foundations||!components||!screens)throw new Error("Expected the existing Foundations, Components and Screens pages.");
  const vars=await setupVariables();await setupStyles();
  const foundationRoot=await createFoundations(foundations);
  const lib=await createComponents(components);
  const screensRoot=await createProductionScreens(screens,lib);
  bindTree(foundationRoot,vars.colors);bindTree(lib.board,vars.colors);bindTree(screensRoot,vars.colors);
  await figma.setCurrentPageAsync(screens);
  figma.viewport.scrollAndZoomIntoView([screensRoot]);
  figma.closePlugin("Zen Mahjong production system created");
}

main().catch(err=>{figma.closePlugin("Build failed: "+(err&&err.message?err.message:String(err)));});
