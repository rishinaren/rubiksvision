"use client";
import { useEffect, useRef, useState } from "react";
import { analyzeImageGrid } from "@/lib/colors";
import {
  ColorLetter,
  FaceColors,
  FaceKey,
  emptyFaceColors,
  colorLetterToHex,
  supportedPalette,
} from "@/lib/facelets";

const ORDER: FaceKey[] = ["U", "R", "F", "D", "L", "B"];
const FACE_LABELS: Record<FaceKey, string> = {
  U: "Up (White center)",
  R: "Right (Red center)",  
  F: "Front (Green center)",
  D: "Down (Yellow center)",
  L: "Left (Orange center)",
  B: "Back (Blue center)",
};

const FACE_INSTRUCTIONS: Record<FaceKey, string> = {
  U: "Hold the cube with the white center facing up towards the camera",
  R: "Hold the cube with the red center facing towards the camera", 
  F: "Hold the cube with the green center facing towards the camera",
  D: "Hold the cube with the yellow center facing towards the camera",
  L: "Hold the cube with the orange center facing towards the camera", 
  B: "Hold the cube with the blue center facing towards the camera",
};

export default function CaptureStep({
  onScanned,
  loadOpenCV,
}: {
  onScanned: (faces: FaceColors) => void;
  loadOpenCV: () => Promise<void>;
}) {
  const size = 3; // Hardcoded to 3x3 only
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [faces, setFaces] = useState<FaceColors>(emptyFaceColors(size));
  const [step, setStep] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [detected, setDetected] = useState<ColorLetter[][] | null>(null);
  const [stage, setStage] = useState<'capture' | 'review'>('capture');
  
  const currentFace = ORDER[step];

  // Request camera on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" } 
        });
        if (cancelled) return;
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        // camera access denied
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Resume camera when returning to capture stage
  useEffect(() => {
    if (stage === 'capture' && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play();
    }
  }, [stage]);

  const snap = async () => {
    await loadOpenCV();
    const el = videoRef.current;
    if (!el || !el.videoWidth || !el.videoHeight) return;
    
    const canvas = document.createElement("canvas");
    canvas.width = el.videoWidth;
    canvas.height = el.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(el, 0, 0);
    const url = canvas.toDataURL("image/jpeg", 0.9);
    setPreviewUrl(url);
    
    const img = await loadImage(url);
    const grid = analyzeImageGrid(img, size);
    setDetected(grid);
    setStage('review');
  };

  const clickSticker = (i: number, j: number) => {
    if (!detected) return;
    const p = supportedPalette;
    const cur = detected[i][j];
    const next = p[(p.indexOf(cur) + 1) % p.length];
    const copy = detected.map((r) => r.slice());
    copy[i][j] = next;
    setDetected(copy);
  };

  const confirmFace = () => {
    if (!detected) return;
    const updated = structuredClone(faces);
    updated[currentFace] = detected;
    setFaces(updated);
    
    if (step < ORDER.length - 1) {
      // Move to next face
      setStep(step + 1);
      setDetected(null);
      setPreviewUrl(null);
      setStage('capture');
    } else {
      // All faces captured
      onScanned(updated);
    }
  };

  const retake = () => {
    setDetected(null);
    setPreviewUrl(null);
    setStage('capture');
  };

  return (
    <div className="grid" style={{ gap: 16 }}>
      {/* Progress indicator */}
      <div style={{ textAlign: 'center' }}>
        <h3>Face {step + 1} of 6: {FACE_LABELS[currentFace]}</h3>
        <p className="small" style={{ marginBottom: 16 }}>
          {FACE_INSTRUCTIONS[currentFace]}
        </p>
      </div>

      {/* Previously captured faces */}
      {step > 0 && (
        <div>
          <h4>Previously Captured:</h4>
          <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
            {ORDER.slice(0, step).map((faceKey) => (
              <div key={faceKey} style={{ textAlign: "center" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(3, 16px)`,
                    gap: 2,
                    border: '1px solid #ccc',
                    padding: 4,
                    borderRadius: 4,
                  }}
                >
                  {faces[faceKey].flatMap((row, i) =>
                    row.map((c, j) => (
                      <div
                        key={`${faceKey}-${i}-${j}`}
                        style={{ 
                          width: 16, 
                          height: 16, 
                          background: colorLetterToHex[c],
                          border: '1px solid #666'
                        }}
                      />
                    ))
                  )}
                </div>
                <div style={{ fontSize: 12, marginTop: 4 }}>{faceKey}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Capture Stage */}
      {stage === 'capture' && (
        <>
          <div style={{ textAlign: 'center' }}>
            <button className="btn" onClick={snap} style={{ fontSize: 18, padding: '12px 24px' }}>
              📸 Snap Picture
            </button>
          </div>

          <div className="card" style={{ background: "#0b0e14" }}>
            <video
              ref={videoRef}
              muted
              playsInline
              style={{ width: "100%", maxHeight: 400, borderRadius: 8 }}
            />
          </div>
        </>
      )}

      {/* Review Stage */}
      {stage === 'review' && previewUrl && detected && (
        <div className="row" style={{ alignItems: "flex-start", gap: 16 }}>
          <div className="card" style={{ background: "#0b0e14", flex: 1 }}>
            <img 
              src={previewUrl} 
              alt="captured face" 
              style={{ width: "100%", borderRadius: 8 }} 
            />
          </div>
          
          <div className="card" style={{ flex: 1 }}>
            <h4>Detected Colors</h4>
            <p className="small">Tap any tile to cycle through colors if needed:</p>
            
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 50px)",
              gap: 8,
              justifyContent: 'center',
              margin: '16px 0'
            }}>
              {detected.flatMap((row, i) =>
                row.map((c, j) => (
                  <button 
                    key={`${i}-${j}`} 
                    onClick={() => clickSticker(i, j)}
                    style={{ 
                      width: 50, 
                      height: 50, 
                      borderRadius: 8, 
                      border: "2px solid #333", 
                      background: colorLetterToHex[c],
                      cursor: 'pointer'
                    }} 
                  />
                ))
              )}
            </div>
            
            <div className="row" style={{ gap: 12, justifyContent: 'center' }}>
              <button className="btn secondary" onClick={retake}>
                Retake
              </button>
              <button className="btn" onClick={confirmFace}>
                ✓ Confirm Face
              </button>
            </div>
          </div>
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
