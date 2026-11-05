const page = await figma.getNodeByIdAsync("2:3");
await figma.setCurrentPageAsync(page);

const createdNodeIds = [];
const mutatedNodeIds = [];
const SECTION_NAME = "Concentration System · Screen Design Updates";

const existing = page.children.find((node) => node.type === "SECTION" && node.name === SECTION_NAME);
if (existing) existing.remove();

const baseGameplay = await figma.getNodeByIdAsync("7:19");
const tileSet = await figma.getNodeByIdAsync("3:75");
const artworkSet = await figma.getNodeByIdAsync("3:27");
const buttonSet = await figma.getNodeByIdAsync("3:94");

if (!baseGameplay || baseGameplay.type !== "FRAME") throw new Error("Gameplay source frame is unavailable.");
if (!tileSet || tileSet.type !== "COMPONENT_SET") throw new Error("Mahjong tile component set is unavailable.");
if (!artworkSet || artworkSet.type !== "COMPONENT_SET") throw new Error("Tile artwork component set is unavailable.");
if (!buttonSet || buttonSet.type !== "COMPONENT_SET") throw new Error("Button component set is unavailable.");

const tileDefault = tileSet.children.find((node) => node.type === "COMPONENT" && node.name === "State=Default");
const tileHinted = tileSet.children.find((node) => node.type === "COMPONENT" && node.name === "State=Hinted");
const artworks = artworkSet.children.filter((node) => node.type === "COMPONENT");

const COLORS = {
  deep: "#123127",
  canvas: "#173C2F",
  forest: "#315B47",
  glass: "#29483D",
  jade: "#2F765A",
  jadeSoft: "#A7C8B2",
  ivory: "#FBF7EB",
  paper: "#F3ECDD",
  shadow: "#D8CDB4",
  gold: "#B99A58",
  goldSoft: "#E8DDBD",
  red: "#A43A32",
  ink: "#1D332B",
  inkSoft: "#5D6F66",
  line: "#D7CCB4",
};

const rgb = (hex) => {
  const value = parseInt(hex.replace("#", ""), 16);
  return {
    r: ((value >> 16) & 255) / 255,
    g: ((value >> 8) & 255) / 255,
    b: (value & 255) / 255,
  };
};
const solid = (hex, opacity = 1) => ({ type: "SOLID", color: rgb(hex), opacity });

const display = { family: "Cormorant Garamond", style: "Medium" };
const regular = { family: "Inter", style: "Regular" };
const semi = { family: "Inter", style: "Semi Bold" };
await Promise.all([figma.loadFontAsync(display), figma.loadFontAsync(regular), figma.loadFontAsync(semi)]);

function add(parent, node) {
  parent.appendChild(node);
  createdNodeIds.push(node.id);
  return node;
}

function text(parent, name, value, size, color, font = regular) {
  const node = figma.createText();
  node.name = name;
  node.fontName = font;
  node.characters = value;
  node.fontSize = size;
  node.letterSpacing = { unit: "PIXELS", value: 0 };
  node.fills = [solid(color)];
  node.textAutoResize = "WIDTH_AND_HEIGHT";
  return add(parent, node);
}

function rectangle(parent, name, x, y, width, height, fill, radius = 0, opacity = 1) {
  const node = figma.createRectangle();
  node.name = name;
  node.resize(width, height);
  node.x = x;
  node.y = y;
  node.cornerRadius = radius;
  node.fills = fill ? [solid(fill, opacity)] : [];
  return add(parent, node);
}

function frame(parent, name, x, y, width, height, fill, radius = 0) {
  const node = figma.createFrame();
  node.name = name;
  node.resize(width, height);
  node.x = x;
  node.y = y;
  node.cornerRadius = radius;
  node.fills = fill ? [solid(fill)] : [];
  node.clipsContent = false;
  return add(parent, node);
}

function pill(parent, label, x, y, width, fill = COLORS.forest, textColor = COLORS.ivory) {
  const item = frame(parent, "Mode / " + label, x, y, width, 24, fill, 12);
  const labelNode = text(item, "Label", label, 9, textColor, semi);
  labelNode.x = (width - labelNode.width) / 2;
  labelNode.y = 6;
  return item;
}

function addProgress(screen, mode, progress = 0.38) {
  const label = text(screen, "Zen Level Label", "ZEN LEVEL", 9, COLORS.goldSoft, semi);
  label.x = 24;
  label.y = 102;
  pill(screen, mode.toUpperCase(), 244, 96, 122);
  rectangle(screen, "Zen Progress Track", 24, 126, 342, 5, COLORS.forest, 3);
  rectangle(screen, "Zen Progress Fill", 24, 126, Math.max(18, 342 * progress), 5, COLORS.jadeSoft, 3);

  const milestoneValues = [3, 6, 10, 20];
  const milestoneX = [74, 142, 240, 354];
  milestoneValues.forEach((value, index) => {
    const dot = figma.createEllipse();
    dot.name = "Milestone / " + value;
    dot.resize(index < 2 ? 10 : 12, index < 2 ? 10 : 12);
    dot.x = milestoneX[index] - dot.width / 2;
    dot.y = 123;
    dot.fills = [solid(index < 2 ? COLORS.jadeSoft : COLORS.goldSoft)];
    dot.strokes = [solid(COLORS.canvas)];
    dot.strokeWeight = 1;
    add(screen, dot);
    const number = text(screen, "Milestone Label", String(value), 8, COLORS.goldSoft, semi);
    number.x = milestoneX[index] - number.width / 2;
    number.y = 136;
  });
}

function clearSelection(screen) {
  const selected = screen
    .findAllWithCriteria({ types: ["INSTANCE"] })
    .filter((node) => node.name.includes("Tile / Selected"));
  for (const instance of selected) {
    if (tileDefault) instance.swapComponent(tileDefault);
    instance.name = instance.name.replace("Selected", "Default");
    mutatedNodeIds.push(instance.id);
  }
}

function prepareGameplay(name, mode, x, y, progress = 0.38) {
  const screen = baseGameplay.clone();
  screen.name = name;
  section.appendChild(screen);
  createdNodeIds.push(screen.id);
  screen.x = x;
  screen.y = y;
  clearSelection(screen);

  const board = screen.children.find((node) => node.type === "FRAME" && node.name === "Mahjong Board");
  if (board) {
    board.y = 151;
    board.resize(board.width, 406);
    mutatedNodeIds.push(board.id);
  }
  const remaining = screen.children.find((node) => node.type === "TEXT" && node.name === "Remaining");
  if (remaining) {
    remaining.y = 548;
    remaining.characters = "28 tiles remaining";
    remaining.x = (390 - remaining.width) / 2;
    mutatedNodeIds.push(remaining.id);
  }
  const dock = screen.children.find((node) => node.type === "INSTANCE" && node.name === "Product / Bottom Dock");
  if (dock) {
    dock.y = 720;
    mutatedNodeIds.push(dock.id);
  }
  addProgress(screen, mode, progress);
  return screen;
}

function emptySlot(parent, x, label, emphasized = false) {
  const slot = frame(parent, "Tray Slot / " + label, x, 40, 48, 62, null, 7);
  slot.strokes = [solid(emphasized ? COLORS.gold : COLORS.jadeSoft, emphasized ? 0.95 : 0.48)];
  slot.strokeWeight = emphasized ? 2 : 1;
  slot.dashPattern = [4, 4];
  const index = text(slot, "Slot Label", label, 9, emphasized ? COLORS.goldSoft : COLORS.jadeSoft, semi);
  index.x = (48 - index.width) / 2;
  index.y = 26;
  return slot;
}

function occupiedSlot(parent, x, glyphIndex, state = "stored") {
  if (!tileDefault) return emptySlot(parent, x, "–");
  const tile = tileDefault.createInstance();
  tile.name = "Stored Tile / " + state;
  tile.resize(44, 59);
  tile.x = x + 2;
  tile.y = state === "matching" ? 35 : 41;
  if (state === "matching") {
    tile.strokes = [solid(COLORS.gold)];
    tile.effects = [{
      type: "DROP_SHADOW",
      color: { ...rgb(COLORS.gold), a: 0.34 },
      offset: { x: 0, y: 3 },
      radius: 9,
      spread: 0,
      visible: true,
      blendMode: "NORMAL",
    }];
  }
  const art = tile.findAllWithCriteria({ types: ["INSTANCE"] }).find((node) => node.name === "Artwork");
  if (art && artworks.length) art.swapComponent(artworks[glyphIndex % artworks.length]);
  return add(parent, tile);
}

function addTray(screen, state, uses, options = {}) {
  const tray = frame(screen, "Concentration Tray / " + state, 20, 576, 350, 126, COLORS.glass, 12);
  tray.strokes = [solid(state === "blocked" ? COLORS.gold : COLORS.ivory, state === "blocked" ? 0.9 : 0.14)];
  tray.strokeWeight = state === "blocked" ? 2 : 1;

  const titleNode = text(tray, "Title", "CONCENTRATION", 9, state === "blocked" ? COLORS.goldSoft : COLORS.jadeSoft, semi);
  titleNode.x = 14;
  titleNode.y = 12;

  const divider = rectangle(tray, "Special Divider", 79, 39, 1, 64, COLORS.ivory, 0, 0.16);
  divider.opacity = 1;

  const special = frame(tray, "Identity / Super Concentration", 14, 39, 54, 64, null, 12);
  special.strokes = [solid(options.specialActive ? COLORS.gold : COLORS.goldSoft, options.specialActive ? 1 : 0.58)];
  special.strokeWeight = options.specialActive ? 2 : 1;
  if (options.specialActive) special.fills = [solid(COLORS.gold, 0.13)];
  const mark = text(special, "Special Mark", options.specialResolving ? "◎" : "◇", 20, COLORS.goldSoft, semi);
  mark.x = (54 - mark.width) / 2;
  mark.y = 9;
  const useText = text(special, "Uses", uses, 9, uses === "0" ? COLORS.shadow : COLORS.ivory, semi);
  useText.x = (54 - useText.width) / 2;
  useText.y = 42;

  const slotX = [92, 150, 208, 266];
  const occupied = options.occupied || 0;
  for (let index = 0; index < 4; index += 1) {
    if (index < occupied) {
      const matching = state === "matching" && index >= occupied - 2;
      occupiedSlot(tray, slotX[index], matching ? 1 : index + 2, matching ? "matching" : "stored");
    } else {
      emptySlot(tray, slotX[index], String(index + 1));
    }
  }

  const helperValue = options.helper || (
    state === "empty" ? "Tap or drag an available tile" :
    state === "matching" ? "PAIR READY · clearing" :
    state === "blocked" ? "TRAY FULL · recovery available" :
    options.specialActive ? "DRAG TO THE SPECIAL SLOT" :
    "Tiles remain in selection order"
  );
  const helper = text(tray, "State Label", helperValue, 9, state === "blocked" ? COLORS.goldSoft : COLORS.ivory, semi);
  helper.x = 92;
  helper.y = 109;

  if (state === "blocked") {
    const warning = figma.createEllipse();
    warning.name = "Blocked Status Icon";
    warning.resize(9, 9);
    warning.x = 328;
    warning.y = 14;
    warning.fills = [solid(COLORS.red)];
    add(tray, warning);
  }
  return tray;
}

function addAnnotation(screen, value, color = COLORS.goldSoft) {
  const badge = frame(screen, "Design State", 24, 154, 170, 25, COLORS.deep, 12);
  badge.strokes = [solid(color, 0.56)];
  const label = text(badge, "Label", value.toUpperCase(), 9, color, semi);
  label.x = 12;
  label.y = 6;
}

const section = figma.createSection();
section.name = SECTION_NAME;
section.resizeWithoutConstraints(2380, 4740);
section.x = 3000;
section.y = 80;
section.fills = [solid("#E7E8E4")];
page.appendChild(section);
createdNodeIds.push(section.id);

const heading = text(section, "Section Title", "Concentration System · Screen Design Updates", 42, COLORS.ink, display);
heading.x = 60;
heading.y = 42;
const subtitle = text(section, "Section Subtitle", "Screen design only · existing mobile system · one-section free-plan update", 14, COLORS.jade, regular);
subtitle.x = 60;
subtitle.y = 98;

function rowLabel(value, y) {
  const label = text(section, "Row Label", value, 24, COLORS.ink, display);
  label.x = 60;
  label.y = y;
}

rowLabel("Concentration Tray states", 150);
rowLabel("Gameplay modes and special slot", 1170);

const columns = [60, 510, 960, 1410, 1860];

const empty = prepareGameplay("Gameplay / Tray / Empty", "Normal", columns[0], 210, 0.28);
addTray(empty, "empty", "2", { occupied: 0 });

const one = prepareGameplay("Gameplay / Tray / One Tile", "Normal", columns[1], 210, 0.31);
addTray(one, "one-tile", "2", { occupied: 1 });

const multiple = prepareGameplay("Gameplay / Tray / Multiple Tiles", "Normal", columns[2], 210, 0.34);
addTray(multiple, "multiple", "2", { occupied: 3 });

const matching = prepareGameplay("Gameplay / Tray / Matching Pair", "Normal", columns[3], 210, 0.38);
addTray(matching, "matching", "2", { occupied: 3 });

const blocked = prepareGameplay("Gameplay / Tray / Blocked", "Normal", columns[4], 210, 0.42);
addTray(blocked, "blocked", "2", { occupied: 4 });

const normal = prepareGameplay("Gameplay / Mode / Normal", "Normal", columns[0], 1230, 0.44);
addTray(normal, "one-tile", "2", { occupied: 1, helper: "2 special uses remaining" });

const high = prepareGameplay("Gameplay / Mode / High Concentration", "High Concentration", columns[1], 1230, 0.48);
addTray(high, "multiple", "1", { occupied: 2, helper: "1 special use remaining" });

const superMode = prepareGameplay("Gameplay / Mode / Super Concentration", "Super Concentration", columns[2], 1230, 0.52);
addTray(superMode, "multiple", "0", { occupied: 2, helper: "Special slot unavailable" });

const relaxation = prepareGameplay("Gameplay / Mode / Special Relaxation", "Special Relaxation", columns[3], 1230, 0.56);
addTray(relaxation, "one-tile", "—", { occupied: 1, helper: "Use count is configurable" });

const resolving = prepareGameplay("Gameplay / Special Slot / Resolving", "Normal", columns[4], 1230, 0.6);
addTray(resolving, "special-resolving", "1", {
  occupied: 2,
  specialActive: true,
  specialResolving: true,
  helper: "MATCH FOUND · resolving pair",
});
addAnnotation(resolving, "Special slot active");

return {
  createdNodeIds,
  mutatedNodeIds,
  sectionId: section.id,
  screenIds: [empty.id, one.id, multiple.id, matching.id, blocked.id, normal.id, high.id, superMode.id, relaxation.id, resolving.id],
  counts: { screens: 10, sections: 1 },
};
