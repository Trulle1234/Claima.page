import { drawGlyph } from './glyphs.js';
import { state } from './state.js' 

let pickerCanvas, pickerCtx, entries;
let glyphPositions = [];
let selectedGlyphCp = null;

export function getSelectedGlyph() {
  return selectedGlyphCp
}

export function initPicker(fontData) {
  pickerCanvas = document.getElementById('pickerCanvas');
  pickerCtx    = pickerCanvas.getContext('2d');

  entries = Object.entries(fontData)
    .map(([hex,rows]) => [parseInt(hex,16),rows])
    .sort((a,b)=>a[0]-b[0]);

  redrawPicker();

  pickerCanvas.addEventListener('click', e => {
    const rect = pickerCanvas.getBoundingClientRect();
    const sx   = pickerCanvas.width  / rect.width;
    const sy   = pickerCanvas.height / rect.height;
    const mx   = (e.clientX - rect.left) * sx;
    const my   = (e.clientY - rect.top)  * sy;
    for (const { x,y,scale,cp } of glyphPositions) {
      if (mx >= x && mx <= x + 8*scale && my >= y && my <= y + 8*scale) {
        selectedGlyphCp = cp;
        redrawPicker();
        break;
      }
    }
  });

  window.addEventListener('resize', () => redrawPicker());
}

export function redrawPicker() {
  const chosenScale = 3;

  const cellW = 8 * chosenScale;
  const sidebarW = document.getElementById('sidebar').clientWidth;
  const maxCols = Math.max(1, Math.floor(sidebarW / cellW));
  const rows    = Math.ceil(entries.length / maxCols);
  const w       = maxCols * cellW;
  const h       = rows    * cellW;

  // **Set both the internal and CSS size**
  pickerCanvas.width       = w;
  pickerCanvas.height      = h;
  pickerCanvas.style.width = w + 'px';
  pickerCanvas.style.height= h + 'px';

  pickerCtx.fillStyle = '#000';
  pickerCtx.fillRect(0,0,w,h);

  glyphPositions = [];
  entries.forEach(([cp,rowsData], i) => {
    const col = i % maxCols, row = Math.floor(i/maxCols);
    const x = col * cellW;
    const y = row * cellW;

    drawGlyph(pickerCtx, cp, x,y, chosenScale, state.backgroundColorIndex, state.fontColorIndex);

    glyphPositions.push({ x,y,scale:chosenScale,cp });
    if (cp === selectedGlyphCp) {
      pickerCtx.strokeStyle = '#FFF';
      pickerCtx.lineWidth   = 2;
      pickerCtx.strokeRect(x-1,y-1,cellW,cellW);
    }
  });
}

