import { cp, mkdir, readdir, readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const output = new URL('../release/', import.meta.url);
const preview = new URL('mbg-ionos-preview/', output);
const archive = new URL('mbg-ionos-preview.zip', output);
await mkdir(output, { recursive: true });
// Only this script's generated release folder is replaced.
await rm(preview, { recursive: true, force: true });
await cp(new URL('../dist/', import.meta.url), preview, { recursive: true });
let pages = 0;
async function markPreview(folder) {
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const path = new URL(entry.name + (entry.isDirectory() ? '/' : ''), folder);
    if (entry.isDirectory()) await markPreview(path);
    else if (entry.name.endsWith('.html')) {
      const html = await readFile(path, 'utf8');
      await writeFile(path, html.replace('</head>', '<meta name="robots" content="noindex, nofollow" />\n</head>'));
      pages++;
    }
  }
}
await markPreview(preview);
await writeFile(new URL('robots.txt', preview), 'User-agent: *\nDisallow: /\n');
await writeFile(new URL('.htaccess', preview), 'DirectoryIndex index.html\nErrorDocument 404 /404.html\n<IfModule mod_headers.c>\n  Header set X-Robots-Tag "noindex, nofollow"\n</IfModule>\n');
await rm(archive, { force: true });
execFileSync('zip', ['-qr', fileURLToPath(archive), '.'], { cwd: fileURLToPath(preview) });
console.log(`Packaged ${pages} HTML files for an IONOS preview. Search indexing is disabled in this preview package.`);
console.log(fileURLToPath(archive));
