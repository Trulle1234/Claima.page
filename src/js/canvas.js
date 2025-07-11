import * as Settings from './settings.js';
import { redrawPicker } from './picker.js';
import { state } from './state.js'
import { drawGlyph } from './glyphs.js';
import { getBufferIndex, screenBuffer } from './screen_buffer.js';

export let drawCanvas;
export let drawCtx;

export function setupCanvas(fontData) {
  drawCanvas = document.getElementById('drawCanvas');
  drawCtx = drawCanvas.getContext('2d');
  drawCanvas.width = Settings.GRID_COLS * Settings.CELL_SIZE;
  drawCanvas.height = Settings.GRID_ROWS * Settings.CELL_SIZE;
  redrawCanvas();
}

export function scaleDrawCanvasToWindow() {
  const pw = document.getElementById('sidebar').getBoundingClientRect().width;
  let aw = window.innerWidth - pw, ah = window.innerHeight;
  const ar = Settings.GRID_COLS / Settings.GRID_ROWS;
  let fw = aw, fh = fw / ar;
  if (fh > ah) { fh = ah; fw = fh * ar; }
  drawCanvas.style.width = `${fw}px`;
  drawCanvas.style.height = `${fh}px`;
}

export function redrawCanvas() {
  drawCtx.fillStyle = '#000';
  drawCtx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);

  // draw placed glyphs
  for (let y = 0; y < Settings.GRID_ROWS; y++) {
    for (let x = 0; x < Settings.GRID_COLS; x++) {
      const i = getBufferIndex(x, y);
      const codePoint = screenBuffer.cpBuf[i];
      const bgIndex   = screenBuffer.bgBuf[i];
      const fgIndex   = screenBuffer.fgBuf[i];
      drawGlyph(drawCtx, codePoint, x * Settings.CELL_SIZE, y * Settings.CELL_SIZE, 1, bgIndex, fgIndex);
    }
  }

  // grid
  if (state.showGrid) {
    drawCtx.strokeStyle = '#444';
    drawCtx.lineWidth = 0.5;
    drawCtx.beginPath();
    for (let x = 0; x <= drawCanvas.width; x += Settings.CELL_SIZE) {
      drawCtx.moveTo(x + 0.5, 0);
      drawCtx.lineTo(x + 0.5, drawCanvas.height);
    }
    for (let y = 0; y <= drawCanvas.height; y += Settings.CELL_SIZE) {
      drawCtx.moveTo(0, y + 0.5);
      drawCtx.lineTo(drawCanvas.width, y + 0.5);
    }
    drawCtx.stroke();
  }

  // cursor
  if (state.activeTool === 'write' && state.cursorX !== null && state.cursorY !== null && state.showCursor) {
    drawGlyph(drawCtx, state.cursorGlyph, state.cursorX * Settings.CELL_SIZE, state.cursorY * Settings.CELL_SIZE, 1, state.backgroundColorIndex, state.fontColorIndex);
  }
}

export function refresh() {
  scaleDrawCanvasToWindow();
  redrawCanvas();
  redrawPicker();
}
