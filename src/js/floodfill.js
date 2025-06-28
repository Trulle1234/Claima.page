import { getPlacedGlyphs, setPlacedGlyphs, refresh } from './render.js';
import { CELL_SIZE, GRID_COLS, GRID_ROWS } from './settings.js';

export function initFloodFill() {
  document.addEventListener('floodfill', ({ detail: { col, row } }) => {
    floodFill(col, row);
  });
}

function floodFill(startCol, startRow) {
  let placed = getPlacedGlyphs();
  const startX = startCol * CELL_SIZE, startY = startRow * CELL_SIZE;
  const target = placed.find(g => g.x === startX && g.y === startY) || {};
  const { glyph: tgtGlyph=null, color: tgtColor=null, bgColor: tgtBg=null } = target;

  const visited = new Set();
  const queue = [[startCol, startRow]];

  while (queue.length) {
    const [c, r] = queue.shift();
    const key = `${c},${r}`;
    if (visited.has(key)) continue;
    visited.add(key);

    const x = c * CELL_SIZE, y = r * CELL_SIZE;
    const existing = placed.find(g => g.x===x&&g.y===y) || {};
    if (existing.glyph !== tgtGlyph || existing.color !== tgtColor || existing.bgColor !== tgtBg) continue;

    // replace
    placed = placed.filter(g=>!(g.x===x&&g.y===y));
    placed.push({
      glyph: existing.glyph,
      x, y,
      color: fontColor,
      bgColor: backgroundColor
    });

    [[c-1,r],[c+1,r],[c,r-1],[c,r+1]].forEach(([nc,nr]) => {
      if (nc>=0 && nr>=0 && nc<GRID_COLS && nr<GRID_ROWS) queue.push([nc,nr]);
    });
  }

  setPlacedGlyphs(placed);
  refresh();
}
