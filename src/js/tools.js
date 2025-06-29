import { refresh } from './canvas.js';
import { CELL_SIZE } from './settings.js';
import { getSelectedGlyph } from './picker.js';
import { state } from './state.js';
import { drawGlyph } from './render.js';

export function initTools(fontData) {

  let canvas;
  let painting=false, deleting=false;

  const toolButtons = {
    paint: document.getElementById('toolPlaceGlyph'),
    write: document.getElementById('toolWriteKeyboard'),
    fill:  document.getElementById('toolFillBucket'),
  };

  // sizes & icons
  Object.values(toolButtons).forEach(btn => {
    btn.width = btn.height = 24;
  });
  const paintbrush = fontData[0xF019];
  const pencil     = fontData[0xE000];
  const bucket     = fontData[0xF014];

  const ctxPaint = toolButtons.paint.getContext('2d');
  const ctxWrite = toolButtons.write.getContext('2d');
  const ctxFill  = toolButtons.fill.getContext('2d');

  ctxPaint.fillStyle = '#0F0'; drawGlyph(ctxPaint, paintbrush, 0, 0, 3);
  ctxWrite.fillStyle = '#0F0'; drawGlyph(ctxWrite, pencil,     0, 0, 3);
  ctxFill.fillStyle  = '#0F0'; drawGlyph(ctxFill, bucket,     0, 0, 3);

  function setActive(tool) {
    Object.values(toolButtons).forEach(b=>b.classList.remove('tool-selected'));
    toolButtons[tool].classList.add('tool-selected');
    state.activeTool = tool;
  }

  // event wiring
  toolButtons.paint.addEventListener('click', () => {
    setActive('paint');
  });
  toolButtons.write.addEventListener('click', () => {
    setActive('write');
  });
  toolButtons.fill.addEventListener('click', () => {
    setActive('fill');
  });

  setActive('paint');

  // mouse events on drawCanvas
  canvas = document.getElementById('drawCanvas');

  canvas.addEventListener('mousedown', e => {
    handleMouseDown(fontData, e, e.button === 0);
  });

  canvas.addEventListener('mousemove', e => {
    if (painting) handleMouseDown(fontData, e, true);
    if (deleting) handleMouseDown(fontData, e, false);
  });

  window.addEventListener('mouseup', e => {
    if (e.button === 0) painting=false;
    if (e.button === 2) deleting=false;
  });
  canvas.addEventListener('contextmenu', e=>e.preventDefault());

  function handleMouseDown(fontData, e, isLeftClick) {
      const rect = canvas.getBoundingClientRect();
      const sx = canvas.width / rect.width, sy = canvas.height / rect.height;
      const col = Math.floor((e.clientX - rect.left) * sx / CELL_SIZE);
      const row = Math.floor((e.clientY - rect.top)  * sy / CELL_SIZE);
      const x = col * CELL_SIZE, y = row * CELL_SIZE;

      if (state.activeTool === 'fill' && e.button === 0) {
        // dispatch to floodfill.js
        document.dispatchEvent(new CustomEvent('floodfill', { detail: { col, row } }));
        return;
      }

      if (state.activeTool === 'write' && isLeftClick) {
        document.dispatchEvent(new CustomEvent('placeCursor', { detail: { col, row } }));
        return;
      }

      if (state.activeTool !== 'write' && isLeftClick) {
        painting = true;
        let arr = state.placedGlyphs.filter(g=>!(g.x===x&&g.y===y));
        arr.push({ glyph: getSelectedGlyph(fontData), x, y, color: state.fontColor, bgColor: state.backgroundColor });
        state.placedGlyphs = arr;
        refresh();
      }

      if (!isLeftClick) {
        deleting = true;
        state.placedGlyphs = state.placedGlyphs.filter(g=>!(g.x===x&&g.y===y));
        refresh();
      }
  }
}


