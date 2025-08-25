"use client";
import { useState } from "react";
import { FaceColors, FaceKey, colorLetterToHex, ColorLetter } from "@/lib/facelets";

// Rotate a 3x3 grid 90 degrees counter-clockwise 
function rotateCCW(grid: ColorLetter[][]): ColorLetter[][] {
  const N = grid.length;
  const out: ColorLetter[][] = Array.from({ length: N }, () => Array(N) as ColorLetter[]);
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      out[N - 1 - j][i] = grid[i][j];
    }
  }
  return out;
}

// Individual face component that can be clicked
function ClickableFace({ 
  faceKey, 
  colors, 
  isSelected, 
  onClick 
}: { 
  faceKey: FaceKey; 
  colors: ColorLetter[][]; 
  isSelected: boolean;
  onClick: () => void;
}) {
  const faceNames: Record<FaceKey, string> = {
    U: 'Up',
    F: 'Front', 
    R: 'Right',
    B: 'Back',
    L: 'Left',
    D: 'Down'
  };

  return (
    <div 
      onClick={onClick}
      style={{
        cursor: 'pointer',
        border: isSelected ? '3px solid #007acc' : '2px solid #ddd',
        borderRadius: '8px',
        padding: '8px',
        background: isSelected ? '#f0f8ff' : '#fff',
        transition: 'all 0.2s ease',
        boxShadow: isSelected ? '0 4px 12px rgba(0,122,204,0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '8px', 
        fontWeight: 'bold',
        fontSize: '14px',
        color: isSelected ? '#007acc' : '#333'
      }}>
        {faceNames[faceKey]}
      </div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 40px)', 
        gap: 2,
        justifyContent: 'center'
      }}>
        {colors.flatMap((row: ColorLetter[], i: number) =>
          row.map((color: ColorLetter, j: number) => (
            <div
              key={`${faceKey}-${i}-${j}`}
              style={{
                width: 40,
                height: 40,
                background: colorLetterToHex[color],
                border: '1px solid #333',
                borderRadius: '3px',
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

// 2D flattened cube representation (like an unfolded cardboard box)
function FlattenedCubeDisplay({ 
  faces, 
  selectedFace, 
  onFaceClick 
}: { 
  faces: FaceColors; 
  selectedFace: FaceKey | null;
  onFaceClick: (faceKey: FaceKey) => void;
}) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 140px)',
      gridTemplateRows: 'repeat(3, 140px)',
      gap: 12,
      justifyContent: 'center',
      margin: '20px 0',
      background: '#f8f9fa',
      padding: '20px',
      borderRadius: '12px',
      border: '1px solid #e9ecef'
    }}>
      {/* Top row - Up face */}
      <div></div>
      <ClickableFace 
        faceKey="U" 
        colors={faces.U} 
        isSelected={selectedFace === 'U'}
        onClick={() => onFaceClick('U')}
      />
      <div></div>
      <div></div>

      {/* Middle row - Left, Front, Right, Back */}
      <ClickableFace 
        faceKey="L" 
        colors={faces.L} 
        isSelected={selectedFace === 'L'}
        onClick={() => onFaceClick('L')}
      />
      <ClickableFace 
        faceKey="F" 
        colors={faces.F} 
        isSelected={selectedFace === 'F'}
        onClick={() => onFaceClick('F')}
      />
      <ClickableFace 
        faceKey="R" 
        colors={faces.R} 
        isSelected={selectedFace === 'R'}
        onClick={() => onFaceClick('R')}
      />
      <ClickableFace 
        faceKey="B" 
        colors={faces.B} 
        isSelected={selectedFace === 'B'}
        onClick={() => onFaceClick('B')}
      />

      {/* Bottom row - Down face */}
      <div></div>
      <ClickableFace 
        faceKey="D" 
        colors={faces.D} 
        isSelected={selectedFace === 'D'}
        onClick={() => onFaceClick('D')}
      />
      <div></div>
      <div></div>
    </div>
  );
}

export default function InteractiveCubeViewer({
  faces,
  onFacesChange,
}: {
  faces: FaceColors;
  onFacesChange: (newFaces: FaceColors) => void;
}) {
  const [selectedFace, setSelectedFace] = useState<FaceKey | null>(null);
  const [previewFaces, setPreviewFaces] = useState<FaceColors>(faces);

  const handleFaceClick = (faceKey: FaceKey) => {
    setSelectedFace(faceKey);
    setPreviewFaces(faces);
  };

  const rotateFace = () => {
    if (!selectedFace) return;
    const newFaces = structuredClone(previewFaces);
    newFaces[selectedFace] = rotateCCW(newFaces[selectedFace]);
    setPreviewFaces(newFaces);
  };

  const confirmOrientation = () => {
    if (!selectedFace) return;
    onFacesChange(previewFaces);
    setSelectedFace(null);
  };

  const cancelOrientation = () => {
    setSelectedFace(null);
    setPreviewFaces(faces);
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>
          Your Cube Layout
        </h3>
        <p style={{ 
          fontSize: '14px', 
          color: '#666', 
          margin: 0 
        }}>
          Click on any face below to adjust its orientation if needed
        </p>
      </div>

      {/* 2D Flattened Cube Display */}
      <FlattenedCubeDisplay 
        faces={selectedFace ? previewFaces : faces}
        selectedFace={selectedFace}
        onFaceClick={handleFaceClick}
      />

      {/* Face orientation controls */}
      {selectedFace && (
        <div style={{ 
          background: '#fff', 
          padding: 20, 
          borderRadius: 12, 
          border: '2px solid #007acc',
          marginTop: 20,
          boxShadow: '0 4px 12px rgba(0,122,204,0.1)'
        }}>
          <h4 style={{ 
            marginBottom: 16, 
            textAlign: 'center',
            color: '#007acc' 
          }}>
            Adjusting {selectedFace === 'U' ? 'Up' : 
                      selectedFace === 'F' ? 'Front' :
                      selectedFace === 'R' ? 'Right' :
                      selectedFace === 'B' ? 'Back' :
                      selectedFace === 'L' ? 'Left' : 'Down'} Face
          </h4>
          
          {/* Large preview of the selected face */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 60px)', 
            gap: 4, 
            justifyContent: 'center',
            margin: '20px 0',
            padding: '16px',
            background: '#f8f9fa',
            borderRadius: '8px'
          }}>
            {previewFaces[selectedFace].flatMap((row: ColorLetter[], i: number) =>
              row.map((color: ColorLetter, j: number) => (
                <div
                  key={`preview-${i}-${j}`}
                  style={{
                    width: 60,
                    height: 60,
                    background: colorLetterToHex[color],
                    border: '2px solid #333',
                    borderRadius: 6,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
              ))
            )}
          </div>

          <div style={{ 
            display: 'flex', 
            gap: 16, 
            justifyContent: 'center',
            marginTop: 24
          }}>
            <button 
              className="btn secondary" 
              onClick={cancelOrientation}
              style={{ 
                padding: '12px 24px',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
            <button 
              className="btn secondary" 
              onClick={rotateFace}
              style={{ 
                padding: '12px 24px',
                fontSize: '14px'
              }}
            >
              🔄 Rotate 90°
            </button>
            <button 
              className="btn" 
              onClick={confirmOrientation}
              style={{ 
                padding: '12px 24px',
                fontSize: '14px'
              }}
            >
              ✓ Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
