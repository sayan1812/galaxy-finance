import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  PanResponder,
  Animated,
  TouchableOpacity,
  Dimensions,
  AppState,
  AppStateStatus
} from 'react-native';
import Svg, {
  Circle,
  Ellipse,
  G,
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Text as SvgText
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { BankAccount } from '../types';
import { formatCurrency } from '../utils/formatters';
import { useTheme } from '../store/ThemeContext';
import { radius, spacing } from '../theme';

interface Galaxy3DCanvasProps {
  netAvailableMoney: number;
  cashBalance: number;
  banks: BankAccount[];
  onSelectBank?: (bank: BankAccount) => void;
  onSelectCash?: () => void;
  onSelectCore?: () => void;
  isPaused?: boolean;
}

const { width } = Dimensions.get('window');
const CANVAS_WIDTH = width - 32;
const CANVAS_HEIGHT = 280;
const CENTER_X = CANVAS_WIDTH / 2;
const CENTER_Y = CANVAS_HEIGHT / 2;

export const Galaxy3DCanvas: React.FC<Galaxy3DCanvasProps> = ({
  netAvailableMoney,
  cashBalance,
  banks,
  onSelectBank,
  onSelectCash,
  onSelectCore,
  isPaused = false
}) => {
  const { colors, reduceMotion } = useTheme();
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [isAppActive, setIsAppActive] = useState(AppState.currentState === 'active');

  // Rotation angle in degrees
  const angleRef = useRef(0);
  const [, setRenderTrigger] = useState(0);
  const animFrameRef = useRef<number | null>(null);

  // Monitor AppState (Active / Background / Inactive) to pause rendering and avoid memory/battery leaks
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      setIsAppActive(nextAppState === 'active');
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Smooth rotation animation only if motion is enabled, app is active, and not paused
  useEffect(() => {
    if (reduceMotion || !isAppActive || isPaused) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    let isMounted = true;
    const animate = () => {
      angleRef.current = (angleRef.current + 0.35) % 360;
      setRenderTrigger(prev => (prev + 1) % 1000);
      if (isMounted) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      isMounted = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [reduceMotion, isAppActive, isPaused]);

  // Touch pan responder to rotate galaxy manually with drag gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        angleRef.current = (angleRef.current + gestureState.vx * 3.5) % 360;
        setRenderTrigger(prev => (prev + 1) % 1000);
      }
    })
  ).current;

  const currentAngleRad = (angleRef.current * Math.PI) / 180;

  // Compute 3D projected positions of orbiting bank planets
  // Ellipse orbital projection: X = Rx * cos(theta), Y = Ry * sin(theta)
  const bankOrbits = banks.map((bank, index) => {
    const totalCount = banks.length + 1; // +1 for cash
    const offsetAngle = (2 * Math.PI * index) / totalCount + currentAngleRad;
    const rx = 105;
    const ry = 42;

    const x = CENTER_X + rx * Math.cos(offsetAngle);
    const y = CENTER_Y + ry * Math.sin(offsetAngle);
    // Depth scale based on y position (planets closer to bottom are in foreground)
    const zScale = 0.8 + 0.4 * ((y - (CENTER_Y - ry)) / (2 * ry));

    return {
      bank,
      x,
      y,
      zScale,
      color: bank.planetColor || colors.primary
    };
  });

  // Cash planet position
  const cashOffsetAngle = (2 * Math.PI * banks.length) / (banks.length + 1) + currentAngleRad;
  const cashX = CENTER_X + 115 * Math.cos(cashOffsetAngle);
  const cashY = CENTER_Y + 45 * Math.sin(cashOffsetAngle);
  const cashZScale = 0.8 + 0.4 * ((cashY - (CENTER_Y - 45)) / 90);

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Ionicons name="planet" size={13} color={colors.secondary} style={{ marginRight: 4 }} />
          <Text style={[styles.badgeText, { color: colors.secondary }]}>GALAXY SYSTEM 3D</Text>
        </View>
        <Text style={[styles.subText, { color: colors.textMuted }]}>
          Drag to rotate · Tap planets to inspect
        </Text>
      </View>

      <View style={styles.canvasWrapper} {...panResponder.panHandlers}>
        <Svg width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={styles.svg}>
          <Defs>
            {/* Core Net Money Sun Radial Glow */}
            <RadialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#8b5cf6" stopOpacity="1" />
              <Stop offset="50%" stopColor="#6366f1" stopOpacity="0.8" />
              <Stop offset="85%" stopColor="#3b82f6" stopOpacity="0.3" />
              <Stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </RadialGradient>

            {/* Orbit Glow Gradient */}
            <LinearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
              <Stop offset="50%" stopColor="#06b6d4" stopOpacity="0.2" />
              <Stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
            </LinearGradient>
          </Defs>

          {/* Background Celestial Stars */}
          <Circle cx={CENTER_X - 110} cy={CENTER_Y - 70} r={1.5} fill="#ffffff" opacity={0.6} />
          <Circle cx={CENTER_X + 120} cy={CENTER_Y - 80} r={1.2} fill="#38bdf8" opacity={0.8} />
          <Circle cx={CENTER_X - 90} cy={CENTER_Y + 85} r={1.8} fill="#a855f7" opacity={0.7} />
          <Circle cx={CENTER_X + 95} cy={CENTER_Y + 75} r={1.3} fill="#ffffff" opacity={0.5} />
          <Circle cx={CENTER_X - 40} cy={CENTER_Y - 100} r={1.6} fill="#f43f5e" opacity={0.6} />
          <Circle cx={CENTER_X + 60} cy={CENTER_Y - 95} r={1.4} fill="#10b981" opacity={0.7} />

          {/* Primary Orbital Rings with 3D Inclination */}
          <Ellipse
            cx={CENTER_X}
            cy={CENTER_Y}
            rx={105}
            ry={42}
            fill="none"
            stroke="url(#orbitGrad)"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          <Ellipse
            cx={CENTER_X}
            cy={CENTER_Y}
            rx={125}
            ry={52}
            fill="none"
            stroke="rgba(6, 182, 212, 0.18)"
            strokeWidth={1}
            strokeDasharray="2 4"
          />

          {/* Core Net Available Money Glowing Sun */}
          <Circle cx={CENTER_X} cy={CENTER_Y} r={46} fill="url(#coreGlow)" />
          <Circle cx={CENTER_X} cy={CENTER_Y} r={28} fill="#4c1d95" opacity={0.9} />
          <Circle cx={CENTER_X} cy={CENTER_Y} r={24} fill="#6d28d9" />

          {/* Central Sun Label */}
          <SvgText
            x={CENTER_X}
            y={CENTER_Y - 4}
            fontSize="9"
            fontWeight="bold"
            fill="#ffffff"
            textAnchor="middle"
          >
            NET LIQUID
          </SvgText>
          <SvgText
            x={CENTER_X}
            y={CENTER_Y + 9}
            fontSize="10"
            fontWeight="bold"
            fill="#38bdf8"
            textAnchor="middle"
          >
            {formatCurrency(netAvailableMoney)}
          </SvgText>

          {/* Orbiting Bank Planets */}
          {bankOrbits.map((item, idx) => {
            const planetRadius = 14 * item.zScale;
            return (
              <G key={item.bank.id || idx}>
                {/* Planet Body */}
                <Circle
                  cx={item.x}
                  cy={item.y}
                  r={planetRadius}
                  fill={item.color}
                  opacity={item.zScale}
                />
                <Circle
                  cx={item.x - 3}
                  cy={item.y - 3}
                  r={planetRadius * 0.35}
                  fill="#ffffff"
                  opacity={0.4 * item.zScale}
                />
                {/* Planet Name */}
                <SvgText
                  x={item.x}
                  y={item.y + planetRadius + 11}
                  fontSize="10"
                  fontWeight="bold"
                  fill={colors.textPrimary}
                  textAnchor="middle"
                >
                  {item.bank.nickname || item.bank.bankName}
                </SvgText>
              </G>
            );
          })}

          {/* Orbiting Cash Planet */}
          <G>
            <Circle
              cx={cashX}
              cy={cashY}
              r={12 * cashZScale}
              fill="#10b981"
              opacity={cashZScale}
            />
            <Circle
              cx={cashX - 2}
              cy={cashY - 2}
              r={4 * cashZScale}
              fill="#ffffff"
              opacity={0.5 * cashZScale}
            />
            <SvgText
              x={cashX}
              y={cashY + 12 * cashZScale + 10}
              fontSize="10"
              fontWeight="bold"
              fill="#059669"
              textAnchor="middle"
            >
              Cash Wallet
            </SvgText>
          </G>
        </Svg>

        {/* Clickable Overlay Hotspots for Touch Interaction */}
        <TouchableOpacity
          style={[styles.touchHotspot, { left: CENTER_X - 35, top: CENTER_Y - 35, width: 70, height: 70 }]}
          onPress={() => {
            setSelectedEntity('Net Available Money');
            onSelectCore?.();
          }}
          activeOpacity={0.7}
        />

        {bankOrbits.map((item, idx) => (
          <TouchableOpacity
            key={`hotspot_${item.bank.id || idx}`}
            style={[
              styles.touchHotspot,
              {
                left: item.x - 22,
                top: item.y - 22,
                width: 44,
                height: 44
              }
            ]}
            onPress={() => {
              setSelectedEntity(`${item.bank.nickname || item.bank.bankName}: ${formatCurrency(item.bank.balance)}`);
              onSelectBank?.(item.bank);
            }}
            activeOpacity={0.7}
          />
        ))}

        <TouchableOpacity
          style={[
            styles.touchHotspot,
            {
              left: cashX - 22,
              top: cashY - 22,
              width: 44,
              height: 44
            }
          ]}
          onPress={() => {
            setSelectedEntity(`Cash Wallet: ${formatCurrency(cashBalance)}`);
            onSelectCash?.();
          }}
          activeOpacity={0.7}
        />
      </View>

      {/* Selected Entity Banner */}
      {selectedEntity && (
        <View style={[styles.infoBanner, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
          <Ionicons name="sparkles" size={14} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={[styles.infoText, { color: colors.textPrimary }]}>{selectedEntity}</Text>
          <TouchableOpacity onPress={() => setSelectedEntity(null)} style={{ marginLeft: 6 }}>
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
    backgroundColor: 'rgba(3, 7, 18, 0.75)',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: 4
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  subText: {
    fontSize: 11
  },
  canvasWrapper: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    position: 'relative'
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0
  },
  touchHotspot: {
    position: 'absolute',
    borderRadius: 999
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    marginTop: 2
  },
  infoText: {
    fontSize: 12,
    fontWeight: '600'
  }
});
