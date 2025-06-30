function initGlyphs(fontData) {
    const glyphs = Object.keys(fontData);
    const count = glyphs.length;
    const cols  = 16;                
    const rows  = Math.ceil(count/cols);
    const sheet = document.createElement('canvas');
    sheet.width  = cols * 8;
    sheet.height = rows * 8;
    const sctx   = sheet.getContext('2d');
    sctx.fillStyle = '#000';   

    glyphs.forEach((cpHex, idx) => {
    const cp   = Number(cpHex);
    const rows8 = fontData[cp];
    const col  = idx % cols;
    const row  = Math.floor(idx/cols);
    const baseX = col * 8;
    const baseY = row * 8;

    for (let r = 0; r < 8; r++) {
        const byte = rows8[r];
        for (let b = 0; b < 8; b++) {
        if (byte & (1 << (7 - b))) {
            sctx.fillRect(baseX + b, baseY + r, 1, 1);
        }
        }
    }

    glyphMap[cp] = { sx: baseX, sy: baseY };
    });

}


function drawGlyph(ctx, codePoint, x, y, scale = 1) {
  const info = glyphMap[codePoint];
  if (!info) return;
  ctx.drawImage(
    sheet,
    info.sx, info.sy, 8, 8,   
    x, y,                     
    8*scale, 8*scale
  );
}
