async function reviewAndExport() {
  const page=await figma.getNodeByIdAsync('2:3');await figma.setCurrentPageAsync(page);
  const root=await figma.getNodeByIdAsync('45:16399');
  const screens=root.children.find(n=>n.name==='02 Screens');
  const extra=root.children.find(n=>n.name==='04 App Screens and Prototype');
  const library=root.children.find(n=>n.name==='01 Components');
  await figma.loadFontAsync({family:'Inter',style:'Regular'});await figma.loadFontAsync({family:'Cormorant Garamond',style:'Medium'});
  const frames=[...screens.children,...extra.children].filter(n=>n.type==='FRAME');
  for(const f of frames) {
    const bg=f.children.find(n=>n.name==='Garden');
    if(bg){bg.resize(f.width,f.height);const scene=bg.findOne(n=>n.name==='Source scene');if(scene)scene.resize(f.width,f.height);}
    for(const n of f.findAllWithCriteria({types:['INSTANCE']})) {
      const main=await n.getMainComponentAsync();if(!main)continue;
      if(main.name.startsWith('V2/Artwork/')) {const image=n.children[0];image.resize(n.width,n.height);}
      if(main.name.startsWith('V2/Button/')) {
        const image=n.children.find(c=>c.name==='Marble button material');image.resize(n.width,n.height);
        const label=n.children.find(c=>c.type==='TEXT');label.fontSize=20;label.lineHeight={unit:'PIXELS',value:27};label.resize(n.width-20,label.height);
        if(n.name==='Back to Achievements')label.fontSize=17;
      }
    }
    if(f.name.startsWith('Achievement Detail')) {
      const p=f.children.find(n=>n.name==='Popup panel');const art=p.children.find(n=>n.type==='INSTANCE'&&n.name.startsWith('V2/Artwork/'));if(art){art.y=221;art.x=135;art.resize(72,72);}
    }
  }
  const ledger={sectionId:root.id,libraryId:library.id,screensId:screens.id,extraId:extra.id,componentCount:library.findAllWithCriteria({types:['COMPONENT']}).length,screenCount:frames.length,screens:frames.map(n=>({id:n.id,name:n.name,width:n.width,height:n.height,reactions:n.findAll(n=>'reactions'in n&&n.reactions.length>0).length})),limitations:['Theme study, not production final','Popup branch-frame fidelity pending','Full per-screen responsive/state QA pending','Cloud sync unverified']};
  const files=[];
  for(const f of frames) files.push({name:f.name.replace(/[^a-zA-Z0-9]+/g,'-')+'@2x.png',bytes:Array.from(await f.exportAsync({format:'PNG',constraint:{type:'SCALE',value:2}}))});
  const manifest=JSON.stringify(ledger,null,2);files.push({name:'design-manifest.json',bytes:manifest.split('').map(c=>c.charCodeAt(0))});
  figma.currentPage.selection=[];figma.viewport.scrollAndZoomIntoView(extra.children.slice(0,6));
  figma.showUI(`<html><body style="font:14px system-ui;padding:18px"><h2>Zen Mahjong V2</h2><p id="summary">Preparing exports...</p><button id="download" disabled>Download theme-study ZIP</button><p id="status"></p><script>
  let files=[];onmessage=event=>{if(event.data.pluginMessage?.files){files=event.data.pluginMessage.files;document.getElementById('download').disabled=false;document.getElementById('summary').textContent=(files.length-1)+' screens plus design manifest';}};
  const crc=b=>{let c=0xffffffff;for(let v of b){c^=v;for(let j=0;j<8;j++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;};
  function zip(){let parts=[],central=[],offset=0;const e=new TextEncoder();for(const file of files){let b=new Uint8Array(file.bytes),name=e.encode(file.name),c=crc(b),head=new Uint8Array(30+name.length),v=new DataView(head.buffer);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint32(14,c,true);v.setUint32(18,b.length,true);v.setUint32(22,b.length,true);v.setUint16(26,name.length,true);head.set(name,30);parts.push(head,b);let ce=new Uint8Array(46+name.length),d=new DataView(ce.buffer);d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint32(16,c,true);d.setUint32(20,b.length,true);d.setUint32(24,b.length,true);d.setUint16(28,name.length,true);d.setUint32(42,offset,true);ce.set(name,46);central.push(ce);offset+=head.length+b.length;}let length=central.reduce((n,b)=>n+b.length,0),end=new Uint8Array(22),v=new DataView(end.buffer);v.setUint32(0,0x06054b50,true);v.setUint16(8,files.length,true);v.setUint16(10,files.length,true);v.setUint32(12,length,true);v.setUint32(16,offset,true);return new Blob([...parts,...central,end],{type:'application/zip'});}
  document.getElementById('download').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(zip());a.download='Zen-Mahjong-Artwork-V2-Theme-Study.zip';a.click();document.getElementById('status').textContent='Download requested.';};
  parent.postMessage({pluginMessage:{type:'ready'}},'*');
  </script></body></html>`,{width:420,height:260});
  figma.ui.onmessage=msg=>{if(msg.type==='ready')figma.ui.postMessage({files});};
  console.log(JSON.stringify(ledger));
}
reviewAndExport().catch(error=>{console.error(error);figma.closePlugin('Review/export stopped: '+error.message);});
