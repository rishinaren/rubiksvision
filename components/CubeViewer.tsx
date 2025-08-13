"use client";
import { useEffect, useRef } from "react";
import { loadAnimCube } from "@/lib/loader";
import type { FaceColors } from "@/lib/facelets";

export default function CubeViewer({
  size,
  faces,
  moves,
}: {
  size: 2 | 3;
  faces: FaceColors | null;
  moves: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    (async () => {
      const el = ref.current!;
      const rect = el.getBoundingClientRect();
      cleanup = await loadAnimCube(size, el, {
        moves,
        faces,
        width: Math.round(rect.width),
        height: 380,
      });
    })();
    return () => cleanup?.();
  }, [size, faces, moves]);

  return <div ref={ref} className="ac-container" />;
}
