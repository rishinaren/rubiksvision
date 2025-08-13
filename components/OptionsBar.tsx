"use client";
import { Field } from "./Ui";

export default function OptionsBar({
  size,
  setSize
}: {
  size: 2 | 3;
  setSize: (n: 2 | 3) => void;
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
      </div>
    </div>
  );
}
