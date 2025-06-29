import { refresh } from './canvas.js';
import { CELL_SIZE, GRID_COLS, GRID_ROWS } from './settings.js';
import { getSelectedGlyph } from './picker.js';
import { state } from './state.js'

export function initFloodFill(fontdata) {
  document.addEventListener('floodfill', ({ detail: { col, row } }) => {
    floodFill(col, row, fontdata);
  });
}

function floodFill(startCol, startRow, fontdata) {
      let placed = state.placedGlyphs;
      const startX = startCol * CELL_SIZE;
      const startY = startRow * CELL_SIZE;

      const target = placed.find(g => g.x === startX && g.y === startY);
      const targetGlyph = target?.glyph ?? null;
      const targetColor = target?.color ?? null;
      const targetBg = target?.bgColor ?? null;

      const visited = new Set();
      const queue = [[startCol, startRow]];

      while (queue.length) {
        const [col, row] = queue.shift();
        const key = `${col},${row}`;
        if (visited.has(key)) continue;
        visited.add(key);

        const x = col * CELL_SIZE;
        const y = row * CELL_SIZE;

        const existing = placed.find(g => g.x === x && g.y === y);
        const glyph = existing?.glyph ?? null;
        const color = existing?.color ?? null;
        const bg    = existing?.bgColor ?? null;

        const sameGlyph = glyph === targetGlyph;
        const sameColor = color === targetColor;
        const sameBg    = bg === targetBg;

        if (!sameGlyph || color !== targetColor || bg !== targetBg) continue;

        placed = placed.filter(g => !(g.x === x && g.y === y));
        placed.push({
          glyph: getSelectedGlyph(fontdata),
          x, y,
          color: fontColor,
          bgColor: backgroundColor
        });

        if (col > 0) queue.push([col - 1, row]);
        if (col < GRID_COLS - 1) queue.push([col + 1, row]);
        if (row > 0) queue.push([col, row - 1]);
        if (row < GRID_ROWS - 1) queue.push([col, row + 1]);
      }

  state.placedGlyphs = placed;
  refresh();
}
