/* Конфигуратор ARTVISION — «Примерь на фасад».
   Весь функционал конфигуратора клиента (frontside.ru/artvision-page):
   9 цветов RAL, 6 рисунков + гладкая поверхность, загрузка своего SVG,
   поворот на 90°, отражение по горизонтали и вертикали, сквозной узор,
   раскладка фасада по горизонтали (2–8) и вертикали (1–8), отблеск за курсором.
   Добавлено: свет «утро / день / вечер» и вид «фасад / панель вблизи». */
(function () {
  const COLORS = [
    { hex: '#ECECE7', ral: 'RAL 9003', name: 'Сигнальный белый' },
    { hex: '#E6D9BD', ral: 'RAL 1015', name: 'Светлая слоновая кость' },
    { hex: '#D3D8D8', ral: 'RAL 7035', name: 'Светло-серый' },
    { hex: '#8F8F8F', ral: 'RAL 9006', name: 'Бело-алюминиевый' },
    { hex: '#4B5054', ral: 'RAL 7024', name: 'Графитовый серый' },
    { hex: '#1F3855', ral: 'RAL 5011', name: 'Стально-синий' },
    { hex: '#0E4232', ral: 'RAL 6005', name: 'Зелёный мох' },
    { hex: '#59191F', ral: 'RAL 3005', name: 'Винно-красный' },
    { hex: '#442F29', ral: 'RAL 8017', name: 'Шоколадно-коричневый' },
  ];
  const P = 'img/patterns/';
  const PATTERNS = [
    { name: 'Гладкая', url: '' },
    { name: 'Ноты', url: P + 'resurs1.svg' },
    { name: 'Ромбы', url: P + 'resurs2.svg', zoom: .42 },
    { name: 'Круги', url: P + 'resurs3.svg' },
    { name: 'Камни', url: P + 'resurs4.svg', zoom: .6 },
    { name: 'Мозаика', url: P + 'resurs5.svg', zoom: .5 },
    { name: 'Бегущий человек', url: P + 'man.svg' },
  ];
  // свет: направление тени/блика тиснения, небо и тон сцены
  const LIGHT = {
    morning: { wl: 'rgba(255,200,150,.55)', wr: 'rgba(20,30,50,.55)', side: .34, dx: -1, dy: .8, sky: 'linear-gradient(180deg,#e9d8cf 0%,#eef0f2 62%,#f4f3f1 62.1%,#ebeae8 100%)', tint: 'linear-gradient(90deg,rgba(255,190,140,.45),rgba(255,190,140,0) 70%)', shade: 'linear-gradient(100deg,rgba(255,226,200,.35),rgba(0,0,0,.1))' },
    day:     { wl: 'rgba(0,0,0,0)', wr: 'rgba(0,0,0,0)', side: .18, dx: 0, dy: 1, sky: 'linear-gradient(180deg,#cfdced 0%,#e9eef4 62%,#f4f5f6 62.1%,#eceeef 100%)', tint: 'transparent', shade: 'linear-gradient(180deg,rgba(255,255,255,.22),rgba(0,0,0,.06))' },
    evening: { wl: 'rgba(20,30,50,.55)', wr: 'rgba(255,180,120,.6)', side: 0, front: .22, dx: 1, dy: .8, sky: 'linear-gradient(180deg,#d9cfe0 0%,#efe6e2 62%,#f2efec 62.1%,#e7e3df 100%)', tint: 'linear-gradient(270deg,rgba(255,170,110,.5),rgba(255,170,110,0) 70%)', shade: 'linear-gradient(260deg,rgba(255,214,180,.35),rgba(0,0,0,.12))' },
  };

  const state = {
    color: COLORS[0], pattern: PATTERNS[0], custom: null,
    rotation: 0, flipH: false, flipV: false,
    continuous: false, cols: 2, rows: 3, scale: 1,
    light: 'day', view: 'facade',
    raw: {}, urls: { dark: '', light: '' },
  };

  /* ---------- разметка ---------- */
  const arrow = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 15 15 5M7 5h8v8"/></svg>';
  const el = document.createElement('div');
  el.className = 'kf';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-label', 'Конфигуратор ARTVISION');
  el.innerHTML = `
    <div class="kf-backdrop" data-close></div>
    <div class="kf-win">
      <!-- справа: информация и настройки (как карточка офиса у Air) -->
      <aside class="kf-side">
        <div class="kf-top">
          <div class="kf-brand"><b>ARTVISION</b><span class="kf-cap">Архитектурное тиснение</span></div>
          <button class="kf-close kf-sq" aria-label="Закрыть"><svg width="12" height="12" viewBox="0 0 12 12" stroke="#000" stroke-width="1.3"><path d="M1 1l10 10M11 1 1 11"/></svg></button>
        </div>

        <div class="kf-block">
          <div class="kf-line"><span class="kf-cap">Цвет</span><span class="kf-cap kf-cap--ink" id="kfColorName"></span></div>
          <div class="kf-colors" id="kfColors"></div>
        </div>

        <div class="kf-block">
          <div class="kf-line"><span class="kf-cap">Рисунок</span><span class="kf-cap kf-cap--ink" id="kfPatName"></span></div>
          <div class="kf-patterns" id="kfPats"></div>
          <input type="file" accept=".svg,image/svg+xml" id="kfFile" hidden>
          <p class="kf-note">Свой рисунок — SVG из контурных линий без заливки</p>
        </div>

        <div class="kf-block kf-block--row">
          <div class="kf-tools" id="kfTools">
            <button class="kf-sq kf-sq--wide" id="kfRot" title="Повернуть на 90°"><svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M13 8a5 5 0 1 1-1.5-3.6M13 2v3h-3"/></svg><span id="kfRotVal">0°</span></button>
            <button class="kf-sq" id="kfFlipH" title="Отразить по горизонтали"><svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M9 2v14" stroke-dasharray="2 2"/><path d="M6.5 5 2 9l4.5 4V5zM11.5 5 16 9l-4.5 4"/></svg></button>
            <button class="kf-sq" id="kfFlipV" title="Отразить по вертикали"><svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 9h14" stroke-dasharray="2 2"/><path d="M5 6.5 9 2l4 4.5H5zM5 11.5 9 16l4-4.5"/></svg></button>
          </div>
          <label class="kf-check"><input type="checkbox" id="kfCont"><span class="kf-box"></span><span class="kf-cap kf-cap--ink">Сквозной узор</span></label>
        </div>

        <div class="kf-block kf-scale" id="kfScaleBox">
          <div class="kf-line"><span class="kf-cap">Масштаб рисунка</span><span class="kf-cap kf-cap--val" id="kfScaleVal">100%</span></div>
          <input type="range" id="kfScale" min="50" max="250" step="10" value="100" aria-label="Масштаб рисунка">
        </div>

        <div class="kf-block kf-block--row">
          <div class="kf-step"><span class="kf-cap">По горизонтали</span><div class="kf-stepper"><button class="kf-sq" data-d="col:-1">−</button><output id="kfCols">2</output><button class="kf-sq" data-d="col:1">+</button></div></div>
          <div class="kf-step"><span class="kf-cap">По вертикали</span><div class="kf-stepper"><button class="kf-sq" data-d="row:-1">−</button><output id="kfRows">3</output><button class="kf-sq" data-d="row:1">+</button></div></div>
        </div>

        <div class="kf-foot">
          <div class="kf-headline" id="kfSummary"></div>
          <button class="kf-cta" id="kfCta"><span>Обсудить проект</span><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M7 1v12M1 7h12"/></svg></button>
        </div>
      </aside>

      <!-- слева: фасад здания; виды — вертикальными вкладками, как у Air -->
      <div class="kf-stage" id="kfStage">
        <nav class="kf-tabs" aria-label="Вид">
          <button data-view="facade" class="is-active"><span>Фасад здания</span></button>
          <button data-view="closeup"><span>Панель вблизи</span></button>
        </nav>
        <div class="kf-view">
          <div class="kf-scene" data-scene="facade">
            <div class="kf-photo" id="kfPhoto">
              <canvas id="kfCanvas" width="2528" height="1696"></canvas>
              <div class="kf-reliefs" id="kfReliefs"><div class="kf-plane" id="kfPlaneL"></div><div class="kf-plane" id="kfPlaneR"></div></div>
              <div class="kf-wall-light kf-wall-light--l"></div><div class="kf-wall-light kf-wall-light--r"></div>
              <div class="kf-photo-tint"></div>
            </div>
          </div>
          <div class="kf-scene" data-scene="closeup" hidden>
            <div class="kf-closeup"><div id="kfClose"></div><p class="kf-cap" id="kfCap"></p></div>
          </div>
          <div class="kf-seg" role="group" aria-label="Освещение">
            <button data-light="morning">Утро</button><button data-light="day" class="is-active">День</button><button data-light="evening">Вечер</button>
          </div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(el);
  // SVG-фильтры тиснения: карта высот (размытая канавка) → освещение → нейтральный серый 50% = без изменений
  const fx = (id, blur, scale) => `
    <filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation="${blur}" result="h"/>
      <feComponentTransfer in="h" result="hi"><feFuncA type="linear" slope="-1" intercept="1"/></feComponentTransfer>
      <feDiffuseLighting in="hi" surfaceScale="${scale}" diffuseConstant="1" lighting-color="#fff" result="lit">
        <feDistantLight class="kf-light-src" azimuth="250" elevation="38"/>
      </feDiffuseLighting>
      <feComponentTransfer in="lit">
        <feFuncR class="kf-light-lvl" type="linear" slope="1.6" intercept="-.48"/>
        <feFuncG class="kf-light-lvl" type="linear" slope="1.6" intercept="-.48"/>
        <feFuncB class="kf-light-lvl" type="linear" slope="1.6" intercept="-.48"/>
      </feComponentTransfer>
    </filter>`;
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  defs.setAttribute('width', 0); defs.setAttribute('height', 0); defs.style.position = 'absolute';
  defs.innerHTML = fx('kfEmboss', .7, 1.1) + fx('kfEmbossBig', 1.1, 1.1);
  el.appendChild(defs);

  const $ = s => el.querySelector(s);
  const stage = $('#kfStage');

  /* цвета */
  $('#kfColors').innerHTML = COLORS.map((c, i) =>
    `<button class="kf-color${i === 0 ? ' is-active' : ''}" style="background:${c.hex}" title="${c.ral} · ${c.name}" data-i="${i}"></button>`).join('');
  /* рисунки */
  function renderPats() {
    const list = state.custom ? [...PATTERNS, state.custom] : PATTERNS;
    $('#kfPats').innerHTML = list.map((p, i) =>
      `<button class="kf-pat${p === state.pattern ? ' is-active' : ''}" data-i="${i}" title="${p.name}">
         ${p.url ? `<img src="${thumbs[p.url] || ''}" data-src="${p.url}" alt="">` : ''}<span>${p.name}</span></button>`).join('') +
      `<button class="kf-pat kf-pat--upload" id="kfUp" title="Загрузить свой SVG"><svg viewBox="0 0 22 22" fill="none" stroke="#1d1d1d" stroke-width="1.4"><path d="M11 15V4M6 9l5-5 5 5M3 18h16"/></svg><span>Ваш SVG</span></button>`;
  }
  // превью рисунка: один элемент крупно — квадратный фрагмент полосы, линия потолще
  const thumbs = {};
  async function makeThumb(p) {
    if (!p.url || thumbs[p.url]) return;
    const raw = p.raw || await (await fetch(p.url)).text();
    const doc = new DOMParser().parseFromString(raw, 'image/svg+xml'), svg = doc.documentElement;
    const vb = (svg.getAttribute('viewBox') || '0 0 320 75').split(/[\s,]+/).map(Number);
    const wide = vb[2] / vb[3] > 2;                              // полоса панели — берём квадрат с краю
    const size = wide ? vb[3] * (p.zoom || 1) : Math.max(vb[2], vb[3]);   // zoom — мелкий рисунок крупнее
    const x = wide ? vb[0] + vb[3] * 0.05 : vb[0] - (size - vb[2]) / 2, y = wide ? vb[1] + (vb[3] - size) / 2 : vb[1] - (size - vb[3]) / 2;
    svg.setAttribute('viewBox', `${x} ${y} ${size} ${size}`);
    svg.removeAttribute('width'); svg.removeAttribute('height');
    svg.querySelectorAll('style').forEach(st => st.remove());
    svg.querySelectorAll('path,line,polyline,polygon,circle,rect,ellipse').forEach(el2 => {
      el2.removeAttribute('class'); el2.setAttribute('fill', 'none'); el2.setAttribute('stroke', '#1d1d1d');
      el2.setAttribute('stroke-width', size / 45); el2.setAttribute('stroke-linecap', 'round'); el2.setAttribute('stroke-linejoin', 'round');
    });
    thumbs[p.url] = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(doc)], { type: 'image/svg+xml' }));
    const img = el.querySelector(`.kf-pat img[data-src="${p.url}"]`);
    if (img) img.src = thumbs[p.url];
  }
  renderPats();
  PATTERNS.forEach(makeThumb);

  /* ---------- тиснение: из SVG делаем два варианта — тень и блик ---------- */
  async function getRaw(url) {
    if (!state.raw[url]) state.raw[url] = await (await fetch(url)).text();
    return state.raw[url];
  }
  function variant(raw, stroke, width = .8) {
    const doc = new DOMParser().parseFromString(raw, 'image/svg+xml');
    const svg = doc.documentElement;
    const vb = (svg.getAttribute('viewBox') || '0 0 320 75').split(/[\s,]+/).map(Number);
    const sw = Math.max(vb[2], vb[3]) / 320 * width;         // толщина линии в долях ширины панели
    svg.querySelectorAll('style').forEach(s => s.remove());
    svg.querySelectorAll('path,line,polyline,polygon,circle,rect,ellipse').forEach(p => {
      p.removeAttribute('class');
      p.setAttribute('fill', 'none'); p.setAttribute('stroke', stroke);
      p.setAttribute('stroke-width', sw); p.setAttribute('stroke-linecap', 'round');
    });
    svg.setAttribute('preserveAspectRatio', 'none');
    // поворот и отражение — группой вокруг центра (в картинке-фоне CSS-трансформации SVG не работают)
    const g = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
    const cx = vb[0] + vb[2] / 2, cy = vb[1] + vb[3] / 2;
    g.setAttribute('transform', `translate(${cx} ${cy}) rotate(${state.rotation}) scale(${state.flipH ? -1 : 1} ${state.flipV ? -1 : 1}) translate(${-cx} ${-cy})`);
    [...svg.childNodes].forEach(n => { if (n.nodeName !== 'defs') g.appendChild(n); });
    svg.appendChild(g);
    return URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(doc)], { type: 'image/svg+xml' }));
  }
  async function buildUrls() {
    ['dark', 'light'].forEach(k => state.urls[k] && URL.revokeObjectURL(state.urls[k]));
    state.urls = { dark: '', light: '' };
    if (!state.pattern.url) return;
    const raw = state.pattern.raw || await getRaw(state.pattern.url);
    // для тиснения — карта высот: широкая чёрная канавка, из неё SVG-фильтр строит свет и тень
    state.curRaw = raw; state.vcache = {};
    state.urls = { dark: 'on', light: '' };
  }

  /* ---------- реалистичный фасад ---------- */
  // фото 2528 × 1696; стены размечены по фото (координаты в пикселях фото)
  const PHOTO = { w: 2528, h: 1696, src: 'img/kf-building.png' };
  // углы стен сняты с пикселей фото: угол здания x=1732, верх 390, низ 1440
  const WALL_L = [[152, 861], [1732, 390], [1732, 1440], [152, 1386]];      // длинная стена со входом
  const WALL_R = [[1732, 390], [2528, 900], [2528, 1372], [1732, 1440]];    // боковая стена
  const PHYS = { L: 3.15, R: 3.25 };                                         // длина/высота стен (по точкам схода)
  const GLASS  = [[636, 866], [862, 862], [862, 1418], [636, 1418]];        // стеклянный вход с рамой — не красим
  const photo = { img: new Image(), base: null, lum: null, mask: null, ready: false };

  function homography(w, h, q) {
    const src = [[0, 0], [w, 0], [w, h], [0, h]], A = [], b = [];
    for (let i = 0; i < 4; i++) {
      const [x, y] = src[i], [u, v] = q[i];
      A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u);
      A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v);
    }
    for (let c = 0; c < 8; c++) {
      let p = c; for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
      [A[c], A[p]] = [A[p], A[c]]; [b[c], b[p]] = [b[p], b[c]];
      for (let r = 0; r < 8; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let k = c; k < 8; k++) A[r][k] -= f * A[c][k]; b[r] -= f * b[c]; }
    }
    const m = b.map((v, i) => v / A[i][i]);
    return `matrix3d(${m[0]},${m[3]},0,${m[6]},${m[1]},${m[4]},0,${m[7]},0,0,1,0,${m[2]},${m[5]},0,1)`;
  }
  function polyCanvas(polys, w, h, holes = []) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d'), k = w / PHOTO.w;
    const path = pts => { x.beginPath(); pts.forEach(([a, b2], i) => i ? x.lineTo(a * k, b2 * k) : x.moveTo(a * k, b2 * k)); x.closePath(); };
    x.fillStyle = '#fff'; polys.forEach(pp => { path(pp); x.fill(); });
    x.globalCompositeOperation = 'destination-out'; holes.forEach(pp => { path(pp); x.fill(); });
    return c;
  }
  function initPhoto() {
    photo.img.onload = () => {
      const W = PHOTO.w, H = PHOTO.h;
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const cx = cv.getContext('2d'); cx.drawImage(photo.img, 0, 0);
      photo.base = cx.getImageData(0, 0, W, H);
      // ---- без растительности: клумба → плитка тротуара, цоколь дорисован, ствол дерева справа убран ----
      { const d0 = photo.base.data;
        const wallBot = x => 1386 + (1440 - 1386) * (x - 152) / (1732 - 152);   // низ длинной стены
        const bedBot = x => 1418 + (x - 700) * 0.0467;                          // край клумбы у тротуара
        const cp = (x, y, sx, sy) => { const a2 = (y * W + x) * 4, b2 = (sy * W + sx) * 4; d0[a2] = d0[b2]; d0[a2 + 1] = d0[b2 + 1]; d0[a2 + 2] = d0[b2 + 2]; };
        for (let x = 152; x < 1745; x++) {
          const yb = Math.round(wallBot(x)), yp = yb + 14, ye = Math.round(Math.max(bedBot(x), yp + 6)) + 12;   // с запасом — без бурой кромки
          for (let y = yb - 70; y < yp; y++) {                                   // цоколь: тёмная полоса под стеной
            if (y < yb) continue;
            const j2 = (y * W + x) * 4; d0[j2] = 72; d0[j2 + 1] = 69; d0[j2 + 2] = 65;
          }
          for (let y = yp; y < ye; y++) {                                        // клумба → ровная бетонная отмостка
            const t = (y - yp) / Math.max(1, ye - yp), j2 = (y * W + x) * 4;
            const joint = (Math.round(x) % 118) < 2 ? -14 : 0;                    // редкие швы плит
            const n = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 % 1) * 5;  // лёгкое зерно бетона
            const base = 166 - 10 * t + joint + n;
            d0[j2] = base + 3; d0[j2 + 1] = base; d0[j2 + 2] = base - 6;
          }
        }
        // деревья справа: стволы и лунки (тёмное узкое или бурое на тротуаре) закрашиваем
        // интерполяцией по строке между соседними чистыми пикселями
        for (let y = 1360; y < 1620; y++) {
          const bad = new Uint8Array(W);
          for (let x = 2110; x < W; x++) {
            const bot = 1372 + (1440 - 1372) * (2528 - x) / (2528 - 1732);
            if (y < bot + 14) continue;
            const q = (y * W + x) * 4, r = d0[q], g = d0[q + 1], b = d0[q + 2], L = (r + g + b) / 3;
            const Lx = k => { const q2 = (y * W + Math.min(W - 1, Math.max(0, k))) * 4; return (d0[q2] + d0[q2 + 1] + d0[q2 + 2]) / 3; };
            const narrowDark = L < Lx(x - 18) - 30 && L < Lx(x + 18) - 30;        // ствол — узкий и темнее соседей
            const pit = r > b + 25 && L < 140 && y < 1500;                         // бурая лунка с листвой
            const hole = L < 100 && y < 1500 && Lx(x - 60) > 125 && Lx(x + 60) > 125;   // тёмная приствольная решётка на светлой плитке
            if (narrowDark || pit || hole) bad[x] = 1;
          }
          for (let x = 2111; x < W; x++) {                                        // расширяем на 3 px — без ореолов
            if (bad[x] !== 1) continue; for (let k = -3; k <= 3; k++) if (x + k >= 2110 && x + k < W && !bad[x + k]) bad[x + k] = 2;   // только от исходных
          }
          let x = 2110;
          while (x < W) {
            if (!bad[x]) { x++; continue; }
            let e = x; while (e < W && bad[e]) e++;
            const l = Math.max(2100, x - 1), rr = Math.min(W - 1, e);
            for (let k = x; k < e; k++) {
              const t = (k - l) / Math.max(1, rr - l), a2 = (y * W + k) * 4, la = (y * W + l) * 4, ra = (y * W + rr) * 4;
              for (let c = 0; c < 3; c++) d0[a2 + c] = d0[la + c] * (1 - t) + d0[ra + c] * t + (Math.random() - .5) * 6;
            }
            x = e;
          }
        }
        // растения перед стеклянным входом: правую часть стекла продолжаем полосой стекла выше (вертикальные стойки сохраняются)
        for (let y = 1236; y < 1352; y++) for (let x = 760; x < 866; x++) cp(x, y, x, 1205 + ((y - 1236) % 30));
        // вход доходит до земли: низ двери продолжаем полосой двери выше, внизу — тёмный порог
        for (let y = 1336; y < 1418; y++) for (let x = 634; x < 866; x++) cp(x, y, x, 1286 + ((y - 1336) % 48));
        for (let y = 1408; y < 1418; y++) for (let x = 634; x < 866; x++) { const j2 = (y * W + x) * 4; d0[j2] = 58; d0[j2 + 1] = 62; d0[j2 + 2] = 68; }
      }
      const walls = polyCanvas([WALL_L, WALL_R], W, H, [GLASS]).getContext('2d').getImageData(0, 0, W, H).data;
      // маска стены: внутри контура стен и «серый металл» (кусты, деревья, небо — цветные, их не трогаем)
      const d = photo.base.data, N = W * H, m = new Uint8ClampedArray(N), lum = new Float32Array(N);
      // 1) «чистый» металл: внутри стен, нейтральный, не тёмный — по нему строим модель освещения стены
      const ref0 = new Uint8ClampedArray(N);
      let sum = 0, cnt = 0;
      for (let i = 0, j = 0; i < N; i++, j += 4) {
        const r = d[j], g = d[j + 1], b = d[j + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b);
        lum[i] = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        const sat = mx ? (mx - mn) / mx : 0;
        if (walls[j + 3] > 128 && sat < 0.14 && mx > 140) { ref0[i] = 1; sum += lum[i]; cnt++; }
      }
      // 2) освещение стены — плавное: размытие яркости только по чистому металлу (швы, точки, полосы исчезают)
      // свет каждой стены — гладкая поверхность (многочлен 2-й степени по чистому металлу):
      // без пятен там, где раньше были кусты, и без перетекания через угол
      const side = polyCanvas([WALL_L], W, H).getContext('2d').getImageData(0, 0, W, H).data;
      const smooth = new Float32Array(N);
      for (const wantL of [true, false]) {
        const A = Array.from({ length: 6 }, () => new Float64Array(6)), B = new Float64Array(6);
        const f = (x, y) => { const u = x / W, v = y / H; return [1, u, v, u * u, u * v, v * v]; };
        for (let y = 0; y < H; y += 3) for (let x = 0; x < W; x += 3) {
          const i = y * W + x; if (!ref0[i] || (side[i * 4 + 3] > 128) !== wantL || (y > 1300 && x < 1720)) continue;   // низ длинной стены (бывшие кусты) не учитываем
          const ph2 = f(x, y); for (let a1 = 0; a1 < 6; a1++) { B[a1] += ph2[a1] * lum[i]; for (let b1 = 0; b1 < 6; b1++) A[a1][b1] += ph2[a1] * ph2[b1]; }
        }
        for (let c = 0; c < 6; c++) { let p2 = c; for (let r = c + 1; r < 6; r++) if (Math.abs(A[r][c]) > Math.abs(A[p2][c])) p2 = r;
          [A[c], A[p2]] = [A[p2], A[c]]; [B[c], B[p2]] = [B[p2], B[c]];
          for (let r = 0; r < 6; r++) if (r !== c) { const k = A[r][c] / A[c][c]; for (let q = c; q < 6; q++) A[r][q] -= k * A[c][q]; B[r] -= k * B[c]; } }
        const co = B.map((v, k) => v / A[k][k]);
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          const i = y * W + x; if (walls[i * 4 + 3] < 128 || (side[i * 4 + 3] > 128) !== wantL) continue;
          const ph2 = f(x, y); let v = 0; for (let k = 0; k < 6; k++) v += co[k] * ph2[k]; smooth[i] = v;
        }
      }
      // 3) что перекрашиваем: вся стена, кроме растений у земли и дерева справа
      //    (растение = заметно отличается от модели стены или цветное)
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = y * W + x, j = i * 4; if (walls[j + 3] < 128) continue;
        const zone = false;                                        // растительность убрана — красим всю стену
        if (zone) {
          const r = d[j], g = d[j + 1], b = d[j + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b), sat = mx ? (mx - mn) / mx : 0;
          const dark = mx < 95 && y < 1290 && x < 2150;                          // тёмные швы над кустами — это стена
          const el2 = (cx, cy, rx, ry) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1;
          const rock = el2(1415, 1418, 82, 48) || el2(400, 1378, 46, 28);                 // камни — не трогаем
          const pale = ((mx > 135 && sat < .35) || (mx > 95 && y < 1235)) && y < 1265 && x < 2150;   // верхушки сухой травы на фоне стены — убираем
          const green = g > r + 6 && g > b + 6;
          const stem = !green && !rock && y < 1335 && x < 2150 && mx > 70;                                       // сухие стебли (не зелёные кусты) — убираем
          if (rock) continue;
          if (!dark && !pale && !stem && (Math.abs(lum[i] - smooth[i]) > .07 || sat > .16)) continue;
        }
        m[i] = 255;
      }
      // растения — только крупные пятна: тонкие полоски (швы, отдельные травинки) красим как стену
      { const isP = new Uint8Array(N);
        for (let i = 0; i < N; i++) if (!m[i] && walls[i * 4 + 3] > 128) isP[i] = 1;
        const er = new Uint8Array(N), R2 = 4;
        for (let y = R2; y < H - R2; y++) for (let x = R2; x < W - R2; x++) { const i = y * W + x; if (!isP[i]) continue;
          let ok = 1; for (let k = -R2; k <= R2 && ok; k++) if (!isP[i + k] || !isP[i + k * W]) ok = 0; er[i] = ok; }
        const keep = new Uint8Array(N);
        for (let y = R2; y < H - R2; y++) for (let x = R2; x < W - R2; x++) { const i = y * W + x; if (!er[i]) continue;
          for (let dy = -R2; dy <= R2; dy++) for (let dx = -R2; dx <= R2; dx++) keep[i + dy * W + dx] = 1; }
        for (let i = 0; i < N; i++) if (isP[i] && !keep[i]) m[i] = 255;
      }
      // швы и креплёж у земли: тонкие (металл с обеих сторон) — тоже стена; горизонтальные «щели» — только тёмные
      const near = (x, y, dx, dy) => { for (let k = 1; k <= 9; k++) { const xx = x + dx * k, yy = y + dy * k; if (xx < 0 || yy < 0 || xx >= W || yy >= H) return false; if (m[yy * W + xx]) return true; } return false; };
      for (let pass2 = 0; pass2 < 2; pass2++) {
        const add = [];
        for (let y = 1170; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
          const i = y * W + x, j = i * 4; if (m[i] || walls[j + 3] < 128) continue;
          const r = d[j], g = d[j + 1], b = d[j + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b), sat = mx ? (mx - mn) / mx : 0;
          if (sat > .22) continue;
          if (near(x, y, 0, -1) && near(x, y, 0, 1)) add.push(i);
          else if (mx < 130 && near(x, y, -1, 0) && near(x, y, 1, 0)) add.push(i);
        }
        add.forEach(i => m[i] = 255);
      }
      photo.mask = m; photo.lum = smooth; photo.ref = sum / cnt;
      // небо без облаков: всё выше линии крыши, светлое и не цветное (не листва) — ровный градиент
      const roofY = x => x <= 1732 ? 861 + (390 - 861) * (x - 152) / (1732 - 152) : 390 + (900 - 390) * (x - 1732) / (2528 - 1732);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (y >= roofY(Math.max(152, x)) - 2) continue;
        const j = (y * W + x) * 4, r = d[j], g = d[j + 1], b = d[j + 2];
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b), sat = mx ? (mx - mn) / mx : 0;
        const t = y / 1100;
        d[j] = 150 + 70 * t; d[j + 1] = 188 + 45 * t; d[j + 2] = 232 + 12 * t;
      }
      // та же маска — для слоёв тиснения и света (уменьшенная, с мягким краем)
      const mc = document.createElement('canvas'); mc.width = W / 2; mc.height = H / 2;
      const tmp = document.createElement('canvas'); tmp.width = W; tmp.height = H;
      const tid = tmp.getContext('2d').createImageData(W, H);
      for (let i = 0; i < N; i++) { tid.data[i * 4 + 3] = m[i]; }
      tmp.getContext('2d').putImageData(tid, 0, 0);
      const mx2 = mc.getContext('2d'); mx2.filter = 'blur(1px)'; mx2.drawImage(tmp, 0, 0, W / 2, H / 2);
      const maskURL = mc.toDataURL('image/png');
      const wallURL = side => polyCanvas([side], W / 4, H / 4, [GLASS]).toDataURL();
      el.querySelectorAll('#kfReliefs, .kf-wall-light').forEach(n => { n.style.webkitMaskImage = n.style.maskImage = `url(${maskURL})`; });
      const lL = el.querySelector('.kf-wall-light--l'), lR = el.querySelector('.kf-wall-light--r');
      // свет по стенам: маска стены ∩ маска металла (две маски через composite)
      lL.style.maskImage = lL.style.webkitMaskImage = `url(${maskURL}), url(${wallURL(WALL_L)})`;
      lR.style.maskImage = lR.style.webkitMaskImage = `url(${maskURL}), url(${wallURL(WALL_R)})`;
      [lL, lR].forEach(n => { n.style.maskComposite = 'intersect'; n.style.webkitMaskComposite = 'source-in'; });
      photo.ready = true; window.kfPhoto = photo;   // для проверки
      recolor(); renderFacade();
    };
    photo.img.src = PHOTO.src;
  }
  // перекраска стен: цвет RAL × светотень фото — тени, швы и блики сохраняются
  function recolor() {
    if (!photo.ready) return;
    const out = new ImageData(new Uint8ClampedArray(photo.base.data), PHOTO.w, PHOTO.h);
    const o = out.data, m = photo.mask, L = photo.lum, ref = photo.ref;
    const h = state.color.hex, cr = parseInt(h.slice(1, 3), 16), cg = parseInt(h.slice(3, 5), 16), cb = parseInt(h.slice(5, 7), 16);
    for (let i = 0, j = 0; i < m.length; i++, j += 4) {
      if (!m[i]) continue;
      const k = L[i] / ref;                                        // относительная освещённость точки
      const spec = Math.max(0, k - 1.05) * 90;                     // блики остаются светлыми и на тёмном цвете
      o[j] = cr * k + spec; o[j + 1] = cg * k + spec; o[j + 2] = cb * k + spec;
    }
    el.querySelector('#kfCanvas').getContext('2d').putImageData(out, 0, 0);
  }
  function planeHTML(cols, rows, aspect) {
    let h = '';
    for (let r = 0; r < rows; r++) for (let c = 0; c < Math.ceil(cols - 1e-6); c++) {
      const bg = bgFor(r, c, cols, rows, aspect), on = state.urls.dark ? ' is-on' : '';
      h += `<div class="kf-tile"><div class="kf-emboss${on}" style="${bg ? bg(state.urls.dark) : ''}"></div></div>`;
    }
    return h;
  }
  function renderFacade() {
    // размытие канавки и толщина швов — в тех же «пикселях фото» при любой раскладке
    // плоскость каждой стены рисуется в «пикселях фото» (1 px плоскости ≈ 1 px фото):
    // иначе длинную стену браузер растягивает вдвое, и рельеф на ней размыт
    const sk = state.scale;
    const f = el.querySelector('#kfEmboss feGaussianBlur'); if (f) f.setAttribute('stdDeviation', Math.max(.35, .6 * sk).toFixed(2));
    const fl = el.querySelector('#kfEmboss feDiffuseLighting'); if (fl) fl.setAttribute('surfaceScale', Math.max(.6, 1.1 * sk).toFixed(2));
    const f2 = el.querySelector('#kfEmbossBig feGaussianBlur'); if (f2) f2.setAttribute('stdDeviation', Math.max(.4, .9 * state.scale).toFixed(2));
    el.style.setProperty('--kf-seam', '2.5px');
    const colsR = state.cols * PHYS.R / PHYS.L;
    const tw = 1580 / state.cols;                                // ширина панели в px фото (длинная стена ≈ 1580 px)
    const th = tw * state.cols / (PHYS.L * state.rows) * (1);    // высота панели по реальной пропорции стены
    const aspect = tw / th;
    [['#kfPlaneL', WALL_L, state.cols, tw], ['#kfPlaneR', WALL_R, colsR, 796 / colsR]].forEach(([id, quad, cols, w1]) => {
      const h1 = w1 / aspect;
      const pl = $(id), w = cols * w1, h = state.rows * h1;
      pl.style.width = w + 'px'; pl.style.height = h + 'px';
      pl.style.gridTemplateColumns = `repeat(${Math.ceil(cols - 1e-6)}, ${w1}px)`;
      pl.style.gridTemplateRows = `repeat(${state.rows}, ${h1}px)`;
      pl.style.transform = homography(w, h, quad);
      pl.innerHTML = planeHTML(cols, state.rows, aspect);
    });
  }
  function fitPhoto() {
    const st = $('.kf-view').getBoundingClientRect(), ph = $('#kfPhoto');
    const k = Math.max(st.width / PHOTO.w, st.height / PHOTO.h);
    ph.style.transform = `translate(${(st.width - PHOTO.w * k) * 0.72}px, ${(st.height - PHOTO.h * k) * 0.62}px) scale(${k})`;
  }
  addEventListener('resize', fitPhoto);

  /* ---------- отрисовка ---------- */
  // вариант рисунка под конкретное растяжение: толщина канавки на фасаде всегда одинаковая
  function urlFor(sx) {
    const k = sx.toFixed(3) + ':' + state.scale;
    // толщина в пикселях фото не зависит от раскладки: плитка плоскости = стена / число панелей
    // канавка масштабируется вместе с рисунком: толщина ∝ масштабу (state.scale)
    if (!state.vcache[k + ':' + state.cols]) state.vcache[k + ':' + state.cols] = variant(state.curRaw, '#000', .55 * state.scale * (state.cols / 2) / sx);
    return state.vcache[k + ':' + state.cols];
  }
  function bgFor(r, c, cols, rows, aspect = 4) {
    if (!state.urls.dark) return '';
    // масштаб: рисунок крупнее или мельче; мельче — повторяется (background-repeat в CSS)
    // пропорции рисунка сохраняются (без растягивания в овалы): ширина по масштабу, высота — по пропорции SVG
    const S = state.scale, sx = state.continuous ? cols * S : S;
    const vb = state.vb || [0, 0, 320, 75];
    const sy = sx * aspect * vb[3] / vb[2];                 // высота рисунка в долях высоты панели (по реальной пропорции панели)
    const p = (i, k) => Math.abs(k - 1) < 1e-6 ? 0 : (state.continuous ? i : (k - 1) / 2) / (k - 1) * 100;
    const size = `${sx * 100}% ${sy * 100}%`;
    const pos = `${p(c, sx)}% ${p(r, sy)}%`;
    const url = urlFor(sx);
    return () => `background-image:url('${url}');background-size:${size};background-position:${pos}`;
  }
  function panelHTML(r, c) {
    const bg = bgFor(r, c, state.cols, state.rows);
    const on = state.urls.dark ? ' is-on' : '';
    return `<div class="kf-panel">
      <img class="kf-tex" src="img/patterns/panel.webp" alt="">
      <div class="kf-shade"></div>
      <div class="kf-emboss${on}" style="${bg ? bg(state.urls.dark) : ''}"></div>
      <div class="kf-glare"></div></div>`;
  }
  function render() {
    renderFacade();
    // вблизи — одна панель, всегда целиком (без сквозного режима)
    const keep = state.continuous; state.continuous = false;
    $('#kfClose').innerHTML = panelHTML(0, 0);
    state.continuous = keep;
    // подписи
    $('#kfColorName').textContent = `${state.color.ral} · ${state.color.name}`;
    $('#kfPatName').textContent = state.pattern.name;
    $('#kfCap').textContent = `${state.color.ral} · ${state.pattern.name}${state.rotation ? ' · поворот ' + state.rotation + '°' : ''}`;
    $('#kfCols').textContent = state.cols; $('#kfRows').textContent = state.rows;
    el.querySelector('[data-d="col:-1"]').disabled = state.cols <= 2;
    el.querySelector('[data-d="col:1"]').disabled = state.cols >= 8;
    el.querySelector('[data-d="row:-1"]').disabled = state.rows <= 1;
    el.querySelector('[data-d="row:1"]').disabled = state.rows >= 8;
    $('#kfTools').classList.toggle('is-disabled', !state.pattern.url);
    $('#kfScaleBox').classList.toggle('is-disabled', !state.pattern.url);
    $('#kfScaleVal').textContent = Math.round(state.scale * 100) + '%';
    $('#kfRotVal').textContent = state.rotation + '°';
    $('#kfFlipH').classList.toggle('is-active', state.flipH);
    $('#kfFlipV').classList.toggle('is-active', state.flipV);
    $('#kfSummary').innerHTML = `<b>${state.color.ral}</b><span>${state.color.name}</span><span>${state.pattern.name}${state.continuous ? ' · сквозной' : ''}</span><span>Раскладка ${state.cols} × ${state.rows}</span>`;
    el.querySelectorAll('.kf-panel').forEach(p => {
      p.style.setProperty('--kf-color', state.color.hex);
      p.onmousemove = e => {
        const b = p.getBoundingClientRect();
        p.style.setProperty('--mx', ((e.clientX - b.left) / b.width * 100) + '%');
        p.style.setProperty('--my', ((e.clientY - b.top) / b.height * 100) + '%');
      };
    });
  }
  function setLight(k) {
    state.light = k;
    const L = LIGHT[k];
    stage.style.setProperty('--kf-sky', L.sky);
    stage.style.setProperty('--kf-tint', L.tint);
    el.style.setProperty('--kf-dx', L.dx + 'px');
    el.style.setProperty('--kf-dy', L.dy + 'px');
    el.style.setProperty('--kf-shade', L.shade);
    el.style.setProperty('--kf-side', L.side);
    el.style.setProperty('--kf-wl', L.wl); el.style.setProperty('--kf-wr', L.wr);
    el.style.setProperty('--kf-front', L.front || 0);
    el.querySelectorAll('[data-light]').forEach(b => b.classList.toggle('is-active', b.dataset.light === k));
    // направление света для тиснения: утром слева, днём сверху, вечером справа
    const az = { morning: 200, day: 250, evening: 340 }[k], elev = 38;
    const flat = Math.sin(elev * Math.PI / 180);
    el.querySelectorAll('.kf-light-src').forEach(n => { n.setAttribute('azimuth', az); n.setAttribute('elevation', elev); });
    el.querySelectorAll('.kf-light-lvl').forEach(n => { n.setAttribute('slope', 1.25); n.setAttribute('intercept', (0.5 - 1.25 * flat).toFixed(3)); });
  }
  async function update(rebuild = true) { if (rebuild) await buildUrls(); render(); }

  /* ---------- события ---------- */
  el.addEventListener('click', async e => {
    if (e.target.hasAttribute && e.target.hasAttribute('data-close')) return close();
    const t = e.target.closest('button'); if (!t) return;
    if (t.classList.contains('kf-close')) return close();
    if (t.dataset.light) return setLight(t.dataset.light);
    if (t.dataset.view) {
      state.view = t.dataset.view;
      el.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('is-active', b === t));
      el.querySelectorAll('[data-scene]').forEach(s => s.hidden = s.dataset.scene !== state.view);
      return;
    }
    if (t.classList.contains('kf-color')) {
      state.color = COLORS[+t.dataset.i];
      el.querySelectorAll('.kf-color').forEach(b => b.classList.toggle('is-active', b === t));
      recolor();
      return update(false);
    }
    if (t.id === 'kfUp') return $('#kfFile').click();
    if (t.classList.contains('kf-pat')) {
      const list = state.custom ? [...PATTERNS, state.custom] : PATTERNS;
      state.pattern = list[+t.dataset.i];
      state.rotation = 0; state.flipH = state.flipV = false;     // как у клиента: новый рисунок — без поворотов
      state.scale = 1; $('#kfScale').value = 100;
      renderPats(); return update();
    }
    if (t.id === 'kfRot') { state.rotation = (state.rotation + 90) % 360; return update(); }
    if (t.id === 'kfFlipH') { state.flipH = !state.flipH; return update(); }
    if (t.id === 'kfFlipV') { state.flipV = !state.flipV; return update(); }
    if (t.dataset.d) {
      const [k, d] = t.dataset.d.split(':');
      if (k === 'col') state.cols = Math.min(8, Math.max(2, state.cols + +d));
      else state.rows = Math.min(8, Math.max(1, state.rows + +d));
      return update(false);
    }
    if (t.id === 'kfCta') { close(); return; }                     // этап структуры: заявку не отправляем
  });
  $('#kfScale').addEventListener('input', e => { state.scale = e.target.value / 100; update(false); });
  $('#kfCont').addEventListener('change', e => { state.continuous = e.target.checked; update(false); });
  $('#kfFile').addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return;
    if (!/\.svg$/i.test(f.name)) { alert('Загрузите файл формата SVG.'); e.target.value = ''; return; }
    const rd = new FileReader();
    rd.onload = () => {
      state.custom = { name: f.name.replace(/\.svg$/i, ''), url: URL.createObjectURL(f), raw: rd.result };
      state.pattern = state.custom; state.rotation = 0; state.flipH = state.flipV = false;
      renderPats(); makeThumb(state.custom); update(); e.target.value = '';
    };
    rd.readAsText(f);
  });

  /* ---------- открыть / закрыть ---------- */
  let lastFocus = null;
  function open() {
    lastFocus = document.activeElement;
    document.documentElement.classList.add('kf-lock');
    el.classList.add('is-open');
    requestAnimationFrame(fitPhoto); setTimeout(fitPhoto, 450);
    setTimeout(() => $('.kf-close').focus(), 50);
  }
  function close() {
    el.classList.remove('is-open');
    document.documentElement.classList.remove('kf-lock');
    if (lastFocus) lastFocus.focus();
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && el.classList.contains('is-open')) close(); });

  // кнопка «Примерить рисунок на фасад» открывает конфигуратор (когда на ней «Обсудить проект» — нет)
  const cta = document.querySelector('.hero__cta');
  if (cta) cta.addEventListener('click', e => {
    const txt = cta.querySelector('.hero__cta-text');
    if (!txt || /примерить/i.test(txt.textContent)) { e.preventDefault(); open(); }
  });
  window.kfOpen = open;                                               // для проверки

  setLight('day');
  update();
  initPhoto();
})();
