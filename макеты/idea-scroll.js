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

    const idx = Math.min(n - 1, Math.round(p));
    if (idx !== active) {
      active = idx;
      points.forEach((el, i) => {
        el.classList.toggle('is-active', i === idx);
        el.classList.toggle('is-past', i < idx);
      });
      num.textContent = String(idx + 1).padStart(2, '0');
    }
  }

  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  update();
})();
