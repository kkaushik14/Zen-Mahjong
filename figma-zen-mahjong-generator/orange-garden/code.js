// Additive, design-only generator. Never changes the original design sections.
async function buildOrangeGarden() {
  const PAGE = '03 Screens';
  const ROOT = 'Orange Zen Garden / Gameplay';
  const page = figma.root.children.find(p => p.name === PAGE);
  if (!page) throw new Error('Open the existing Zen Mahjong file with its 03 Screens page.');
  await figma.setCurrentPageAsync(page);
  let root = page.children.find(n => n.type === 'SECTION' && n.name === ROOT);
  if (root && root.getPluginData('orange-garden-version')) {
    figma.viewport.scrollAndZoomIntoView([root]);
    throw new Error('Orange Garden already generated. Existing work was preserved.');
  }
  await Promise.all([
    { family: 'Inter', style: 'Regular' },
    { family: 'Inter', style: 'Medium' },
    { family: 'Inter', style: 'Semi Bold' },
    { family: 'Cormorant Garamond', style: 'Medium' }
  ].map(f => figma.loadFontAsync(f)));
  if (!root) {
    root = figma.createSection(); root.name = ROOT;
    root.x = Math.max(0, ...page.children.filter(n => n.id !== root.id).map(n => n.x + n.width)) + 160;
    root.y = 80;
  }
  root.resizeWithoutConstraints(5400, 4450);
  root.fills = [{ type: 'SOLID', color: rgb('#E7EFED') }];
  root.setPluginData('orange-garden-version', 'building-v1');
  const existingChildren = root.children.slice();
  // Keep the manually created prototype, including any user edits to it.
  existingChildren.forEach((n, i) => { n.x = 4750; n.y = 3700 + i * 200; });

  const palette = {
    orange: '#A95432', orangeDeep: '#713B2D', orangeLight: '#C77C50',
    copper: '#B87650', shadow: '#462C25', branch: '#815637', branchLight: '#C39C6D',
    leaf: '#738659', leafDark: '#435D44', jade: '#2F765A',
    ivory: '#FBF7EB', stone: '#D8CDB4', edge: '#C7B69A', ink: '#1D332B',
    gold: '#B99A58', goldLight: '#E8DDBD', red: '#A43A32',
    coolDark: '#173C3F', coolMid: '#38605F', paper: '#F3ECDD'
  };
  const oldVars = await figma.variables.getLocalVariablesAsync('COLOR');
  const collection = figma.variables.createVariableCollection('Orange Garden / Gameplay');
  const mode = collection.modes[0].modeId;
  const tokens = {};
  for (const [key, hex] of Object.entries(palette)) {
    const variable = figma.variables.createVariable('color/' + key, collection, 'COLOR');
    const existing = oldVars.find(v => Object.values(v.valuesByMode).some(c => c && typeof c.r === 'number' && colorHex(c) === hex));
    variable.setValueForMode(mode, existing ? { type: 'VARIABLE_ALIAS', id: existing.id } : rgb(hex));
    tokens[key] = variable;
  }
  for (const [name, value] of Object.entries({ 'space/4':4,'space/8':8,'space/12':12,'space/16':16,'space/24':24,'radius/tile':7,'radius/control':8,'touch/minimum':48 })) {
    const v = figma.variables.createVariable(name, collection, 'FLOAT'); v.setValueForMode(mode, value);
  }
  function rgb(hex) { const x = parseInt(hex.slice(1), 16); return { r: ((x>>16)&255)/255, g: ((x>>8)&255)/255, b: (x&255)/255 }; }
  function colorHex(c) { return '#' + [c.r,c.g,c.b].map(v => Math.round(v*255).toString(16).padStart(2,'0')).join('').toUpperCase(); }
  function paint(key, opacity=1) { return figma.variables.setBoundVariableForPaint({type:'SOLID',color:rgb(palette[key]),opacity}, 'color', tokens[key]); }
  function node(parent, name, x, y, w, h, fill, type='FRAME', radius=0) {
    const n = type === 'COMPONENT' ? figma.createComponent() : figma.createFrame();
    parent.appendChild(n); n.name=name; n.x=x; n.y=y; n.resize(w,h); n.fills=fill?[paint(fill)]:[];
    n.cornerRadius=radius; n.clipsContent=false; return n;
  }
  function text(parent,name,value,x,y,size=14,color='ivory',display=false,width) {
    const n=figma.createText(); parent.appendChild(n); n.name=name;
    n.fontName=display?{family:'Cormorant Garamond',style:'Medium'}:{family:'Inter',style:'Medium'};
    n.fontSize=size; n.letterSpacing={unit:'PIXELS',value:0}; n.characters=value;
    n.fills=[paint(color)]; n.x=x;n.y=y;
    if(width){n.textAutoResize='HEIGHT';n.resize(width,n.height);n.lineHeight={unit:'PIXELS',value:Math.round(size*1.4)};}
    return n;
  }
  function instance(parent,master,x,y,w,h,name) {
    const n=master.createInstance(); parent.appendChild(n); n.x=x;n.y=y;
    if(w&&h){n.rescale(w/master.width);if(Math.abs(n.height-h)>.01)n.resize(w,h);} if(name)n.name=name; return n;
  }
  function svg(parent,name,w,h,body,x=0,y=0) {
    const n=figma.createNodeFromSvg('<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'">'+body+'</svg>');
    parent.appendChild(n);n.name=name;n.x=x;n.y=y;
    for(const item of [n,...n.findAll()]) for(const prop of ['fills','strokes']) if(prop in item && Array.isArray(item[prop])) {
      item[prop]=item[prop].map(p=>{if(p.type!=='SOLID')return p;const key=Object.keys(palette).find(k=>palette[k]===colorHex(p.color));return key?figma.variables.setBoundVariableForPaint(p,'color',tokens[key]):p;});
    }
    return n;
  }
  function centerText(parent,name,value,y,size,color='ivory') {const t=text(parent,name,value,0,y,size,color,false,parent.width);t.textAlignHorizontal='CENTER';return t;}
  function set(components,name,x,y) {
    const n=figma.combineAsVariants(components,library);n.name=name;n.x=x;n.y=y;
    n.description='Orange Garden gameplay theme. Editable vectors, nested component instances and semantic color bindings. Design only.';
    return n;
  }
  const library=node(root,'01 Components',60,180,5280,1550,null);
  const screens=node(root,'02 Screens',60,1900,5280,1100,null);
  const states=node(root,'03 Screen States and Prototype',60,3060,5280,1100,null);
  text(root,'Title','Orange Zen Garden',60,42,42,'ink',true);
  text(root,'Subtitle','Gameplay design system',62,100,16,'coolMid');
  text(root,'Components Label','01 / COMPONENTS',60,148,12,'coolMid');
  text(root,'Screens Label','02 / RESPONSIVE GAMEPLAY',60,1848,12,'coolMid');
  text(root,'States Label','03 / GAMEPLAY STATES',60,3008,12,'coolMid');

  const leafPath='<path d="M0 18 C-2 3 9-3 19 0 C17 10 10 19 0 18Z" fill="'+palette.leaf+'"/><path d="M1 17L15 3" stroke="'+palette.leafDark+'" stroke-width="1"/>';
  const decoration=node(library,'Game/AmbientDecoration',0,60,390,844,'orange','COMPONENT');decoration.clipsContent=true;
  svg(decoration,'Textured garden surface',390,844,Array.from({length:170},(_,i)=>{const x=(i*83)%390,y=(i*137)%844;return '<path d="M'+x+' '+y+'l'+(4+i%11)+' 1" stroke="'+palette.orangeDeep+'" stroke-opacity=".09"/>';}).join(''));
  const ambient=svg(decoration,'Peripheral branches and olive leaves',390,844,
    '<path d="M-20 50 Q78 32 93-30 M400 250Q325 320 404 437 M-30 620Q50 659 16 740" fill="none" stroke="'+palette.orangeDeep+'" stroke-width="5"/>'+
    [ [14,32,35],[50,22,80],[335,48,135],[368,80,100],[2,582,25],[365,587,150],[15,719,65],[358,736,115] ].map(([x,y,r])=>'<g transform="translate('+x+' '+y+') rotate('+r+') scale(1.6)">'+leafPath+'</g>').join(''));
  ambient.opacity=.48;
  const flowers=svg(decoration,'Soft edge blossoms',390,844,[[20,218],[363,280],[15,478],[375,555]].map(([x,y])=>'<g transform="translate('+x+' '+y+')">'+[0,60,120,180,240,300].map(r=>'<ellipse cx="0" cy="-10" rx="6" ry="12" transform="rotate('+r+')" fill="'+palette.orangeLight+'"/>').join('')+'<circle r="5" fill="'+palette.gold+'"/></g>').join(''));
  flowers.opacity=.28;flowers.effects=[{type:'LAYER_BLUR',radius:4,visible:true}];

  const artwork={};
  const artBodies={
    Bamboo:'<g fill="'+palette.jade+'" stroke="'+palette.leafDark+'" stroke-width="1">'+[12,24,36].map(x=>[8,27].map(y=>'<rect x="'+x+'" y="'+y+'" width="4" height="16" rx="1"/><path d="M'+(x-1)+' '+(y+4)+'h6M'+(x-1)+' '+(y+12)+'h6"/>').join('')).join('')+'</g>',
    Circles:[ [14,13],[32,13],[14,30],[32,30],[14,47],[32,47] ].map(([x,y],i)=>'<circle cx="'+x+'" cy="'+y+'" r="6" fill="none" stroke="'+(i%3===0?palette.red:palette.jade)+'" stroke-width="2.5"/><circle cx="'+x+'" cy="'+y+'" r="2" fill="'+palette.gold+'"/>').join(''),
    Lotus:'<path d="M24 46Q4 35 9 19Q19 23 24 38Q28 18 38 19Q42 37 24 46Z" fill="'+palette.red+'" opacity=".85"/><path d="M24 44Q13 24 24 7Q35 24 24 44Z" fill="'+palette.copper+'" stroke="'+palette.red+'"/><path d="M24 47Q12 47 7 42Q17 40 24 47Q29 39 40 42Q34 48 24 47Z" fill="'+palette.jade+'"/>',
    Flower:'<path d="M13 52Q28 36 34 9" fill="none" stroke="'+palette.branch+'" stroke-width="2"/>'+[[20,35],[30,23],[34,12]].map(([x,y])=>'<g transform="translate('+x+' '+y+')">'+[0,72,144,216,288].map(r=>'<ellipse cy="-4" rx="3" ry="5" transform="rotate('+r+')" fill="'+palette.copper+'"/>').join('')+'<circle r="2" fill="'+palette.gold+'"/></g>').join(''),
    East:'<path d="M24 7V51M8 16H40M11 22H37V37H11ZM11 29H37M24 35Q18 44 7 49M24 35Q32 44 41 49" stroke="'+palette.ink+'" stroke-width="3" fill="none" stroke-linecap="round"/>',
    Dragon:'<path d="M24 8V52M9 20H39V37H9ZM24 9L27 13" fill="none" stroke="'+palette.red+'" stroke-width="4" stroke-linecap="round"/>'
  };
  let ai=0;for(const [name,body] of Object.entries(artBodies)){
    const m=node(library,'Game/Tile/Artwork/'+name,430+ai*64,60,48,60,null,'COMPONENT');svg(m,'Illustration',48,60,body);artwork[name]=m;ai++;
  }
  const tileVariants=[];const tileMasters={};
  for(const [i,state] of ['Default','Available','Blocked','Pressed','Selected','Matching','Removing','Hinted','Disabled'].entries()) {
    const m=node(library,'State='+state,(i%5)*76,Math.floor(i/5)*100,56,76,null,'COMPONENT');
    svg(m,'Marble shell',56,76,'<rect x="1" y="5" width="54" height="70" rx="7" fill="'+palette.edge+'"/><rect x="1" y="1" width="54" height="69" rx="7" fill="'+palette.ivory+'" stroke="'+palette.stone+'"/><path d="M8 5C16 12 8 21 12 29M43 41C36 49 44 56 39 66" fill="none" stroke="'+palette.stone+'" stroke-opacity=".25"/>');
    instance(m,artwork.Bamboo,4,7,48,60,'Artwork');
    m.effects=[{type:'DROP_SHADOW',color:{...rgb(palette.shadow),a:.22},offset:{x:0,y:3},radius:3,spread:0,visible:true,blendMode:'NORMAL'}];
    if(['Selected','Matching','Hinted'].includes(state)){
      const border=svg(m,'State outline',56,76,'<rect x="1.5" y="1.5" width="53" height="68" rx="7" fill="none" stroke="'+(state==='Matching'?palette.jade:palette.gold)+'" stroke-width="3"/>'+ (state==='Hinted'?'<path d="M40 9l3 3 5-6" stroke="'+palette.jade+'" stroke-width="2" fill="none"/>':''));border.opacity=.9;
    }
    if(['Blocked','Disabled'].includes(state)) {const veil=node(m,'Unavailable surface',1,1,54,69,'branch', 'FRAME',7);veil.opacity=state==='Disabled'?.35:.16;}
    if(state==='Removing')m.opacity=.35;
    if(state==='Pressed')m.findOne(n=>n.name==='Marble shell').y=2;
    tileVariants.push(m);tileMasters[state]=m;
  }
  set(tileVariants,'Game/Tile/Base',430,170);

  const icons={
    Back:'<path d="M28 10L15 23l13 13"/>',
    Restart:'<path d="M32 15A14 14 0 1 1 19 9M19 9v10M19 9h11"/>',
    Undo:'<path d="M18 12L7 22l11 9M8 22h15q17 0 17 17"/>',
    Hint:'<path d="M24 34Q5 25 9 14Q20 17 24 29Q27 15 38 14Q41 27 24 34ZM24 32Q15 20 24 6Q33 20 24 32ZM19 39h10M20 44h8"/>',
    Shuffle:'<path d="M7 12h6q5 0 11 12t10 12h7M34 30l7 6-7 6M7 36h6q5 0 11-12t10-12h7M34 6l7 6-7 6"/>',
    More:'<circle cx="12" cy="24" r="3"/><circle cx="24" cy="24" r="3"/><circle cx="36" cy="24" r="3"/>'
  };
  const iconMasters={};let ii=0;for(const [name,path] of Object.entries(icons)){
    const m=node(library,'Game/Icon/'+name,430+ii*60,430,48,48,null,'COMPONENT');
    svg(m,'Glyph',48,48,'<g fill="none" stroke="'+palette.goldLight+'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">'+path+'</g>');iconMasters[name]=m;ii++;
  }
  function organicFrame(parent,w,h,round) {
    svg(parent,'Branch frame',w,h,'<rect x="2" y="4" width="'+(w-4)+'" height="'+(h-6)+'" rx="'+round+'" fill="'+palette.shadow+'"/><rect x="2" y="2" width="'+(w-4)+'" height="'+(h-6)+'" rx="'+round+'" fill="'+palette.orangeDeep+'" stroke="'+palette.branchLight+'" stroke-width="3"/><path d="M8 6Q'+w/2+' 2 '+(w-8)+' 6M8 '+(h-8)+'Q'+w/2+' '+(h-3)+' '+(w-8)+' '+(h-7)+'" fill="none" stroke="'+palette.branch+'" stroke-width="2"/>');
    svg(parent,'Leaf accent',20,20,'<g transform="translate(1 1) scale(.7)">'+leafPath+'</g>',w-18,2);
  }
  const navVariants=[];const nav={};for(const [ti,type] of ['Back','Restart'].entries())for(const [si,state] of ['Default','Pressed','Disabled'].entries()){
    const m=node(library,'Type='+type+', State='+state,ti*72,si*64,48,48,null,'COMPONENT');organicFrame(m,48,48,8);instance(m,iconMasters[type],5,3,38,38,'Icon');if(state==='Disabled')m.opacity=.4;if(state==='Pressed')m.opacity=.86;navVariants.push(m);nav[type+' '+state]=m;
  }set(navVariants,'Game/TopButton',850,60);

  const badge=node(library,'Game/Badge/Count',1040,60,22,22,'goldLight','COMPONENT',11);badge.strokes=[paint('orangeDeep')];badge.strokeWeight=1.5;
  const badgeLabel=centerText(badge,'Count','3',3,12,'shadow');const countProp=badge.addComponentProperty('Count','TEXT','3');badgeLabel.componentPropertyReferences={characters:countProp};
  const actionVariants=[];const actions={};for(const [ti,type] of ['Undo','Hint','Shuffle','More'].entries())for(const [si,state] of ['Default','Pressed','Disabled','Zero'].entries()){
    const m=node(library,'Type='+type+', State='+state,ti*88,si*120,72,104,null,'COMPONENT');organicFrame(m,64,64,22);
    instance(m,iconMasters[type],8,7,48,48,'Icon');
    if(type!=='More'){const b=instance(m,badge,21,52,22,22,'Count');if(state==='Zero')b.setProperties({[countProp]:'0'});}
    centerText(m,'Label',type,79,12,'ivory');if(state==='Disabled'||state==='Zero')m.opacity=.48;
    if(state==='Pressed')m.findOne(n=>n.name==='Branch frame').y=2;
    actions[type+' '+state]=m;actionVariants.push(m);
  }set(actionVariants,'Game/GameplayAction',1150,60);

  const slotVariants=[];const slotMasters={};for(const [i,state] of ['Empty','Occupied','Newly Added','Matching','Clearing','Almost Full','Full','Disabled'].entries()){
    const m=node(library,'State='+state,(i%4)*66,Math.floor(i/4)*90,52,70,null,'COMPONENT');
    svg(m,'Recessed branch pocket',52,70,'<rect x="1" y="2" width="50" height="66" rx="6" fill="'+palette.shadow+'" stroke="'+palette.branchLight+'" stroke-width="2"/><path d="M3 9v46M49 13v47" stroke="'+palette.branch+'" stroke-width="2"/>');
    if(!['Empty','Disabled'].includes(state)){const t=instance(m,tileMasters[state==='Matching'?'Matching':'Available'],5,5,42,57,'Tile');if(state==='Clearing')t.opacity=.4;}
    if(['Almost Full','Full'].includes(state))m.strokes=[paint('goldLight')];if(state==='Disabled')m.opacity=.42;
    slotVariants.push(m);slotMasters[state]=m;
  }set(slotVariants,'Game/Tray/Slot',1550,60);
  const trayVariants=[];const trays={};for(const [i,state] of ['Empty','Occupied','Newly Added','Matching','Clearing','Almost Full','Full','Disabled'].entries()){
    const m=node(library,'State='+state,(i%2)*370,Math.floor(i/2)*110,358,96,null,'COMPONENT');organicFrame(m,358,96,16);
    const slots=node(m,'Regular slots',14,18,246,70,null);slots.layoutMode='HORIZONTAL';slots.primaryAxisSizingMode='FIXED';slots.counterAxisSizingMode='FIXED';slots.itemSpacing=10;
    const filled=state==='Full'?4:state==='Almost Full'?3:state==='Matching'?2:state==='Empty'||state==='Disabled'?0:1;
    for(let j=0;j<4;j++)instance(slots,slotMasters[j<filled?state==='Matching'?'Matching':'Occupied':state==='Disabled'?'Disabled':'Empty'],j*62,0,52,70,'Slot '+(j+1));
    svg(m,'Identity separator',2,70,'<path d="M1 0v70" stroke="'+palette.gold+'" stroke-width="2"/>',273,18);
    instance(m,slotMasters[state==='Disabled'?'Disabled':'Empty'],290,18,52,70,'Identity slot');text(m,'Identity label','IDENTITY',286,5,8,'goldLight');
    const uses=text(m,'Special uses','2',313,44,13,'goldLight');const usesProp=m.addComponentProperty('Special uses','TEXT','2');uses.componentPropertyReferences={characters:usesProp};
    trayVariants.push(m);trays[state]=m;
  }set(trayVariants,'Game/Tray/Base',1890,60);

  const milestoneVariants=[];const milestoneMasters={};for(const [i,state] of ['Upcoming','Current','Reached'].entries()){
    const m=node(library,'State='+state,i*48,0,40,46,null,'COMPONENT');const t=centerText(m,'Value','10',0,14,state==='Upcoming'?'stone':'goldLight');const p=m.addComponentProperty('Value','TEXT','10');t.componentPropertyReferences={characters:p};
    svg(m,'Milestone bud',20,20,'<path d="M10 2L15 10 10 17 5 10Z" fill="'+(state==='Upcoming'?palette.branchLight:palette.goldLight)+'"/><path d="M10 17v3" stroke="'+palette.branchLight+'"/>',10,23);milestoneVariants.push(m);milestoneMasters[state]=m;
  }set(milestoneVariants,'Game/Progress/Milestone',2700,60);
  const progressVariants=[];const progress={};for(const [i,state] of ['Start','Partial','Complete'].entries()){
    const m=node(library,'State='+state,0,i*86,208,64,null,'COMPONENT');
    svg(m,'Bare branch',208,22,'<path d="M5 10Q60 5 101 11T201 9M6 16Q85 12 200 15" fill="none" stroke="'+palette.branchLight+'" stroke-width="3" stroke-linecap="round"/>',0,32);
    const filled=state==='Start'?0:state==='Partial'?5:12;
    svg(m,'Progress leaves',208,22,Array.from({length:filled},(_,j)=>'<g transform="translate('+(7+j*16)+' 0) scale(.65)">'+leafPath+'</g>').join(''),0,30);
    for(let j=0;j<4;j++){const n=instance(m,milestoneMasters[state==='Complete'?'Reached':state==='Partial'&&j===1?'Current':state==='Partial'&&j===0?'Reached':'Upcoming'],j*55,0,40,46,'Milestone '+(j+1));const key=Object.keys(n.componentProperties).find(k=>k.startsWith('Value#'));n.setProperties({[key]:String([3,10,15,20][j])});}
    progressVariants.push(m);progress[state]=m;
  }set(progressVariants,'Game/Progress/Branch',2700,160);

  const board=node(library,'Game/MahjongBoard',3070,60,338,390,null,'COMPONENT');
  const artNames=Object.keys(artwork);let tileIndex=0;
  for(const [r,count] of [3,5,6,6,5,3].entries())for(let c=0;c<count;c++){
    const x=(338-count*50)/2+c*50,y=52+r*48;
    const n=instance(board,tileMasters[r===2&&c===2?'Blocked':'Available'],x,y,56,76,'Tile '+(++tileIndex));
    n.findOne(x=>x.type==='INSTANCE'&&x.name==='Artwork').swapComponent(artwork[artNames[(r*3+c)%artNames.length]]);
  }
  for(const [i,[x,y]] of [[142,0],[92,50],[142,99],[192,148],[142,197]].entries()){
    const n=instance(board,tileMasters.Available,x,y,56,76,'Upper tile '+(i+1));n.findOne(x=>x.type==='INSTANCE'&&x.name==='Artwork').swapComponent(artwork[artNames[(i+2)%artNames.length]]);
  }
  board.description='Layered illustrative board. Tile state and artwork are nested instances; no Mahjong rules are implemented.';
  const sheetVariants=[];const sheets={};
  const sheetData={Pause:['Take a quiet moment','Your board is saved.','Resume','Save & Home','Restart Board'],Restart:['Restart this board?','Your current board progress will be reset.','Restart Board','Cancel'],Full:['Your tray is full','Choose how to continue this board.','Use Concentration Score','Watch optional ad','Restart Board'],Offline:['Your tray is full','You are offline. Reward ads are unavailable.','Use Concentration Score','Restart Board'],NoMoves:['A fresh perspective','No available moves on this board.','Shuffle','Restart Board'],Completion:['A moment of clarity','Board complete','Continue','Home']};
  let shi=0;for(const [state,values] of Object.entries(sheetData)){
    const m=node(library,'State='+state,(shi%3)*380,Math.floor(shi/3)*390,358,360,'paper','COMPONENT',16);
    text(m,'Title',values[0],24,28,28,'ink',true,310);text(m,'Body',values[1],24,96,14,'branch',false,310);
    values.slice(2).forEach((label,j)=>{const b=node(m,label,24,157+j*58,310,48,j===0?'jade':null,'FRAME',8);b.strokes=j>0?[paint('edge')]:[];centerText(b,'Label',label,14,14,j===0?'ivory':'ink');});
    sheetVariants.push(m);sheets[state]=m;shi++;
  }set(sheetVariants,'Game/ContextSheet',3550,60);

  function makeScreen(parent,name,w,h,x,state='Normal',reduced=false) {
    const f=node(parent,name,x,0,w,h,'orange');f.clipsContent=true;
    instance(f,decoration,0,0,w,h,'Garden background');
    if(reduced){const flowers=f.findOne(n=>n.name==='Soft edge blossoms');if(flowers)flowers.visible=false;}
    instance(f,nav['Back Default'],16,58,48,48,'Back');instance(f,nav['Restart Default'],w-64,58,48,48,'Restart');
    const rail=instance(f,progress.Partial,(w-208)/2,52,208,64,'Progress');if(w===360)rail.resize(192,64);
    const scale=Math.min((w-32)/338,1.12);const bh=390*scale;
    const boardTop=h<=844?148:172;const b=instance(f,board,(w-338*scale)/2,boardTop,338*scale,bh,'Mahjong board');
    const trayY=h-244;const trayWidth=Math.min(w-32,358);const tr=instance(f,trays[state==='Partial'?'Occupied':state==='Full'?'Full':'Empty'],(w-trayWidth)/2,trayY,trayWidth,96,'Concentration tray');
    text(f,'Board remaining','28 tiles remaining',0,trayY-28,12,'goldLight',false,w).textAlignHorizontal='CENTER';
    const row=node(f,'Gameplay actions',16,h-138,w-32,104,null);row.layoutMode='HORIZONTAL';row.primaryAxisSizingMode='FIXED';row.counterAxisSizingMode='FIXED';row.primaryAxisAlignItems='SPACE_BETWEEN';row.itemSpacing=0;
    for(const type of ['Undo','Hint','Shuffle','More'])instance(row,actions[type+' Default'],0,0,72,104,type);
    if(state==='Offline')text(f,'Offline status','Offline',16,117,11,'goldLight');
    if(reduced)text(f,'Reduced motion status','Reduced motion',16,117,11,'goldLight');
    if(['Pause','Restart','Full','Offline','NoMoves','Completion'].includes(state)){
      const scrim=node(f,'Modal scrim',0,0,w,h,'shadow');scrim.opacity=.5;
      instance(f,sheets[state],16,h-390,w-32,360,'Context sheet');
    }
    f.exportSettings=[{format:'PNG',constraint:{type:'SCALE',value:2},suffix:'@2x'}];
    f.setPluginData('orange-garden-screen',state);return f;
  }
  const responsive=[];let sx=0;for(const [w,h] of [[360,800],[390,844],[412,915],[430,932]]){
    text(screens,'Size '+w,w+' x '+h,sx, -36,14,'coolMid');responsive.push(makeScreen(screens,'Gameplay / '+w+' x '+h,w,h,sx));sx+=w+100;
  }
  const previews={};let px=0;for(const state of ['Partial','Full','Pause','Restart','Offline','NoMoves','Completion']){previews[state]=makeScreen(states,'Gameplay / '+state,390,844,px,state);px+=490;}
  previews.Reduced=makeScreen(states,'Gameplay / Reduced Motion',390,844,px,'Normal',true);
  // Prototype links illustrate navigation only, not game outcomes or reward eligibility.
  function link(n,target) {if(!n)return;n.reactions=[{trigger:{type:'ON_CLICK'},action:{type:'NODE',destinationId:target.id,navigation:'NAVIGATE',transition:{type:'DISSOLVE',easing:{type:'EASE_IN_AND_OUT'},duration:.15},preserveScrollPosition:false}}];}
  for(const f of responsive){link(f.findOne(n=>n.name==='Back'),previews.Pause);link(f.findOne(n=>n.name==='Restart'),previews.Restart);link(f.findOne(n=>n.name==='More'),previews.Pause);}
  link(previews.Pause.findOne(n=>n.name==='Resume'),responsive[1]);link(previews.Restart.findOne(n=>n.name==='Cancel'),responsive[1]);
  const audit={screens:[...responsive,...Object.values(previews)].map(f=>({name:f.name,width:f.width,height:f.height,instances:f.findAll(n=>n.type==='INSTANCE').length})),componentSets:library.children.filter(n=>n.type==='COMPONENT_SET').length,tokenCollection:collection.name,sectionId:root.id};
  root.setPluginData('orange-garden-version','1');root.setPluginData('orange-garden-audit',JSON.stringify(audit));
  figma.currentPage.selection=[responsive[1]];figma.viewport.scrollAndZoomIntoView([responsive[1]]);
  console.log('ORANGE_GARDEN_AUDIT',JSON.stringify(audit));
  figma.notify('Orange Garden: 12 screens and editable component library created. Original designs preserved.',{timeout:10000});
  return audit;
}
buildOrangeGarden().then(()=>figma.closePlugin()).catch(e=>{console.error(e);figma.notify('Orange Garden: '+e.message,{error:true,timeout:12000});figma.closePlugin();});
