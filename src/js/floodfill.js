import { refresh } from './canvas.js';
import { GRID_COLS, GRID_ROWS } from './settings.js';
import { getBufferIndex, screenBuffer, setCell } from './screen_buffer.js';
import { getSelectedGlyph } from './picker.js';
import { state } from './state.js';

export function initFloodFill() {
  document.addEventListener('floodfill', ({ detail: { col, row } }) => {
    floodFill(col, row);
  });
}

function floodFill(startCol, startRow) {
    const i = getBufferIndex(startCol, startRow);
    const targetGlyph = screenBuffer.cpBuf[i];
    const targetColor = screenBuffer.fgBuf[i];
    const targetBg = screenBuffer.bgBuf[i];

    const visited = new Set();
    const queue = [[startCol, startRow]];

    while (queue.length) {
      const [col, row] = queue.shift();
      const key = `${col},${row}`;
      if (visited.has(key)) continue;
      visited.add(key);


      const existingIndex = getBufferIndex(col, row);
      const glyph = screenBuffer.cpBuf[existingIndex];
      const color = screenBuffer.fgBuf[existingIndex];
      const bg = screenBuffer.bgBuf[existingIndex];

      const sameGlyph = glyph === targetGlyph;

      if (!sameGlyph || color !== targetColor || bg !== targetBg) continue;

      setCell(col, row, getSelectedGlyph(), state.backgroundColorIndex, state.fontColorIndex);

      if (col > 0) queue.push([col - 1, row]);
      if (col < GRID_COLS - 1) queue.push([col + 1, row]);
      if (row > 0) queue.push([col, row - 1]);
      if (row < GRID_ROWS - 1) queue.push([col, row + 1]);
    }

  refresh();
}
