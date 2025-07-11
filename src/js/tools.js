import { refresh, drawCanvas, drawCtx } from './canvas.js';
import { CELL_SIZE, GRID_ROWS, GRID_COLS } from './settings.js';
import { getSelectedGlyph, pickerVisible } from './picker.js';
import { state } from './state.js';
import { drawGlyph } from './glyphs.js';
import { handleWrite } from './write.js';
import { setCell, screenBuffer } from './screen_buffer.js';

export function initTools(fontData) {
  let canvas;
  let painting = false, deleting = false;

  const toolButtons = {
    paint:    document.getElementById('toolPlaceGlyph'),
    write:    document.getElementById('toolWriteKeyboard'),
    fill:     document.getElementById('toolFillBucket'),
    grid:     document.getElementById('toolToggleGrid'),
    clear:   document.getElementById('toolClear'),
    download: document.getElementById('toolDownload'),
    upload:   document.getElementById('toolUpload')
    };
    
  const fileInput = document.getElementById('fileInput');

  Object.values(toolButtons).forEach(btn => {
    btn.width = btn.height = 24;
  });

  drawGlyph(toolButtons.paint.getContext('2d'),    0xF019.toString(),    0, 0, 3, 0, 7);
  drawGlyph(toolButtons.write.getContext('2d'),    0xE000.toString(),    0, 0, 3, 0, 7);
  drawGlyph(toolButtons.fill .getContext('2d'),    0xF014.toString(),    0, 0, 3, 0, 7);
  drawGlyph(toolButtons.grid .getContext('2d'),    0x01FB95.toString(),  0, 0, 3, 0, 7);
  drawGlyph(toolButtons.clear  .getContext('2d'), 0x2573.toString(),    0, 0, 3, 0, 7);
  drawGlyph(toolButtons.download.getContext('2d'), 0x2198.toString(),    0, 0, 3, 0, 7);
  drawGlyph(toolButtons.upload  .getContext('2d'), 0x2196.toString(),    0, 0, 3, 0, 7);

  function setActive(tool) {
    Object.values(toolButtons).forEach(b => b.classList.remove('tool-selected'));
    toolButtons[tool].classList.add('tool-selected');
    toolButtons.grid.classList.add('tool-selected');
    state.activeTool = tool;
    pickerVisible(tool !== 'write');
  }

  toolButtons.paint.addEventListener('click', () => setActive('paint'));
  toolButtons.write.addEventListener('click', () => setActive('write'));
  toolButtons.fill .addEventListener('click', () => setActive('fill'));
  toolButtons.grid .addEventListener('click', () => {
    state.showGrid = !state.showGrid;
    if (state.showGrid) {
      toolButtons.grid.classList.add('tool-selected');
    } else {
      toolButtons.grid.classList.remove('tool-selected');
    }
    refresh();
  });

  toolButtons.clear.addEventListener('click', () => {
    if (window.confirm("Are you sure you want to clear the canvas?")) {
      for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_COLS; x++) {
          setCell(x, y, 0, 0, 0);
        }
      }
      refresh();
    }
  });

  setActive('paint');

toolButtons.download.addEventListener('click', () => {
  const name = window.prompt("Filename to save:", "my_page");
  if (!name) return;
  const filename = name.endsWith(".apage") ? name : name + ".apage";

  const payload = {
    cpBuf: Array.from(screenBuffer.cpBuf),
    bgBuf: Array.from(screenBuffer.bgBuf),
    fgBuf: Array.from(screenBuffer.fgBuf),
    cols: GRID_COLS,
    rows: GRID_ROWS
  };

  const blob = new Blob([JSON.stringify(payload)], {
    type: "application/json"
  });
  const a = document.createElement('a');
  a.download = filename;
  a.href     = URL.createObjectURL(blob);
  a.click();
  URL.revokeObjectURL(a.href);
});

toolButtons.upload.addEventListener('click', () => {
  fileInput.value = null;
  fileInput.click();
});

fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const payload = JSON.parse(reader.result);
      if (
        payload.cols  !== GRID_COLS || 
        payload.rows  !== GRID_ROWS ||
        !Array.isArray(payload.cpBuf) ||
        !Array.isArray(payload.bgBuf) ||
        !Array.isArray(payload.fgBuf)
      ) {
        throw new Error("Invalid .apage format");
      }

      screenBuffer.cpBuf = Uint32Array.from(payload.cpBuf);
      screenBuffer.bgBuf = Uint8Array.from(payload.bgBuf);
      screenBuffer.fgBuf = Uint8Array.from(payload.fgBuf);

      refresh();
    } catch (err) {
      alert("Failed to load file: " + err.message);
    }
  };
  reader.readAsText(file);
});

  canvas = document.getElementById('drawCanvas');
  canvas.addEventListener('mousedown', e => handleMouseDown(fontData, e, e.button === 0));
  canvas.addEventListener('mousemove', e => {
    if (painting) handleMouseDown(fontData, e, true);
    if (deleting) handleMouseDown(fontData, e, false);
  });
  window.addEventListener('keydown', e => handleWrite(fontData, e));
  window.addEventListener('mouseup', e => {
    if (e.button === 0) painting = false;
    if (e.button === 2) deleting = false;
  });
  canvas.addEventListener('contextmenu', e => e.preventDefault());

  function handleMouseDown(fontData, e, isLeftClick) {
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width, sy = canvas.height / rect.height;
    const col = Math.floor((e.clientX - rect.left)   * sx / CELL_SIZE);
    const row = Math.floor((e.clientY - rect.top)    * sy / CELL_SIZE);

    if (state.activeTool === 'fill'  && e.button === 0) {
      document.dispatchEvent(new CustomEvent('floodfill', { detail: { col, row } }));
      return;
    }
    if (state.activeTool === 'write' && isLeftClick) {
      document.dispatchEvent(new CustomEvent('placeCursor', { detail: { col, row } }));
      return;
    }
    if (state.activeTool !== 'write' && isLeftClick) {
      painting = true;
      setCell(col, row, getSelectedGlyph(), state.backgroundColorIndex, state.fontColorIndex);
      refresh();
    }
    if (!isLeftClick && state.activeTool === 'paint') {
      deleting = true;
      setCell(col, row, 0, state.backgroundColorIndex, state.fontColorIndex);
      refresh();
    }
  }
}
