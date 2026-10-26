(function () {
  if (window.__calm) return;
  window.__calm = true;

  var WAIT = 5 * 60 * 1000; // 1 post toutes les 5 min
  var K = 'calm_state';
  var R = document.documentElement;

  var st = document.createElement('style');
  st.textContent =
    'html:not(.calm-direct) a[href*="/reels"]{display:none!important}' +
    'html.calm-lock,html.calm-lock body{overflow:hidden!important;overscroll-behavior:none!important}' +
    '#calm-bar{position:fixed;left:0;right:0;top:0;z-index:99999;padding:8px;text-align:center;background:#111;color:#fff;font:14px sans-serif}' +
    '#calm-back{position:fixed;left:12px;top:12px;z-index:99999;padding:10px 14px;border-radius:20px;border:0;background:#111;color:#fff;font:14px sans-serif}';
  (document.head || R).appendChild(st);

  function load() { try { return JSON.parse(localStorage.getItem(K)) || { seen: [] }; } catch (e) { return { seen: [] }; } }
  function save(s) { try { localStorage.setItem(K, JSON.stringify(s)); } catch (e) {} }
  function fd(v) {
    try {
      if (v === undefined) return sessionStorage.getItem('calm_fd') === '1';
      sessionStorage.setItem('calm_fd', v ? '1' : '0');
    } catch (e) { return false; }
  }

  var locked = false;
  ['touchmove', 'wheel'].forEach(function (t) {
    addEventListener(t, function (e) { if (locked) e.preventDefault(); }, { passive: false, capture: true });
  });

  function bar(txt) {
    var b = document.getElementById('calm-bar');
    if (txt === null) { if (b) b.remove(); return; }
    if (!b) { b = document.createElement('div'); b.id = 'calm-bar'; (document.body || R).appendChild(b); }
    if (b.textContent !== txt) b.textContent = txt;
  }

  function back(on) {
    var b = document.getElementById('calm-back');
    if (!on) { if (b) b.remove(); return; }
    if (!b) {
      b = document.createElement('button');
      b.id = 'calm-back';
      b.textContent = '\u2190 Messages';
      b.onclick = function () { history.back(); };
      (document.body || R).appendChild(b);
    }
  }

  function pid(a) {
    var l = a.querySelector('a[href*="/p/"],a[href*="/reel/"]');
    return l ? l.getAttribute('href') : (a.innerText || '').slice(0, 60);
  }

  function feed() {
    var arts = Array.prototype.slice.call(document.querySelectorAll('article'));
    if (!arts.length) return;
    var s = load(), now = Date.now();
    if (!s.cur || now - s.at >= WAIT) {
      var nxt = arts.filter(function (a) { return s.seen.indexOf(pid(a)) < 0 && pid(a) !== s.cur; })[0];
      if (nxt) {
        if (s.cur) s.seen.push(s.cur);
        s.cur = pid(nxt); s.at = now; s.seen = s.seen.slice(-300);
        save(s);
      }
    }
    arts.forEach(function (a) { a.style.display = pid(a) === s.cur ? '' : 'none'; });
    var left = Math.max(0, WAIT - (now - (s.at || now)));
    var m = Math.floor(left / 60000), sec = Math.floor((left % 60000) / 1000);
    bar(left > 0 ? 'Prochain post dans ' + m + ':' + (sec < 10 ? '0' : '') + sec : 'Pas de nouveau post charg\u00e9');
  }

  function tick() {
    var p = location.pathname;
    var reel = /^\/reels?\/[^/]+/.test(p), rfeed = /^\/reels\/?$/.test(p);
    var direct = p.indexOf('/direct') === 0;
    if (direct) fd(1); else if (!reel) fd(0);
    R.classList.toggle('calm-direct', direct);

    if (rfeed || (reel && !fd())) { location.replace('/'); return; }
    if (p.indexOf('/explore') === 0 && p.indexOf('/explore/search') !== 0) {
      location.replace('/explore/search/'); return;
    }
    locked = reel;
    R.classList.toggle('calm-lock', reel);
    back(reel);
    if (p === '/') feed(); else bar(null);
  }

  var q = false;
  new MutationObserver(function () {
    if (!q) { q = true; requestAnimationFrame(function () { q = false; tick(); }); }
  }).observe(R, { childList: true, subtree: true });
  setInterval(tick, 1000);
  tick();
})();
