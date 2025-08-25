import { buildAnimCubeFacelets } from "@/lib/facelets";

let cvLoaded: Promise<void> | null = null;
export function loadOpenCV(): Promise<void> {
  if (cvLoaded) return cvLoaded;
  cvLoaded = new Promise((resolve, reject) => {
    // Load OpenCV.js from CDN in browser
    const script = document.createElement("script");
    script.src = "https://docs.opencv.org/4.x/opencv.js";
    script.async = true;
    script.onload = () => {
      const wait = () =>
        (globalThis as any).cv ? resolve() : setTimeout(wait, 30);
      wait();
    };
    script.onerror = () => reject(new Error("Failed to load OpenCV.js"));
    document.body.appendChild(script);
  });
  return cvLoaded;
}
/**
 * Load AnimCube and mount inside the provided element.
 * IMPORTANT: Pass `id=` so the viewer renders inside `mount`, per AnimCube docs.
 */
export async function loadAnimCube(
  size: 2 | 3,
  mount: HTMLElement,
  opts: {
    moves?: string;
    faces?: import("@/lib/facelets").FaceColors | null;
    width?: number;
    height?: number;
  }
) {
  // Ensure a stable id for the container div
  if (!mount.id) {
    mount.id = `acjs-${Math.random().toString(36).slice(2)}`;
  }
  const id = mount.id;

  // Ensure mount is a valid element
  if (!(mount instanceof HTMLElement)) {
    console.warn("Invalid mount element:", mount);
    return () => {};
  }
  // Compute size: full card width, fixed height unless caller overrides
  const width = Math.max(320, Math.round(opts.width ?? mount.clientWidth ?? 320));
  const height = Math.max(320, Math.round(opts.height ?? 380));

  // Load the correct AnimCube script (self-host if you prefer)
  const scriptTagId = `animcube-lib-${size}`;
  if (!document.getElementById(scriptTagId)) {
    const s = document.createElement("script");
    s.id = scriptTagId;
    s.src =
      size === 2
        ? "https://animcubejs.cubing.net/AnimCube2.js"
        : "https://animcubejs.cubing.net/AnimCube3.js";
    document.head.appendChild(s);
    await new Promise((r) => (s.onload = () => r(null)));
  }

  // Build parameter string with id + optional facelets + moves
  const params = new URLSearchParams({
    id,
    width: String(width),
    height: String(height),
    move: opts.moves || "",
    buttonbar: "1",
    repeat: "0",
    clickprogress: "0",
    edit: "1",
  });

  if (opts.faces) {
    params.set("facelets", buildAnimCubeFacelets(opts.faces));
  }

  // Clear and run the init script inside the mount (AnimCube renders into div#id)
  try {
    // Ensure mount is a valid DOM element with required methods
    if (!mount || typeof mount.innerHTML !== 'string') {
      console.warn("Cannot mount AnimCube: invalid mount element", mount);
      return () => {};
    }

    // Clear the mount element
    mount.innerHTML = "";

    // Create and append the init script
    const initScript = document.createElement("script");
    initScript.textContent = `${size === 2 ? "AnimCube2" : "AnimCube3"}("${params.toString()}")`;
    
    // Use a more robust method to append the script
    if (mount.appendChild && typeof mount.appendChild === 'function') {
      mount.appendChild(initScript);
    } else {
      // Fallback method
      mount.insertAdjacentElement('beforeend', initScript);
    }
  } catch (e) {
    console.error("Error mounting AnimCube:", e);
    // Provide a fallback display
    if (mount && typeof mount.innerHTML === 'string') {
      mount.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 380px; background: #f0f0f0; border-radius: 8px; color: #666; flex-direction: column;">
          <div style="font-size: 48px; margin-bottom: 16px;">🧩</div>
          <div>3D Cube View</div>
          <div style="font-size: 12px; margin-top: 8px;">Loading...</div>
        </div>
      `;
    }
  }

  // Cleanup
  return () => {
    mount.innerHTML = "";
  };
}
