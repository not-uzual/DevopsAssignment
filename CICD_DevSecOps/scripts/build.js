// Build step: syntax-check sources and emit build metadata consumed by /version.
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

for (const f of ['src/app.js', 'src/server.js']) {
  execSync(`node --check ${path.join(__dirname, '..', f)}`, { stdio: 'inherit' });
}
const meta = {
  version: require('../package.json').version,
  commit: process.env.GITHUB_SHA || 'local',
  builtAt: new Date().toISOString(),
};
fs.writeFileSync(path.join(__dirname, '..', 'build-info.json'), JSON.stringify(meta, null, 2));
console.log('Build OK', meta);
