import { state } from "./state.js";

let glyphSheets = null;
let glyphCodes = null;
const cols = 16;

export function initGlyphs(fontData) {
  glyphCodes = Object.keys(fontData);
  const rows = Math.ceil(glyphCodes.length / cols);

  glyphSheets = state.palette.map(color => {
    const c = document.createElement('canvas');
    c.width  = cols * 8;
    c.height = rows * 8;
    const ctx = c.getContext('2d');
    ctx.fillStyle = color;
    glyphCodes.forEach((cpHex, idx) => {
      const cp   = cpHex.toString(16).padStart(2,'0').toUpperCase();
      const data = fontData[cp];
      const col  = idx % cols;
      const row  = Math.floor(idx / cols);
      const baseX = col * 8;
      const baseY = row * 8;

      for (let r = 0; r < 8; r++) {
        const byte = data[r];
        for (let b = 0; b < 8; b++) {
          if (byte & (1 << (7 - b))) {
            ctx.fillRect(baseX + b, baseY + r, 1, 1);
          }
        }
      }
    });
    return c;
  });
}

export function drawGlyph(ctx, codePoint, x, y, scale = 1, bgIndex = 0, fgIndex = 0) {
  ctx.imageSmoothingEnabled = false;
  ctx.imageSmoothingQuality = 'low';

  const w  = 8 * scale;
  const h  = 8 * scale;

  ctx.fillStyle = state.palette[bgIndex];
  ctx.fillRect(x, y, w, h);

  if (codePoint === 0) {
    return 
  }

  const cp  = codePoint.toString(16).padStart(2,'0').toUpperCase();
  const idx = glyphCodes.indexOf(cp.toString());
  if (idx < 0) return; 

  const sx = (idx % cols) * 8;
  const sy = Math.floor(idx / cols) * 8;
  
  const sheet = glyphSheets[fgIndex];
  ctx.drawImage(sheet, sx, sy, 8, 8, x, y, w, h);
}
