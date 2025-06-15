import { drawGlyph as _drawGlyphInternal } from './picker.js';
export const GRID_COLS = 40;
export const GRID_ROWS = 28;
export const CELL_SIZE = 8;

let drawCanvas, drawCtx;
let placedGlyphs = [];
let writeMode = false;
let cursorX = null, cursorY = null;
let showCursor = true;

// Expose so tools can push into placedGlyphs:
export function getPlacedGlyphs() {
  return placedGlyphs;
}
export function setPlacedGlyphs(arr) {
  placedGlyphs = arr;
}

export function setupCanvas(fontData) {
  drawCanvas = document.getElementById('drawCanvas');
  drawCtx = drawCanvas.getContext('2d');
  drawCanvas.width = GRID_COLS * CELL_SIZE;
  drawCanvas.height = GRID_ROWS * CELL_SIZE;
  refresh();
}

export function scaleDrawCanvasToWindow() {
  const pw = document.getElementById('sidebar').getBoundingClientRect().width;
  let aw = window.innerWidth - pw, ah = window.innerHeight;
  const ar = GRID_COLS / GRID_ROWS;
  let fw = aw, fh = fw / ar;
  if (fh > ah) { fh = ah; fw = fh * ar; }
  drawCanvas.style.width = `${fw}px`;
  drawCanvas.style.height = `${fh}px`;
}

export function refresh() {
  drawCtx.fillStyle = '#000';
  drawCtx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);

  // draw placed glyphs
  for (const { glyph, x, y, color, bgColor } of placedGlyphs) {
    drawCtx.fillStyle = bgColor;
    drawCtx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
    drawCtx.fillStyle = color;
    if (glyph) _drawGlyphInternal(drawCtx, glyph, x, y, 1);
  }

  // cursor
  if (writeMode && cursorX !== null && cursorY !== null && showCursor) {
    const cursorGlyph = fontData[0xE079];
    drawCtx.fillStyle = fontColor;
    _drawGlyphInternal(drawCtx, cursorGlyph, cursorX * CELL_SIZE, cursorY * CELL_SIZE, 1);
  }

  // grid
  drawCtx.strokeStyle = '#444';
  drawCtx.lineWidth = 0.5;
  drawCtx.beginPath();
  for (let x = 0; x <= drawCanvas.width; x += CELL_SIZE) {
    drawCtx.moveTo(x + 0.5, 0);
    drawCtx.lineTo(x + 0.5, drawCanvas.height);
  }
  for (let y = 0; y <= drawCanvas.height; y += CELL_SIZE) {
    drawCtx.moveTo(0, y + 0.5);
    drawCtx.lineTo(drawCanvas.width, y + 0.5);
  }
  drawCtx.stroke();
}

// These allow tools.js etc. to control cursor and writeMode:
export function setWriteMode(val) { writeMode = val; }
export function setCursor(x, y) { cursorX = x; cursorY = y; }
export function setShowCursor(val) { showCursor = val; }
