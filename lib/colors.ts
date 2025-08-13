// Minimal HSV sampling + nearest-centroid classification for 6 colors.
// Assumes decent indoor lighting and a centered face capture.

export type RGB = { r: number; g: number; b: number };
export type HSV = { h: number; s: number; v: number };

export const PALETTE = {
  W: { h: 0, s: 0, v: 1 },     // white
  Y: { h: 60 / 360, s: 0.9, v: 1 },
  R: { h: 0 / 360, s: 0.9, v: 0.9 },
  O: { h: 30 / 360, s: 0.9, v: 0.95 },
  G: { h: 120 / 360, s: 0.9, v: 0.9 },
  B: { h: 240 / 360, s: 0.8, v: 0.9 }
};

export function rgbToHsv({ r, g, b }: RGB): HSV {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max === min) h = 0; else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h, s, v };
}

function hsvDist(a: HSV, b: HSV) {
  const dh = Math.min(Math.abs(a.h - b.h), 1 - Math.abs(a.h - b.h));
  return Math.hypot(dh * 2.5, (a.s - b.s) * 1.2, (a.v - b.v));
}

export function classifyHSV(c: HSV): keyof typeof PALETTE {
  let best: keyof typeof PALETTE = "W"; let bestD = 1e9;
  (Object.keys(PALETTE) as (keyof typeof PALETTE)[]).forEach((k) => {
    const d = hsvDist(c, PALETTE[k]);
    if (d < bestD) { bestD = d; best = k; }
  });
  return best;
}

// Sample N×N grid from the central region of an image element
export function analyzeImageGrid(img: HTMLImageElement, n: 2 | 3): (keyof typeof PALETTE)[][] {
  const canvas = document.createElement("canvas");
  const W = canvas.width = 640; const H = canvas.height = Math.round(640 * (img.height / img.width));
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, W, H);

  const padX = W * 0.2, padY = H * 0.2; // central region
  const boxW = (W - 2 * padX) / n;
  const boxH = (H - 2 * padY) / n;

  const out: (keyof typeof PALETTE)[][] = [];
  for (let i = 0; i < n; i++) {
    out[i] = [] as any;
    for (let j = 0; j < n; j++) {
      const x = Math.round(padX + j * boxW + boxW / 2);
      const y = Math.round(padY + i * boxH + boxH / 2);
      const { data } = ctx.getImageData(x, y, 1, 1);
      const hsv = rgbToHsv({ r: data[0], g: data[1], b: data[2] });
      out[i][j] = classifyHSV(hsv);
    }
  }
  return out;
}
