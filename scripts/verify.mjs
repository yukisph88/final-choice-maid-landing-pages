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
const RELREC = fs.existsSync(path.join(root, 'private/maids.religion.json')) ? JSON.parse(fs.readFileSync(path.join(root, 'private/maids.religion.json'), 'utf8')).religions : null;
const KNOWN_NAMES =['Cici Pranita Bako', 'Editha Molina Orosco', 'Maria Evi Estera Br Sembiring', 'Jacquiline Navarro Donato', 'Lusiana', 'Purti Siregar', 'Babylyn Salado Lumayot', ...PENDING.map((m) => m.name)];
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
  page.on('requestfailed', (r) => { if (!/ERR_ABORTED/.test(r.failure()?.errorText || '')) failed.push(r.url()); }); // aborted = cancelled by our own navigation; real 404s are caught below
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
    // religion label: exactly the label expected from the recorded biodata value (build-info), under the nationality; none when not recorded/permitted
    const relExpect = INFO.religion || {};
    const relOk = await page.evaluate((exp, ix) => [...document.querySelectorAll('.maid')].every((c) => {
      const n = c.querySelector('h3').textContent, el = c.querySelector('.maid__rel');
      if (!exp[n]) return !el;
      return !!el && el.textContent.trim() === (ix === 0 ? `Agama: ${exp[n][0]}` : `Religion: ${exp[n][1]}`) && c.querySelector('.maid__type').nextElementSibling === el;
    }), relExpect, lang === 'ms' ? 0 : 1);
    log(relOk, `${cfg.id} [${lang}] religion label shown for exactly ${Object.keys(relExpect).length} maid(s), right under the nationality, text matches the recorded value`);
    // cross-check against the private recorded biodata values (when the private file exists): every shown label must map from the recorded religion; unlabeled maids must be intentionally held back
    if (RELREC) {
      const mapL = (r) => { const k = r.trim().toLowerCase(); return ['islam', 'muslim'].includes(k) ? ['Muslim', 'Muslim'] : ['christian', 'christianity', 'roman catholic'].includes(k) ? ['Kristian', 'Christian'] : [r, r]; };
      const shownOk = Object.entries(relExpect).every(([n, l]) => { const rec = RELREC.find((x) => x.name === n); return rec && JSON.stringify(mapL(rec.publicCategory || rec.recorded)) === JSON.stringify(l); });
      log(shownOk, `${cfg.id} [${lang}] every displayed religion label matches the recorded biodata value (${Object.keys(relExpect).length} shown, ${INFO.names.length - Object.keys(relExpect).length} held back pending wording/permission)`);
    }
    const pendingShown = PENDING.filter((m) => INFO.names.includes(m.name));
    if (pendingShown.length) {
      log(pendingShown.every((p) => cards.some((c) => c.name === p.name)), `${cfg.id} [${lang}] ${pendingShown.length} pending candidate(s) present (PREVIEW ONLY, never public)`);
    } else {
      log(!pendingRe || !cards.some((c) => pendingRe.test(c.html)), `${cfg.id} [${lang}] candidate without confirmed consent is NOT on the public page`);
    }
  }
  // colour grouping: measure the real backdrop colour of every photo and check the order/rows
  for (const [label, vp] of [['desktop', { width: 1440, height: 900, deviceScaleFactor: 1 }], ['mobile', { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true }]]) {
    await page.setViewport(vp);
    await page.goto(`${base}/${cfg.id}/?lang=${label === 'desktop' ? 'ms' : 'en'}`, { waitUntil: 'networkidle0' });
    const g = await page.evaluate(async () => {
      document.querySelectorAll('.rv').forEach((e) => e.classList.add('in'));
      const out = [];
      for (const c of document.querySelectorAll('.maid')) {
        const i = c.querySelector('img'); i.loading = 'eager'; await i.decode().catch(() => {});
        const cv = document.createElement('canvas'); cv.width = i.naturalWidth; cv.height = i.naturalHeight; const x = cv.getContext('2d'); x.drawImage(i, 0, 0);
        const px = [[4, 4], [cv.width - 5, 4], [4, 40], [cv.width - 5, 40]].map(([a, b]) => x.getImageData(a, b, 1, 1).data);
        const r = px.reduce((s, p) => s + p[0], 0) / 4, bl = px.reduce((s, p) => s + p[2], 0) / 4;
        out.push({ measured: r > bl ? 'yellow' : 'blue', declared: c.dataset.bg, top: c.offsetTop });
      }
      return out;
    });
    const seq = g.map((x) => x.measured);
    const blocks = seq.filter((c, i) => i === 0 || c !== seq[i - 1]).length;
    log(g.every((x) => x.measured === x.declared) && blocks <= 2 && seq[0] === 'blue', `${cfg.id} [${label}] photo backdrop colours measured from pixels: ${seq.join(',')} -> ${blocks} contiguous colour block(s), never alternating`);
    if (label === 'desktop') {
      const rows = [...new Set(g.map((x) => x.top))].map((t) => g.filter((x) => x.top === t).map((x) => x.measured));
      const mixedRows = rows.filter((r) => new Set(r).size > 1).length;
      log(mixedRows === (seq.filter((c) => c === 'blue').length % 4 === 0 ? 0 : 1) || mixedRows === 0, `${cfg.id} [desktop] colour rows: ${rows.map((r) => r.length + ' ' + r[0]).join(' | ')} (rows with mixed colours: ${mixedRows})`);
    }
  }
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const sc = await page.$$eval('.maid [data-wa="biodata"]', (as) => as.map((a) => decodeURIComponent(a.href)));
  log(sc.length === INFO.names.length && INFO.names.every((n, i) => sc[i].includes(n)), `${cfg.id} ${sc.length} biodata request messages each name their maid`);
  for (const f of ['sales-1', 'sales-2']) { const h = fs.readFileSync(path.join(dist, f, 'index.html'), 'utf8'); if (cfg.id === f) log(!h.includes('601433131112') && !h.includes('3313 1112') && !h.includes('1433131112'), `${f} contains no trace of the old incorrect number 601433131112`); }
  // Google reviews section: hidden unless approved + verified reviews exist; carousel/layout/language checks otherwise
  if (INFO.reviewsMode === 'hidden') {
    await page.goto(`${base}/${cfg.id}/`, { waitUntil: 'networkidle0' });
    log(!(await page.$('#reviews')), `${cfg.id} Google reviews section is hidden`);
  } else {
    for (const [label, vp] of [['desktop', { width: 1440, height: 900, deviceScaleFactor: 1 }], ['mobile', { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }]]) {
      await page.setViewport(vp);
      for (const lang of ['ms', 'en']) {
        await page.goto(`${base}/${cfg.id}/?lang=${lang}`, { waitUntil: 'networkidle0' });
        await page.evaluate(() => document.querySelectorAll('.rv').forEach((e) => e.classList.add('in')));
        const r = await page.evaluate(() => {
          const s = document.querySelector('#reviews'); const t = s.querySelector('.rev__track'); const tr = t.getBoundingClientRect();
          const cards = [...s.querySelectorAll('.rev__card')];
          const vis = cards.filter((c) => { const b = c.getBoundingClientRect(); return b.left >= tr.left - 2 && b.right <= tr.right + 2; }).length;
          const why = document.querySelector('#why'), cta = document.querySelector('#contact');
          const btn = [...s.querySelectorAll('a.btn')].pop();
          return { order: !!(why.compareDocumentPosition(s) & 4) && !!(s.compareDocumentPosition(cta) & 4), h2: s.querySelector('h2').textContent, vis, n: cards.length,
            btn: { t: btn.textContent.trim(), href: btn.href, target: btn.target, rel: btn.rel }, stars: cards.map((c) => c.querySelector('.rev__stars').getAttribute('aria-label')),
            links: cards.every((c) => /^https:\/\/www\.google\.com\/maps\//.test(c.querySelector('a.rev__src').href) && c.querySelector('a.rev__src').target === '_blank'),
            names: cards.every((c) => c.querySelector('.rev__who strong').textContent.trim().length > 0), agg: s.querySelector('.rev__head')?.innerText.replace(/\s+/g, ' '), brand: !!s.querySelector('.gword'),
            sample: !!s.querySelector('.dev-banner'), overflow: document.documentElement.scrollWidth > window.innerWidth };
        });
        const title = lang === 'ms' ? 'Apa Kata Pelanggan Kami' : 'What Our Customers Say';
        const btnT = lang === 'ms' ? 'Lihat Lagi Ulasan di Google' : 'See More Reviews on Google';
        log(r.order && r.h2 === title && r.btn.t === btnT && r.btn.target === '_blank' && /rel|noopener/.test(r.btn.rel) && /^https:\/\/www\.google\.com\/maps\/place\//.test(r.btn.href), `${cfg.id} [${label}/${lang}] reviews: after "Why Choose", before final CTA; title "${r.h2}"; button "${r.btn.t}" -> Google listing`);
        log(r.brand && r.links && r.names && r.stars.every((s) => /\d/.test(s)) && /4\.8/.test(r.agg) && /109/.test(r.agg) && /23 November 2026/.test(r.agg) && /snapshot|gambaran/i.test(r.agg) && r.sample === !!INFO.reviewsFixture && !r.overflow, `${cfg.id} [${label}/${lang}] Google branding, rating "${r.agg}", ${r.n} cards each with name/stars/source link, no overflow`);
        if (lang === 'en') {
          if (label === 'desktop') {
            const g = await page.evaluate(() => { const cs = [...document.querySelectorAll('#reviews .rev__card')]; const tops = [...new Set(cs.map((c) => Math.round(c.getBoundingClientRect().top)))]; const rows = tops.map((t) => cs.filter((c) => Math.round(c.getBoundingClientRect().top) === t)); return { perRow: rows.map((r) => r.length), equalH: rows.every((r) => new Set(r.map((c) => Math.round(c.getBoundingClientRect().height))).size === 1), arrows: getComputedStyle(document.querySelector('.rev__nav--next')).display }; });
            log(g.perRow[0] === Math.min(3, r.n) && g.perRow.every((n, i) => i === g.perRow.length - 1 || n === 3) && g.equalH, `${cfg.id} [desktop] review cards ${g.perRow.join('+')} per row (3 per row), equal heights within each row`);
            const ctr = await page.evaluate(() => { const t = document.querySelector('#reviews .rev__track').getBoundingClientRect(); const cs = [...document.querySelectorAll('#reviews .rev__card')].map((c) => c.getBoundingClientRect()); const tops = [...new Set(cs.map((c) => Math.round(c.top)))]; const rows = tops.map((y) => cs.filter((c) => Math.round(c.top) === y).sort((a, b) => a.left - b.left)); const last = rows[rows.length - 1]; const full = rows[0]; return { lastN: last.length, leftGap: last[0].left - t.left, rightGap: t.right - last[last.length - 1].right, lastGap: last.length > 1 ? last[1].left - last[0].right : null, fullGap: full.length > 1 ? full[1].left - full[0].right : null, sameWidth: Math.abs(last[0].width - full[0].width) < 1 }; });
            log(ctr.lastN === 3 || (ctr.lastN === 2 && Math.abs(ctr.leftGap - ctr.rightGap) <= 1.5 && Math.abs(ctr.lastGap - ctr.fullGap) <= 1 && ctr.sameWidth), `${cfg.id} [desktop] last row of ${ctr.lastN} centred: left margin ${ctr.leftGap.toFixed(1)}px = right margin ${ctr.rightGap.toFixed(1)}px; gap between the two ${ctr.lastGap && ctr.lastGap.toFixed(1)}px = normal row gap ${ctr.fullGap && ctr.fullGap.toFixed(1)}px; card width unchanged`);
          } else {
            log(r.vis === 1, `${cfg.id} [mobile] ${r.vis} review card visible at once (swipeable)`);
            const moved = await page.evaluate(async () => { const t = document.querySelector('.rev__track'); const cs = [...t.querySelectorAll('.rev__card')]; t.scrollTo({ left: cs[1].offsetLeft - cs[0].offsetLeft, behavior: 'auto' }); await new Promise((x) => setTimeout(x, 900)); return Math.abs(cs[1].getBoundingClientRect().left - t.getBoundingClientRect().left) < 6; });
            log(moved, `${cfg.id} [mobile] swipe/scroll snaps to the 2nd card`);
          }
        }
      }
    }
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  }
  // exact-wording check of the real Google review cards against the independent expected copy
  if (INFO.reviewsMode === 'cards' && !INFO.reviewsFixture) {
    const EXP = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/reviews.expected.json'), 'utf8')).reviews;
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    for (const lang of ['ms', 'en']) {
      await page.goto(`${base}/${cfg.id}/?lang=${lang}`, { waitUntil: 'networkidle0' });
      const got = await page.evaluate(() => [...document.querySelectorAll('#reviews .rev__card')].map((c) => ({ name: c.querySelector('.rev__who strong').textContent, stars: (c.querySelector('.rev__stars').getAttribute('aria-label').match(/\d/) || [''])[0], text: c.querySelector('.rev__text').textContent.replace(/^\u201c|\u201d$/g, ''), when: c.querySelector('.rev__who .muted')?.textContent, link: c.querySelector('a.rev__src').href })));
      const norm = (s) => s.replace(/\s+/g, ' ').trim();
      const same = got.length === EXP.length && EXP.every((e, i) => got[i].name === e.name && Number(got[i].stars) === e.stars && norm(got[i].text) === norm(e.text));
      log(same, `${cfg.id} [${lang}] ${got.length} review cards: names, 5-star ratings and exact wording match the supplied screenshots (${got.map((g) => g.name).join(', ')})`);
      log(got.every((g) => g.when && /^https:\/\/www\.google\.com\/maps\/place\//.test(g.link)), `${cfg.id} [${lang}] each card shows its date (${got.map((g) => g.when).join(' | ')}) and links to Google`);
    }
    const dup = await page.evaluate(() => { const t = document.querySelector('#reviews').innerText; return /\bSAMPLE\b|CONTOH TEKS/.test(t); });
    log(!dup, `${cfg.id} no sample/fictional review text on the page`);
  }
  // service cards: identical image box (4:3), aligned, photos loaded where configured
  for (const [label, vp] of [['desktop', { width: 1440, height: 900, deviceScaleFactor: 1 }], ['mobile', { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }]]) {
    await page.setViewport(vp);
    await page.goto(`${base}/${cfg.id}/?lang=en`, { waitUntil: 'networkidle0' });
    const sv = await page.evaluate(async () => {
      document.querySelectorAll('.rv').forEach((e) => e.classList.add('in'));
      const cards = [...document.querySelectorAll('#services .card')];
      for (const c of cards) { const i = c.querySelector('.svc__art img'); if (i) { i.loading = 'eager'; await i.decode().catch(() => {}); } }
      return cards.map((c) => { const a = c.querySelector('.svc__art').getBoundingClientRect(); const i = c.querySelector('.svc__art img'); const cb = c.getBoundingClientRect(); return { w: Math.round(a.width), h: Math.round(a.height), top: Math.round(cb.top + scrollY), bottom: Math.round(cb.bottom + scrollY), img: i ? i.naturalWidth > 0 : null, alt: i ? i.alt : null, title: c.querySelector('h3').textContent, btn: !!c.querySelector('a[data-wa]') }; });
    });
    const same = sv.length === 3 && sv.every((x) => Math.abs(x.w - sv[0].w) <= 1 && Math.abs(x.h - sv[0].h) <= 1 && Math.abs(x.w / x.h - 4 / 3) < 0.02);
    log(same, `${cfg.id} [${label}] 3 service cards share one image box ${sv[0].w}x${sv[0].h} (4:3)`);
    if (label === 'desktop') log(sv.every((x) => x.top === sv[0].top && x.bottom === sv[0].bottom), `${cfg.id} [desktop] service cards aligned (same top and bottom)`);
    const keys = ['childcare', 'elderly', 'household'];
    log(keys.every((k, i) => (INFO.servicePhotos.includes(k) ? sv[i].img === true && sv[i].alt && sv[i].alt.length > 10 : sv[i].img === null)) && sv.every((x) => x.btn), `${cfg.id} [${label}] service photos present for [${INFO.servicePhotos.join(', ') || 'none'}] and loaded; other cards keep the icon panel; WhatsApp button on every card`);
  }
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
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
if (INFO.mode === 'release') log(!/class="maid__rel"|Agama:|Religion:/.test(textBlob) || Object.keys(INFO.religion || {}).length > 0, 'release dist shows no religion label unless a maid has verified public-disclosure permission in content/maids.json');
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
