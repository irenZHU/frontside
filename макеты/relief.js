/* Живой рельеф ARTVISION.
   Рисует фасадные панели с тиснёным рисунком и освещает их «солнцем»:
   карта высот → нормали → освещение. Рисунок сквозной (идёт через все панели),
   линии плавно уходят в ноль и не доходят до края панели — как в технологии. */

(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

  /* ---------- рисунки (в координатах всего полотна, поэтому «сквозные») ---------- */

  const PATTERNS = {
    // плавные волны, как топографические линии
    waves(ctx, W, H, s, o) {
      const gap = (o.gap || 34) * s;
      ctx.lineWidth = 2.4 * s;
      ctx.lineCap = 'round';
      for (let y0 = -H * 0.4; y0 < H * 1.4; y0 += gap) {
        ctx.beginPath();
        const ph = y0 / (900 * s);
        for (let x = -40 * s; x <= W + 40 * s; x += 6 * s) {
          const y = y0
            + 120 * s * Math.sin(x / (520 * s) + ph * 2.2)
            + 22 * s * Math.sin(x / (170 * s) - ph * 3.1)
            + 0.18 * (x - W / 2) * Math.sin(ph);
          x <= -40 * s ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    },
    // капли, как на паттерне FRONTTOP: контур-канавка, кончик вверх,
    // ряды парами со сдвигом на полшага, между парами — промежуток
    drops(ctx, W, H, s) {
      const w = 32 * s, h = 44 * s;             // размер капли
      const stepX = 56 * s, stepY = 46 * s;     // шаг в ряду и между рядами пары
      const band = 2 * stepY + 34 * s;          // пара рядов + промежуток
      ctx.lineWidth = 2.6 * s;
      ctx.lineJoin = 'round';
      const drop = (x, y) => {
        ctx.beginPath();
        ctx.moveTo(x, y - h / 2);
        ctx.bezierCurveTo(x + w * 0.12, y - h * 0.22, x + w / 2, y - h * 0.08, x + w / 2, y + h * 0.16);
        ctx.arc(x, y + h * 0.16, w / 2, 0, Math.PI);
        ctx.bezierCurveTo(x - w / 2, y - h * 0.08, x - w * 0.12, y - h * 0.22, x, y - h / 2);
        ctx.stroke();
      };
      for (let by = -band; by < H + band; by += band) {
        for (let r = 0; r < 2; r++) {
          const y = by + r * stepY, off = r * stepX / 2;
          for (let x = -stepX + off; x < W + stepX; x += stepX) drop(x, y);
        }
      }
    },
    // ромбы-кольца, как на FRONTTOP из слайдера клиента
    diamonds(ctx, W, H, s) {
      const step = 120 * s, r = 34 * s;
      ctx.lineWidth = 3 * s;
      ctx.lineJoin = 'round';
      for (let row = -1, y = 0; y < H + step; row++, y = row * step * 0.62) {
        const off = (row % 2) * step / 2;
        for (let x = -step + off; x < W + step; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, y - r); ctx.lineTo(x + r * 1.3, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r * 1.3, y); ctx.closePath();
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x, y, r * 0.28, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    },
  };

  /* ---------- построение карты высот и нормалей ---------- */

  function build(canvas, o) {
    const s = o.scale;
    const W = Math.max(2, Math.round(canvas.clientWidth * s));
    const H = Math.max(2, Math.round(canvas.clientHeight * s));
    canvas.width = W; canvas.height = H;

    const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };

    // 1. рисунок на белом
    const pc = mk(), p = pc.getContext('2d');
    p.fillStyle = '#fff'; p.fillRect(0, 0, W, H);
    p.strokeStyle = '#000';
    PATTERNS[o.pattern](p, W, H, s, o);

    // 2. панели: швы глубокие, поверхность — белая (высокая)
    const hc = mk(), h = hc.getContext('2d');
    h.fillStyle = '#5a5a5a'; h.fillRect(0, 0, W, H);
    const pw = o.panelW * s, ph = o.panelH * s, seam = o.seam * s, m = o.margin * s, fade = o.fade * s;
    const rows = Math.ceil(H / ph) + 1, cols = Math.ceil(W / pw) + 1;
    const ox = -((pw * cols - W) / 2), oy = -((ph * rows - H) / 2);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = ox + c * pw + seam / 2, y = oy + r * ph + seam / 2, w = pw - seam, hh = ph - seam;
        h.fillStyle = '#fff'; h.fillRect(x, y, w, hh);
        // тиснение — только внутри панели, с отступом от края
        h.save();
        h.beginPath(); h.rect(x + m, y + m * 0.6, w - 2 * m, hh - 1.2 * m); h.clip();
        h.globalCompositeOperation = 'multiply';
        h.globalAlpha = o.groove;        // глубина канавки
        h.drawImage(pc, 0, 0);
        h.restore();
        // плавный «выход в ноль» у краёв панели
        const edge = (x0, y0, x1, y1, rx, ry, rw, rh) => {
          const g = h.createLinearGradient(x0, y0, x1, y1);
          g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)');
          h.fillStyle = g; h.fillRect(rx, ry, rw, rh);
        };
        const ix = x + m, iy = y + m * 0.6, iw = w - 2 * m, ih = hh - 1.2 * m;
        edge(ix, 0, ix + fade, 0, ix, iy, fade, ih);
        edge(ix + iw, 0, ix + iw - fade, 0, ix + iw - fade, iy, fade, ih);
        edge(0, iy, 0, iy + fade * 0.5, ix, iy, iw, fade * 0.5);
        edge(0, iy + ih, 0, iy + ih - fade * 0.5, ix, iy + ih - fade * 0.5, iw, fade * 0.5);
      }
    }

    // 3. сглаживание — рельеф мягкий, без «ступенек»
    const blur = (src, px) => { const c = mk(), x = c.getContext('2d'); x.filter = `blur(${px}px)`; x.drawImage(src, 0, 0); return x.getImageData(0, 0, W, H).data; };
    const hd = blur(hc, 1.5 * s + 0.6);
    const gd = blur(hc, 7 * s + 2);     // для свечения LED

    const N = W * H;
    const hgt = new Float32Array(N), glow = new Float32Array(N);
    // свечение LED: узкое — в самой канавке, широкое — ореол вокруг
    for (let i = 0; i < N; i++) { hgt[i] = hd[i * 4] / 255; glow[i] = (1 - hgt[i]) * 1.5 + (1 - gd[i * 4] / 255) * 1.1; }

    const nx = new Float32Array(N), ny = new Float32Array(N), nz = new Float32Array(N), alb = new Float32Array(N);
    const k = o.depth;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        const l = hgt[y * W + Math.max(0, x - 1)], r = hgt[y * W + Math.min(W - 1, x + 1)];
        const u = hgt[Math.max(0, y - 1) * W + x], d = hgt[Math.min(H - 1, y + 1) * W + x];
        let ax = (l - r) * k, ay = (u - d) * k, az = 1;
        const len = Math.hypot(ax, ay, az);
        nx[i] = ax / len; ny[i] = ay / len; nz[i] = az / len;
        // альбедо: металл чуть светлее к верху, швы темнее
        alb[i] = (0.93 + 0.05 * (1 - y / H)) * (0.78 + 0.22 * Math.min(1, hgt[i] * 1.4));
      }
    }
    return { W, H, N, nx, ny, nz, alb, glow, ctx: canvas.getContext('2d'), img: canvas.getContext('2d').createImageData(W, H) };
  }

  /* ---------- освещение ---------- */

  // время суток → параметры света. hour: 6…24
  function lightAt(hour) {
    const day = clamp((hour - 6) / 15, 0, 1);              // 06:00 → 21:00
    const night = clamp((hour - 20.5) / 2, 0, 1);          // 20:30 → 22:30
    const az = (180 + 180 * day) * Math.PI / 180;          // утром слева, днём сверху, вечером справа
    const el = (9 + 52 * Math.sin(Math.PI * day)) * Math.PI / 180;
    const warm = 1 - Math.sin(Math.PI * day);              // тёплый свет утром и вечером
    return {
      L: [Math.cos(el) * Math.cos(az), Math.cos(el) * Math.sin(az), Math.sin(el)],
      color: mix3([255, 252, 248], [255, 222, 192], warm),
      intensity: lerp(lerp(0.46, 0.56, warm), 0.0, night),
      ambient: lerp(lerp(0.56, 0.5, warm), 0.07, night),
      ambColor: mix3([0.97, 0.98, 1.0], [0.32, 0.4, 0.75], night),
      led: night,
    };
  }

  function render(R, lp, base, ledColor, o) {
    const { N, nx, ny, nz, alb, glow, img } = R, out = img.data;
    const [Lx, Ly, Lz] = lp.L;
    let hx = Lx, hy = Ly, hz = Lz + 1; const hl = Math.hypot(hx, hy, hz); hx /= hl; hy /= hl; hz /= hl;
    const lc = lp.color, I = lp.intensity, A = lp.ambient, ac = lp.ambColor, led = lp.led;
    const neutral = o && o.neutral, gain = (o && o.gain) || 1;
    // яркость ровной поверхности (нормаль к зрителю) — от неё считаем отклонение
    let fsp = hz; fsp = fsp * fsp; fsp = fsp * fsp; fsp = fsp * fsp; fsp *= 0.16 * I;
    for (let i = 0, j = 0; i < N; i++, j += 4) {
      const d = nx[i] * Lx + ny[i] * Ly + nz[i] * Lz;
      const diff = d > 0 ? d : 0;
      let sp = nx[i] * hx + ny[i] * hy + nz[i] * hz; sp = sp > 0 ? sp : 0; sp = sp * sp; sp = sp * sp; sp = sp * sp; sp *= 0.16 * I;
      const a = alb[i];
      const g = led ? glow[i] * led : 0;
      out[j]     = base[0] * a * (A * ac[0] + diff * I * lc[0] / 255) + sp * lc[0] + g * ledColor[0];
      out[j + 1] = base[1] * a * (A * ac[1] + diff * I * lc[1] / 255) + sp * lc[1] + g * ledColor[1];
      out[j + 2] = base[2] * a * (A * ac[2] + diff * I * lc[2] / 255) + sp * lc[2] + g * ledColor[2];
      if (neutral) {
        // только светотень канавок: 128 = «без изменений» в режиме overlay
        out[j]     = 128 + gain * (out[j]     - base[0] * a * (A * ac[0] + Lz * I * lc[0] / 255) - fsp * lc[0]);
        out[j + 1] = 128 + gain * (out[j + 1] - base[1] * a * (A * ac[1] + Lz * I * lc[1] / 255) - fsp * lc[1]);
        out[j + 2] = 128 + gain * (out[j + 2] - base[2] * a * (A * ac[2] + Lz * I * lc[2] / 255) - fsp * lc[2]);
      }
      out[j + 3] = 255;
    }
    R.ctx.putImageData(img, 0, 0);
  }

  /* ---------- публичный интерфейс ---------- */

  window.Relief = function (canvas, opts) {
    const o = Object.assign({
      pattern: 'waves', panelW: 1180, panelH: 360, seam: 3, margin: 40, fade: 120, groove: 0.62,
      depth: 4.2, scale: 0.7, base: [246, 247, 249], ledColor: [255, 236, 214],
    }, opts);
    let R = null, hour = o.hour || 9;
    const draw = () => { if (R) render(R, lightAt(hour), o.base, o.ledColor, o); };
    const rebuild = () => { R = build(canvas, o); draw(); };
    rebuild();
    let t; window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(rebuild, 200); });
    return {
      setHour(h) { hour = h; draw(); },
      get hour() { return hour; },
    };
  };

  window.Relief.format = h => {
    const hh = Math.floor(h) % 24, mm = Math.floor((h - Math.floor(h)) * 60);
    return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
  };
})();
