/* Живой первый экран: солнце идёт от утра к вечеру.
   Все слои лежат в «сцене» 1920 × 823 — ровно по размеру фото,
   поэтому слои совпадают с фото при любой ширине экрана.

   Слои: фото → мягкое тёплое сияние со стороны солнца → солнце (только в небе).
   Ничего не затемняет фото: свет только добавляется, поэтому цвет остаётся чистым. */

(function () {
  const stage = document.getElementById('heroStage');
  if (!stage) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lerp = (a, b, t) => a + (b - a) * t;
  const mix = (a, b, t) => a.map((v, i) => Math.round(lerp(v, b[i], t)));

  /* ---------- сцена масштабируется как фото (cover, по центру сверху) ---------- */
  const hero = stage.closest('.hero');
  const fit = () => stage.style.setProperty('--s', Math.max(hero.clientWidth / 1920, hero.clientHeight / 823));
  fit(); addEventListener('resize', fit);

  /* ---------- параллакс при прокрутке: фото уходит вверх медленнее страницы ---------- */
  if (!reduce) {
    const content = hero.querySelector('.hero__content');
    let ticking = false;
    const onScroll = () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => {
        const y = Math.min(scrollY, hero.offsetHeight);       // за пределами первого экрана не считаем
        // первый экран закреплён: фото медленно уходит вверх, текст гаснет под наезжающим блоком
        const k = y / hero.offsetHeight;
        stage.style.setProperty('--py', (-y * 0.18).toFixed(1) + 'px');
        content.style.opacity = Math.max(0, 1 - k * 1.6).toFixed(3);
        content.style.translate = `0 ${(-y * 0.3).toFixed(1)}px`;
        ticking = false;
      });
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  /* ---------- свет ---------- */
  const wash = document.getElementById('heroWash'), sun = document.getElementById('heroSun');
  const stops = id => document.getElementById(id);
  const mg = ['mg0', 'mg1', 'mg2'].map(stops), eg = ['eg0', 'eg1', 'eg2'].map(stops);
  const paint = (st, rgb, a, mid) => {
    st[0].setAttribute('stop-color', `rgb(${rgb})`); st[0].setAttribute('stop-opacity', a.toFixed(3));
    st[1].setAttribute('stop-color', `rgb(${rgb})`); st[1].setAttribute('stop-opacity', (a * mid).toFixed(3));
    st[2].setAttribute('stop-color', `rgb(${rgb})`); st[2].setAttribute('stop-opacity', 0);
  };

  function setDay(t) {                                   // t: 0 — 06:00, 1 — 21:00
    const arc = Math.sin(Math.PI * t);                   // высота солнца
    const warm = Math.pow(1 - arc, 1.4);                 // тёплый свет у горизонта
    const col = mix([255, 228, 186], [255, 160, 80], warm);  // тёплое солнце, у горизонта — оранжевое
    const core = mix([255, 246, 226], [255, 214, 160], warm);

    // свет на фасаде: утром солнце слева освещает стеклянную грань, вечером справа — панели
    const morning = Math.pow(Math.max(0, 1 - t * 2.2), 0.6);
    const evening = Math.pow(Math.max(0, t * 2.2 - 1.2), 0.6);
    paint(mg, col, 0.55 * morning, 0.6);
    paint(eg, col, 0.4 * evening, 0.5);

    // солнце — по дуге, только в небе (за зданием его не видно)
    // солнце — только атмосфера: мягкое, без яркого диска, за зданием скрыто.
    // Идёт по дуге (кривая Безье по эскизу Ирины): круто поднимается слева снизу,
    // проходит верх над зданием и опускается вправо к светлым панелям. Координаты — в сцене 1920 × 823
    const B = [[311, 750], [410, 140], [1110, 20], [1527, 526]], m = 1 - t;
    const sx = m*m*m*B[0][0] + 3*m*m*t*B[1][0] + 3*m*t*t*B[2][0] + t*t*t*B[3][0];
    const sy = m*m*m*B[0][1] + 3*m*m*t*B[1][1] + 3*m*t*t*B[2][1] + t*t*t*B[3][1];
    sun.style.transform = `translate(${sx - 900}px, ${sy - 900}px)`;
    sun.style.background = `radial-gradient(circle, rgba(${core},.55) 0, rgba(${core},.35) 4%, rgba(${col},.18) 14%, rgba(${col},.07) 32%, rgba(${col},0) 60%)`;

    // мягкое сияние на фасаде со стороны солнца: большое, без краёв, тёплое у горизонта
    const wx = lerp(-200, 2120, t), wy = lerp(700, 260, arc);
    const a = 0.12 + 0.34 * warm;
    wash.style.background = `radial-gradient(ellipse 1500px 1100px at ${wx}px ${wy}px, rgba(${col},${a.toFixed(3)}) 0%, rgba(${col},${(a * 0.45).toFixed(3)}) 40%, rgba(${col},0) 75%)`;

  }

  window.heroSetDay = setDay;                            // для проверки: heroSetDay(0…1)
  if (reduce) { setDay(0.2); return; }

  // день идёт 36 секунд: утро → вечер, затем плавно обратно
  const PERIOD = 72000;
  let visible = true, last = 0;
  new IntersectionObserver(([e]) => visible = e.isIntersecting).observe(stage);
  const startAt = performance.now() + 3900;            // солнце стартует после заставки — не нагружаем раскрытие картинки
  setDay(0);
  (function tick(ts) {
    if (visible && ts > startAt && ts - last > 33) {
      last = ts;
      const p = ((ts - startAt) % PERIOD) / PERIOD;
      setDay(0.5 - 0.5 * Math.cos(2 * Math.PI * p));
    }
    requestAnimationFrame(tick);
  })(0);
})();
