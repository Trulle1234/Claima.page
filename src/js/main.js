import { font8x8_bescii } from '../data/bescii.js';
import { setupCanvas, scaleDrawCanvasToWindow } from './canvas.js';
import { initTools } from './tools.js';
import { initPalette } from './palette.js';
import { initPicker } from './picker.js';
import { initFloodFill } from './floodfill.js';
import { initWrite } from './write.js';

window.addEventListener('load', () => {
  setupCanvas(font8x8_bescii);
  initTools(font8x8_bescii);
  initPalette();
  initPicker(font8x8_bescii);
  initFloodFill(font8x8_bescii);
  initWrite(font8x8_bescii);
  scaleDrawCanvasToWindow();
});

window.addEventListener('resize', scaleDrawCanvasToWindow);
