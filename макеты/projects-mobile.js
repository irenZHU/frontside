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

  function buildMobileFilters() {
    if (!mobile.matches || document.documentElement.dataset.projectsMobileDrawers === 'ready') return;

    const layout = document.querySelector('.projects-page .projects__layout');
    const sidebar = layout?.querySelector(':scope > .sidebar');
    const catalog = layout?.querySelector(':scope > .catalog');
    const filterGroups = sidebar ? [...sidebar.querySelectorAll(':scope > .filter-group')] : [];
    const chips = catalog?.querySelector('.product-chips');
    if (!layout || !sidebar || !catalog || !filterGroups.length || !chips) return;

    const panel = document.createElement('div');
    panel.className = 'mobile-filter-panel';
    panel.setAttribute('aria-label', 'Фильтры проектов');
    const controls = document.createElement('div');
    controls.className = 'mobile-filter-controls';

    const categoryContent = document.createElement('div');
    filterGroups.forEach(group => categoryContent.append(group));
    const categories = createDrawer('filter-drawer', 'projects-categories', 'Категории', categoryContent);
    const systems = createDrawer('product-drawer', 'projects-systems', 'Системы', chips);
    const categoryToggle = createToggle('Категории', categories.drawer.id);
    const systemsToggle = createToggle('Системы', systems.drawer.id);

    function closeAll({ focusToggle = null } = {}) {
      categories.drawer.classList.remove('is-open');
      systems.drawer.classList.remove('is-open');
      categoryToggle.setAttribute('aria-expanded', 'false');
      systemsToggle.setAttribute('aria-expanded', 'false');
      focusToggle?.focus();
    }
    function openDrawer(drawer, toggle, otherDrawer, otherToggle) {
      const open = !drawer.classList.contains('is-open');
      closeAll();
      if (open) {
        drawer.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
      }
      otherDrawer.classList.remove('is-open');
      otherToggle.setAttribute('aria-expanded', 'false');
    }

    categoryToggle.addEventListener('click', () => openDrawer(categories.drawer, categoryToggle, systems.drawer, systemsToggle));
    systemsToggle.addEventListener('click', () => openDrawer(systems.drawer, systemsToggle, categories.drawer, categoryToggle));
    categories.close.addEventListener('click', () => closeAll({ focusToggle: categoryToggle }));
    systems.close.addEventListener('click', () => closeAll({ focusToggle: systemsToggle }));

    controls.append(categoryToggle, systemsToggle);
    panel.append(controls, categories.drawer, systems.drawer);
    layout.insertBefore(panel, sidebar);
    document.documentElement.dataset.projectsMobileDrawers = 'ready';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildMobileFilters, { once: true });
  else buildMobileFilters();
})();
