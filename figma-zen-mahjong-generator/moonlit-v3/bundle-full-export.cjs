const fs=require('node:fs');
const path=require('node:path');
const review=fs.readFileSync(path.join(__dirname,'review-native.js'),'utf8');
const ui=review.slice(review.indexOf('  figma.showUI('),review.indexOf('  for (const [i, f] of frames.entries())'))
  .replace('V3 Home Review','Full V3 Implementation Export')
  .replace('Zen-Mahjong-V3-Home-Review.zip','Zen-Mahjong-V3-Full-Implementation-Export.zip')
  .replace("status.textContent='Ready. Download the review ZIP to Downloads.';","status.textContent=m.report.errors.length?'Export has errors. Download ZIP for inspection.':'Ready. Download the full export ZIP to Downloads.';");
const script=fs.readFileSync(path.join(__dirname,'full-export-native.js'),'utf8')+'\nfunction openFullExportPanel(){\n'+ui+'\n}\nfullImplementationExport().catch(e=>figma.closePlugin("Full export stopped: "+e.message));\n';
const output='/tmp/zen-mahjong-artwork-v2/code.js';fs.writeFileSync(output,script);console.log('Installed read-only full export: '+output);
