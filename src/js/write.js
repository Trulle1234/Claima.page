import { refresh } from './canvas.js';
import { setCell } from './screen_buffer.js';
import { GRID_COLS, GRID_ROWS, CELL_SIZE } from './settings.js';
import { state } from './state.js';

let cursorTimer = null;
let writeStartX = null;

export function initWrite() {
    state.cursorGlyph = 0x2588.toString();

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
            setCell(state.cursorX, state.cursorY, 0, state.backgroundColorIndex, 0);
            refresh();
        }
        e.preventDefault();
        return;
    }

    if (e.key === 'Delete') {
        setCell(state.cursorX, state.cursorY, 0, state.backgroundColorIndex, 0);
        refresh();
        e.preventDefault();
        return;
    }

    if (e.key.length !== 1) return;

    const cp = parseInt(e.key.codePointAt(0), 16);
    if (!cp) return;
    if (state.cursorX >= GRID_COLS || state.cursorY >= GRID_ROWS) return;

    setCell(state.cursorX, state.cursorY, cp, state.backgroundColorIndex, state.fontColorIndex);

    refresh();
    state.cursorX++;
}

function startCursorBlinking() {
    if (cursorTimer) return; 

    state.showCursor = true;
    cursorTimer = setInterval(() => {
        state.showCursor = !state.showCursor;
        if (state.activeTool === 'write') {
            refresh();
        }
    }, 500);
}