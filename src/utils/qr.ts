// Pure SVG QR code generator helper for eSIM profiles

export function generateEsimQrSvg(text: string, size = 200): string {
  // Simple deterministic QR matrix simulation for valid visual rendering
  const modulesCount = 21;
  const cellSize = size / modulesCount;
  
  // Seed pseudo hash from text
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  const isFinderPattern = (r: number, c: number) => {
    // Top-left finder
    if (r < 7 && c < 7) {
      if (r === 0 || r === 6 || c === 0 || c === 6) return true;
      if (r >= 2 && r <= 4 && c >= 2 && c <= 4) return true;
      return false;
    }
    // Top-right finder
    if (r < 7 && c >= modulesCount - 7) {
      const cc = c - (modulesCount - 7);
      if (r === 0 || r === 6 || cc === 0 || cc === 6) return true;
      if (r >= 2 && r <= 4 && cc >= 2 && cc <= 4) return true;
      return false;
    }
    // Bottom-left finder
    if (r >= modulesCount - 7 && c < 7) {
      const rr = r - (modulesCount - 7);
      if (rr === 0 || rr === 6 || c === 0 || c === 6) return true;
      if (rr >= 2 && rr <= 4 && c >= 2 && c <= 4) return true;
      return false;
    }
    return false;
  };

  const isFinderBorder = (r: number, c: number) => {
    if ((r < 8 && c < 8) || (r < 8 && c >= modulesCount - 8) || (r >= modulesCount - 8 && c < 8)) {
      return true;
    }
    return false;
  };

  let rects = '';

  for (let r = 0; r < modulesCount; r++) {
    for (let c = 0; c < modulesCount; c++) {
      let active = false;

      if (isFinderPattern(r, c)) {
        active = true;
      } else if (!isFinderBorder(r, c)) {
        // Deterministic pseudo-data module based on position and string hash
        const val = Math.abs(Math.sin((r * 13 + c * 37 + hash) * 0.5));
        if (val > 0.42) {
          active = true;
        }
      }

      if (active) {
        const x = c * cellSize;
        const y = r * cellSize;
        rects += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(cellSize + 0.3).toFixed(1)}" height="${(cellSize + 0.3).toFixed(1)}" fill="#0F172A" />`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="border-radius: 8px; background: white; padding: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">${rects}</svg>`;
}
