/* Блок «Идея»: закреплён на экране, пока прокручиваются картинки.
   Каждая следующая картинка открывается снизу вверх и перекрывает предыдущую,
   текст слева и счётчик меняются вместе с ней. */
(function () {
  const sec = document.getElementById('idea');
  if (!sec) return;
  const imgs = [...sec.querySelectorAll('.idea__img')];
  const points = [...sec.querySelectorAll('.idea__point')];
  const num = document.getElementById('ideaNum');
  const dim = document.getElementById('ideaDim');
  const cont = sec.querySelector('.idea__sticky > .container'), title = sec.querySelector('.idea__title');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const n = imgs.length;
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  let active = -1, ticking = false;

  // стрелки и полоса прогресса вместо счётчика — если они есть в разметке
  const bar = sec.querySelector('[data-sys-progress]');
  if (bar) bar.innerHTML = Array.from({ length: n }, () => '<span><i></i></span>').join('');
  const fills = bar ? [...bar.querySelectorAll('i')] : [];

  // На мобильном блок становится обычной последовательностью, а не высокой
  // scroll-анимацией. Иначе десктопная формула высоты даёт отрицательный run
  // и следующий блок может перекрыть контент.
  const mobile = matchMedia('(max-width: 767px)');
  let current = 0;
  const photos = sec.querySelector('.idea__photos');
  const originalRole = photos.getAttribute('role'), originalLabel = photos.getAttribute('aria-label');
  const nativeSlider = n > 1 && document.body.matches('.production-page, .subcategory-page');
    if (nativeSlider) {
      photos.classList.add('mobile-photo-track');
      imgs.forEach((img, i) => { img.setAttribute('role', 'img'); img.setAttribute('aria-label', points[i].querySelector('h3').textContent); });
    }
    const show = (index, fromScroll = false) => {
      current = (index + n) % n;
      points.forEach((point, i) => {
        point.classList.toggle('is-active', i === current);
        point.classList.remove('is-past');
      });
      imgs.forEach((img, i) => img.style.setProperty('--clip', i === current ? '0%' : '100%'));
      fills.forEach((fill, i) => fill.style.transform = `scaleX(${i <= current ? 1 : 0})`);
      if (nativeSlider && !fromScroll) photos.scrollTo({ left: imgs[current].offsetLeft - imgs[0].offsetLeft, behavior: reduce ? 'instant' : 'smooth' });
    };
    // Нативная лента показывает край следующего фото; подпись и прогресс следуют за свайпом.
    if (nativeSlider) {
      let scrollTimer;
      photos.addEventListener('scroll', () => {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
          const step = imgs[1].offsetLeft - imgs[0].offsetLeft;
          if (!mobile.matches || step <= 0) return;
          show(Math.max(0, Math.min(n - 1, Math.round(photos.scrollLeft / step))), true);
        }, 150);
      }, { passive: true });
      photos.addEventListener('keydown', e => {
        if (!mobile.matches || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
        e.preventDefault();
        show(current + (e.key === 'ArrowRight' ? 1 : -1));
      });
    }
  const go = d => {
    if (n < 2) return;
    if (mobile.matches) { show(current + d); return; }
    const run = sec.offsetHeight - 2 * innerHeight;
    const now = Math.min(Math.max(-sec.getBoundingClientRect().top / run, 0), 1) * (n - 1);
    const idx = Math.min(n - 1, Math.max(0, Math.round(now) + d));
    scrollTo({ top: sec.getBoundingClientRect().top + scrollY + run * idx / (n - 1) + 1, behavior: 'smooth' });
  };
  sec.querySelector('[data-sys-prev]')?.addEventListener('click', () => go(-1));
  sec.querySelector('[data-sys-next]')?.addEventListener('click', () => go(1));

  function update() {
    ticking = false;
    if (mobile.matches) return;
    const r = sec.getBoundingClientRect();
    const run = sec.offsetHeight - 2 * innerHeight;          // смена картинок (последний экран — налистывание)
    // налистывание следующего блока: под ним закреплённый блок слегка темнеет
    const over = Math.min(Math.max((-r.top - run) / innerHeight, 0), 1);
    // фон становится светло-серым только когда на блок налистывается следующий
    dim.style.opacity = over.toFixed(3);
    const p = n === 1 ? 0 : Math.min(Math.max(-r.top / run, 0), 1) * (n - 1); // 0 … n-1

    // параллакс: фото внутри рамки плывут медленнее прокрутки, заголовок — чуть быстрее,
    // при въезде и при наложении следующего блока весь блок уходит с отставанием
    if (!reduce) {
      const g = Math.min(Math.max((innerHeight - r.top) / (sec.offsetHeight + innerHeight), 0), 1);   // 0…1 за всё время на экране
      imgs.forEach(img => img.style.setProperty('--py', ((0.5 - g) * 14).toFixed(2) + '%'));
      const enter = Math.min(Math.max(r.top / innerHeight, 0), 1);                                    // 1 → 0 при въезде
      cont.style.setProperty('--cy', (enter * 90 - over * 120).toFixed(1) + 'px');
      title.style.setProperty('--ty', ((0.5 - g) * 60).toFixed(1) + 'px');
    }

    imgs.forEach((img, i) => {
      if (i === 0) return;
      const k = ease(Math.min(Math.max(p - (i - 1), 0), 1));
      img.style.setProperty('--clip', ((1 - k) * 100).toFixed(2) + '%');
      img.style.setProperty('--z', (1.08 - 0.08 * k).toFixed(4));
    });

    // полоса прогресса (страницы категории и подкатегории): отрезок на каждую систему, заполняется прокруткой
    if (fills.length) {
      const q = p + 1;
      fills.forEach((f, i) => f.style.transform = `scaleX(${Math.min(Math.max(q - i, 0), 1)})`);
    }

    const idx = Math.min(n - 1, Math.round(p));
    if (idx !== active) {
      active = idx;
      points.forEach((el, i) => {
        el.classList.toggle('is-active', i === idx);
        el.classList.toggle('is-past', i < idx);
      });
      if (num) num.textContent = String(idx + 1).padStart(2, '0');
    }
  }

  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  function syncMode() {
    if (mobile.matches) {
      cont.style.removeProperty('--cy');
      title.style.removeProperty('--ty');
      dim.style.opacity = '0';
      if (nativeSlider) {
        photos.tabIndex = 0;
        photos.setAttribute('role', 'group');
        photos.setAttribute('aria-label', 'Фасадные системы: листайте фото влево или вправо');
      }
      show(current);
    } else {
      photos.removeAttribute('tabindex');
      if (originalRole === null) photos.removeAttribute('role'); else photos.setAttribute('role', originalRole);
      if (originalLabel === null) photos.removeAttribute('aria-label'); else photos.setAttribute('aria-label', originalLabel);
      photos.scrollTo({ left: 0, behavior: 'instant' });
      imgs[0].style.setProperty('--clip', '0%');
      active = -1;
      update();
    }
  }
  mobile.addEventListener('change', syncMode);
  syncMode();
})();
