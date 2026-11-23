(function () {
  'use strict';
  var LP = window.LP;
  var doc = document;
  var lang = 'ms';
  var ATTRS = ['aria-label', 'alt', 'title', 'content'];
  var ms = new WeakMap();

  function safeGet(s, k) { try { return s.getItem(k); } catch (e) { return null; } }
  function safeSet(s, k, v) { try { s.setItem(k, v); } catch (e) {} }

  /* ---------- campaign / UTM ---------- */
  var utm = {};
  try {
    var q = new URLSearchParams(location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].forEach(function (k) {
      if (q.get(k)) utm[k] = q.get(k).slice(0, 40);
    });
    if (Object.keys(utm).length) safeSet(sessionStorage, 'lp_utm', JSON.stringify(utm));
    else { var st = safeGet(sessionStorage, 'lp_utm'); if (st) utm = JSON.parse(st) || {}; }
  } catch (e) {}

  function refTag() {
    var r = LP.campaign;
    if (utm.utm_source) r += '/' + utm.utm_source;
    return r;
  }

  /* ---------- WhatsApp links ---------- */
  function message(key, vars) {
    vars = vars || {};
    var tpl = (LP.messages[key] || LP.messages.general)[lang];
    var t = tpl.replace(/\{(\w+)\}/g, function (_, n) { return (vars && vars[n]) || ''; });
    return t + ' (Ref: ' + refTag() + ')';
  }
  function updateWa() {
    doc.querySelectorAll('[data-wa]').forEach(function (a) {
      var vars = { name: LP.consultant };
      if (a.dataset.code) vars.code = a.dataset.code;
      if (a.dataset.maid) vars.maid = a.dataset.maid;
      if (a.dataset.pkg) vars.pkg = a.dataset.pkg;
      if (a.dataset.catMs) vars.cat = lang === 'en' ? a.dataset.catEn : a.dataset.catMs;
      a.href = 'https://wa.me/' + LP.whatsapp + '?text=' + encodeURIComponent(message(a.dataset.wa, vars));
    });
  }

  /* ---------- language ---------- */
  function applyLang(l, persist) {
    lang = l;
    doc.documentElement.lang = l === 'ms' ? 'ms' : 'en';
    doc.querySelectorAll('[data-i18n]').forEach(function (el) {
      if (!ms.has(el)) ms.set(el, el.textContent);
      var id = el.getAttribute('data-i18n');
      el.textContent = l === 'ms' ? ms.get(el) : (LP.en[id] != null ? LP.en[id] : ms.get(el));
    });
    ATTRS.forEach(function (a) {
      doc.querySelectorAll('[data-i18n-' + a + ']').forEach(function (el) {
        var store = ms.get(el) || {};
        if (store[a] == null) { store[a] = el.getAttribute(a); ms.set(el, store); }
        var id = el.getAttribute('data-i18n-' + a);
        el.setAttribute(a, l === 'ms' ? store[a] : (LP.en[id] != null ? LP.en[id] : store[a]));
      });
    });
    doc.querySelectorAll('.lang button').forEach(function (b) {
      b.setAttribute('aria-pressed', b.dataset.lang === l ? 'true' : 'false');
    });
    doc.title = LP.titles[l];
    updateWa();
    if (persist) safeSet(localStorage, 'lp_lang', l);
  }
  doc.querySelectorAll('.lang button').forEach(function (b) {
    b.addEventListener('click', function () { applyLang(b.dataset.lang, true); });
  });

  /* ---------- package tabs ---------- */
  var tabs = doc.querySelectorAll('[role="tab"]');
  function selectTab(t) {
    tabs.forEach(function (x) {
      var on = x === t;
      x.setAttribute('aria-selected', on ? 'true' : 'false');
      x.tabIndex = on ? 0 : -1;
      doc.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t); });
    t.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (n) { e.preventDefault(); selectTab(n); n.focus(); }
    });
  });

  /* ---------- google reviews carousel ---------- */
  var rt = doc.querySelector('.rev__track');
  if (rt) {
    var rp = doc.querySelector('.rev__nav--prev'), rn = doc.querySelector('.rev__nav--next');
    var rstep = function () { var c = rt.querySelector('.rev__card'); return c ? c.getBoundingClientRect().width + 16 : rt.clientWidth; };
    var rsync = function () {
      var max = rt.scrollWidth - rt.clientWidth - 2;
      rp.setAttribute('aria-disabled', rt.scrollLeft <= 2 ? 'true' : 'false');
      rn.setAttribute('aria-disabled', rt.scrollLeft >= max ? 'true' : 'false');
    };
    rp.addEventListener('click', function () { rt.scrollBy({ left: -rstep(), behavior: 'smooth' }); });
    rn.addEventListener('click', function () { rt.scrollBy({ left: rstep(), behavior: 'smooth' }); });
    rt.addEventListener('scroll', function () { window.requestAnimationFrame(rsync); }, { passive: true });
    rt.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); rn.click(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); rp.click(); }
    });
    window.addEventListener('resize', rsync); rsync();
  }

  /* ---------- mobile menu ---------- */
  var mb = doc.getElementById('menu-btn'), mn = doc.getElementById('mnav');
  if (mb && mn) {
    mb.addEventListener('click', function () {
      var open = mn.classList.toggle('open');
      mb.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mn.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { mn.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* ---------- analytics hook (disabled unless approved in config) ---------- */
  doc.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-wa],[data-track]');
    if (!a || !LP.analytics.enabled) return;
    var detail = { event: 'lp_click', landing_page: LP.id, campaign: LP.campaign, target: a.dataset.wa || a.dataset.track };
    // Future: forward `detail` to the approved analytics provider here.
    if (window.dataLayer) window.dataLayer.push(detail);
  });

  /* ---------- reveal on scroll ---------- */
  doc.documentElement.classList.remove('no-js');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    doc.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });
  } else {
    doc.querySelectorAll('.rv').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- init ---------- */
  var start = 'ms';
  try {
    var ql = new URLSearchParams(location.search).get('lang');
    var saved = safeGet(localStorage, 'lp_lang');
    if (ql === 'en' || ql === 'ms') start = ql; else if (saved === 'en' || saved === 'ms') start = saved;
  } catch (e) {}
  applyLang(start, false);
})();
