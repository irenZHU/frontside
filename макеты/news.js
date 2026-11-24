(() => {
  'use strict';
  const topics = [['all','Все'],['objects','Объекты'],['products','Продукты и технологии'],['events','События'],['company','Компания']];
  const size = 6;
  const $ = selector => document.querySelector(selector);
  const grid = $('#news-grid'), count = $('#news-count');
  const empty = $('#news-empty'), error = $('#news-error'), loading = $('#news-loading'), pagination = $('#news-pagination');
  let entries = [];
  const arrow = direction => `<svg class="fs-arrow${direction ? ' fs-arrow--'+direction : ''}" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M.4.5 19.1 18.3M2.9 19.2h16.85M18.9 4.3v9.4"/></svg>`;
  const text = value => String(value).replace(/(^|[\s«(])(а|в|во|и|к|ко|о|об|от|с|со|у|на|по|из|за|до|не|но|для|при|без|под|над|про|или) +/giu,'$1$2\u00a0');
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const copy = value => escape(text(value));
  const isoDate = value => {
    const input = String(value || '').trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(input)) return input.slice(0,10);
    const parts = input.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    return parts ? `${parts[3]}-${parts[2]}-${parts[1]}` : '';
  };
  const dateLabel = value => new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(value+'T12:00:00Z'));
  const href = value => {
    const url = new URL(value,location.href);
    if (!['http:','https:'].includes(url.protocol)) throw new Error('Unsupported URL');
    return escape(url.href);
  };
  const categoryKey = value => topics.find(([key,label]) => value === key || value === label)?.[0] || 'company';
  const categoryLabel = key => topics.find(t => t[0] === key)[1];
  const meta = entry => {
    const eventEnd = entry.eventEndDate || entry.eventDate;
    const past = entry.category === 'events' && eventEnd && new Date(eventEnd+'T23:59:59') < new Date();
    return `<div class="news-meta"><span class="news-meta__category">${copy(categoryLabel(entry.category))}</span><time datetime="${entry.date}">${escape(dateLabel(entry.date))}</time>${past ? '<span class="news-status">Завершено</span>' : ''}</div>`;
  };
  function readState() {
    const q = new URLSearchParams(location.search);
    return {page:Math.max(1,parseInt(q.get('page'),10) || 1)};
  }
  function stateURL(state) {
    const url = new URL(location.href);
    for (const key of ['page']) {
      const value = state[key];
      if (value === 'all' || (key === 'page' && value === 1)) url.searchParams.delete(key);
      else url.searchParams.set(key,value);
    }
    url.searchParams.delete('year');
    url.searchParams.delete('category');
    url.hash = '';
    return url.pathname + url.search;
  }
  function render(scroll = false) {
    const state = readState();
    const filtered = entries;
    const pages = Math.max(1,Math.ceil(filtered.length / size));
    state.page = Math.min(state.page,pages);
    history.replaceState(null,'',stateURL(state));
    const selected = filtered.slice((state.page - 1) * size,state.page * size);
    grid.innerHTML = selected.map(entry => {
      const poster = entry.imageFit === 'contain' || entry.url.includes('my-na-forume-light-industrial-7-0');
      const media = entry.image ? `<div class="news-card__photo${poster?' news-card__photo--poster':''}"><img src="${href(entry.image)}" alt="${copy(entry.imageAlt || '')}" style="object-position:${escape(entry.imagePosition || 'center')}" loading="lazy" decoding="async"></div>` : '';
      return `<article class="news-card"><a class="news-card__link" href="${href(entry.url)}">${media}${meta(entry)}<h3>${copy(entry.title)}</h3><span class="news-card__read">Читать новость</span></a></article>`;
    }).join('');
    count.textContent = filtered.length ? `${(state.page-1)*size+1}–${Math.min(state.page*size,filtered.length)} из ${filtered.length}` : 'Найдено: 0';
    empty.hidden = filtered.length > 0;
    pagination.hidden = pages < 2;
    const pageLink = (n,label,content) => `<a href="${escape(stateURL({...state,page:n}))}" data-news-page="${n}" aria-label="${label}"${n===state.page?' aria-current="page"':''}>${content}</a>`;
    const visiblePages = (pages <= 7 ? Array.from({length:pages},(_,i)=>i+1) : [...new Set([1,state.page-1,state.page,state.page+1,pages])]).filter(n=>n>0&&n<=pages).sort((a,b)=>a-b);
    let links = state.page > 1 ? pageLink(state.page-1,'Предыдущая страница',arrow('left')) : '';
    visiblePages.forEach((n,i) => { if (i && n-visiblePages[i-1]>1) links += '<span aria-hidden="true">…</span>'; links += pageLink(n,`Страница ${n}`,n); });
    if (state.page<pages) links += pageLink(state.page+1,'Следующая страница',arrow('right'));
    pagination.innerHTML = links;
    if (scroll) { $('#news-archive').scrollIntoView({behavior:'instant',block:'start'}); $('#news-archive').focus({preventScroll:true}); }
  }
  function navigate(changes,scroll=false) {
    const state = {...readState(),...changes};
    history.pushState(null,'',stateURL(state)); render(scroll);
  }
  pagination.addEventListener('click',event => {
    const link = event.target.closest('[data-news-page]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault(); navigate({page:Number(link.dataset.newsPage)},true);
  });
  window.addEventListener('popstate',() => { if (entries.length) render(); });
  async function load() {
    loading.hidden = false; error.hidden = true;
    $('#news-archive').setAttribute('aria-busy','true');
    try {
      const response = await fetch('news-data.json?v=20261124-2');
      if (!response.ok) throw new Error('News unavailable');
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Invalid news data');
      const seen = new Set();
      entries = data.filter(entry => entry && entry.title && entry.url && isoDate(entry.date)).map(entry => ({...entry,date:isoDate(entry.date),eventDate:isoDate(entry.eventDate),eventEndDate:isoDate(entry.eventEndDate),category:categoryKey(entry.category)})).filter(entry => {
        href(entry.url); if (entry.image) href(entry.image);
        if (seen.has(entry.url)) return false; seen.add(entry.url); return true;
      }).sort((a,b)=>b.date.localeCompare(a.date));
      if (!entries.length) throw new Error('No published news');
       render();
    } catch (e) {
      grid.replaceChildren(); pagination.hidden = true; empty.hidden = true; count.textContent = ''; error.hidden = false;
    } finally { loading.hidden = true; $('#news-archive').setAttribute('aria-busy','false'); }
  }
  $('#news-retry').addEventListener('click',load);
  load();
})();
