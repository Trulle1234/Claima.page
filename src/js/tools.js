import { refresh } from './canvas.js';
import { CELL_SIZE } from './settings.js';
import { getSelectedGlyph } from './picker.js';
import { state } from './state.js';
import { drawGlyph } from './glyphs.js';
import { handleWrite } from './write.js';

export function initTools(fontData) {

  let canvas;
  let painting=false, deleting=false;

  const toolButtons = {
    paint: document.getElementById('toolPlaceGlyph'),
    write: document.getElementById('toolWriteKeyboard'),
    fill:  document.getElementById('toolFillBucket'),
    grid:  document.getElementById('toolToggleGrid'),
  };

  // sizes & icons
  Object.values(toolButtons).forEach(btn => {
    btn.width = btn.height = 24;
  });

  const ctxPaint = toolButtons.paint.getContext('2d');
  const ctxWrite = toolButtons.write.getContext('2d');
  const ctxFill  = toolButtons.fill.getContext('2d');
  const ctxGrid = toolButtons.grid.getContext('2d')

  drawGlyph(ctxPaint, 0xF019.toString(), 0, 0, 3, 0, 7);
  drawGlyph(ctxWrite, 0xE000.toString(), 0, 0, 3, 0, 7);
  drawGlyph(ctxFill, 0xF014.toString(), 0, 0, 3, 0, 7);
  drawGlyph(ctxGrid, 0x01FB95.toString(), 0, 0, 3, 0, 7);

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
    toolButtons.grid.addEventListener('click', () => {
    state.showGrid = !state.showGrid
    refresh();
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

  window.addEventListener('keydown', e => {
    handleWrite(fontData, e);
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
        arr.push({ glyph: getSelectedGlyph(), x, y, color: state.fontColorIndex, bgColor: state.backgroundColorIndex });
        state.placedGlyphs = arr;
        refresh();
      }

      if (!isLeftClick && state.activeTool === 'paint'){
        deleting = true;
        state.placedGlyphs = state.placedGlyphs.filter(g=>!(g.x===x&&g.y===y));
        refresh();
      }
  }
}


