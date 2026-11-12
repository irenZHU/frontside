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
  if (matchMedia('(max-width: 767px)').matches) {
    let current = 0;
    const show = index => {
      current = (index + n) % n;
      points.forEach((point, i) => {
        point.classList.toggle('is-active', i === current);
        point.classList.remove('is-past');
      });
      imgs.forEach((img, i) => img.style.setProperty('--clip', i === current ? '0%' : '100%'));
      fills.forEach((fill, i) => fill.style.transform = `scaleX(${i <= current ? 1 : 0})`);
    };
    sec.querySelector('[data-sys-prev]')?.addEventListener('click', () => show(current - 1));
    sec.querySelector('[data-sys-next]')?.addEventListener('click', () => show(current + 1));
    // На категории и подкатегории стрелки заменены свайпом по фотографии.
    if (document.body.matches('.production-page, .subcategory-page')) {
      const photos = sec.querySelector('.idea__photos');
      let start = null;
      photos.addEventListener('touchstart', e => {
        start = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
      }, { passive: true });
      photos.addEventListener('touchend', e => {
        if (!start) return;
        const dx = e.changedTouches[0].clientX - start.x, dy = e.changedTouches[0].clientY - start.y;
        start = null;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) show(current + (dx < 0 ? 1 : -1));
      }, { passive: true });
      photos.addEventListener('touchcancel', () => { start = null; }, { passive: true });
      photos.tabIndex = 0;
      photos.setAttribute('aria-label', 'Фасадные системы: листайте фото влево или вправо');
      photos.addEventListener('keydown', e => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        show(current + (e.key === 'ArrowRight' ? 1 : -1));
      });
    }
    show(0);
    return;
  }
  const go = d => {
    const run = sec.offsetHeight - 2 * innerHeight;
    const now = Math.min(Math.max(-sec.getBoundingClientRect().top / run, 0), 1) * (n - 1);
    const idx = Math.min(n - 1, Math.max(0, Math.round(now) + d));
    scrollTo({ top: sec.getBoundingClientRect().top + scrollY + run * idx / (n - 1) + 1, behavior: 'smooth' });
  };
  sec.querySelector('[data-sys-prev]')?.addEventListener('click', () => go(-1));
  sec.querySelector('[data-sys-next]')?.addEventListener('click', () => go(1));

  function update() {
    ticking = false;
    const r = sec.getBoundingClientRect();
    const run = sec.offsetHeight - 2 * innerHeight;          // смена картинок (последний экран — налистывание)
    // налистывание следующего блока: под ним закреплённый блок слегка темнеет
    const over = Math.min(Math.max((-r.top - run) / innerHeight, 0), 1);
    // фон становится светло-серым только когда на блок налистывается следующий
    dim.style.opacity = over.toFixed(3);
    const p = Math.min(Math.max(-r.top / run, 0), 1) * (n - 1); // 0 … n-1

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
  update();
})();
