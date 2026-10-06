import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseOpacity: number;
}

interface PulsePacket {
  fromNode: number;
  toNode: number;
  progress: number;
  speed: number;
}

export const AuthCanvasBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let lastFrameTime = performance.now();
    const targetFps = 60;
    const frameInterval = 1000 / targetFps;

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Responsive dimensions
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    // Mouse interactivity
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 120,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Particle nodes & pulse packets
    let particles: Particle[] = [];
    let pulses: PulsePacket[] = [];
    const MAX_PULSES = 6;

    const initParticles = () => {
      const count = Math.min(Math.floor((width * height) / 14000), 75);
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          radius: 1.5,
          baseOpacity: 0.25 + Math.random() * 0.15,
        });
      }
      pulses = [];
    };

    initParticles();

    // Spawn encryption handshake pulses
    const spawnPulse = () => {
      if (pulses.length >= MAX_PULSES || particles.length < 2) return;
      const i = Math.floor(Math.random() * particles.length);
      // Find a neighbor
      for (let j = 0; j < particles.length; j++) {
        if (i === j) continue;
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist > 30 && dist < 140) {
          pulses.push({
            fromNode: i,
            toNode: j,
            progress: 0,
            speed: 0.015 + Math.random() * 0.015,
          });
          break;
        }
      }
    };

    const pulseInterval = setInterval(spawnPulse, 1200);

    const render = (currentTime: number) => {
      const elapsed = currentTime - lastFrameTime;

      if (elapsed >= frameInterval) {
        lastFrameTime = currentTime - (elapsed % frameInterval);

        // Fill pitch black background
        ctx.fillStyle = '#0D0D11';
        ctx.fillRect(0, 0, width, height);

        // Soft ambient radial glows (wine top-right, slate bottom-left)
        const wineGlow = ctx.createRadialGradient(
          width * 0.8,
          height * 0.2,
          10,
          width * 0.8,
          height * 0.2,
          width * 0.5
        );
        wineGlow.addColorStop(0, 'rgba(74, 18, 26, 0.16)');
        wineGlow.addColorStop(1, 'rgba(13, 13, 17, 0)');
        ctx.fillStyle = wineGlow;
        ctx.fillRect(0, 0, width, height);

        const slateGlow = ctx.createRadialGradient(
          width * 0.2,
          height * 0.85,
          10,
          width * 0.2,
          height * 0.85,
          width * 0.45
        );
        slateGlow.addColorStop(0, 'rgba(142, 146, 157, 0.06)');
        slateGlow.addColorStop(1, 'rgba(13, 13, 17, 0)');
        ctx.fillStyle = slateGlow;
        ctx.fillRect(0, 0, width, height);

        // Update & Render nodes
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          if (!prefersReducedMotion) {
            p.x += p.vx;
            p.y += p.vy;

            // Bounce on boundaries
            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            // Mouse repulsion
            const mdx = p.x - mouse.x;
            const mdy = p.y - mouse.y;
            const mDist = Math.hypot(mdx, mdy);
            if (mDist < mouse.radius && mDist > 0) {
              const force = (mouse.radius - mDist) / mouse.radius;
              p.x += (mdx / mDist) * force * 1.8;
              p.y += (mdy / mDist) * force * 1.8;
            }
          }

          // Draw node
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(142, 146, 157, ${p.baseOpacity})`;
          ctx.fill();

          // Connect neighbor vectors
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 130) {
              const linkOpacity = (1 - dist / 130) * 0.16;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(142, 146, 157, ${linkOpacity})`;
              ctx.lineWidth = 0.75;
              ctx.stroke();
            }
          }
        }

        // Draw active handshake ruby pulses
        if (!prefersReducedMotion) {
          for (let k = pulses.length - 1; k >= 0; k--) {
            const pulse = pulses[k];
            pulse.progress += pulse.speed;

            if (pulse.progress >= 1) {
              pulses.splice(k, 1);
              continue;
            }

            const from = particles[pulse.fromNode];
            const to = particles[pulse.toNode];
            if (!from || !to) {
              pulses.splice(k, 1);
              continue;
            }

            const currentX = from.x + (to.x - from.x) * pulse.progress;
            const currentY = from.y + (to.y - from.y) * pulse.progress;

            // Faint crimson trailing line segment
            ctx.beginPath();
            ctx.moveTo(
              from.x + (to.x - from.x) * Math.max(0, pulse.progress - 0.2),
              from.y + (to.y - from.y) * Math.max(0, pulse.progress - 0.2)
            );
            ctx.lineTo(currentX, currentY);
            ctx.strokeStyle = 'rgba(211, 47, 47, 0.45)';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Ruby pulse core
            ctx.beginPath();
            ctx.arc(currentX, currentY, 2.2, 0, Math.PI * 2);
            ctx.fillStyle = '#E53935';
            ctx.shadowColor = '#D32F2F';
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.shadowBlur = 0; // reset
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(pulseInterval);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0D0D11]">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
