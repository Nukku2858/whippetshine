import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  color: string;
}

const WaterSplashParticles = ({ containerRef }: { containerRef: React.RefObject<HTMLDivElement> }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const particles: Particle[] = [];
    const CYCLE = 10000; // 10s loop
    const DELAY = 1000;
    const startTime = performance.now() + DELAY;

    const waterColors = [
      "hsl(200, 90%, 85%)",
      "hsl(200, 95%, 95%)",
      "hsl(200, 80%, 75%)",
      "hsl(0, 0%, 100%)",
    ];
    const mudColors = [
      "hsl(30, 40%, 35%)",
      "hsl(30, 50%, 25%)",
      "hsl(25, 45%, 30%)",
      "hsl(20, 35%, 22%)",
    ];

    const spawnWaterParticles = (x: number) => {
      const count = Math.floor(Math.random() * 10) + 6;
      for (let i = 0; i < count; i++) {
        const isMud = Math.random() < 0.4;
        particles.push({
          x,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.2) * 8 + 2,
          vy: (Math.random() - 0.5) * 12,
          size: Math.random() * 5 + 1.5,
          opacity: Math.random() * 0.5 + 0.5,
          life: 0,
          maxLife: Math.random() * 50 + 30,
          color: isMud ? mudColors[Math.floor(Math.random() * mudColors.length)] : waterColors[Math.floor(Math.random() * waterColors.length)],
        });
      }
    };

    const spawnMudSplatParticles = (x: number) => {
      const count = Math.floor(Math.random() * 8) + 5;
      for (let i = 0; i < count; i++) {
        particles.push({
          x,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.8) * 8 - 1, // mostly leftward
          vy: (Math.random() - 0.5) * 10,
          size: Math.random() * 6 + 2,
          opacity: Math.random() * 0.5 + 0.5,
          life: 0,
          maxLife: Math.random() * 45 + 25,
          color: mudColors[Math.floor(Math.random() * mudColors.length)],
        });
      }
    };

    let animFrame: number;
    const animate = (now: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const elapsed = now - startTime;
      if (elapsed > 0) {
        const cyclePos = elapsed % CYCLE;
        const t = cyclePos / CYCLE;

        // Phase 1: clean sweep left→right (0% - 30%)
        if (t < 0.30) {
          const phase = t / 0.30;
          const eased = 1 - Math.pow(1 - phase, 3);
          spawnWaterParticles(eased * canvas.width);
        }
        // Phase 2: mud splats back right→left (35% - 65%)
        else if (t >= 0.35 && t < 0.65) {
          const phase = (t - 0.35) / 0.30;
          const eased = 1 - Math.pow(1 - phase, 3);
          const x = canvas.width * (1 - eased);
          spawnMudSplatParticles(x);
        }
        // Phase 3: clean sweep again left→right (70% - 100%)
        else if (t >= 0.70) {
          const phase = (t - 0.70) / 0.30;
          const eased = 1 - Math.pow(1 - phase, 3);
          spawnWaterParticles(eased * canvas.width);
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.opacity *= 0.96;

        if (p.life > p.maxLife || p.opacity < 0.02) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(")", ` / ${p.opacity})`).replace("hsl(", "hsl(");
        ctx.fill();
      }

      animFrame = requestAnimationFrame(animate);
    };

    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [containerRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10"
    />
  );
};

export default WaterSplashParticles;
