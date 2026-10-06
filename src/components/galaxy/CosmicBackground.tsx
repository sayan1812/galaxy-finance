import React from 'react';
import { useTransactions } from '../../context/TransactionContext';

export const CosmicBackground: React.FC = () => {
  const { settings } = useTransactions();
  const reduceMotion = settings.reduceMotion;
  const intensity = settings.galaxyIntensity;

  // Particle count based on intensity
  const particleCount = intensity === 'high' ? 36 : intensity === 'medium' ? 20 : 10;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#f8fafc]">
      {/* Luminous Celestial Soft Gradients */}
      <div 
        className="absolute inset-0 opacity-70 transition-opacity duration-1000"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.08) 0%, transparent 60%),
            radial-gradient(circle at 85% 30%, rgba(56, 189, 248, 0.07) 0%, transparent 50%),
            radial-gradient(circle at 15% 75%, rgba(168, 85, 247, 0.06) 0%, transparent 55%),
            radial-gradient(circle at 75% 85%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)
          `
        }}
      />

      {/* Grid Overlay for Clean Financial Dashboard Blueprint Feel */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(15, 23, 42, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(15, 23, 42, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px'
        }}
      />

      {/* Ambient Celestial Stardust Orbs */}
      {!reduceMotion && (
        <div className="absolute inset-0">
          {Array.from({ length: particleCount }).map((_, i) => {
            const size = (i % 3) + 2;
            const top = (i * 23) % 100;
            const left = (i * 37) % 100;
            const opacity = 0.25 + ((i % 5) * 0.1);
            const duration = 12 + (i % 10);
            const delay = (i % 5) * 1.5;

            return (
              <span
                key={i}
                className="absolute rounded-full bg-indigo-400/40 animate-pulse"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  top: `${top}%`,
                  left: `${left}%`,
                  opacity,
                  boxShadow: size > 2 ? '0 0 6px rgba(99, 102, 241, 0.4)' : undefined,
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Soft Light Vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(226,232,240,0.6)] pointer-events-none" />
    </div>
  );
};
