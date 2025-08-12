let cvLoaded: Promise<void> | null = null;
export function loadOpenCV(): Promise<void> {
  if (cvLoaded) return cvLoaded;
  cvLoaded = new Promise((resolve, reject) => {
    // @techstark/opencv-js exposes global cv after import
    import("@techstark/opencv-js").then(() => {
      // wait a tick to ensure WASM is ready
      const wait = () => (globalThis as any).cv ? resolve() : setTimeout(wait, 30);
      wait();
    }).catch(reject);
  });
  return cvLoaded;
}

// Load AnimCube2/3 from CDN (or swap to self-hosted under /public/vendor/animcube)
export async function loadAnimCube(size: 2 | 3, mount: HTMLElement, moves: string) {
  const id = `animcube-${Math.random().toString(36).slice(2)}`;
  mount.innerHTML = `<div id="${id}" style="width: 320px; height: 350px"></div>`;
  const scriptId = `animcube-script-${size}`;
  if (!document.getElementById(scriptId)) {
    const s = document.createElement("script");
    s.id = scriptId;
    s.src = size === 2
      ? "https://animcubejs.cubing.net/AnimCube2.js"
      : "https://animcubejs.cubing.net/AnimCube3.js";
    document.head.appendChild(s);
    await new Promise((r) => s.onload = () => r(null));
  }
  const fn = (globalThis as any)[size === 2 ? "AnimCube2" : "AnimCube3"];
  const params = new URLSearchParams({
    move: moves || "",
    edit: "1",
    buttonbar: "1",
    repeat: "0",
    clickprogress: "0",
  }).toString();
  const script = document.createElement("script");
  script.text = `${size === 2 ? "AnimCube2" : "AnimCube3"}("${params}")`;
  mount.appendChild(script);
  return () => { mount.innerHTML = ""; };
}
