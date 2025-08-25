"use client";
import { useMemo, useState } from "react";

function moveToEnglish(m: string): string {
  const faceMap: Record<string, string> = { R: "Right", L: "Left", U: "Up", D: "Down", F: "Front", B: "Back" };
  const face = faceMap[m[0]] || "";
  const prime = m.includes("'") ? "counter-clockwise" : "clockwise";
  const amount = m.includes("2") ? "180°" : "90°";
  return `${face} face ${amount} ${m.includes("2") ? "" : prime}`.trim();
}

export default function SolvePlayer({ 
  moves, 
  onRestart 
}: { 
  moves: string; 
  onRestart: () => void;
}) {
  const list = useMemo(() => moves.trim() ? moves.trim().split(/\s+/) : [], [moves]);
  const [idx, setIdx] = useState(0);
  const current = list[idx] || "";

  if (!list.length) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <p>No solution available yet.</p>
        <button className="btn secondary" onClick={onRestart}>
          Start Over
        </button>
      </div>
    );
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      {/* Solution perspective explanation */}
      <div className="card" style={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}>
        <h4>Solution Perspective</h4>
        <p className="small">
          This solution assumes you're holding the cube with the <strong>white face down</strong> and the <strong>green face facing you</strong>. 
          Make sure to orient your cube this way before following the steps.
        </p>
      </div>

      {/* Notation guide */}
      <div className="card">
        <h4>Cube Notation Guide</h4>
        <div className="row" style={{ gap: 16, flexWrap: 'wrap' }}>
          <div>
            <strong>Basic Moves:</strong>
            <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
              <li><strong>R</strong> = Right face clockwise</li>
              <li><strong>L</strong> = Left face clockwise</li>
              <li><strong>U</strong> = Up face clockwise</li>
              <li><strong>D</strong> = Down face clockwise</li>
              <li><strong>F</strong> = Front face clockwise</li>
              <li><strong>B</strong> = Back face clockwise</li>
            </ul>
          </div>
          <div>
            <strong>Modifiers:</strong>
            <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
              <li><strong>'</strong> (prime) = Counter-clockwise</li>
              <li><strong>2</strong> = Turn twice (180°)</li>
            </ul>
            <p className="small">Example: R' = Right face counter-clockwise</p>
          </div>
        </div>
      </div>

      {/* Step navigation */}
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3>Step {idx + 1} of {list.length}</h3>
          <div className="row" style={{ gap: 8 }}>
            <button 
              className="btn secondary" 
              onClick={() => setIdx(Math.max(0, idx - 1))} 
              disabled={idx === 0}
            >
              ← Back
            </button>
            <button 
              className="btn" 
              onClick={() => setIdx(Math.min(list.length - 1, idx + 1))} 
              disabled={idx === list.length - 1}
            >
              Next →
            </button>
          </div>
        </div>

        <div style={{ 
          textAlign: 'center', 
          padding: '24px', 
          background: '#f8f9fa', 
          borderRadius: 8,
          margin: '16px 0'
        }}>
          <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: 8 }}>
            {current}
          </div>
          <div style={{ fontSize: '18px', color: '#666' }}>
            {moveToEnglish(current)}
          </div>
        </div>

        <div className="row" style={{ gap: 8, justifyContent: 'center', marginTop: 16 }}>
          <button className="btn secondary" onClick={() => setIdx(0)}>
            ⏮ First Step
          </button>
          <button className="btn secondary" onClick={() => setIdx(list.length - 1)}>
            Last Step ⏭
          </button>
          <button className="btn secondary" onClick={() => navigator.clipboard.writeText(moves)}>
            📋 Copy All Moves
          </button>
          <button className="btn secondary" onClick={onRestart}>
            🔄 Solve Another Cube
          </button>
        </div>
      </div>
    </div>
  );
}
