"use client";
import { useMemo, useState } from "react";

function moveToEnglish(m: string): string {
  const face = { R: "Right", L: "Left", U: "Up", D: "Down", F: "Front", B: "Back" }[m[0] as any] || "";
  const prime = m.includes("'") ? "counter-clockwise" : "clockwise";
  const amount = m.includes("2") ? "180°" : "90°";
  return `${face} face ${amount} ${m.includes("2") ? "" : prime}`.trim();
}

export default function SolvePlayer({ size, moves }: { size: 2 | 3; moves: string }) {
  const list = useMemo(() => moves.trim() ? moves.trim().split(/\s+/) : [], [moves]);
  const [idx, setIdx] = useState(0);
  const current = list[idx] || "";

  return (
    <div className="grid" style={{ gap: 8 }}>
      <div className="row" style={{ alignItems: 'center' }}>
        <button className="btn secondary" onClick={() => setIdx(0)} disabled={!list.length}>⏮ Reset</button>
        <button className="btn secondary" onClick={() => setIdx(Math.max(0, idx - 1))} disabled={!list.length}>◀ Prev</button>
        <button className="btn" onClick={() => setIdx(Math.min(list.length - 1, idx + 1))} disabled={!list.length}>Next ▶</button>
        <button className="btn secondary" onClick={() => navigator.clipboard.writeText(moves)} disabled={!list.length}>Copy moves</button>
      </div>
      <div className="card">
        <p><strong>Step {list.length ? idx + 1 : 0} / {list.length}</strong></p>
        <p>{current ? `${current} — ${moveToEnglish(current)}` : "No solution yet. Click Solve."}</p>
        <p className="small">Notation: R/L/U/D/F/B, <kbd>'</kbd>=CCW, <kbd>2</kbd>=180°.</p>
      </div>
    </div>
  );
}
