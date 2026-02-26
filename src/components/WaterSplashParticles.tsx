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
    // 0-1s: mud already on screen (spawned instantly), dirty pause
    // 1-7s: spray bar washes mud off (6s wash)
    // 7-17s: 10s clean pause
    // Then loop: 3s mud spawn + 1s dirty pause + 6s wash + 10s clean = 20s cycle

    const WASH_DURATION = 6000;
    const LOOP_CYCLE = 20000; // 3s mud + 1s pause + 6s wash + 10s clean
    // Start 3s into the loop so mud is already spawned and we're at the dirty-pause point
    const startTime = performance.now() - 3000;

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
    let initialMudSpawned = false;

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

      // Spawn initial mud splats immediately (once)
      if (!initialMudSpawned) {
        initialMudSpawned = true;
        for (let i = 0; i < 18; i++) {
          spawnMudSplat();
        }
        droplets.length = 0;
        onDirtyChange?.(true);
        lastDirty = true;
      }

      // Single unified loop (startTime is offset so we begin at dirty-pause)
      const loopElapsed = elapsed % LOOP_CYCLE;

      // 0-3s: mud splatters land
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
      // 4-10s: spray bar wash (6s)
      else if (loopElapsed < 10000) {
        const phase = (loopElapsed - 4000) / WASH_DURATION;
        const eased = 1 - Math.pow(1 - phase, 3);
        sprayBarX = eased * canvas.width;
        sprayBarOpacity = phase < 0.95 ? 1 : 1 - (phase - 0.95) / 0.05;

        if (lastDirty) { lastDirty = false; onDirtyChange?.(false); }
        if (!wasWashing) { wasWashing = true; onWashStart?.(); }

        spawnWaterDroplets(sprayBarX);

        for (let i = splats.length - 1; i >= 0; i--) {
          const s = splats[i];
          const splatRight = s.x + s.size;
          const maxDripRight = s.drips.length > 0
            ? Math.max(...s.drips.map(d => s.x + d.dx + d.size))
            : 0;
          if (Math.max(splatRight, maxDripRight) < sprayBarX) {
            splats.splice(i, 1);
          }
        }
        if (phase > 0.9) splats.length = 0;
      }
      // 10-20s: 10s clean pause
      else {
        sprayBarOpacity = 0;
        sprayBarX = -10;
        if (lastDirty) { lastDirty = false; onDirtyChange?.(false); }
        if (wasWashing) { wasWashing = false; onWashEnd?.(); }
        splats.length = 0;
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
