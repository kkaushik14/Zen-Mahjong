async function repair() {
  await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('2:3'));
  const root=await figma.getNodeByIdAsync('45:16399');
  if(!root)throw new Error('V2 section missing; no changes made.');
  const library=root.children.find(n=>n.name==='01 Components');
  const changed=[];
  for(const c of library.findAllWithCriteria({types:['COMPONENT']})) {
    if(c.name.startsWith('V2/Background/')||c.name.startsWith('V2/Artwork/')) {
      for(const child of c.children)if(child.type==='RECTANGLE') {
        child.constraints={horizontal:'SCALE',vertical:'SCALE'};
        child.resize(c.width,c.height);child.x=0;child.y=0;changed.push(child.id);
      }
    }
    if(c.name.startsWith('V2/Button/')) {
      for(const child of c.children) {
        if(child.type==='RECTANGLE')child.constraints={horizontal:'STRETCH',vertical:'STRETCH'};
        if(child.type==='TEXT') {
          for(const segment of child.getStyledTextSegments(['fontName']))await figma.loadFontAsync(segment.fontName);
          child.constraints={horizontal:'STRETCH',vertical:'CENTER'};
          child.textAutoResize='HEIGHT';child.fontSize=20;child.lineHeight={unit:'PIXELS',value:27};
          child.resize(c.width-20,27);child.x=10;child.y=(c.height-child.height)/2;
        }
        changed.push(child.id);
      }
    }
  }
  const containers=root.children.filter(n=>n.name==='02 Screens'||n.name==='04 App Screens and Prototype');
  const frames=containers.flatMap(n=>n.children).filter(n=>n.type==='FRAME');
  for(const f of frames) {
    for(const n of f.findAllWithCriteria({types:['INSTANCE']})) {
      const c=await n.getMainComponentAsync();if(!c)continue;
      if(c.name.startsWith('V2/Background/')||c.name.startsWith('V2/Artwork/')||c.name.startsWith('V2/Button/')) {
        const w=n.width,h=n.height;n.resize(w+1,h+1);n.resize(w,h);changed.push(n.id);
      }
    }
  }
  figma.currentPage.selection=[];
  figma.viewport.scrollAndZoomIntoView(frames.filter(n=>/Loading \/|Profile \/|Settings \/|Board Complete \/|Achievements \/|Streaks \//.test(n.name)));
  console.log('V2_REPAIR '+JSON.stringify({changedIds:changed,screenCount:frames.length,screenIds:frames.map(n=>n.id)}));
  figma.closePlugin('V2 sizing repair completed. Export will run separately.');
}
repair().catch(e=>{console.error('V2_REPAIR_ERROR '+e.message+' '+e.stack);figma.closePlugin('Repair stopped: '+e.message);});
