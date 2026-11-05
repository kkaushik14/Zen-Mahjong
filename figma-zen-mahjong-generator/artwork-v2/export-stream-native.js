async function startExport() {
  await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('2:3'));
  const root=await figma.getNodeByIdAsync('45:16399');
  if(!root)throw new Error('V2 section missing.');
  const groups=root.children.filter(n=>n.name==='02 Screens'||n.name==='04 App Screens and Prototype');
  const frames=groups.flatMap(n=>n.children).filter(n=>n.type==='FRAME');
  const polish=root.getPluginData('v2PolishReport');
  const library=root.children.find(n=>n.name==='01 Components');
  const components=library.findAllWithCriteria({types:['COMPONENT']}).filter(n=>n.visible&&!n.name.startsWith('V2/Artwork/'));
  const manifest={sectionId:root.id,screenCount:frames.length,productionFinal:false,screens:frames.map(n=>({id:n.id,name:n.name,width:n.width,height:n.height})),polish:polish?JSON.parse(polish):null,limitations:['Theme study, not production final','Physical-device accessibility and motion testing still required'],components:components.map(n=>({id:n.id,name:n.name,parent:n.parent.name}))};
  const renderNodes=[...frames.map(n=>({node:n,name:'screens/'+n.name})),...components.map(n=>({node:n,name:'components/'+n.parent.name+'-'+n.name}))];
  let busy=false;
  figma.ui.onmessage=async message=>{
    if(message.type==='export'&&!busy){
      busy=true;
      try {
        for(let i=0;i<renderNodes.length;i++){
          const frame=renderNodes[i].node;
          const bytes=await frame.exportAsync({format:'PNG',constraint:{type:'SCALE',value:1}});
          figma.ui.postMessage({type:'file',name:renderNodes[i].name.replace(/[^a-zA-Z0-9/]+/g,'-')+'.png',bytes,index:i+1,total:renderNodes.length});
        }
        figma.ui.postMessage({type:'done',manifest});
      }catch(e){figma.ui.postMessage({type:'error',message:e.message});}
      busy=false;
    }
  };
  figma.showUI(`<body style="font:14px system-ui;padding:18px"><h2>Zen Mahjong V2 Export</h2><p id="status">Export screen renders separately from the repair.</p><button id="start">Prepare screen ZIP</button><button id="download" disabled>Download ZIP</button><script>
  const files=[];const status=document.getElementById('status');
  document.getElementById('start').onclick=()=>{document.getElementById('start').disabled=true;parent.postMessage({pluginMessage:{type:'export'}},'*');};
  onmessage=e=>{const m=e.data.pluginMessage;if(!m)return;if(m.type==='file'){files.push({name:m.name,bytes:new Uint8Array(m.bytes)});status.textContent=m.index+' / '+m.total+' screen and component renders exported';}if(m.type==='done'){files.push({name:'design-manifest.json',bytes:new TextEncoder().encode(JSON.stringify(m.manifest,null,2))});document.getElementById('download').disabled=false;status.textContent='Ready: '+(files.length-1)+' renders and manifest. Click Download ZIP.';}if(m.type==='error')status.textContent=m.message;};
  const crc=b=>{let c=0xffffffff;for(const v of b){c^=v;for(let j=0;j<8;j++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;};
  function zip(){let parts=[],central=[],offset=0;const e=new TextEncoder();for(const file of files){const b=file.bytes,name=e.encode(file.name),c=crc(b),head=new Uint8Array(30+name.length),v=new DataView(head.buffer);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint32(14,c,true);v.setUint32(18,b.length,true);v.setUint32(22,b.length,true);v.setUint16(26,name.length,true);head.set(name,30);parts.push(head,b);const ce=new Uint8Array(46+name.length),d=new DataView(ce.buffer);d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint32(16,c,true);d.setUint32(20,b.length,true);d.setUint32(24,b.length,true);d.setUint16(28,name.length,true);d.setUint32(42,offset,true);ce.set(name,46);central.push(ce);offset+=head.length+b.length;}const length=central.reduce((n,b)=>n+b.length,0),end=new Uint8Array(22),v=new DataView(end.buffer);v.setUint32(0,0x06054b50,true);v.setUint16(8,files.length,true);v.setUint16(10,files.length,true);v.setUint32(12,length,true);v.setUint32(16,offset,true);return new Blob([...parts,...central,end],{type:'application/zip'});}
  document.getElementById('download').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(zip());a.download='Zen-Mahjong-Artwork-V2-Theme-Study.zip';a.click();status.textContent='Download requested; verify the saved ZIP.';};
  document.getElementById('start').click();
  </script>`,{width:430,height:280});
}
startExport().catch(e=>{console.error('V2_EXPORT_ERROR '+e.message);figma.closePlugin('Export stopped: '+e.message);});
