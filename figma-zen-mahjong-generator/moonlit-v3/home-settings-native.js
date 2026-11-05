async function updateHomeAndSettings() {
  await figma.loadAllPagesAsync();
  if (!/Moonlit.*V3/i.test(figma.root.name)) throw new Error('Open Moonlit Garden V3 first.');
  const OWNER='zen-mahjong-moonlit-v3-settings';
  const sp=figma.root.children.find(p => /Screens$/.test(p.name));
  const cp=figma.root.children.find(p => /Components$/.test(p.name));
  const fp=figma.root.children.find(p => /Foundations$/.test(p.name));
  const homeGroup=sp.children.find(n => n.getPluginData('owner')==='zen-mahjong-moonlit-v3');
  const homeLib=cp.children.find(n => n.getPluginData('owner')==='zen-mahjong-moonlit-v3');
  const homes=homeGroup.children.filter(n => n.type==='FRAME' && n.children.some(c => c.name==='Destinations'));
  if (homes.length!==5) throw new Error('Expected five Home layouts. Found '+homes.length+'.');
  const regular={family:'Inter',style:'Regular'},display={family:'Cormorant Garamond',style:'Medium'};
  await figma.loadFontAsync(regular);await figma.loadFontAsync(display);
  const colors=await figma.variables.getLocalVariablesAsync('COLOR');
  const collection=(await figma.variables.getLocalVariableCollectionsAsync()).find(c => c.name==='Zen Mahjong / Moonlit V3');
  const paint=name => figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:0,g:0,b:0}},'color',colors.find(v => v.variableCollectionId===collection.id && v.name==='color/'+name));
  const bg=homeLib.findOne(n => n.type==='COMPONENT' && n.name==='V3/Background/Moonlit Garden');
  const navBack=cp.findOne(n => n.type==='COMPONENT' && n.name==='V2/Navigation/Back');
  const sourceToggle=cp.findOne(n => n.type==='COMPONENT_SET' && n.name==='V2/Toggle');
  const primary=homeLib.findOne(n => n.type==='COMPONENT_SET' && n.name==='V3/Home/Primary Action');
  const marbleHash=primary.children[0].findOne(n => n.type==='RECTANGLE').fills.find(p => p.type==='IMAGE').imageHash;
  if (!bg || !navBack || !sourceToggle) throw new Error('Required shared components missing.');
  async function react(n,a){await n.setReactionsAsync([{trigger:{type:'ON_CLICK'},action:a,actions:[a]}]);}
  async function navigate(n,d){await react(n,{type:'NODE',destinationId:d.id,navigation:'NAVIGATE',transition:null,preserveScrollPosition:false});}
  function frame(p,name,w,h,component=false){const n=component?figma.createComponent():figma.createFrame();p.appendChild(n);n.name=name;n.resize(w,h);n.fills=[];return n;}
  function text(p,name,value,x,y,w,size=16,heading=false,color='ink'){
    const n=figma.createText();p.appendChild(n);n.name=name;n.fontName=heading?display:regular;n.fontSize=size;n.lineHeight={unit:'PIXELS',value:Math.ceil(size*1.3)};n.letterSpacing={unit:'PIXELS',value:0};n.characters=value;n.textAutoResize='HEIGHT';n.resize(w,n.height);n.x=x;n.y=y;n.fills=[paint(color)];return n;
  }
  function instance(p,m,name,x,y,w=m.width,h=m.height){const n=m.createInstance();p.appendChild(n);n.name=name;n.resize(w,h);n.x=x;n.y=y;return n;}
  function set(n,name,value){const k=Object.keys(n.componentProperties).find(k => k.startsWith(name+'#'));if(k)n.setProperties({[k]:value});}
  const existing=sp.findOne(n => n.type==='FRAME' && /^Settings \/ 390 [x\u00d7] 844$/.test(n.name));
  if (!existing) throw new Error('Existing Settings screen not found.');
  await figma.setCurrentPageAsync(fp);
  if (existing.getPluginData('settingsBackup')!=='yes') {
    const backup=existing.clone();fp.appendChild(backup);backup.name='Reference / Previous Settings Study';backup.x=80;backup.y=2440;
    existing.setPluginData('settingsBackup','yes');
  }
  await figma.setCurrentPageAsync(cp);
  let lib=cp.children.find(n => n.getPluginData('owner')===OWNER);
  if (!lib) {lib=frame(cp,'05 Settings Components',2200,700);lib.x=80;lib.y=4900;lib.setPluginData('owner',OWNER);}
  let toggles=lib.findOne(n => n.type==='COMPONENT_SET' && n.name==='V3/Settings/Toggle');
  if (!toggles) {toggles=sourceToggle.clone();lib.appendChild(toggles);toggles.name='V3/Settings/Toggle';toggles.x=0;toggles.y=60;}
  const on=toggles.children.find(n => n.name==='State=On'),off=toggles.children.find(n => n.name==='State=Off');
  for (const [from,to] of [[on,off],[off,on]]) await react(from,{type:'NODE',destinationId:to.id,navigation:'CHANGE_TO',transition:null,preserveScrollPosition:false});
  let row=lib.findOne(n => n.type==='COMPONENT' && n.name==='V3/Settings/Toggle Row');
  if (!row) {
    row=frame(lib,'V3/Settings/Toggle Row',358,56,true);row.x=340;row.y=60;
    const surface=figma.createRectangle();row.appendChild(surface);surface.name='Ivory marble';surface.resize(358,56);surface.cornerRadius=8;
    surface.fills=[{type:'IMAGE',imageHash:marbleHash,scaleMode:'CROP',imageTransform:[[640/1448,0,450/1448],[0,250/1086,700/1086]]}];surface.constraints={horizontal:'STRETCH',vertical:'STRETCH'};
    const label=text(row,'Label','Music',16,18,254,15);label.componentPropertyReferences={characters:row.addComponentProperty('Label','TEXT','Music')};label.constraints={horizontal:'STRETCH',vertical:'CENTER'};
    const control=instance(row,on,'Toggle',286,4,56,48);control.constraints={horizontal:'MAX',vertical:'CENTER'};
    control.componentPropertyReferences={mainComponent:row.addComponentProperty('Control','INSTANCE_SWAP',on.id)};
  }
  let navRow=lib.findOne(n => n.type==='COMPONENT' && n.name==='V3/Settings/Navigation Row');
  if (!navRow) {
    navRow=row.clone();lib.appendChild(navRow);navRow.name='V3/Settings/Navigation Row';navRow.x=750;navRow.y=60;
    navRow.children.find(n => n.name==='Toggle').remove();
    const arrow=text(navRow,'Chevron','\u203a',314,13,28,23);arrow.textAlignHorizontal='CENTER';arrow.constraints={horizontal:'MAX',vertical:'CENTER'};
    navRow.description='Design destination; service integrations remain pending.';
  }
  if (!lib.children.some(n => n.name==='Library heading')) text(lib,'Library heading','Settings / Moonlit Garden',0,0,650,20);
  await figma.setCurrentPageAsync(sp);
  let section=sp.children.find(n => n.getPluginData('owner')===OWNER);
  if (!section) {section=figma.createSection();sp.appendChild(section);section.name='03 Settings Screens / Moonlit Garden';section.x=0;section.y=6720;section.resizeWithoutConstraints(2200,1100);section.setPluginData('owner',OWNER);section.fills=[];}
  const groups=[['Audio',['Music','Ambient sound','Sound effects']],['Gameplay',['Haptic feedback','Auto hints']],['Appearance',['Reduced motion','High contrast']],['Notifications',['Daily reminder']],['Privacy and Support',['Consent preferences','Restore purchases','Help']]];
  const defaultOff=new Set(['Auto hints','Reduced motion','High contrast','Daily reminder']);
  const sizes=[[390,844],[360,800],[412,915],[430,932]];
  const settings=[];
  for (const [i,[w,h]] of sizes.entries()) {
    const name='Settings / '+w+' x '+h;
    let screen=i===0?existing:section.children.find(n => n.name===name);
    if (!screen) screen=frame(section,name,w,h);
    section.appendChild(screen);screen.name=name;screen.x=i*510;screen.y=0;screen.resize(w,h);screen.clipsContent=true;
    for (const child of [...screen.children]) child.remove();
    instance(screen,bg,'Garden',0,0,w,h);
    const wash=frame(screen,'Readability wash',w,h);wash.fills=[paint('cool')];wash.opacity=.62;
    const back=instance(screen,navBack,'Back',16,56,48,48);await react(back,{type:'BACK'});
    const title=text(screen,'Page title','Settings',76,59,w-152,32,true,'light');title.textAlignHorizontal='CENTER';
    const scroll=frame(screen,'Scrollable settings',w-32,h-164);scroll.x=16;scroll.y=132;scroll.clipsContent=true;scroll.overflowDirection='VERTICAL';
    const content=frame(scroll,'Settings content',w-32,996);content.x=0;content.y=0;
    let y=0;
    for (const [category,labels] of groups) {
      text(content,category,category,8,y,w-48,24,true,'light');y+=36;
      for (const label of labels) {
        const toggle=category!=='Privacy and Support';
        const n=instance(content,toggle?row:navRow,label,0,y,w-32,56);set(n,'Label',label);
        if (toggle) set(n,'Control',defaultOff.has(label)?off.id:on.id);
        n.setPluginData('designNote',toggle?'Interactive visual prototype only; not persisted app preferences.':'Destination layout pending service integration.');
        y+=64;
      }
      y+=12;
    }
    text(content,'App name','Zen Mahjong',8,y,w-48,18,true,'light');y+=28;
    content.resize(w-32,y+20);
    screen.setPluginData('owner',OWNER);settings.push(screen);
  }
  const audit=[];
  for (const home of homes) {
    const hud=home.children.find(n => n.name==='HUD / Safe top 56');
    const currency=hud.children.find(n => n.name==='Currency');currency.x=hud.width-currency.width;currency.y=0;
    currency.constraints={horizontal:'MAX',vertical:'MIN'};
    const gear=home.children.find(n => n.name==='Settings') || hud.children.find(n => n.name==='Settings');
    if (!gear) throw new Error('Settings icon missing on '+home.name);
    home.appendChild(gear);gear.name='Settings';gear.resize(48,48);
    const action=home.children.find(n => n.name==='Continue');const actionBottom=action.y+action.height;
    const regionBottom=home.height-32;gear.x=(home.width-48)/2;gear.y=actionBottom+(regionBottom-actionBottom-48)/2;
    gear.constraints={horizontal:'CENTER',vertical:'MAX'};
    const destination=settings.find(n => n.width===home.width) || settings[0];await navigate(gear,destination);
    const rightMargin=home.width-(hud.x+currency.x+currency.width);
    if (rightMargin!==16 || gear.y<actionBottom || gear.y+48>regionBottom) throw new Error('Home margin check failed on '+home.name);
    audit.push({id:home.id,name:home.name,coinRightMargin:rightMargin,coinTop:56,settingsX:gear.x,settingsY:gear.y,settingsSize:48,settingsCentered:gear.x+24===home.width/2,gapAfterContinue:gear.y-actionBottom,bottomClearance:home.height-gear.y-48,settingsDestination:destination.id});
  }
  const report={status:'Home and Settings built; rendered review pending',productionFinal:false,homeAudit:audit,settings:settings.map(n => ({id:n.id,name:n.name,width:n.width,height:n.height,scrollViewport:n.children.find(c => c.name==='Scrollable settings').height})),pending:['Physical-device validation','Privacy, purchase-restoration and help destinations','Preference persistence and OS permissions']};
  section.setPluginData('report',JSON.stringify(report));lib.setPluginData('report',JSON.stringify(report));
  figma.currentPage.selection=[homes[0],settings[0]];figma.viewport.scrollAndZoomIntoView([settings[0]]);
}
