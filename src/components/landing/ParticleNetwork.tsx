import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  color: "green" | "gold";
  trail: { x: number; y: number }[];
}

const GREEN = { h: 155, s: 64, l: 39 }; // #24A475
const GOLD = { h: 39, s: 70, l: 51 };   // #D89B2A

export default function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      const isMobile = window.innerWidth < 768;
      const count = isMobile ? 30 : 50;
      const particles: Particle[] = [];

      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          radius: Math.random() * 2.5 + 1.5,
          opacity: Math.random() * 0.4 + 0.6,
          color: Math.random() > 0.4 ? "green" : "gold",
          trail: [],
        });
      }

      particlesRef.current = particles;
    };

    const getHSL = (p: Particle) => {
      const c = p.color === "green" ? GREEN : GOLD;
      return { h: c.h, s: c.s, l: c.l };
    };

    const drawParticle = (p: Particle) => {
      const { h, s, l } = getHSL(p);

      // Draw trail
      for (let i = 0; i < p.trail.length; i++) {
        const t = p.trail[i];
        const alpha = (i / p.trail.length) * p.opacity * 0.3;
        const r = (i / p.trail.length) * p.radius * 0.8;
        ctx.beginPath();
        ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${h}, ${s}%, ${l}%, ${alpha})`;
        ctx.fill();
      }

      // Glow
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 5);
      grad.addColorStop(0, `hsla(${h}, ${s}%, ${l}%, ${p.opacity * 0.6})`);
      grad.addColorStop(0.4, `hsla(${h}, ${s}%, ${l}%, ${p.opacity * 0.15})`);
      grad.addColorStop(1, `hsla(${h}, ${s}%, ${l}%, 0)`);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 5, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${h}, ${s}%, ${l + 15}%, ${p.opacity})`;
      ctx.fill();
    };

    const drawConnections = () => {
      const particles = particlesRef.current;
      const maxDist = 140;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.2;
            const c = particles[i].color === "green" ? GREEN : GOLD;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `hsla(${c.h}, ${c.s}%, ${c.l}%, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
    };

    const update = () => {
      particlesRef.current.forEach((p) => {
        // Store trail
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 12) p.trail.shift();

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        p.x = Math.max(0, Math.min(canvas.width, p.x));
        p.y = Math.max(0, Math.min(canvas.height, p.y));
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawConnections();
      particlesRef.current.forEach(drawParticle);
      update();
      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createParticles();
    animate();

    const handleResize = () => {
      resizeCanvas();
      createParticles();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0"
      style={{ background: "transparent" }}
    />
  );
}
