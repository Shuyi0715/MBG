import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { renderApp, resolvePage, routes } from '../src/render.js';

const template = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
for (const route of [...routes, '/404']) {
  const page = resolvePage(route);
  const html = template.replace('<div id="app"></div>', `<div id="app">${renderApp(route)}</div>`).replace(/<title>.*?<\/title>/s, `<title>${escape(page.title)}</title>`).replace(/(<meta name="description" content=")[^"]*("\s*\/?>)/, `$1${escape(route === '/' ? 'MBG Appliance Services specializes in built-in refrigerator repair for Sub-Zero, Viking, Miele, Thermador, JennAir, and Monogram in South Florida.' : page.title + '. Independent appliance service for homes, condos, and marine settings. Call 888-841-1175 to discuss service. Applies to your specific brand, model, and location.')} $2`);
  if (route === '/404') {
    await writeFile(new URL('../dist/404.html', import.meta.url), html);
  } else {
    const folder = new URL(`../dist${route === '/' ? '' : route}/`, import.meta.url);
    await mkdir(folder, { recursive: true });
    await writeFile(new URL('index.html', folder), html);
  }
}
console.log(`Prerendered ${routes.length} pages and a 404 page.`);
