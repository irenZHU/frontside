// Развёрнутое бургер-меню — карта сайта клиента (frontside.ru): все разделы и подразделы.
// Один файл на все страницы: разметка меню строится здесь, поэтому меню везде одинаковое.
// Разделы без своих макетов ведут в каталог проектов — ссылки помечены в списке.
const SITE_MENU = [
  [
    {
      title: 'О компании', href: 'projects.html#about', items: [
        { t: 'Производство', href: 'category-production.html' },
        { t: 'Новости', href: 'projects.html#news' },
        { t: 'Акции и события', href: '#' },
        { t: 'Статьи', href: '#' },
        { t: 'Пресса о нас', href: '#' },
        { t: 'Партнеры', href: '#' },
        { t: 'Реквизиты', href: '#' },
      ],
    },
    { title: 'Работа в компании', href: '#', items: [{ t: 'Вакансии', href: '#' }] },
  ],
  [
    {
      title: 'Каталог', href: 'projects.html#catalog', groups: [
        {
          title: 'Фасадные системы', items: [
            { t: 'Все системы', href: 'projects.html#catalog' },
            { t: 'FRONTTOP', href: 'projects.html#catalog' },
            { t: 'UNIQUE', href: 'projects.html#catalog' },
            { t: 'AESTHETIC', href: 'projects.html#catalog' },
            { t: 'FRONTBASE', href: 'projects.html#catalog' },
          ],
        },
        {
          title: 'Архитектурные возможности', items: [
            { t: 'UNIQUE 2.0', href: '#' },
            { t: 'ARTVISION', href: 'artvision.html' },
            { t: 'LED-подсветка', href: '#' },
            { t: 'ARTLINE', href: '#' },
          ],
        },
        {
          title: 'Декоративные элементы', items: [
            { t: 'Все элементы', href: '#' },
            { t: 'Угловые элементы', href: '#' },
            { t: 'Радиусные элементы', href: '#' },
            { t: 'Профили', href: '#' },
          ],
        },
      ],
    },
  ],
  [
    {
      title: 'Решения', href: 'projects.html#solutions', items: [
        { t: 'Фасады для объектов с особыми требованиями к архитектуре и эстетике', href: 'solution-premium.html' },
        { t: 'Фасады для технологически сложных объектов', href: '#' },
      ],
    },
    {
      title: 'Услуги', href: 'projects.html#services', items: [
        { t: 'Техническое проектирование и подготовка документации', href: '#' },
        { t: 'Производство фасадных систем для объекта', href: '#' },
        { t: 'Логистика и сопровождение монтажа на объекте', href: '#' },
      ],
    },
  ],
  [
    { title: 'Проекты', href: 'projects.html#projects', items: [{ t: 'География проектов', href: 'https://frontside.ru/projects/map/' }] },
    { title: 'Документы', href: 'projects.html#documents', items: [{ t: 'Материалы для скачивания', href: 'https://frontside.ru/downloads/' }] },
    { title: 'Контакты', href: 'projects.html#contacts', items: [{ t: 'Реквизиты', href: '#' }] },
  ],
];

const MENU_ARROW = '<svg class="fs-arrow fs-arrow--right" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M.4.5 19.1 18.3M2.9 19.2h16.85M18.9 4.3v9.4"/></svg>';
const MENU_PROMO_ARROW = '<svg class="fs-arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M.4.5 19.1 18.3M2.9 19.2h16.85M18.9 4.3v9.4"/></svg>';
const MENU_COLUMNS = [SITE_MENU[1], SITE_MENU[2], SITE_MENU[0], SITE_MENU[3]];

(function () {
  const burger = document.querySelector('header .burger');
  if (!burger) return;

  const link = item => `<a class="site-menu__link" href="${item.href}"><span class="site-menu__link-label">${item.t}</span>${MENU_ARROW}</a>`;
  const sub = group => `<div class="site-menu__sub"><p class="site-menu__subtitle">${group.title}</p>${group.items.map(link).join('')}</div>`;
  const section = group => `<section class="site-menu__group">
      <h2 class="site-menu__title">
        <a class="site-menu__title-link" href="${group.href}">${group.title}</a>
        <button class="site-menu__toggle" type="button" aria-expanded="false">${group.title}<span aria-hidden="true"></span></button>
      </h2>
      <div class="site-menu__content"><a class="site-menu__link site-menu__section-link" href="${group.href}"><span class="site-menu__link-label">Открыть раздел «${group.title}»</span>${MENU_ARROW}</a>${(group.groups || []).map(sub).join('')}${(group.items || []).map(link).join('')}</div>
    </section>`;
  const promo = (title, href, image) => `<a class="site-menu__promo-card" href="${href}" style="--menu-promo-image:url('${image}')"><span>${title}</span><span class="site-menu__promo-arrow">${MENU_PROMO_ARROW}</span></a>`;
  const contacts = `<section class="site-menu__contacts" aria-label="Контакты">
      <span>Центральный офис</span><address>Москва, ул. Барклая, д. 6, стр. 5, БЦ «Барклай-Плаза»</address>
      <span>Почта</span><a href="mailto:info@frontside.ru">info@frontside.ru</a>
      <span>Телефон</span><a href="tel:+74956428091">+7 (495) 642-80-91</a>
      <div class="site-menu__social"><a href="https://t.me/Frontside_original" aria-label="Telegram">TG</a><a href="https://rutube.ru/channel/39600399/" aria-label="Rutube">R</a><a href="https://vk.com/frontside" aria-label="ВКонтакте">VK</a></div>
    </section>`;

  const menu = document.createElement('div');
  menu.className = 'site-menu';
  menu.id = 'site-menu';
  menu.hidden = true;
  menu.setAttribute('role', 'dialog');
  menu.setAttribute('aria-modal', 'true');
  menu.setAttribute('aria-label', 'Меню сайта');
  menu.innerHTML = `<div class="container site-menu__inner">
      <div class="site-menu__grid">${MENU_COLUMNS.map(col => `<div class="site-menu__col">${col.map(section).join('')}</div>`).join('')}<aside class="site-menu__promo" aria-label="Быстрые переходы">${promo('Каталог', 'catalog.html', 'img/premium/detail-blue.webp')}${promo('Решения', 'solution-premium.html', 'img/premium/chayka.webp')}${contacts}</aside></div>
    </div>`;
  document.body.append(menu);

  const setOpen = open => {
    menu.hidden = !open;
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.body.classList.toggle('has-site-menu', open);
    document.body.style.overflow = open ? 'hidden' : '';
    const firstControl = matchMedia('(max-width: 767px)').matches
      ? menu.querySelector('.site-menu__toggle')
      : menu.querySelector('a');
    (open ? firstControl : burger).focus();
  };

  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-controls', 'site-menu');
  burger.addEventListener('click', () => setOpen(menu.hidden));
  menu.addEventListener('click', e => {
    const toggle = e.target.closest('.site-menu__toggle');
    if (toggle) {
      const group = toggle.closest('.site-menu__group');
      const isOpen = group.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      return;
    }
    if (e.target.closest('a')) setOpen(false);
  });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) setOpen(false); });
})();
