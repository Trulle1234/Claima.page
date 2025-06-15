import { CELL_SIZE } from './render.js';
import { fontColor, backgroundColor } from './palette.js';

let pickerCanvas, pickerCtx;
let glyphPositions = [];
export let selectedGlyphCp = null;

export function initPicker(fontData) {
  pickerCanvas = document.getElementById('pickerCanvas');
  pickerCtx    = pickerCanvas.getContext('2d');
  redrawPicker(fontData);

  pickerCanvas.addEventListener('click', e => {
    const rect = pickerCanvas.getBoundingClientRect();
    const sx   = pickerCanvas.width  / rect.width;
    const sy   = pickerCanvas.height / rect.height;
    const mx   = (e.clientX - rect.left) * sx;
    const my   = (e.clientY - rect.top)  * sy;
    for (const { x,y,scale,cp } of glyphPositions) {
      if (mx >= x && mx <= x + 8*scale && my >= y && my <= y + 8*scale) {
        selectedGlyphCp = cp;
        redrawPicker(fontData);
        break;
      }
    }
  });

  window.addEventListener('resize', () => redrawPicker(fontData));
}

export function redrawPicker(fontData) {
  const chosenScale = 3;
  const entries = Object.entries(fontData)
    .map(([hex,rows]) => [parseInt(hex,16),rows])
    .sort((a,b)=>a[0]-b[0]);

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
    const x = col * cellW, y = row * cellW;

    // draw background cell
    pickerCtx.fillStyle = backgroundColor;
    pickerCtx.fillRect(x,y,cellW,cellW);

    // draw glyph
    pickerCtx.fillStyle = fontColor;
    drawGlyph(pickerCtx, rowsData, x,y,chosenScale);

    glyphPositions.push({ x,y,scale:chosenScale,cp });
    if (cp === selectedGlyphCp) {
      pickerCtx.strokeStyle = '#FFF';
      pickerCtx.lineWidth   = 2;
      pickerCtx.strokeRect(x-1,y-1,cellW+2,cellW+2);
    }
  });
}

export function drawGlyph(ctx, rows, x, y, scale=1) {
  for (let r=0; r<8; r++){
    const rowByte = rows[r];
    for (let b=0; b<8; b++){
      if (rowByte & (1 << (7-b))) {
        ctx.fillRect(x + b*scale, y + r*scale, scale, scale);
      }
    }
  }
}
