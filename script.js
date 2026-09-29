/* ==========================================================================
   Arta — Coming Soon
   Countdown, bilingual copy, WhatsApp notify, and all interactions.
   Everything runs client-side so the page can be hosted on GitHub Pages.
   ========================================================================== */

(() => {
  'use strict';

  // ---------------------------------------------------------------------------
  // Configuration — edit these values only
  // ---------------------------------------------------------------------------
  const CONFIG = {
    // Launch moment, with explicit offset so every visitor counts to the same instant.
    launch: '2026-10-09T12:00:00+04:30',        // Friday 17 Mizan/Mehr 1405, 12:00 noon Kabul
    // When the countdown was announced — used for the "journey" progress bar.
    announced: '2026-09-29T00:00:00+04:30',
    timeZone: 'Asia/Kabul',
    whatsapp: '93728000690',                     // international format, no + or 0
    // Optional: once launched, send visitors here (leave empty to stay on this page).
    launchUrl: '',
  };

  // ---------------------------------------------------------------------------
  // Copy
  // ---------------------------------------------------------------------------
  const STRINGS = {
    fa: {
      docTitle: 'آرتا · به‌زودی',
      eyebrow: 'به‌زودی',
      title: 'چیزی در حال *شکل‌گرفتن* است.',
      lede: 'ماه‌ها در سکوت ساختیم؛ با دقتی که فقط وقتی ببینیدش، معنایش را می‌فهمید. آرتا به‌زودی پرده برمی‌دارد — و می‌خواهیم شما جزو اولین‌ها باشید.',
      caption: 'تا لحظه‌ی رونمایی',
      days: 'روز',
      hours: 'ساعت',
      minutes: 'دقیقه',
      seconds: 'ثانیه',
      journey: 'مسیر تا افتتاح',
      cta: 'وقتی تمام شد، خبرم کن',
      share: 'اشتراک‌گذاری',
      hint: 'بدون ثبت‌نام — فقط یک پیام در واتساپ، و اولین نفری خواهید بود که خبردار می‌شود.',
      unveil: 'رونمایی',
      localTime: 'به وقت کابل',
      rights: '© {year} آرتا — تمامی حقوق محفوظ است.',
      toastWa: 'در حال انتقال به واتساپ…',
      toastCopied: 'لینک صفحه کپی شد',
      shareText: 'آرتا به‌زودی رونمایی می‌کند — چیزی در حال شکل‌گرفتن است.',
      wa: 'سلام آرتا 👋\nتایمرتون رو دیدم و خیلی کنجکاو شدم!\nلطفاً وقتی تایمر تموم شد و افتتاح کردید، به من هم خبر بدید.',
      summary: '{d} روز، {h} ساعت و {m} دقیقه تا رونمایی آرتا',
      tabTitle: '{d} روز و {h} ساعت مانده · آرتا',
      percent: '{p}٪',
      launched: {
        docTitle: 'آرتا · افتتاح شد',
        eyebrow: 'افتتاح شد',
        title: 'آرتا *رسماً* آغاز شد.',
        lede: 'انتظار به پایان رسید. آنچه در سکوت ساختیم حالا آماده است — همین حالا با ما گفت‌وگو کنید و جزو اولین کسانی باشید که تجربه‌اش می‌کنند.',
        cta: 'گفت‌وگو در واتساپ',
        hint: 'تیم آرتا آماده‌ی پاسخ‌گویی به شماست.',
        wa: 'سلام آرتا 👋\nتایمر تموم شد! دوست دارم بیشتر بدونم.',
        shareText: 'آرتا رسماً آغاز شد.',
      },
    },
    en: {
      docTitle: 'Arta · Coming Soon',
      eyebrow: 'Coming Soon',
      title: 'Something *remarkable* is taking shape.',
      lede: 'We’ve been building in silence — with a precision you’ll only understand once you see it. Arta is about to unveil what’s next, and we’d like you to be among the first.',
      caption: 'Until the unveiling',
      days: 'Days',
      hours: 'Hours',
      minutes: 'Minutes',
      seconds: 'Seconds',
      journey: 'Road to launch',
      cta: 'Notify me when it’s live',
      share: 'Share',
      hint: 'No sign-up — just one WhatsApp message, and you’ll be the first to know.',
      unveil: 'Unveiling',
      localTime: 'Kabul time',
      rights: '© {year} Arta. All rights reserved.',
      toastWa: 'Opening WhatsApp…',
      toastCopied: 'Link copied',
      shareText: 'Arta is about to unveil something — see the countdown.',
      wa: 'Hi Arta! 👋\nI saw your countdown and I’m curious.\nPlease let me know the moment you launch.',
      summary: '{d} days, {h} hours and {m} minutes until Arta’s unveiling',
      tabTitle: '{d}d {h}h left · Arta',
      percent: '{p}%',
      launched: {
        docTitle: 'Arta · Now Open',
        eyebrow: 'Now Open',
        title: 'Arta has *arrived.*',
        lede: 'The wait is over. What we built in silence is ready — start a conversation with us now and be among the first to experience it.',
        cta: 'Chat with us on WhatsApp',
        hint: 'The Arta team is ready to hear from you.',
        wa: 'Hi Arta! 👋\nThe countdown is over — I’d love to learn more.',
        shareText: 'Arta has arrived.',
      },
    },
  };

  // ---------------------------------------------------------------------------
  // Setup
  // ---------------------------------------------------------------------------
  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const isReduced = () => reduceMotion.matches;

  // `?launch=+15` (seconds from now) or `?launch=<ISO>` previews the launch sequence.
  const debugLaunch = params.get('launch');
  const LAUNCH = resolveLaunch();
  const ANNOUNCED = debugLaunch ? Date.now() : Math.min(Date.parse(CONFIG.announced), LAUNCH - 1000);

  function resolveLaunch() {
    if (debugLaunch) {
      if (/^\+\d+$/.test(debugLaunch)) {
        return Math.ceil((Date.now() + Number(debugLaunch.slice(1)) * 1000) / 1000) * 1000;
      }
      const t = Date.parse(debugLaunch);
      if (!Number.isNaN(t)) return t;
    }
    return Date.parse(CONFIG.launch);
  }

  let lang = root.lang === 'en' ? 'en' : 'fa';
  let launched = false;
  let ready = false;

  // ---------------------------------------------------------------------------
  // Text helpers
  // ---------------------------------------------------------------------------
  const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
  const localize = (value) =>
    lang === 'fa' ? String(value).replace(/\d/g, (d) => FA_DIGITS[d]) : String(value);

  const fill = (str, vars = {}) =>
    str.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? localize(vars[k]) : ''));

  function t(key) {
    const set = STRINGS[lang];
    if (launched && set.launched[key] != null) return set.launched[key];
    return set[key];
  }

  // Title is split into words so each can rise in; *word* is rendered in gold.
  function renderTitle(el, source, baseDelay) {
    const plain = source.replace(/\*/g, '');
    el.setAttribute('aria-label', plain);
    el.textContent = '';
    source.split(' ').forEach((raw, i, all) => {
      const gold = /^\*.*\*[.!]?$/.test(raw);
      const word = raw.replace(/\*/g, '');
      const outer = document.createElement('span');
      outer.className = 'w';
      outer.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('span');
      inner.className = gold ? 'w__i gold' : 'w__i';
      inner.style.setProperty('--i', i);
      inner.textContent = word;
      outer.appendChild(inner);
      el.appendChild(outer);
      if (i < all.length - 1) el.appendChild(document.createTextNode(' '));
    });
    el.style.setProperty('--base', `${baseDelay}ms`);
  }

  function formatLaunchDate() {
    const date = new Date(Date.parse(CONFIG.launch));
    try {
      const locale = lang === 'fa' ? 'fa-AF-u-ca-persian-nu-arabext' : 'en-GB';
      const parts = new Intl.DateTimeFormat(locale, {
        timeZone: CONFIG.timeZone, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      }).formatToParts(date);
      const get = (type) => (parts.find((p) => p.type === type) || {}).value || '';
      const time = new Intl.DateTimeFormat(locale, {
        timeZone: CONFIG.timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
      }).format(date);
      const day = lang === 'fa'
        ? `${get('weekday')} ${get('day')} ${get('month')} ${get('year')}`
        : `${get('weekday')}, ${get('day')} ${get('month')} ${get('year')}`;
      return `${day} · ${time} ${t('localTime')}`;
    } catch (e) {
      return lang === 'fa' ? 'جمعه ۱۷ میزان ۱۴۰۵ · ۱۲:۰۰ به وقت کابل' : 'Friday, 9 October 2026 · 12:00 Kabul time';
    }
  }

  // ---------------------------------------------------------------------------
  // Copy application + language switching
  // ---------------------------------------------------------------------------
  const ctaEl = $('[data-cta]');
  const dateEl = $('[data-launch-date]');
  const titleEl = $('.title');

  function applyCopy(titleDelay = 0) {
    $$('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      if (key === 'title') return;
      el.textContent = fill(t(key), { year: new Date(LAUNCH).getFullYear() });
    });
    renderTitle(titleEl, t('title'), titleDelay);
    document.title = t('docTitle');
    ctaEl.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(t('wa'))}`;
    dateEl.textContent = formatLaunchDate();
    $$('.lang__btn').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    relocalizeDigits();
    lastMinute = null; // refresh summary + tab title in the new language
  }

  function setLang(next) {
    if (next === lang) return;
    lang = next;
    try { localStorage.setItem('arta-lang', lang); } catch (e) { /* storage unavailable */ }
    try {
      const url = new URL(location.href);
      url.searchParams.delete('lang');
      history.replaceState(null, '', url);
    } catch (e) { /* ignore */ }

    const swap = () => {
      root.lang = lang;
      root.dir = lang === 'fa' ? 'rtl' : 'ltr';
      applyCopy(0);
      render(Date.now(), true);
    };

    if (isReduced() || !ready) { swap(); return; }
    const els = $$('[data-swap]');
    els.forEach((el) => el.classList.add('is-swapping'));
    setTimeout(() => {
      swap();
      requestAnimationFrame(() => els.forEach((el) => el.classList.remove('is-swapping')));
    }, 230);
  }

  $$('.lang__btn').forEach((btn) => btn.addEventListener('click', () => setLang(btn.dataset.lang)));

  // ---------------------------------------------------------------------------
  // Countdown
  // ---------------------------------------------------------------------------
  const units = $$('.unit').map((el) => ({
    el,
    key: el.dataset.unit,
    value: $('.unit__value', el),
    ring: $('.unit__ring rect', el),
    slots: [],
    frac: null,
  }));
  const pulseEl = $('.pulse');
  const summaryEl = $('#cd-summary');
  const trackEl = $('.journey__track');
  const pctEl = $('[data-journey-pct]');
  let lastMinute = null;

  const DIGIT_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

  function swapDigit(slot, ch, animate) {
    const prev = slot.lastElementChild;
    const next = document.createElement('span');
    next.textContent = localize(ch);
    slot.appendChild(next);
    slot.dataset.v = ch;
    if (!prev) return;
    if (!animate || isReduced() || !next.animate) { prev.remove(); return; }

    // Counting down: the new digit drops in from above, the old one falls away.
    next.animate(
      [
        { transform: 'translateY(-100%)', opacity: 0, filter: 'blur(6px)' },
        { transform: 'translateY(0)', opacity: 1, filter: 'blur(0)' },
      ],
      { duration: 620, easing: DIGIT_EASE }
    );
    prev.animate(
      [
        { transform: 'translateY(0)', opacity: 1, filter: 'blur(0)' },
        { transform: 'translateY(90%)', opacity: 0, filter: 'blur(6px)' },
      ],
      { duration: 520, easing: DIGIT_EASE, fill: 'forwards' }
    ).onfinish = () => prev.remove();
  }

  function setDigits(unit, str, animate) {
    if (unit.slots.length !== str.length) {
      unit.value.textContent = '';
      unit.slots = Array.from(str, () => {
        const s = document.createElement('span');
        s.className = 'digit';
        unit.value.appendChild(s);
        return s;
      });
      animate = false;
    }
    Array.from(str).forEach((ch, i) => {
      const slot = unit.slots[i];
      if (slot.dataset.v !== ch) swapDigit(slot, ch, animate);
    });
  }

  function relocalizeDigits() {
    units.forEach((u) => u.slots.forEach((slot) => {
      Array.from(slot.children).forEach((g) => g.remove());
      const g = document.createElement('span');
      g.textContent = localize(slot.dataset.v);
      slot.appendChild(g);
    }));
  }

  function setRing(unit, frac) {
    const offset = 100 - clamp(frac, 0, 1) * 100;
    const r = unit.ring;
    // When a unit wraps (e.g. seconds 00 → 59) jump instead of spinning backwards.
    if (unit.frac !== null && frac > unit.frac + 0.25) {
      r.style.transition = 'none';
      r.style.strokeDashoffset = offset;
      r.getBoundingClientRect();
      r.style.transition = '';
    } else {
      r.style.strokeDashoffset = offset;
    }
    unit.frac = frac;
  }

  function render(now, force = false) {
    const ms = Math.max(0, LAUNCH - now);
    const total = Math.ceil(ms / 1000);
    const values = {
      days: Math.floor(total / 86400),
      hours: Math.floor((total % 86400) / 3600),
      minutes: Math.floor((total % 3600) / 60),
      seconds: total % 60,
    };
    const span = Math.max(1, LAUNCH - ANNOUNCED);
    const fractions = {
      days: ms / span,
      hours: values.hours / 24,
      minutes: values.minutes / 60,
      seconds: values.seconds / 60,
    };

    units.forEach((u) => {
      setDigits(u, String(values[u.key]).padStart(2, '0'), ready && !force);
      setRing(u, fractions[u.key]);
    });

    const progress = clamp(1 - ms / span, 0, 1);
    trackEl.style.setProperty('--p', progress.toFixed(4));
    pctEl.textContent = fill(t('percent'), { p: Math.floor(progress * 100) });

    if (ready && !isReduced() && ms > 0) {
      pulseEl.classList.remove('is-beat');
      void pulseEl.offsetWidth;
      pulseEl.classList.add('is-beat');
    }

    // Screen readers + tab title update once per minute, not every second.
    const minuteKey = Math.floor(total / 60);
    if (minuteKey !== lastMinute) {
      lastMinute = minuteKey;
      const vars = { d: values.days, h: values.hours, m: values.minutes };
      summaryEl.textContent = fill(t('summary'), vars);
      if (!launched) document.title = fill(t('tabTitle'), vars);
    }
  }

  let tickTimer = null;
  function tick() {
    clearTimeout(tickTimer);
    const now = Date.now();
    render(now);
    if (now >= LAUNCH) { onLaunch(); return; }
    // Align to the next whole second so the display never skips a beat.
    tickTimer = setTimeout(tick, 1000 - (now % 1000) + 10);
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !launched) tick();
  });

  // ---------------------------------------------------------------------------
  // Launch sequence
  // ---------------------------------------------------------------------------
  const countdownEl = $('.countdown');
  const flashEl = $('.flash');

  async function onLaunch() {
    if (launched) return;
    launched = true;
    root.classList.add('is-launched');

    const animate = ready && !isReduced() && countdownEl.animate;
    if (animate) {
      await countdownEl.animate(
        [
          { opacity: 1, transform: 'none', filter: 'blur(0)' },
          { opacity: 0, transform: 'scale(0.92)', filter: 'blur(10px)' },
        ],
        { duration: 800, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'forwards' }
      ).finished;
    }
    countdownEl.hidden = true;
    applyCopy(animate ? 200 : 0);

    if (animate) {
      flashEl.animate(
        [
          { opacity: 0, transform: 'scale(0.6)' },
          { opacity: 1, transform: 'scale(1)', offset: 0.25 },
          { opacity: 0, transform: 'scale(1.4)' },
        ],
        { duration: 1800, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
      );
      dust.burst(innerWidth / 2, innerHeight * 0.42, 160, 1.4);
    }

    if (CONFIG.launchUrl) setTimeout(() => location.assign(CONFIG.launchUrl), animate ? 3500 : 0);
  }

  // ---------------------------------------------------------------------------
  // Gold dust (canvas particles)
  // ---------------------------------------------------------------------------
  const dust = (() => {
    const canvas = $('.dust');
    const ctx = canvas.getContext('2d');
    const particles = [];
    const pointer = { x: -9999, y: -9999 };
    let w = 0, h = 0, raf = 0, running = false;

    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 64;
    const sctx = sprite.getContext('2d');
    const grad = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 241, 194, 1)');
    grad.addColorStop(0.18, 'rgba(245, 214, 122, 0.85)');
    grad.addColorStop(0.45, 'rgba(202, 138, 4, 0.25)');
    grad.addColorStop(1, 'rgba(202, 138, 4, 0)');
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 64, 64);

    const rand = (a, b) => a + Math.random() * (b - a);

    function spawn(p, anywhere) {
      p.x = Math.random() * w;
      p.y = anywhere ? Math.random() * h : h + 20;
      p.r = rand(0.5, 2.1);
      p.vx = rand(-0.06, 0.06);
      p.vy = -rand(0.06, 0.3);
      p.a = rand(0.2, 0.75);
      p.tw = rand(0, Math.PI * 2);
      p.tws = rand(0.008, 0.025);
      p.life = Infinity;
      return p;
    }

    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = innerWidth;
      h = innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = w < 640 ? 38 : 85;
      const ambient = particles.filter((p) => p.life === Infinity).length;
      for (let i = ambient; i < target; i++) particles.push(spawn({}, true));
      if (!running) draw(false);
    }

    function draw(step) {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (step) {
          if (p.life !== Infinity) {
            p.vx *= 0.975;
            p.vy = p.vy * 0.975 + 0.012;
            p.life -= 1;
            if (p.life <= 0) { particles.splice(i, 1); continue; }
          } else {
            // Gentle push away from the pointer
            const dx = p.x - pointer.x, dy = p.y - pointer.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < 14400) {
              const f = (1 - Math.sqrt(d2) / 120) * 0.6;
              p.x += (dx / 120) * f;
              p.y += (dy / 120) * f;
            }
          }
          p.x += p.vx;
          p.y += p.vy;
          p.tw += p.tws;
          if (p.life === Infinity && (p.y < -20 || p.x < -20 || p.x > w + 20)) spawn(p, false);
        }
        const fade = p.life === Infinity ? 1 : Math.min(1, p.life / 40);
        const alpha = p.a * (0.55 + 0.45 * Math.sin(p.tw)) * fade;
        const size = p.r * 7;
        ctx.globalAlpha = alpha;
        ctx.drawImage(sprite, p.x - size / 2, p.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
    }

    function loop() {
      draw(true);
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (running || isReduced() || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    function burst(x, y, count = 40, power = 1) {
      if (isReduced()) return;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = rand(1, 5.5) * power;
        particles.push({
          x, y,
          r: rand(0.6, 2.4),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.2,
          a: rand(0.5, 1),
          tw: rand(0, Math.PI * 2),
          tws: rand(0.05, 0.15),
          life: Math.round(rand(50, 110)),
        });
      }
      start();
    }

    addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    reduceMotion.addEventListener?.('change', () => (isReduced() ? stop() : start()));
    resize();

    return { start, burst, pointer };
  })();

  // ---------------------------------------------------------------------------
  // Pointer: ambient glow + custom cursor
  // ---------------------------------------------------------------------------
  const cursorEl = $('.cursor');
  const glowEl = $('.glow');
  const cursor = { x: -100, y: -100, tx: -100, ty: -100, s: 1, ts: 1 };
  let pointerRaf = 0;

  function pointerLoop() {
    cursor.x += (cursor.tx - cursor.x) * 0.2;
    cursor.y += (cursor.ty - cursor.y) * 0.2;
    cursor.s += (cursor.ts - cursor.s) * 0.18;
    cursorEl.style.setProperty('--cx', `${cursor.x.toFixed(1)}px`);
    cursorEl.style.setProperty('--cy', `${cursor.y.toFixed(1)}px`);
    cursorEl.style.setProperty('--cs', cursor.s.toFixed(3));
    glowEl.style.setProperty('--mx', `${cursor.x.toFixed(0)}px`);
    glowEl.style.setProperty('--my', `${cursor.y.toFixed(0)}px`);
    const settled = Math.abs(cursor.tx - cursor.x) < 0.1 && Math.abs(cursor.ty - cursor.y) < 0.1
      && Math.abs(cursor.ts - cursor.s) < 0.001;
    pointerRaf = settled ? 0 : requestAnimationFrame(pointerLoop);
  }
  const wakePointer = () => { if (!pointerRaf) pointerRaf = requestAnimationFrame(pointerLoop); };

  const INTERACTIVE = 'a, button, [data-magnetic], .unit';

  function setupPointer() {
    if (!finePointer.matches) return;
    root.classList.add('has-pointer');
    if (!isReduced()) root.classList.add('has-cursor');

    addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      if (cursor.tx === -100) { cursor.x = e.clientX; cursor.y = e.clientY; }
      cursor.tx = e.clientX;
      cursor.ty = e.clientY;
      dust.pointer.x = e.clientX;
      dust.pointer.y = e.clientY;
      const hover = e.target.closest && e.target.closest(INTERACTIVE);
      cursor.ts = hover ? (hover.matches('.unit') ? 1.5 : 1.9) : 1;
      cursorEl.classList.toggle('is-hover', Boolean(hover));
      cursorEl.classList.remove('is-hidden');
      wakePointer();
    }, { passive: true });

    document.addEventListener('pointerleave', () => {
      cursorEl.classList.add('is-hidden');
      dust.pointer.x = dust.pointer.y = -9999;
    });
    addEventListener('pointerdown', () => { cursorEl.classList.add('is-down'); cursor.ts *= 0.8; wakePointer(); });
    addEventListener('pointerup', () => cursorEl.classList.remove('is-down'));
  }

  // ---------------------------------------------------------------------------
  // Micro-interactions
  // ---------------------------------------------------------------------------

  // 3D tilt + spotlight on countdown cards
  function setupTilt() {
    if (!finePointer.matches) return;
    units.forEach(({ el }) => {
      el.addEventListener('pointermove', (e) => {
        if (isReduced()) return;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--ry', `${((px - 0.5) * 14).toFixed(2)}deg`);
        el.style.setProperty('--rx', `${((0.5 - py) * 12).toFixed(2)}deg`);
        el.style.setProperty('--sx', `${(px * 100).toFixed(1)}%`);
        el.style.setProperty('--sy', `${(py * 100).toFixed(1)}%`);
      });
      el.addEventListener('pointerleave', () => {
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    });
  }

  // Magnetic buttons
  function setupMagnetic() {
    if (!finePointer.matches) return;
    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        if (isReduced()) return;
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.setProperty('--tx', `${(dx * 0.18).toFixed(1)}px`);
        el.style.setProperty('--ty', `${(dy * 0.28).toFixed(1)}px`);
      });
      el.addEventListener('pointerleave', () => {
        el.style.setProperty('--tx', '0px');
        el.style.setProperty('--ty', '0px');
      });
    });
  }

  // Ripple on press
  function setupRipples() {
    $$('.cta, .ghost').forEach((el) => {
      el.addEventListener('pointerdown', (e) => {
        if (isReduced()) return;
        const r = el.getBoundingClientRect();
        const dot = document.createElement('span');
        dot.className = 'ripple';
        dot.style.left = `${e.clientX - r.left}px`;
        dot.style.top = `${e.clientY - r.top}px`;
        el.appendChild(dot);
        dot.addEventListener('animationend', () => dot.remove());
      });
    });
  }

  // Toast
  const toastEl = $('.toast');
  let toastTimer = 0;
  function toast(message) {
    clearTimeout(toastTimer);
    toastEl.textContent = message;
    requestAnimationFrame(() => toastEl.classList.add('is-visible'));
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('is-visible');
      toastTimer = setTimeout(() => { toastEl.textContent = ''; }, 400);
    }, 2600);
  }

  function burstFrom(el) {
    const r = el.getBoundingClientRect();
    dust.burst(r.left + r.width / 2, r.top + r.height / 2, 46, 0.9);
  }

  // WhatsApp CTA
  ctaEl.addEventListener('click', () => {
    burstFrom(ctaEl);
    toast(t('toastWa'));
  });

  // Share (native sheet on mobile, clipboard elsewhere)
  $('[data-share]').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const url = location.href.split('?')[0];
    const data = { title: t('docTitle'), text: t('shareText'), url };
    burstFrom(btn);
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(`${data.text}\n${url}`);
      toast(t('toastCopied'));
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      try {
        await navigator.clipboard.writeText(url);
        toast(t('toastCopied'));
      } catch (e2) { /* clipboard unavailable */ }
    }
  });

  // ---------------------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------------------
  applyCopy(0);
  render(Date.now(), true);
  if (Date.now() >= LAUNCH) onLaunch();

  setupPointer();
  setupTilt();
  setupMagnetic();
  setupRipples();

  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, wait(1800)]).then(() => {
    requestAnimationFrame(() => {
      // Title words start rising as the curtain opens.
      titleEl.style.setProperty('--base', 'calc(var(--intro) + 1 * var(--stagger))');
      root.classList.add('is-ready');
      ready = true;
      dust.start();
      tick();
      if (launched && !isReduced()) {
        setTimeout(() => dust.burst(innerWidth / 2, innerHeight * 0.42, 120, 1.2), 1300);
      }
      // Hand over from one-shot intro animations to regular transitions.
      setTimeout(() => root.classList.add('is-settled'), isReduced() ? 0 : 3200);
    });
  });
})();
