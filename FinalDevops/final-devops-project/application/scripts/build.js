// Build step: syntax-check sources and write build metadata served by /version.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
for (const f of fs.readdirSync(path.join(root, 'src'))) {
  execFileSync('node', ['--check', path.join(root, 'src', f)], { stdio: 'inherit' });
}
const meta = {
  version: require('../package.json').version,
  commit: process.env.GIT_SHA || 'local',
  builtAt: new Date().toISOString(),
};
fs.writeFileSync(path.join(root, 'build-info.json'), JSON.stringify(meta, null, 2));
console.log('Build OK', meta);
