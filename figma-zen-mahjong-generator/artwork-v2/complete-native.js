async function completeV2() {
  const page = await figma.getNodeByIdAsync('2:3');
  await figma.setCurrentPageAsync(page);
  const root = await figma.getNodeByIdAsync('45:16399');
  const library = root.children.find(n => n.name === '01 Components');
  let screens = root.children.find(n => n.name === '02 Screens');
  if (!library || !screens) throw new Error('Run the component build first.');
  const font = {family:'Inter',style:'Regular'};
  const display = {family:'Cormorant Garamond',style:'Medium'};
  await figma.loadFontAsync(font); await figma.loadFontAsync(display);
  const variables = await figma.variables.getLocalVariablesAsync('COLOR');
  const coll = (await figma.variables.getLocalVariableCollectionsAsync()).find(c => c.name === 'Zen Mahjong / Artwork V2');
  const token = name => variables.find(v => v.variableCollectionId === coll.id && v.name === 'color/'+name);
  const paint = name => figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:0,g:0,b:0}},'color',token(name));
  const find = name => library.findOne(n => n.type === 'COMPONENT' && n.name === name);
  const created=[];
  function frame(p,name,x,y,w,h,fill,component=false) {
    const n=component?figma.createComponent():figma.createFrame(); p.appendChild(n); n.name=name; n.resize(w,h); n.x=x;n.y=y;n.fills=fill?[paint(fill)]:[];n.clipsContent=false;created.push(n.id);return n;
  }
  function text(p,value,x,y,w,size=16,color='ink',heading=false) {
    const n=figma.createText();p.appendChild(n);n.name=value;n.fontName=heading?display:font;n.fontSize=size;n.characters=value;n.letterSpacing={unit:'PIXELS',value:0};n.lineHeight={unit:'PIXELS',value:Math.round(size*1.35)};n.textAutoResize='HEIGHT';n.resize(w,n.height);n.x=x;n.y=y;n.fills=[paint(color)];created.push(n.id);return n;
  }
  function center(p,value,y,size=24,color='ink',heading=true) {const n=text(p,value,0,y,p.width,size,color,heading);n.textAlignHorizontal='CENTER';return n;}
  function instance(p,m,x,y,w=m.width,h=m.height,name=m.name) {const n=m.createInstance();p.appendChild(n);n.name=name;n.resize(w,h);n.x=x;n.y=y;created.push(n.id);return n;}
  function button(p,value,x,y,w=294,primary=false) {
    const n=instance(p,find('V2/Button/'+(primary?'Primary':'Secondary')),x,y,w,52,value);
    const key=Object.keys(n.componentProperties).find(k=>k.startsWith('Label#'));n.setProperties({[key]:value});return n;
  }
  function swapArt(p,index,x,y,size=64) {const art=library.findAllWithCriteria({types:['COMPONENT']}).filter(n=>n.name.startsWith('V2/Artwork/')).sort((a,b)=>a.name.localeCompare(b.name));return instance(p,art[index],x,y,size,size);}
  function marble(p,name,x,y,w,h) {
    const n=frame(p,name,x,y,w,h);const image=figma.createRectangle();n.appendChild(image);image.resize(w,h);image.cornerRadius=8;
    image.fills=[...find('V2/Popup/Restart').children.find(c=>c.name==='Marble panel').fills];created.push(image.id);return n;
  }
  async function link(n,dest) {
    const action={type:'NODE',destinationId:dest.id,navigation:'NAVIGATE',transition:null,preserveScrollPosition:false};
    await n.setReactionsAsync([{trigger:{type:'ON_CLICK'},action,actions:[action]}]);
  }
  // These exact IDs were read back after the failed phase; they contain only this plugin's partial build.
  for(const id of ['56:17568','56:17569']) {const n=await figma.getNodeByIdAsync(id);if(n)n.remove();}
  if(screens.type==='FRAME') {
    const group=figma.createSection();root.appendChild(group);group.name=screens.name;group.x=screens.x;group.y=screens.y;group.resizeWithoutConstraints(screens.width,screens.height);group.fills=[];
    for(const child of [...screens.children]){const x=child.x,y=child.y;group.appendChild(child);child.x=x;child.y=y;}
    created.push(group.id);screens.remove();screens=group;
  }
  let extra = root.children.find(n=>n.name==='04 App Screens and Prototype');
  if (!extra) {
    extra=figma.createSection();root.appendChild(extra);extra.name='04 App Screens and Prototype';extra.x=60;extra.y=5530;extra.resizeWithoutConstraints(4240,3150);extra.fills=[];created.push(extra.id);
    library.resize(4240,1720);
    root.resizeWithoutConstraints(4400,8800);
    const cool=find('V2/Background/Cool Garden'), loadingBg=find('V2/Background/Loading');
    const home=screens.children.find(n=>n.name==='Home / 390 x 844');
    const game=screens.children.find(n=>n.name==='Gameplay / 390 x 844');
    const restart=screens.children.find(n=>n.name==='Gameplay / Restart');
    const all={Home:home,Gameplay:game,Restart:restart};
    const utility=frame(library,'V2 / App Components',20,800,4150,850);
    const toggleItems=[];
    for (const [i,state] of ['On','Off','Disabled'].entries()) {
      const m=frame(utility,'State='+state,i*88,20,56,48,undefined,true);
      const track=frame(m,'Track',0,10,56,28,state==='On'?'jade':'sage');track.cornerRadius=14;
      const thumb=figma.createEllipse();m.appendChild(thumb);thumb.resize(22,22);thumb.x=state==='On'?31:3;thumb.y=13;thumb.fills=[paint('ivory')];created.push(thumb.id);
      if(state==='Disabled')m.opacity=.4;toggleItems.push(m);
    }
    const toggles=figma.combineAsVariants(toggleItems,utility);toggles.name='V2/Toggle';toggles.x=0;toggles.y=0;toggles.resize(280,88);created.push(toggles.id);
    const row=marble(utility,'V2/Settings/Row',310,0,342,62);
    const rowComponent=figma.createComponentFromNode(row);rowComponent.name='V2/Settings/Row';created.push(rowComponent.id);
    const title=text(rowComponent,'Music',16,19,240,16);const titleProp=rowComponent.addComponentProperty('Label','TEXT','Music');title.componentPropertyReferences={characters:titleProp};instance(rowComponent,toggleItems[0],270,7,56,48,'Toggle');
    const metric=frame(utility,'V2/Stats/Metric',700,0,150,70,undefined,true);
    const mv=text(metric,'24',0,0,150,30,'ink',true),ml=text(metric,'Boards completed',0,43,150,12);
    mv.componentPropertyReferences={characters:metric.addComponentProperty('Value','TEXT','24')};ml.componentPropertyReferences={characters:metric.addComponentProperty('Label','TEXT','Boards completed')};
    const dayItems=[];
    for (const [i,state] of ['Played','Missed','Today'].entries()) {
      const d=frame(utility,'State='+state,900+i*54,0,44,44,state==='Played'?'jade':'ivory',true);d.cornerRadius=22;
      const t=center(d,'7',10,15,state==='Played'?'light':'ink',false);t.componentPropertyReferences={characters:d.addComponentProperty('Day','TEXT','7')};
      if(state==='Today'){d.strokes=[paint('gold')];d.strokeWeight=2;}dayItems.push(d);
    }
    const days=figma.combineAsVariants(dayItems,utility);days.name='V2/Calendar/Day';days.x=900;days.y=0;days.resize(180,76);created.push(days.id);dayItems.forEach((d,i)=>{d.x=8+i*54;d.y=8;});
    const actionSet=[];
    for(const [i,type] of ['Undo','Hint','Shuffle','More'].entries())for(const [j,state]of ['Default','Pressed','Disabled','Zero'].entries()) {
      const source=find('V2/Action/'+type);const m=source.clone();utility.appendChild(m);m.name='Type='+type+', State='+state;m.x=1100+i*110;m.y=j*125;created.push(m.id);
      if(state==='Pressed')m.opacity=.85;if(state==='Disabled'||state==='Zero')m.opacity=.4;
      if(state==='Zero'&&type!=='More')m.findOne(n=>n.type==='TEXT'&&n.name==='Count').characters='0';actionSet.push(m);
    }
    const actions=figma.combineAsVariants(actionSet,utility);actions.name='V2/GameplayAction';actions.x=1120;actions.y=0;actions.resize(440,510);created.push(actions.id);actionSet.forEach((m,i)=>{m.x=8+Math.floor(i/4)*105;m.y=8+(i%4)*125;});
    const slotItems=[];
    for(const [i,state]of ['Empty','Occupied','Newly Added','Matching','Clearing','Almost Full','Full','Disabled'].entries()) {
      const m=frame(utility,'State='+state,0,0,60,76,'shadow',true);m.cornerRadius=8;m.strokes=[paint(state==='Full'?'orange':state==='Matching'?'jade':'gold')];m.strokeWeight=2;
      if(!['Empty','Disabled'].includes(state))instance(m,find('V2/Tile/Marble Surface'),6,6,48,63);if(['Clearing','Disabled'].includes(state))m.opacity=.4;slotItems.push(m);
    }
    const slots=figma.combineAsVariants(slotItems,utility);slots.name='V2/Tray/Slot';slots.x=1600;slots.y=0;slots.resize(330,190);created.push(slots.id);slotItems.forEach((s,i)=>{s.x=8+i%4*78;s.y=8+Math.floor(i/4)*90;});
    function app(name,i,bg=cool) {const f=frame(extra,name+' / 390 x 844',(i%8)*480,Math.floor(i/8)*990,390,844);f.clipsContent=true;instance(f,bg,0,0,390,844,'Garden');const wash=frame(f,'Readability wash',0,0,390,844,'cool');wash.opacity=.35;const b=instance(f,find('V2/Navigation/Back'),16,56,56,48,'Back');center(f,name,61,34,'light');all[name]=f;link(b,home);f.exportSettings=[{format:'PNG',constraint:{type:'SCALE',value:2}}];return f;}
    function shell(f,y=136,h=570){return marble(f,'Content surface',24,y,342,h);}
    function metricAt(p,value,label,x,y){const n=instance(p,metric,x,y,150,70);const props={};for(const k of Object.keys(n.componentProperties)){if(k.startsWith('Value#'))props[k]=value;if(k.startsWith('Label#'))props[k]=label;}n.setProperties(props);return n;}
    const loading=app('Loading',0,loadingBg);loading.children.filter(n=>n.name==='Back'||n.type==='TEXT').forEach(n=>n.visible=false);swapArt(loading,4,145,218,100);center(loading,'Zen Mahjong',336,44,'light');center(loading,'Breathe · Match · Be Present',403,18,'light');center(loading,'Preparing your garden...',566,16,'light',false);const loadNext=button(loading,'Enter Garden',48,692,294);await link(loadNext,home);
    const profile=app('Profile',1);const ps=shell(profile);swapArt(ps,11,133,24,76);center(ps,'Garden Wanderer',110,31);center(ps,'Local profile',157,13,'sage',false);metricAt(ps,'24','Boards completed',20,216);metricAt(ps,'7 days','Current streak',180,216);metricAt(ps,'12 days','Best streak',20,310);metricAt(ps,'6','Daily challenges',180,310);const edit=button(ps,'Edit Profile',24,430,294);text(ps,'Progress saved on this device',20,511,302,12,'sage');
    const settings=app('Settings',2);const scroll=frame(settings,'Scrollable settings',24,136,342,644);scroll.clipsContent=true;scroll.overflowDirection='VERTICAL';
    let sy=0;for(const [section,rows] of [['Audio',['Music','Ambient sound','Sound effects']],['Gameplay',['Haptic feedback','Auto hints']],['Appearance',['Reduced motion','High contrast']],['Notifications',['Daily reminder']],['Privacy and Support',['Consent preferences','Restore purchases','Help','Version 0.1']]]) {
      text(scroll,section,4,sy,330,24,'light',true);sy+=44;for(const title of rows){const n=instance(scroll,rowComponent,0,sy,342,62,title);n.setProperties({[Object.keys(n.componentProperties).find(k=>k.startsWith('Label#'))]:title});if(section==='Privacy and Support')n.findOne(c=>c.name==='Toggle').visible=false;sy+=74;}sy+=20;
    }
    const completion=app('Board Complete',3);swapArt(completion,4,137,140,116);const cs=shell(completion,279,389);center(cs,'A moment well spent',23,29);metricAt(cs,'08:42','Completion time',18,98);metricAt(cs,'1','Hints used',180,98);center(cs,'Garden 12 → Garden 13',205,25);center(cs,'A new step in your journey',253,14,'sage',false);const next=button(completion,'Continue',48,692,294,true);await link(next,game);const doneHome=text(completion,'Home',150,771,90,16,'light');doneHome.textAlignHorizontal='CENTER';await link(doneHome,home);
    const achievements=app('Achievements',4);const as=shell(achievements,136,604);const filters=['All','Journey','Mastery','Streak'];filters.forEach((v,i)=>{const n=text(as,v,14+i*82,18,80,13,i===0?'jade':'ink');});
    for(const [i,a]of [['First Garden','10 boards completed',24,'Unlocked'],['Quiet Focus','Complete without hints',4,'In progress'],['Returning Light','7-day streak',7,'Unlocked'],['Garden Keeper','100 boards completed',11,'Locked']].entries()) {
      const y=78+i*124;swapArt(as,a[2],16,y,66);text(as,a[0],98,y,225,25,'ink',true);text(as,a[1],98,y+37,222,12);text(as,a[3],98,y+67,222,12,'sage');const line=frame(as,'Divider',16,y+104,310,1,'gold');line.opacity=.3;
    }
    const streaks=app('Streaks',5);const ss=shell(streaks,136,604);swapArt(ss,4,139,12,64);center(ss,'7 calm days',81,36);center(ss,'Best streak · 12 days',133,14,'sage',false);text(ss,'This week',18,181,300,25,'ink',true);
    ['M','T','W','T','F','S','S'].forEach((d,i)=>{text(ss,d,18+i*44,223,40,12,'sage');const n=instance(ss,dayItems[i===6?2:0],12+i*45,250,44,44);const p=Object.keys(n.componentProperties).find(k=>k.startsWith('Day#'));n.setProperties({[p]:String(i+1)});});
    text(ss,'October',18,328,300,25,'ink',true);for(let i=0;i<21;i++){const n=instance(ss,dayItems[i===6?2:i<6?0:1],12+(i%7)*45,372+Math.floor(i/7)*51,44,44);n.setProperties({[Object.keys(n.componentProperties).find(k=>k.startsWith('Day#'))]:String(i+1)});}text(ss,'Next milestone · 14 days',18,551,306,18,'ink',true);
    function popup(name,i,title,body,choices) {const f=app(name,i,find('V2/Background/Autumn'));f.children.filter(n=>n.name==='Back'||n.type==='TEXT').forEach(n=>n.visible=false);const board=instance(f,find('V2/Board/Layered'),32,152,326,413);board.opacity=.24;const p=marble(f,'Popup panel',24,253,342,340);center(p,title,24,33);const t=text(p,body,24,83,294,16);t.textAlignHorizontal='CENTER';const nodes=choices.map((c,j)=>button(p,c,24,161+j*62,294,j===0));return {f,p,nodes};}
    const pause=popup('Pause',6,'A quiet pause','Your garden is waiting.',['Resume','Save & Home','Restart Board']);await link(pause.nodes[0],game);await link(pause.nodes[1],home);await link(pause.nodes[2],restart);
    const more=popup('More',7,'Your Garden','',['Resume','Settings','Save & Home']);await link(more.nodes[0],game);await link(more.nodes[1],settings);await link(more.nodes[2],home);
    const editDialog=popup('Edit Profile',8,'Your Profile','Garden Wanderer',['Save','Cancel']);const field=frame(editDialog.p,'Display name field',24,82,294,52,'ivory');field.cornerRadius=8;field.strokes=[paint('gold')];text(field,'Garden Wanderer',14,15,264,16);await link(editDialog.nodes[0],profile);await link(editDialog.nodes[1],profile);await link(edit,editDialog.f);
    const detail=popup('Achievement Detail',9,'First Garden','Ten boards, one growing garden.',['Back to Achievements']);swapArt(detail.p,24,135,195,72);await link(detail.nodes[0],achievements);await link(as,detail.f);
    const appearance=popup('Appearance',10,'Your Atmosphere','Autumn garden · Ivory marble',['Apply','Cancel']);await link(appearance.nodes[0],settings);await link(appearance.nodes[1],settings);
    const noMoves=popup('No Moves',11,'A new arrangement','No available pairs remain.',['Shuffle','Restart Board']);await link(noMoves.nodes[0],game);await link(noMoves.nodes[1],restart);
    const offline=app('Loading Offline',12,loadingBg);offline.children.filter(n=>n.name==='Back'||n.type==='TEXT').forEach(n=>n.visible=false);swapArt(offline,4,145,218,100);center(offline,'Zen Mahjong',336,44,'light');center(offline,'Playing offline',456,20,'light');const ot=text(offline,'Your progress stays on this device and syncs when you reconnect.',44,510,302,16,'light');ot.textAlignHorizontal='CENTER';await link(button(offline,'Enter Garden',48,692,294),home);
    const full=popup('Full Tray',13,'A moment to reset','The holding tray is full.',['Restart Board','Save & Home']);await link(full.nodes[0],restart);await link(full.nodes[1],home);
    for(const [i,[w,h]]of [[412,915],[430,932]].entries()) {const f=game.clone();screens.appendChild(f);created.push(f.id);f.name='Gameplay / '+w+' x '+h;f.resize(w,h);f.x=1940+i*510;f.y=0;for(const n of f.children){if(['Garden','Readability wash'].includes(n.name))n.resize(w,h);if(n.name==='Restart')n.x=w-72;if(n.name==='Progress')n.resize(w-160,58);if(n.name==='Mahjong board')n.x=(w-n.width)/2;if(n.name==='Concentration tray'){n.x=(w-n.width)/2;n.y=h-227;}if(n.name==='Gameplay actions'){n.resize(w-32,105);n.y=h-119;}}}
    await link(home.children.find(n=>n.name==='Continue'),game);
    for(const [name,dest]of [['Profile',profile],['Achievements',achievements],['Settings',settings]])await link(home.findOne(n=>n.name===name&&n.type==='FRAME'),dest);
    await link(home.findOne(n=>n.name==='Streak and Journey'),streaks);
    await link(game.children.find(n=>n.name==='Back'),pause.f);await link(game.children.find(n=>n.name==='Restart'),restart);await link(game.findOne(n=>n.name==='More'&&n.type==='INSTANCE'),more.f);
    const rdialog=restart.children.find(n=>n.name==='Restart dialog');await link(rdialog.findOne(n=>n.name==='Cancel'&&n.type==='INSTANCE'),game);await link(rdialog.findOne(n=>n.name==='Restart'&&n.type==='INSTANCE'),game);
    await link(game.children.find(n=>n.name==='Mahjong board'),completion);
    page.flowStartingPoints=[...page.flowStartingPoints,{nodeId:home.id,name:'Artwork V2 / App Preview'}];
    extra.setPluginData('screenIds',JSON.stringify(Object.values(all).map(n=>n.id)));
    extra.setPluginData('createdNodeIds',JSON.stringify(created));
  }
  const renderFrames=[...screens.children.filter(n=>n.type==='FRAME'),...extra.children.filter(n=>n.type==='FRAME')];
  const exports=[];for(const f of renderFrames){const bytes=await f.exportAsync({format:'PNG',constraint:{type:'SCALE',value:2}});exports.push({name:f.name.replace(/[^a-zA-Z0-9]+/g,'-')+'@2x.png',bytes:Array.from(bytes)});}
  const ledger={sectionId:root.id,libraryId:library.id,screens:renderFrames.map(f=>({id:f.id,name:f.name,width:f.width,height:f.height})),componentCount:library.findAllWithCriteria({types:['COMPONENT']}).length,status:'Theme study, not production final; popup ornament fidelity and full state coverage require review.',createdNodeIds:created};
  exports.push({name:'design-manifest.json',bytes:JSON.stringify(ledger,null,2).split('').map(c=>c.charCodeAt(0))});
  figma.currentPage.selection=[extra];figma.viewport.scrollAndZoomIntoView(extra.children.slice(0,6));
  figma.showUI(`<html><body style="font:14px system-ui;padding:20px"><h2>Artwork V2 Export</h2><p>Theme study renders and design manifest. Not production final.</p><button id="download">Download local ZIP</button><p id="status"></p><script>
    const files=${JSON.stringify(exports)};
    const crc=b=>{let c=0xffffffff;for(let v of b){c^=v;for(let j=0;j<8;j++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;};
    function zip(){let parts=[],central=[],offset=0;const e=new TextEncoder();for(const file of files){let b=new Uint8Array(file.bytes),name=e.encode(file.name),c=crc(b),head=new Uint8Array(30+name.length),v=new DataView(head.buffer);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint32(14,c,true);v.setUint32(18,b.length,true);v.setUint32(22,b.length,true);v.setUint16(26,name.length,true);head.set(name,30);parts.push(head,b);let ce=new Uint8Array(46+name.length),d=new DataView(ce.buffer);d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint32(16,c,true);d.setUint32(20,b.length,true);d.setUint32(24,b.length,true);d.setUint16(28,name.length,true);d.setUint32(42,offset,true);ce.set(name,46);central.push(ce);offset+=head.length+b.length;}let length=central.reduce((n,b)=>n+b.length,0),end=new Uint8Array(22),v=new DataView(end.buffer);v.setUint32(0,0x06054b50,true);v.setUint16(8,files.length,true);v.setUint16(10,files.length,true);v.setUint32(12,length,true);v.setUint32(16,offset,true);return new Blob([...parts,...central,end],{type:'application/zip'});}
    document.getElementById('download').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(zip());a.download='Zen-Mahjong-Artwork-V2-Theme-Study.zip';a.click();document.getElementById('status').textContent='Download requested.';};
  </script></body></html>`,{width:420,height:260});
  console.log(JSON.stringify(ledger));
}
completeV2().catch(error=>{console.error(error);figma.closePlugin('Stopped: '+error.message+'. Inspect new section before rerunning.');});
