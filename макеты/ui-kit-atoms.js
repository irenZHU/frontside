/* Отдельные элементы клонируются из макетов вместе с контекстом селекторов.
   Показанные hover/focus получают те же декларации, что исходные :hover/:focus:
   CSSOM меняет только условие состояния, а не значения или размеры компонента. */
(async () => {
  const status = document.getElementById('preview-status');
  const kind = new URLSearchParams(location.search).get('component');
  const field = name => `.category-form .category-form__field:has(input[name="${name}"])`;
  const definitions = {
    'atoms-buttons': { page: 'category-production.html', rows: [
      ['Заявка в хедере', '.header .btn-accent'],
      ['Основное действие', '.category-hero__cta'],
      ['Отправить форму', '.category-form__submit'],
      ['Вторичное действие', '.category-all-link'],
      ['Поиск', '.header .icon-btn'],
      ['Бургер', '.header .burger'],
      ['Стрелка назад', '.category-intro__slider-nav [data-slide-prev]'],
      ['Стрелка вперёд', '.category-intro__slider-nav [data-slide-next]']
    ] },
    'atoms-links': { page: 'subcategory-industrial.html', rows: [
      ['Текстовая ссылка', '.category-systems__more'],
      ['Ссылка раздела', '.premium-head__link'],
      ['Хлебные крошки', '.breadcrumbs a'],
      ['Пункт меню', '.header .nav--main a'],
      ['Раздел футера', '.footer__nav a', { dark: true }],
      ['Почта', '.footer__contacts > a[href^="mailto:"]', { dark: true }],
      ['Служебная ссылка', '.footer__bottom > a[href*="privacy"]', { dark: true }],
      ['Политика в форме', '.category-form__agree a']
    ] },
    'atoms-fields': { page: 'project-total.html', scripts: ['phone-mask.js'], rows: [
      ['Текстовое поле', field('name'), { target: 'input', value: 'Ирина', labels: ['Пустое','Наведение','Фокус, заполнено'] }],
      ['Телефон с маской', field('phone'), { target: 'input', value: '+7 (999) 123-45-67', labels: ['Пустое','Наведение','Фокус, заполнено'] }],
      ['Согласие с политикой', '.category-form .category-form__agree', { target: 'input', checked: true, labels: ['Не выбрано','Наведение','Выбрано'] }]
    ] },
    'atoms-filters': { page: 'projects.html', live: true, activate: '[data-product-filter="unique"]', rows: [
      ['Таб системы', '[data-product-filter="fronttop"]', { selected: true, labels: ['Обычное','Наведение','Активно'] }],
      ['Категория фильтра', '.filter-group', { target: 'summary', open: false, openOnFocus: true, labels: ['Закрыто','Наведение','Открыто'] }],
      ['Радиовыбор', '.filter-group label', { target: 'input', checked: true, labels: ['Не выбрано','Наведение','Выбрано'] }],
      ['Выбранный фильтр', '.selected-filter'],
      ['Сброс фильтра', '.filter-status-bar > [data-reset]']
    ] },
    'atoms-navigation': { page: 'project-total.html', rows: [
      ['Хлебные крошки', '.breadcrumbs', { states: ['normal'], labels: ['Компонент'] }],
      ['Вкладки объекта', '.project-tabs__list', { target: '[aria-selected="false"]', tab: true, labels: ['Обычное','Наведение','Активно'] }]
    ] },
    'atoms-badges': { page: 'project-total.html', rows: [
      ['Категория объекта', '.project-related .project-card__badges > span:first-child', { states: ['normal'], labels: ['Бейдж'] }],
      ['Система объекта', '.project-related .project-card__badges > span:last-child', { states: ['normal'], labels: ['Бейдж'] }]
    ] },
    'atoms-icons': { page: 'project-total.html', rows: [
      ['Фирменная стрелка', '.category-all-link .fs-arrow', { states: ['normal'], labels: ['20 px'] }],
      ['Стрелка влево', '.project-gallery-nav [data-slide-prev] .fs-arrow', { states: ['normal'], labels: ['20 px'] }],
      ['Стрелка вправо', '.project-gallery-nav [data-slide-next] .fs-arrow', { states: ['normal'], labels: ['20 px'] }],
      ['Стрелка наверх', '.footer__bottom .fs-arrow', { dark: true, states: ['normal'], labels: ['20 px'] }],
      ['Поиск', '.header .icon-btn svg', { states: ['normal'], labels: ['Иконка поиска'] }],
      ['Меню', '.header .burger svg', { states: ['normal'], labels: ['Иконка меню'] }]
    ] },
    'atoms-cards': { page: 'project-total.html', rows: [
      ['Карточка объекта', '.project-related .project-item', { states: ['normal','hover'], labels: ['Обычное','Наведение'], target: '.project-card' }]
    ] },
    'atoms-catalog-card': { page: 'catalog.html', rows: [
      ['Карточка системы', '.catalog-system-card', { states: ['normal','hover'], labels: ['Обычное','Наведение'], target: '.project-card' }]
    ] },
    'atoms-solution-card': { page: 'projects.html', rows: [
      ['Карточка решения', '.solution-card', { states: ['normal','hover'], labels: ['Обычное','Наведение'] }]
    ] },
    'atoms-premium-card': { page: 'solution-premium.html', rows: [
      ['Карточка премиального объекта', '.premium-object', { states: ['normal','hover'], labels: ['Обычное','Наведение'] }]
    ] },
    'atoms-news-card': { page: 'news.html', live: true, ready: '#news-archive[aria-busy="false"]', rows: [
      ['Карточка новости', '.news-card:has(.news-status)', { states: ['normal','hover'], labels: ['Обычное','Наведение'], target: '.news-card__link' }]
    ] }
  };
  let sourceFrame;
  try {
    const config = definitions[kind];
    if (!config) throw new Error('Unknown component group');
    const response = await fetch(config.page);
    if (!response.ok) throw new Error('Source unavailable');
    let source = new DOMParser().parseFromString(await response.text(), 'text/html');
    await Promise.all([...source.querySelectorAll('link[rel="stylesheet"]')].map(link => new Promise((resolve, reject) => {
      const copy = document.importNode(link, true);
      copy.onload = resolve; copy.onerror = reject; document.head.append(copy);
    })));
    if (config.live) {
      // Берём элементы, которые создаёт скрипт рабочей страницы.
      sourceFrame = document.createElement('iframe');
      sourceFrame.width = '1440'; sourceFrame.height = '900'; sourceFrame.hidden = true;
      const loaded = new Promise((resolve, reject) => { sourceFrame.onload = resolve; sourceFrame.onerror = reject; });
      sourceFrame.src = config.page; document.body.append(sourceFrame); await loaded;
      source = sourceFrame.contentDocument;
      if (config.activate) source.querySelector(config.activate).click();
      if (config.ready && !source.querySelector(config.ready)) await new Promise((resolve, reject) => {
        const observer = new MutationObserver(() => {
          if (!source.querySelector(config.ready)) return;
          clearTimeout(timeout);
          observer.disconnect();
          resolve();
        });
        const timeout = setTimeout(() => {
          observer.disconnect();
          reject(new Error('Source did not finish loading'));
        }, 10000);
        observer.observe(source.body, { subtree: true, attributes: true, attributeFilter: ['aria-busy'] });
      });
    }
    document.body.className = source.body.className;
    // Раскладка витрины и только внешние контейнеры вынутого элемента.
    const layout = document.createElement('style');
    layout.dataset.kitLayout = '';
    layout.textContent = `
      html,body { margin:0; min-width:0; min-height:0; } body { display:flow-root; }
      .kit-atoms { padding:16px 0; font:500 var(--fs-ui)/var(--lh-ui) var(--font-text); }
      .kit-atom-row { display:grid; grid-template-columns:repeat(var(--kit-columns,3),minmax(0,1fr)); gap:16px 24px; align-items:start; }
            .kit-atom-row { margin-bottom:56px; }
      .kit-atom-label { grid-column:1/-1; margin:0; color:var(--brand-black); font:500 var(--fs-h4)/var(--lh-h4) var(--font-head); }
      .kit-atom-ref { grid-column:1/-1; margin:-8px 0 4px; color:var(--brand-muted); font:500 var(--fs-caption)/var(--lh-caption) var(--font-text); overflow-wrap:anywhere; }
      .kit-atom-cell { min-width:0; padding:0; display:flow-root; }
      .kit-atom-cell[data-inverse] { background:var(--brand-black); padding:16px; }
      .kit-atom-state { display:block; margin:0 0 16px; color:var(--brand-muted); font:500 var(--fs-caption)/var(--lh-caption) var(--font-text); }
      [data-kit-context] { position:static!important; inset:auto!important; transform:none!important; translate:none!important; margin:0!important; padding:0!important; width:100%!important; max-width:none!important; min-width:0!important; min-height:0!important; height:auto!important; overflow:visible!important; clip-path:none!important; box-shadow:none!important; background:transparent!important; border:0!important; }
      [data-kit-context]::before, [data-kit-context]::after { content:none!important; display:none!important; }
      [data-kit-context]:not([data-kit-parent]) { display:block!important; }
      .header__actions[data-kit-parent] { height:var(--header-control-size)!important; }
      .nav[data-kit-parent] { display:flex!important; }
      [data-kit-placeholder] { display:none!important; }
      .kit-atoms[data-kind*="card"] [data-kit-context] { display:block!important; }
      .kit-atoms[data-kind="atoms-news-card"] .kit-atom-cell { padding:16px; background:var(--color-surface-subtle); }
      .kit-atoms[data-kind="atoms-navigation"] .project-tabs__list[data-kit-component] { flex-wrap:wrap; }
      .kit-atoms[data-kind="atoms-icons"] { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:32px; }
      .kit-atoms[data-kind="atoms-icons"] .kit-atom-row { display:block; margin-bottom:0; }
      .kit-atoms[data-kind="atoms-icons"] .kit-atom-ref { margin:8px 0 16px; }
      .kit-atoms[data-kind="atoms-icons"] .kit-atom-cell { padding:16px; }
      .kit-atoms[data-kind="atoms-icons"] [data-kit-parent] { display:flex!important; align-items:center; }
      .kit-atom-cell[data-inverse] .kit-atom-state { color:var(--brand-inverse-muted); }

      @media(max-width:767px) {
        .kit-atoms[data-kind="atoms-icons"] { grid-template-columns:minmax(0,1fr); }
          .kit-atom-row { grid-template-columns:minmax(0,1fr); gap:16px; margin-bottom:40px; }
        .kit-atom-state { display:block; }
        .kit-atom-label { color:var(--brand-black); }
      }
    `;
    document.head.append(layout);
    // Состояния используют исходные селекторы и декларации, включая media/supports.
    const aliases = rules => [...rules].map(rule => {
      if (rule.type === CSSRule.STYLE_RULE) {
        if (!/:(hover|focus)/.test(rule.selectorText)) return '';
        const selector = rule.selectorText.replace(/:focus-visible\b/g, '[data-kit-focus-visible]')
          .replace(/:focus-within\b/g, '[data-kit-focus-within]')
          .replace(/:focus\b/g, '[data-kit-focus]').replace(/:hover\b/g, '[data-kit-hover]');
        return `${selector}{${rule.style.cssText}}`;
      }
      if (rule.cssRules) {
        const children = aliases(rule.cssRules);
        return children ? `${rule.cssText.slice(0,rule.cssText.indexOf('{'))}{${children}}` : '';
      }
      return '';
    }).join('\n');
    const states = document.createElement('style'); states.dataset.kitSourceStates = '';
    states.textContent = [...document.styleSheets].map(sheet => {
      if (sheet.ownerNode === layout) return '';
      try { return aliases(sheet.cssRules); } catch { return ''; }
    }).join('\n');
    document.head.append(states);
    const gallery = document.createElement('div'); gallery.className = 'kit-atoms'; gallery.dataset.kind = kind;
    for (const [label, selector, options = {}] of config.rows) {
      const original = source.querySelector(selector);
      if (!original) throw new Error('Missing component: ' + selector);
      const row = document.createElement('div'); row.className = 'kit-atom-row'; row.dataset.sourceSelector = selector;
      const name = document.createElement('h4'); name.className = 'kit-atom-label'; name.textContent = label; row.append(name);
      const ref = document.createElement('p'); ref.className = 'kit-atom-ref'; ref.textContent = config.page + ' · ' + selector; row.append(ref);
      const variants = options.states || ['normal','hover','focus']; row.style.setProperty('--kit-columns', variants.length);
      for (const [stateIndex, state] of variants.entries()) {
        const cell = document.createElement('div'); cell.className = 'kit-atom-cell'; cell.dataset.state = state;
        if (options.dark) cell.dataset.inverse = '';
        const caption = document.createElement('p'); caption.className = 'kit-atom-state'; caption.textContent = options.labels?.[stateIndex] || { normal:'Обычное',hover:'Наведение',focus:'Фокус' }[state]; cell.append(caption);
        const copy = document.importNode(original, true); copy.dataset.kitComponent = '';
        let branch = copy, current = original;
        while (current.parentElement && current.parentElement !== source.body) {
          const parent = current.parentElement;
          const context = document.importNode(parent.cloneNode(false), true); context.dataset.kitContext = '';
          if (current === original) context.dataset.kitParent = '';
          if (context.tagName === 'DETAILS') context.open = true;
          // Скрытые соседи сохраняют :first-child/:last-child/:nth-child и семантику details.
          [...parent.children].forEach(sibling => {
            if (sibling === current) context.append(branch);
            else { const placeholder = document.importNode(sibling.cloneNode(false),true); placeholder.dataset.kitPlaceholder = ''; context.append(placeholder); }
          });
          branch = context; current = parent;
        }
        if (copy.tagName === 'DETAILS') copy.open = options.openOnFocus && state === 'focus' ? true : options.open ?? true;
        const target = options.target ? copy.querySelector(options.target) : copy;
        if (options.checked && state === 'focus') target.checked = true;
        if (options.tab && state === 'focus') copy.querySelectorAll('[role="tab"]').forEach(tab => tab.setAttribute('aria-selected', String(tab === target)));
        if (options.selected && state === 'focus') { copy.classList.add('is-active'); copy.setAttribute('aria-pressed','true'); }
        if (options.value && state === 'focus') target.value = options.value;
        if (state !== 'normal') {
          for (let element = target; element && element !== branch.parentElement; element = element.parentElement) {
            if (state === 'hover') element.dataset.kitHover = '';
            else element.dataset.kitFocusWithin = '';
            if (element === branch) break;
          }
          if (state === 'focus' && !options.selected && !options.checked && !options.openOnFocus && !options.tab) { target.dataset.kitFocus = ''; target.dataset.kitFocusVisible = ''; }
        }
        cell.append(branch); row.append(cell);
      }
      gallery.append(row);
    }
    document.body.append(gallery); status.remove(); sourceFrame?.remove();
    for (const url of config.scripts || []) await new Promise((resolve,reject) => { const script=document.createElement('script');script.src=url;script.onload=resolve;script.onerror=reject;document.body.append(script); });
    // Ссылки в витрине показывают состояния; переход на страницу доступен по ссылке источника.
    gallery.addEventListener('click', event => { if (event.target.closest('a')) event.preventDefault(); });
    gallery.querySelectorAll('form').forEach(form => form.addEventListener('submit',event=>event.preventDefault()));
    await document.fonts.ready;
    document.body.dataset.previewReady = kind;
  } catch (error) {
    sourceFrame?.remove(); status.textContent = 'Не удалось загрузить компоненты: ' + error.message;
  }
})();
