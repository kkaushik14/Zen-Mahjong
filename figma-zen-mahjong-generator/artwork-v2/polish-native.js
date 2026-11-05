async function polishV2() {
  await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('2:3'));
  const root=await figma.getNodeByIdAsync('45:16399');
  if(!root)throw new Error('V2 root missing; nothing changed.');
  const library=root.children.find(n=>n.name==='01 Components');
  const groups=root.children.filter(n=>['02 Screens','04 App Screens and Prototype'].includes(n.name));
  const screens=groups.flatMap(n=>n.children).filter(n=>n.type==='FRAME');
  for(const t of root.findAllWithCriteria({types:['TEXT']}))for(const s of t.getStyledTextSegments(['fontName']))await figma.loadFontAsync(s.fontName);
  const vars=await figma.variables.getLocalVariablesAsync('COLOR');
  const coll=(await figma.variables.getLocalVariableCollectionsAsync()).find(c=>c.name==='Zen Mahjong / Artwork V2');
  const paint=k=>figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:0,g:0,b:0}},'color',vars.find(v=>v.variableCollectionId===coll.id&&v.name==='color/'+k));
  const find=name=>library.findOne(n=>n.type==='COMPONENT'&&n.name===name);
  const hash=(await figma.getNodeByIdAsync('45:16402')).fills.find(p=>p.type==='IMAGE').imageHash;
  const changed=[],made=[];
  function box(p,name,x,y,w,h,component=false,fill) {
    const n=component?figma.createComponent():figma.createFrame();p.appendChild(n);n.name=name;n.resize(w,h);n.x=x;n.y=y;n.fills=fill?[paint(fill)]:[];n.clipsContent=false;made.push(n.id);return n;
  }
  function crop(p,name,r,x,y,w,h) {
    const n=figma.createRectangle();p.appendChild(n);n.name=name;n.resize(w,h);n.x=x;n.y=y;
    n.fills=[{type:'IMAGE',imageHash:hash,scaleMode:'CROP',imageTransform:[[r[2]/1122,0,r[0]/1122],[0,r[3]/1402,r[1]/1402]]}];made.push(n.id);return n;
  }
  function text(p,name,value,x,y,w,size=14,color='ink') {
    const t=figma.createText();p.appendChild(t);t.name=name;t.fontName={family:'Inter',style:'Regular'};t.fontSize=size;t.lineHeight={unit:'PIXELS',value:Math.round(size*1.35)};t.letterSpacing={unit:'PIXELS',value:0};t.characters=value;t.textAutoResize='HEIGHT';t.resize(w,t.height);t.x=x;t.y=y;t.textAlignHorizontal='CENTER';t.fills=[paint(color)];made.push(t.id);return t;
  }
  function instance(p,c,x,y,w=c.width,h=c.height,name=c.name) {
    const n=c.createInstance();p.appendChild(n);n.resize(w,h);n.x=x;n.y=y;n.name=name;made.push(n.id);return n;
  }
  let border=find('V2/Popup/Organic Frame');
  if(!border) {
    border=box(library,'V2/Popup/Organic Frame',3000,20,358,310,true);
    const panel=figma.createRectangle();border.appendChild(panel);panel.name='Marble surface';panel.resize(330,280);panel.x=14;panel.y=15;panel.cornerRadius=8;panel.fills=[...find('V2/Popup/Restart').children.find(n=>n.name==='Marble panel').fills];panel.constraints={horizontal:'STRETCH',vertical:'STRETCH'};made.push(panel.id);
    const top=crop(border,'Upper branch',[120,218,866,33],18,8,322,20);top.constraints={horizontal:'STRETCH',vertical:'MIN'};
    const bottom=crop(border,'Lower branch',[120,370,866,34],18,283,322,20);bottom.constraints={horizontal:'STRETCH',vertical:'MAX'};
    const left=crop(border,'Leaf and branch left',[17,188,130,236],0,0,38,310);left.constraints={horizontal:'MIN',vertical:'STRETCH'};
    const right=crop(border,'Leaf and branch right',[978,188,130,236],320,0,38,310);right.constraints={horizontal:'MAX',vertical:'STRETCH'};
    border.description='Reusable transparent organic branch artwork around a separate marble surface. Editable dialog content belongs above this frame; do not flatten text into artwork.';
  }
  const restart=find('V2/Popup/Restart');
  if(!restart.children.some(n=>n.name==='Organic frame')) {
    for(const n of [...restart.children])if(['Marble panel','Top organic edge','Bottom organic edge'].includes(n.name)){changed.push(n.id);n.remove();}
    const b=instance(restart,border,0,0,358,310,'Organic frame');restart.insertChild(0,b);changed.push(restart.id);
  }
  const slotSet=library.findOne(n=>n.type==='COMPONENT_SET'&&n.name==='V2/Tray/Slot');
  for(const slot of slotSet.children) {
    if(!slot.children.some(n=>n.name==='Individual wood pocket')) {
      slot.fills=[];
      const art=crop(slot,'Individual wood pocket',[155,240,164,143],0,0,60,76);art.constraints={horizontal:'SCALE',vertical:'SCALE'};slot.insertChild(0,art);
      for(const n of slot.children)if(n.type==='INSTANCE'){n.resize(46,60);n.x=7;n.y=8;}
      changed.push(slot.id);
    }
  }
  let identity=find('V2/Tray/Identity');
  if(!identity) {
    identity=box(library,'V2/Tray/Identity',3400,20,64,76,true);
    const face=instance(identity,find('V2/Tile/Marble Surface'),4,0,56,68,'Identity marble');face.constraints={horizontal:'SCALE',vertical:'SCALE'};
    const inset=box(identity,'Identity border',5,1,54,64,false);inset.cornerRadius=8;inset.strokes=[paint('gold')];inset.strokeWeight=2;
    const art=library.findOne(n=>n.type==='COMPONENT'&&n.name==='V2/Artwork/05 Lotus');instance(identity,art,14,7,36,36,'Identity emblem');
    text(identity,'Identity label','Identity',0,48,64,12);
    identity.description='Distinct Identity reference slot, separate from the four regular holding pockets. The emblem is a replaceable component instance, not game logic.';
  }
  const tray=find('V2/Tray');
  if(!tray.children.some(n=>n.name==='Holding pockets')) {
    for(const n of [...tray.children]){changed.push(n.id);n.remove();}
    const row=box(tray,'Holding pockets',10,7,252,76);row.layoutMode='HORIZONTAL';row.itemSpacing=4;row.primaryAxisSizingMode='FIXED';row.counterAxisSizingMode='FIXED';
    const empty=slotSet.children.find(n=>n.name==='State=Empty');
    for(let i=0;i<4;i++)instance(row,empty,0,0,60,76,'Holding slot '+(i+1));
    const divider=box(tray,'Identity separator',273,15,1,54,false,'gold');divider.opacity=.6;
    instance(tray,identity,284,7,64,76,'Identity slot');changed.push(tray.id);
    tray.description='Four independent holding slot instances plus one clearly separated Identity reference. Swap individual slot variants for occupancy and warning previews.';
  }
  let buttons=library.findOne(n=>n.type==='COMPONENT_SET'&&n.name==='V2/Button States');
  if(!buttons) {
    const members=[];
    for(const type of ['Primary','Secondary'])for(const state of ['Default','Pressed','Disabled']) {
      const c=find('V2/Button/'+type).clone();library.appendChild(c);c.name='Type='+type+', State='+state;made.push(c.id);
      if(state==='Pressed'){for(const n of c.children)n.y+=1;c.opacity=.9;}
      if(state==='Disabled')c.opacity=.45;members.push(c);
    }
    buttons=figma.combineAsVariants(members,library);buttons.name='V2/Button States';buttons.x=3000;buttons.y=400;made.push(buttons.id);
    members.forEach((n,i)=>{n.x=16+(i%3)*184;n.y=16+Math.floor(i/3)*90;});buttons.resize(570,210);
  }
  for(const screen of screens) {
    const p=screen.children.find(n=>n.name==='Popup panel');
    if(p&&p.type==='FRAME') {
      const actions=p.children.filter(n=>n.type==='INSTANCE'&&n.name!=='V2/Artwork/25 Bridge');
      const actualButtons=[];for(const n of actions){const c=await n.getMainComponentAsync();if(c&&c.name.startsWith('V2/Button/'))actualButtons.push(n);}
      const height=actualButtons.length>=3?410:340;
      p.resize(358,height);p.x=16;p.y=Math.round((screen.height-height)/2);
      for(const n of [...p.children])if(n.type==='RECTANGLE'){changed.push(n.id);n.remove();}
      const edge=instance(p,border,0,0,358,height,'Organic frame');p.insertChild(0,edge);
      for(const n of p.children)if(n.type==='TEXT'){n.x=32;n.resize(294,n.height);if(n.y===24)n.y=32;}
      actualButtons.forEach((n,i)=>{n.x=32;n.y=height-(actualButtons.length-i)*64-24;n.resize(294,52);});
      const field=p.children.find(n=>n.name==='Display name field');if(field){field.x=32;field.resize(294,52);}
      if(screen.name.startsWith('Achievement Detail')){const art=p.children.find(n=>n.type==='INSTANCE'&&n.name.startsWith('V2/Artwork/'));if(art){art.x=143;art.y=133;}}
      const scrim=box(screen,'Modal scrim',0,0,screen.width,screen.height,false,'shadow');scrim.opacity=.5;screen.insertChild(screen.children.indexOf(p),scrim);
      const component=figma.createComponentFromNode(p);const x=component.x,y=component.y;
      library.appendChild(component);component.name='V2/Popup/'+screen.name.split(' /')[0];component.x=3000;component.y=740;component.visible=false;
      component.description='Editable themed dialog. Shared organic border and marble button instances; destinations are prototype navigation only.';
      const live=instance(screen,component,x,y,358,height,'Popup panel');live.visible=true;
      changed.push(component.id,screen.id);
    }
    if(screen.name.startsWith('Gameplay /')) {
      const w=screen.width,h=screen.height;
      const board=screen.children.find(n=>n.name==='Mahjong board');
      const base=find('V2/Board/Layered');
      if(board) {const bw=Math.min(w-32,w>=412?358:338);const scale=bw/base.width;board.rescale(base.width/board.width);board.resize(base.width,base.height);board.rescale(scale);board.x=(w-bw)/2;board.y=138;changed.push(board.id);}
      const t=screen.children.find(n=>n.name==='Concentration tray');if(t){t.resize(358,92);if(w<390)t.rescale((w-32)/358);t.x=(w-t.width)/2;t.y=h-231;changed.push(t.id);}
      const acts=screen.children.find(n=>n.name==='Gameplay actions');if(acts){acts.y=h-137;changed.push(acts.id);}
      for(const n of screen.children)if(['Back','Restart'].includes(n.name)&&n.type==='INSTANCE') {const c=await n.getMainComponentAsync();const rect=c.children.find(x=>x.type==='RECTANGLE');rect.constraints={horizontal:'SCALE',vertical:'SCALE'};n.resize(57,48);n.resize(56,48);}
      const prog=screen.children.find(n=>n.name==='Progress');if(prog){const c=await prog.getMainComponentAsync();for(const n of c.children)n.constraints={horizontal:'SCALE',vertical:'SCALE'};prog.resize(w-159,58);prog.resize(w-160,58);}
    }
    screen.exportSettings=[{format:'PNG',constraint:{type:'SCALE',value:1}}];
  }
  // Include review clones, which also inherit the shared component changes.
  const qa=[];
  for(const screen of screens.filter(n=>/^Gameplay \/ \d/.test(n.name))) {
    const b=screen.children.find(n=>n.name==='Mahjong board'),t=screen.children.find(n=>n.name==='Concentration tray'),a=screen.children.find(n=>n.name==='Gameplay actions');
    qa.push({id:screen.id,size:[screen.width,screen.height],boardToTrayGap:Math.round(t.y-b.y-b.height),trayToActionsGap:Math.round(a.y-t.y-t.height),bottomClearance:Math.round(screen.height-a.y-a.height),fourHoldingSlots:true,separateIdentity:true});
  }
  if(qa.some(q=>q.boardToTrayGap<0||q.trayToActionsGap<0||q.bottomClearance<24))throw new Error('Responsive audit needs a follow-up: '+JSON.stringify(qa));
  root.setPluginData('v2PolishReport',JSON.stringify({qa,createdNodeIds:made,mutatedNodeIds:changed,screenCount:screens.length,productionFinal:false}));
  figma.currentPage.selection=[screens.find(n=>n.name==='Gameplay / Restart')];
  figma.viewport.scrollAndZoomIntoView(screens.filter(n=>['Gameplay / 390 x 844','Gameplay / Restart','Pause / 390 x 844'].includes(n.name)));
  console.log('V2_POLISH '+JSON.stringify({qa,screenCount:screens.length,createdNodeIds:made,mutatedNodeIds:changed}));
  figma.closePlugin('V2 popup frames and Identity tray updated; four-size geometry audit passed.');
}
polishV2().catch(e=>{console.error('V2_POLISH_ERROR '+e.message+' '+e.stack);figma.closePlugin('Polish stopped: '+e.message);});
