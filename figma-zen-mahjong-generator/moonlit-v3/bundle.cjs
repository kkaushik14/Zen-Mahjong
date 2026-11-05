const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const assets = {};
for (const name of ['home-materials-alpha', 'menu-materials-alpha', 'moonlit-garden']) {
  assets[name] = fs.readFileSync(path.join(root, 'assets', name + '.png')).toString('base64');
}
const out = path.join(root, 'dist');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'code.js'), 'const ASSETS = ' + JSON.stringify(assets) + ';\n' + fs.readFileSync(path.join(root, 'builder.js'), 'utf8'));
fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify({
  name: 'Zen Mahjong Moonlit Garden V3', id: 'zen-mahjong-moonlit-v3-local',
  api: '1.0.0', main: 'code.js', editorType: ['figma'],
  documentAccess: 'dynamic-page', networkAccess: { allowedDomains: ['none'] }
}, null, 2));
console.log('Built local V3 plugin: ' + out);
