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
    // Matches CSS: 10s cycle, 1s delay
    const CYCLE = 10000;
    const DELAY = 1000;
    const startTime = performance.now() + DELAY;

    const mudColors = [
      "hsl(25, 45%, 22%)",
      "hsl(30, 50%, 18%)",
      "hsl(20, 40%, 25%)",
      "hsl(28, 55%, 20%)",
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

      // Flying mud impact particles
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
        const isMud = Math.random() < 0.3;
        droplets.push({
          x,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.2) * 8 + 2,
          vy: (Math.random() - 0.5) * 12,
          size: Math.random() * 5 + 1.5,
          opacity: Math.random() * 0.5 + 0.5,
          life: 0,
          maxLife: Math.random() * 50 + 30,
          color: isMud
            ? mudColors[Math.floor(Math.random() * mudColors.length)]
            : waterColors[Math.floor(Math.random() * waterColors.length)],
        });
      }
    };

    const drawSplat = (s: Splat) => {
      ctx.globalAlpha = s.opacity;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.ellipse(s.x, s.y, s.size, s.size * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      for (const d of s.drips) {
        ctx.beginPath();
        ctx.arc(s.x + d.dx, s.y + d.dy, d.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    let splatTimer = 0;
    let animFrame: number;

    const animate = (now: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const elapsed = now - startTime;
      if (elapsed > 0) {
        const cyclePos = elapsed % CYCLE;
        const t = cyclePos / CYCLE;

        // Timeline synced with CSS:
        // 0-25%: initial clean sweep L→R (spray bar + water particles + clear splats)
        // 25-35%: clean pause
        // 35-65%: mud splatters land randomly
        // 65-70%: dirty pause
        // 70-95%: second clean sweep L→R (spray bar + water particles + clear splats)
        // 95-100%: clean pause before loop

        if (t < 0.25) {
          // Clean sweep - water particles at spray position
          const phase = t / 0.25;
          const eased = 1 - Math.pow(1 - phase, 3);
          const washX = eased * canvas.width;
          spawnWaterDroplets(washX);
          // Remove splats behind the wash line
          for (let i = splats.length - 1; i >= 0; i--) {
            if (splats[i].x < washX) {
              splats[i].opacity -= 0.1;
              if (splats[i].opacity <= 0) splats.splice(i, 1);
            }
          }
        } else if (t >= 0.35 && t < 0.65) {
          // Mud splatters land randomly
          splatTimer++;
          if (splatTimer % 4 === 0) {
            spawnMudSplat();
          }
        } else if (t >= 0.70 && t < 0.95) {
          // Second clean sweep
          const phase = (t - 0.70) / 0.25;
          const eased = 1 - Math.pow(1 - phase, 3);
          const washX = eased * canvas.width;
          spawnWaterDroplets(washX);
          for (let i = splats.length - 1; i >= 0; i--) {
            if (splats[i].x < washX) {
              splats[i].opacity -= 0.1;
              if (splats[i].opacity <= 0) splats.splice(i, 1);
            }
          }
        }
      }

      // Draw persistent mud splats
      for (const s of splats) {
        drawSplat(s);
      }

      // Draw flying droplets (water + mud impact)
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
