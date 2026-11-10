// Снимки страницы макета в headless Chrome.
// node .claude/scripts/shot.mjs <url> <папка-или-префикс> [ширина=1440] [высота=900] [scrollY=0] [кадров=1|all]
// Пример: node .claude/scripts/shot.mjs http://localhost:4740/projects.html /tmp/qa/projects 1440 900 0 all
// Каждый запуск — свой порт и профиль, поэтому несколько агентов могут снимать одновременно.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

const [url, prefix, w = '1440', h = '900', y0 = '0', count = '1'] = process.argv.slice(2);
if (!url || !prefix) { console.error('usage: shot.mjs <url> <prefix> [w] [h] [scrollY] [count|all]'); process.exit(2); }
mkdirSync(dirname(prefix + '-x'), { recursive: true });

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 9400 + Math.floor(Math.random() * 500);
const profile = mkdtempSync(join(tmpdir(), 'fs-shot-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, '--hide-scrollbars', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const done = code => { try { chrome.kill(); } catch {} setTimeout(() => { try { rmSync(profile, { recursive: true, force: true }); } catch {} process.exit(code); }, 300); };

try {
  let tabs;
  for (let i = 0; i < 60; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (tabs.length) break; } catch {} await sleep(200); }
  const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise(r => (ws.onopen = r));
  let id = 0; const pend = {};
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend[m.id]) { pend[m.id](m.result); delete pend[m.id]; } };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async ex => (await send('Runtime.evaluate', { expression: ex, returnByValue: true, awaitPromise: true })).result.value;

  await send('Emulation.setDeviceMetricsOverride', { width: +w, height: +h, deviceScaleFactor: 1, mobile: false });
  await send('Page.enable');
  await send('Page.navigate', { url });
  await sleep(3000);
  const href = await ev('location.href');
  if (href.startsWith('chrome-error')) { console.error('Страница не открылась — запущен ли сервер макетов (node сервер.mjs)?'); done(1); }
  else {
    await ev('document.fonts.ready.then(()=>1)');
    const total = await ev('document.documentElement.scrollHeight');
    const max = count === 'all' ? Infinity : +count;
    let n = 0;
    for (let y = +y0; y < total && n < max; y += +h) {
      await ev(`window.scrollTo(0,${y})`); await sleep(1200);
      const r = await send('Page.captureScreenshot', { format: 'png' });
      const file = `${prefix}-${w}-${String(n++).padStart(2, '0')}.png`;
      writeFileSync(file, Buffer.from(r.data, 'base64'));
      console.log(file);
    }
    console.log(`height ${total}, shots ${n}`);
    ws.close(); done(0);
  }
} catch (e) { console.error(e.message); done(1); }
