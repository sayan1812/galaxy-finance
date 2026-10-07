import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useTransactions } from '../../context/TransactionContext';

interface SmokeWisp {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  decay: number;
  colorType: 'cyan' | 'emerald' | 'jade';
  rotation: number;
  rotSpeed: number;
}

interface AmbientOrb {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  radius: number;
  phaseX: number;
  phaseY: number;
  speed: number;
  colorType: 'cyan' | 'emerald' | 'jade';
}

/**
 * GALAXY FINANCE — INTERACTIVE "SMOKEY CURSOR" FLUID AURA CANVAS
 *
 * Requirements:
 * - Fluid canvas "Smokey Cursor" effect with cyan, emerald, and jade hues on dark surfaces
 * - Soft smoke wisps generated dynamically following mouse velocity
 * - Lightweight, throttled to 60 FPS
 * - Uses off-screen buffer with CSS filter: blur(24px)
 * - Sits at z-index: 0 with pointer-events: none
 * - Pauses automatically when document.hidden or prefers-reduced-motion is active
 * - Bi-modal palette: #10221E (dark) / #F4F8F6 (light)
 */
export const SmokyCanvasBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();
  const { settings } = useTransactions();
  const isDark = theme === 'dark' || theme === 'galaxy';
  const reduceMotion = settings.reduceMotion;

  // Pointer & Velocity tracking
  const pointerRef = useRef({
    x: -1000,
    y: -1000,
    prevX: -1000,
    prevY: -1000,
    vx: 0,
    vy: 0,
    speed: 0,
    lastTime: 0,
    isActive: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Create offscreen canvas buffer for high-performance rendering
    const offscreen = document.createElement('canvas');
    const offCtx = offscreen.getContext('2d', { alpha: true });
    if (!offCtx) return;

    let animationFrameId: number;
    let isPaused = false;
    let width = 0;
    let height = 0;

    // Wisps & Ambient Orbs
    const wisps: SmokeWisp[] = [];
    const MAX_WISPS = 120;
    const ambientOrbs: AmbientOrb[] = [];

    const handleResize = () => {
      const displayW = window.innerWidth;
      const displayH = window.innerHeight;

      // Render at half resolution for ultra-fast fluid rasterization + blur
      width = Math.max(Math.floor(displayW * 0.65), 320);
      height = Math.max(Math.floor(displayH * 0.65), 320);

      canvas.width = width;
      canvas.height = height;
      offscreen.width = width;
      offscreen.height = height;

      // Initialize 4-6 large soft ambient breathing orbs
      ambientOrbs.length = 0;
      const orbTypes: ('cyan' | 'emerald' | 'jade')[] = ['emerald', 'jade', 'cyan', 'emerald'];
      for (let i = 0; i < orbTypes.length; i++) {
        const bx = (width / (orbTypes.length + 1)) * (i + 1);
        const by = height * 0.35 + (i % 2 === 0 ? 50 : -50);
        ambientOrbs.push({
          x: bx,
          y: by,
          baseX: bx,
          baseY: by,
          radius: Math.min(width, height) * (0.35 + Math.random() * 0.15),
          phaseX: Math.random() * Math.PI * 2,
          phaseY: Math.random() * Math.PI * 2,
          speed: 0.0005 + Math.random() * 0.0004,
          colorType: orbTypes[i],
        });
      }
    };

    handleResize();

    // Spawn smoke particles along mouse path with velocity
    const spawnSmokeWisps = (targetX: number, targetY: number, vx: number, vy: number, speed: number) => {
      if (reduceMotion) return;

      const p = pointerRef.current;
      const dist = Math.hypot(targetX - p.prevX, targetY - p.prevY);
      const steps = Math.min(Math.max(1, Math.floor(dist / 14)), 6);

      const colorTypes: ('cyan' | 'emerald' | 'jade')[] = ['cyan', 'emerald', 'jade'];

      for (let s = 0; s < steps; s++) {
        if (wisps.length >= MAX_WISPS) {
          wisps.shift(); // Evict oldest
        }

        const t = s / steps;
        const interpX = p.prevX + (targetX - p.prevX) * t;
        const interpY = p.prevY + (targetY - p.prevY) * t;

        // Natural turbulent dispersal
        const angle = Math.random() * Math.PI * 2;
        const turbulentSpeed = Math.random() * 0.6 + 0.2;
        const spreadX = Math.cos(angle) * turbulentSpeed;
        const spreadY = Math.sin(angle) * turbulentSpeed;

        const wispVx = vx * 0.25 + spreadX;
        const wispVy = vy * 0.25 + spreadY;

        const colorIndex = Math.floor(Math.random() * 3);
        const initialRadius = Math.min(18 + speed * 1.2, 45);

        wisps.push({
          x: interpX,
          y: interpY,
          vx: wispVx,
          vy: wispVy,
          radius: initialRadius,
          maxRadius: initialRadius * (2.2 + Math.random() * 1.4),
          alpha: Math.min(0.55, 0.25 + speed * 0.05),
          decay: 0.012 + Math.random() * 0.008,
          colorType: colorTypes[colorIndex],
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.04,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      const p = pointerRef.current;

      const scaleX = width / window.innerWidth;
      const scaleY = height / window.innerHeight;
      const currentX = e.clientX * scaleX;
      const currentY = e.clientY * scaleY;

      if (!p.isActive || p.prevX < 0) {
        p.prevX = currentX;
        p.prevY = currentY;
      }

      const dt = Math.max(now - p.lastTime, 16);
      p.vx = (currentX - p.prevX) / (dt / 16);
      p.vy = (currentY - p.prevY) / (dt / 16);
      p.speed = Math.min(Math.hypot(p.vx, p.vy), 15);

      p.x = currentX;
      p.y = currentY;
      p.lastTime = now;
      p.isActive = true;

      // Spawn wisps if moving
      if (p.speed > 0.4) {
        spawnSmokeWisps(currentX, currentY, p.vx, p.vy, p.speed);
      }

      p.prevX = currentX;
      p.prevY = currentY;
    };

    const handlePointerLeave = () => {
      pointerRef.current.isActive = false;
      pointerRef.current.prevX = -1000;
      pointerRef.current.prevY = -1000;
      pointerRef.current.speed = 0;
    };

    // Pause automatically when document is hidden or prefers-reduced-motion is active
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isPaused = true;
        cancelAnimationFrame(animationFrameId);
      } else {
        isPaused = false;
        lastTimestamp = performance.now();
        animationFrameId = requestAnimationFrame(renderLoop);
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handlePointerLeave, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches || reduceMotion;

    // 60 FPS Throttler
    const FRAME_INTERVAL = 1000 / 60; // 16.67ms
    let lastTimestamp = performance.now();

    const renderLoop = (now: number = performance.now()) => {
      if (isPaused) return;

      const elapsed = now - lastTimestamp;
      if (elapsed >= FRAME_INTERVAL) {
        lastTimestamp = now - (elapsed % FRAME_INTERVAL);

        // 1. Clear off-screen buffer
        offCtx.clearRect(0, 0, width, height);

        // 2. Base Fill Color (Dark: #10221E / #1A312C, Light: #F4F8F6)
        offCtx.fillStyle = isDark ? '#10221E' : '#F4F8F6';
        offCtx.fillRect(0, 0, width, height);

        // 3. Render Ambient Atmospheric Orbs
        for (let i = 0; i < ambientOrbs.length; i++) {
          const orb = ambientOrbs[i];
          orb.x = orb.baseX + Math.sin(now * orb.speed + orb.phaseX) * (width * 0.08);
          orb.y = orb.baseY + Math.cos(now * orb.speed * 0.8 + orb.phaseY) * (height * 0.08);

          const grad = offCtx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);

          if (isDark) {
            if (orb.colorType === 'cyan') {
              grad.addColorStop(0, 'rgba(6, 182, 212, 0.08)');
              grad.addColorStop(1, 'rgba(6, 182, 212, 0)');
            } else if (orb.colorType === 'emerald') {
              grad.addColorStop(0, 'rgba(16, 185, 129, 0.10)');
              grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
            } else {
              grad.addColorStop(0, 'rgba(137, 215, 183, 0.09)');
              grad.addColorStop(1, 'rgba(137, 215, 183, 0)');
            }
          } else {
            // Light mode subtle soft mint/jade
            if (orb.colorType === 'cyan') {
              grad.addColorStop(0, 'rgba(40, 122, 116, 0.06)');
              grad.addColorStop(1, 'rgba(40, 122, 116, 0)');
            } else if (orb.colorType === 'emerald') {
              grad.addColorStop(0, 'rgba(85, 169, 160, 0.08)');
              grad.addColorStop(1, 'rgba(85, 169, 160, 0)');
            } else {
              grad.addColorStop(0, 'rgba(137, 215, 183, 0.07)');
              grad.addColorStop(1, 'rgba(137, 215, 183, 0)');
            }
          }

          offCtx.fillStyle = grad;
          offCtx.beginPath();
          offCtx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
          offCtx.fill();
        }

        // 4. Update and Render Smoke Wisps (Following cursor velocity)
        for (let i = wisps.length - 1; i >= 0; i--) {
          const w = wisps[i];

          // Velocity and expansion physics
          w.x += w.vx;
          w.y += w.vy;
          w.vx *= 0.96; // Viscous fluid damping
          w.vy *= 0.96;
          w.radius += (w.maxRadius - w.radius) * 0.06;
          w.alpha -= w.decay;
          w.rotation += w.rotSpeed;

          if (w.alpha <= 0.01) {
            wisps.splice(i, 1);
            continue;
          }

          // Render fluid wisp with radial gradient
          const wispGrad = offCtx.createRadialGradient(w.x, w.y, 0, w.x, w.y, w.radius);

          let r = 16, g = 185, b = 129; // emerald
          if (w.colorType === 'cyan') {
            r = 6; g = 182; b = 212;
          } else if (w.colorType === 'jade') {
            r = 137; g = 215; b = 183;
          }

          if (!isDark) {
            // Refined pine/teal tones for light mode contrast
            if (w.colorType === 'cyan') {
              r = 40; g = 122; b = 116;
            } else if (w.colorType === 'emerald') {
              r = 85; g = 169; b = 160;
            } else {
              r = 95; g = 175; b = 150;
            }
          }

          const coreAlpha = isDark ? w.alpha * 0.85 : w.alpha * 0.45;
          const outerAlpha = 0;

          wispGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${coreAlpha})`);
          wispGrad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${coreAlpha * 0.5})`);
          wispGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${outerAlpha})`);

          offCtx.fillStyle = wispGrad;
          offCtx.beginPath();
          offCtx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
          offCtx.fill();
        }

        // 5. Blit offscreen buffer to active canvas
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(offscreen, 0, 0);
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(renderLoop);
      }
    };

    // First frame render
    renderLoop(performance.now());

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isDark, reduceMotion]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden"
      style={{
        backgroundColor: isDark ? '#10221E' : '#F4F8F6',
        transition: 'background-color 0.4s ease',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100vw',
          height: '100vh',
          display: 'block',
          filter: 'blur(24px)',
          pointerEvents: 'none',
          transform: 'translate3d(0, 0, 0)',
          willChange: 'transform',
        }}
      />
    </div>
  );
};
