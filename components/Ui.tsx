"use client";
import { ReactNode } from "react";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid" style={{ gap: 6 }}>
      <span className="label">{label}</span>
      {children}
    </label>
  );
}
