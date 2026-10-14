/* Слайдер на первом экране: смена каждые 6 секунд, клик по чёрточке — переход. */
(function () {
  const root = document.getElementById('heroSlider');
  if (!root) return;
  const slides = [...root.querySelectorAll('.hero__slide')];
  const dots = [...root.querySelectorAll('.hero__dot')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let i = 0, timer;

  function go(n) {
    const next = (n + slides.length) % slides.length;
    if (next !== i) {
      const prev = slides[i];
      prev.classList.remove('is-active');
      prev.classList.add('is-leaving');                 // уходит вверх
      setTimeout(() => prev.classList.remove('is-leaving'), 700);
    }
    i = next;
    slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
    dots.forEach((d, k) => { d.classList.toggle('is-active', k === i); d.setAttribute('aria-selected', k === i); });
  }
  function start() { if (!reduce) { clearInterval(timer); timer = setInterval(() => go(i + 1), 6000); } }

  dots.forEach((d, k) => d.addEventListener('click', () => { go(k); start(); }));
  root.addEventListener('mouseenter', () => clearInterval(timer));
  root.addEventListener('mouseleave', start);
  go(0); start();
})();
