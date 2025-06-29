export function drawGlyph(ctx, rows, x, y, scale=1) {
  for (let r=0; r<8; r++){
    const rowByte = rows[r];
    for (let b=0; b<8; b++){
      if (rowByte & (1 << (7-b))) {
        ctx.fillRect(x + b*scale, y + r*scale, scale, scale);
      }
    }
  }
}