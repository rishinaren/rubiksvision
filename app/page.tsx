"use client";
import { useState } from "react";
import CaptureStep from "@/components/CaptureStep";
import InteractiveCubeViewer from "@/components/InteractiveCubeViewer";
import SolvePlayer from "@/components/SolvePlayer";
import {
  buildURFDLBFromFaces,
  FaceColors,
} from "@/lib/facelets";
import { loadOpenCV } from "@/lib/loader";

type AppStage = 'capture' | 'review' | 'solve';

export default function Page() {
  const [stage, setStage] = useState<AppStage>('capture');
  const [faces, setFaces] = useState<FaceColors | null>(null);
  const [moves, setMoves] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onScanned = (result: FaceColors) => {
    setFaces(result);
    setStage('review');
  };

  const onSolve = async () => {
    if (!faces) return;
    setError(null);
    setBusy(true);
    try {
      const facelets = buildURFDLBFromFaces(faces, 3);
      console.log('Generated facelets string:', facelets);
      console.log('Faces object:', faces);
      
      const { solve3x3 } = await import("@/workers/solve3x3.worker");
      const solution = await solve3x3(facelets);
      setMoves(solution);
      setStage('solve');
    } catch (e: any) {
      console.error('Solve error:', e);
      setError(
        e?.message ?? "Unsolvable or invalid state. Please try capturing again."
      );
    } finally {
      setBusy(false);
    }
  };

  const restart = () => {
    setStage('capture');
    setFaces(null);
    setMoves("");
    setError(null);
  };

  return (
    <div className="grid" style={{ gap: 24, padding: 24 }}>
      <div className="card" style={{ textAlign: 'center' }}>
        <h1>RubiksVision - 3x3 Cube Solver</h1>
        <p className="small">
          Point your camera at each face of your scrambled Rubik's cube to get step-by-step solving instructions.
        </p>
      </div>

      {stage === 'capture' && (
        <div className="card">
          <h2>Capture Your Cube Faces</h2>
          <p className="small">
            Hold your cube steady and snap each face. You can edit colors if the detection isn't perfect.
          </p>
          <CaptureStep onScanned={onScanned} loadOpenCV={loadOpenCV} />
        </div>
      )}

      {stage === 'review' && faces && (
        <div className="card">
          <h2>Review Your Cube</h2>
          <p className="small">
            Inspect the 3D representation below. Click on faces to adjust orientation if needed.
          </p>
          <InteractiveCubeViewer 
            faces={faces} 
            onFacesChange={setFaces}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: 'center' }}>
            <button className="btn secondary" onClick={restart}>
              Start Over
            </button>
            <button className="btn" onClick={onSolve} disabled={busy}>
              {busy ? "Solving…" : "Solve Cube"}
            </button>
          </div>
          {error && (
            <p className="small" style={{ color: "#f87171", marginTop: 8 }}>
              {error}
            </p>
          )}
        </div>
      )}

      {stage === 'solve' && (
        <div className="card">
          <h2>Solution Steps</h2>
          <SolvePlayer moves={moves} onRestart={restart} />
        </div>
      )}
    </div>
  );
}
