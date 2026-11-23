(() => {
  // Первые два абзаца остаются видимыми; продолжение включает свои подзаголовки.
  document.querySelectorAll('.category-about__text, .subcat-about__text, .projects-seo__content').forEach((text, index) => {
    if (text.dataset.seoCollapsible) return;
    const paragraphs = [...text.children].filter(node => node.tagName === 'P');
    if (paragraphs.length <= 2) return;

    const continuation = document.createElement('div');
    continuation.className = 'seo-more__content';
    continuation.id = `seo-continuation-${index + 1}`;
    let node = paragraphs[1].nextSibling;
    while (node) {
      const next = node.nextSibling;
      continuation.append(node);
      node = next;
    }
    if (continuation.firstElementChild?.matches('h3, h4, h5, h6')) {
      continuation.classList.add('seo-more__content--headed');
    }

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'fs-link seo-more__toggle';
    toggle.textContent = 'Смотреть ещё';
    toggle.setAttribute('aria-controls', continuation.id);
    toggle.setAttribute('aria-expanded', 'false');
    continuation.hidden = true;
    text.append(continuation, toggle);
    text.dataset.seoCollapsible = 'true';

    toggle.addEventListener('click', () => {
      const collapsing = toggle.getAttribute('aria-expanded') === 'true';
      continuation.hidden = collapsing;
      toggle.setAttribute('aria-expanded', String(!collapsing));
      toggle.textContent = collapsing ? 'Смотреть ещё' : 'Свернуть';

      // После сворачивания длинного текста возвращаем блок в поле зрения при необходимости.
      const headerBottom = document.querySelector('.header')?.getBoundingClientRect().bottom || 0;
      if (collapsing && toggle.getBoundingClientRect().top < headerBottom) {
        scrollTo({ top: scrollY + text.getBoundingClientRect().top - headerBottom - 24, behavior: 'instant' });
      }
    });
  });
})();
