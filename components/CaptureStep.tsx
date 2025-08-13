"use client";
import { useState } from "react";
import { analyzeImageGrid } from "@/lib/colors";
import { FaceColors, emptyFaceColors } from "@/lib/facelets";
import { Field } from "./Ui";

const FACE_ORDER: (keyof FaceColors)[] = ["U", "R", "F", "D", "L", "B"]; // URFDLB

export default function CaptureStep({
  size,
  onScanned,
  loadOpenCV
}: {
  size: 2 | 3;
  onScanned: (faces: FaceColors) => void;
  loadOpenCV: () => Promise<void>;
}) {
  const [step, setStep] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [faces, setFaces] = useState<FaceColors>(emptyFaceColors(size));
  const faceKey = FACE_ORDER[step];

  const onFile = async (file: File) => {
    await loadOpenCV();
    const url = URL.createObjectURL(file);
    setPreview(url);
    const img = await loadImage(url);
    const detected = analyzeImageGrid(img, size);
    setFaces((prev) => ({ ...prev, [faceKey]: detected }));
  };

  const confirm = () => {
    if (step < 5) setStep(step + 1);
    else onScanned(faces);
    setPreview(null);
  };

  return (
    <div className="grid" style={{ gap: 12 }}>
      <div className="row" style={{ alignItems: "end" }}>
        <Field label={`Upload face ${step + 1} of 6 (${faceKey})`}>
          <input type="file" accept="image/*" onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }} />
        </Field>
        {preview && (
          <div className="row" style={{ gap: 8 }}>
            <button className="btn" onClick={confirm}>Confirm</button>
            <button className="btn secondary" onClick={() => setPreview(null)}>Retake</button>
          </div>)
        }
      </div>
      {preview && (
        <div className="card" style={{ background: "#0b0e14", borderStyle: "dashed" }}>
          <img src={preview} alt="preview" style={{ maxWidth: "100%", borderRadius: 8 }} />
          <p className="small">We sampled an evenly spaced {size}×{size} grid in the central region. You can fix any misreads in the next step.</p>
        </div>
      )}
    </div>
  );
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
