/* Хедер берётся с рабочей страницы, меню и стили подключаются без копий для кита. */
(async () => {
  const status = document.getElementById('header-preview-status');
  try {
    const response = await fetch('projects.html');
    if (!response.ok) throw new Error('Header source unavailable');
    const source = new DOMParser().parseFromString(await response.text(), 'text/html');
    const header = source.querySelector('body > header.header');
    if (!header) throw new Error('Header markup missing');
    document.body.prepend(document.importNode(header, true));
    const menu = document.createElement('script');
    menu.src = 'menu.js';
    menu.addEventListener('load', () => {
      document.querySelector('.header-nav-toggle')?.click();
    });
    menu.addEventListener('error', () => { status.hidden = false; });
    document.body.append(menu);
  } catch {
    status.hidden = false;
  }
})();
