// Screenshots the 8 featured maid cards (desktop + mobile, both pages) into docs/screenshots/.
import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { fileURLToPath, pathToFileURL } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist'); const out = path.join(root, 'docs', 'screenshots');
const pp = (await import(pathToFileURL(path.join(root, 'tools/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js')).href)).default;
const srv = http.createServer((q, r) => { let p = new URL(q.url, 'http://x').pathname; if (p.endsWith('/')) p += 'index.html'; const f = path.join(dist, p); if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': { '.html': 'text/html', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg' }[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); }).listen(0);
const b = await pp.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: true, args: ['--no-sandbox'] });
for (const id of ['sales-1', 'sales-2']) for (const [label, vp] of [['desktop', { width: 1440, height: 900, deviceScaleFactor: 1 }], ['mobile', { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true }]]) {
  const pg = await b.newPage(); await pg.setViewport(vp);
  await pg.goto(`http://127.0.0.1:${srv.address().port}/${id}/`, { waitUntil: 'networkidle0' });
  await pg.evaluate(() => { document.querySelectorAll('.rv').forEach((e) => e.classList.add('in')); document.querySelectorAll('img').forEach((i) => { i.loading = 'eager'; }); document.querySelector('.wa-float').style.display = 'none'; document.querySelector('.header').style.position = 'static'; });
  await new Promise((r) => setTimeout(r, 800));
  const info = await pg.evaluate(async () => Promise.all([...document.querySelectorAll('.maid')].map(async (c) => { const i = c.querySelector('img'); await i.decode().catch(() => {}); const r = i.getBoundingClientRect(); return `${c.querySelector('h3').textContent}:${i.naturalWidth === 480 && r.width > 100}`; })));
  console.log(id, label, info.join(' | '));
  await (await pg.$('.maids')).screenshot({ path: path.join(out, `featured-maids-8-${id}-${label}.png`) });
  await pg.close();
}
await b.close(); srv.close();
