// .github/scripts/generate-methods-index.js
//
// regenerates the public surface of @domina/methods from its method files:
//   - index.js  : barrel (export * from every method module)
//   - deno.json : exports map (barrel "." + one entry per method)
// method files are the flat *.js in packages/methods, excluding index.js and
// the internal _shared* modules. other deno.json fields are preserved.

import fs   from 'node:fs';
import path from 'node:path';

const PKG_DIR    = path.resolve('packages/methods');
const INDEX_FILE = path.join(PKG_DIR, 'index.js');
const DENO_FILE  = path.join(PKG_DIR, 'deno.json');

const isMethodFile = file =>
  file.endsWith('.js') && file !== 'index.js' && file !== '_shared.js';

const files = fs.readdirSync(PKG_DIR).filter(isMethodFile).sort();

// barrel
const barrel = files.map(file => `export * from './${file}';`).join('\n') + '\n';
fs.writeFileSync(INDEX_FILE, barrel, 'utf8');

// deno.json exports map, merged into the existing manifest (other fields kept)
const manifest = fs.existsSync(DENO_FILE)
  ? JSON.parse(fs.readFileSync(DENO_FILE, 'utf8'))
  : { name: '@domina/methods', version: '0.1.0', license: 'MIT', publish: { exclude: ['TODO.md', '**/*.test.js'] } };

const exportsMap = { '.': './index.js' };
for (const file of files) exportsMap['./' + file.replace(/\.js$/, '')] = './' + file;
manifest.exports = exportsMap;

fs.writeFileSync(DENO_FILE, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

console.log(`[domina] @domina/methods: ${files.length} methods -> index.js + deno.json (${Object.keys(exportsMap).length} exports)`);
