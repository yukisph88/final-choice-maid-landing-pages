// Checks the LIVE GitHub Pages URLs in a real browser (images, language switch, WhatsApp targets, colour rows).
import path from 'node:path'; import { fileURLToPath, pathToFileURL } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const pp = (await import(pathToFileURL(path.join(root, 'tools/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js')).href)).default;
const B = process.env.LIVE_BASE || 'https://yukisph88.github.io/final-choice-maid-landing-pages';
const T = [['sales-1', '60143313112', 'Izzaty'], ['sales-2', '601118568998', 'Bella']];
const b = await pp.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: true, args: ['--no-sandbox'] });
let bad = 0; const ok = (c, m) => { if (!c) bad++; console.log((c ? 'PASS ' : 'FAIL ') + m); };
for (const [id, num, who] of T) for (const [lab, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 }]]) {
  const pg = await b.newPage(); await pg.setViewport(vp); const errs = []; pg.on('pageerror', (e) => errs.push(String(e))); pg.on('response', (r) => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); });
  await pg.goto(`${B}/${id}/`, { waitUntil: 'networkidle0' });
  const d = await pg.evaluate(async () => { document.querySelectorAll('img').forEach((i) => { i.loading = 'eager'; }); for (const i of document.images) await i.decode().catch(() => {}); return { imgs: [...document.images].filter((i) => !i.naturalWidth).length, wa: [...document.querySelectorAll('[data-wa]')].map((a) => a.href), tel: [...document.querySelectorAll('a[href^="tel:"]')].map((a) => a.getAttribute('href')), h1: document.querySelector('h1').textContent, rows: (() => { const m = [...document.querySelectorAll('.maid')]; const t = [...new Set(m.map((c) => c.offsetTop))]; return t.map((y) => m.filter((c) => c.offsetTop === y).map((c) => c.dataset.bg)); })() }; });
  ok(d.imgs === 0 && !errs.length, `${id} ${lab}: all images load, no errors${errs.length ? ' ' + errs : ''}`);
  ok(d.wa.length === 28 && d.wa.every((h) => h.startsWith(`https://wa.me/${num}?text=`)) && d.tel.every((t) => t === `tel:+${num}`), `${id} ${lab}: ${d.wa.length} WhatsApp links -> ${num}; tel ${d.tel}`);
  const rv = await pg.evaluate(() => { const s = document.querySelector('#reviews'); return s ? { cards: s.querySelectorAll('.rev__card').length, text: s.innerText.replace(/\s+/g, ' '), btn: [...s.querySelectorAll('a.btn')].pop().href } : null; });
  ok(rv === null || (rv.cards >= 4 && /23 November 2026/.test(rv.text) && /^https:\/\/www\.google\.com\/maps\/place\//.test(rv.btn) && !/SAMPLE/i.test(rv.text)), `${id} ${lab}: reviews section ${rv ? rv.cards + ' real review cards + See More button' : 'hidden (no approved reviews yet; no rating-only panel)'}`);
  if (lab === 'desktop') {
    ok(d.rows.every((r) => new Set(r).size === 1), `${id} desktop colour rows: ${d.rows.map((r) => r.length + ' ' + r[0]).join(' | ')}`);
    await pg.click('.lang button[data-lang="en"]'); const en = await pg.evaluate(() => ({ h1: document.querySelector('h1').textContent, m: decodeURIComponent(document.querySelector('[data-wa=general]').href.split('?text=')[1]), btn: document.querySelector('.header .btn--wa').textContent.trim() }));
    ok(en.h1 === 'Find the Right Maid for Your Family' && en.m.startsWith(`Hi ${who},`) && en.btn === `WhatsApp ${who}`, `${id} English switch works; message "${en.m.slice(0, 50)}..."`);
  }
  await pg.screenshot({ path: path.join(root, 'docs', 'screenshots', `live-${id}-${lab}-fold.png`) }); await pg.close();
}
await b.close(); console.log(bad ? `FAILURES: ${bad}` : 'LIVE CHECK: all passed'); process.exit(bad ? 1 : 0);
