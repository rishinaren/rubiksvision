# Rubik’s Cube Web Solver (2×2 & 3×3)

**Stack**: Next.js + TypeScript, OpenCV.js (grid sampling), AnimCubeJS (3D viewer + facelets), Kociemba JS solver (cube.js).

## Quick start

```bash
pnpm i   # or npm i / yarn
pnpm dev # http://localhost:3000
```

## Notes

* **Scanning**: MVP samples an N×N grid from the central image region (good lighting assumed). You can upgrade to contour detection + homography with OpenCV.js later.
* **3D viewer**: AnimCubeJS is loaded from CDN. To self-host, download `AnimCube2.js` and `AnimCube3.js` into `public/vendor/animcube/` and change the URLs in `lib/loader.ts`.
* **Solving**: 3×3 uses a two-phase solver (Kociemba). 2×2 embeds the corner state into a 3×3 to reuse the same solver.
* **Human-like methods**: `lib/humanLike.ts` provides stubs where you can implement CFOP (3×3) and Ortega (2×2) with case detection and predefined alg sets. The UI already supports stepwise playback and explanations.

## License

Free/open-source dependencies; you should keep their LICENSE files when vendoring any assets.
