import { GRID_COLS, GRID_ROWS } from "./settings.js"

const bufSize = GRID_COLS *  GRID_ROWS

export const screenBuffer = {
    cpBuf: new Uint16Array(bufSize),
    bgBuf: new Uint8Array(bufSize),
    fgBuf: new Uint8Array(bufSize)
}

export function getBufferIndex(x, y) {
    return y * GRID_COLS + x;
}

export function setCell(x, y, cp, bg, fg) {
  const i = getBufferIndex(x, y)
  screenBuffer.cpBuf[i] = cp;
  screenBuffer.bgBuf[i] = bg;
  screenBuffer.fgBuf[i] = fg;
}