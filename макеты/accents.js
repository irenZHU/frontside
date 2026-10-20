/* Сфера применения — вертикальный слайдер.
   1) при въезде блок вырастает из половины экрана до ширины контейнера;
   2) затем закрепляется, и каждый следующий кадр (фото + название + описание) подъезжает снизу;
   3) пока блок под липкой кнопкой, на ней «Обсудить проект». */
(function () {
  const sec = document.getElementById('accents');
  if (!sec) return;
  const stage = sec.querySelector('.accents__sticky');
  const slides = [...sec.querySelectorAll('.accents__slide')];
  const imgs = slides.map(s => s.querySelector('.accents__img'));
  const num = document.getElementById('accNum');
  const n = slides.length;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const clamp = v => Math.min(Math.max(v, 0), 1);

  let active = -1, ticking = false;
  // пока на экране этот блок, липкая кнопка прячется — у слайдера своя кнопка внутри кадра
  // (на одной линии со счётчиком), поэтому ничего не прыгает и не меняет текст
  const cta = document.querySelector('.hero__cta');
  function hideCta(r) {
    if (!cta) return;
    const on = r.top < innerHeight * .55 && r.bottom > innerHeight * .45;
    cta.classList.toggle('is-hidden', on);
  }

  function update() {
    ticking = false;
    const r = sec.getBoundingClientRect();
    hideCta(r);

    const top = parseFloat(getComputedStyle(sec).getPropertyValue('--top')) || 0;
    const W = stage.clientWidth, H = stage.clientHeight;
    sec.style.setProperty('--h', H + 'px');

    // 1. вырастание при въезде: из половины кадра в полный кадр к моменту остановки
    const g = reduce ? 1 : ease(clamp((innerHeight - r.top) / (innerHeight - top)));
    stage.style.setProperty('--cx', (W / 4 * (1 - g)).toFixed(1) + 'px');
    stage.style.setProperty('--cy', (H / 4 * (1 - g)).toFixed(1) + 'px');

    // 2. смена кадров, пока кадр стоит под шапкой: p от 0 до n-1
    const run = Math.max(1, sec.offsetHeight - H);
    const p = clamp((top - r.top) / run) * (n - 1);
    slides.forEach((s, i) => {
      const k = i === 0 ? 1 : ease(clamp(p - (i - 1)));     // насколько кадр въехал
      const out = clamp(p - i);                               // насколько его перекрыл следующий
      s.style.setProperty('--ty', ((1 - k) * 100).toFixed(2) + '%');
      if (!reduce) {
        imgs[i].style.setProperty('--iy', (out * -5 + (1 - k) * 5).toFixed(2) + '%');
        imgs[i].style.setProperty('--z', (1.06 - 0.06 * k).toFixed(4));
      }
    });
    const idx = Math.min(n - 1, Math.round(p));
    if (idx !== active) { active = idx; num.textContent = String(idx + 1).padStart(2, '0'); }
  }

  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  update();
})();
