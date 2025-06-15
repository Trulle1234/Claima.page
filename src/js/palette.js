import { refresh } from './render.js';

export let fontColor = '#00ff00';
export let backgroundColor = '#000000';

export function initPalette() {
  const paletteColors = [
    '#000000','#444444','#777770','#ffffff',
    '#9b0000','#ff0000','#009b00','#00ff00',
    '#9b9b00','#ffff00','#00009b','#0000ff',
    '#9b009b','#ff00ff','#009b9b','#00ffff'
  ];

  const palette = document.getElementById('palette');
  let selected = null;
  paletteColors.forEach(c => {
    const sw = document.createElement('div');
    sw.className = 'palette-swatch';
    sw.style.backgroundColor = c;
    sw.addEventListener('click', () => {
      if (selected) selected.classList.remove('palette-selected');
      sw.classList.add('palette-selected');
      selected = sw;
      fontColor = c;
      refresh();
    });
    if (c === fontColor) sw.classList.add('palette-selected'), selected = sw;
    palette.appendChild(sw);
  });

  const bgPalette = document.getElementById('bg-palette');
  let selectedBg = null;
  paletteColors.forEach(c => {
    const sw = document.createElement('div');
    sw.className = 'palette-swatch';
    sw.style.backgroundColor = c;
    sw.addEventListener('click', () => {
      if (selectedBg) selectedBg.classList.remove('palette-selected');
      sw.classList.add('palette-selected');
      selectedBg = sw;
      backgroundColor = c;
      refresh();
    });
    if (c === backgroundColor) sw.classList.add('palette-selected'), selectedBg = sw;
    bgPalette.appendChild(sw);
  });
}
