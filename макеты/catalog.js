/* Табы каталога: выбранный раздел всегда получает явное активное состояние.
   Ссылка остаётся обычной якорной навигацией и работает без JavaScript. */
document.addEventListener('DOMContentLoaded', () => {
  const tabs = [...document.querySelectorAll('.catalog-product-filter .product-chip')];
  if (!tabs.length) return;

  const setActive = tab => {
    tabs.forEach(item => {
      const isActive = item === tab;
      item.classList.toggle('is-active', isActive);
      if (isActive) item.setAttribute('aria-current', 'location');
      else item.removeAttribute('aria-current');
    });
  };

  tabs.forEach(tab => tab.addEventListener('click', () => setActive(tab)));
  const current = tabs.find(tab => tab.getAttribute('href') === location.hash);
  if (current) setActive(current);
});
