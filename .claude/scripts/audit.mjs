// Автоматическая проверка страницы макета по правилам бренда (макеты/бренд.css).
// node .claude/scripts/audit.mjs <url> [ширина=1440] [высота=900]
// Выводит JSON: скругления не у бейджей, нефирменные стрелки, шрифты, цвета вне палитры,
// горизонтальные переполнения, битые картинки, якорные ссылки без цели.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [url, w = '1440', h = '900'] = process.argv.slice(2);
if (!url) { console.error('usage: audit.mjs <url> [w] [h]'); process.exit(2); }
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 9900 + Math.floor(Math.random() * 500);
const profile = mkdtempSync(join(tmpdir(), 'fs-audit-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const done = code => { try { chrome.kill(); } catch {} setTimeout(() => { try { rmSync(profile, { recursive: true, force: true }); } catch {} process.exit(code); }, 300); };

const CHECK = String.raw`(async () => {
  await document.fonts.ready;
  // догрузить ленивые картинки
  for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); }
  scrollTo(0, 0); await new Promise(r => setTimeout(r, 600));
  const ARROW = 'M.4.5 19.1 18.3M2.9 19.2h16.85M18.9 4.3v9.4';
  const PALETTE = ['239,72,54','187,189,192','241,241,241','35,31,32','255,255,255','0,0,0'];
  const sel = el => (el.id ? '#' + el.id : el.tagName.toLowerCase() + [...el.classList].map(c => '.' + c).join('')).slice(0, 90);
  const isBadge = el => el.parentElement?.classList.contains('project-card__badges') || el.classList.contains('selected-filter');
  const isHead = el => el.closest('h1,h2,h3,h4,h5,h6,.idea__title,.slogan,.footer__brand,.fact__num,.project-card__details strong,.category-intro__directions strong,.category-intro__slide strong');
  const all = [...document.querySelectorAll('body *')].filter(el => !el.closest('svg') || el.tagName === 'svg');
  const out = { url: location.href, viewport: innerWidth + 'x' + innerHeight, rounded: [], foreignArrows: [], fontText: {}, fontHead: {}, offPalette: {}, overflowX: [], brokenImages: [], deadAnchors: [] };
  for (const el of all) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    if (cs.borderTopLeftRadius !== '0px' && !isBadge(el)) out.rounded.push(sel(el) + ' ' + cs.borderTopLeftRadius);
    if (el.tagName !== 'svg' && el.childNodes.length && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) {
      const fam = cs.fontFamily.split(',')[0].replace(/"/g, '');
      const bucket = isHead(el) ? out.fontHead : out.fontText;
      bucket[fam] = (bucket[fam] || 0) + 1;
    }
    for (const prop of ['color', 'backgroundColor']) {
      const m = cs[prop].match(/rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/);
      if (!m || (m[4] !== undefined && +m[4] < .99)) continue;
      const key = m[1] + ',' + m[2] + ',' + m[3];
      if (!PALETTE.includes(key)) out.offPalette[prop + ' rgb(' + key + ')'] = (out.offPalette[prop + ' rgb(' + key + ')'] || 0) + 1;
    }
    const r = el.getBoundingClientRect();
    if (r.width && r.right > document.documentElement.clientWidth + 1 && !el.closest('[class*="hero"],.idea__photos,.category-form') ) out.overflowX.push(sel(el) + ' right=' + Math.round(r.right));
  }
  for (const svg of document.querySelectorAll('a svg, button svg')) {
    const d = [...svg.querySelectorAll('path')].map(p => p.getAttribute('d')).join(' ');
    const looksArrow = /[lLhHvV]/.test(d) && svg.querySelectorAll('path').length <= 2 && !svg.closest('.burger,.footer__social,.header__search,[class*="search"]');
    if (looksArrow && !d.includes(ARROW)) out.foreignArrows.push(sel(svg.closest('a,button')) + ' d=' + d.slice(0, 40));
  }
  for (const img of document.images) if (img.complete && !img.naturalWidth) out.brokenImages.push(img.src.slice(0, 120));
  for (const a of document.querySelectorAll('a[href^="#"]')) { const id = a.getAttribute('href').slice(1); if (id && !document.getElementById(id)) out.deadAnchors.push(a.getAttribute('href')); }
  out.overflowX = out.overflowX.slice(0, 20); out.rounded = [...new Set(out.rounded)].slice(0, 30);
  return JSON.stringify(out, null, 1);
})()`;

try {
  let tabs;
  for (let i = 0; i < 60; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (tabs.length) break; } catch {} await sleep(200); }
  const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise(r => (ws.onopen = r));
  let id = 0; const pend = {};
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend[m.id]) { pend[m.id](m.result); delete pend[m.id]; } };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Emulation.setDeviceMetricsOverride', { width: +w, height: +h, deviceScaleFactor: 1, mobile: false });
  await send('Page.enable'); await send('Page.navigate', { url }); await sleep(3000);
  const res = await send('Runtime.evaluate', { expression: CHECK, returnByValue: true, awaitPromise: true });
  const v = res.result.value;
  if (!v || String(v).includes('chrome-error')) { console.error('Страница не открылась — запущен ли сервер макетов (node сервер.mjs)?'); ws.close(); done(1); }
  else { console.log(v); ws.close(); done(0); }
} catch (e) { console.error(e.message); done(1); }
