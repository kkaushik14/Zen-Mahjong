async function fullImplementationExport() {
  await figma.loadAllPagesAsync();
  if (!/Moonlit.*V3/i.test(figma.root.name)) throw new Error('Open Moonlit Garden V3 first.');
  const pages=figma.root.children;
  const screens=pages.find(p=>/Screens$/.test(p.name));
  const components=pages.find(p=>/Components$/.test(p.name));
  if (!screens || !components) throw new Error('Screens or Components page missing.');
  const report={file:figma.root.name,fileKey:figma.fileKey||null,capturedAt:new Date().toISOString(),readOnly:true,productionFinal:false,
    screens:[],components:[],assets:[],variables:[],errors:[]};
  const jobs=[],hashes=new Set();
  const clean=s=>s.replace(/[^a-zA-Z0-9._-]+/g,'-');
  function value(n,key) {try {const v=n[key];return v===figma.mixed?'MIXED':v;} catch {return undefined;}}
  function capture(n) {
    const out={id:n.id,type:n.type,name:n.name,visible:value(n,'visible')};
    for(const key of ['x','y','width','height','rotation','opacity','absoluteBoundingBox','fills','strokes','effects','cornerRadius','constraints','layoutMode','itemSpacing','paddingTop','paddingBottom','paddingLeft','paddingRight','clipsContent','overflowDirection','characters','fontName','fontSize','lineHeight','letterSpacing','textAlignHorizontal','textAutoResize','textStyleId','boundVariables','reactions','componentProperties']) {
      const v=value(n,key);if(v!==undefined)out[key]=v;
    }
    for(const p of Array.isArray(out.fills)?out.fills:[])if(p.type==='IMAGE'&&p.imageHash)hashes.add(p.imageHash);
    if ('children' in n) out.children=n.children.map(capture);
    return out;
  }
  function visit(n,ancestors=[]) {
    if (n.type==='FRAME' && /^(Home|Gameplay|Loading|Profile|Settings|Board Complete|Achievements|Streaks|Pause|More|Edit Profile|Achievement Detail|Appearance|No Moves|Full Tray)\s*\//.test(n.name)) {
      const legacy=n.id==='55:17102';
      const record={id:n.id,name:n.name,width:n.width,height:n.height,ancestors,classification:legacy?'superseded-home-reference':'screen-candidate',layers:capture(n)};
      report.screens.push(record);jobs.push({node:n,name:'screens/'+n.id.replace(':','-')+'-'+clean(n.name)+'.png'});return;
    }
    if ('children' in n)for(const c of n.children)visit(c,[...ancestors,{id:n.id,name:n.name}]);
  }
  visit(screens);
  if (!report.screens.length)throw new Error('No screens found. Export stopped without changes.');
  report.screenPageInventory=capture(screens);
  for(const m of components.findAllWithCriteria({types:['COMPONENT','COMPONENT_SET']})) {
    report.components.push({id:m.id,name:m.name,type:m.type,description:value(m,'description'),assetKey:m.getPluginData('assetKey'),layers:capture(m)});
  }
  for(const group of components.children) {
    if (!('exportAsync' in group))continue;
    if(group.getPluginData('owner')==='zen-mahjong-v3-source-popup-artwork') {
      for(const child of group.children.filter(n=>n.type==='FRAME'))jobs.push({node:child,name:'components/'+child.id.replace(':','-')+'-'+clean(child.name)+'.png'});
    } else if(group.type==='FRAME'||group.type==='SECTION')jobs.push({node:group,name:'components/'+group.id.replace(':','-')+'-'+clean(group.name)+'.png'});
  }
  const standard=report.screens.find(n=>n.name==='Settings / 390 x 844');
  if(standard) {
    const n=await figma.getNodeByIdAsync(standard.id),content=n.findOne(c=>c.name==='Settings content');
    if(content)jobs.push({node:content,name:'settings/Full-Scrollable-Content.png'});
  }
  for(const c of await figma.variables.getLocalVariableCollectionsAsync()) {
    const variables=[];for(const id of c.variableIds){const v=await figma.variables.getVariableByIdAsync(id);if(v)variables.push({id:v.id,name:v.name,type:v.resolvedType,valuesByMode:v.valuesByMode,scopes:v.scopes});}
    report.variables.push({id:c.id,name:c.name,modes:c.modes,variables});
  }
  report.textStyles=(await figma.getLocalTextStylesAsync()).map(s=>({id:s.id,name:s.name,fontName:s.fontName,fontSize:s.fontSize,lineHeight:s.lineHeight,letterSpacing:s.letterSpacing}));
  report.effectStyles=(await figma.getLocalEffectStylesAsync()).map(s=>({id:s.id,name:s.name,effects:s.effects}));
  openFullExportPanel();
  let index=0;const total=jobs.length+hashes.size;
  for(const job of jobs) {
    try {
      const scale=job.name.startsWith('screens/')?1:Math.min(1,6000/Math.max(job.node.width,job.node.height));
      const bytes=await job.node.exportAsync({format:'PNG',constraint:{type:'SCALE',value:scale}});
      figma.ui.postMessage({type:'file',name:job.name,bytes,index:++index,total});
    } catch(e) {index++;report.errors.push({id:job.node.id,name:job.name,error:e.message});}
  }
  for(const hash of hashes) {
    try {
      const img=figma.getImageByHash(hash),bytes=await img.getBytesAsync(),size=await img.getSizeAsync();
      const ext=bytes[0]===137&&bytes[1]===80?'png':bytes[0]===255&&bytes[1]===216?'jpg':bytes[0]===71&&bytes[1]===73?'gif':bytes[0]===82&&bytes[8]===87?'webp':'bin';
      const name='assets/'+hash+'.'+ext;report.assets.push({hash,name,...size,bytes:bytes.length});
      figma.ui.postMessage({type:'file',name,bytes,index:++index,total});
    } catch(e){index++;report.errors.push({hash,error:e.message});}
  }
  report.status=report.errors.length?'INCOMPLETE: inspect errors before implementation':'Captured current file; screen approval and visual verification required';
  figma.ui.postMessage({type:'done',report});
}
