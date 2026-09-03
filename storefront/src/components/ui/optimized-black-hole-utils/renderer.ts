export type RendererOptions = {
  canvas: HTMLCanvasElement;
};

type Star = {
  x: number;
  y: number;
  z: number;
  size: number;
  alpha: number;
};

export function createRenderer({ canvas }: RendererOptions) {
  const context = canvas.getContext("2d");
  let animationFrame = 0;
  let disposed = false;
  let width = 0;
  let height = 0;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = Math.max(1, rect.width || canvas.clientWidth || window.innerWidth);
    height = Math.max(1, rect.height || canvas.clientHeight || window.innerHeight);

    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));

    if (context) {
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  };

  const starCount = Math.max(140, Math.min(260, Math.floor((width || 1200) * 0.18)));
  const stars: Star[] = Array.from({ length: starCount }, () => ({
    x: Math.random() * (width || 1),
    y: Math.random() * (height || 1),
    z: Math.random() * 1 + 0.2,
    size: Math.random() * 2 + 0.8,
    alpha: Math.random() * 0.9 + 0.1,
  }));

  const render = (time: number) => {
    if (disposed || !context) return;

    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.15;

    context.clearRect(0, 0, width, height);
    context.fillStyle = "#000000";
    context.fillRect(0, 0, width, height);

    context.save();
    context.translate(cx, cy);
    context.rotate(time * 0.00012);

    const halo = context.createRadialGradient(0, 0, radius * 0.1, 0, 0, radius * 2.8);
    halo.addColorStop(0, "rgba(255,255,255,0.22)");
    halo.addColorStop(0.12, "rgba(167,139,250,0.18)");
    halo.addColorStop(0.35, "rgba(59,130,246,0.14)");
    halo.addColorStop(1, "rgba(0,0,0,0)");
    context.fillStyle = halo;
    context.beginPath();
    context.arc(0, 0, radius * 2.8, 0, Math.PI * 2);
    context.fill();

    for (let i = 0; i < 10; i += 1) {
      const ringRadius = radius * (0.4 + i * 0.18);
      context.beginPath();
      context.strokeStyle = `rgba(255,255,255,${0.06 + i * 0.015})`;
      context.lineWidth = 1.2;
      context.arc(0, 0, ringRadius, 0, Math.PI * 2);
      context.stroke();
    }

    const core = context.createRadialGradient(0, 0, radius * 0.12, 0, 0, radius * 1.4);
    core.addColorStop(0, "rgba(255,255,255,0.95)");
    core.addColorStop(0.08, "rgba(255,255,255,0.95)");
    core.addColorStop(0.12, "rgba(59,130,246,0.65)");
    core.addColorStop(0.22, "rgba(17,24,39,0.85)");
    core.addColorStop(0.7, "rgba(2,6,23,0.98)");
    core.addColorStop(1, "rgba(0,0,0,1)");
    context.fillStyle = core;
    context.beginPath();
    context.arc(0, 0, radius * 1.4, 0, Math.PI * 2);
    context.fill();

    context.restore();

    for (const star of stars) {
      const drift = (time * 0.00025 * star.z) % (Math.PI * 2);
      const x = ((star.x - cx) * (1 + star.z * 0.35) + Math.cos(drift) * 30) + cx;
      const y = ((star.y - cy) * (1 + star.z * 0.35) + Math.sin(drift) * 30) + cy;

      if (x < 0 || x > width || y < 0 || y > height) {
        star.x = Math.random() * width;
        star.y = Math.random() * height;
      }

      context.beginPath();
      context.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
      context.arc(x, y, star.size, 0, Math.PI * 2);
      context.fill();
    }

    animationFrame = requestAnimationFrame(render);
  };

  resize();
  animationFrame = requestAnimationFrame(render);

  const onResize = () => resize();
  window.addEventListener("resize", onResize);

  return {
    ready: Promise.resolve(),
    dispose() {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", onResize);
    },
  };
}
