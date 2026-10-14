/* Появление текста по строкам при прокрутке.
   Делит абзац с классом .reveal-lines на строки (как они легли на экране),
   каждая строка поднимается снизу из-под маски с небольшим сдвигом во времени. */
(function () {
  function split(el) {
    const text = el.textContent.trim().replace(/\s+/g, ' ');
    el.innerHTML = text.split(' ').map(w => `<span class="w">${w}</span>`).join(' ');
    const lines = [];
    let top = null;
    el.querySelectorAll('.w').forEach(w => {
      if (w.offsetTop !== top) { lines.push([]); top = w.offsetTop; }
      lines[lines.length - 1].push(w.textContent);
    });
    el.innerHTML = lines.map((l, i) =>
      `<span class="line" style="--i:${i}"><span>${l.join(' ')}</span></span>`).join('');
  }

  const items = [...document.querySelectorAll('.reveal-lines')];
  items.forEach(split);

  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { threshold: 0.4 });
  items.forEach(el => io.observe(el));

  // при изменении ширины окна строки пересобираются
  let t;
  addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(() => items.forEach(el => { const on = el.classList.contains('is-in'); split(el); if (on) el.classList.add('is-in'); }), 200);
  });
})();
