// QA: serves dist/, checks both pages (WhatsApp targets, tel links, language switch, anchors,
// images, overflow, console errors), compares the pages, and saves screenshots.
// Needs: cd tools && npm i   (puppeteer-core)  and Google Chrome installed.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { pathToFileURL, fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const shots = path.join(root, 'docs', 'screenshots');
fs.mkdirSync(shots, { recursive: true });
const puppeteer = (await import(pathToFileURL(path.join(root, 'tools/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js')).href)).default ?? (await import(pathToFileURL(path.join(root, 'tools/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js')).href));
const CHROME = process.env.CHROME_PATH || 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

const PREFIX = process.env.PAGES_PATH ? '/final-choice-maid-landing-pages' : ''; // simulates https://<user>.github.io/<repo>/
const INFO = JSON.parse(fs.readFileSync(path.join(root, 'build-info.json'), 'utf8'));
// Names cross-checked against the biodata file names in the marketing folder. Candidates without confirmed consent are read from the private (gitignored) store, never hard-coded here.
const PENDING = fs.existsSync(path.join(root, 'private/maids.pending.json')) ? JSON.parse(fs.readFileSync(path.join(root, 'private/maids.pending.json'), 'utf8')).maids : [];
const KNOWN_NAMES = ['Cici Pranita Bako', 'Editha Molina Orosco', 'Maria Evi Estera Br Sembiring', 'Jacquiline Navarro Donato', 'Lusiana', 'Purti Siregar', 'Babylyn Salado Lumayot', ...PENDING.map((m) => m.name)];
const pendingRe = PENDING.length ? new RegExp(PENDING.flatMap((m) => [m.name, m.code, m.photo]).map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i') : null;
const types = { '.html': 'text/html; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.txt': 'text/plain' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (PREFIX) { if (!p.startsWith(PREFIX + '/')) { res.writeHead(404); return res.end(); } p = p.slice(PREFIX.length); }
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(dist, path.normalize(p));
  if (!f.startsWith(dist) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(0);
const base = `http://127.0.0.1:${server.address().port}${PREFIX}`;
console.log(`Testing ${INFO.mode} build at ${base}  (maids: ${INFO.names.length}, experience claim: ${INFO.experienceClaim})`);

const cfgs = ['sales-1', 'sales-2'].map((id) => JSON.parse(fs.readFileSync(path.join(root, 'configs', `${id}.json`), 'utf8')));
const report = [];
let failures = 0;
const log = (ok, msg) => { if (!ok) failures++; report.push(`${ok ? 'PASS' : 'FAIL'}  ${msg}`); console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`); };

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
const waReport = [];

for (const cfg of cfgs) {
  const page = await browser.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  const failed = [];
  page.on('requestfailed', (r) => failed.push(r.url()));
  page.on('response', (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(`${base}/${cfg.id}/`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${base}/${cfg.id}/`, { waitUntil: 'networkidle0' });

  for (const lang of ['ms', 'en']) {
    if (lang === 'en') await page.click('.lang button[data-lang="en"]');
    const data = await page.evaluate((num) => {
      const links = [...document.querySelectorAll('[data-wa]')].map((a) => ({ k: a.dataset.wa, href: a.href, label: a.textContent.trim().slice(0, 40) }));
      const tel = [...document.querySelectorAll('a[href^="tel:"]')].map((a) => a.getAttribute('href'));
      const anyOther = [...document.querySelectorAll('a[href*="wa.me"],a[href*="whatsapp"]')].filter((a) => !a.href.startsWith(`https://wa.me/${num}?text=`)).length;
      return { links, tel, anyOther, htmlLang: document.documentElement.lang, h1: document.querySelector('h1').textContent, title: document.title,
        overflow: document.documentElement.scrollWidth > window.innerWidth, ref: !!document.querySelector('.dev-banner') };
    }, cfg.whatsapp);
    const allOk = data.links.every((l) => l.href.startsWith(`https://wa.me/${cfg.whatsapp}?text=`)) && data.anyOther === 0;
    log(allOk, `${cfg.id} [${lang}] ${data.links.length} WhatsApp links all -> wa.me/${cfg.whatsapp}`);
    log(data.tel.length > 0 && data.tel.every((t) => t === `tel:+${cfg.whatsapp}`), `${cfg.id} [${lang}] click-to-call -> ${data.tel.join(',')}`);
    log(lang === 'ms' ? data.h1 === 'Temui Pembantu Rumah yang Sesuai untuk Keluarga Anda' : data.h1 === 'Find the Right Maid for Your Family', `${cfg.id} [${lang}] hero headline: ${data.h1}`);
    log(!data.overflow, `${cfg.id} [${lang}] no horizontal overflow at 390px`);
    if (lang === 'ms') for (const l of data.links) waReport.push({ page: cfg.id, lang, ...l, message: decodeURIComponent(l.href.split('?text=')[1]) });
    if (lang === 'en') for (const l of data.links) waReport.push({ page: cfg.id, lang, ...l, message: decodeURIComponent(l.href.split('?text=')[1]) });
    if (lang === 'en') {
      const stillMalay = await page.evaluate(() => [...document.querySelectorAll('[data-i18n]')].filter((e) => /\b(dan|untuk|yang|anda|kami)\b/i.test(e.textContent) && !/\b(and|for|the|you|your)\b/i.test(e.textContent)).map((e) => e.textContent.slice(0, 50)));
      log(stillMalay.length === 0, `${cfg.id} [en] no untranslated Malay strings${stillMalay.length ? ': ' + stillMalay.join(' | ') : ''}`);
    }
  }
  for (const lang of ['ms', 'en']) {
    await page.goto(`${base}/${cfg.id}/?lang=${lang}`, { waitUntil: 'networkidle0' });
    const d = await page.evaluate(() => ({ msgs: [...document.querySelectorAll('[data-wa]')].map((a) => decodeURIComponent(a.href.split('?text=')[1])), btns: [...document.querySelectorAll('.btn[data-wa],.wa-float')].map((a) => a.textContent.trim()), text: document.body.innerText }));
    const n = cfg.consultant;
    log(d.msgs.every((m) => m.startsWith(`Hi ${n},`)), `${cfg.id} [${lang}] all ${d.msgs.length} messages start "Hi ${n},"`);
    log(d.btns.every((b) => !/WhatsApp/.test(b) || b === `WhatsApp ${n}`), `${cfg.id} [${lang}] WhatsApp buttons read "WhatsApp ${n}"`);
    log(d.text.includes(lang === 'ms' ? `Konsultan Jualan Anda: ${n}` : `Your Sales Consultant: ${n}`), `${cfg.id} [${lang}] contact section names ${n}`);
    log(d.text.includes(lang === 'ms' ? `${n} (Konsultan Jualan)` : `${n} (Sales Consultant)`) && d.text.includes(cfg.phoneDisplay), `${cfg.id} [${lang}] footer shows ${n} + ${cfg.phoneDisplay}`);
    const other = cfgs.find((c) => c.id !== cfg.id).consultant;
    log(!d.text.includes(other) && !d.msgs.some((m) => m.includes(other)), `${cfg.id} [${lang}] never mentions ${other}`);
  }
  const rawHtml = fs.readFileSync(path.join(dist, cfg.id, 'index.html'), 'utf8');
  log(!/RM\s?\d|ringgit|price|harga.*\d{4}/i.test(rawHtml.replace(/Pricing depends[^<]*|Harga bergantung[^<]*/g, '')) && !/title="[^"]*\d{2},?\d{3}/.test(rawHtml), `${cfg.id} no RM amounts or prices anywhere in the page source (text, tooltips, attributes)`);
  for (const lang of ['ms', 'en']) {
    await page.goto(`${base}/${cfg.id}/?lang=${lang}`, { waitUntil: 'networkidle0' });
    const t = await page.evaluate(() => ({ pk: [...document.querySelectorAll('.pkg__price')].map((e) => e.textContent.trim()), n: document.querySelectorAll('.pkg').length, pb: [...document.querySelectorAll('.pkg .btn')].map((e) => e.textContent.trim()), exp: document.querySelector('.exp')?.innerText.replace(/\s+/g, ' '), before: (() => { const w = document.querySelector('#why'); const e = w.querySelector('.exp'); return !!e && !!(e.compareDocumentPosition(w.querySelector('.why')) & 4); })() }));
    const want = lang === 'ms' ? 'Hubungi Kami untuk Maklumat Pakej' : 'Contact Us for Package Details';
    log(t.n === 8 && t.pk.length === 8 && t.pk.every((x) => x === want), `${cfg.id} [${lang}] all ${t.n} package cards show "${want}"`);
    log(t.pb.every((b) => b.includes(cfg.consultant)), `${cfg.id} [${lang}] every package button names ${cfg.consultant}`);
    const expOk = INFO.experienceClaim === 'numeric-15+'
      ? (t.exp && (lang === 'ms' ? t.exp.includes('15+ Tahun Pengalaman Profesional') : t.exp.includes('15+ Years of Professional Experience')) && t.before)
      : (t.exp && (lang === 'ms' ? t.exp.includes('Pengalaman Profesional dalam Pengambilan Pembantu Rumah') : t.exp.includes('Professional Experience in Domestic Helper Recruitment')) && !/\d/.test(t.exp) && t.before);
    log(!!expOk, `${cfg.id} [${lang}] experience highlight at top of Why section (${INFO.experienceClaim})`);
  }
  // featured maids: names must match the independent list taken from the biodata PDF file names on the NAS
  const EXPECT = INFO.names;
  for (const lang of ['ms', 'en']) {
    await page.goto(`${base}/${cfg.id}/?lang=${lang}`, { waitUntil: 'networkidle0' });
    const cards = await page.evaluate(() => [...document.querySelectorAll('.maid')].map((c) => ({ name: c.querySelector('h3').textContent, alt: c.querySelector('img').alt, type: c.querySelector('.maid__type').textContent, exp: c.querySelector('.maid__exp').textContent, text: c.innerText, html: c.outerHTML.replace(/ href="[^"]*"/g, '').replace(/ data-(code|maid)="[^"]*"/g, '') })));
    log(JSON.stringify(cards.map((c) => c.name)) === JSON.stringify(EXPECT) && EXPECT.every((n) => KNOWN_NAMES.includes(n)), `${cfg.id} [${lang}] ${cards.length} displayed names match the biodata records`);
    log(!cards.some((c) => /[A-Z]\d-\d{2}-[A-Z]+|MA\d{3}|IJM\d{3}|DB\d{3}|SEP\d{3}/i.test(c.html)), `${cfg.id} [${lang}] no maid reference codes visible on any card (text, alt, attributes)`);
    const pendingShown = PENDING.filter((m) => INFO.names.includes(m.name));
    if (pendingShown.length) {
      log(pendingShown.every((p) => cards.some((c) => c.name === p.name)), `${cfg.id} [${lang}] ${pendingShown.length} pending candidate(s) present (PREVIEW ONLY, never public)`);
    } else {
      log(!pendingRe || !cards.some((c) => pendingRe.test(c.html)), `${cfg.id} [${lang}] candidate without confirmed consent is NOT on the public page`);
    }
  }
  const sc = await page.$$eval('.maid [data-wa="biodata"]', (as) => as.map((a) => decodeURIComponent(a.href)));
  log(sc.length === INFO.names.length && INFO.names.every((n, i) => sc[i].includes(n)), `${cfg.id} ${sc.length} biodata request messages each name their maid`);
  for (const f of ['sales-1', 'sales-2']) { const h = fs.readFileSync(path.join(dist, f, 'index.html'), 'utf8'); if (cfg.id === f) log(!h.includes('601433131112') && !h.includes('3313 1112') && !h.includes('1433131112'), `${f} contains no trace of the old incorrect number 601433131112`); }
  // UTM test: ref tag carries campaign + source
  await page.goto(`${base}/${cfg.id}/?utm_source=facebook&utm_medium=cpc&lang=en`, { waitUntil: 'networkidle0' });
  const utmHref = await page.$eval('[data-wa="general"]', (a) => decodeURIComponent(a.href));
  log(utmHref.includes(`(Ref: ${cfg.campaign}/facebook)`), `${cfg.id} UTM source appended: ...${utmHref.slice(-40)}`);
  // package message uses category in selected language
  const pkgHref = await page.$eval('[data-wa="package"]', (a) => decodeURIComponent(a.href));
  log(/Premium package \(Indonesian Maid\)/.test(pkgHref), `${cfg.id} package message EN: ${pkgHref.split('?text=')[1].slice(0, 70)}`);
  // anchors
  const anchors = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href')).filter((h) => h.length > 1 && !document.querySelector(h)));
  log(anchors.length === 0, `${cfg.id} same-page anchors all resolve${anchors.length ? ': missing ' + anchors : ''}`);
  // images
  await page.evaluate(async () => { window.scrollTo(0, document.body.scrollHeight); await new Promise((r) => setTimeout(r, 400)); });
  await page.evaluate(async () => { for (const i of document.images) { i.scrollIntoView(); await i.decode().catch(() => {}); } });
  const broken = await page.evaluate(() => [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.src));
  log(broken.length === 0, `${cfg.id} all images load${broken.length ? ': ' + broken : ''}`);
  log(failed.length === 0, `${cfg.id} no failed/404 requests${failed.length ? ': ' + failed : ''}`);
  log(errors.length === 0, `${cfg.id} no console errors${errors.length ? ': ' + errors : ''}`);
  // noindex
  const robots = await page.$eval('meta[name=robots]', (m) => m.content);
  log(/noindex/.test(robots), `${cfg.id} robots meta = ${robots}`);
  // tabs + FAQ
  await page.goto(`${base}/${cfg.id}/`, { waitUntil: 'networkidle0' });
  await page.click('#tab-filipino');
  const filOk = await page.evaluate(() => !document.getElementById('panel-filipino').hidden && document.getElementById('panel-indonesian').hidden);
  log(filOk, `${cfg.id} package tabs switch`);
  await page.click('#faq details summary');
  log(await page.$eval('#faq details', (d) => d.open), `${cfg.id} FAQ expands`);

  // screenshots
  for (const lang of ['ms', 'en']) {
    await page.goto(`${base}/${cfg.id}/?lang=${lang}`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => { document.querySelectorAll('.rv').forEach((e) => e.classList.add('in')); document.querySelectorAll('img[loading="lazy"]').forEach((i) => { i.loading = 'eager'; }); });
    await new Promise((r) => setTimeout(r, 700));
    await page.screenshot({ path: path.join(shots, `${cfg.id}-mobile-${lang}-full.png`), fullPage: true });
    await page.screenshot({ path: path.join(shots, `${cfg.id}-mobile-${lang}-fold.png`) });
  }
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  for (const lang of ['ms', 'en']) {
    await page.goto(`${base}/${cfg.id}/?lang=${lang}`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => { document.querySelectorAll('.rv').forEach((e) => e.classList.add('in')); document.querySelectorAll('img[loading="lazy"]').forEach((i) => { i.loading = 'eager'; }); });
    await new Promise((r) => setTimeout(r, 700));
    await page.screenshot({ path: path.join(shots, `${cfg.id}-desktop-${lang}-full.png`), fullPage: true });
    await page.screenshot({ path: path.join(shots, `${cfg.id}-desktop-${lang}-fold.png`) });
  }
  await page.close();
}

// Public build audit: nothing sensitive may be in dist/
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((x) => (x.isDirectory() ? walk(path.join(d, x.name)) : [path.join(d, x.name)]));
const files = walk(dist);
log(!files.some((f) => /\.(pdf|docx?|xlsx?|csv|env|mp4|mov)$/i.test(f)), `dist contains no PDFs, office files, videos or .env (${files.length} files)`);
const textBlob = files.filter((f) => /\.(html|txt|json)$/.test(f)).map((f) => fs.readFileSync(f, 'utf8')).join('\n');
log(!/passport|\b[A-Z]\d{7,8}\b|nric|\bsk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{12,}/i.test(textBlob), 'dist text contains no passport/ID-number patterns or API-key patterns');
if (INFO.mode === 'release') log(!pendingRe || (!files.some((f) => pendingRe.test(f)) && !pendingRe.test(textBlob)), 'release dist contains no trace of any candidate without confirmed consent (photo, name, code)');

// Compare the two built pages: after masking the per-rep values they must be byte-identical.
const mask = (cfg, html) => html.split(cfg.whatsapp).join('{{WA}}').split(encodeURIComponent(cfg.campaign)).join('{{CAMP}}')
  .split(cfg.campaign).join('{{CAMP}}').split(cfg.phoneDisplay).join('{{PHONE}}').split(cfg.id).join('{{ID}}').split(cfg.consultant).join('{{NAME}}').split(cfg.label || '').join('{{LABEL}}');
const [a, b] = cfgs.map((c) => mask(c, fs.readFileSync(path.join(dist, c.id, 'index.html'), 'utf8')));
log(a === b, 'sales-1 and sales-2 are identical after masking number, phone display, campaign id and page id');

await browser.close(); server.close();
fs.writeFileSync(path.join(root, 'docs', 'qa-report.txt'), report.join('\n') + `\n\nTotal failures: ${failures}\n`);
fs.writeFileSync(path.join(root, 'docs', 'whatsapp-links.json'), JSON.stringify(waReport, null, 1));
console.log(`\nDone. Failures: ${failures}`);
process.exit(failures ? 1 : 0);
