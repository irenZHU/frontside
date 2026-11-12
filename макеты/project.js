/* Карточка объекта: мобильная галерея и вкладки. */
(() => {
  const hero = document.querySelector('.project-hero');
  const info = hero.querySelector('.project-info');
  const galleryBlock = hero.querySelector('.project-gallery-block');
  const gallery = galleryBlock.querySelector('.project-gallery');
  const photos = [...gallery.querySelectorAll('.project-gallery__item')];
  const count = galleryBlock.querySelector('[data-gallery-index]');
  galleryBlock.querySelector('[data-gallery-total]').textContent = String(photos.length).padStart(2, '0');
  const mobile = matchMedia('(max-width: 767px)');
  const narrow = matchMedia('(max-width: 1180px)');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

  // Переносим тот же блок, сохраняя единственный набор фотографий и порядок чтения.
  const arrange = () => {
    if (mobile.matches) info.querySelector('.project-info__lead').after(galleryBlock);
    else hero.prepend(galleryBlock);
  };
  mobile.addEventListener('change', arrange);
  arrange();

  const currentIndex = () => {
    const left = gallery.getBoundingClientRect().left;
    return photos.reduce((best, photo, i) =>
      Math.abs(photo.getBoundingClientRect().left - left) <
      Math.abs(photos[best].getBoundingClientRect().left - left) ? i : best, 0);
  };
  let frame = 0;
  gallery.addEventListener('scroll', () => {
    if (!mobile.matches || frame) return;
    frame = requestAnimationFrame(() => {
      count.textContent = String(currentIndex() + 1).padStart(2, '0');
      frame = 0;
    });
  }, { passive: true });
  const showPhoto = index => gallery.scrollTo({
    left: photos[index].offsetLeft - photos[0].offsetLeft,
    behavior: reduceMotion.matches ? 'instant' : 'smooth'
  });
  galleryBlock.querySelector('[data-slide-prev]').addEventListener('click', () =>
    showPhoto((currentIndex() - 1 + photos.length) % photos.length));
  galleryBlock.querySelector('[data-slide-next]').addEventListener('click', () =>
    showPhoto((currentIndex() + 1) % photos.length));
  gallery.addEventListener('keydown', event => {
    if (!mobile.matches || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = event.key === 'Home' ? 0 : event.key === 'End' ? photos.length - 1 :
      Math.max(0, Math.min(photos.length - 1, currentIndex() + (event.key === 'ArrowRight' ? 1 : -1)));
    showPhoto(index);
  });

  // На узких экранах колонка не закреплена и не нуждается в измерениях.
  const stick = () => {
    if (narrow.matches) info.style.removeProperty('top');
    else info.style.top = Math.min(82, innerHeight - info.offsetHeight - 24) + 'px';
  };
  addEventListener('resize', stick);
  new ResizeObserver(stick).observe(info);
  stick();

  const tabs = [...document.querySelectorAll('.project-tabs [role="tab"]')];
  const select = tab => tabs.forEach(item => {
    const active = item === tab;
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
  });
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 :
        (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      select(tabs[next]);
      tabs[next].focus();
    });
  });
})();
