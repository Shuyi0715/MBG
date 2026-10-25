import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat, mkdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { routes, resolvePage } from '../src/render.js';

let server, browser, base;
const root = resolve('dist');
before(async () => {
  await stat(root);
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
  server = createServer(async (req, res) => {
    try {
      let file = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
      if (!file.startsWith(root + '/') && file !== root) throw new Error('Invalid path');
      if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
      res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
      res.end(await readFile(file));
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(await readFile(resolve(root, '404.html')));
    }
  });
  await new Promise(done => server.listen(0, '127.0.0.1', done));
  base = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  await mkdir('test-results', { recursive: true });
});
after(async () => { await browser?.close(); if (server) await new Promise(done => server.close(done)); });

test('all 33 pages are prerendered, load without script errors, and link to existing pages', async () => {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  for (const route of routes) {
    const response = await page.goto(base + route);
    assert.equal(response.status(), 200, route);
    assert.equal(await page.title(), resolvePage(route).title);
    assert.equal(await page.locator('main h1').count(), 1, `${route} has one main heading`);
    const html = await (await fetch(base + route)).text();
    assert.match(html, /<main id="main">[\s\S]*<h1>/, `${route} includes content without JavaScript`);
    const hrefs = await page.locator('a[href^="/"]').evaluateAll(links => links.map(a=>a.getAttribute('href')));
    for (const href of hrefs) assert.ok(routes.includes(href), `${route} links to valid page ${href}`);
  }
  assert.deepEqual(errors, []);
  assert.equal((await page.goto(base + '/does-not-exist')).status(), 404);
  assert.match(await page.locator('main h1').innerText(), /back home/);
  await page.close();
});

test('home is responsive and all images load without external requests', async () => {
  const page = await browser.newPage();
  const external = [];
  page.on('request', req => { if (!req.url().startsWith(base)) external.push(req.url()); });
  for (const width of [360, 390, 650, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(base);
    await page.evaluate(() => document.fonts.ready);
    const sizes = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: window.innerWidth }));
    assert.ok(sizes.content <= sizes.viewport, `No horizontal overflow at ${width}: ${JSON.stringify(sizes)}`);
    const broken = await page.locator('img').evaluateAll(images => images.filter(img => !img.complete || img.naturalWidth === 0).map(img=>img.src));
    assert.deepEqual(broken, []);
    if (width === 1440 || width === 390) await page.screenshot({ path: `test-results/home-${width}.png`, fullPage: true });
  }
  assert.deepEqual(external, []);
  await page.close();
});

test('mobile navigation opens, closes with Escape, and navigates to a real page', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(base);
  const toggle = page.locator('.menu-toggle');
  await toggle.click();
  assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
  await page.keyboard.press('Escape');
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
  await toggle.click();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Brands We Service' }).click();
  await page.waitForURL(base + '/brands');
  assert.match(await page.locator('h1').innerText(), /Premium appliances/);
  await page.close();
});

test('service requests validate, preserve text safely, and prepare an SMS without submitting data', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(base + '/services/refrigerator-repair');
  const trigger = page.getByRole('button', { name: 'Request service' }).first();
  await trigger.click();
  const dialog = page.getByRole('dialog');
  assert.equal(await dialog.isVisible(), true);
  assert.equal(await dialog.locator('select[name="appliance"]').inputValue(), 'refrigerator-repair');
  await dialog.getByRole('button', { name: 'Review my request' }).click();
  assert.equal(await page.locator('#booking-review').isVisible(), false);
  await dialog.getByLabel('Your name').fill('Taylor Test');
  await dialog.getByLabel('Phone number').fill('555-123-4567');
  await dialog.getByLabel('ZIP code').fill('33480');
  await dialog.getByLabel('Brand & model').fill('Sub-Zero 642');
  await dialog.getByLabel('What’s happening?').fill('<script>window.bad=true</script> Not cooling');
  const posts = [];
  page.on('request', req=>{ if (req.method() !== 'GET') posts.push(req.url()); });
  await dialog.getByRole('button', { name: 'Review my request' }).click();
  assert.equal(await page.locator('#booking-entry').isVisible(), false);
  assert.equal(await page.evaluate(()=>window.bad), undefined);
  const sms = await page.locator('#send-text').getAttribute('href');
  assert.ok(sms.startsWith('sms:+18888411175?body='));
  assert.match(decodeURIComponent(sms), /Taylor Test/);
  assert.match(decodeURIComponent(sms), /33480/);
  assert.match(decodeURIComponent(sms), /Sub-Zero 642/);
  assert.match(decodeURIComponent(sms), /Built-in refrigerators/);
  assert.match(await page.locator('#request-preview').innerText(), /<script>/);
  assert.deepEqual(posts, []);
  await dialog.getByRole('button', { name: 'Edit details' }).click();
  assert.equal(await dialog.getByLabel('Your name').inputValue(), 'Taylor Test');
  await page.keyboard.press('Escape');
  assert.equal(await dialog.isVisible(), false);
  assert.equal(await trigger.evaluate(el=>el===document.activeElement), true);
  await page.close();
});

test('resource search and category filters combine and show an empty state', async () => {
  const page = await browser.newPage();
  await page.goto(base + '/resources');
  await page.getByRole('button', { name: 'Error codes', exact: true }).click();
  assert.equal(await page.locator('[data-guide]:visible').count(), 1);
  assert.equal(await page.locator('[data-guide-filter="Error codes"]').getAttribute('aria-pressed'), 'true');
  await page.getByRole('searchbox').fill('no-such-guide');
  assert.equal(await page.locator('[data-guide]:visible').count(), 0);
  assert.equal(await page.locator('#guide-empty').isVisible(), true);
  await page.getByRole('searchbox').fill('');
  await page.getByRole('button', { name: 'All', exact: true }).click();
  assert.equal(await page.locator('[data-guide]:visible').count(), 4);
  await page.close();
});

test('model locator updates useful instructions for each appliance', async () => {
  const page = await browser.newPage();
  await page.goto(base + '/resources/model-number-locator');
  const select = page.getByLabel('What kind of appliance do you have?');
  for (const [value, match] of [['oven', /cool completely/], ['washer', /stacked/], ['dishwasher', /inner door/], ['wine', /grille/], ['fridge', /fresh-food/]]) {
    await select.selectOption(value);
    assert.match(await page.locator('#locator-description').innerText(), match);
  }
  await page.close();
});

test('core pages and booking dialog pass automated WCAG 2.2 AA checks', async () => {
  const context = await browser.newContext();
  const page = await context.newPage();
  for (const route of ['/', '/services/refrigerator-repair', '/brands/sub-zero', '/resources', '/resources/model-number-locator', '/contact']) {
    await page.goto(base + route);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    assert.deepEqual(results.violations.map(v=>({ id:v.id, nodes:v.nodes.map(n=>n.target) })), [], route);
  }
  await page.getByRole('button', { name: 'Book service', exact: true }).first().click();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  assert.deepEqual(results.violations.map(v=>({ id:v.id, nodes:v.nodes.map(n=>n.target) })), [], 'booking dialog');
  await context.close();
});
