"use client";
import { FaceColors, FaceKey, colorLetterToHex, supportedPalette, ColorLetter } from "@/lib/facelets";

export default function FaceGridEditor({
  size,
  faces,
  onChange,
  palette
}: {
  size: 2 | 3;
  faces: FaceColors;
  onChange: (f: FaceColors) => void;
  palette: ColorLetter[];
}) {
  const keys: FaceKey[] = ["U", "R", "F", "D", "L", "B"]; // URFDLB

  const cycle = (face: FaceKey, i: number, j: number) => {
    const current = faces[face][i][j];
    const idx = palette.indexOf(current);
    const next = palette[(idx + 1) % palette.length];
    const copy = structuredClone(faces);
    copy[face][i][j] = next;
    onChange(copy);
  };

  return (
    <div className="grid cols-3">
      {keys.map((k) => (
        <div key={k} className="card">
          <h3>{k}</h3>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${size === 2 ? 2 : 3}, 36px)`, gap: 6 }}>
            {faces[k].flatMap((row, i) => row.map((cell, j) => (
              <button
                key={`${i}-${j}`}
                onClick={() => cycle(k, i, j)}
                title={`${k}[${i},${j}]`}
                style={{ width: 36, height: 36, borderRadius: 6, border: "1px solid #2a3147", background: colorLetterToHex[cell] }}
              />
            )))}
          </div>
        </div>
      ))}
    </div>
  );
}
