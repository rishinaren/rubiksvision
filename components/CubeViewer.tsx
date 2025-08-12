"use client";
import { useEffect, useRef } from "react";
import { loadAnimCube } from "@/lib/loader";

export default function CubeViewer({ size, moves }: { size: 2 | 3; moves: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    (async () => {
      cleanup = await loadAnimCube(size, containerRef.current!, moves);
    })();
    return () => { cleanup?.(); };
  }, [size, moves]);

  return (
    <div ref={containerRef} style={{ width: 320, height: 350 }} />
  );
}
