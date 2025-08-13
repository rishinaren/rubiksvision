"use client";
import { Field } from "./Ui";

export default function ModeToggle({
  size,
  setSize,
  mode,
  setMode
}: {
  size: 2 | 3;
  setSize: (n: 2 | 3) => void;
  mode: "human" | "computational";
  setMode: (m: "human" | "computational") => void;
}) {
  return (
    <div className="card">
      <div className="row" style={{ alignItems: "end" }}>
        <Field label="Cube size">
          <select className="select" value={size} onChange={(e) => setSize(Number(e.target.value) as 2 | 3)}>
            <option value={3}>3×3</option>
            <option value={2}>2×2</option>
          </select>
        </Field>
        <Field label="Method">
          <select className="select" value={mode} onChange={(e) => setMode(e.target.value as any)}>
            <option value="computational">Computational (fast)</option>
            <option value="human">Human-like (CFOP/Ortega)</option>
          </select>
        </Field>
      </div>
    </div>
  );
}
