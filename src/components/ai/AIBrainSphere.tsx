import { useEffect, useRef } from "react";

const GREEN = { h: 155, s: 64, l: 39 };
const GOLD = { h: 39, s: 70, l: 51 };

interface AIBrainSphereProps {
  size?: number;
  isThinking?: boolean;
}

interface SphereParticle {
  // Spherical coordinates
  theta: number;
  phi: number;
  speed: number;
  radius: number;
  opacity: number;
  color: "green" | "gold";
}

export default function AIBrainSphere({ size = 160, isThinking = false }: AIBrainSphereProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<SphereParticle[]>([]);
  const rotationRef = useRef(0);
  const pulseRef = useRef(0);
  const thinkingRef = useRef(isThinking);

  useEffect(() => {
    thinkingRef.current = isThinking;
  }, [isThinking]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const sphereRadius = size * 0.34;

    // Create particles distributed on a sphere
    const count = 120;
    const particles: SphereParticle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        theta: Math.random() * Math.PI * 2,
        phi: Math.acos(2 * Math.random() - 1),
        speed: (Math.random() * 0.3 + 0.1) * (Math.random() > 0.5 ? 1 : -1),
        radius: Math.random() * 1.8 + 0.6,
        opacity: Math.random() * 0.6 + 0.4,
        color: Math.random() > 0.3 ? "green" : "gold",
      });
    }
    particlesRef.current = particles;

    const getColor = (color: "green" | "gold") => color === "green" ? GREEN : GOLD;

    const animate = () => {
      ctx.clearRect(0, 0, size, size);

      const thinking = thinkingRef.current;
      const rotSpeed = thinking ? 0.012 : 0.003;
      rotationRef.current += rotSpeed;

      // Pulse effect when thinking
      if (thinking) {
        pulseRef.current += 0.06;
      } else {
        pulseRef.current += 0.02;
      }
      const pulse = thinking
        ? 1 + Math.sin(pulseRef.current) * 0.08
        : 1 + Math.sin(pulseRef.current) * 0.02;

      const currentRadius = sphereRadius * pulse;

      // Draw subtle orbit rings
      ctx.save();
      ctx.globalAlpha = thinking ? 0.12 : 0.06;
      ctx.strokeStyle = `hsl(${GREEN.h}, ${GREEN.s}%, ${GREEN.l}%)`;
      ctx.lineWidth = 0.5;
      for (let ring = 0; ring < 3; ring++) {
        const r = currentRadius * (0.7 + ring * 0.2);
        const tilt = (ring * 0.4 + rotationRef.current * 0.5);
        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r * Math.cos(tilt), rotationRef.current * 0.3 + ring * 0.8, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // Core glow
      const glowAlpha = thinking ? 0.25 : 0.12;
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, currentRadius * 1.2);
      coreGrad.addColorStop(0, `hsla(${GREEN.h}, ${GREEN.s}%, ${GREEN.l}%, ${glowAlpha})`);
      coreGrad.addColorStop(0.5, `hsla(${GREEN.h}, ${GREEN.s}%, ${GREEN.l}%, ${glowAlpha * 0.3})`);
      coreGrad.addColorStop(1, `hsla(${GREEN.h}, ${GREEN.s}%, ${GREEN.l}%, 0)`);
      ctx.beginPath();
      ctx.arc(cx, cy, currentRadius * 1.2, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Sort and draw particles (back-to-front for depth)
      const rotation = rotationRef.current;
      const projected = particles.map((p) => {
        const theta = p.theta + rotation;
        const x3d = currentRadius * Math.sin(p.phi) * Math.cos(theta);
        const y3d = currentRadius * Math.cos(p.phi);
        const z3d = currentRadius * Math.sin(p.phi) * Math.sin(theta);
        // Simple perspective
        const perspective = 1 + z3d / (size * 1.5);
        return { p, x: cx + x3d, y: cy + y3d, z: z3d, perspective };
      });

      projected.sort((a, b) => a.z - b.z);

      for (const { p, x, y, perspective } of projected) {
        const { h, s, l } = getColor(p.color);
        const depthAlpha = p.opacity * (0.3 + perspective * 0.7);
        const r = p.radius * perspective;

        // Glow
        if (r > 0.8) {
          const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
          grad.addColorStop(0, `hsla(${h}, ${s}%, ${l}%, ${depthAlpha * 0.4})`);
          grad.addColorStop(1, `hsla(${h}, ${s}%, ${l}%, 0)`);
          ctx.beginPath();
          ctx.arc(x, y, r * 4, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        // Dot
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${h}, ${s}%, ${l + 15}%, ${depthAlpha})`;
        ctx.fill();
      }

      // Draw sparse connections between nearby front-facing particles
      const frontParticles = projected.filter(p => p.z > 0);
      ctx.lineWidth = 0.4;
      for (let i = 0; i < frontParticles.length; i++) {
        for (let j = i + 1; j < frontParticles.length; j++) {
          const dx = frontParticles[i].x - frontParticles[j].x;
          const dy = frontParticles[i].y - frontParticles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = currentRadius * 0.45;
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.12;
            ctx.beginPath();
            ctx.moveTo(frontParticles[i].x, frontParticles[i].y);
            ctx.lineTo(frontParticles[j].x, frontParticles[j].y);
            ctx.strokeStyle = `hsla(${GREEN.h}, ${GREEN.s}%, ${GREEN.l}%, ${alpha})`;
            ctx.stroke();
          }
        }
      }

      // Move particles slightly
      for (const p of particles) {
        p.theta += p.speed * 0.002 * (thinking ? 3 : 1);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className="pointer-events-none"
    />
  );
}
