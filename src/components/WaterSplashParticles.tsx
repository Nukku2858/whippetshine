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
    const ANIM_DURATION = 4000; // matches pressure-wash duration
    const ANIM_DELAY = 1000; // matches animation delay
    const startTime = performance.now() + ANIM_DELAY;
    const colors = [
      "hsl(200, 90%, 85%)",
      "hsl(200, 95%, 95%)",
      "hsl(200, 80%, 75%)",
      "hsl(0, 0%, 100%)",
      "hsl(30, 40%, 35%)", // mud particles
      "hsl(30, 50%, 25%)",
    ];

    const spawnParticles = (x: number) => {
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
          color: isMud ? colors[4 + Math.floor(Math.random() * 2)] : colors[Math.floor(Math.random() * 4)],
        });
      }
    };

    let animFrame: number;
    const animate = (now: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const elapsed = now - startTime;
      if (elapsed > 0 && elapsed < ANIM_DURATION) {
        // easeOutQuint to match cubic-bezier(0.22, 1, 0.36, 1)
        const t = Math.min(elapsed / ANIM_DURATION, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const sprayX = eased * canvas.width;
        spawnParticles(sprayX);
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity
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

      if (elapsed < ANIM_DURATION + 2000 || particles.length > 0) {
        animFrame = requestAnimationFrame(animate);
      }
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
