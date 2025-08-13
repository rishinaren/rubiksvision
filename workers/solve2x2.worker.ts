import { FaceColors, embed2x2Into3x3, buildURFDLBFromFaces } from "@/lib/facelets";
import { solve3x3 } from "./solve3x3.worker";

export async function solve2x2(faces2x2: FaceColors): Promise<string> {
  const f3 = embed2x2Into3x3(faces2x2);
  const facelets = buildURFDLBFromFaces(f3, 3);
  return solve3x3(facelets);
}
