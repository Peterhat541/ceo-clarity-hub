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

interface FollowerParticle {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  color: "green" | "gold";
}

const GREEN = { h: 155, s: 64, l: 39 };
const GOLD = { h: 39, s: 70, l: 51 };

export default function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -100, y: -100, active: false });
  const followersRef = useRef<FollowerParticle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const FOLLOWER_COUNT = 18;

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

    const createFollowers = () => {
      const followers: FollowerParticle[] = [];
      for (let i = 0; i < FOLLOWER_COUNT; i++) {
        const t = i / FOLLOWER_COUNT;
        followers.push({
          x: -100,
          y: -100,
          radius: 4 * (1 - t * 0.7) + 1,
          opacity: 1 - t * 0.85,
          color: i % 3 === 0 ? "gold" : "green",
        });
      }
      followersRef.current = followers;
    };

    const getHSL = (color: "green" | "gold") => {
      const c = color === "green" ? GREEN : GOLD;
      return { h: c.h, s: c.s, l: c.l };
    };

    const drawParticle = (p: Particle) => {
      const { h, s, l } = getHSL(p.color);
      for (let i = 0; i < p.trail.length; i++) {
        const t = p.trail[i];
        const alpha = (i / p.trail.length) * p.opacity * 0.3;
        const r = (i / p.trail.length) * p.radius * 0.8;
        ctx.beginPath();
        ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${h}, ${s}%, ${l}%, ${alpha})`;
        ctx.fill();
      }
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 5);
      grad.addColorStop(0, `hsla(${h}, ${s}%, ${l}%, ${p.opacity * 0.6})`);
      grad.addColorStop(0.4, `hsla(${h}, ${s}%, ${l}%, ${p.opacity * 0.15})`);
      grad.addColorStop(1, `hsla(${h}, ${s}%, ${l}%, 0)`);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 5, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${h}, ${s}%, ${l + 15}%, ${p.opacity})`;
      ctx.fill();
    };

    const drawFollowers = () => {
      const followers = followersRef.current;
      if (!mouseRef.current.active) return;

      for (let i = 0; i < followers.length; i++) {
        const f = followers[i];
        const { h, s, l } = getHSL(f.color);

        // Glow
        const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius * 4);
        grad.addColorStop(0, `hsla(${h}, ${s}%, ${l}%, ${f.opacity * 0.5})`);
        grad.addColorStop(0.5, `hsla(${h}, ${s}%, ${l}%, ${f.opacity * 0.1})`);
        grad.addColorStop(1, `hsla(${h}, ${s}%, ${l}%, 0)`);
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius * 4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${h}, ${s}%, ${l + 20}%, ${f.opacity})`;
        ctx.fill();
      }
    };

    const updateFollowers = () => {
      const followers = followersRef.current;
      const mouse = mouseRef.current;

      for (let i = 0; i < followers.length; i++) {
        const target = i === 0
          ? { x: mouse.x, y: mouse.y }
          : { x: followers[i - 1].x, y: followers[i - 1].y };

        const ease = 0.25 - i * 0.008;
        const clampedEase = Math.max(ease, 0.05);

        followers[i].x += (target.x - followers[i].x) * clampedEase;
        followers[i].y += (target.y - followers[i].y) * clampedEase;
      }
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
      updateFollowers();
      drawFollowers();
      update();
      animationRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        mouseRef.current = { x: touch.clientX, y: touch.clientY, active: true };
      }
    };
    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    resizeCanvas();
    createParticles();
    createFollowers();
    animate();

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: true });
    canvas.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", () => { resizeCanvas(); createParticles(); });

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
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
