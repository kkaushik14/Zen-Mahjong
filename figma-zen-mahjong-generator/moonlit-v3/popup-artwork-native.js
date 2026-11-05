// Add-only source-artwork library. Never rebuild or reposition existing screens.
const POPUP_SOURCES = [
  {file:'Zen Forest Garden UI Asset Sheet-1.png', items:[
    ['Popup / Portrait Rock Frame',[5,436,308,311]],['Popup / Portrait Marble Frame',[322,436,275,310]],
    ['Branches / Upper Floral',[606,438,274,136]],['Branches / Lower Floral',[606,580,274,177]],
    ['Popup / Round Medallion',[890,447,173,156]],['Popup / Wide Banner',[1070,441,458,160]],
    ['Decor / Maple',[670,758,212,119]],['Decor / Stone Lantern',[966,775,109,146]],
    ['Decor / Hanging Lantern',[1080,777,99,201]],['Decor / Blossom Rock',[1157,788,248,227]],
    ['Decor / Flower Rock',[1327,789,202,226]],['Panels / Wood Floral',[3,882,442,129]],
    ['Panels / Marble Floral',[448,881,351,133]],['Decor / Leaves',[805,880,98,130]]]},
  {file:'Marble Garden Game Asset Sheet-2.png',items:[
    ['Popup / Landscape Lantern Rock',[22,506,396,244]],['Popup / Rectangular Medallion',[430,508,278,240]],
    ['Popup / Oval Medallion',[714,509,330,241]],['Branches / Open Upper',[1045,508,263,130]],
    ['Branches / Upper Right',[1319,514,207,119]],['Branches / Lower Right',[1370,632,157,109]],
    ['Decor / Flower Rocks',[1049,609,189,139]],['Popup / Plain Medallion',[1241,636,121,106]],
    ['Panels / Wood Floral',[448,912,322,106]],['Branches / Divider',[774,982,266,36]]]},
  {file:'Marble Garden Game UI Asset Sheet-3.png',items:[
    ['Popup / Portrait Rock Frame',[10,400,272,248]],['Popup / Plain Marble Panel',[289,409,171,234]],
    ['Branches / Upper Floral',[468,408,257,91]],['Branches / Lower Floral',[469,520,253,118]],
    ['Corners / Top Left',[748,407,79,90]],['Corners / Top Right',[846,409,84,88]],
    ['Corners / Bottom Left',[747,495,83,78]],['Corners / Bottom Right',[843,495,84,77]],
    ['Decor / Blossom',[718,565,112,80]],['Decor / Petals',[839,569,91,70]],
    ['Frames / Vertical',[20,704,185,133]],['Frames / Scroll',[216,705,166,132]],
    ['Frames / Horizontal Wood',[389,707,269,134]],['Frames / Round Wood',[661,702,169,137]],
    ['Panels / Wood Bar',[839,725,205,84]],['Decor / Rock',[18,881,195,111]],
    ['Decor / Lantern',[222,871,106,119]],['Decor / Leaves',[351,881,130,111]],
    ['Decor / Maple',[508,885,148,109]],['Decor / Flower Branch',[672,885,199,111]]]},
  {file:'Autumn Garden Puzzle UI Asset Sheet-4.png',items:[
    ['Popup / Landscape Floral',[502,343,299,223]],['Popup / Plain Rounded Panel',[816,368,211,161]],
    ['Corners / Top Left',[1041,346,160,87]],['Corners / Top Right',[1217,347,158,87]],
    ['Corners / Bottom Left',[1044,458,157,102]],['Corners / Bottom Right',[1214,458,165,102]],
    ['Decor / Leaf',[1420,347,85,90]],['Decor / Flower',[1430,472,80,85]],
    ['Panels / Long Wood',[13,729,258,88]],['Panels / Medium Marble',[289,727,177,99]],
    ['Frames / Circle Wood',[680,722,112,104]],['Frames / Square Wood',[805,723,113,102]],
    ['Branches / Divider',[931,751,184,56]],['Decor / Lantern',[1128,708,79,125]],
    ['Decor / Rock',[1214,729,155,86]],['Decor / Foliage',[1380,713,144,117]]]},
  {file:'Zen Mahjong Garden UI Asset Sheet-5.png',items:[
    ['Popup / Portrait Frame',[14,534,300,254]],['Popup / Portrait Panel',[324,534,247,254]],
    ['Branches / Upper',[581,539,219,107]],['Branches / Middle',[582,618,192,100]],
    ['Branches / Lower',[604,684,149,103]],['Corners / Floral Upper',[820,538,76,112]],
    ['Corners / Floral Lower',[779,649,121,135]],['Panels / Wood Floral',[17,826,210,72]],
    ['Panels / Marble Floral',[228,826,195,72]],['Panels / Green Floral',[17,916,210,74]],
    ['Panels / Blue Floral',[228,916,195,74]],['Tray / Wood Slots',[885,916,313,56]],
    ['Frames / Square Wood',[1219,827,77,76]],['Frames / Vertical Wood',[1311,837,82,117]],
    ['Frames / Square Marble',[1218,929,78,79]],['Decor / Hanging Diamond',[1397,829,75,116]]]},
  {file:'Autumn Zen Mahjong UI Asset Atlas-6.png',items:[
    ['Popup / Square Floral',[787,347,258,211]],['Popup / Round Floral',[1042,347,203,211]],
    ['Popup / Wide Banner',[1248,349,282,105]],['Popup / Small Banner',[1247,463,234,96]],
    ['Branches / Upper Floral',[1005,682,279,105]],['Branches / Lower Floral',[875,781,264,79]],
    ['Panels / Long Wood',[12,875,257,58]],['Panels / Thin Wood',[285,877,305,57]],
    ['Decor / Stone Lantern',[1217,686,149,174]],['Decor / Flower Rock',[1356,682,173,180]]]},
  {file:'Elegant Marble Garden Mahjong UI Kit-7.png',items:[
    ['Popup / Landscape Floral',[730,383,295,182]],['Popup / Wide Floral',[729,585,296,79]],
    ['Branches / Upper Maple Blossom',[1050,383,244,105]],['Branches / Lower Maple Blossom',[1049,518,246,113]],
    ['Decor / Flowers',[1331,372,72,73]],['Decor / Leaf',[1420,372,80,74]],
    ['Decor / Rock',[1314,486,98,80]],['Decor / Lantern',[1424,476,78,135]],
    ['Corners / Board Top Left',[444,375,107,94]],['Corners / Board Top Right',[575,375,122,94]],
    ['Corners / Board Bottom Left',[448,469,104,109]],['Corners / Board Bottom Right',[577,469,121,109]],
    ['Tray / Floral Wood',[813,708,302,69]],['Tray / Square Slots',[812,786,279,58]],
    ['Tray / Circular Slots',[811,847,306,59]]]},
  {file:'Fantasy Zen Mahjong Asset Board-8.png',items:[
    ['Popup / Open Floral Frame',[513,480,287,224]],['Popup / Bordered Marble Panel',[812,486,224,198]],
    ['Buttons / Floral Orange',[1049,485,202,91]],['Buttons / Floral Ivory',[1048,576,202,114]],
    ['Branches / Upper Floral',[1260,482,268,105]],['Branches / Lower Floral',[1264,571,255,91]],
    ['Decor / Flower Rock',[1264,603,147,129]],['Frames / Round Wood Board',[639,780,261,204]],
    ['Decor / Upper Rocks',[907,783,125,111]],['Decor / Lower Rocks',[906,883,126,117]],
    ['Panels / Wood Floral',[1049,787,267,67]],['Panels / Marble Floral',[1049,861,267,63]]]}
];

async function addPopupArtwork(sourceData) {
  await figma.loadAllPagesAsync();
  if (!/Moonlit.*V3/i.test(figma.root.name)) throw new Error('Open Moonlit Garden V3 first.');
  const page=figma.root.children.find(p=>/Components$/.test(p.name));
  if (!page) throw new Error('Components page missing.');
  await figma.setCurrentPageAsync(page);
  await figma.loadFontAsync({family:'Inter',style:'Regular'});
  const owner='zen-mahjong-v3-source-popup-artwork';
  let library=page.children.find(n=>n.getPluginData('owner')===owner);
  if (!library) {
    library=figma.createFrame(); page.appendChild(library);
    library.name='07 Popup Artwork / Source Matched'; library.fills=[]; library.clipsContent=false;
    library.x=80; library.y=Math.max(0,...page.children.filter(n=>n!==library).map(n=>n.y+n.height))+160;
    library.setPluginData('owner',owner); library.resize(1840,100);
  }
  const report={file:figma.root.name,scope:'Add components only; existing screens and masters untouched',productionFinal:false,components:[],limitations:['Exact atlas crops retain source backgrounds and source alpha. These are artwork masters, not certified transparent production sprites.','No added resolution or reconstructed detail. Existing 50 motif masters are not duplicated.']};
  const frames=[]; let offset=24;
  function text(parent,value,x,y,w,size=14) {
    const t=figma.createText(); parent.appendChild(t); t.fontName={family:'Inter',style:'Regular'};
    t.fontSize=size; t.characters=value; t.resize(w,t.height); t.textAutoResize='HEIGHT';t.x=x;t.y=y;
    t.fills=[{type:'SOLID',color:{r:0.9,g:0.92,b:0.9}}];return t;
  }
  for (const [index,source] of POPUP_SOURCES.entries()) {
    let group=library.children.find(n=>n.getPluginData('sourceFile')===source.file);
    if (!group) {
      group=figma.createFrame();library.appendChild(group);group.name=String(index+1).padStart(2,'0')+' / '+source.file;
      group.setPluginData('sourceFile',source.file);group.fills=[{type:'SOLID',color:{r:0.10,g:0.13,b:0.11}}];group.clipsContent=false;
      group.resize(1840,100);text(group,source.file,24,20,1792,22);
      text(group,'Source-matched artwork crops. Background removal and high-resolution production exports remain separate work.',24,54,1792);
    }
    const hash=figma.createImage(figma.base64Decode(sourceData[source.file])).hash;
    for (const [i,[name,crop]] of source.items.entries()) {
      const key=source.file+'|'+name;
      let component=group.children.find(n=>n.type==='COMPONENT'&&n.getPluginData('assetKey')===key);
      if (!component) {
        component=figma.createComponent();group.appendChild(component);
        component.name='V3/Artwork/'+source.file.replace(/\.png$/,'')+'/'+name;
        component.setPluginData('assetKey',key);component.setPluginData('sourceCrop',JSON.stringify(crop));
        const scale=Math.min(1,358/crop[2]);component.resize(crop[2]*scale,crop[3]*scale);
        component.fills=[];component.clipsContent=true;
        component.description='Exact supplied atlas crop from '+source.file+'. Source bounds '+crop.join(', ')+'. May retain baked background/checkerboard and imperfect alpha. Preserve aspect ratio. Artwork only; no screen edits.';
        const r=figma.createRectangle();component.appendChild(r);r.name='Source artwork';r.resize(component.width,component.height);
        r.fills=[{type:'IMAGE',imageHash:hash,scaleMode:'CROP',imageTransform:[[crop[2]/1536,0,crop[0]/1536],[0,crop[3]/1024,crop[1]/1024]]}];
        r.constraints={horizontal:'SCALE',vertical:'SCALE'};
        const x=24+(i%4)*454,y=102+Math.floor(i/4)*390;component.x=x;component.y=y;
        text(group,name,x,y+330,420);
        text(group,'Source '+crop[2]+' x '+crop[3]+' px | preserve proportions',x,y+356,420,12);
      }
      report.components.push({id:component.id,name:component.name,source:source.file,crop,width:component.width,height:component.height});
    }
    group.x=0;group.y=offset;group.resize(1840,102+Math.ceil(source.items.length/4)*390);
    offset+=group.height+48;frames.push({node:group,name:'components/'+String(index+1).padStart(2,'0')+'-Popup-Artwork'});
  }
  library.resize(1840,offset);library.setPluginData('report',JSON.stringify(report));
  figma.currentPage.selection=[library];figma.viewport.scrollAndZoomIntoView([frames[0].node]);
  return {report,frames};
}
