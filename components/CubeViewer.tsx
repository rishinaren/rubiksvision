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
    if (!ref.current) return;
    let cleanupFn: (() => void) | undefined;
    const doLoad = async () => {
      const el = ref.current!;
      const rect = el.getBoundingClientRect();
      cleanupFn = await loadAnimCube(size, el, {
        moves,
        faces: faces || null,
        width: Math.round(rect.width),
        height: 380,
      });
    };
    doLoad();
    return () => {
      if (cleanupFn) cleanupFn();
    };
  }, [size, faces, moves]);

  return <div ref={ref} className="ac-container" />;
}
