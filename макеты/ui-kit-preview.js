/* Единственный источник образца — разметка и CSS рабочей страницы.
   Меняются только положение фрагмента в документе и количество повторяющихся карточек. */
(async () => {
  const status = document.getElementById('preview-status');
  const kind = new URLSearchParams(location.search).get('component');
  if (kind?.startsWith('atoms-')) {
    const script = document.createElement('script');
    script.src = 'ui-kit-atoms.js';
    script.onerror = () => { status.textContent = 'Не удалось загрузить компоненты.'; };
    document.body.append(script);
    return;
  }
  status.textContent = 'Образец не найден.';
})();
