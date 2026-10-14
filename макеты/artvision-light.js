(() => {
  const stage = document.getElementById('imageStage');
  const readout = document.getElementById('timeReadout');
  const toast = document.getElementById('toast');
  const showToast = message => { toast.textContent = message; toast.classList.add('is-visible'); setTimeout(() => toast.classList.remove('is-visible'), 2200); };
  document.querySelectorAll('[data-time]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-time]').forEach(item => item.classList.toggle('is-active', item === button));
    stage.dataset.time = button.dataset.time;
    readout.textContent = button.textContent;
  }));
  document.querySelectorAll('.colour').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.colour').forEach(item => item.classList.toggle('is-selected', item === button));
    document.getElementById('ralReadout').textContent = button.dataset.ral;
    const tints = {white:'brightness(1.33) saturate(.48)',cream:'brightness(1.16) sepia(.14) saturate(.76)',silver:'brightness(1.06) saturate(.5)',graphite:'brightness(.85) saturate(.9)',blue:'brightness(.72) sepia(.08) saturate(1.2)',burgundy:'brightness(.7) sepia(.25) saturate(1.32)'};
    stage.style.setProperty('--stage-filter', tints[button.dataset.colour]);
  }));
  document.querySelectorAll('.pattern-card').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.pattern === 'custom') { document.getElementById('svgUpload').click(); return; }
    document.querySelectorAll('.pattern-card').forEach(item => item.classList.toggle('is-selected', item === button));
    stage.dataset.pattern = button.dataset.pattern;
    document.querySelector('.pattern-overlay').style.background = 'none';
    document.querySelectorAll('.shape').forEach(shape => shape.hidden = !shape.classList.contains(`shape--${button.dataset.pattern}`));
  }));
  document.getElementById('svgUpload').addEventListener('change', event => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const overlay = document.querySelector('.pattern-overlay');
      overlay.style.background = `center / contain no-repeat url("data:image/svg+xml,${encodeURIComponent(reader.result)}")`;
      document.querySelectorAll('.shape').forEach(shape => shape.hidden = true);
      document.querySelectorAll('.pattern-card').forEach(item => item.classList.remove('is-selected'));
      document.querySelector('[data-pattern="custom"]').classList.add('is-selected');
      showToast('Ваш SVG добавлен в предпросмотр');
    };
    reader.readAsText(file);
  });
  const through = document.getElementById('throughSwitch');
  through.addEventListener('click', () => { const active = !through.classList.contains('is-active'); through.classList.toggle('is-active', active); through.setAttribute('aria-pressed', String(active)); stage.dataset.through = String(active); });
  const range = document.getElementById('stepRange');
  range.addEventListener('input', () => { document.getElementById('stepReadout').textContent = `${range.value} мм`; document.querySelector('.pattern-overlay').style.transform = `scale(${range.value / 220})`; });
  document.querySelectorAll('.view-mode button').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('.view-mode button').forEach(item => item.classList.toggle('is-active', item === button)); stage.classList.toggle('is-close', button.textContent.includes('вблизи')); }));
  document.getElementById('projectButton').addEventListener('click', () => showToast('Конфигурация добавлена в проект'));
})();
