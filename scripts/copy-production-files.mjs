import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

// Files to copy into the Angular build output after ng build.
// The dist path matches angular.json outputPath (CPMoita -> browser).
const files = [
  ['.htaccess', 'dist/CPMoita/browser/.htaccess'],
];

for (const [from, to] of files) {
  if (!existsSync(from)) {
    console.warn(`[postbuild] skip — not found: ${from}`);
    continue;
  }
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
  console.log(`[postbuild] copied ${from} -> ${to}`);
}
