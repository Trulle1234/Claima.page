import { refresh } from './canvas.js';
import { GRID_COLS, GRID_ROWS, CELL_SIZE } from './settings.js';
import { state } from './state.js';

let cursorTimer = null;
let writeStartX = null;

export function initWrite(fontData) {
    state.cursorGlyph = fontData[0x2588]; //E079

    document.addEventListener('placeCursor', ({ detail: { col, row } }) => {
        placeCursor(row, col);
    });

    startCursorBlinking();    
}

export function placeCursor(row, col) {
    state.cursorX = col;
    state.cursorY = row;
    writeStartX = col;
}

export function handleWrite(fontData, e) {
    startCursorBlinking();

    const writeMode = state.activeTool === 'write';

    if (!writeMode || state.cursorX === null || state.cursorY === null) return;

    if (e.key === 'Enter') {
        state.cursorY++;
        state.cursorX = writeStartX;
        return;
    }

    if (e.key === 'Backspace') {
        if (state.cursorX > 0) {
            state.cursorX--;
            const x = state.cursorX * CELL_SIZE;
            const y = state.cursorY * CELL_SIZE;
            state.placedGlyphs = state.placedGlyphs.filter(g => !(g.x === x && g.y === y));
            refresh();
        }
        e.preventDefault();
        return;
    }

    if (e.key === 'Delete') {
        const x = state.cursorX * CELL_SIZE;
        const y = state.cursorY * CELL_SIZE;
        state.placedGlyphs = state.placedGlyphs.filter(g => !(g.x === x && g.y === y));
        refresh();
        e.preventDefault();
        return;
    }

    if (e.key.length !== 1) return;

    const cp = e.key.codePointAt(0);
    const glyph = fontData[cp];

    if (!glyph) return;

    if (state.cursorX >= GRID_COLS || state.cursorY >= GRID_ROWS) return;

    const x = state.cursorX * CELL_SIZE;
    const y = state.cursorY * CELL_SIZE;

    state.placedGlyphs = state.placedGlyphs.filter(g => !(g.x === x && g.y === y));
    state.placedGlyphs.push({
        glyph,
        x,
        y,
        color: state.fontColorIndex,
        bgColor: state.backgroundColorIndex
    });

    refresh();
    state.cursorX++;
}

function startCursorBlinking() {
    if (cursorTimer) clearInterval(cursorTimer);

    state.showCursor = true;
    cursorTimer = setInterval(() => {
        state.showCursor = !state.showCursor;
        refresh();
    }, 500);
}