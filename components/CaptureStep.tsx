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
import { Field } from "./Ui";

const ORDER: FaceKey[] = ["U", "R", "F", "D", "L", "B"]; // capture sequence

export default function CaptureStep({
  size,
  onScanned,
  loadOpenCV,
}: {
  size: 2 | 3;
  onScanned: (faces: FaceColors) => void;
  loadOpenCV: () => Promise<void>;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [faces, setFaces] = useState<FaceColors>(emptyFaceColors(size));
  const [step, setStep] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [detected, setDetected] = useState<ColorLetter[][] | null>(null);
  const capturingFace = ORDER[step];

  // Request camera on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        // Optional: show a message if camera isn't available/allowed
      }
    })();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Take a snapshot from the live video and classify an N×N grid
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
  };

  // Allow fixing individual stickers before confirm
  const clickSticker = (i: number, j: number) => {
    if (!detected) return;
    const idx = supportedPalette.indexOf(detected[i][j]);
    const next = supportedPalette[(idx + 1) % supportedPalette.length];
    const copy = detected.map((row) => row.slice()) as ColorLetter[][];
    copy[i][j] = next;
    setDetected(copy);
  };

  const confirmFace = () => {
    if (!detected) return;
    const copy = structuredClone(faces);
    copy[capturingFace] = detected;
    setFaces(copy);
    setDetected(null);
    setPreviewUrl(null);
    if (step < ORDER.length - 1) setStep(step + 1);
    else onScanned(copy);
  };

  const retake = () => {
    setDetected(null);
    setPreviewUrl(null);
  };

  return (
    <div className="grid" style={{ gap: 12 }}>
      <div className="row" style={{ alignItems: "end" }}>
        <Field label={`Capture face ${step + 1} of 6 (${capturingFace})`}>
          <div className="row">
            <button className="btn" onClick={snap}>
              Snap
            </button>
          </div>
        </Field>
        {previewUrl && (
          <div className="row" style={{ gap: 8 }}>
            <button className="btn" onClick={confirmFace}>
              Confirm
            </button>
            <button className="btn secondary" onClick={retake}>
              Retake
            </button>
          </div>
        )}
      </div>

      {/* Live camera view */}
      {!previewUrl && (
        <div className="card" style={{ background: "#0b0e14" }}>
          <video
            ref={videoRef}
            style={{ width: "100%", maxHeight: 360, borderRadius: 8 }}
            muted
            playsInline
          />
        </div>
      )}

      {/* Snapshot review with editable grid */}
      {previewUrl && detected && (
        <div className="row" style={{ alignItems: "flex-start" }}>
          <div className="card" style={{ background: "#0b0e14" }}>
            <img
              src={previewUrl}
              alt="captured face"
              style={{ maxWidth: 380, borderRadius: 8 }}
            />
          </div>
          <div className="card">
            <h4>Our read (click stickers to change)</h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${size}, 40px)`,
                gap: 6,
              }}
            >
              {detected.flatMap((row, i) =>
                row.map((c, j) => (
                  <button
                    key={`${i}-${j}`}
                    onClick={() => clickSticker(i, j)}
                    title={`[${i},${j}]`}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 6,
                      border: "1px solid #2a3147",
                      background: colorLetterToHex[c],
                    }}
                  />
                ))
              )}
            </div>
            <div className="row" style={{ marginTop: 10 }}>
              <button className="btn" onClick={confirmFace}>
                Confirm
              </button>
              <button className="btn secondary" onClick={retake}>
                Retake
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
