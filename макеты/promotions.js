(() => {
  const filters = document.querySelector('.promotions-filters');
  const buttons = [...filters.querySelectorAll('[data-promotion-filter]')];
  const cards = [...document.querySelectorAll('[data-promotion-status]')];
  const results = document.getElementById('promotion-results');

  for (const button of buttons) {
    button.addEventListener('click', () => {
      const status = button.dataset.promotionFilter;
      for (const filter of buttons) {
        filter.classList.toggle('is-active', filter === button);
        filter.setAttribute('aria-pressed', String(filter === button));
      }

      let visibleCount = 0;
      for (const card of cards) {
        const visible = status === 'all' || card.dataset.promotionStatus === status;
        card.hidden = !visible;
        visibleCount += Number(visible);
      }
      results.textContent = `Найдено акций и событий: ${visibleCount}`;
    });
  }

  filters.hidden = false;
})();
