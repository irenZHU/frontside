/* Блок фактов: когда он появляется на экране, круги прорисовываются,
   а цифры набегают от нуля до своего значения. */
(function () {
  const sec = document.getElementById('facts');
  if (!sec) return;
  const nums = [...sec.querySelectorAll('[data-count]')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) nums.forEach(el => el.textContent = '0');

  function count(el) {
    const to = +el.dataset.count, dur = 1800, t0 = performance.now();
    const step = now => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(to * e);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  new IntersectionObserver(([e], io) => {
    if (!e.isIntersecting) return;
    sec.classList.add('is-in');
    if (!reduce) nums.forEach((el, i) => setTimeout(() => count(el), 200 + i * 150));
    io.disconnect();
  }, { threshold: 0.35 }).observe(sec);
})();
