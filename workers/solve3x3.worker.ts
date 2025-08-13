// NOTE: Web Worker-like module function (we keep it simple by exporting a function; Next.js bundles it fine)
// cubejs implements Kociemba two-phase solver in JS.

export async function solve3x3(faceletsURFDLB: string): Promise<string> {
  const Cube: any = (await import('cubejs')).default;
  if (!Cube.initSolver) {
    // Some builds expose as function, handle both
    (Cube as any).initSolver?.();
  } else {
    Cube.initSolver();
  }
  const cube = new Cube();
  try {
    cube.fromString(faceletsURFDLB);
  } catch (e: any) {
    throw new Error('Invalid or unsolvable facelets input.');
  }
  const solution: string = cube.solve(); // e.g., "R U R' U' ..."
  if (!solution || !solution.trim()) throw new Error('Unsolvable state.');
  return solution.trim();
}
