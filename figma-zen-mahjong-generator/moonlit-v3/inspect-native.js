(async () => {
  if (figma.fileKey && figma.fileKey !== 'iXcpmvzpTiQ0At12IgrEDI') throw new Error('Open the V3 file first.');
  const data = { file: figma.root.name, fileKey: figma.fileKey, pages: [] };
  function tree(n, depth) {
    return { id: n.id, name: n.name, type: n.type, x: n.x, y: n.y, width: n.width, height: n.height,
      children: depth && 'children' in n ? n.children.map(c => tree(c, depth - 1)) : undefined };
  }
  for (const p of figma.root.children) {
    await figma.setCurrentPageAsync(p);
    data.pages.push({ id: p.id, name: p.name, children: p.children.map(n => tree(n, 3)) });
  }
  const vars = await figma.variables.getLocalVariableCollectionsAsync();
  data.variables = vars.map(c => ({ id: c.id, name: c.name, count: c.variableIds.length }));
  figma.showUI('<body style="font:13px system-ui;padding:16px"><h2>V3 file inventory</h2><button id="save">Save inventory JSON</button><pre id="out" style="white-space:pre-wrap"></pre><script>let data;onmessage=e=>{const m=e.data.pluginMessage;if(m){data=m;document.getElementById("out").textContent=JSON.stringify(m,null,2);}};document.getElementById("save").onclick=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));a.download="Zen-Mahjong-V3-Inventory.json";a.click();};</script>', { width: 600, height: 600 });
  figma.ui.postMessage(data);
})().catch(e => figma.closePlugin('Inventory stopped: ' + e.message));
