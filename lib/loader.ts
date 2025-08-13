import { buildAnimCubeFacelets } from "@/lib/facelets";

let cvLoaded: Promise<void> | null = null;
export function loadOpenCV(): Promise<void> {
  if (cvLoaded) return cvLoaded;
  cvLoaded = new Promise((resolve, reject) => {
    import("@techstark/opencv-js")
      .then(() => {
        const wait = () =>
          (globalThis as any).cv ? resolve() : setTimeout(wait, 30);
        wait();
      })
      .catch(reject);
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

  // Compute size: full card width, fixed height unless caller overrides
  const width = Math.max(320, Math.round(opts.width ?? mount.clientWidth || 320));
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
  mount.innerHTML = "";
  const initScript = document.createElement("script");
  initScript.text = `${
    size === 2 ? "AnimCube2" : "AnimCube3"
  }("${params.toString()}")`;
  mount.appendChild(initScript);

  // Cleanup
  return () => {
    mount.innerHTML = "";
  };
}
