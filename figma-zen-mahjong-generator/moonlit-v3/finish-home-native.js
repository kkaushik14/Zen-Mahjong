async function finishHome() {
  await figma.loadAllPagesAsync();
  if (!/Moonlit.*V3/i.test(figma.root.name)) throw new Error('Open V3 first.');
  const pages = figma.root.children, cp = pages.find(p => /Components$/.test(p.name)), sp = pages.find(p => /Screens$/.test(p.name)), fp = pages.find(p => /Foundations$/.test(p.name));
  const lib = cp.children.find(n => n.getPluginData('owner') === 'zen-mahjong-moonlit-v3');
  const group = sp.children.find(n => n.name === '00 Home Screens / Moonlit Garden');
  if (!lib || !group) throw new Error('The expected partial Home build was not found.');
  const regular = {family:'Inter',style:'Regular'}, display = {family:'Cormorant Garamond',style:'Medium'};
  await figma.loadFontAsync(regular); await figma.loadFontAsync(display);
  const fonts = new Map();
  for (const p of [cp,sp,fp]) for (const t of p.findAllWithCriteria({types:['TEXT']})) for(const s of t.getStyledTextSegments(['fontName'])) fonts.set(JSON.stringify(s.fontName),s.fontName);
  for(const f of fonts.values()) await figma.loadFontAsync(f);
  const vars = await figma.variables.getLocalVariablesAsync('COLOR');
  const coll = (await figma.variables.getLocalVariableCollectionsAsync()).find(c => c.name === 'Zen Mahjong / Moonlit V3');
  const paint = name => figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:0,g:0,b:0}},'color',vars.find(v=>v.variableCollectionId===coll.id&&v.name==='color/'+name));
  const find = name => lib.findOne(n=>n.type==='COMPONENT'&&n.name===name);
  const menus = ['Daily Challenge','Streak','Journey','Achievements'].map(k=>find('V3/Home/'+k));
  const button = lib.findOne(n=>n.type==='COMPONENT_SET'&&n.name==='V3/Home/Primary Action').children.find(n=>n.name==='State=Default');
  const changed=[];
  function inst(p,m,x,y,w=m.width,h=m.height,name=m.name){const n=m.createInstance();p.appendChild(n);n.resize(w,h);n.x=x;n.y=y;n.name=name;changed.push(n.id);return n;}
  function set(n,name,value){const k=Object.keys(n.componentProperties).find(k=>k.startsWith(name+'#'));if(k)n.setProperties({[k]:value});}
  await figma.setCurrentPageAsync(cp);
  for(const m of menus) {
    for(const key of ['Title','Status']) {const t=m.findOne(n=>n.type==='TEXT'&&n.name===key);t.constraints={horizontal:'STRETCH',vertical:'MIN'};changed.push(t.id);}
    const arrow=m.findOne(n=>n.name==='Arrow');arrow.constraints={horizontal:'MAX',vertical:'CENTER'};
  }
  await figma.setCurrentPageAsync(sp);
  const first = group.children.find(n=>n.name==='Home / 390 x 844');
  if(!first)throw new Error('Partial 390 Home missing.');
  function layout(f,w,h,firstPlay=false){
    f.resize(w,h);f.clipsContent=true;
    const garden=f.children.find(n=>n.name==='Garden');garden.resize(w,h);garden.constraints={horizontal:'STRETCH',vertical:'STRETCH'};
    const wash=f.children.find(n=>n.name==='HUD readability wash');wash.resize(w,116);
    const hud=f.children.find(n=>n.name==='HUD / Safe top 56');hud.resize(w-32,52);
    hud.children.find(n=>n.name==='Currency').x=w-228;hud.children.find(n=>n.name==='Settings').x=w-80;
    const logo=f.children.find(n=>n.name==='Zen Mahjong');logo.x=(w-logo.width)/2;
    const list=f.children.find(n=>n.name==='Destinations');list.resize(w-32,360);list.layoutMode='VERTICAL';list.itemSpacing=8;list.primaryAxisSizingMode='AUTO';list.counterAxisSizingMode='FIXED';
    for(const [i,m] of menus.entries()){
      let n=list.children.find(n=>n.name===['Daily Challenge','Streak','Journey','Achievements'][i]);
      if(!n)n=inst(list,m,0,0,w-32,m.height,['Daily Challenge','Streak','Journey','Achievements'][i]);
      n.resize(w-32,m.height);n.layoutSizingHorizontal='FILL';
      if(firstPlay&&i===0)set(n,'Status',"Today's garden awaits");
    }
    let action=f.children.find(n=>n.name==='Continue');if(!action)action=inst(f,button,24,h-118,w-48,86,'Continue');
    action.resize(w-48,86);action.x=24;action.y=h-118;action.constraints={horizontal:'STRETCH',vertical:'MAX'};set(action,'Label',firstPlay?'Play':'Continue');changed.push(f.id);
  }
  layout(first,390,844);
  const homes=[first];
  for(const [i,[w,h,firstPlay]]of [[360,800,false],[412,915,false],[430,932,false],[390,844,true]].entries()){
    const name='Home / '+w+' x '+h+(firstPlay?' / First Play':'');
    let f=group.children.find(n=>n.name===name);if(!f){f=first.clone();group.appendChild(f);f.name=name;f.x=(i+1)*510;f.y=0;changed.push(f.id);}
    layout(f,w,h,firstPlay);homes.push(f);
  }
  group.resizeWithoutConstraints(2620,1060);group.setPluginData('owner','zen-mahjong-moonlit-v3');
  const sources=sp.children.filter(n=>['01 Gameplay Screens','02 App Screens and Popups'].includes(n.name)).flatMap(n=>n.children).filter(n=>n.type==='FRAME');
  const dest=name=>sources.find(n=>n.name===name+' / 390 x 844');
  async function link(n,d){if(!n||!d)return;const a={type:'NODE',destinationId:d.id,navigation:'NAVIGATE',transition:null,preserveScrollPosition:false};await n.setReactionsAsync([{trigger:{type:'ON_CLICK'},action:a,actions:[a]}]);}
  for(const h of homes)for(const [from,to]of [['Profile','Profile'],['Settings','Settings'],['Continue','Gameplay'],['Streak','Streaks'],['Achievements','Achievements']])await link(h.findOne(n=>n.type==='INSTANCE'&&n.name===from),dest(to));
  const oldHome=sources.find(n=>n.name==='Home / 390 x 844');
  if(oldHome)for(const f of sources)for(const n of f.findAll(()=>true)){
    if(!('reactions'in n)||!n.reactions.length)continue;
    const rs=JSON.parse(JSON.stringify(n.reactions));let edit=false;
    for(const r of rs)for(const a of [r.action,...(r.actions||[])].filter(Boolean))if(a.type==='NODE'&&a.destinationId===oldHome.id){a.destinationId=first.id;edit=true;}
    if(edit)await n.setReactionsAsync(rs);
  }
  if(oldHome)oldHome.name='Reference / Previous Home Study / 390 x 844';
  await figma.setCurrentPageAsync(fp);
  const specimen=fp.children.find(n=>n.name==='Production / Foundations'&&n.type==='FRAME'&&!n.children.length);
  function text(p,label,x,y,size=16,color='ink',heading=false){const t=figma.createText();p.appendChild(t);t.fontName=heading?display:regular;t.fontSize=size;t.characters=label;t.name=label;t.letterSpacing={unit:'PIXELS',value:0};t.lineHeight={unit:'PIXELS',value:Math.ceil(size*1.3)};t.textAutoResize='HEIGHT';t.resize(1250,t.height);t.x=x;t.y=y;t.fills=[paint(color)];changed.push(t.id);return t;}
  if(specimen){
    specimen.name='00 Foundations / Palette and Typography';specimen.resize(1440,1000);specimen.fills=[];
    text(specimen,'Zen Mahjong / Moonlit Garden',40,40,36,'ink',true);text(specimen,'Moonlit Home · Autumn Gameplay · Ivory Marble · Organic Controls',40,98,18);
    for(const [i,name]of ['ink','light','ivory','jade','gold','shadow','cool','sage','orange'].entries()){
      const r=figma.createRectangle();specimen.appendChild(r);r.name='color/'+name;r.resize(220,82);r.x=40+(i%5)*260;r.y=172+Math.floor(i/5)*140;r.cornerRadius=8;r.fills=[paint(name)];text(specimen,'color/'+name,r.x,r.y+92,14).resize(220,20);
    }
    text(specimen,'A quieter garden',40,500,32,'ink',true);text(specimen,'Inter / Progress, counts and controls',40,560);
    text(specimen,'48px touch targets · 16px margins · 32px bottom reserve · 8px gaps',40,620);
    text(specimen,'User-supplied artwork and in-house composition. Design study, not production certification.',40,690);
  }
  const report={owner:'zen-mahjong-moonlit-v3',sectionId:group.id,libraryId:lib.id,status:'Built; visual QA pending',productionFinal:false,screens:homes.map(f=>({id:f.id,name:f.name,width:f.width,height:f.height})),components:lib.findAllWithCriteria({types:['COMPONENT']}).map(n=>({id:n.id,name:n.name})),changedNodeIds:changed,pending:['Rendered visual review','Daily Challenge and Journey detail destinations','Physical-device validation']};
  lib.setPluginData('report',JSON.stringify(report));lib.setPluginData('status',report.status);group.setPluginData('report',JSON.stringify(report));
  await figma.setCurrentPageAsync(sp);
  if(!sp.flowStartingPoints.some(p=>p.nodeId===first.id))sp.flowStartingPoints=[...sp.flowStartingPoints,{nodeId:first.id,name:'Moonlit Garden V3'}];
  figma.currentPage.selection=[first];figma.viewport.scrollAndZoomIntoView([first]);
  return report;
}
finishHome().then(r=>figma.closePlugin('Home completed: '+r.screens.length+' layouts. Ready for visual review.')).catch(e=>figma.closePlugin('Home repair stopped: '+e.message));
