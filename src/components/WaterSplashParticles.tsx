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

interface WaterSplashProps {
  containerRef: React.RefObject<HTMLDivElement>;
  onDirtyChange?: (dirty: boolean) => void;
  onWashStart?: () => void;
  onWashEnd?: () => void;
  onMudSplat?: () => void;
}

const WaterSplashParticles = ({ containerRef, onDirtyChange, onWashStart, onWashEnd, onMudSplat }: WaterSplashProps) => {
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

    // Timeline: 
    // 0-4s: initial CSS wash (we just spawn water particles)
    // 4-6s: clean pause
    // 6-9s: mud splatters once
    // 9-10s: dirty pause
    // 10-13s: canvas spray bar cleans mud
    // 13-15s: clean pause, then loop from mud phase

    const INITIAL_WASH_END = 7000; // match 6s wash + 1s delay
    const MUD_START = 8000;
    const MUD_END = 11000;
    const WASH_START = 12000;
    const WASH_END = 18000; // 6s wash duration
    const LOOP_CYCLE = 13000; // adjusted loop
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

    let sprayBarX = -10; // off-screen
    let sprayBarOpacity = 0;
    let mudSpawned = false;

    const spawnMudSplat = () => {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 22 + 10;
      const drips: Splat["drips"] = [];
      const dripCount = Math.floor(Math.random() * 7) + 3;
      for (let i = 0; i < dripCount; i++) {
        drips.push({
          dx: (Math.random() - 0.5) * size * 3,
          dy: (Math.random() - 0.3) * size * 2.5,
          size: Math.random() * size * 0.5 + 2,
        });
      }
      splats.push({
        x, y, size,
        opacity: Math.random() * 0.3 + 0.65,
        color: mudColors[Math.floor(Math.random() * mudColors.length)],
        drips,
      });

      // Impact particles
      const flyCount = Math.floor(Math.random() * 8) + 4;
      for (let i = 0; i < flyCount; i++) {
        droplets.push({
          x, y,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.7) * 10,
          size: Math.random() * 5 + 1,
          opacity: 0.8,
          life: 0,
          maxLife: Math.random() * 25 + 12,
          color: mudColors[Math.floor(Math.random() * mudColors.length)],
        });
      }
    };

    const spawnWaterDroplets = (x: number) => {
      const count = Math.floor(Math.random() * 12) + 6;
      for (let i = 0; i < count; i++) {
        const isMud = Math.random() < 0.25;
        const isBigBubble = Math.random() < 0.1;
        droplets.push({
          x: x + (Math.random() - 0.5) * 6,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.2) * 8 + 2,
          vy: (Math.random() - 0.5) * 10,
          size: isBigBubble ? Math.random() * 8 + 4 : Math.random() * 4 + 1.5,
          opacity: Math.random() * 0.4 + 0.5,
          life: 0,
          maxLife: Math.random() * 40 + 25,
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

    const drawSprayBar = () => {
      if (sprayBarOpacity <= 0) return;
      ctx.globalAlpha = sprayBarOpacity;
      // Narrow precision line
      const grad = ctx.createLinearGradient(sprayBarX, 0, sprayBarX, canvas.height);
      grad.addColorStop(0, "transparent");
      grad.addColorStop(0.2, "hsl(200, 70%, 65%)");
      grad.addColorStop(0.5, "hsl(200, 80%, 75%)");
      grad.addColorStop(0.8, "hsl(200, 70%, 65%)");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(sprayBarX - 1, 0, 2, canvas.height);

      // Subtle glow
      ctx.shadowColor = "hsl(200, 70%, 65%)";
      ctx.shadowBlur = 8;
      ctx.fillRect(sprayBarX, 0, 1, canvas.height);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    };

    let splatTimer = 0;
    let lastDirty = false;
    let wasWashing = false;
    let animFrame: number;

    const animate = (now: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const elapsed = now - startTime;
      if (elapsed < 0) {
        animFrame = requestAnimationFrame(animate);
        return;
      }

      // Initial CSS wash phase (0-4s) — just spawn water particles to match CSS bar
      if (elapsed < 6000) {
        const phase = elapsed / 6000;
        const eased = 1 - Math.pow(1 - phase, 3);
        spawnWaterDroplets(eased * canvas.width);
        sprayBarX = -10;
        sprayBarOpacity = 0;
        if (!wasWashing) { wasWashing = true; onWashStart?.(); }
      }
      // After initial wash, enter the loop
      else {
        const loopElapsed = (elapsed - INITIAL_WASH_END) % LOOP_CYCLE;

        // 0-3s of loop: mud splatters land (one burst, not continuous filling)
        if (loopElapsed < 3000) {
          splatTimer++;
          if (splatTimer % 6 === 0 && splats.length < 18) {
            spawnMudSplat();
          }
          sprayBarOpacity = 0;
          if (!lastDirty) { lastDirty = true; onDirtyChange?.(true); }
          if (wasWashing) { wasWashing = false; onWashEnd?.(); }
        }
        // 3-4s: dirty pause
        else if (loopElapsed < 4000) {
          sprayBarOpacity = 0;
          splatTimer = 0;
        }
        // 4-7s: canvas spray bar cleans
        else if (loopElapsed < 10000) {
          const phase = (loopElapsed - 4000) / 6000;
          const eased = 1 - Math.pow(1 - phase, 3);
          sprayBarX = eased * canvas.width;
          sprayBarOpacity = phase < 0.95 ? 1 : 1 - (phase - 0.95) / 0.05;

          // Turn shimmer back on as soon as wash starts
          if (lastDirty) { lastDirty = false; onDirtyChange?.(false); }
          if (!wasWashing) { wasWashing = true; onWashStart?.(); }

          spawnWaterDroplets(sprayBarX);

          // Remove splats immediately when the bar passes their rightmost edge
          for (let i = splats.length - 1; i >= 0; i--) {
            const s = splats[i];
            const maxDripX = Math.max(0, ...s.drips.map(d => d.dx + d.size));
            if (s.x + maxDripX < sprayBarX) {
              splats.splice(i, 1);
            }
          }
        }
        // 7-9s: clean pause before loop
        else {
          sprayBarOpacity = 0;
          sprayBarX = -10;
          if (lastDirty) { lastDirty = false; onDirtyChange?.(false); }
          if (wasWashing) { wasWashing = false; onWashEnd?.(); }
          // Clear any remaining splats instantly
          splats.length = 0;
        }
      }

      // Draw persistent mud splats
      for (const s of splats) {
        drawSplat(s);
      }

      // Draw spray bar
      drawSprayBar();

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
    return () => { cancelAnimationFrame(animFrame); onWashEnd?.(); };
  }, [containerRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10"
    />
  );
};

export default WaterSplashParticles;
