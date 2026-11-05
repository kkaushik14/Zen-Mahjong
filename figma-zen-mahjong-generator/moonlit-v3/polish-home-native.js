async function polishHome() {
  await figma.loadAllPagesAsync();
  if (!/Moonlit.*V3/i.test(figma.root.name)) throw new Error('Open Moonlit Garden V3 first.');
  const cp = figma.root.children.find(p => /Components$/.test(p.name));
  const sp = figma.root.children.find(p => /Screens$/.test(p.name));
  const lib = cp.children.find(n => n.getPluginData('owner') === 'zen-mahjong-moonlit-v3');
  const group = sp.children.find(n => n.getPluginData('owner') === 'zen-mahjong-moonlit-v3');
  if (!lib || !group) throw new Error('Completed V3 Home library missing.');
  const fonts = new Map();
  for (const p of [cp, sp]) for (const t of p.findAllWithCriteria({types:['TEXT']}))
    for (const s of t.getStyledTextSegments(['fontName'])) fonts.set(JSON.stringify(s.fontName), s.fontName);
  const regular = {family:'Inter', style:'Regular'};
  fonts.set(JSON.stringify(regular), regular);
  for (const f of fonts.values()) await figma.loadFontAsync(f);
  const variables = await figma.variables.getLocalVariablesAsync('COLOR');
  const collection = (await figma.variables.getLocalVariableCollectionsAsync()).find(c => c.name === 'Zen Mahjong / Moonlit V3');
  const paint = name => figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:0,g:0,b:0}}, 'color', variables.find(v => v.variableCollectionId === collection.id && v.name === 'color/' + name));
  await figma.setCurrentPageAsync(cp);
  const logo = lib.findOne(n => n.type === 'COMPONENT' && n.name === 'V3/Brand/Zen Mahjong');
  const original = logo.children.find(n => n.name === 'User brand artwork');
  if (original) {
    const hash = original.fills.find(p => p.type === 'IMAGE').imageHash;
    // Split the crop to exclude the neighboring currency coin, retaining the lower seal.
    const slices = [[324,20,730,300,0,0,196*730/764,148*300/573], [324,320,764,273,0,148*300/573,196,148*273/573]];
    for (const [i,s] of slices.entries()) {
      const r = figma.createRectangle(); logo.appendChild(r);
      r.name = 'User brand artwork / ' + (i ? 'lower seal' : 'upper lettering');
      r.resize(s[6],s[7]); r.x=s[4]; r.y=s[5];
      r.fills=[{type:'IMAGE',imageHash:hash,scaleMode:'CROP',imageTransform:[[s[2]/1448,0,s[0]/1448],[0,s[3]/1086,s[1]/1086]]}];
      r.constraints={horizontal:'SCALE',vertical:'SCALE'};
    }
    original.remove();
  }
  for (const m of lib.findAllWithCriteria({types:['COMPONENT']})) {
    if (m.children.some(n => n.type === 'ELLIPSE')) {
      const status=m.findOne(n => n.type==='TEXT' && n.name==='Status');
      if (status) status.y=45;
      for (const d of m.children.filter(n => n.type==='ELLIPSE')) {
        d.y=69; d.strokes=[paint(d.fills.length ? 'ivory' : 'gold')];
      }
    }
  }
  function centerLabel(action) {
    if (action.type==='INSTANCE') return;
    const row=action.findOne(n => n.name==='Label group');
    const label=row.findOne(n => n.type==='TEXT' && n.name==='Label');
    label.textAutoResize='WIDTH_AND_HEIGHT';
    row.primaryAxisSizingMode='FIXED';row.primaryAxisAlignItems='CENTER';
    row.resize(action.width,44);row.x=0;row.y=(action.height-44)/2;
    row.constraints={horizontal:'STRETCH',vertical:'CENTER'};
  }
  const primary=lib.findOne(n => n.type==='COMPONENT_SET' && n.name==='V3/Home/Primary Action');
  for (const m of primary.children) centerLabel(m);
  function property(instance,name,value) {
    const key=Object.keys(instance.componentProperties).find(k => k.startsWith(name+'#'));
    if (key) instance.setProperties({[key]:value});
  }
  const compact = {};
  for (const [kind,crop] of [['Journey',[125,610,210,205]],['Achievements',[854,658,137,147]]]) {
    let m=lib.findOne(n => n.type==='COMPONENT' && n.name==='V3/Home/'+kind+' / Compact');
    if (!m) {
      const source=lib.findOne(n => n.type==='COMPONENT' && n.name==='V3/Home/'+kind);
      const hash=source.findOne(n => n.type==='RECTANGLE' && n.fills.some(p => p.type==='IMAGE')).fills.find(p => p.type==='IMAGE').imageHash;
      m=source.clone();lib.appendChild(m);m.name='V3/Home/'+kind+' / Compact';m.resize(158,78);
      m.x=1480+(kind==='Journey'?0:230);m.y=700;
      for (const n of [...m.children]) if (n.type==='RECTANGLE' || n.name==='Arrow') n.remove();
      const master=primary.children.find(n => n.name==='State=Default');
      for (const part of master.children.filter(n => n.type==='RECTANGLE')) {
        const r=part.clone();m.insertChild(0,r);
        const scale=78/86;r.resize(part.width*scale,78);r.y=0;
        if (part.name.endsWith('MIN')) r.x=0;
        else if (part.name.endsWith('MAX')) r.x=158-r.width;
        else {r.x=300*78/506;r.resize(158-(300+240)*78/506,78);}
      }
      const icon=figma.createRectangle();m.appendChild(icon);icon.name=kind+' artwork';icon.resize(32,32);icon.x=14;icon.y=23;
      icon.fills=[{type:'IMAGE',imageHash:hash,scaleMode:'CROP',imageTransform:[[crop[2]/1448,0,crop[0]/1448],[0,crop[3]/1086,crop[1]/1086]]}];
      icon.constraints={horizontal:'MIN',vertical:'CENTER'};
      const title=m.findOne(n => n.type==='TEXT' && n.name==='Title');title.fontSize=16;title.lineHeight={unit:'PIXELS',value:21};title.x=52;title.y=19;title.resize(94,title.height);
      const status=m.findOne(n => n.type==='TEXT' && n.name==='Status');status.fontSize=13;status.x=52;status.y=42;status.resize(94,status.height);
      m.description='Compact Home destination. Entire surface is the touch target.';
    }
    compact[kind]=m;
  }
  await figma.setCurrentPageAsync(sp);
  for (const home of group.children.filter(n => n.type==='FRAME')) {
    const wash=home.children.find(n => n.name==='HUD readability wash');
    wash.opacity=1;
    wash.fills=[{type:'GRADIENT_LINEAR',gradientTransform:[[0,1,0],[-1,0,1]],gradientStops:[
      {position:0,color:{r:18/255,g:38/255,b:46/255,a:0.45}},
      {position:1,color:{r:18/255,g:38/255,b:46/255,a:0}}
    ]}];
    const action=home.children.find(n => n.name==='Continue');
    if (home.name.includes('First Play')) {
      home.findOne(n => n.type==='TEXT' && n.name==='Level').characters='Lv. 1';
      home.findOne(n => n.name==='Level progress').visible=false;
      property(home.findOne(n => n.type==='INSTANCE' && n.name==='Currency'),'Balance','0');
      for (const [name,status] of [['Daily Challenge',"Today's garden awaits"],['Streak','Start your first day'],['Journey','Stage 1'],['Achievements','0 of 24 unlocked']]) {
        const n=home.findOne(n => n.type==='INSTANCE' && n.name===name);
        property(n,'Status',status);
        for (const d of n.findAllWithCriteria({types:['ELLIPSE']})) {d.fills=[];d.strokes=[paint('gold')];}
      }
    }
    const list=home.children.find(n => n.name==='Destinations');
    let row=list.children.find(n => n.name==='Journey and Achievements');
    if (!row) {
      row=figma.createFrame();list.appendChild(row);row.name='Journey and Achievements';row.fills=[];
      row.resize(home.width-32,78);row.layoutMode='HORIZONTAL';row.itemSpacing=12;
      row.primaryAxisSizingMode='FIXED';row.counterAxisSizingMode='FIXED';row.layoutSizingHorizontal='FILL';
      for (const kind of ['Journey','Achievements']) {
        const previous=list.children.find(n => n.name===kind);
        const reactions=JSON.parse(JSON.stringify(previous.reactions));
        const n=compact[kind].createInstance();row.appendChild(n);n.name=kind;
        n.resize((home.width-44)/2,78);n.layoutSizingHorizontal='FILL';
        property(n,'Status',kind==='Journey'?(home.name.includes('First Play')?'Stage 1':'Stage 3'):(home.name.includes('First Play')?'0 / 24':'5 / 24'));
        if (reactions.length) await n.setReactionsAsync(reactions);
        previous.remove();
      }
    }
    property(row.children.find(n => n.name==='Achievements'),'Status',home.name.includes('First Play')?'0 / 24':'5 / 24');
    list.itemSpacing=12;
    action.y=list.y+list.height+32;
    action.constraints={horizontal:'STRETCH',vertical:'MIN'};
    centerLabel(action);
  }
  await figma.setCurrentPageAsync(cp);
  if (lib.getPluginData('showcasePolished') !== 'yes') {
    for (const n of lib.children) n.y += 48;
    const t=figma.createText();lib.appendChild(t);t.name='Library heading';t.fontName=regular;t.fontSize=20;t.characters='Home / Moonlit Garden';t.fills=[paint('ink')];t.x=0;t.y=0;
    lib.setPluginData('showcasePolished','yes');
  }
  lib.resize(2200,900);
  const report=JSON.parse(lib.getPluginData('report') || '{}');
  report.status='Polished; final rendered review pending';
  report.polish=['Logo crop cleaned','HUD fade','Progress contrast','Fresh-player values','Centered primary labels','Side-by-side Journey and Achievements','32px gap before Continue; open garden space below'];
  lib.setPluginData('report',JSON.stringify(report));lib.setPluginData('status',report.status);
  group.setPluginData('report',JSON.stringify(report));
  await figma.setCurrentPageAsync(sp);
  const first=group.children.find(n => n.name==='Home / 390 x 844');
  figma.currentPage.selection=[first];figma.viewport.scrollAndZoomIntoView([first]);
}
polishHome().then(() => figma.closePlugin('Home spacing updated. Ready for final review.')).catch(e => figma.closePlugin('Home polish stopped: '+e.message));
