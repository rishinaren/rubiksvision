// NOTE: Web Worker-like module function (we keep it simple by exporting a function; Next.js bundles it fine)
// cubejs implements Kociemba two-phase solver in JS.

export async function solve3x3(faceletsURFDLB: string): Promise<string> {
  console.log('Attempting to solve with facelets:', faceletsURFDLB);
  
  try {
    // Try different import patterns for CubeJS
    const cubeModule = await import('cubejs');
    console.log('CubeJS module loaded:', cubeModule);
    
    let Cube: any;
    if (cubeModule.default) {
      Cube = cubeModule.default;
    } else if (cubeModule.Cube) {
      Cube = cubeModule.Cube;
    } else {
      Cube = cubeModule;
    }
    
    console.log('Cube constructor:', Cube);
    console.log('Available methods:', Object.getOwnPropertyNames(Cube.prototype || {}));
    
    // Initialize solver if needed
    if (typeof Cube.initSolver === 'function') {
      Cube.initSolver();
    } else if (Cube.prototype && typeof Cube.prototype.initSolver === 'function') {
      Cube.prototype.initSolver();
    }
    
    const cube = new Cube();
    console.log('Cube instance created:', cube);
    console.log('Cube instance methods:', Object.getOwnPropertyNames(cube));
    
    // Basic validation
    if (faceletsURFDLB.length !== 54) {
      throw new Error(`Invalid facelets length: expected 54, got ${faceletsURFDLB.length}`);
    }
    
    // Try different method names
    let setupMethod: string | null = null;
    if (typeof cube.fromString === 'function') {
      setupMethod = 'fromString';
    } else if (typeof cube.fromScramble === 'function') {
      setupMethod = 'fromScramble';
    } else if (typeof cube.setFacelets === 'function') {
      setupMethod = 'setFacelets';
    } else if (typeof cube.setState === 'function') {
      setupMethod = 'setState';
    }
    
    console.log('Using setup method:', setupMethod);
    
    if (!setupMethod) {
      throw new Error('No valid method found to set cube state. Available methods: ' + Object.getOwnPropertyNames(cube).join(', '));
    }
    
    // Set up the cube
    cube[setupMethod](faceletsURFDLB);
    console.log('Successfully created cube from facelets');
    
    // Try to solve
    let solution: string;
    if (typeof cube.solve === 'function') {
      solution = cube.solve();
    } else {
      throw new Error('No solve method found on cube instance');
    }
    
    console.log('Solution found:', solution);
    
    if (!solution || !solution.trim()) {
      throw new Error('No solution found - cube may already be solved or in an impossible state.');
    }
    
    return solution.trim();
    
  } catch (e: any) {
    console.error('Full error details:', e);
    throw new Error(`Cube solving failed: ${e.message || 'Unknown error'}`);
  }
}
