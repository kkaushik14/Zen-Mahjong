const fs = require('node:fs');
const path = require('node:path');
let source = fs.readFileSync(path.join(__dirname, '../artwork-v2.js'), 'utf8');
source = source.replace("figma.createAutoLayout('VERTICAL')", 'figma.createFrame()');
source = source.replace("n.name=name;n.resize(w,h);n.primaryAxisSizingMode='FIXED'", "n.name=name;n.layoutMode='VERTICAL';n.resize(w,h);n.primaryAxisSizingMode='FIXED'");
source = source.replace(/await standard\.screenshot\(\{scale:1\}\);await restartScreen\.screenshot\(\{scale:1\}\);await home\.screenshot\(\{scale:1\}\);/, '');
source = source.replace("crop(m,'Source scene',0,rect,0,0,130,281)", "crop(m,'Source scene',0,[rect[0]+(rect[2]-rect[3]*130/281)/2,rect[1],rect[3]*130/281,rect[3]],0,0,130,281)");
source = source.replace("inst(f,progress,(w-230)/2,48,230,58,'Progress')", "inst(f,progress,80,48,w-160,58,'Progress')");
const code = `async function buildArtworkV2() {
  if (figma.fileKey && figma.fileKey !== 'lsPHWqjJBItMCFnjKg3Gy2') throw new Error('Open the existing Zen Mahjong file before running.');
${source}
}
buildArtworkV2().then(result => {
  console.log(JSON.stringify(result));
  figma.closePlugin('Artwork V2 review created. Visual review required.');
}).catch(error => {
  console.error(error);
  figma.closePlugin('Build stopped: ' + error.message + '. Inspect V2 before rerunning.');
});
`;
fs.writeFileSync(path.join(__dirname, 'code.js'), code);
