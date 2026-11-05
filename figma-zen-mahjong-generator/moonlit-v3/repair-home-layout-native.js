async function repairHomeLayouts() {
  await figma.loadAllPagesAsync();
  if (!/Moonlit.*V3/i.test(figma.root.name)) throw new Error('Open Moonlit Garden V3 first.');
  const sp=figma.root.children.find(p => /Screens$/.test(p.name));
  const cp=figma.root.children.find(p => /Components$/.test(p.name));
  const lib=cp.children.find(n => n.getPluginData('owner')==='zen-mahjong-moonlit-v3');
  const compact={};
  for (const kind of ['Journey','Achievements']) {
    compact[kind]=lib.findOne(n => n.type==='COMPONENT' && n.name==='V3/Home/'+kind+' / Compact');
    if (!compact[kind]) throw new Error('Missing compact '+kind+' master. No screens changed.');
  }
  const homeGroup=sp.children.find(n => n.getPluginData('owner')==='zen-mahjong-moonlit-v3');
  if (!homeGroup) throw new Error('V3 Home section missing. No changes made.');
  function primaryAction(home) {
    return home.children.find(n => n.name==='Continue') || home.children.find(n => n.type==='INSTANCE'
      && n.findOne(c => c.name==='Label group'));
  }
  // Resetting instance overrides can also reset its name. Use the owned section and structure.
  const homes=homeGroup.children.filter(n => n.type==='FRAME'
    && n.children.some(c => c.name==='Destinations') && primaryAction(n));
  if (homes.length<5) {
    const candidates=sp.findAll(n => n.type==='FRAME' && /home/i.test(n.name))
      .map(n => ({id:n.id,name:n.name,layers:n.children.map(c => c.name)}));
    throw new Error('Found '+homes.length+' structurally matching Home layouts. No changes made. Candidates: '+JSON.stringify(candidates));
  }
  const fonts=new Map();
  for (const home of homes) for (const t of home.findAllWithCriteria({types:['TEXT']}))
    for (const s of t.getStyledTextSegments(['fontName'])) fonts.set(JSON.stringify(s.fontName),s.fontName);
  for (const f of fonts.values()) await figma.loadFontAsync(f);
  await figma.setCurrentPageAsync(cp);
  const primary=lib.findOne(n => n.type==='COMPONENT_SET' && n.name==='V3/Home/Primary Action');
  if (!primary) throw new Error('Missing primary-action masters.');
  for (const master of primary.children) {
    const row=master.findOne(n => n.name==='Label group');
    const label=row.findOne(n => n.type==='TEXT' && n.name==='Label');
    label.textAutoResize='WIDTH_AND_HEIGHT';
    row.layoutMode='HORIZONTAL';row.primaryAxisSizingMode='FIXED';row.counterAxisSizingMode='FIXED';
    row.primaryAxisAlignItems='CENTER';row.counterAxisAlignItems='CENTER';
    row.resize(master.width,44);row.x=0;row.y=(master.height-44)/2;
    row.constraints={horizontal:'STRETCH',vertical:'CENTER'};
  }
  function property(n,name,value) {
    const key=Object.keys(n.componentProperties).find(k => k.startsWith(name+'#'));
    if (key) n.setProperties({[key]:value});
  }
  const results=[];
  await figma.setCurrentPageAsync(sp);
  for (const home of homes) {
    try {
      const list=home.children.find(n => n.name==='Destinations');
      const action=primaryAction(home);
      let row=list.children.find(n => n.name==='Journey and Achievements');
      if (!row) {row=figma.createFrame();list.appendChild(row);row.name='Journey and Achievements';row.fills=[];}
      row.layoutMode='HORIZONTAL';row.itemSpacing=12;row.clipsContent=false;
      row.primaryAxisSizingMode='FIXED';row.counterAxisSizingMode='FIXED';
      row.resize(home.width-32,78);row.layoutSizingHorizontal='FILL';row.layoutSizingVertical='FIXED';
      for (const kind of ['Journey','Achievements']) {
        let n=row.children.find(n => n.name===kind);
        if (!n) {
          n=list.children.find(n => n.name===kind);
          if (n) {n.swapComponent(compact[kind]);row.appendChild(n);}
          else {n=compact[kind].createInstance();row.appendChild(n);}
          n.name=kind;
        }
        const reactions=JSON.parse(JSON.stringify(n.reactions));
        n.resetOverrides();n.name=kind;
        property(n,'Title',kind);
        if (reactions.length) await n.setReactionsAsync(reactions);
        n.resize((home.width-44)/2,78);n.layoutSizingHorizontal='FILL';n.layoutSizingVertical='FIXED';
        property(n,'Status',kind==='Journey'?(home.name.includes('First Play')?'Stage 1':'Stage 3'):(home.name.includes('First Play')?'0 / 24':'5 / 24'));
      }
      list.layoutMode='VERTICAL';list.itemSpacing=12;list.counterAxisSizingMode='FIXED';list.primaryAxisSizingMode='AUTO';
      list.resize(home.width-32,282);
      const actionReactions=JSON.parse(JSON.stringify(action.reactions));
      action.resetOverrides();
      action.name='Continue';
      property(action,'Label',home.name.includes('First Play')?'Play':'Continue');
      if (actionReactions.length) await action.setReactionsAsync(actionReactions);
      action.x=24;action.resize(home.width-48,86);action.y=list.y+282+32;
      action.constraints={horizontal:'STRETCH',vertical:'MIN'};
      const bottomReserve=home.height-action.y-action.height;
      const siblings=row.children.filter(n => ['Journey','Achievements'].includes(n.name));
      if (siblings.length!==2 || Math.abs(siblings[0].y-siblings[1].y)>1 || bottomReserve<48)
        throw new Error('Layout validation failed.');
      results.push({id:home.id,name:home.name,status:'updated',sideBySide:true,gapBeforeContinue:32,bottomReserve});
    } catch (e) {results.push({id:home.id,name:home.name,status:'error',error:e.message});}
  }
  const report=JSON.parse(lib.getPluginData('report')||'{}');
  report.layoutRepair=results;
  report.status=results.every(r => r.status==='updated')?'All Home layouts updated; rendered review pending':'Home layout repair needs attention';
  lib.setPluginData('report',JSON.stringify(report));lib.setPluginData('status',report.status);
  if (results.some(r => r.status==='error')) throw new Error(JSON.stringify(results));
  figma.currentPage.selection=homes;figma.viewport.scrollAndZoomIntoView(homes);
}
