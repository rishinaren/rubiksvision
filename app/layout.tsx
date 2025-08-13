import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Rubik’s Web Solver",
  description: "Scan, confirm, and solve 2×2/3×3 with step-by-step playback"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <h1>Rubik’s Web Solver</h1>
          <p className="small">Desktop-first • 2×2 & 3×3 • Human-like (scaffold) or Computational</p>
          {children}
        </div>
      </body>
    </html>
  );
}
