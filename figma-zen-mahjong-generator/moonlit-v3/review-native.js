async function review() {
  await figma.loadAllPagesAsync();
  const screens = figma.root.children.find(p => /Screens$/.test(p.name));
  const components = figma.root.children.find(p => /Components$/.test(p.name));
  const foundations = figma.root.children.find(p => /Foundations$/.test(p.name));
  const homeGroup = screens.children.find(n => n.getPluginData('owner') === 'zen-mahjong-moonlit-v3');
  const library = components.children.find(n => n.getPluginData('owner') === 'zen-mahjong-moonlit-v3');
  if (!homeGroup || !library) throw new Error('Home build is not complete.');
  const homes = homeGroup.children.filter(n => n.type === 'FRAME');
  const report = { file: figma.root.name, productionFinal: false,
    organization: JSON.parse(screens.getPluginData('v3OrganizationReport') || '{}'),
    build: JSON.parse(library.getPluginData('report') || '{}'),
    audit: homes.map(f => {
      const list = f.children.find(n => n.name === 'Destinations'), action = f.children.find(n => n.name === 'Continue');
      const labels = f.findAllWithCriteria({ types: ['TEXT'] }).map(t => ({ id: t.id, name: t.name, text: t.characters, width: t.width, height: t.height, fontSize: t.fontSize, fontName: t.fontName }));
      const targets = f.findAllWithCriteria({ types: ['INSTANCE'] }).filter(n => ['Profile','Settings','Currency','Continue','Daily Challenge','Streak','Journey','Achievements'].includes(n.name)).map(n => ({ id:n.id, name:n.name, width:n.width, height:n.height, reactions:n.reactions.length }));
      return { id:f.id, name:f.name, width:f.width, height:f.height, bottomReserve:f.height-action.y-action.height,
        listBottom:list.y+list.height, actionTop:action.y, overlap:list.y+list.height>action.y, labels, targets };
    }) };
  const frames = homes.map(n => ({ node:n, name:'screens/'+n.name }));
  const settingsGroup=screens.children.find(n => n.getPluginData('owner')==='zen-mahjong-moonlit-v3-settings');
  if (settingsGroup) {
    report.settings=JSON.parse(settingsGroup.getPluginData('report')||'{}');
    for (const n of settingsGroup.children.filter(n => n.type==='FRAME')) frames.push({node:n,name:'screens/'+n.name});
    const standard=settingsGroup.children.find(n => n.name==='Settings / 390 x 844');
    if (standard) frames.push({node:standard.findOne(n => n.name==='Settings content'),name:'settings/Full-Scrollable-Content'});
    const settingsLibrary=components.children.find(n => n.getPluginData('owner')==='zen-mahjong-moonlit-v3-settings');
    if (settingsLibrary) frames.push({node:settingsLibrary,name:'components/Settings-Components'});
  }
  frames.push({node:library,name:'components/Home-Components'});
  const otherAssets=components.children.find(n => n.getPluginData('owner')==='zen-mahjong-moonlit-v3-other-assets');
  if (otherAssets) {
    report.otherAssets=JSON.parse(otherAssets.getPluginData('report')||'{}');
    frames.push({node:otherAssets,name:'components/Other-Assets'});
    for (const n of otherAssets.children.filter(n => n.type==='COMPONENT' && n.name.includes('Branch Wrapper'))) frames.push({node:n,name:'assets/'+n.name});
  }
  const specimen = foundations.children.find(n => n.name === '00 Foundations / Palette and Typography');
  if (specimen) frames.push({node:specimen,name:'foundations/Palette-and-Typography'});
  figma.showUI(`<body style="font:14px system-ui;padding:18px"><h2>V3 Home Review</h2><p id="status">Preparing actual Figma renders...</p><button id="download" disabled>Download Review ZIP</button><script>
  const files=[], status=document.getElementById('status');
  onmessage=e=>{const m=e.data.pluginMessage;if(!m)return;if(m.type==='file'){files.push({name:m.name,bytes:new Uint8Array(m.bytes)});status.textContent=m.index+' / '+m.total+' rendered';}if(m.type==='done'){files.push({name:'design-review.json',bytes:new TextEncoder().encode(JSON.stringify(m.report,null,2))});document.getElementById('download').disabled=false;status.textContent='Ready. Download the review ZIP to Downloads.';}if(m.type==='error')status.textContent=m.message;};
  const crc=b=>{let c=0xffffffff;for(const v of b){c^=v;for(let j=0;j<8;j++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;};
  function zip(){let parts=[],central=[],offset=0;const e=new TextEncoder();for(const file of files){const b=file.bytes,name=e.encode(file.name),c=crc(b),head=new Uint8Array(30+name.length),v=new DataView(head.buffer);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint32(14,c,true);v.setUint32(18,b.length,true);v.setUint32(22,b.length,true);v.setUint16(26,name.length,true);head.set(name,30);parts.push(head,b);const ce=new Uint8Array(46+name.length),d=new DataView(ce.buffer);d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint32(16,c,true);d.setUint32(20,b.length,true);d.setUint32(24,b.length,true);d.setUint16(28,name.length,true);d.setUint32(42,offset,true);ce.set(name,46);central.push(ce);offset+=head.length+b.length;}const length=central.reduce((n,b)=>n+b.length,0),end=new Uint8Array(22),v=new DataView(end.buffer);v.setUint32(0,0x06054b50,true);v.setUint16(8,files.length,true);v.setUint16(10,files.length,true);v.setUint32(12,length,true);v.setUint32(16,offset,true);return new Blob([...parts,...central,end],{type:'application/zip'});}
  document.getElementById('download').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(zip());a.download='Zen-Mahjong-V3-Home-Review.zip';a.click();status.textContent='Download requested. Keep the file open and tell Codex when saved.';};
  </script>`,{width:450,height:260});
  for (const [i, f] of frames.entries()) {
    const bytes=await f.node.exportAsync({format:'PNG',constraint:{type:'SCALE',value:1}});
    figma.ui.postMessage({type:'file',name:f.name.replace(/[^a-zA-Z0-9/]+/g,'-')+'.png',bytes,index:i+1,total:frames.length});
  }
  figma.ui.postMessage({type:'done',report});
}
review().catch(e=>figma.closePlugin('Review stopped: '+e.message));
