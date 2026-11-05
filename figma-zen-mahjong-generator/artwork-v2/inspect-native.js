(async()=>{
  const root=await figma.getNodeByIdAsync('45:16399');
  const data=root.children.filter(n=>n.name==='04 App Screens and Prototype'||n.name==='01 Components').map(n=>({id:n.id,name:n.name,children:n.children.filter(c=>n.name.startsWith('04')||c.name==='V2 / App Components').map(c=>({id:c.id,name:c.name,type:c.type}))}));
  figma.showUI('<html><body style="font:14px monospace"><pre>'+JSON.stringify(data,null,2)+'</pre></body></html>',{width:650,height:700});
})();
