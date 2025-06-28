import { setWriteMode, refresh, getPlacedGlyphs, setPlacedGlyphs, writeMode } from './render.js';
import { CELL_SIZE } from './settings.js';
import { drawGlyph, getSelectedGlyph } from './picker.js';
import { fontColor, backgroundColor } from './palette.js';

export function initTools(fontData) {
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
  }

  // event wiring
  toolButtons.paint.addEventListener('click', () => {
    setActive('paint');
    setWriteMode(false);
  });
  toolButtons.write.addEventListener('click', () => {
    setActive('write');
    setWriteMode(true);
  });
  toolButtons.fill.addEventListener('click', () => {
    setActive('fill');
    setWriteMode(false);
  });

  setActive('paint');

  // mouse events on drawCanvas
  const canvas = document.getElementById('drawCanvas');
  let painting=false, deleting=false;
  canvas.addEventListener('mousedown', e => {
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width, sy = canvas.height / rect.height;
    const col = Math.floor((e.clientX - rect.left) * sx / CELL_SIZE);
    const row = Math.floor((e.clientY - rect.top)  * sy / CELL_SIZE);
    const x = col * CELL_SIZE, y = row * CELL_SIZE;

    if (toolButtons.fill.classList.contains('tool-selected') && e.button === 0) {
      // dispatch to floodfill.js
      document.dispatchEvent(new CustomEvent('floodfill', { detail: { col, row } }));
      return;
    }

    if (writeMode && e.button === 0) {
      document.dispatchEvent(new CustomEvent('placeCursor', { detail: { col, row } }));
      return;
    }

    if (e.button === 0 && !writeMode) {
     painting = true;
      let arr = getPlacedGlyphs().filter(g=>!(g.x===x&&g.y===y));
      arr.push({ glyph: getSelectedGlyph(fontData), x, y, color: fontColor, bgColor: backgroundColor });
      setPlacedGlyphs(arr);
      refresh();
    }

    if (e.button === 2) {
      deleting = true;
      setPlacedGlyphs(getPlacedGlyphs().filter(g=>!(g.x===x&&g.y===y)));
      refresh();
    }
  });

  canvas.addEventListener('mousemove', e => {
    if (painting) canvas.dispatchEvent(new MouseEvent('mousedown', e));
    if (deleting) canvas.dispatchEvent(new MouseEvent('mousedown', { ...e, button: 2 }));
  });
  window.addEventListener('mouseup', e => {
    if (e.button===0) painting=false;
    if (e.button===2) deleting=false;
  });
  canvas.addEventListener('contextmenu', e=>e.preventDefault());
}
