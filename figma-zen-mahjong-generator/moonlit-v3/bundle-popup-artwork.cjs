const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = __dirname;
const source = fs.readFileSync(path.join(root, 'popup-artwork-native.js'), 'utf8');
const context = {};
vm.runInNewContext(source + '\nthis.sources = POPUP_SOURCES;', context);
const images = {};
let count = 0;
for (const {file, items} of context.sources) {
  images[file] = fs.readFileSync(path.join('/Users/kumarkaushik/Downloads/v2_comlete_design_marbel_theme', file)).toString('base64');
  const names = new Set();
  for (const [name, [x, y, w, h]] of items) {
    if (names.has(name) || x < 0 || y < 0 || w <= 0 || h <= 0 || x + w > 1536 || y + h > 1024 || h * Math.min(1, 358 / w) > 320) {
      throw new Error('Invalid or overlapping preview bounds: ' + file + ' / ' + name);
    }
    names.add(name);
    count++;
  }
}
// Reuse the tested offline ZIP transport without exporting or mutating screens.
const review = fs.readFileSync(path.join(root, 'review-native.js'), 'utf8');
const ui = review.slice(review.indexOf('  figma.showUI('), review.indexOf('  for (const [i, f] of frames.entries())'))
  .replace('V3 Home Review', 'Popup Artwork Components')
  .replace('Zen-Mahjong-V3-Home-Review.zip', 'Zen-Mahjong-V3-Popup-Components-Review.zip');
const finish = `
async function exportPopupReview(result) {
  const {report, frames}=result;
${ui}
  for (const [i,f] of frames.entries()) {
    const bytes=await f.node.exportAsync({format:'PNG',constraint:{type:'SCALE',value:1}});
    figma.ui.postMessage({type:'file',name:f.name+'.png',bytes,index:i+1,total:frames.length});
  }
  figma.ui.postMessage({type:'done',report});
}
addPopupArtwork(${JSON.stringify(images)}).then(exportPopupReview).catch(e=>figma.closePlugin('Popup components stopped: '+e.message));
`;
const output = path.join('/tmp/zen-mahjong-artwork-v2', 'code.js');
fs.writeFileSync(output, source + finish);
console.log(JSON.stringify({output, count, sourceSheets:context.sources.length, bytes:fs.statSync(output).size}));
