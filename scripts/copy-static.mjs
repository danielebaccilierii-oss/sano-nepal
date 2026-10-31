import { cp, copyFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

await mkdir('dist', { recursive: true });
await cp('assets2', 'dist/assets2', { recursive: true });
await copyFile('sheet-config.js', 'dist/sheet-config.js');
for (const file of ['CNAME', '.nojekyll']) {
  if (existsSync(file)) await copyFile(file, `dist/${file}`);
}
console.log('File statici copiati nella build di produzione.');
