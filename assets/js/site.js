/* Yubo Kou — small interactions: quest log, start-menu keys, publication filters, and a secret. */
(function () {
  'use strict';

  // Quest log: one panel at a time; arrow keys move through the list.
  var quests = document.querySelector('[data-quests]');
  if (quests) {
    var qbtns = Array.prototype.slice.call(quests.querySelectorAll('.qbtn'));
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

  // Start menus: arrow keys move the cursor; Enter follows the link.
  Array.prototype.forEach.call(document.querySelectorAll('[data-menu]'), function (menu) {
    var links = Array.prototype.slice.call(menu.querySelectorAll('a'));
    var mark = function (a) { links.forEach(function (l) { l.classList.toggle('on', l === a); }); };
    links.forEach(function (a, i) {
      a.addEventListener('mouseenter', function () { mark(a); });
      a.addEventListener('focus', function () { mark(a); });
      a.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        e.preventDefault();
        links[(i + (e.key === 'ArrowDown' ? 1 : links.length - 1)) % links.length].focus();
      });
    });
  });

  // Publication filters.
  var filters = document.querySelector('[data-filters]');
  if (filters) {
    var fbtns = Array.prototype.slice.call(filters.querySelectorAll('button'));
    fbtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var f = btn.getAttribute('data-filter');
        fbtns.forEach(function (b) {
          b.classList.toggle('on', b === btn);
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        Array.prototype.forEach.call(document.querySelectorAll('[data-year-group]'), function (g) {
          var any = false;
          Array.prototype.forEach.call(g.querySelectorAll('.pub'), function (p) {
            var show = f === 'all' || (f === 'award' ? p.hasAttribute('data-award') : p.getAttribute('data-type') === f);
            p.hidden = !show;
            if (show) any = true;
          });
          g.hidden = !any;
        });
      });
    });
  }

  // Secret: up up down down left right left right B A toggles 8-bit mode.
  var code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  var pos = 0;
  var toast = document.querySelector('.retro-toast');
  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    pos = k === code[pos] ? pos + 1 : (k === code[0] ? 1 : 0);
    if (pos < code.length) return;
    pos = 0;
    var on = document.documentElement.classList.toggle('retro');
    try { sessionStorage.setItem('yk-retro', on ? '1' : '0'); } catch (err) {}
    if (toast) {
      toast.textContent = on ? '8-BIT MODE ON · enter the code again to exit' : '8-BIT MODE OFF';
      toast.classList.add('show');
      setTimeout(function () { toast.classList.remove('show'); }, 2600);
    }
  });
})();
