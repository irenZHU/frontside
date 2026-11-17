(() => {
  const mobile = window.matchMedia('(max-width: 767px)');

  function createToggle(label, controls) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mobile-filter-toggle';
    button.setAttribute('aria-controls', controls);
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', label);
    button.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 7h3m6 0h9M3 17h9m6 0h3"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/></svg>';
    return button;
  }

  function createDrawer(className, id, title, content) {
    const drawer = document.createElement('section');
    const inner = document.createElement('div');
    const head = document.createElement('div');
    const heading = document.createElement('strong');
    const close = document.createElement('button');

    drawer.className = className;
    drawer.id = id;
    drawer.setAttribute('aria-label', title);
    inner.className = `${className}__inner`;
    head.className = 'mobile-drawer__head';
    heading.textContent = title;
    close.type = 'button';
    close.className = 'mobile-drawer__close';
    close.setAttribute('aria-label', `Закрыть: ${title}`);
    head.append(heading, close);
    inner.append(head, content);
    drawer.append(inner);
    return { drawer, close };
  }

  function setupFilters() {
    const layout = document.querySelector('.projects-page .projects__layout');
    const sidebar = layout?.querySelector(':scope > .sidebar');
    const catalog = layout?.querySelector(':scope > .catalog');
    const filterGroups = sidebar ? [...sidebar.querySelectorAll(':scope > .filter-group')] : [];
    const chips = catalog?.querySelector('.product-chips');
    const statusBar = catalog?.querySelector('.filter-status-bar');
    if (!layout || !sidebar || !catalog || !filterGroups.length || !chips || !statusBar) return;

    // Возвращаем исходные узлы при смене ширины: выбор и обработчики сохраняются.
    const categoryAnchor = document.createComment('Категории на десктопе');
    const systemsAnchor = document.createComment('Системы на десктопе');
    const statusAnchor = document.createComment('Выбранные фильтры на десктопе');
    sidebar.insertBefore(categoryAnchor, filterGroups[0]);
    chips.before(systemsAnchor);
    statusBar.before(statusAnchor);

    const panel = document.createElement('div');
    panel.className = 'mobile-filter-panel';
    panel.setAttribute('aria-label', 'Фильтры проектов');
    const controls = document.createElement('div');
    controls.className = 'mobile-filter-controls';

    const categoryContent = document.createElement('div');
    const categories = createDrawer('filter-drawer', 'projects-categories', 'Категории', categoryContent);
    const categoryToggle = createToggle('Фильтр по категориям', categories.drawer.id);
    const actions = document.createElement('div');
    actions.className = 'mobile-drawer__actions';
    const apply = document.createElement('button');
    apply.type = 'button';
    apply.className = 'mobile-drawer__apply';
    apply.textContent = 'Применить';
    actions.append(apply);
    categories.drawer.append(actions);
    apply.addEventListener('click', () => closeAll({ focusToggle: categoryToggle }));

    function closeAll({ focusToggle = null } = {}) {
      categories.drawer.classList.remove('is-open');
      categories.drawer.setAttribute('aria-hidden', 'true');
      categoryToggle.setAttribute('aria-expanded', 'false');
      focusToggle?.focus();
    }
    function openDrawer(drawer, toggle) {
      const open = !drawer.classList.contains('is-open');
      closeAll();
      if (open) {
        drawer.classList.add('is-open');
        drawer.setAttribute('aria-hidden', 'false');
        toggle.setAttribute('aria-expanded', 'true');
        drawer.querySelector('.mobile-drawer__close').focus();
      }
    }

    categoryToggle.addEventListener('click', () => openDrawer(categories.drawer, categoryToggle));
    categories.close.addEventListener('click', () => closeAll({ focusToggle: categoryToggle }));

    controls.append(categoryToggle);
    panel.append(controls, categories.drawer);
    closeAll();

    function syncLayout() {
      closeAll();
      if (mobile.matches) {
        filterGroups.forEach(group => categoryContent.append(group));
        controls.append(chips);
        panel.append(statusBar);
        layout.insertBefore(panel, sidebar);
        document.documentElement.dataset.projectsMobileDrawers = 'ready';
      } else {
        filterGroups.forEach(group => categoryAnchor.before(group));
        systemsAnchor.before(chips);
        statusAnchor.before(statusBar);
        panel.remove();
        delete document.documentElement.dataset.projectsMobileDrawers;
      }
    }

    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      if (categories.drawer.classList.contains('is-open')) closeAll({ focusToggle: categoryToggle });
    });
    mobile.addEventListener('change', syncLayout);
    syncLayout();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupFilters, { once: true });
  else setupFilters();
})();
