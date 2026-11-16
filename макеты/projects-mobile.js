(() => {
  const mobile = window.matchMedia('(max-width: 767px)');

  function createToggle(label, controls) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mobile-filter-toggle';
    button.setAttribute('aria-controls', controls);
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = `<span>${label}</span><span class="drawer-chevron" aria-hidden="true"></span>`;
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
    const systemsContent = document.createElement('div');
    const categories = createDrawer('filter-drawer', 'projects-categories', 'Категории', categoryContent);
    const systems = createDrawer('product-drawer', 'projects-systems', 'Системы', systemsContent);
    const categoryToggle = createToggle('Категории', categories.drawer.id);
    const systemsToggle = createToggle('Системы', systems.drawer.id);

    function closeAll({ focusToggle = null } = {}) {
      categories.drawer.classList.remove('is-open');
      systems.drawer.classList.remove('is-open');
      categories.drawer.setAttribute('aria-hidden', 'true');
      systems.drawer.setAttribute('aria-hidden', 'true');
      categoryToggle.setAttribute('aria-expanded', 'false');
      systemsToggle.setAttribute('aria-expanded', 'false');
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
    systemsToggle.addEventListener('click', () => openDrawer(systems.drawer, systemsToggle));
    categories.close.addEventListener('click', () => closeAll({ focusToggle: categoryToggle }));
    systems.close.addEventListener('click', () => closeAll({ focusToggle: systemsToggle }));

    controls.append(categoryToggle, systemsToggle);
    panel.append(controls, categories.drawer, systems.drawer);
    closeAll();

    function syncLayout() {
      closeAll();
      if (mobile.matches) {
        filterGroups.forEach(group => categoryContent.append(group));
        systemsContent.append(chips);
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
      else if (systems.drawer.classList.contains('is-open')) closeAll({ focusToggle: systemsToggle });
    });
    mobile.addEventListener('change', syncLayout);
    syncLayout();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupFilters, { once: true });
  else setupFilters();
})();
