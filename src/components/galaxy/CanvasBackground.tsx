import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useTransactions } from '../../context/TransactionContext';

interface NodePoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  radius: number;
  alpha: number;
}

export const CanvasBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();
  const { settings } = useTransactions();
  const reduceMotion = settings.reduceMotion;

  const mousePosRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = 0;
    const targetFps = 50; // Performance: Capped frame rate to avoid dropping frames
    const frameInterval = 1000 / targetFps;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Responsive node count based on screen width
    const nodeCount = Math.floor(Math.min(Math.max((width * height) / 28000, 24), 60));
    const nodes: NodePoint[] = [];

    const initNodes = () => {
      nodes.length = 0;
      for (let i = 0; i < nodeCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        nodes.push({
          x,
          y,
          baseX: x,
          baseY: y,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          radius: 1 + Math.random() * 0.5,
          alpha: 0.15 + Math.random() * 0.15, // Faint micro-dots (1px, ~20% opacity)
        });
      }
    };

    initNodes();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initNodes();
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Gentle parallax relative to center
      mousePosRef.current.targetX = (e.clientX - width / 2) * 0.04;
      mousePosRef.current.targetY = (e.clientY - height / 2) * 0.04;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mousePosRef.current.targetX = (e.touches[0].clientX - width / 2) * 0.02;
        mousePosRef.current.targetY = (e.touches[0].clientY - height / 2) * 0.02;
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Static render for prefers-reduced-motion
    if (reduceMotion) {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(142, 146, 157, 0.2)';
      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('touchmove', handleTouchMove);
      };
    }

    const render = (time: number) => {
      animationFrameId = requestAnimationFrame(render);

      // Page visibility check - pause rendering when tab is hidden
      if (document.hidden) return;

      const elapsed = time - lastTime;
      if (elapsed < frameInterval) return;
      lastTime = time - (elapsed % frameInterval);

      // Smooth mouse damping
      const mouse = mousePosRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Colors depending on theme
      const isDark = theme !== 'light';
      const nodeColor = isDark ? 'rgba(142, 146, 157, ' : 'rgba(74, 18, 26, ';
      const lineColor = isDark ? 'rgba(74, 18, 26, ' : 'rgba(142, 146, 157, ';

      const maxDist = 120;

      // Draw delicate hairline vectors between close nodes
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * (isDark ? 0.12 : 0.07);
            ctx.beginPath();
            ctx.strokeStyle = `${lineColor}${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.moveTo(n1.x + mouse.x, n1.y + mouse.y);
            ctx.lineTo(n2.x + mouse.x, n2.y + mouse.y);
            ctx.stroke();
          }
        }
      }

      // Draw faint micro-dots
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        // Move nodes slowly
        n.x += n.vx;
        n.y += n.vy;

        // Wrap edges smoothly
        if (n.x < 0) n.x = width;
        else if (n.x > width) n.x = 0;
        if (n.y < 0) n.y = height;
        else if (n.y > height) n.y = 0;

        ctx.beginPath();
        ctx.arc(n.x + mouse.x, n.y + mouse.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${nodeColor}${n.alpha})`;
        ctx.fill();
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [theme, reduceMotion]);

  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* 1. Base Tone */}
      <div 
        className="absolute inset-0 transition-colors duration-500"
        style={{
          backgroundColor: isLight ? '#FBFBFB' : '#0D0D11',
        }}
      />

      {/* 2. Ambient Canvas Layer:
          Subtle, low-opacity radial mesh combining deep wine (#4A121A at ~15% opacity) in the top-right
          and faint slate (#8E929D at ~5% opacity) in the bottom-left */}
      <div
        className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
        style={{
          backgroundImage: isLight
            ? `
              radial-gradient(circle at 90% 10%, rgba(74, 18, 26, 0.06) 0%, transparent 55%),
              radial-gradient(circle at 10% 90%, rgba(142, 146, 157, 0.04) 0%, transparent 60%)
            `
            : `
              radial-gradient(circle at 90% 10%, rgba(74, 18, 26, 0.16) 0%, transparent 55%),
              radial-gradient(circle at 10% 90%, rgba(142, 146, 157, 0.05) 0%, transparent 60%),
              radial-gradient(circle at 50% 50%, rgba(13, 13, 17, 0.6) 0%, transparent 80%)
            `,
        }}
      />

      {/* 3. Subtle Hairline Grid Blueprint */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${isLight ? 'rgba(74, 18, 26, 0.3)' : 'rgba(255, 255, 255, 0.25)'} 1px, transparent 1px),
            linear-gradient(to bottom, ${isLight ? 'rgba(74, 18, 26, 0.3)' : 'rgba(255, 255, 255, 0.25)'} 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />

      {/* 4. Interactive Constellation Grid 2D Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* 5. Deep Perimeter Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: isLight 
            ? 'inset 0 0 100px rgba(0, 0, 0, 0.02)'
            : 'inset 0 0 140px rgba(0, 0, 0, 0.6)',
        }}
      />
    </div>
  );
};
