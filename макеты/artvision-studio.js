(() => {
  const scene = document.getElementById('panelScene');
  const artwork = document.getElementById('reliefArtwork');
  const facadeArt = document.getElementById('facadeArt');
  const runnerFacade = window.getComputedStyle(facadeArt).backgroundImage;
  const depthRange = document.getElementById('depthRange');
  const scaleRange = document.getElementById('scaleRange');
  const depthOutput = document.getElementById('depthOutput');
  const depthReadout = document.getElementById('depthReadout');
  const scaleOutput = document.getElementById('scaleOutput');
  const colourName = document.getElementById('colourName');
  const toast = document.getElementById('toast');
  let rotation = 0;
  let mirrored = false;
  let through = false;
  let gridColumns = 5;
  let gridRows = 3;

  const artGroups = ['runner','wave','orbit','monogram'].map(id => document.getElementById(`${id}Art`));
  const transformArt = () => {
    const scale = Number(scaleRange.value) / 100;
    artwork.style.transform = `rotate(${rotation}deg) scale(${mirrored ? -scale : scale}, ${scale})`;
    facadeArt.style.transform = `rotate(${rotation}deg) scaleX(${mirrored ? -1 : 1})`;
    facadeArt.style.opacity = through ? '.72' : '.56';
  };
  const setArt = art => {
    const customArt = document.getElementById('customArt');
    if (customArt) customArt.hidden = true;
    artGroups.forEach(group => { group.hidden = group.id !== `${art}Art`; });
    document.querySelectorAll('.drawing-choice').forEach(button => button.classList.toggle('is-selected', button.dataset.art === art));
    facadeArt.dataset.art = art;
    const artMaps = {
      waves:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 720 360'%3E%3Cg fill='none' stroke='%23d1d2cf' stroke-width='4' stroke-linecap='round'%3E%3Cpath d='M-25 88C88 22 169 150 282 84S475 19 586 89 746 146 775 96M-30 151C80 86 170 211 286 145S474 82 588 152 741 213 778 159M-30 214C83 150 173 275 289 208S475 146 591 216 742 272 780 221M-30 279C86 214 177 339 292 273S476 210 594 281 742 336 782 286'/%3E%3C/g%3E%3C/svg%3E\")",
      orbit:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 720 360'%3E%3Cg fill='none' stroke='%23d1d2cf' stroke-width='4' stroke-linecap='round'%3E%3Cellipse cx='359' cy='184' rx='225' ry='67' transform='rotate(-22 359 184)'/%3E%3Cellipse cx='359' cy='184' rx='184' ry='52' transform='rotate(23 359 184)'/%3E%3Ccircle cx='359' cy='184' r='93'/%3E%3C/g%3E%3C/svg%3E\")",
      monogram:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 720 360'%3E%3Cg fill='none' stroke='%23d1d2cf' stroke-width='4' stroke-linecap='round'%3E%3Cpath d='M176 105 314 266 444 105M274 105 364 216 541 104M247 292h265M188 67h344M138 326h438'/%3E%3C/g%3E%3C/svg%3E\")"
    };
    facadeArt.style.backgroundImage = artMaps[art] || runnerFacade;
  };
  const updateDepth = () => {
    const value = Number(depthRange.value).toFixed(1).replace('.', ',');
    depthOutput.textContent = `${value} мм`;
    depthReadout.textContent = `${value} мм`;
    const amount = Number(depthRange.value) / 1.8;
    artwork.style.filter = `drop-shadow(${amount}px ${amount}px 0 rgba(0,0,0,.68)) drop-shadow(${-amount}px ${-amount}px 0 rgba(255,255,255,.3))`;
  };
  const updateScale = () => { scaleOutput.textContent = `${scaleRange.value}%`; transformArt(); };
  const setGrid = () => {
    document.getElementById('panelGrid').style.backgroundSize = `${100 / Math.max(2, gridColumns - 1)}% 100%,100% ${100 / Math.max(2, gridRows - 1)}%`;
    document.getElementById('facadeGrid').style.backgroundSize = `${100 / gridColumns}% 100%,100% ${100 / gridRows}%`;
    document.getElementById('gridLabel').textContent = `Сетка: ${gridColumns} × ${gridRows} панели`;
  };
  const flash = message => { toast.textContent = message; toast.classList.add('is-visible'); window.setTimeout(() => toast.classList.remove('is-visible'), 2200); };

  document.querySelectorAll('.swatch').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.swatch').forEach(item => item.classList.remove('is-selected'));
    button.classList.add('is-selected'); scene.dataset.finish = button.dataset.finish; colourName.textContent = button.dataset.label;
  }));
  document.querySelectorAll('.drawing-choice').forEach(button => button.addEventListener('click', () => setArt(button.dataset.art)));
  depthRange.addEventListener('input', updateDepth);
  scaleRange.addEventListener('input', updateScale);
  document.getElementById('rotateButton').addEventListener('click', () => { rotation = (rotation + 15) % 360; document.getElementById('rotationLabel').textContent = `${rotation}°`; transformArt(); });
  document.getElementById('mirrorButton').addEventListener('click', () => { mirrored = !mirrored; transformArt(); });
  document.getElementById('throughToggle').addEventListener('click', event => { through = !through; event.currentTarget.setAttribute('aria-pressed', String(through)); transformArt(); });
  document.getElementById('gridButton').addEventListener('click', () => { gridColumns = gridColumns === 5 ? 4 : gridColumns === 4 ? 6 : 5; gridRows = gridRows === 3 ? 4 : 3; setGrid(); });
  document.getElementById('resetButton').addEventListener('click', () => { depthRange.value = 1.8; scaleRange.value = 100; rotation = 0; mirrored = false; through = false; document.getElementById('rotationLabel').textContent = '0°'; document.getElementById('throughToggle').setAttribute('aria-pressed','false'); document.querySelector('[data-finish=silver]').click(); setArt('runner'); updateDepth(); updateScale(); flash('Параметры сброшены'); });
  document.getElementById('exportButton').addEventListener('click', () => flash('Эскиз подготовлен для сохранения'));
  document.getElementById('uploadButton').addEventListener('click', () => document.getElementById('svgInput').click());
  document.getElementById('svgInput').addEventListener('change', event => { const file = event.target.files[0]; if (!file) return; if (!file.type.includes('svg')) { document.getElementById('uploadHint').textContent = 'Пожалуйста, выберите файл SVG.'; return; } const reader = new FileReader(); reader.onload = () => { const data = `url("data:image/svg+xml,${encodeURIComponent(reader.result)}")`; facadeArt.style.backgroundImage = data; let customArt = document.getElementById('customArt'); if (!customArt) { customArt = document.createElementNS('http://www.w3.org/2000/svg', 'g'); customArt.id = 'customArt'; customArt.setAttribute('fill', 'none'); customArt.setAttribute('stroke', 'currentColor'); customArt.setAttribute('stroke-linecap', 'round'); customArt.setAttribute('stroke-linejoin', 'round'); artwork.append(customArt); } const parsed = new DOMParser().parseFromString(reader.result, 'image/svg+xml'); customArt.innerHTML = parsed.documentElement.innerHTML; customArt.hidden = false; artGroups.forEach(group => group.hidden = true); document.querySelectorAll('.drawing-choice').forEach(button => button.classList.remove('is-selected')); document.getElementById('uploadHint').textContent = `${file.name} загружен в предпросмотр.`; flash('SVG добавлен'); }; reader.readAsText(file); });
  updateDepth(); updateScale(); setGrid();
})();
