import { refresh } from './canvas.js';
import { state } from './state.js'


export function initPalette() {
const paletteColors = [
    '#000000','#444444','#777770','#ffffff',
    '#9b0000','#ff0000','#009b00','#00ff00',
    '#9b9b00','#ffff00','#00009b','#0000ff',
    '#9b009b','#ff00ff','#009b9b','#00ffff'
  ];

  state.palette = paletteColors;

  const palette = document.getElementById('palette');
  let selected = null;
  paletteColors.forEach((c, i) => {
    const sw = document.createElement('div');
    sw.className = 'palette-swatch';
    sw.style.backgroundColor = c;
    sw.addEventListener('click', () => {
      if (selected) selected.classList.remove('palette-selected');
      sw.classList.add('palette-selected');
      selected = sw;
      state.fontColorIndex = i;
      refresh();
    });
    if (i === state.fontColorIndex) sw.classList.add('palette-selected'), selected = sw;
      palette.appendChild(sw);
  });

  const bgPalette = document.getElementById('bg-palette');
  let selectedBg = null;
  paletteColors.forEach((c, i) => {
    const sw = document.createElement('div');
    sw.className = 'palette-swatch';
    sw.style.backgroundColor = c;
    sw.addEventListener('click', () => {
      if (selectedBg) selectedBg.classList.remove('palette-selected');
      sw.classList.add('palette-selected');
      selectedBg = sw;
      state.backgroundColorIndex = i;
      refresh();
    });
    if (i === state.backgroundColorIndex) sw.classList.add('palette-selected'), selectedBg = sw;
      bgPalette.appendChild(sw);
  });
}
