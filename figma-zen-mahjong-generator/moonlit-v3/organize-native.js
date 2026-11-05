async function organize() {
  const TARGET = 'iXcpmvzpTiQ0At12IgrEDI';
  if (figma.fileKey && figma.fileKey !== TARGET) throw new Error('Open the Moonlit Garden V3 file first.');
  if (!/Moonlit.*V3/i.test(figma.root.name)) throw new Error('The open document is not Moonlit Garden V3.');
  await figma.loadAllPagesAsync();
  const pages = figma.root.children;
  const foundation = pages.find(p => /Foundations$/.test(p.name));
  const components = pages.find(p => /Components$/.test(p.name));
  const screens = pages.find(p => /Screens$/.test(p.name));
  if (!foundation || !components || !screens) throw new Error('Expected the three existing Foundations, Components, and Screens pages.');
  await figma.setCurrentPageAsync(screens);
  const root = screens.children.find(n => n.name === 'Zen Mahjong / Artwork-Faithful Design V2');
  if (!root) {
    if (screens.getPluginData('v3Organized') === 'yes') return { status: 'Already organized', pages: pages.map(p => ({ id: p.id, name: p.name })) };
    throw new Error('The retained design section was not found. No changes made.');
  }
  const byName = name => root.children.find(n => n.name === name);
  const sources = byName('00 Source Assets'), library = byName('01 Components');
  const game = byName('02 Screens'), app = byName('04 App Screens and Prototype');
  const states = byName('03 States and Prototype');
  if (!sources || !library || !game || !app) throw new Error('The retained section differs from the inspected structure.');
  const fonts = new Map();
  for (const t of root.findAllWithCriteria({ types: ['TEXT'] })) for (const s of t.getStyledTextSegments(['fontName'])) fonts.set(JSON.stringify(s.fontName), s.fontName);
  for (const f of fonts.values()) await figma.loadFontAsync(f);
  const moved = [];
  const placeholder = components.children.find(n => n.name === 'Production / Component Library' && n.type === 'FRAME' && !n.children.length);
  if (placeholder) { placeholder.name = '04 Home Screen Components / Ready for build'; placeholder.resize(3000, 900); }
  function place(page, node, name, x, y) {
    page.appendChild(node); node.name = name; node.x = x; node.y = y;
    moved.push({ id: node.id, name, page: page.name });
  }
  function nextY(page) { return Math.max(0, ...page.children.map(n => n.y + n.height)) + 160; }
  await figma.setCurrentPageAsync(foundation);
  place(foundation, sources, '02 Source Artwork and Materials', 0, nextY(foundation));
  await figma.setCurrentPageAsync(components);
  place(components, library, '01 Gameplay and Shared Components', 0, nextY(components));
  if (states) place(components, states, '02 Component States and Examples', 0, library.y + library.height + 160);
  // Keep main popup components visible and separated; instances keep their links.
  const popupMains = library.findAllWithCriteria({ types: ['COMPONENT'] }).filter(n => n.name.startsWith('V2/Popup/') && !n.visible);
  if (popupMains.length) {
    const show = figma.createSection(); components.appendChild(show); show.name = '03 Popup Component Masters';
    show.x = 0; show.y = nextY(components); show.resizeWithoutConstraints(2400, 1200);
    for (const [i, n] of popupMains.entries()) { show.appendChild(n); n.visible = true; n.x = 40 + (i % 5) * 460; n.y = 60 + Math.floor(i / 5) * 500; moved.push({ id: n.id, name: n.name, page: components.name }); }
  }
  await figma.setCurrentPageAsync(screens);
  place(screens, game, '01 Gameplay Screens', 0, 0);
  place(screens, app, '02 App Screens and Popups', 0, game.height + 180);
  const review = byName('Review Overview');
  if (review) place(screens, review, 'Review / Existing Screen Overview', 0, app.y + app.height + 180);
  await figma.setCurrentPageAsync(foundation);
  place(foundation, root, '01 Design Direction and Review Notes', 1760, 80);
  const texts = root.children.filter(n => n.type === 'TEXT');
  for (const [i, t] of texts.entries()) {
    t.x = 40; t.y = 40 + i * 64;
    if (t.name === 'Title') t.characters = 'Zen Mahjong / Moonlit Garden V3';
    if (t.name === 'Status') t.characters = 'Design study. User-supplied artwork. Editable functional UI. Home design is the next phase.';
  }
  if (root.type === 'SECTION') root.resizeWithoutConstraints(4400, Math.max(500, texts.length * 64 + 100));
  foundation.name = '01 Foundations'; components.name = '02 Components'; screens.name = '03 Screens';
  screens.setPluginData('v3Organized', 'yes');
  const report = { status: 'Organized without deleting artwork or screens', pages: pages.map(p => ({ id: p.id, name: p.name })), moved };
  screens.setPluginData('v3OrganizationReport', JSON.stringify(report));
  await figma.setCurrentPageAsync(screens); figma.currentPage.selection = [game]; figma.viewport.scrollAndZoomIntoView([game]);
  return report;
}
organize().then(report => {
  figma.showUI('<body style="font:14px system-ui;padding:18px"><h2>V3 organized</h2><p>Foundations, Components, and Screens are separated. Existing screen and component IDs are retained.</p><pre id="result" style="white-space:pre-wrap"></pre><script>onmessage=e=>{document.getElementById("result").textContent=JSON.stringify(e.data.pluginMessage,null,2);};</script>', { width: 580, height: 500 });
  figma.ui.postMessage(report);
}).catch(e => figma.closePlugin('Organization stopped: ' + e.message));
