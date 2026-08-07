// explainer-demos.js — the six toys for "Hypervectors, explained".
// Everything is computed honestly: bipolar fingerprints, real overlaps,
// FHRR phase dials for binding, and a real scene memory for the payoff.
(function () {
  'use strict';
  const TAU = Math.PI * 2;

  // seeded draw so the page tells the same story every visit
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const R = rng(0x1CA2026);
  const D = 256;

  const NAMES = ['mug', 'dog', 'keys', 'ball', 'kitchen', 'sofa', 'garden'];
  const FP = {};                       // bipolar fingerprints (±1) for overlap demos
  const PH = {};                       // FHRR phases for the binding demos
  NAMES.forEach(n => {
    const f = new Float64Array(D), p = new Float64Array(D);
    for (let i = 0; i < D; i++) { f[i] = R() < 0.5 ? -1 : 1; p[i] = R() * TAU; }
    FP[n] = f; PH[n] = p;
  });
  const overlap = (a, b) => { let s = 0; for (let i = 0; i < D; i++) s += a[i] * b[i]; return s / D; };
  const simPh = (a, b) => { let s = 0; for (let i = 0; i < D; i++) s += Math.cos(a[i] - b[i]); return s / D; };

  function fit(cv) {
    const r = cv.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w: r.width, h: r.height };
  }

  // barcode: diverging paper palette — blue for −, terracotta for +
  function barcode(cv, vec, scale) {
    const f = fit(cv); if (!f) return;
    const { ctx, w, h } = f;
    ctx.fillStyle = '#f2f1ed'; ctx.fillRect(0, 0, w, h);
    const n = Math.min(D, 128), bw = w / n;
    for (let i = 0; i < n; i++) {
      const v = Math.max(-1, Math.min(1, vec[Math.floor(i * D / n)] * (scale || 1)));
      ctx.fillStyle = v >= 0
        ? `rgba(200,85,61,${0.15 + 0.85 * v})`
        : `rgba(91,120,180,${0.15 + 0.85 * -v})`;
      ctx.fillRect(i * bw, 0, bw + 0.5, h);
    }
  }
  const pct = v => (v * 100).toFixed(v * 100 >= 10 ? 0 : 1) + '%';

  // ── 01 · FINGERPRINTS ────────────────────────────────────────────
  (function () {
    const chips = document.getElementById('fp-chips');
    if (!chips) return;
    let a = 'mug', b = 'dog';
    function render() {
      chips.innerHTML = '';
      NAMES.forEach(n => {
        const c = document.createElement('button');
        c.className = 'chip' + (n === a || n === b ? ' sel' : '');
        c.textContent = n;
        c.addEventListener('click', () => { b = a; a = n; render(); });
        chips.appendChild(c);
      });
      document.getElementById('fp-la').textContent = a;
      document.getElementById('fp-lb').textContent = b;
      barcode(document.getElementById('fp-a'), FP[a]);
      barcode(document.getElementById('fp-b'), FP[b]);
      const o = overlap(FP[a], FP[b]);
      document.getElementById('fp-sim').innerHTML = a === b
        ? `overlap(${a}, ${b}) = <strong>100%</strong> — of course: it's the same fingerprint.`
        : `overlap(${a}, ${b}) = <strong>${pct(Math.abs(o))}</strong> — near zero. Strangers, by construction.`;
    }
    render();
    window.addEventListener('resize', render);
  })();

  // ── 02 · ELBOW ROOM ──────────────────────────────────────────────
  (function () {
    const cv = document.getElementById('dim-hist');
    if (!cv) return;
    const slider = document.getElementById('dim-slider');
    const DS = [32, 64, 128, 256, 1024, 4096];
    const PAIRS = 320;
    const QUIPS = [
      'At D = 32, random pairs regularly overlap 20–30%. Crowded in here.',
      'Better — but accidental look-alikes still happen.',
      'The pile is tightening around zero.',
      'This page runs on D = 256: overlap noise ≈ ±6%. Room for everyone.',
      'At a thousand dimensions, strangers are practically perpendicular.',
      'And by four thousand, an accidental match is a statistical event.'
    ];
    const r2 = rng(0xE1B0);
    function render() {
      const idx = +slider.value, Dn = DS[idx];
      const ovs = [];
      for (let p = 0; p < PAIRS; p++) {
        let s = 0;
        for (let i = 0; i < Dn; i++) s += (r2() < 0.5 ? -1 : 1) * (r2() < 0.5 ? -1 : 1);
        ovs.push(s / Dn);
      }
      const f = fit(cv); if (!f) return;
      const { ctx, w, h } = f;
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
      const B = 41, counts = new Array(B).fill(0);
      ovs.forEach(o => {
        const bi = Math.round(((o + 0.6) / 1.2) * (B - 1));
        if (bi >= 0 && bi < B) counts[bi]++;
      });
      const mx = Math.max(...counts) || 1, bw = w / B;
      ctx.strokeStyle = 'rgba(20,20,20,0.12)';
      ctx.beginPath(); ctx.moveTo(w / 2 + .5, 8); ctx.lineTo(w / 2 + .5, h - 18); ctx.stroke();
      for (let i = 0; i < B; i++) {
        const bh = (counts[i] / mx) * (h - 34);
        ctx.fillStyle = Math.abs((i / (B - 1)) * 1.2 - 0.6) < 0.03 ? '#c8553d' : 'rgba(200,85,61,0.35)';
        ctx.fillRect(i * bw + 1, h - 18 - bh, Math.max(1, bw - 2), bh);
      }
      ctx.fillStyle = 'rgba(20,20,20,0.4)';
      ctx.font = '11px "Geist Mono", ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('−60%', w * 0.05, h - 4); ctx.fillText('0', w / 2, h - 4); ctx.fillText('+60%', w * 0.95, h - 4);
      document.getElementById('dim-d').textContent = Dn;
      document.getElementById('dim-typ').textContent = '±' + (100 / Math.sqrt(Dn)).toFixed(Dn >= 1000 ? 1 : 0) + '%';
      document.getElementById('dim-quip').textContent = QUIPS[idx];
    }
    slider.addEventListener('input', render);
    window.addEventListener('resize', render);
    render();
  })();

  // ── 03 · THE BAG ─────────────────────────────────────────────────
  (function () {
    const chips = document.getElementById('bag-chips');
    if (!chips) return;
    const inBag = new Set(['mug', 'keys', 'dog']);
    const POOL = ['mug', 'dog', 'keys', 'ball', 'sofa'];
    function render() {
      chips.innerHTML = '';
      POOL.forEach(n => {
        const c = document.createElement('button');
        c.className = 'chip' + (inBag.has(n) ? ' sel' : '');
        c.textContent = (inBag.has(n) ? '× ' : '+ ') + n;
        c.addEventListener('click', () => { inBag.has(n) ? inBag.delete(n) : inBag.add(n); render(); });
        chips.appendChild(c);
      });
      const bag = new Float64Array(D);
      inBag.forEach(n => { for (let i = 0; i < D; i++) bag[i] += FP[n][i]; });
      const norm = Math.sqrt(overlap(bag, bag) * D / 1) || 1;
      barcode(document.getElementById('bag-cv'), bag, 1 / Math.max(1, Math.sqrt(inBag.size)));
      const bars = document.getElementById('bag-bars');
      bars.innerHTML = '';
      POOL.forEach(n => {
        const s = inBag.size ? overlap(bag, FP[n]) / Math.sqrt(inBag.size) : 0;
        const row = document.createElement('div');
        row.className = 'bar-row';
        row.innerHTML = `<span class="bar-lab">${n}</span><span class="bar-tr"><span class="bar-fill${inBag.has(n) ? ' hot' : ''}"></span></span><span class="bar-val">${pct(Math.max(0, s))}</span>`;
        bars.appendChild(row);
        requestAnimationFrame(() => { row.querySelector('.bar-fill').style.width = Math.max(2, Math.max(0, s) * 100) + '%'; });
      });
    }
    render();
    window.addEventListener('resize', render);
  })();

  // ── 04 · THE GLUE ────────────────────────────────────────────────
  (function () {
    const cvA = document.getElementById('gl-a');
    if (!cvA) return;
    const cvB = document.getElementById('gl-b'), cvC = document.getElementById('gl-c');
    let spin = 0, dissolved = false;
    const N = 9;
    function dials(cv, get, color) {
      const f = fit(cv); if (!f) return;
      const { ctx, w, h } = f;
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
      const cw = w / N, rr = Math.min(cw, h) / 2 - 5;
      for (let i = 0; i < N; i++) {
        const cx = (i + .5) * cw, cy = h / 2, a = get(i);
        ctx.beginPath(); ctx.arc(cx, cy, rr, 0, TAU);
        ctx.strokeStyle = 'rgba(20,20,20,0.15)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.lineTo(cx + rr * .85 * Math.cos(a), cy - rr * .85 * Math.sin(a));
        ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath(); ctx.arc(cx + rr * .85 * Math.cos(a), cy - rr * .85 * Math.sin(a), 2, 0, TAU);
        ctx.fillStyle = color; ctx.fill();
      }
    }
    const mugPh = i => PH.mug[i] + spin;
    function render() {
      dials(cvA, i => PH.kitchen[i], 'rgba(20,20,20,0.75)');
      dials(cvB, mugPh, 'rgba(20,20,20,0.75)');
      dials(cvC, i => dissolved ? PH.kitchen[i] + mugPh(i) - PH.kitchen[i] : PH.kitchen[i] + mugPh(i), '#c8553d');
      const bound = new Float64Array(D);
      for (let i = 0; i < D; i++) bound[i] = dissolved ? mugPh(i) : PH.kitchen[i] + mugPh(i);
      const spun = new Float64Array(D);
      for (let i = 0; i < D; i++) spun[i] = mugPh(i);
      const sMug = simPh(bound, spun), sDog = simPh(bound, PH.dog);
      document.getElementById('gl-ca').innerHTML = `match to mug: <strong>${pct(Math.abs(sMug))}</strong>`;
      document.getElementById('gl-cb').innerHTML = `match to dog: <strong>${pct(Math.abs(sDog))}</strong>`;
      document.getElementById('gl-msg').textContent = dissolved
        ? 'Glue dissolved: subtract the kitchen’s angles and the pair IS the mug again — 100%, not approximately.'
        : 'The pair matches neither parent — a fresh stranger. Spin the mug: the pair follows, the strangeness stays.';
      document.getElementById('gl-btn').textContent = dissolved ? 'Re-apply the glue' : 'Dissolve the glue';
    }
    document.getElementById('gl-btn').addEventListener('click', () => { dissolved = !dissolved; render(); });
    let dragX = null;
    cvB.addEventListener('pointerdown', e => { dragX = e.clientX; cvB.setPointerCapture(e.pointerId); });
    cvB.addEventListener('pointermove', e => {
      if (dragX === null) return;
      spin += (e.clientX - dragX) * 0.02;
      dragX = e.clientX;
      render();
    });
    cvB.addEventListener('pointerup', () => dragX = null);
    window.addEventListener('resize', render);
    render();
  })();

  // ── 05 · THE PAYOFF ──────────────────────────────────────────────
  (function () {
    const cv = document.getElementById('sc-cv');
    if (!cv) return;
    const SCENE = [['kitchen', 'mug'], ['sofa', 'dog'], ['garden', 'ball']];
    const M = { re: new Float64Array(D), im: new Float64Array(D) };
    SCENE.forEach(([pl, ob]) => {
      for (let i = 0; i < D; i++) {
        const a = PH[pl][i] + PH[ob][i];
        M.re[i] += Math.cos(a); M.im[i] += Math.sin(a);
      }
    });
    const memVec = new Float64Array(D);
    for (let i = 0; i < D; i++) memVec[i] = Math.atan2(M.im[i], M.re[i]) / Math.PI;
    barcode(cv, memVec);
    const btns = document.getElementById('sc-btns');
    ['kitchen', 'sofa', 'garden'].forEach(pl => {
      const b = document.createElement('button');
      b.className = 'chip ask';
      b.textContent = 'what’s in the ' + pl + '?';
      b.addEventListener('click', () => ask(pl, b));
      btns.appendChild(b);
    });
    function ask(pl, btn) {
      btns.querySelectorAll('.chip').forEach(c => c.classList.toggle('sel', c === btn));
      const CANDS = ['mug', 'dog', 'keys', 'ball'];
      const sims = CANDS.map(ob => {
        let s = 0;
        for (let i = 0; i < D; i++) {
          const q = PH[pl][i] + PH[ob][i];
          s += M.re[i] * Math.cos(q) + M.im[i] * Math.sin(q);
        }
        return [ob, s / D];
      }).sort((x, y) => y[1] - x[1]);
      const bars = document.getElementById('sc-bars');
      bars.innerHTML = '';
      const mx = Math.max(sims[0][1], 1e-9);
      sims.forEach(([ob, s], i) => {
        const row = document.createElement('div');
        row.className = 'bar-row';
        row.innerHTML = `<span class="bar-lab">${ob}</span><span class="bar-tr"><span class="bar-fill${i === 0 ? ' hot' : ''}"></span></span><span class="bar-val">${pct(Math.max(0, s))}</span>`;
        bars.appendChild(row);
        requestAnimationFrame(() => { row.querySelector('.bar-fill').style.width = Math.max(2, Math.max(0, s) / mx * 100) + '%'; });
      });
      const truth = SCENE.find(sc => sc[0] === pl)[1];
      const win = sims[0][0];
      document.getElementById('sc-out').innerHTML =
        `memory ⊘ ${pl} → a noisy fingerprint that looks <strong>${pct(Math.max(0, sims[0][1]))}</strong> like <strong>${win}</strong>` +
        (win === truth ? ' — recognised, blurry photo and all.' : ' — crosstalk won this one; add dimensions!');
    }
    window.addEventListener('resize', () => barcode(cv, memVec));
  })();

  // ── scroll furniture ─────────────────────────────────────────────
  (function () {
    const rvs = document.querySelectorAll('.rv');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('on'); }), { threshold: 0.15 });
      rvs.forEach(el => io.observe(el));
    } else rvs.forEach(el => el.classList.add('on'));
    const bar = document.querySelector('#progress > div');
    window.addEventListener('scroll', () => {
      const t = document.documentElement.scrollTop;
      const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      bar.style.width = (h > 0 ? (t / h) * 100 : 0) + '%';
    }, { passive: true });
  })();
})();
