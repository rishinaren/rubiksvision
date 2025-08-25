export type ColorLetter = 'W' | 'Y' | 'R' | 'O' | 'G' | 'B';
export type FaceKey = 'U' | 'R' | 'F' | 'D' | 'L' | 'B';

// Face -> grid of color letters
export type FaceColors = Record<FaceKey, ColorLetter[][]>;

export const supportedPalette: ColorLetter[] = ['W','Y','R','O','G','B'];
export const colorLetterToHex: Record<ColorLetter, string> = {
  W: '#ffffff', Y: '#ffd90a', R: '#d21f1f', O: '#ff8a00', G: '#0b7d39', B: '#0b4186'
};

export function emptyFaceColors(n: 2 | 3): FaceColors {
  const mk = (c: ColorLetter) => Array.from({ length: n }, () => Array.from({ length: n }, () => c));
  return { U: mk('W'), R: mk('R'), F: mk('G'), D: mk('Y'), L: mk('O'), B: mk('B') };
}

// Build Kociemba URFDLB facelet string for 3×3 from 3×3 face colors
// Colorscheme mapping: U=W, R=R, F=G, D=Y, L=O, B=B
export function buildURFDLBFromFaces(faces: FaceColors, size: 3 | 2): string {
  // For 2×2, caller should first embed into 3×3 (using embed2x2Into3x3)
  const order: FaceKey[] = ['U','R','F','D','L','B'];
  // Convert color letters to facelet letters by fixed centers
  const colorToFacelet: Record<ColorLetter, FaceKey> = { W: 'U', Y: 'D', R: 'R', O: 'L', G: 'F', B: 'B' };

  const pickFace = (grid: ColorLetter[][], face: FaceKey) => {
    const N = grid.length;
    let out = '';
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) out += colorToFacelet[grid[i][j]];
    return out;
  };

  // Expect 3×3
  if (faces.U.length !== 3) throw new Error('Expected 3×3 faces');
  
  const result = order.map(f => pickFace(faces[f], f)).join('');
  console.log('Built facelets for solver:', result);
  
  return result;
}

// Embed a scanned 2×2 into a 3×3 corner-equivalent state for Kociemba
// Corners are placed; edges are filled consistent with centers (solved). This yields a valid 3×3 state
// that produces a move sequence which also solves the corresponding 2×2.
export function embed2x2Into3x3(src: FaceColors): FaceColors {
  if (src.U.length !== 2) throw new Error('Expected 2×2 faces');
  const dst = emptyFaceColors(3);

  // Helper to map 2×2 stickers onto the 3×3 corners; edges/centers remain solved
  function mapFace(face: FaceKey, mapping: [number,number, number,number][]) {
    for (let k=0; k<mapping.length; k++) {
      const [si, sj, di, dj] = mapping[k];
      dst[face][di][dj] = src[face][si][sj];
    }
  }
  // For each face, map 2×2 to the 3×3 corners (indices: 0..2)
  mapFace('U', [ [0,0,0,0],[0,1,0,2],[1,0,2,0],[1,1,2,2] ]);
  mapFace('D', [ [0,0,0,0],[0,1,0,2],[1,0,2,0],[1,1,2,2] ]);
  mapFace('F', [ [0,0,0,0],[0,1,0,2],[1,0,2,0],[1,1,2,2] ]);
  mapFace('B', [ [0,0,0,0],[0,1,0,2],[1,0,2,0],[1,1,2,2] ]);
  mapFace('R', [ [0,0,0,0],[0,1,0,2],[1,0,2,0],[1,1,2,2] ]);
  mapFace('L', [ [0,0,0,0],[0,1,0,2],[1,0,2,0],[1,1,2,2] ]);

  return dst;
}

/**
 * Build a facelets parameter string for AnimCube: comma-separated hex colors
 */
export function buildAnimCubeFacelets(faces: FaceColors): string {
  // AnimCube expects faces in the order: Up, Left, Front, Right, Back, Down
  const order: FaceKey[] = ['U','L','F','R','B','D'];
  return order
    .map((face) =>
      faces[face]
        .flatMap((row) => row.map((c) => colorLetterToHex[c]))
        .join(',')
    )
    .join(',');
}
