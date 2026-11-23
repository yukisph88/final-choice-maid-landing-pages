// Builds /sales-1/ and /sales-2/ from ONE shared template + one small config per sales rep.
// Usage:  node build.mjs            (preview build)
//         node build.mjs --release  (refuses to build while placeholder numbers remain)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MESSAGES, buildMessage } from './src/messages.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'dist');
const rd = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const json = (p) => JSON.parse(rd(p));
const release = process.argv.includes('--release');
const withPending = process.argv.includes('--with-pending');
const reviewsFixture = process.argv.includes('--reviews-fixture');
if (release && reviewsFixture) throw new Error('--reviews-fixture is sample data for layout tests and cannot be combined with --release.');
if (release && withPending) throw new Error('--with-pending is preview-only and cannot be combined with --release.');

const company = json('content/company.json');
const packages = json('content/packages.json');
const reviewsData = json('content/reviews.json');
if (reviewsFixture) reviewsData.reviews = json('tests/fixtures/reviews.sample.json').reviews;
// Only reviews that are approved, compared with the source, attributed and complete are ever shown.
const shownReviews = (reviewsData.reviews || []).filter((r) => r && r.approved === true && r.verifiedAgainstSource === true && r.name && r.text && r.sourceUrl && r.retrievedOn && Number.isInteger(r.stars) && r.stars >= 1 && r.stars <= 5);
const ratingOk = !!(reviewsData.rating && reviewsData.rating.verified === true && reviewsData.rating.value > 0 && reviewsData.rating.count > 0);
const showReviews = shownReviews.length >= 1;
// No rating-only fallback (management decision): without approved, source-verified review cards the section is not shown at all.
const reviewsMode = showReviews && ratingOk ? 'cards' : 'hidden';
const maidData = json('content/maids.json');
let pendingMaids = [];
if (withPending && fs.existsSync(path.join(root, 'private/maids.pending.json'))) {
  const pend = json('private/maids.pending.json');
  pendingMaids = pend.maids;
  maidData.maids.splice(pend.insertAt ?? maidData.maids.length, 0, ...pendingMaids);
}
// Group the featured maids by photo background colour (blue first, then yellow); stable within each group.
const BG_ORDER = { blue: 0, yellow: 1 };
for (const m of maidData.maids) if (!(m.background in BG_ORDER)) throw new Error(`maid ${m.name}: background must be blue or yellow`);
maidData.maids = maidData.maids.map((m, i) => ({ m, i })).sort((a, z) => BG_ORDER[a.m.background] - BG_ORDER[z.m.background] || a.i - z.i).map((x) => x.m);
const css = rd('src/styles.css');
const js = rd('src/app.js');

const SITE_TITLE = {
  ms: 'Pembantu Rumah Indonesia & Filipina | Final Choice',
  en: 'Indonesian & Filipino Maids | Final Choice'
};
const META_DESC = {
  ms: 'Perkhidmatan pengambilan pembantu rumah Indonesia dan Filipina yang profesional daripada Agensi Pekerjaan Final Choice (JTKSM 483). Dapatkan konsultasi percuma melalui WhatsApp.',
  en: 'Professional Indonesian and Filipino maid recruitment from Agensi Pekerjaan Final Choice (JTKSM 483). Get a free consultation on WhatsApp.'
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const hasFile = (p) => fs.existsSync(path.join(root, p));
// Service photos: public ones live in assets/img; photos awaiting approval live in private/assets/img and show in --with-pending previews only.
const SERVICE_KEYS = ['childcare', 'elderly', 'household'];
const svcSrc = (k) => (hasFile(`assets/img/service-${k}-800.webp`) ? 'public' : (withPending && hasFile(`private/assets/img/service-${k}-800.webp`) ? 'pending' : null));
const servicePhotos = SERVICE_KEYS.filter((k) => svcSrc(k));
const SVC_ALT = {
  childcare: ['Pembantu rumah Final Choice berinteraksi dengan seorang kanak-kanak semasa aktiviti latihan penjagaan kanak-kanak', 'Final Choice maids interacting with a young child during a childcare training activity'],
  household: ['Pembantu rumah berpakaian seragam biru Final Choice menjalankan tugas di dapur', 'A maid in a Final Choice blue uniform doing kitchen duties'],
  elderly: ['Dua pembantu rumah Final Choice berseragam biru membantu dua warga emas', 'Two Final Choice maids in blue uniforms assisting two elderly women']
};

const ICONS = {
  wa: '<path d="M3 21l1.65-4.9A8.5 8.5 0 1 1 8.2 19.4L3 21z"/><path d="M9 9.2c.4 2.3 2.5 4.4 4.8 4.8l1.4-1.2-1.9-1.2-.8.7c-.8-.4-1.4-1-1.8-1.8l.7-.8-1.2-1.9z"/>',
  child: '<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',
  elderly: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
  home: '<path d="M3 11l9-8 9 8M5 10v10h14V10M10 20v-6h4v6"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  cap: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
  support: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><path d="M4 14h3v5H5a1 1 0 0 1-1-1zM20 14h-3v5h2a1 1 0 0 0 1-1z"/>',
  check: '<path d="M5 12l5 5L20 7"/>',
  chev: '<path d="M6 9l6 6 6-6"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  mail: '<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M22 6l-10 7L2 6"/>',
  badge: '<circle cx="12" cy="9" r="6"/><path d="M8.5 14L7 22l5-3 5 3-1.5-8"/>'
};
const ico = (n, cls = '') => `<svg class="icon ${cls}" aria-hidden="true" focusable="false" viewBox="0 0 24 24">${ICONS[n]}</svg>`;

function render(cfg) {
  // ---- i18n registry: Malay text is written into the HTML, English goes into LP.en ----
  const N = cfg.consultant;
  const dict = {};
  const seen = new Map();
  const key = (msT, enT) => {
    const sig = msT + '\u0000' + enT;
    if (!seen.has(sig)) { const id = 'k' + seen.size; seen.set(sig, id); dict[id] = enT; }
    return seen.get(sig);
  };
  const tx = (msT, enT, tag = 'span', attrs = '') =>
    `<${tag}${attrs ? ' ' + attrs : ''} data-i18n="${key(msT, enT)}">${esc(msT)}</${tag}>`;
  const at = (name, msT, enT) => `${name}="${esc(msT)}" data-i18n-${name}="${key(msT, enT)}"`;

  // ---- WhatsApp link: static fallback (Malay) + runtime rewrite for language/UTM ----
  const ref = cfg.campaign;
  const wa = (k, o = {}) => {
    const text = buildMessage(k, 'ms', { name: cfg.consultant, code: o.code, maid: o.maid, pkg: o.pkg, cat: o.catMs }, ref);
    let a = `href="https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(text)}" data-wa="${k}" target="_blank" rel="noopener"`;
    if (o.code) a += ` data-code="${esc(o.code)}" data-maid="${esc(o.maid)}"`;
    if (o.pkg) a += ` data-pkg="${esc(o.pkg)}" data-cat-ms="${esc(o.catMs)}" data-cat-en="${esc(o.catEn)}"`;
    return a;
  };
  const waBtn = (k, msT, enT, cls = 'btn--wa', o = {}) =>
    `<a class="btn ${cls}" ${wa(k, o)}>${ico('wa')}${tx(msT, enT)}</a>`;

  // ---- Services (photo slot: drop assets/img/service-<key>.webp to replace the icon panel) ----
  const services = [
    { k: 'childcare', icon: 'child', t: ['Penjagaan Kanak-Kanak', 'Childcare'],
      d: ['Pembantu rumah yang boleh membantu menjaga kanak-kanak dan bayi mengikut keperluan keluarga anda.', 'A maid who can help look after babies and children according to your family\u2019s needs.'] },
    { k: 'elderly', icon: 'elderly', t: ['Penjagaan Warga Emas', 'Elderly Care'],
      d: ['Bantuan penjagaan harian untuk ibu bapa atau warga emas di rumah anda, dengan penuh kesabaran.', 'Day-to-day care support for parents or elderly family members at home, with patience and respect.'] },
    { k: 'household', icon: 'home', t: ['Pengurusan Rumah', 'Household Duties'],
      d: ['Bantuan kerja rumah harian seperti mengemas, membasuh dan memasak, mengikut tugas yang dipersetujui.', 'Help with daily housework such as cleaning, laundry and cooking, based on the duties you agree on.'] }
  ];
  const svcCards = services.map((s) => {
    const art = svcSrc(s.k)
      ? `<div class="svc__art svc__art--photo"><img src="../assets/img/service-${s.k}-800.webp" srcset="../assets/img/service-${s.k}-480.webp 480w, ../assets/img/service-${s.k}-800.webp 800w" sizes="(min-width:960px) 360px, (min-width:640px) 45vw, 92vw" ${at('alt', SVC_ALT[s.k][0], SVC_ALT[s.k][1])} width="800" height="600" loading="lazy"></div>`
      : `<div class="svc__art" aria-hidden="true">${ico(s.icon)}</div>`;
    return `<article class="card rv">${art}<div class="card__body">${tx(...s.t, 'h3')}${tx(...s.d, 'p')}
      <a class="btn btn--navy btn--sm" ${wa(s.k)}>${ico('wa')}${tx('Tanya Sekarang', 'Enquire Now')}</a></div></article>`;
  }).join('\n');

  // ---- Nationality cards ----
  const byNat = (n) => maidData.maids.filter((m) => m.nationality === n);
  const natPhotos = (n) => byNat(n).slice(0, 2).map((m) =>
    `<img src="../assets/maids/${m.photo}-480.webp" alt="" width="480" height="600" loading="lazy">`).join('');
  const natCard = (k, titleT, imgs) => `<article class="nat__card rv">
      <div class="nat__photos">${imgs}</div>
      <div class="nat__body">${tx(...titleT, 'h3')}
        <ul>
          <li>${ico('check')}${tx('Bantuan kerja rumah', 'Household assistance')}</li>
          <li>${ico('check')}${tx('Penjagaan kanak-kanak', 'Childcare')}</li>
          <li>${ico('check')}${tx('Penjagaan warga emas', 'Elderly care')}</li>
        </ul>
        <a class="btn btn--wa btn--block" ${wa(k)}>${ico('wa')}${tx('Tanya Sekarang', 'Enquire Now')}</a>
      </div></article>`;

  // ---- Maid previews ----
  const SKILL = {
    childcare: ['Penjagaan kanak-kanak', 'Childcare'], elderly: ['Penjagaan warga emas', 'Elderly care'],
    cooking: ['Memasak', 'Cooking'], housekeeping: ['Kerja rumah', 'Housekeeping'], newborn: ['Penjagaan bayi', 'Newborn care']
  };
  const NATMAID = { indonesian: ['Pembantu Rumah Indonesia', 'Indonesian Maid'], filipino: ['Pembantu Rumah Filipina', 'Filipino Maid'] };
  const NAT = { indonesian: ['Indonesia', 'Indonesian'], filipino: ['Filipina', 'Filipino'] };
  const maidCards = maidData.maids.map((m) => {
    const yrs = m.years;
    const age = maidData.showAge && m.age ? ` \u00b7 ${tx(`${m.age} tahun`, `${m.age} yrs`)}` : '';
    return `<article class="card maid rv" data-bg="${m.background}">
      <div class="maid__photo">
        <img src="../assets/maids/${m.photo}-480.webp" alt="${esc(m.name)}" width="480" height="600" loading="lazy">
        <span class="maid__exp">${tx(`${yrs} tahun pengalaman`, `${yrs} years\u2019 experience`)}</span>
      </div>
      <div class="card__body">
        <h3>${esc(m.name)}</h3>
        <p class="maid__type">${tx(...NATMAID[m.nationality])}${age}</p>
        <div class="chips">${m.skills.map((s) => tx(...SKILL[s], 'span', 'class="chip"')).join('')}</div>
        ${tx('Status: tertakluk pengesahan', 'Status: subject to confirmation', 'p', 'class="maid__status"')}
        <a class="btn btn--wa btn--sm" ${wa('biodata', { code: m.code, maid: m.name })}>${ico('wa')}${tx('Minta Biodata', 'Request Biodata')}</a>
      </div></article>`;
  }).join('\n');

  // ---- Packages ----
  const tabsHtml = packages.categories.map((c, i) =>
    `<button type="button" role="tab" id="tab-${c.id}" aria-controls="panel-${c.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${tx(c.tab.ms, c.tab.en)}</button>`).join('');
  const panels = packages.categories.map((c, i) => {
    const cards = c.packages.map((p) => {
      const price = `<div class="pkg__price">${tx('Hubungi Kami untuk Maklumat Pakej', 'Contact Us for Package Details')}</div>`;
      return `<article class="pkg${p.highlight ? ' pkg--hl' : ''} rv">
        <h3>${esc(p.name)}</h3><p class="pkg__cat">${tx(c.title.ms, c.title.en)}</p>${price}
        <ul class="ticks">${p.terms.map((t) => `<li>${ico('check')}${tx(t.ms, t.en)}</li>`).join('')}</ul>
        <a class="btn btn--wa" ${wa('package', { pkg: p.name, catMs: c.title.ms, catEn: c.title.en })}>${ico('wa')}${tx(`Tanya ${N} tentang Pakej Ini`, `Ask ${N} About This Package`)}</a>
      </article>`;
    }).join('');
    return `<div role="tabpanel" id="panel-${c.id}" aria-labelledby="tab-${c.id}"${i ? ' hidden' : ''}>
      <div class="pkgs" data-n="${c.packages.length}" style="--n:${c.packages.length}">${cards}</div>
      <div class="includes"><h3>${tx('Termasuk dalam pakej ini', 'Included in this package')}</h3>
        <ul>${c.includes.map((t) => `<li>${ico('check')}${tx(t.ms, t.en)}</li>`).join('')}</ul></div>
    </div>`;
  }).join('\n');

  // ---- Why choose ----
  const why = [
    ['shield', ['Agensi Pekerjaan Berlesen', 'Licensed Employment Agency'], ['Berdaftar dan berlesen di bawah JTKSM 483 (Kategori C).', 'Registered and licensed under JTKSM 483 (Category C).']],
    ['users', ['Saringan Pembantu Rumah Profesional', 'Professional Maid Screening'], ['Calon disaring dan dinilai sebelum biodata dikongsi dengan anda.', 'Candidates are screened and assessed before their biodata is shared with you.']],
    ['badge', ['Pemadanan Peribadi', 'Personalised Matching'], ['Kami mengambil kira keperluan, tugas dan suasana isi rumah anda.', 'We consider your household\u2019s needs, duties and routine.']],
    ['file', ['Bantuan Dokumentasi', 'Documentation Assistance'], ['Perunding kami membimbing anda melalui dokumen dan permohonan yang diperlukan.', 'Our consultants guide you through the documents and applications required.']],
    ['cap', ['Orientasi & Persediaan', 'Maid Orientation & Preparation'], ['Orientasi disediakan sebelum penyerahan kepada majikan.', 'Orientation is provided before handover to the employer.']],
    ['support', ['Sokongan Selepas Jualan', 'After-Sales Support'], ['Kami kekal tersedia untuk majikan dan pembantu rumah selepas penempatan.', 'We remain available to employers and maids after placement.']]
  ].map(([i, t, d]) => `<div class="why__item rv"><div class="ico">${ico(i)}</div>${tx(...t, 'h3')}${tx(...d, 'p')}</div>`).join('');

  const E = company.experience;
  const expNumeric = !!(E && E.display) && (E.confirmed || !release);
  const exp = !E ? '' : !expNumeric ? `<div class="exp rv"><div class="exp__badge exp__badge--icon" aria-hidden="true">${ico('badge')}</div>
      <div class="exp__txt"><span class="exp__tag">${tx('Pengalaman Profesional', 'Professional Experience')}</span>
      ${tx('Pengalaman Profesional dalam Pengambilan Pembantu Rumah', 'Professional Experience in Domestic Helper Recruitment', 'h3')}
      ${tx('Dengan pengalaman profesional dalam pengambilan pembantu rumah, Final Choice komited membantu keluarga di Malaysia mencari pembantu rumah Indonesia dan Filipina yang sesuai melalui pemadanan mengikut keperluan, bantuan proses pengambilan dan sokongan pelanggan.', 'With professional experience in domestic helper recruitment, Final Choice is dedicated to helping Malaysian families find suitable Indonesian and Filipino maids through personalised matching, recruitment assistance and ongoing customer support.', 'p')}</div></div>` : E.display ? `<div class="exp rv"><div class="exp__badge" aria-hidden="true"><strong>${E.display}</strong>${tx('Tahun', 'Years')}</div>
      <div class="exp__txt"><span class="exp__tag">${tx(`${E.display} Tahun Pengalaman Profesional`, `${E.display} Years of Professional Experience`)}</span>
      ${tx(`${E.display} Tahun Pengalaman Profesional`, `${E.display} Years of Professional Experience`, 'h3')}
      ${tx('Dengan pengalaman profesional melebihi 15 tahun dalam pengambilan pembantu rumah, Final Choice komited membantu keluarga di Malaysia mencari pembantu rumah Indonesia dan Filipina yang sesuai melalui pemadanan mengikut keperluan, bantuan proses pengambilan dan sokongan pelanggan.', 'With over 15 years of professional experience in domestic helper recruitment, Final Choice is dedicated to helping Malaysian families find suitable Indonesian and Filipino maids through personalised matching, recruitment assistance and ongoing customer support.', 'p')}
      ${tx('Pengalaman ini merujuk kepada pengambilan dan penempatan pembantu rumah, bukan bilangan tahun sejak syarikat ditubuhkan.', 'This experience relates to domestic helper recruitment and placement, not the number of years since the company was incorporated.', 'p', 'class="exp__note"')}</div></div>` : '';

  // ---- Google reviews (hidden unless approved + verified reviews exist) ----
  const starSvg = (cls) => `<svg class="icon rev__star ${cls}" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.5l-5.9 3.2 1.2-6.6L2.5 9.5l6.6-.9z"/></svg>`;
  const starRow = (n, cls = '') => `<span class="rev__stars ${cls}" role="img" ${at('aria-label', `${n} daripada 5 bintang`, `${n} out of 5 stars`)}>${[1, 2, 3, 4, 5].map((i) => starSvg(i <= n ? 'on' : 'off')).join('')}</span>`;
  const gword = '<span class="gword" aria-label="Google"><span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span></span>';
  let reviewsSection = '';
  if (reviewsMode === 'cards') {
    const R = reviewsData.rating; const S = reviewsData.source;
    const MONTHS = { en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], ms: ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'] };
    const [yy, mm, dd] = R.retrievedOn.split('-').map(Number);
    const dateMs = `${dd} ${MONTHS.ms[mm - 1]} ${yy}`; const dateEn = `${dd} ${MONTHS.en[mm - 1]} ${yy}`;
    const aggStars = `<span class="rev__stars rev__stars--agg" role="img" ${at('aria-label', `Penilaian ${R.value.toFixed(1)} daripada 5 bintang`, `Rated ${R.value.toFixed(1)} out of 5 stars`)}><span class="rev__stars-bg">${[1, 2, 3, 4, 5].map(() => starSvg('off')).join('')}</span><span class="rev__stars-fg" style="width:${(R.value / 5 * 100).toFixed(1)}%">${[1, 2, 3, 4, 5].map(() => starSvg('on')).join('')}</span></span>`;
    const cards = shownReviews.map((r) => `<article class="rev__card"><div class="rev__top">${starRow(r.stars)}${gword}</div>
        <blockquote class="rev__text" lang="${esc(r.lang || 'en')}">\u201c${esc(r.text)}\u201d</blockquote>
        <div class="rev__who"><strong>${esc(r.name)}</strong>${r.when ? (typeof r.when === 'object' ? tx(r.when.ms, r.when.en, 'span', 'class="muted"') : `<span class="muted">${esc(r.when)}</span>`) : ''}
        <a href="${esc(r.sourceUrl)}" target="_blank" rel="noopener" class="rev__src">${tx('Lihat di Google', 'View on Google')}</a></div></article>`).join('\n');
    reviewsSection = `<section id="reviews" class="rev">
  <div class="container">
    <div class="sec-head sec-head--tight">${tx('Ulasan Google', 'Google Reviews', 'span', 'class="eyebrow"')}
      ${tx('Apa Kata Pelanggan Kami', 'What Our Customers Say', 'h2')}
      <div class="rev__head">${gword}<strong class="rev__score">${R.value.toFixed(1)}<span class="rev__of"> / 5.0</span></strong>${aggStars}<span class="rev__count">${tx(`${R.count} Ulasan Google`, `${R.count} Google Reviews`)}</span><span class="rev__snapdate">${tx(`Gambaran: ${dateMs}`, `Snapshot: ${dateEn}`)}</span></div>
      ${reviewsFixture ? '<div class="dev-banner" role="status" style="margin-top:12px;border-radius:8px">SAMPLE DATA: layout preview only, not real reviews</div>' : ''}</div>
    <div class="rev__wrap">
      <button type="button" class="rev__nav rev__nav--prev" ${at('aria-label', 'Ulasan sebelumnya', 'Previous review')}>${ico('chev', 'rot90')}</button>
      <div class="rev__track" tabindex="0" role="region" ${at('aria-label', 'Ulasan pelanggan Google', 'Google customer reviews')}>${cards}</div>
      <button type="button" class="rev__nav rev__nav--next" ${at('aria-label', 'Ulasan seterusnya', 'Next review')}>${ico('chev', 'rotm90')}</button>
    </div>
    <div class="rev__cta"><a class="btn btn--navy" href="${esc(S.reviewsUrl)}" target="_blank" rel="noopener" data-track="google_reviews">${tx('Lihat Lagi Ulasan di Google', 'See More Reviews on Google')}</a></div>
    ${tx('Ulasan dipaparkan seperti yang ditulis pelanggan di Google, tanpa disunting; tanda \u2026 menunjukkan petikan. Tarikh ialah seperti yang dipaparkan di Google pada 23 November 2026. Penilaian dan bilangan ulasan ialah gambaran pada tarikh yang dinyatakan dan tidak dikemas kini secara automatik.', 'Reviews are shown as written by customers on Google, unedited; \u2026 marks an excerpt. Dates are as displayed on Google on 23 November 2026. The rating and review count are a snapshot on the date shown and do not update automatically.', 'p', 'class="note"')}
  </div>
</section>
`;
  }

  // ---- Process ----
  const steps = [
    [['Hubungi perunding kami', 'Contact our consultant'], ['Mesej kami melalui WhatsApp.', 'Message us on WhatsApp.']],
    [['Kongsi keperluan anda', 'Share your requirements'], ['Beritahu kami tentang keluarga dan tugas yang diperlukan.', 'Tell us about your family and the duties needed.']],
    [['Pilih & temu duga pembantu rumah', 'Select and interview a suitable maid'], ['Pilih calon daripada biodata dan temu duga calon pilihan anda.', 'Choose from the biodata and interview your shortlisted candidate.']],
    [['Lengkapkan permohonan & dokumen', 'Complete the application and documentation'], ['Kami membantu anda dengan permohonan dan dokumen.', 'We assist you with the application and documents.']],
    [['Ketibaan & penyerahan', 'Maid arrival and handover'], ['Pembantu rumah tiba dan diserahkan kepada anda.', 'Your maid arrives and is handed over to you.']]
  ].map(([t, d], i) => `<li class="step rv"><span class="step__n" aria-hidden="true">${i + 1}</span><div>${tx(...t, 'h3')}${tx(...d, 'p')}</div></li>`).join('');

  // ---- FAQ (wording adapted from the existing Maid website) ----
  const faqs = [
    [['Bagaimana cara memohon pembantu rumah?', 'How do I apply for a maid?'],
     ['Hubungi perunding kami melalui WhatsApp dan beritahu keperluan keluarga anda. Kami akan berkongsi biodata yang sesuai, mengatur temu duga, dan membimbing anda melalui kontrak, permohonan kepada pihak berkuasa serta ketibaan dan penyerahan pembantu. Tempoh proses berbeza mengikut kes dan tidak boleh dijamin.',
      'Contact our consultant on WhatsApp and tell us about your household. We will share suitable biodata, arrange an interview, and guide you through the contract, the application to the authorities, and the maid\u2019s arrival and handover. Timelines vary from case to case and cannot be guaranteed.']],
    [['Apakah warganegara pembantu rumah yang ada?', 'What nationalities are available?'],
     ['Kami menyediakan pembantu rumah Indonesia (termasuk Indonesia Kristian) dan Filipina. Perunding kami boleh membandingkan kedua-dua pilihan untuk keluarga anda.',
      'We offer Indonesian (including Indonesian Christian) and Filipino maids. Our consultant can compare both options for your household.']],
    [['Bolehkah saya menemu duga pembantu rumah sebelum pengesahan?', 'Can I interview the maid before confirmation?'],
     ['Boleh. Selepas anda memilih calon daripada biodatanya, kami boleh mengatur temu duga, biasanya melalui panggilan video.',
      'Yes. After you shortlist a candidate from her biodata, we can arrange an interview, usually by video call.']],
    [['Apakah dokumen yang diperlukan?', 'What documents are required?'],
     ['Majikan biasanya perlu menyediakan salinan MyKad, bukti pendapatan dan bukti alamat. Dokumen lain mungkin diperlukan bergantung pada keadaan keluarga dan warganegara pembantu. Kami akan memberikan senarai semak terkini untuk kes anda.',
      'Employers are usually asked for a copy of their MyKad, proof of income and proof of address. Other documents may be requested depending on your household and the maid\u2019s nationality. We will give you an up-to-date checklist for your case.']],
    [['Berapakah kos pakej pembantu rumah?', 'How much does a maid package cost?'],
     ['Harga bergantung pada warganegara dan jenis pakej. Sila hubungi perunding anda untuk maklumat pakej terkini. Perunding kami akan mengesahkan sebut harga akhir, kandungan pakej dan terma secara bertulis sebelum anda membuat keputusan.',
      'Pricing depends on the nationality and package type. Please contact your consultant for current package details. Your consultant will confirm the final quotation, inclusions and terms in writing before you commit.']],
    [['Apakah sokongan selepas jualan yang disediakan?', 'What after-sales support is provided?'],
     ['Kami menyediakan orientasi sebelum penyerahan dan kekal tersedia untuk majikan serta pembantu selepas penempatan. Bantuan penggantian bergantung pada pakej yang dipilih dan terma perjanjian perkhidmatan anda.',
      'We provide an orientation before handover and remain available to both employer and maid after placement. Replacement assistance depends on the package you choose and the terms of your service agreement.']]
  ].map(([q, a]) => `<details class="rv"><summary>${tx(...q)}${ico('chev')}</summary><div class="ans">${tx(...a, 'p')}</div></details>`).join('');

  const hours = company.hours.ms.map((h, i) => `<li>${i === 0 ? ico('clock') : '<span class="icon"></span>'}<span>${tx(h, company.hours.en[i])}</span></li>`).join('');
  const tel = '+' + cfg.whatsapp;

  const LP = {
    id: cfg.id, consultant: cfg.consultant, whatsapp: cfg.whatsapp, campaign: cfg.campaign, analytics: cfg.analytics,
    messages: MESSAGES, en: dict, titles: SITE_TITLE
  };

  return `<!doctype html>
<html lang="ms" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(SITE_TITLE.ms)}</title>
<meta name="description" content="${esc(META_DESC.ms)}" data-i18n-content="${key(META_DESC.ms, META_DESC.en)}">
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#019DDA">
<meta name="landing-page" content="${cfg.id}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(SITE_TITLE.ms)}">
<meta property="og:description" content="${esc(META_DESC.ms)}">
<meta property="og:image" content="../assets/img/og.jpg">
<link rel="icon" type="image/png" sizes="48x48" href="../assets/img/favicon-48.png">
<link rel="apple-touch-icon" href="../assets/img/apple-touch-icon.png">
<link rel="preload" as="image" href="../assets/img/training-group-800.webp" imagesrcset="../assets/img/training-group-480.webp 480w, ../assets/img/training-group-800.webp 800w, ../assets/img/training-group-1080.webp 1080w" imagesizes="(min-width:900px) 520px, 92vw" fetchpriority="high">
<style>${css}</style>
</head>
<body>
<a class="skip" href="#main">${tx('Terus ke kandungan', 'Skip to content')}</a>
${cfg.placeholderNumber ? `<div class="dev-banner" role="status">PREVIEW ONLY: placeholder WhatsApp number (${esc(cfg.phoneDisplay)}). Replace in configs/${cfg.id}.json before release.</div>` : ''}

<header class="header">
  <div class="container header__in">
    <a class="brand" href="#top">
      <img src="../assets/img/logo-160.webp" srcset="../assets/img/logo-160.webp 1x, ../assets/img/logo-320.webp 2x" width="67" height="50" alt="Final Choice">
      <b>Final Choice<small>Agensi Pekerjaan</small></b>
    </a>
    <nav class="nav" ${at('aria-label', 'Navigasi utama', 'Main navigation')}>
      <a href="#services">${tx('Perkhidmatan', 'Services')}</a>
      <a href="#maids">${tx('Pembantu Rumah', 'Maids')}</a>
      <a href="#packages">${tx('Pakej', 'Packages')}</a>
      <a href="#why">${tx('Kenapa Kami', 'Why Us')}</a>
      <a href="#process">${tx('Proses', 'Process')}</a>
      <a href="#faq">${tx('Soalan Lazim', 'FAQ')}</a>
    </nav>
    <div class="lang" role="group" ${at('aria-label', 'Bahasa', 'Language')}>
      <button type="button" data-lang="ms" aria-pressed="true">BM</button>
      <button type="button" data-lang="en" aria-pressed="false">EN</button>
    </div>
    <a class="btn btn--wa btn--sm" ${wa('general')}>${ico('wa')}${tx(`WhatsApp ${N}`, `WhatsApp ${N}`)}</a>
    <button class="menu-btn" id="menu-btn" type="button" aria-expanded="false" aria-controls="mnav" ${at('aria-label', 'Menu', 'Menu')}>${ico('menu')}</button>
  </div>
  <nav class="mnav" id="mnav" ${at('aria-label', 'Navigasi mudah alih', 'Mobile navigation')}>
    <a href="#services">${tx('Perkhidmatan', 'Services')}</a>
    <a href="#maids">${tx('Pembantu Rumah', 'Maids')}</a>
    <a href="#packages">${tx('Pakej', 'Packages')}</a>
    <a href="#why">${tx('Kenapa Kami', 'Why Us')}</a>
    <a href="#process">${tx('Proses', 'Process')}</a>
    <a href="#faq">${tx('Soalan Lazim', 'FAQ')}</a>
  </nav>
</header>

<main id="main">
<section class="hero" id="top">
  <div class="container hero__grid">
    <div>
      <span class="badge">${ico('shield')}${tx('Agensi Pekerjaan Berlesen \u00b7 JTKSM 483', 'Licensed Employment Agency \u00b7 JTKSM 483')}</span>
      ${tx('Temui Pembantu Rumah yang Sesuai untuk Keluarga Anda', 'Find the Right Maid for Your Family', 'h1')}
      ${tx('Perkhidmatan pengambilan pembantu rumah Indonesia dan Filipina yang profesional, disesuaikan dengan keperluan isi rumah anda.', 'Professional Indonesian and Filipino maid recruitment services tailored to your household needs.', 'p', 'class="lead"')}
      <div class="hero__cta">
        ${waBtn('consult', 'Dapatkan Konsultasi Percuma', 'Get Free Consultation', 'btn--navy')}
        ${waBtn('general', `WhatsApp ${N}`, `WhatsApp ${N}`)}
      </div>
      <p class="hero__licence">${tx('Agensi Pekerjaan Final Choice Sdn. Bhd.', 'Agensi Pekerjaan Final Choice Sdn. Bhd.', 'strong')} \u00b7 ${tx('Lesen JTKSM 483 (Kategori C)', 'JTKSM Licence 483 (Category C)')}</p>
    </div>
    <div class="hero__media">
      <img src="../assets/img/training-group-800.webp" srcset="../assets/img/training-group-480.webp 480w, ../assets/img/training-group-800.webp 800w, ../assets/img/training-group-1080.webp 1080w" sizes="(min-width:900px) 520px, 92vw" width="800" height="600" fetchpriority="high" ${at('alt', 'Pasukan Final Choice bersama pembantu rumah dalam sesi latihan di pejabat', 'The Final Choice team with maids during a training session at the office')}>
    </div>
  </div>
</section>

<section id="services" class="alt">
  <div class="container">
    <div class="sec-head">${tx('Perkhidmatan Kami', 'Our Services', 'span', 'class="eyebrow"')}
      ${tx('Perkhidmatan Pembantu Rumah Kami', 'Our Maid Services', 'h2')}
      ${tx('Pilih bantuan yang paling sesuai dengan keperluan keluarga anda.', 'Choose the help that best fits your family\u2019s needs.', 'p')}</div>
    <div class="grid grid--3">${svcCards}</div>
  </div>
</section>

<section id="choose">
  <div class="container">
    <div class="sec-head">${tx('Warganegara', 'Nationality', 'span', 'class="eyebrow"')}
      ${tx('Pilih Pembantu Rumah Anda', 'Choose Your Maid', 'h2')}
      ${tx('Kami menyediakan pembantu rumah Indonesia dan Filipina.', 'We offer Indonesian and Filipino maids.', 'p')}</div>
    <div class="nat">
      ${natCard('indonesian', ['Pembantu Rumah Indonesia', 'Indonesian Maid'], natPhotos('indonesian'))}
      ${natCard('filipino', ['Pembantu Rumah Filipina', 'Filipino Maid'], natPhotos('filipino'))}
    </div>
  </div>
</section>

<section id="maids" class="alt">
  <div class="container">
    <div class="sec-head">${tx('Pratonton Profil', 'Profile Preview', 'span', 'class="eyebrow"')}
      ${tx('Pembantu Rumah Pilihan', 'Maid Preview', 'h2')}
      ${tx('Sebahagian profil yang diluluskan untuk paparan. Minta biodata penuh melalui WhatsApp.', 'A selection of profiles approved for display. Request the full biodata on WhatsApp.', 'p')}</div>
    <div class="maids">${maidCards}</div>
    ${tx('Status dan ketersediaan setiap calon perlu disahkan oleh perunding kami sebelum anda membuat keputusan.', 'Each candidate\u2019s status and availability must be confirmed by our consultant before you decide.', 'p', 'class="note"')}
  </div>
</section>

<section id="packages">
  <div class="container">
    <div class="sec-head">${tx('Pakej', 'Packages', 'span', 'class="eyebrow"')}
      ${tx('Pakej Pembantu Rumah', 'Maid Packages', 'h2')}
      ${tx(`Lihat ciri dan perkhidmatan pakej mengikut warganegara. Hubungi ${N} untuk maklumat pakej dan sebut harga terkini.`, `See each package\u2019s features and services by nationality. Contact ${N} for package details and a current quotation.`, 'p')}</div>
    <div class="tabs" role="tablist" ${at('aria-label', 'Jenis pakej', 'Package type')}>${tabsHtml}</div>
    ${panels}
    ${tx('Waranti, penggantian dan yuran tertakluk kepada terma perjanjian perkhidmatan anda.', 'Warranty, replacement and fees are subject to the terms of your service agreement.', 'p', 'class="note"')}
  </div>
</section>

<section id="why" class="alt">
  <div class="container">
    <div class="sec-head">${tx('Kenapa Kami', 'Why Us', 'span', 'class="eyebrow"')}
      ${tx('Kenapa Pilih Final Choice?', 'Why Choose Final Choice?', 'h2')}</div>
    ${exp}
    <div class="why">${why}</div>
  </div>
</section>

${reviewsSection}
<section id="process">
  <div class="container">
    <div class="sec-head">${tx('Proses', 'Process', 'span', 'class="eyebrow"')}
      ${tx('Proses Permohonan Lima Langkah', 'Simple Five-Step Application Process', 'h2')}</div>
    <ol class="steps" style="list-style:none;margin:0;padding:0">${steps}</ol>
  </div>
</section>

<section id="faq" class="alt">
  <div class="container">
    <div class="sec-head">${tx('Soalan Lazim', 'FAQ', 'span', 'class="eyebrow"')}
      ${tx('Soalan Lazim', 'Frequently Asked Questions', 'h2')}</div>
    <div class="faq">${faqs}</div>
  </div>
</section>

<section class="cta" id="contact">
  <div class="container">
    ${tx('Kami Sedia Membantu Anda Mencari Pembantu Rumah yang Sesuai', 'Let Us Help You Find the Right Maid', 'h2')}
    ${tx(`Konsultan Jualan Anda: ${N}`, `Your Sales Consultant: ${N}`, 'p', 'class="cta__who"')}
    ${tx(`Hubungi ${N} hari ini melalui WhatsApp.`, `Contact ${N} today on WhatsApp.`, 'p')}
    <div class="cta__btns">
      ${waBtn('general', `WhatsApp ${N}`, `WhatsApp ${N}`)}
      ${waBtn('general', 'Minta Biodata', 'Request Biodata', 'btn--light')}
      ${waBtn('consult', 'Konsultasi Percuma', 'Free Consultation', 'btn--ghost')}
    </div>
  </div>
</section>
</main>

<footer>
  <div class="container">
    <div class="foot">
      <div>
        <div class="foot__logo"><img src="../assets/img/logo-160.webp" width="80" height="60" alt="Final Choice" loading="lazy"></div>
        <p><strong style="color:#fff">${esc(company.legalName)}</strong></p>
        <p>${tx('No. Syarikat', 'Company No.')}: ${esc(company.registrationNo)}</p>
        <p>${tx('Lesen', 'Licence')}: JTKSM 483 ${tx('(Kategori C)', '(Category C)')}</p>
      </div>
      <div><h3>${tx('Pejabat', 'Office')}</h3>
        <ul><li>${ico('pin')}<span><a href="${esc(company.mapsUrl)}" target="_blank" rel="noopener">${esc(company.address)}</a></span></li></ul></div>
      <div><h3>${tx('Waktu Perniagaan', 'Business Hours')}</h3><ul>${hours}</ul></div>
      <div><h3>${tx('Hubungi Kami', 'Contact Us')}</h3>
        <ul>
          <li>${ico('phone')}<span>${tx(`${N} (Konsultan Jualan)`, `${N} (Sales Consultant)`)}: <a href="tel:${tel}" data-track="call">${esc(cfg.phoneDisplay)}</a></span></li>
          <li>${ico('wa')}<a ${wa('general')}>${tx(`WhatsApp ${N}`, `WhatsApp ${N}`)}</a></li>
          <li>${ico('mail')}<a href="mailto:${esc(company.email)}">${esc(company.email)}</a></li>
        </ul></div>
    </div>
    <div class="legal">
      <p>${tx('Notis privasi: Kami menggunakan maklumat yang anda kongsi hanya untuk menjawab pertanyaan anda dan memproses permohonan anda.', 'Privacy notice: We use the information you share only to respond to your enquiry and to process your application.')}</p>
      <p>\u00a9 <span id="yr">2026</span> ${esc(company.legalName)}. ${tx('Hak cipta terpelihara.', 'All rights reserved.')}</p>
    </div>
  </div>
</footer>

<a class="wa-float" ${wa('general')}>${ico('wa')}<span class="wa-float__t">${tx(`WhatsApp ${N}`, `WhatsApp ${N}`)}</span></a>

<script>window.LP=${JSON.stringify(LP).replace(/</g, '\\u003c')};</script>
<script>${js}</script>
</body>
</html>
`;
}

// ---------------- build ----------------
const cfgs = ['sales-1', 'sales-2'].map((id) => json(`configs/${id}.json`));
// Numbers that were entered by mistake and must never be built into a page again.
const BLOCKED_NUMBERS = ['601433131112'];
for (const c of cfgs) {
  if (BLOCKED_NUMBERS.includes(c.whatsapp)) throw new Error(`${c.id}: ${c.whatsapp} is a known-incorrect number (typo) and is blocked.`);
  if (!/^60\d{8,10}$/.test(c.whatsapp)) throw new Error(`${c.id}: whatsapp must be digits in international format, e.g. 60123456789`);
}
if (cfgs.some((c) => !c.consultant)) throw new Error('Each config needs a consultant name.');
if (cfgs[0].whatsapp === cfgs[1].whatsapp) throw new Error('Both landing pages use the same WhatsApp number. Each rep must have their own.');
const unverified = maidData.maids.filter((m) => !m.consent || !m.consent.verified).map((m) => m.name);
if (release && unverified.length) throw new Error(`Release build blocked: publication/photo consent not confirmed for: ${unverified.join(', ')}. Move them out of content/maids.json.`);
if (release && cfgs.some((c) => c.placeholderNumber)) {
  throw new Error('Release build blocked: placeholderNumber is still true in a config. Enter the real numbers and set placeholderNumber to false.');
}
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
fs.cpSync(path.join(root, 'assets'), path.join(dist, 'assets'), { recursive: true });
if (pendingMaids.length) fs.cpSync(path.join(root, 'private/assets/maids'), path.join(dist, 'assets/maids'), { recursive: true });
if (withPending && fs.existsSync(path.join(root, 'private/assets/img'))) fs.cpSync(path.join(root, 'private/assets/img'), path.join(dist, 'assets/img'), { recursive: true, filter: (src) => !fs.statSync(src).isFile() || path.basename(src).startsWith('service-') });
for (const c of cfgs) {
  fs.mkdirSync(path.join(dist, c.id), { recursive: true });
  fs.writeFileSync(path.join(dist, c.id, 'index.html'), render(c));
  console.log(`built ${c.id}  ->  wa.me/${c.whatsapp}  campaign=${c.campaign}`);
}
fs.writeFileSync(path.join(dist, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
fs.writeFileSync(path.join(dist, 'index.html'),
  '<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>Preview</title>' +
  '<p style="font:16px system-ui;padding:24px">Preview index (internal): <a href="sales-1/">sales-1</a> \u00b7 <a href="sales-2/">sales-2</a></p>');
fs.writeFileSync(path.join(dist, '.nojekyll'), '');

const expNumericFinal = !!(company.experience && company.experience.display) && (company.experience.confirmed || !release);
fs.writeFileSync(path.join(root, 'build-info.json'), JSON.stringify({
  mode: release ? 'release' : 'preview', withPending, names: maidData.maids.map((m) => m.name),
  servicePhotos, servicePhotosPending: servicePhotos.filter((k) => svcSrc(k) === 'pending'),
  reviewsRendered: showReviews, reviewsMode, reviewsFixture, reviewCount: shownReviews.length, ratingShown: showReviews && ratingOk,
  experienceClaim: expNumericFinal ? 'numeric-15+' : 'non-numeric', experienceConfirmed: !!(company.experience && company.experience.confirmed),
  unverifiedMaids: unverified
}, null, 1));
console.log(`service photos=${servicePhotos.length ? servicePhotos.map((k) => k + (svcSrc(k) === 'pending' ? ' (PENDING APPROVAL, preview only)' : '')).join(', ') : 'none (icon panels)'}`);
console.log(`reviews=${reviewsMode === 'cards' ? shownReviews.length + (reviewsFixture ? ' SAMPLE (preview only)' : '') + ' cards' : reviewsMode === 'rating-only' ? 'rating snapshot only (no review text)' : 'section hidden'}`);
console.log(`mode=${release ? 'release' : 'preview'}  maids=${maidData.maids.length}  experience=${expNumericFinal ? 'numeric 15+ (preview only)' : 'non-numeric'}${unverified.length ? '  UNVERIFIED shown (preview): ' + unverified.join(', ') : ''}`);
