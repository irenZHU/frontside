// Развёрнутое бургер-меню — карта сайта клиента (frontside.ru): все разделы и подразделы.
// Один файл на все страницы: разметка меню строится здесь, поэтому меню везде одинаковое.
// Состав разделов и внешние ссылки сверены с меню frontside.ru; готовые макеты открываются локально.
const SITE_MENU = [
  [
    {
      "title": "О компании",
      "href": "https://frontside.ru/about/",
      "groups": [
        {
          "title": "Компания",
          "items": [
            {
              "t": "О компании",
              "href": "https://frontside.ru/about/"
            },
            {
              "t": "Производство",
              "href": "https://frontside.ru/about/production/"
            },
            {
              "t": "Партнёры",
              "href": "https://frontside.ru/about/partners/"
            }
          ]
        },
        {
          "title": "Медиацентр",
          "items": [
            {
              "t": "Новости",
              "href": "https://frontside.ru/about/news/"
            },
            {
              "t": "Акции и события",
              "href": "https://frontside.ru/akcii-i-sobytiya/"
            },
            {
              "t": "Статьи",
              "href": "https://frontside.ru/about/publications/"
            },
            {
              "t": "Пресса о нас",
              "href": "https://frontside.ru/about/press-about-us/"
            }
          ]
        },
        {
          "title": "Информация",
          "items": [
            {
              "t": "Реквизиты",
              "href": "https://frontside.ru/about/requisites/"
            },
            {
              "t": "Вакансии",
              "href": "https://frontside.ru/work-us/"
            }
          ]
        }
      ]
    },
    {
      "title": "Работа в компании",
      "href": "https://frontside.ru/work-us/",
      "items": [
        {
          "t": "Вакансии",
          "href": "https://frontside.ru/work-us/"
        }
      ]
    }
  ],
  [
    {
      "title": "Каталог",
      "href": "catalog.html",
      "mobileLink": true,
      "groups": [
        {
          "title": "Фасадные системы",
          "items": [
            {
              "t": "Все системы",
              "href": "catalog.html#fasadnye-sistemy"
            },
            {
              "t": "FRONTTOP",
              "href": "https://frontside.ru/catalog/fronttop/"
            },
            {
              "t": "UNIQUE",
              "href": "https://frontside.ru/catalog/unique/"
            },
            {
              "t": "AESTHETIC",
              "href": "https://frontside.ru/catalog/aesthetic/"
            },
            {
              "t": "FRONTBASE",
              "href": "https://frontside.ru/catalog/frontbase/"
            },
            {
              "t": "UNIQUE BV",
              "href": "https://frontside.ru/compare/"
            }
          ]
        },
        {
          "title": "Архитектурные возможности",
          "items": [
            {
              "t": "Все возможности",
              "href": "catalog.html#architecture"
            },
            {
              "t": "UNIQUE 2.0",
              "href": "https://frontside.ru/catalog/unique-2-0/"
            },
            {
              "t": "ARTVISION",
              "href": "artvision.html"
            },
            {
              "t": "LED-подсветка",
              "href": "https://frontside.ru/catalog/led/"
            },
            {
              "t": "ARTLINE",
              "href": "https://frontside.ru/catalog/artline/"
            }
          ]
        },
        {
          "title": "Декоративные элементы",
          "items": [
            {
              "t": "Все элементы",
              "href": "catalog.html#elements"
            },
            {
              "t": "Угловые элементы",
              "href": "https://frontside.ru/catalog/uglovye-fasadnye-elementy/"
            },
            {
              "t": "Радиусные элементы",
              "href": "https://frontside.ru/catalog/radiusnye-fasadnye-elementy/"
            },
            {
              "t": "Профили",
              "href": "https://frontside.ru/catalog/profili1/"
            }
          ]
        }
      ]
    }
  ],
  [
    {
      "title": "Решения",
      "href": "https://frontside.ru/solutions/",
      "groups": [
        {
          "title": "Решения для фасадов",
          "items": [
            {
              "t": "Все решения",
              "href": "https://frontside.ru/solutions/"
            },
            {
              "t": "Фасады для объектов с особыми требованиями к архитектуре и эстетике",
              "href": "solution-premium.html"
            },
            {
              "t": "Фасады для технологически сложных объектов",
              "href": "https://frontside.ru/solutions/fasady-obektov-s-osobymi-tekhnologicheskimi-trebovaniyami/"
            }
          ]
        },
        {
          "title": "Реализованные объекты",
          "items": [
            {
              "t": "Проекты",
              "href": "projects.html"
            },
            {
              "t": "География проектов",
              "href": "https://frontside.ru/projects/map/"
            }
          ]
        },
        {
          "title": "Связанные разделы",
          "items": [
            {
              "t": "Каталог",
              "href": "catalog.html"
            },
            {
              "t": "Услуги",
              "href": "https://frontside.ru/services/"
            },
            {
              "t": "Документы",
              "href": "https://frontside.ru/downloads/"
            }
          ]
        }
      ]
    },
    {
      "title": "Услуги",
      "href": "https://frontside.ru/services/",
      "groups": [
        {
          "title": "Проектирование",
          "items": [
            {
              "t": "Техническое проектирование и подготовка документации",
              "href": "https://frontside.ru/services/tekhnicheskoe-proektirovanie-i-podgotovka-dokumentatsii/"
            }
          ]
        },
        {
          "title": "Производство",
          "items": [
            {
              "t": "Производство фасадных систем для объекта",
              "href": "https://frontside.ru/services/proizvodstvo-fasadnykh-sistem-dlya-obekta/"
            }
          ]
        },
        {
          "title": "Сопровождение",
          "items": [
            {
              "t": "Логистика и сопровождение монтажа на объекте",
              "href": "https://frontside.ru/services/logistika-i-soprovozhdenie-montazha-na-obekte/"
            }
          ]
        }
      ]
    }
  ],
  [
    {
      "title": "Проекты",
      "href": "projects.html",
      "items": [
        {
          "t": "География проектов",
          "href": "https://frontside.ru/projects/map/"
        }
      ]
    },
    {
      "title": "Документы",
      "href": "https://frontside.ru/downloads/",
      "items": [
        {
          "t": "Материалы для скачивания",
          "href": "https://frontside.ru/downloads/"
        }
      ]
    },
    {
      "title": "Контакты",
      "href": "https://frontside.ru/contacts/",
      "items": [
        {
          "t": "Реквизиты",
          "href": "https://frontside.ru/about/requisites/"
        }
      ]
    }
  ]
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
        <a class="site-menu__title-link${group.mobileLink ? ' site-menu__direct-link' : ''}" href="${group.href}">${group.title}${group.mobileLink ? MENU_ARROW : ''}</a>
        ${group.mobileLink ? '' : `<button class="site-menu__toggle" type="button" aria-expanded="false">${group.title}<span aria-hidden="true"></span></button>`}
      </h2>
      <div class="site-menu__content">${group.mobileLink ? '' : `<a class="site-menu__link site-menu__section-link" href="${group.href}"><span class="site-menu__link-label">Открыть раздел «${group.title}»</span>${MENU_ARROW}</a>`}${(group.groups || []).map(sub).join('')}${(group.items || []).map(link).join('')}</div>
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
    if (open) closeDropdown();
    menu.hidden = !open;
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.body.classList.toggle('has-site-menu', open);
    document.body.style.overflow = open ? 'hidden' : '';
    const firstControl = matchMedia('(max-width: 767px)').matches
      ? menu.querySelector('.site-menu__direct-link, .site-menu__toggle')
      : menu.querySelector('a');
    (open ? firstControl : burger).focus();
  };

  // Четыре раскрытия шапки используют те же данные и элементы, что бургер.
  const header = document.querySelector('.header');
  const dropdown = document.createElement('nav');
  dropdown.className = 'header-dropdown';
  dropdown.id = 'header-dropdown';
  dropdown.hidden = true;
  dropdown.setAttribute('aria-label', 'Подразделы сайта');
  document.body.append(dropdown);
  let activeDropdown = null;
  const closeDropdown = (restoreFocus = false) => {
    if (!activeDropdown) return;
    const button = activeDropdown;
    activeDropdown = null;
    button.setAttribute('aria-expanded', 'false');
    button.closest('.header-nav-item').querySelector('a').setAttribute('aria-expanded', 'false');
    button.closest('.header-nav-item').classList.remove('is-open');
    dropdown.hidden = true;
    if (restoreFocus) button.focus();
  };
  // Содержание промоблоков — из меню frontside.ru, описания сокращены для баннеров.
  const dropdownBanners = {
    'Каталог': {
      title: 'Каталог продукции',
      description: 'Системы фасадов, технологии архитектурного оформления и декоративные детали.',
      image: 'img/premium/detail-blue.webp'
    },
    'Услуги': {
      title: 'Полный цикл работ',
      description: 'Инженерная подготовка, изготовление, поставка фасадов и помощь при монтаже.',
      image: 'img/category-production-cover.jpg'
    },
    'Решения': {
      title: 'Решения для объектов',
      description: 'Подбираем фасад под архитектурную задачу, технологию строительства и условия использования.',
      image: 'img/premium/chayka.webp'
    },
    'О компании': {
      title: 'О компании Frontside',
      description: 'Наши компетенции и производство, партнёрская сеть и публикации о Frontside.',
      image: 'img/premium/office.webp'
    }
  };
  const dropdownBanner = (title, href) => {
    const banner = dropdownBanners[title];
    return `<a class="site-menu__promo-card header-dropdown__banner" href="${href}" style="--menu-promo-image:url('${banner.image}')"><span class="header-dropdown__banner-copy"><strong>${banner.title}</strong><span>${banner.description}</span></span><span class="site-menu__promo-arrow">${MENU_PROMO_ARROW}</span></a>`;
  };
  const groupsByTitle = new Map(SITE_MENU.flat().map(group => [group.title, group]));
  header.querySelectorAll('.nav > a').forEach(anchor => {
    const title = anchor.textContent.trim();
    if (!['Каталог', 'Услуги', 'Решения', 'О компании'].includes(title)) return;
    const group = groupsByTitle.get(title);
    anchor.href = group.href;
    anchor.setAttribute('role', 'button');
    anchor.setAttribute('aria-expanded', 'false');
    anchor.setAttribute('aria-controls', dropdown.id);
    const wrapper = document.createElement('div');
    wrapper.className = 'header-nav-item';
    anchor.before(wrapper);
    wrapper.append(anchor);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'header-nav-toggle';
    button.setAttribute('aria-label', `Подразделы: ${title}`);
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', dropdown.id);
    button.innerHTML = '<span aria-hidden="true"></span>';
    wrapper.append(button);
    const openDropdown = () => {
      const wasOpen = activeDropdown === button;
      closeDropdown();
      if (wasOpen) return;
      if (!menu.hidden) setOpen(false);
      dropdown.innerHTML = `<div class="container header-dropdown__inner"><div class="header-dropdown__layout"><div class="header-dropdown__grid">${group.groups.map(sub).join('')}</div>${dropdownBanner(title, group.href)}</div></div>`;
      dropdown.setAttribute('aria-label', `Подразделы: ${title}`);
      dropdown.hidden = false;
      activeDropdown = button;
      button.setAttribute('aria-expanded', 'true');
      anchor.setAttribute('aria-expanded', 'true');
      wrapper.classList.add('is-open');
    };
    button.addEventListener('click', openDropdown);
    anchor.addEventListener('click', event => {
      event.preventDefault();
      openDropdown();
    });
    anchor.addEventListener('keydown', event => {
      if (![' ', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === ' ') openDropdown();
      else {
        if (activeDropdown !== button) openDropdown();
        dropdown.querySelector('a')?.focus();
      }
    });
    button.addEventListener('keydown', event => {
      if (event.key !== 'ArrowDown') return;
      event.preventDefault();
      if (activeDropdown !== button) openDropdown();
      dropdown.querySelector('a')?.focus();
    });
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.header-nav-item, .header-dropdown')) closeDropdown();
    if (event.target.closest('.header-dropdown a')) closeDropdown();
  });
  document.addEventListener('focusin', event => {
    if (!event.target.closest('.header-nav-item, .header-dropdown')) closeDropdown();
  });
  addEventListener('keydown', event => {
    if (event.key === 'Escape') closeDropdown(true);
  });
  addEventListener('resize', () => closeDropdown());

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
