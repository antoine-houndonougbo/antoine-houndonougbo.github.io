/* ============================================================
   script.js · Portfolio Antoine HOUNDONOUGBO
   1. Bascule de langue FR/EN (memoire du choix)
   2. Compteurs animes (valeurs reelles deja dans le HTML)
   3. Coffre des projets a acces par code (chiffrement AES-GCM)
   4. Filtres de la galerie & visionneuse de photos
   5. Emplacement photo personnalisable (en-action.html)
   ============================================================ */

/* ---- 1. Langue ---- */
(function () {
  var html = document.documentElement;
  var btn = document.getElementById('langBtn');
  if (!btn) return;
  function apply(lang) {
    html.setAttribute('lang', lang);
    btn.textContent = (lang === 'fr') ? 'EN' : 'FR';
    var t = document.querySelectorAll('title[data-fr]');
    if (t.length) {
      t[0].textContent = (lang === 'fr') ? t[0].getAttribute('data-fr') : t[0].getAttribute('data-en');
    }
    try { localStorage.setItem('site-lang', lang); } catch (e) {}
  }
  var saved = 'fr';
  try { saved = localStorage.getItem('site-lang') || 'fr'; } catch (e) {}
  apply(saved);
  btn.addEventListener('click', function () {
    apply(html.getAttribute('lang') === 'fr' ? 'en' : 'fr');
  });
})();

/* ---- 2. Compteurs animes ---- */
(function () {
  var stats = document.querySelector('.stats');
  if (!stats) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1100, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString(
        document.documentElement.lang === 'fr' ? 'fr-FR' : 'en-US') + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.querySelectorAll('[data-count]').forEach(function (el) {
          if (!el.dataset.done) { el.dataset.done = '1'; animateCount(el); }
        });
        io.unobserve(e.target);
      }
    });
  }, { threshold: .3 });
  io.observe(stats);
})();

/* ---- 3. Coffre des projets (AES-GCM 256 · PBKDF2-SHA256 150k) ---- */
(function () {
  var btn = document.getElementById('vaultUnlock');
  if (!btn || typeof VAULT_PAYLOAD === 'undefined') return;
  var input = document.getElementById('vaultCode');
  var err = document.getElementById('vaultErr');
  var ok = document.getElementById('vaultOk');
  var results = document.getElementById('vaultResults');

  async function decrypt(payloadB64, code) {
    var raw = Uint8Array.from(atob(payloadB64), function (c) { return c.charCodeAt(0); });
    var salt = raw.slice(0, 16), iv = raw.slice(16, 28), ct = raw.slice(28);
    var km = await crypto.subtle.importKey('raw', new TextEncoder().encode(code), 'PBKDF2', false, ['deriveKey']);
    var key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: salt, iterations: 150000, hash: 'SHA-256' },
      km, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    var pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, ct);
    return JSON.parse(new TextDecoder().decode(pt));
  }

  function cleanText(s) {
    if (!s) return '';
    return String(s).replace(/\s*[\u2014\u2013]\s*/g, ' : ');
  }

  function render(data) {
    ok.style.display = 'block';
    results.innerHTML = '';
    data.projets.forEach(function (p) {
      var d = document.createElement('div');
      d.className = 'vproj';
      var h = document.createElement('h4'); h.textContent = cleanText(p.titre); d.appendChild(h);
      var tg = document.createElement('span'); tg.className = 'tag tag-status'; tg.textContent = cleanText(p.statut); d.appendChild(tg);
      var par = document.createElement('p'); par.textContent = cleanText(p.resume); d.appendChild(par);
      var sk = document.createElement('div'); sk.className = 'skills'; sk.textContent = 'Competences : ' + cleanText(p.competences); d.appendChild(sk);
      results.appendChild(d);
    });
    input.value = '';
  }

  btn.addEventListener('click', async function () {
    var code = input.value;
    if (!code) return;
    try {
      render(await decrypt(VAULT_PAYLOAD, code));
      err.style.display = 'none';
    } catch (e) {
      err.style.display = 'block';
      ok.style.display = 'none';
    }
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') btn.click();
  });
})();

/* ---- 4. Annee du pied de page ---- */
(function () {
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();

/* ---- 5. Filtres de la galerie ---- */
(function () {
  var bar = document.querySelector('.gbar');
  if (!bar) return;
  var btns = bar.querySelectorAll('.gfilter');
  var figs = document.querySelectorAll('.gfig');
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      var cat = b.getAttribute('data-cat');
      btns.forEach(function (x) { x.classList.toggle('active', x === b); });
      figs.forEach(function (f) {
        f.classList.toggle('hidden', cat !== 'tous' && f.getAttribute('data-cat') !== cat);
      });
    });
  });
})();

/* ---- 6. Lightbox de la page « En action » ---- */
(function () {
  var dataEl = document.getElementById('actPhotos');
  if (!dataEl) return;
  var DATA;
  try { DATA = JSON.parse(dataEl.textContent); } catch (e) { return; }
  var FIGS = Array.prototype.slice.call(document.querySelectorAll('.photo'));
  var SRCS = FIGS.map(function (f) { return f.getAttribute('data-full'); });
  var lb = document.getElementById('lb');
  var img = document.getElementById('lbImg');
  var cap = document.getElementById('lbCap');
  var x = document.getElementById('lbX');
  var idx = 0;
  function lang() { return document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'fr'; }
  function show(i) {
    idx = (i + DATA.length) % DATA.length;
    img.src = SRCS[idx] || DATA[idx].src;
    img.alt = DATA[idx][lang()];
    cap.textContent = DATA[idx][lang()];
  }
  FIGS.forEach(function (fig, i) {
    fig.addEventListener('click', function () {
      show(i);
      lb.hidden = false;
      x.focus();
    });
  });
  function close() { lb.hidden = true; img.src = ''; }
  x.addEventListener('click', close);
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') show(idx + 1);
    if (e.key === 'ArrowLeft') show(idx - 1);
  });
})();

/* ---- 7. Emplacement photo libre (evenements-01.jpg) ---- */
(function () {
  var slot = document.getElementById('customPhotoSlot');
  if (!slot) return;
  var preview = document.getElementById('slotPreviewImg');
  var fileInput = document.getElementById('slotFileInput');

  /* Si le fichier assets/photos/evenements-01.jpg est ajoute plus tard dans le depot, l'afficher automatiquement */
  var probe = new Image();
  probe.onload = function () {
    preview.src = 'assets/photos/evenements-01.jpg';
    preview.hidden = false;
    slot.classList.add('has-img');
  };
  probe.src = 'assets/photos/evenements-01.jpg';

  /* Restauration d'un apercu local eventuel */
  try {
    var savedImg = localStorage.getItem('custom-slot-evenements-01');
    if (savedImg) {
      preview.src = savedImg;
      preview.hidden = false;
      slot.classList.add('has-img');
    }
  } catch (e) {}

  if (fileInput) {
    fileInput.addEventListener('change', function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (ev) {
        preview.src = ev.target.result;
        preview.hidden = false;
        slot.classList.add('has-img');
        try { localStorage.setItem('custom-slot-evenements-01', ev.target.result); } catch (err) {}
      };
      reader.readAsDataURL(file);
    });
  }
})();
