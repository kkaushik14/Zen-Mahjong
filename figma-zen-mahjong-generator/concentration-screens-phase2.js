const page = await figma.getNodeByIdAsync("2:3");
await figma.setCurrentPageAsync(page);

const createdNodeIds = [];
const mutatedNodeIds = [];
const section = await figma.getNodeByIdAsync("__SECTION_ID__");
const baseGameplay = await figma.getNodeByIdAsync("7:19");
const baseCompletion = await figma.getNodeByIdAsync("8:243");
const tileSet = await figma.getNodeByIdAsync("3:75");
const artworkSet = await figma.getNodeByIdAsync("3:27");
const buttonSet = await figma.getNodeByIdAsync("3:94");
const headerComponent = await figma.getNodeByIdAsync("4:11");

if (!section || section.type !== "SECTION") throw new Error("Target screen section is unavailable.");
if (!baseGameplay || baseGameplay.type !== "FRAME") throw new Error("Gameplay source frame is unavailable.");
if (!baseCompletion || baseCompletion.type !== "FRAME") throw new Error("Completion source frame is unavailable.");
if (!tileSet || tileSet.type !== "COMPONENT_SET") throw new Error("Mahjong tile component set is unavailable.");
if (!artworkSet || artworkSet.type !== "COMPONENT_SET") throw new Error("Tile artwork component set is unavailable.");
if (!buttonSet || buttonSet.type !== "COMPONENT_SET") throw new Error("Button component set is unavailable.");

const tileDefault = tileSet.children.find((node) => node.type === "COMPONENT" && node.name === "State=Default");
const artworks = artworkSet.children.filter((node) => node.type === "COMPONENT");
const primaryButton = buttonSet.children.find((node) => node.type === "COMPONENT" && node.name === "Style=Primary, State=Default");
const secondaryButton = buttonSet.children.find((node) => node.type === "COMPONENT" && node.name === "Style=Secondary, State=Default");
const quietButton = buttonSet.children.find((node) => node.type === "COMPONENT" && node.name === "Style=Quiet, State=Default");

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

function fixedText(parent, name, value, size, color, width, font = regular, align = "LEFT", lineHeight = 18) {
  const node = text(parent, name, value, size, color, font);
  node.textAutoResize = "HEIGHT";
  node.resize(width, node.height);
  node.textAlignHorizontal = align;
  node.lineHeight = { unit: "PIXELS", value: lineHeight };
  return node;
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
  const item = frame(parent, "Status / " + label, x, y, width, 24, fill, 12);
  const labelNode = text(item, "Label", label, 9, textColor, semi);
  labelNode.x = (width - labelNode.width) / 2;
  labelNode.y = 6;
  return item;
}

function button(parent, component, label, x, y, width = 318, height = 50) {
  if (!component) return null;
  const instance = component.createInstance();
  instance.name = "Action / " + label;
  instance.resize(width, height);
  instance.x = x;
  instance.y = y;
  add(parent, instance);
  const labelNode = instance.findAllWithCriteria({ types: ["TEXT"] }).find((node) => node.name === "Label");
  if (labelNode) {
    labelNode.characters = label;
    mutatedNodeIds.push(labelNode.id);
  }
  return instance;
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

function addProgress(screen, mode, progress = 0.52, emphasized = false) {
  const label = text(screen, "Zen Level Label", emphasized ? "ZEN LEVEL PROGRESS" : "ZEN LEVEL", 9, COLORS.goldSoft, semi);
  label.x = 24;
  label.y = 102;
  pill(screen, mode.toUpperCase(), 244, 96, 122);
  rectangle(screen, "Zen Progress Track", 24, 126, 342, emphasized ? 8 : 5, COLORS.forest, 4);
  rectangle(screen, "Zen Progress Fill", 24, 126, 342 * progress, emphasized ? 8 : 5, COLORS.jadeSoft, 4);
  const milestoneValues = [3, 6, 10, 20];
  const milestoneX = [74, 142, 240, 354];
  milestoneValues.forEach((value, index) => {
    const dot = figma.createEllipse();
    dot.name = "Milestone / " + value;
    dot.resize(emphasized ? 14 : 11, emphasized ? 14 : 11);
    dot.x = milestoneX[index] - dot.width / 2;
    dot.y = emphasized ? 123 : 124;
    dot.fills = [solid(index < 2 ? COLORS.jadeSoft : COLORS.goldSoft)];
    dot.strokes = [solid(COLORS.canvas)];
    dot.strokeWeight = 1;
    add(screen, dot);
    const number = text(screen, "Milestone Label", String(value), 8, COLORS.goldSoft, semi);
    number.x = milestoneX[index] - number.width / 2;
    number.y = 141;
  });
  if (emphasized) {
    const next = text(screen, "Progress Caption", "NEXT MILESTONE · 10", 9, COLORS.ivory, semi);
    next.x = 24;
    next.y = 151;
  }
}

function emptySlot(parent, x, label) {
  const slot = frame(parent, "Tray Slot / " + label, x, 40, 48, 62, null, 7);
  slot.strokes = [solid(COLORS.jadeSoft, 0.46)];
  slot.strokeWeight = 1;
  slot.dashPattern = [4, 4];
  const index = text(slot, "Slot Label", label, 9, COLORS.jadeSoft, semi);
  index.x = (48 - index.width) / 2;
  index.y = 26;
}

function occupiedSlot(parent, x, glyphIndex, dimmed = false) {
  if (!tileDefault) return;
  const tile = tileDefault.createInstance();
  tile.name = "Stored Tile";
  tile.resize(44, 59);
  tile.x = x + 2;
  tile.y = 41;
  tile.opacity = dimmed ? 0.56 : 1;
  const art = tile.findAllWithCriteria({ types: ["INSTANCE"] }).find((node) => node.name === "Artwork");
  if (art && artworks.length) art.swapComponent(artworks[glyphIndex % artworks.length]);
  add(parent, tile);
}

function addTray(screen, state, uses, occupied = 4, helper = "TRAY FULL · recovery available") {
  const tray = frame(screen, "Concentration Tray / " + state, 20, 576, 350, 126, COLORS.glass, 12);
  tray.strokes = [solid(state === "blocked" ? COLORS.gold : COLORS.ivory, state === "blocked" ? 0.9 : 0.14)];
  tray.strokeWeight = state === "blocked" ? 2 : 1;
  const titleNode = text(tray, "Title", "CONCENTRATION", 9, state === "blocked" ? COLORS.goldSoft : COLORS.jadeSoft, semi);
  titleNode.x = 14;
  titleNode.y = 12;
  rectangle(tray, "Divider", 79, 39, 1, 64, COLORS.ivory, 0, 0.16);
  const special = frame(tray, "Identity Slot", 14, 39, 54, 64, null, 12);
  special.strokes = [solid(COLORS.goldSoft, 0.58)];
  const mark = text(special, "Mark", "◇", 20, COLORS.goldSoft, semi);
  mark.x = (54 - mark.width) / 2;
  mark.y = 9;
  const useText = text(special, "Uses", uses, 9, uses === "0" ? COLORS.shadow : COLORS.ivory, semi);
  useText.x = (54 - useText.width) / 2;
  useText.y = 42;
  const slotX = [92, 150, 208, 266];
  slotX.forEach((x, index) => {
    if (index < occupied) occupiedSlot(tray, x, index + 2, state === "reduced-motion" && index > 1);
    else emptySlot(tray, x, String(index + 1));
  });
  const helperNode = text(tray, "State Label", helper, 9, state === "blocked" ? COLORS.goldSoft : COLORS.ivory, semi);
  helperNode.x = 92;
  helperNode.y = 109;
  if (state === "blocked" || state === "accessible-blocked") {
    const icon = text(tray, "Blocked Icon", "!", 12, COLORS.ivory, semi);
    icon.x = 326;
    icon.y = 10;
  }
}

function prepareGameplay(name, mode, x, y, progress = 0.52, emphasized = false) {
  const screen = baseGameplay.clone();
  screen.name = name;
  section.appendChild(screen);
  createdNodeIds.push(screen.id);
  screen.x = x;
  screen.y = y;
  clearSelection(screen);
  const board = screen.children.find((node) => node.type === "FRAME" && node.name === "Mahjong Board");
  if (board) {
    board.y = emphasized ? 172 : 151;
    board.resize(board.width, emphasized ? 386 : 406);
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
  addProgress(screen, mode, progress, emphasized);
  return screen;
}

function addRecoverySheet(screen, type) {
  rectangle(screen, "Modal Scrim", 0, 0, 390, 844, COLORS.deep, 28, 0.48);
  const sheet = frame(screen, "Recovery Sheet / " + type, 12, 458, 366, 386, COLORS.ivory, 16);
  const handle = rectangle(sheet, "Handle", 153, 10, 60, 4, COLORS.shadow, 2);
  handle.opacity = 1;
  const iconCircle = figma.createEllipse();
  iconCircle.name = "Recovery Icon";
  iconCircle.resize(42, 42);
  iconCircle.x = 24;
  iconCircle.y = 36;
  iconCircle.fills = [solid(type === "Offline" ? COLORS.shadow : COLORS.goldSoft)];
  add(sheet, iconCircle);
  const icon = text(sheet, "Icon", type === "Ad" ? "+1" : type === "Score" ? "10" : type === "Offline" ? "⌁" : "↻", 14, type === "Offline" ? COLORS.red : COLORS.jade, semi);
  icon.x = type === "Ad" ? 36 : 37;
  icon.y = 49;

  const titles = {
    Online: "Clear the tray and continue",
    Offline: "Continue offline",
    Ad: "Restore a special use",
    Score: "Use Concentration Score",
  };
  const bodies = {
    Online: "Choose a calm way back into the board.",
    Offline: "Your score can revive this board without a connection.",
    Ad: "Watch a reward ad to restore one special-slot use.",
    Score: "Clear the four stored tiles and continue this board.",
  };
  const heading = text(sheet, "Title", titles[type], 23, COLORS.ink, display);
  heading.x = 82;
  heading.y = 38;
  const body = fixedText(sheet, "Body", bodies[type], 12, COLORS.inkSoft, 258, regular, "LEFT", 17);
  body.x = 82;
  body.y = 69;

  const balance = frame(sheet, "Score Balance", 24, 116, 318, 56, COLORS.paper, 8);
  const balanceLabel = text(balance, "Label", "CONCENTRATION SCORE", 9, COLORS.jade, semi);
  balanceLabel.x = 14;
  balanceLabel.y = 11;
  const balanceValue = text(balance, "Value", "42", 22, COLORS.ink, display);
  balanceValue.x = 14;
  balanceValue.y = 27;
  if (type === "Online") {
    button(sheet, primaryButton, "Watch reward ad", 24, 192);
    button(sheet, secondaryButton, "Use 10 score", 24, 252);
    button(sheet, quietButton, "Restart board", 24, 312, 318, 42);
  } else if (type === "Offline") {
    pill(sheet, "OFFLINE", 246, 132, 82, COLORS.shadow, COLORS.ink);
    button(sheet, primaryButton, "Use 10 score", 24, 208);
    button(sheet, secondaryButton, "Restart board", 24, 270);
  } else if (type === "Ad") {
    pill(sheet, "ONLINE", 252, 132, 76, COLORS.forest, COLORS.ivory);
    button(sheet, primaryButton, "Watch reward ad", 24, 208);
    button(sheet, secondaryButton, "Not now", 24, 270);
  } else {
    const cost = text(balance, "Cost", "COST 10", 10, COLORS.gold, semi);
    cost.x = 244;
    cost.y = 23;
    button(sheet, primaryButton, "Use 10 score", 24, 208);
    button(sheet, secondaryButton, "Restart board", 24, 270);
  }
}

function blankScreen(name, x, y) {
  const screen = figma.createFrame();
  screen.name = name;
  screen.resize(390, 844);
  screen.x = x;
  screen.y = y;
  screen.cornerRadius = 28;
  screen.fills = [solid(COLORS.canvas)];
  screen.clipsContent = true;
  add(section, screen);
  const shadow = figma.createEllipse();
  shadow.name = "Botanical Shadow";
  shadow.resize(430, 430);
  shadow.x = 150;
  shadow.y = 520;
  shadow.fills = [solid(COLORS.deep, 0.44)];
  add(screen, shadow);
  return screen;
}

function addHeader(screen, titleValue) {
  if (headerComponent && headerComponent.type === "COMPONENT") {
    const header = headerComponent.createInstance();
    header.x = 24;
    header.y = 38;
    add(screen, header);
    const titleNode = header.findAllWithCriteria({ types: ["TEXT"] }).find((node) => node.name === "Title");
    if (titleNode) {
      titleNode.characters = titleValue;
      mutatedNodeIds.push(titleNode.id);
    }
  } else {
    const titleNode = text(screen, "Title", titleValue, 28, COLORS.ivory, display);
    titleNode.x = 24;
    titleNode.y = 42;
  }
}

function rowLabel(value, y) {
  const label = text(section, "Row Label", value, 24, COLORS.ink, display);
  label.x = 60;
  label.y = y;
}

const columns = [60, 510, 960, 1410, 1860];
rowLabel("Recovery and continuation states", 2190);
rowLabel("Zen progression and completion", 3210);
rowLabel("Reduced-motion and accessibility", 4230);

const online = prepareGameplay("Recovery / Online", "Normal", columns[0], 2250, 0.62);
addTray(online, "blocked", "2", 4);
addRecoverySheet(online, "Online");

const offline = prepareGameplay("Recovery / Offline", "Normal", columns[1], 2250, 0.62);
addTray(offline, "blocked", "2", 4);
addRecoverySheet(offline, "Offline");

const ad = prepareGameplay("Recovery / Reward Ad Prompt", "Normal", columns[2], 2250, 0.62);
addTray(ad, "blocked", "0", 4, "SPECIAL USE EXHAUSTED");
addRecoverySheet(ad, "Ad");

const score = prepareGameplay("Recovery / Concentration Score", "Normal", columns[3], 2250, 0.62);
addTray(score, "blocked", "2", 4);
addRecoverySheet(score, "Score");

const zen = prepareGameplay("Gameplay / Zen Milestone Progress", "Normal", columns[4], 2250, 0.66, true);
addTray(zen, "multiple", "2", 2, "NEXT MILESTONE · 10");

const completion = baseCompletion.clone();
completion.name = "Completion / Zen Score Breakdown";
section.appendChild(completion);
createdNodeIds.push(completion.id);
completion.x = columns[0];
completion.y = 3270;
const completionTitle = completion.children.find((node) => node.type === "TEXT" && node.name === "Title");
if (completionTitle) {
  completionTitle.characters = "Level complete";
  completionTitle.x = (390 - completionTitle.width) / 2;
  mutatedNodeIds.push(completionTitle.id);
}
const completionSubtitle = completion.children.find((node) => node.type === "TEXT" && node.name === "Subtitle");
if (completionSubtitle) {
  completionSubtitle.characters = "ZEN SCORE";
  completionSubtitle.x = (390 - completionSubtitle.width) / 2;
  mutatedNodeIds.push(completionSubtitle.id);
}
const summary = completion.children.find((node) => node.type === "FRAME" && node.name === "Round Summary");
if (summary) {
  for (const child of [...summary.children]) child.remove();
  const scoreLabel = text(summary, "Score Label", "ZEN SCORE", 10, COLORS.jade, semi);
  scoreLabel.x = 18;
  scoreLabel.y = 18;
  const scoreValue = text(summary, "Score Value", "15", 52, COLORS.ink, display);
  scoreValue.x = 18;
  scoreValue.y = 40;
  const rows = [["Level cleared", "+10"], ["No hint", "+5"], ["Reward bonus", "+0"]];
  rows.forEach(([label, value], index) => {
    const row = text(summary, "Breakdown", label, 11, COLORS.inkSoft, regular);
    row.x = 132;
    row.y = 30 + index * 35;
    const amount = text(summary, "Amount", value, 12, index === 1 ? COLORS.jade : COLORS.ink, semi);
    amount.x = 278;
    amount.y = 29 + index * 35;
  });
  const foot = text(summary, "Caption", "Whole-number presentation", 9, COLORS.inkSoft, regular);
  foot.x = 18;
  foot.y = 151;
  mutatedNodeIds.push(summary.id);
}

function topTitle(screen, kickerValue, titleValue, bodyValue) {
  const kicker = text(screen, "Kicker", kickerValue, 10, COLORS.goldSoft, semi);
  kicker.x = 24;
  kicker.y = 116;
  const titleNode = fixedText(screen, "Title", titleValue, 34, COLORS.ivory, 342, display, "LEFT", 40);
  titleNode.x = 24;
  titleNode.y = 144;
  const body = fixedText(screen, "Body", bodyValue, 12, COLORS.shadow, 342, regular, "LEFT", 18);
  body.x = 24;
  body.y = 232;
}

const tier = blankScreen("Progression / Eight-Level Summary", columns[1], 3270);
addHeader(tier, "Tier summary");
topTitle(tier, "8 LEVELS COMPLETE", "A composed journey", "Review each Zen Score before moving into the next grade.");
const grid = frame(tier, "Eight Level Grid", 24, 300, 342, 246, COLORS.ivory, 8);
const values = [10, 14, 15, 18, 12, 16, 14, 20];
values.forEach((value, index) => {
  const cell = frame(grid, "Level / " + (index + 1), 14 + (index % 4) * 80, 16 + Math.floor(index / 4) * 108, 70, 92, index === 7 ? COLORS.goldSoft : COLORS.paper, 8);
  const level = text(cell, "Level", String(index + 1), 10, COLORS.jade, semi);
  level.x = 10;
  level.y = 10;
  const scoreValue = text(cell, "Score", String(value), 28, COLORS.ink, display);
  scoreValue.x = 10;
  scoreValue.y = 31;
  const unit = text(cell, "Unit", "ZEN", 8, COLORS.inkSoft, semi);
  unit.x = 10;
  unit.y = 68;
});
const tierCard = frame(tier, "Tier Footer", 24, 572, 342, 106, COLORS.forest, 8);
const tierLabel = text(tierCard, "Label", "TIER COMPLETE", 9, COLORS.goldSoft, semi);
tierLabel.x = 16;
tierLabel.y = 16;
const tierValue = text(tierCard, "Value", "8 / 8", 30, COLORS.ivory, display);
tierValue.x = 16;
tierValue.y = 42;
button(tier, primaryButton, "Continue", 32, 714, 326, 52);

const concentration = blankScreen("Progression / Concentration Score Summary", columns[2], 3270);
addHeader(concentration, "Concentration Score");
topTitle(concentration, "TIER RESULT", "Stillness, distilled", "A quiet summary of the score earned across eight completed levels.");
const scoreCard = frame(concentration, "Score Summary", 24, 304, 342, 262, COLORS.ivory, 8);
const scLabel = text(scoreCard, "Label", "CONCENTRATION SCORE", 10, COLORS.jade, semi);
scLabel.x = 18;
scLabel.y = 18;
const scValue = text(scoreCard, "Value", "10", 74, COLORS.ink, display);
scValue.x = 18;
scValue.y = 46;
const divider = rectangle(scoreCard, "Divider", 18, 136, 306, 1, COLORS.line);
divider.opacity = 1;
const totalLabel = text(scoreCard, "Total Label", "TOTAL ZEN SCORE", 9, COLORS.inkSoft, semi);
totalLabel.x = 18;
totalLabel.y = 158;
const totalValue = text(scoreCard, "Total Value", "80", 25, COLORS.ink, display);
totalValue.x = 18;
totalValue.y = 181;
const levelsLabel = text(scoreCard, "Levels Label", "COMPLETED LEVELS", 9, COLORS.inkSoft, semi);
levelsLabel.x = 190;
levelsLabel.y = 158;
const levelsValue = text(scoreCard, "Levels Value", "8", 25, COLORS.ink, display);
levelsValue.x = 190;
levelsValue.y = 181;
const formula = text(scoreCard, "Formula", "80 ÷ 8 = 10", 11, COLORS.gold, semi);
formula.x = 18;
formula.y = 231;
button(concentration, primaryButton, "View next grade", 32, 714, 326, 52);

const grade = blankScreen("Progression / Grade Advancement", columns[3], 3270);
const seal = figma.createEllipse();
seal.name = "Grade Seal";
seal.resize(126, 126);
seal.x = 132;
seal.y = 88;
seal.fills = [solid(COLORS.goldSoft)];
seal.strokes = [solid(COLORS.gold)];
seal.strokeWeight = 2;
add(grade, seal);
const sealMark = text(grade, "Seal Mark", "花", 46, COLORS.red, display);
sealMark.x = 172;
sealMark.y = 122;
const advanced = text(grade, "Kicker", "GRADE ADVANCEMENT", 10, COLORS.goldSoft, semi);
advanced.x = (390 - advanced.width) / 2;
advanced.y = 252;
const gradeTitle = fixedText(grade, "Title", "A new grade awaits", 38, COLORS.ivory, 342, display, "CENTER", 44);
gradeTitle.x = 24;
gradeTitle.y = 286;
const placeholder = pill(grade, "GRADE NAME", 116, 390, 158, COLORS.forest, COLORS.ivory);
placeholder.strokes = [solid(COLORS.gold, 0.7)];
const gradeBody = fixedText(grade, "Body", "The title remains editable until the progression naming is finalized.", 12, COLORS.shadow, 294, regular, "CENTER", 18);
gradeBody.x = 48;
gradeBody.y = 448;
const earned = frame(grade, "Earned Score", 70, 548, 250, 92, COLORS.ivory, 8);
const earnedLabel = text(earned, "Label", "CONCENTRATION SCORE", 9, COLORS.jade, semi);
earnedLabel.x = 16;
earnedLabel.y = 17;
const earnedValue = text(earned, "Value", "+10", 31, COLORS.ink, display);
earnedValue.x = 16;
earnedValue.y = 39;
button(grade, primaryButton, "Continue", 32, 714, 326, 52);

const reduced = prepareGameplay("Accessibility / Reduced Motion", "Reduced Motion", columns[4], 3270, 0.68);
addTray(reduced, "reduced-motion", "2", 3, "PAIR READY · static confirmation");
const reducedBadge = pill(reduced, "REDUCED MOTION", 24, 154, 130, COLORS.deep, COLORS.goldSoft);
reducedBadge.strokes = [solid(COLORS.goldSoft, 0.5)];

const accessible = prepareGameplay("Accessibility / Labeled Blocked State", "Accessible", columns[0], 4290, 0.72);
addTray(accessible, "accessible-blocked", "2", 4, "!  TRAY FULL · open recovery choices");
const accessNote = frame(accessible, "Accessibility Note", 24, 181, 342, 52, COLORS.deep, 8);
accessNote.strokes = [solid(COLORS.goldSoft, 0.45)];
const accessText = text(accessNote, "Label", "STATE SHOWN WITH ICON, LABEL, EDGE, AND COLOR", 9, COLORS.goldSoft, semi);
accessText.x = 12;
accessText.y = 20;

return {
  createdNodeIds,
  mutatedNodeIds,
  sectionId: section.id,
  screenIds: [online.id, offline.id, ad.id, score.id, zen.id, completion.id, tier.id, concentration.id, grade.id, reduced.id, accessible.id],
  counts: { screensAdded: 11, totalScreensInSection: 21 },
};
