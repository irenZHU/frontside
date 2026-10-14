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
