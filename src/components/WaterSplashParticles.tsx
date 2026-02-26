import { useEffect, useRef } from "react";

interface Splat {
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
  drips: { dx: number; dy: number; size: number }[];
}

interface Droplet {
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

    const splats: Splat[] = [];
    const droplets: Droplet[] = [];
    const CYCLE = 10000;
    const DELAY = 1000;
    const startTime = performance.now() + DELAY;

    const mudColors = [
      "hsl(25, 45%, 22%)",
      "hsl(30, 50%, 18%)",
      "hsl(20, 40%, 25%)",
      "hsl(28, 55%, 20%)",
      "hsl(22, 35%, 15%)",
    ];

    const waterColors = [
      "hsl(200, 90%, 85%)",
      "hsl(200, 95%, 95%)",
      "hsl(200, 80%, 75%)",
      "hsl(0, 0%, 100%)",
    ];

    const spawnMudSplat = () => {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 18 + 8;
      const drips: Splat["drips"] = [];
      const dripCount = Math.floor(Math.random() * 5) + 2;
      for (let i = 0; i < dripCount; i++) {
        drips.push({
          dx: (Math.random() - 0.5) * size * 2.5,
          dy: (Math.random() - 0.3) * size * 2,
          size: Math.random() * size * 0.5 + 2,
        });
      }
      splats.push({
        x, y, size,
        opacity: Math.random() * 0.3 + 0.65,
        color: mudColors[Math.floor(Math.random() * mudColors.length)],
        drips,
      });

      // Flying mud droplet particles
      const flyCount = Math.floor(Math.random() * 6) + 3;
      for (let i = 0; i < flyCount; i++) {
        droplets.push({
          x, y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.7) * 8,
          size: Math.random() * 4 + 1,
          opacity: 0.7,
          life: 0,
          maxLife: Math.random() * 20 + 10,
          color: mudColors[Math.floor(Math.random() * mudColors.length)],
        });
      }
    };

    const spawnWaterDroplets = (x: number) => {
      const count = Math.floor(Math.random() * 10) + 6;
      for (let i = 0; i < count; i++) {
        droplets.push({
          x,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.2) * 8 + 2,
          vy: (Math.random() - 0.5) * 12,
          size: Math.random() * 5 + 1.5,
          opacity: Math.random() * 0.5 + 0.5,
          life: 0,
          maxLife: Math.random() * 50 + 30,
          color: waterColors[Math.floor(Math.random() * waterColors.length)],
        });
      }
    };

    const drawSplat = (s: Splat) => {
      ctx.globalAlpha = s.opacity;
      ctx.fillStyle = s.color;
      // Main blob
      ctx.beginPath();
      ctx.ellipse(s.x, s.y, s.size, s.size * 0.7, Math.random() * 0.3, 0, Math.PI * 2);
      ctx.fill();
      // Drip blobs
      for (const d of s.drips) {
        ctx.beginPath();
        ctx.arc(s.x + d.dx, s.y + d.dy, d.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    let splatSpawnTimer = 0;
    let animFrame: number;

    const animate = (now: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const elapsed = now - startTime;
      if (elapsed > 0) {
        const cyclePos = elapsed % CYCLE;
        const t = cyclePos / CYCLE;

        // Phase 1: initial clean sweep (0-30%)
        if (t < 0.30) {
          const phase = t / 0.30;
          const eased = 1 - Math.pow(1 - phase, 3);
          spawnWaterDroplets(eased * canvas.width);
          // Fade out any remaining splats from left
          for (let i = splats.length - 1; i >= 0; i--) {
            if (splats[i].x < eased * canvas.width) {
              splats[i].opacity -= 0.08;
              if (splats[i].opacity <= 0) splats.splice(i, 1);
            }
          }
        }
        // Phase 2: mud splatters land randomly (35-60%)
        else if (t >= 0.35 && t < 0.60) {
          splatSpawnTimer++;
          if (splatSpawnTimer % 3 === 0) { // every ~3 frames
            spawnMudSplat();
          }
        }
        // Phase 3: pause with mud (60-70%)
        // Phase 4: wash clean again (70-100%)
        else if (t >= 0.70) {
          const phase = (t - 0.70) / 0.30;
          const eased = 1 - Math.pow(1 - phase, 3);
          spawnWaterDroplets(eased * canvas.width);
          for (let i = splats.length - 1; i >= 0; i--) {
            if (splats[i].x < eased * canvas.width) {
              splats[i].opacity -= 0.08;
              if (splats[i].opacity <= 0) splats.splice(i, 1);
            }
          }
        }
      }

      // Draw persistent splats
      for (const s of splats) {
        drawSplat(s);
      }

      // Draw flying droplets
      for (let i = droplets.length - 1; i >= 0; i--) {
        const p = droplets[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.opacity *= 0.96;

        if (p.life > p.maxLife || p.opacity < 0.02) {
          droplets.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(")", ` / ${p.opacity})`);
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
