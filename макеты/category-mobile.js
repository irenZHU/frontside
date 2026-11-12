/* Мобильное портфолио страницы категории.
   Сетка остаётся обычной на десктопе; на телефоне карточки показываются
   порциями, когда читатель подходит к концу списка. */
(() => {
  const mobile = window.matchMedia('(max-width: 767px)');
  if (!mobile.matches) return;

  const list = document.querySelector('.category-page:not(.premium-page) #projects-list .cards');
  if (!list) return;

  const items = [...list.querySelectorAll('.project-item')];
  const chips = [...document.querySelectorAll('#projects-list [data-direction-filter]')];
  const step = 4;
  const sentinel = document.createElement('div');
  sentinel.setAttribute('aria-hidden', 'true');
  sentinel.className = 'mobile-project-sentinel';
  list.after(sentinel);

  const visible = () => items.filter(item => !item.hidden);
  const deferred = () => visible().filter(item => item.dataset.mobileDeferred === 'true');
  const reveal = () => deferred().slice(0, step).forEach(item => delete item.dataset.mobileDeferred);
  const reset = () => {
    visible().forEach((item, index) => {
      if (index < step) delete item.dataset.mobileDeferred;
      else item.dataset.mobileDeferred = 'true';
    });
  };

  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) reveal();
  }, { rootMargin: '280px 0px' });

  document.documentElement.dataset.categoryMobileList = 'ready';
  reset();
  observer.observe(sentinel);

  // Основной фильтр страницы меняет hidden синхронно. Сбрасываем порцию уже
  // после него, чтобы в каждой подкатегории список начинался заново.
  chips.forEach(chip => chip.addEventListener('click', () => {
    requestAnimationFrame(reset);
  }));
})();
