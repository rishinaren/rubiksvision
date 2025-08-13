import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Rubik’s Web Solver",
  description:
    "Point your camera at each face, confirm colors, and get an animated, step-by-step solution.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="container" style={{ marginBottom: 12 }}>
          <h1>Rubik’s Web Solver</h1>
          <p className="small" style={{ maxWidth: 800 }}>
            No sign-in. No uploads. We read colors locally in your browser, then
            animate a step-by-step solve. Works for <b>2×2</b> and <b>3×3</b>.
            Good indoor lighting helps.
          </p>
          <ol className="small" style={{ marginTop: 8, maxWidth: 800 }}>
            <li>Choose cube size.</li>
            <li>
              Use your camera to capture each face in order (U, R, F, D, L, B).
            </li>
            <li>
              Fix any misread stickers, confirm each face, then click <b>Solve</b>.
            </li>
            <li>Follow the animated steps or read the move text.</li>
          </ol>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
