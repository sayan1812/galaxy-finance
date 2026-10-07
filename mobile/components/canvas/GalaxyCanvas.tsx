import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, AppState, AppStateStatus, Dimensions } from 'react-native';
import Svg, { Circle, Line, Defs, RadialGradient, Stop, G } from 'react-native-svg';
import { COLORS } from '../../constants/theme';

interface StarNode {
  id: number;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  radius: number;
  speed: number;
  angle: number;
  orbitRadius: number;
  opacity: number;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * GALAXY CANVAS — 60 FPS BATTERY-OPTIMIZED CELESTIAL BACKGROUND
 * Deep Pitch Black (#0D0D11) with constellation nodes (#8E929D) and wine trails (#4A121A)
 * Pauses automatically when app is backgrounded via AppState listeners.
 */
export const GalaxyCanvas: React.FC<{ style?: any; children?: React.ReactNode }> = ({
  style,
  children,
}) => {
  const [nodes, setNodes] = useState<StarNode[]>(() => {
    const starCount = 38;
    const items: StarNode[] = [];
    const centerX = SCREEN_WIDTH / 2;
    const centerY = SCREEN_HEIGHT / 2.6;

    for (let i = 0; i < starCount; i++) {
      const angle = (i / starCount) * Math.PI * 2 + Math.random() * 0.5;
      const orbitRadius = 40 + Math.pow(Math.random(), 1.4) * (SCREEN_WIDTH * 0.7);
      const baseX = centerX + Math.cos(angle) * orbitRadius;
      const baseY = centerY + Math.sin(angle) * (orbitRadius * 0.55); // Elliptical projection

      items.push({
        id: i,
        x: baseX,
        y: baseY,
        baseX: centerX,
        baseY: centerY,
        radius: Math.random() * 1.8 + 0.8,
        speed: (Math.random() * 0.003 + 0.001) * (i % 2 === 0 ? 1 : -1),
        angle,
        orbitRadius,
        opacity: Math.random() * 0.6 + 0.3,
      });
    }
    return items;
  });

  const animFrameRef = useRef<number | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const isRunningRef = useRef<boolean>(true);
  const lastTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // 60 FPS Loop with AppState Background Pause
    const loop = () => {
      if (!isRunningRef.current) return;

      const now = Date.now();
      const delta = now - lastTimeRef.current;

      // Cap update rate to ~60 FPS (min 16ms interval)
      if (delta >= 16) {
        lastTimeRef.current = now;
        setNodes((prevNodes) =>
          prevNodes.map((node) => {
            const nextAngle = node.angle + node.speed;
            const nextX = node.baseX + Math.cos(nextAngle) * node.orbitRadius;
            const nextY = node.baseY + Math.sin(nextAngle) * (node.orbitRadius * 0.55);
            return {
              ...node,
              angle: nextAngle,
              x: nextX,
              y: nextY,
            };
          })
        );
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    // Listen to AppState to pause when backgrounded
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground, resume
        isRunningRef.current = true;
        lastTimeRef.current = Date.now();
        animFrameRef.current = requestAnimationFrame(loop);
      } else if (nextAppState.match(/inactive|background/)) {
        // App has gone to the background, pause completely
        isRunningRef.current = false;
        if (animFrameRef.current !== null) {
          cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = null;
        }
      }
      appStateRef.current = nextAppState;
    });

    // Start loop
    isRunningRef.current = true;
    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      subscription.remove();
      isRunningRef.current = false;
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <View style={[styles.container, style]}>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          {/* Warm pastel celestial center glow */}
          <RadialGradient id="cosmicVoidGlow" cx="50%" cy="38%" rx="60%" ry="45%">
            <Stop offset="0%" stopColor="#D9A299" stopOpacity="0.20" />
            <Stop offset="50%" stopColor="#FFDBB0" stopOpacity="0.10" />
            <Stop offset="100%" stopColor="#FAF7F3" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Celestial Ambient Glow */}
        <Circle
          cx={SCREEN_WIDTH / 2}
          cy={SCREEN_HEIGHT / 2.6}
          r={SCREEN_WIDTH * 0.8}
          fill="url(#cosmicVoidGlow)"
        />

        {/* Soft cashmere constellation trail lines connecting nearby stars */}
        <G>
          {nodes.map((node, i) => {
            // Find a partner star to draw a faint constellation line
            const partner = nodes[(i + 3) % nodes.length];
            const dx = node.x - partner.x;
            const dy = node.y - partner.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 110) {
              const lineAlpha = (1 - dist / 110) * 0.35;
              return (
                <Line
                  key={`line-${i}`}
                  x1={node.x}
                  y1={node.y}
                  x2={partner.x}
                  y2={partner.y}
                  stroke="#DCC5B2"
                  strokeWidth={0.8}
                  strokeOpacity={lineAlpha}
                />
              );
            }
            return null;
          })}
        </G>

        {/* Constellation Nodes */}
        <G>
          {nodes.map((node) => (
            <Circle
              key={`star-${node.id}`}
              cx={node.x}
              cy={node.y}
              r={node.radius}
              fill="#D9A299"
              opacity={node.opacity}
            />
          ))}
        </G>
      </Svg>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.pitchBlack,
  },
});
