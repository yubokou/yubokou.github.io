/* Yubo Kou — game-style interactions: quest log, start menus, minimap, hotkeys,
   stage cards, controls screen, an achievement, publication filters, and a secret. */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var store = {
    get: function (s, k) { try { return window[s].getItem(k); } catch (e) { return null; } },
    set: function (s, k, v) { try { window[s].setItem(k, v); } catch (e) {} }
  };

  // Toast (bottom of screen).
  var toastEl = $('.retro-toast');
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 3200);
  }

  // Stage card ("NOW ENTERING …") shown when jumping between sections.
  var card = $('.stage-card');
  var cardTimer;
  function stageCard(name) {
    if (!card || reduced) return;
    $('[data-stage-name]', card).textContent = name;
    card.classList.add('show');
    clearTimeout(cardTimer);
    cardTimer = setTimeout(function () { card.classList.remove('show'); }, 750);
  }

  // Sections on this page.
  var stages = $$('[data-stage]');
  var byId = {};
  stages.forEach(function (s) { byId[s.id] = s; });

  function jumpTo(id, fromKey) {
    var sec = byId[id];
    if (!sec) { window.location.href = document.body.getAttribute('data-home') + '#' + id; return; }
    stageCard(sec.getAttribute('data-stage'));
    sec.setAttribute('tabindex', '-1');
    sec.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    sec.focus({ preventScroll: true });
    if (history.replaceState) history.replaceState(null, '', '#' + id);
  }

  // Minimap: highlights the section you are in and marks visited ones.
  var map = $('[data-minimap]');
  var rooms = map ? $$('.room', map) : [];
  var curLabel = map ? $('[data-mm-cur]', map) : null;
  var seen = {};
  var completed = store.get('sessionStorage', 'yk-complete') === '1';
  function currentStage() {
    var line = window.innerHeight * 0.4, cur = stages[0];
    stages.forEach(function (s) { if (s.getBoundingClientRect().top <= line) cur = s; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = stages[stages.length - 1];
    return cur;
  }
  function updateMap() {
    if (!stages.length) return;
    var cur = currentStage();
    seen[cur.id] = true;
    rooms.forEach(function (r) {
      var id = r.getAttribute('data-room');
      r.classList.toggle('here', id === cur.id);
      r.classList.toggle('seen', !!seen[id]);
      if (id === cur.id) r.setAttribute('aria-current', 'location'); else r.removeAttribute('aria-current');
    });
    if (curLabel) curLabel.textContent = cur.getAttribute('data-stage').toUpperCase();
    $$('.nav a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var target = href.indexOf('#') > -1 ? href.split('#')[1] : (a.getAttribute('aria-current') === 'page' ? 'start' : '');
      var here = target === cur.id || (target === 'start' && cur.id === 'about');
      a.classList.toggle('here', here);
    });
    if (!completed && stages.every(function (s) { return seen[s.id]; })) {
      completed = true;
      store.set('sessionStorage', 'yk-complete', '1');
      toast('★ ACHIEVEMENT UNLOCKED · Completionist: you explored every section');
    }
  }
  if (map && stages.length) {
    document.documentElement.classList.add('has-spy');
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; updateMap(); });
    }, { passive: true });
    window.addEventListener('resize', updateMap);
    updateMap();
    rooms.forEach(function (r) {
      r.addEventListener('click', function (e) { e.preventDefault(); jumpTo(r.getAttribute('data-room')); });
    });
  }

  // Mobile menu.
  var toggleBtn = $('[data-menu-toggle]');
  var siteNav = $('#site-nav');
  function setMenu(open) {
    if (!toggleBtn || !siteNav) return;
    siteNav.classList.toggle('open', open);
    toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (toggleBtn && siteNav) {
    toggleBtn.addEventListener('click', function () { setMenu(!siteNav.classList.contains('open')); });
    $$('a', siteNav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && siteNav.classList.contains('open')) { setMenu(false); toggleBtn.focus(); } });
  }

  // Back-to-top button (publications page).
  var topBtn = $('[data-to-top]');
  if (topBtn) {
    var paintTop = function () { topBtn.classList.toggle('show', window.scrollY > window.innerHeight); };
    window.addEventListener('scroll', paintTop, { passive: true });
    paintTop();
    topBtn.addEventListener('click', function (e) { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); });
  }

  // Dialog box: the blinking arrow shows the next line, then loops.
  var dialog = $('[data-dialog]');
  var nextBtn = $('[data-dialog-next]');
  if (dialog && nextBtn) {
    var lines = $$('p', dialog), at = 0;
    nextBtn.addEventListener('click', function () {
      lines[at].hidden = true;
      at = (at + 1) % lines.length;
      lines[at].hidden = false;
      nextBtn.setAttribute('aria-label', at === lines.length - 1 ? 'Back to the first line' : 'Next line');
    });
  }

  // Quest log: one panel at a time; arrow keys move through the list.
  var quests = $('[data-quests]');
  if (quests) {
    var qbtns = $$('.qbtn', quests);
    var select = function (btn) {
      qbtns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        var panel = document.getElementById(b.getAttribute('aria-controls'));
        if (panel) panel.classList.toggle('on', on);
      });
    };
    qbtns.forEach(function (b, i) {
      b.addEventListener('click', function () { select(b); });
      b.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        e.preventDefault();
        var next = qbtns[(i + (e.key === 'ArrowDown' ? 1 : qbtns.length - 1)) % qbtns.length];
        next.focus();
        select(next);
      });
    });
  }

  // Start menus: arrow keys move the cursor; in-page links show a stage card.
  $$('[data-menu]').forEach(function (menu) {
    var links = $$('a', menu);
    var mark = function (a) { links.forEach(function (l) { l.classList.toggle('on', l === a); }); };
    links.forEach(function (a, i) {
      a.addEventListener('mouseenter', function () { mark(a); });
      a.addEventListener('focus', function () { mark(a); });
      a.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        e.preventDefault();
        links[(i + (e.key === 'ArrowDown' ? 1 : links.length - 1)) % links.length].focus();
      });
      var href = a.getAttribute('href') || '';
      if (href.charAt(0) === '#' && byId[href.slice(1)]) {
        a.addEventListener('click', function (e) { e.preventDefault(); jumpTo(href.slice(1)); });
      }
    });
  });

  // Controls screen.
  var controls = $('[data-controls]');
  var keysOn = store.get('localStorage', 'yk-keys') !== 'off';
  var toggle = $('[data-shortcuts-toggle]');
  function paintToggle() {
    if (!toggle) return;
    toggle.setAttribute('aria-pressed', keysOn ? 'true' : 'false');
    toggle.lastChild.textContent = 'Keyboard shortcuts: ' + (keysOn ? 'ON' : 'OFF');
  }
  paintToggle();
  function openControls() {
    if (!controls) return;
    if (controls.showModal) { if (!controls.open) controls.showModal(); } else controls.setAttribute('open', '');
  }
  function closeControls() {
    if (!controls) return;
    if (controls.close) controls.close(); else controls.removeAttribute('open');
  }
  $$('[data-controls-open]').forEach(function (b) { b.addEventListener('click', openControls); });
  $$('[data-controls-close]').forEach(function (b) { b.addEventListener('click', closeControls); });
  if (toggle) toggle.addEventListener('click', function () {
    keysOn = !keysOn;
    store.set('localStorage', 'yk-keys', keysOn ? 'on' : 'off');
    paintToggle();
  });

  // Publication filters.
  var filters = $('[data-filters]');
  if (filters) {
    var fbtns = $$('button', filters);
    fbtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var f = btn.getAttribute('data-filter');
        fbtns.forEach(function (b) {
          b.classList.toggle('on', b === btn);
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        $$('[data-year-group]').forEach(function (g) {
          var any = false;
          $$('.pub', g).forEach(function (p) {
            var show = f === 'all' || (f === 'award' ? p.hasAttribute('data-award') : p.getAttribute('data-type') === f);
            p.hidden = !show;
            if (show) any = true;
          });
          g.hidden = !any;
        });
      });
    });
  }

  // Keyboard: hotkeys (can be turned off on the controls screen) and the secret code.
  var hotkeys = {};
  stages.forEach(function (s) { var k = s.getAttribute('data-key'); if (k) hotkeys[k] = s.id; });
  var fallback = { '1': 'research', '2': 'publications', '3': 'students', '4': 'teaching', '5': 'contact' };
  var code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  var pos = 0;
  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;

    // Secret code (always on).
    pos = k === code[pos] ? pos + 1 : (k === code[0] ? 1 : 0);
    if (pos === code.length) {
      pos = 0;
      var on = document.documentElement.classList.toggle('retro');
      store.set('sessionStorage', 'yk-retro', on ? '1' : '0');
      toast(on ? '8-BIT MODE ON · enter the code again to exit' : '8-BIT MODE OFF');
      return;
    }

    if (controls && controls.open) return;
    if (k === '?') { e.preventDefault(); openControls(); return; }
    if (!keysOn) return;
    if (/^[1-5]$/.test(k)) { e.preventDefault(); jumpTo(hotkeys[k] || fallback[k]); return; }
    if (k === '0') { e.preventDefault(); jumpTo('start'); return; }
    if (k === 'p') { window.location.href = document.body.getAttribute('data-pubs'); return; }
    if (k === 'm' && map) { map.classList.toggle('off'); return; }
  });
})();
