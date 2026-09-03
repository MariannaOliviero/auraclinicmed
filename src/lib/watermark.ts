/**
 * Applica una filigrana visibile a un'immagine caricata dallo staff
 * e restituisce un JPEG compresso pronto per la pubblicazione.
 */
export async function watermarkImage(
  file: File,
  text = "AURA Clinic",
  maxSide = 1600,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Impossibile elaborare l'immagine");

  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  // Filigrana diagonale ripetuta
  const size = Math.max(14, Math.round(w * 0.026));
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.lineWidth = 1;
  ctx.font = `600 ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-Math.PI / 7);
  const stepX = ctx.measureText(text).width + size * 3;
  const stepY = size * 5;
  for (let y = -h; y < h; y += stepY) {
    for (let x = -w; x < w; x += stepX) {
      ctx.fillText(text, x, y);
      ctx.strokeText(text, x, y);
    }
  }
  ctx.restore();

  // Firma in basso a destra
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.font = `600 ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 8;
  ctx.textAlign = "right";
  ctx.fillText(text, w - size, h - size);
  ctx.restore();

  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Conversione immagine fallita"))),
      "image/jpeg",
      0.86,
    ),
  );
}
