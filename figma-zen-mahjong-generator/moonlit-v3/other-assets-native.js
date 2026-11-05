async function addOtherAssets() {
  await figma.loadAllPagesAsync();
  if (!/Moonlit.*V3/i.test(figma.root.name)) throw new Error('Open Moonlit Garden V3 first.');
  const cp=figma.root.children.find(p => /Components$/.test(p.name));
  const owner='zen-mahjong-moonlit-v3-other-assets';
  await figma.loadFontAsync({family:'Inter',style:'Regular'});
  const colors=await figma.variables.getLocalVariablesAsync('COLOR');
  const collections=await figma.variables.getLocalVariableCollectionsAsync();
  const palette=collections.find(c => c.name==='Zen Mahjong / Moonlit V3');
  const ink=figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:0,g:0,b:0}},'color',colors.find(v => v.variableCollectionId===palette.id && v.name==='color/ink'));
  const homeLib=cp.children.find(n => n.getPluginData('owner')==='zen-mahjong-moonlit-v3');
  const settingsLib=cp.children.find(n => n.getPluginData('owner')==='zen-mahjong-moonlit-v3-settings');
  const legacy=cp.findOne(n => n.type==='COMPONENT' && n.name==='V2/Popup/Organic Frame');
  const menu=homeLib.findOne(n => n.type==='COMPONENT' && n.name==='V3/Home/Daily Challenge');
  const menuHash=menu.findOne(n => n.type==='RECTANGLE' && n.fills.some(p => p.type==='IMAGE')).fills.find(p => p.type==='IMAGE').imageHash;
  const currency=homeLib.findOne(n => n.type==='COMPONENT' && n.name==='V3/HUD/Currency');
  const homeHash=currency.findOne(n => n.type==='RECTANGLE').fills.find(p => p.type==='IMAGE').imageHash;
  if (!legacy) throw new Error('Existing organic frame missing. No changes made.');
  await figma.setCurrentPageAsync(cp);
  let lib=cp.children.find(n => n.getPluginData('owner')===owner);
  if (!lib) {
    lib=figma.createFrame();cp.appendChild(lib);lib.name='06 Other Assets';lib.fills=[];lib.clipsContent=false;
    lib.x=80;lib.y=Math.max(...cp.children.filter(n => n!==lib).map(n => n.y+n.height))+160;
    lib.resize(2400,2500);lib.setPluginData('owner',owner);
  }
  function caption(name,value,x,y,w=430,size=12) {
    let t=lib.children.find(n => n.type==='TEXT' && n.name===name);
    if (!t) {t=figma.createText();lib.appendChild(t);}
    t.name=name;t.fontName={family:'Inter',style:'Regular'};t.fontSize=size;t.letterSpacing={unit:'PIXELS',value:0};t.characters=value;t.textAutoResize='HEIGHT';t.resize(w,t.height);t.x=x;t.y=y;t.fills=[ink];return t;
  }
  const assets=[];
  function make(name,w,h,build,description) {
    const full='V3/Other/'+name;
    let m=lib.children.find(n => n.type==='COMPONENT' && n.name===full);
    if (!m) {m=figma.createComponent();lib.appendChild(m);m.name=full;m.resize(w,h);m.fills=[];m.clipsContent=false;build(m);}
    m.visible=true;m.description=description||'Reusable material derived only from the supplied artwork. No baked functional text.';
    const i=assets.length;m.x=32+(i%5)*470;m.y=140+Math.floor(i/5)*390;
    caption('Caption / '+full,name,m.x,m.y+322,430);
    assets.push({id:m.id,name:m.name,width:m.width,height:m.height});return m;
  }
  function image(p,hash,crop,x,y,w,h,name='Supplied artwork',iw=1448,ih=1086) {
    const r=figma.createRectangle();p.appendChild(r);r.name=name;r.resize(w,h);r.x=x;r.y=y;
    r.fills=[{type:'IMAGE',imageHash:hash,scaleMode:'CROP',imageTransform:[[crop[2]/iw,0,crop[0]/iw],[0,crop[3]/ih,crop[1]/ih]]}];
    return r;
  }
  function copyVisuals(p,source,omit=[]) {
    for (const n of source.children.filter(n => n.type==='RECTANGLE' && !omit.includes(n.name))) {const r=n.clone();p.appendChild(r);r.x=n.x;r.y=n.y;}
  }
  const scale=358/783;
  const floral=make('Branch Wrapper / Floral',358,364*scale,m => {
    const pieces=[['Top',[18,127,783,88],0,0,358,88*scale,'STRETCH','MIN'],
      ['Bottom',[18,403,783,88],0,276*scale,358,88*scale,'STRETCH','MAX'],
      ['Left',[18,215,110,188],0,88*scale,110*scale,188*scale,'MIN','STRETCH'],
      ['Right',[691,215,110,188],673*scale,88*scale,110*scale,188*scale,'MAX','STRETCH']];
    for (const [name,crop,x,y,w,h,horizontal,vertical] of pieces) image(m,menuHash,crop,x,y,w,h,name).constraints={horizontal,vertical};
  },'Open-center floral branch wrapper, assembled from four supplied edge crops. Includes the original wood inner lip; no background panel, labels or counts.');
  for (const side of ['Top','Bottom','Left','Right']) {
    const source=floral.children.find(n => n.name===side);
    make('Branches / Floral '+side,source.width,source.height,m => {const r=source.clone();m.appendChild(r);r.x=0;r.y=0;r.constraints={horizontal:'STRETCH',vertical:'STRETCH'};});
  }
  make('Branch Wrapper / Leaf',legacy.width,legacy.height,m => copyVisuals(m,legacy,['Marble surface']), 'Open-center leaf and branch wrapper. Original frame artwork, separate from its marble panel.');
  for (const name of ['Upper branch','Lower branch','Leaf and branch left','Leaf and branch right']) {
    const source=legacy.children.find(n => n.name===name);
    if (source) make('Branches / '+name,source.width,source.height,m => {const r=source.clone();m.appendChild(r);r.x=0;r.y=0;r.constraints={horizontal:'STRETCH',vertical:'STRETCH'};});
  }
  const primary=homeLib.findOne(n => n.type==='COMPONENT_SET' && n.name==='V3/Home/Primary Action').children.find(n => n.name==='State=Default');
  make('Surfaces / Blank Marble Button',primary.width,primary.height,m => copyVisuals(m,primary));
  for (const kind of ['Daily Challenge','Streak']) {
    const source=homeLib.findOne(n => n.type==='COMPONENT' && n.name==='V3/Home/'+kind);
    make('Surfaces / Blank Wood '+kind,source.width,source.height,m => copyVisuals(m,source));
  }
  const panel=legacy.children.find(n => n.name==='Marble surface');
  if (panel) make('Surfaces / Marble Panel',panel.width,panel.height,m => {const r=panel.clone();m.appendChild(r);r.x=0;r.y=0;});
  const more=cp.findOne(n => n.type==='COMPONENT' && n.name==='V2/Action/More');
  if (more) make('Containers / Blank Organic Control',78,64,m => copyVisuals(m,more));
  make('Resources / Currency Lotus',48,48*129/124,m => image(m,homeHash,[1060,151,124,129],0,0,m.width,m.height));
  make('Surfaces / Blank Currency Frame',currency.width,currency.height,m => copyVisuals(m,currency));
  make('Navigation / Standalone Arrow',48,48*137/138,m => image(m,menuHash,[655,892,138,137],0,0,m.width,m.height));
  make('Textures / Wood',240,240*140/430,m => image(m,menuHash,[180,235,430,140],0,0,m.width,m.height));
  make('Textures / Ivory Marble',240,240*250/640,m => image(m,homeHash,[450,700,640,250],0,0,m.width,m.height));
  for (const kind of ['Profile','Settings']) {
    const source=homeLib.findOne(n => n.type==='COMPONENT' && n.name==='V3/Navigation/'+kind);
    make('Illustrations / '+kind,48,48,m => copyVisuals(m,source));
  }
  // The existing 50 motif masters remain linked in the shared library; no duplicate tile set.
  caption('Heading','Other Assets / Branch Wrappers and Reusable Materials',32,24,2250,24);
  caption('Asset index','Branch wrappers, separate edge pieces, blank surfaces, textures, containers and resource art.\nTile artwork stays in Gameplay and Shared Components; Home and Settings families stay in their own groups.',32,66,2250,14);
  lib.resize(2400,140+Math.ceil(assets.length/5)*390);
  const report={status:'Other Assets added; rendered review pending',assets,sourceFrame:legacy.id,productionFinal:false,limitations:['Floral wrapper uses edge crops with a wood inner lip, not a newly hand-masked branch silhouette.','Reference sheets not imported as fake transparent production sprites.']};
  lib.setPluginData('report',JSON.stringify(report));
  figma.currentPage.selection=[lib];figma.viewport.scrollAndZoomIntoView([lib]);
}
