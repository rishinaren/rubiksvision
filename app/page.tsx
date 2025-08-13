"use client";
import { useState } from "react";
import OptionsBar from "@/components/OptionsBar";
import CaptureStep from "@/components/CaptureStep";
import FaceGridEditor from "@/components/FaceGridEditor";
import CubeViewer from "@/components/CubeViewer";
import SolvePlayer from "@/components/SolvePlayer";
import { buildURFDLBFromFaces, FaceColors, supportedPalette, embed2x2Into3x3 } from "@/lib/facelets";
import { loadOpenCV } from "@/lib/loader";

export default function Page() {
  const [size, setSize] = useState<2 | 3>(3);
  const [faces, setFaces] = useState<FaceColors | null>(null); // U,R,F,D,L,B each 3×3/2×2 arrays
  const [moves, setMoves] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onScanned = (result: FaceColors) => setFaces(result);

  const onSolve = async () => {
    if (!faces) return;
    setError(null);
    setBusy(true);
    try {
      // Always compute a valid 3×3 facelet string; 2×2 is embedded into a 3×3 corner-equivalent state
      const f3 = size === 2 ? embed2x2Into3x3(faces) : faces;
      const facelets = buildURFDLBFromFaces(f3, 3);
      const { solve3x3 } = await import("@/workers/solve3x3.worker");
      const solution = await solve3x3(facelets);
      setMoves(solution);
    } catch (e: any) {
      setError(e?.message ?? "Unsolvable or invalid state. Please edit colors and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid" style={{ gap: 24 }}>
      <OptionsBar size={size} setSize={setSize} />

      {!faces && (
        <div className="card">
          <h2>1) Scan faces (webcam)</h2>
          <p className="small">You’ll see a live camera view below. Snap each side, fix any tiles, then confirm.</p>
          <CaptureStep size={size} onScanned={onScanned} loadOpenCV={loadOpenCV} />
        </div>
      )}

      {faces && (
        <div className="row">
          <div className="card" style={{ flex: 1, minWidth: 420 }}>
            <h2>2) Confirm & fix colors</h2>
            <FaceGridEditor size={size} faces={faces} onChange={setFaces} palette={supportedPalette} />
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button className="btn secondary" onClick={() => setFaces(null)}>Retake</button>
              <button className="btn" onClick={onSolve} disabled={busy}>
                {busy ? "Solving…" : "Solve"}
              </button>
            </div>
            {error && <p className="small" style={{ color: "#f87171" }}>{error}</p>}
          </div>

          <div className="card" style={{ flex: 1, minWidth: 420 }}>
            <h2>3) Step-through player</h2>
            <SolvePlayer size={size} moves={moves} />
          </div>
        </div>
      )}

      <div className="card">
        <h2>Live 3D Cube</h2>
        <CubeViewer size={size} faces={faces} moves={moves} />
      </div>
    </div>
  );
}
