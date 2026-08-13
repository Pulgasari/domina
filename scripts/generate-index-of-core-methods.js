// scripts/generate-index-of-core-methods.js

import fs   from 'node:fs';
import path from 'node:path';

const METHODS_DIR = path.resolve('core/methods');
const INDEX_FILE  = path.join(METHODS_DIR, 'index.js');

const files = fs.readdirSync(METHODS_DIR)
  .filter(file => file.endsWith('.js') && file !== 'index.js')
  .sort();

const content = files
  .map(file => `export * from './${file}';`)
  .join('\n') + '\n';

fs.writeFileSync(INDEX_FILE, content, 'utf8');
console.log(`[domina] Updated methods/index.js (${files.length} exports)`);
