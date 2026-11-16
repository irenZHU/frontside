/* Навигация и размеры справочника; стили компонентов здесь не создаются. */
(() => {
  const sections = [...document.querySelectorAll('.kit-section')];
  const links = [...document.querySelectorAll('.kit-side nav a')];
  let scheduled = false;
  const markSection = () => {
    scheduled = false;
    const current = [...sections].reverse().find(section => section.getBoundingClientRect().top <= 120) || sections[0];
    links.forEach(link => {
      if (link.hash === '#' + current.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(markSection); } }, { passive: true });
  markSection();
  document.querySelectorAll('[data-color]').forEach(label => {
    const probe = document.createElement('span');
    probe.style.color = `var(${label.dataset.color})`;
    document.body.append(probe);
    label.textContent = getComputedStyle(probe).color;
    probe.remove();
  });
  document.querySelectorAll('[data-component-preview]').forEach(sample => {
    const frame = sample.querySelector('iframe');
    const buttons = [...sample.querySelectorAll('[data-preview-width]')];
    let observer;
    frame.addEventListener('load', () => {
      observer?.disconnect();
      if (!frame.hasAttribute('data-auto-height')) return;
      const body = frame.contentDocument?.body;
      if (!body) return;
      const resize = () => { frame.style.height = Math.ceil(body.getBoundingClientRect().height) + 'px'; };
      observer = new ResizeObserver(resize);
      observer.observe(body);
      resize();
    });
    buttons.forEach(button => button.addEventListener('click', () => {
      const width = button.dataset.previewWidth;
      frame.width = width;
      frame.style.width = width + 'px';
      frame.title = `${frame.dataset.previewTitle} — ${width} px`;
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    }));
  });
})();
