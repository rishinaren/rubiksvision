# RubiksVision - AI Cube Solver

A web application that uses computer vision to solve Rubik's cubes automatically.

## What It Does
- **Camera Detection**: Point your camera at each face of a scrambled cube
- **Color Recognition**: Uses OpenCV.js for real-time color analysis  
- **3D Visualization**: Interactive 2D cube representation for verification
- **Step-by-Step Solution**: Generates human-readable solving instructions

## Tech Stack
- **Frontend**: Next.js 14, TypeScript, React
- **Computer Vision**: OpenCV.js for image processing
- **Algorithm**: Kociemba two-phase solver for optimal solutions
- **Deployment**: Vercel-ready

## Quick Start
```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Key Features
- Real-time face capture and color detection
- Interactive cube orientation adjustment
- Optimized solving algorithms (20 moves or less)
- Mobile-responsive design
- Error handling for invalid cube states

---
*Built with modern web technologies for computer vision and algorithmic problem solving.*

